import { generateText, matchJobToCandidate, analyzeResume, generateInterviewQuestions, analyzeSkillsGap } from '../api/gemini';
import { collection, doc, getDoc, getDocs, query, where, orderBy, limit, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

export interface AIJobMatch {
  jobId: string;
  candidateId: string;
  score: number;
  explanation: string;
  matchedSkills: string[];
  missingSkills: string[];
  recommendations: string[];
  confidence: number;
  createdAt: Date;
}

export interface AIInsights {
  marketTrends: string[];
  salaryInsights: {
    average: number;
    range: [number, number];
    trend: 'increasing' | 'decreasing' | 'stable';
  };
  skillDemand: Array<{
    skill: string;
    demand: number;
    growth: number;
  }>;
  competitorAnalysis: Array<{
    company: string;
    advantages: string[];
    disadvantages: string[];
  }>;
  recommendations: string[];
}

export interface CandidateAnalysis {
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  skillsAssessment: {
    technical: number;
    soft: number;
    experience: number;
    education: number;
  };
  careerProgression: {
    currentLevel: 'junior' | 'mid' | 'senior' | 'lead';
    nextLevel: string;
    timeToPromotion: string;
    requiredSkills: string[];
  };
  salaryRecommendation: {
    min: number;
    max: number;
    currency: string;
    factors: string[];
  };
}

class AIService {
  private static instance: AIService;
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  
  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  // Cache management
  private getCacheKey(type: string, params: any): string {
    return `${type}_${JSON.stringify(params)}`;
  }

  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() > cached.timestamp + cached.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data as T;
  }

  private setCache(key: string, data: any, ttl: number = 300000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  // Enhanced job matching with AI
  async matchCandidateToJob(
    candidateId: string, 
    jobId: string,
    options: { useCache?: boolean; detailed?: boolean } = {}
  ): Promise<AIJobMatch> {
    const cacheKey = this.getCacheKey('job_match', { candidateId, jobId });
    
    if (options.useCache !== false) {
      const cached = this.getFromCache<AIJobMatch>(cacheKey);
      if (cached) return cached;
    }

    try {
      // Get candidate data
      const candidateDoc = await getDoc(doc(db, 'users', candidateId));
      if (!candidateDoc.exists()) {
        throw new Error('Candidate not found');
      }
      
      const candidateData = candidateDoc.data();
      
      // Get job data
      const jobDoc = await getDoc(doc(db, 'posts', jobId));
      if (!jobDoc.exists()) {
        throw new Error('Job not found');
      }
      
      const jobData = jobDoc.data();
      
      // Create job description
      const jobDescription = `
        Позиция: ${jobData.title}
        Компания: ${jobData.companyName}
        Локация: ${jobData.location}
        Тип занятости: ${jobData.employmentType}
        Уровень: ${jobData.experienceLevel}
        Описание: ${jobData.description}
        Требования: ${jobData.requirements?.join(', ') || 'Не указаны'}
        Навыки: ${jobData.skills?.join(', ') || 'Не указаны'}
        Зарплата: ${jobData.salary || 'Не указана'}
      `;
      
      // Create candidate profile
      const candidateProfile = {
        name: candidateData.displayName || candidateData.firstName + ' ' + candidateData.lastName,
        location: candidateData.location,
        skills: candidateData.skills || [],
        experience: candidateData.experience || [],
        education: candidateData.education || [],
        languages: candidateData.languages || [],
        projects: candidateData.projects || [],
        certifications: candidateData.certifications || [],
        bio: candidateData.bio || '',
        careerGoals: candidateData.careerGoals || {}
      };
      
      // Get AI matching result
      const matchResult = await matchJobToCandidate(jobDescription, candidateProfile, {
        includeExplanation: true
      });
      
      // Calculate confidence based on data completeness
      const candidateDataCompleteness = this.calculateProfileCompleteness(candidateProfile);
      const jobDataCompleteness = this.calculateJobCompleteness(jobData);
      const confidence = Math.min(95, (candidateDataCompleteness + jobDataCompleteness) / 2);
      
      const aiMatch: AIJobMatch = {
        jobId,
        candidateId,
        score: matchResult.score,
        explanation: matchResult.explanation || '',
        matchedSkills: matchResult.matchedSkills || [],
        missingSkills: matchResult.missingSkills || [],
        recommendations: matchResult.recommendations || [],
        confidence,
        createdAt: new Date()
      };
      
      // Cache the result
      this.setCache(cacheKey, aiMatch, 600000); // 10 minutes
      
      // Store in database for analytics
      if (options.detailed) {
        await this.storeMatchResult(aiMatch);
      }
      
      return aiMatch;
      
    } catch (error) {
      console.error('Error in AI job matching:', error);
      throw new Error('Failed to match candidate to job');
    }
  }

  // Batch job matching for multiple candidates
  async batchMatchCandidates(
    candidateIds: string[],
    jobId: string,
    options: { limit?: number; minScore?: number } = {}
  ): Promise<AIJobMatch[]> {
    const { limit = 10, minScore = 60 } = options;
    
    try {
      const matchPromises = candidateIds.slice(0, limit).map(candidateId =>
        this.matchCandidateToJob(candidateId, jobId, { useCache: true })
          .catch(error => {
            console.error(`Error matching candidate ${candidateId}:`, error);
            return null;
          })
      );
      
      const matches = (await Promise.all(matchPromises))
        .filter(Boolean) as AIJobMatch[];
      
      return matches
        .filter(match => match.score >= minScore)
        .sort((a, b) => b.score - a.score);
        
    } catch (error) {
      console.error('Error in batch candidate matching:', error);
      return [];
    }
  }

  // Enhanced candidate analysis
  async analyzeCandidateProfile(
    candidateId: string,
    targetRole?: string,
    industry?: string
  ): Promise<CandidateAnalysis> {
    const cacheKey = this.getCacheKey('candidate_analysis', { candidateId, targetRole, industry });
    
    const cached = this.getFromCache<CandidateAnalysis>(cacheKey);
    if (cached) return cached;

    try {
      const candidateDoc = await getDoc(doc(db, 'users', candidateId));
      if (!candidateDoc.exists()) {
        throw new Error('Candidate not found');
      }
      
      const candidateData = candidateDoc.data();
      
      // Create analysis prompt
      const analysisPrompt = `
        Проанализируй профиль кандидата и дай детальную оценку:
        
        Имя: ${candidateData.displayName || 'Не указано'}
        Локация: ${candidateData.location || 'Не указана'}
        Навыки: ${candidateData.skills?.map((s: any) => typeof s === 'string' ? s : s.name).join(', ') || 'Не указаны'}
        Опыт: ${candidateData.experience?.map((e: any) => `${e.title} в ${e.company}`).join(', ') || 'Не указан'}
        Образование: ${candidateData.education?.map((e: any) => `${e.degree} в ${e.institution}`).join(', ') || 'Не указано'}
        Проекты: ${candidateData.projects?.map((p: any) => p.name).join(', ') || 'Не указаны'}
        Сертификаты: ${candidateData.certifications?.map((c: any) => c.name).join(', ') || 'Не указаны'}
        Языки: ${candidateData.languages?.map((l: any) => `${l.name} (${l.proficiency})`).join(', ') || 'Не указаны'}
        
        ${targetRole ? `Целевая роль: ${targetRole}` : ''}
        ${industry ? `Индустрия: ${industry}` : ''}
        
        Оцени по шкале 0-100:
        1. Общая оценка профиля
        2. Технические навыки
        3. Мягкие навыки
        4. Опыт работы
        5. Образование
        
        Определи:
        - Текущий уровень (junior/mid/senior/lead)
        - Следующий уровень карьеры
        - Время до повышения
        - Необходимые навыки для роста
        - Рекомендуемую зарплату (мин/макс в тенге)
        
        Дай конкретные рекомендации по улучшению профиля.
        
        Ответь в JSON формате:
        {
          "overallScore": number,
          "strengths": ["сильная сторона1", "сильная сторона2"],
          "weaknesses": ["слабая сторона1", "слабая сторона2"],
          "skillsAssessment": {
            "technical": number,
            "soft": number,
            "experience": number,
            "education": number
          },
          "careerProgression": {
            "currentLevel": "junior|mid|senior|lead",
            "nextLevel": "string",
            "timeToPromotion": "string",
            "requiredSkills": ["навык1", "навык2"]
          },
          "salaryRecommendation": {
            "min": number,
            "max": number,
            "currency": "KZT",
            "factors": ["фактор1", "фактор2"]
          }
        }
      `;
      
      const analysisResult = await generateText(analysisPrompt, 'skill_analyzer', {
        temperature: 0.2,
        maxTokens: 2000,
        useCache: true
      });
      
      const analysis = JSON.parse(analysisResult) as CandidateAnalysis;
      
      // Cache the result
      this.setCache(cacheKey, analysis, 3600000); // 1 hour
      
      return analysis;
      
    } catch (error) {
      console.error('Error analyzing candidate profile:', error);
      throw new Error('Failed to analyze candidate profile');
    }
  }

  // Market insights and trends
  async getMarketInsights(
    industry: string,
    location: string = 'Казахстан',
    role?: string
  ): Promise<AIInsights> {
    const cacheKey = this.getCacheKey('market_insights', { industry, location, role });
    
    const cached = this.getFromCache<AIInsights>(cacheKey);
    if (cached) return cached;

    try {
      // Get market data from jobs in database
      const jobsRef = collection(db, 'posts');
      const jobsQuery = query(
        jobsRef,
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc'),
        limit(100)
      );
      
      const jobsSnapshot = await getDocs(jobsQuery);
      const jobs = jobsSnapshot.docs.map(doc => doc.data());
      
      // Filter by industry/role if specified
      const relevantJobs = jobs.filter(job => {
        const matchesIndustry = !industry || 
          job.title?.toLowerCase().includes(industry.toLowerCase()) ||
          job.description?.toLowerCase().includes(industry.toLowerCase());
        
        const matchesRole = !role ||
          job.title?.toLowerCase().includes(role.toLowerCase());
          
        return matchesIndustry && matchesRole;
      });
      
      const insightsPrompt = `
        Проанализируй рынок труда и дай инсайты:
        
        Индустрия: ${industry}
        Локация: ${location}
        ${role ? `Роль: ${role}` : ''}
        
        Данные о вакансиях:
        ${relevantJobs.slice(0, 20).map(job => `
          - ${job.title} в ${job.companyName} (${job.location})
          - Зарплата: ${job.salary || 'Не указана'}
          - Навыки: ${job.skills?.join(', ') || 'Не указаны'}
          - Тип: ${job.employmentType || 'Не указан'}
        `).join('\n')}
        
        Проанализируй:
        1. Тренды рынка труда
        2. Средняя зарплата и диапазон
        3. Востребованные навыки
        4. Рост/падение спроса
        5. Конкурентная среда
        
        Дай рекомендации работодателям.
        
        Ответь в JSON формате:
        {
          "marketTrends": ["тренд1", "тренд2"],
          "salaryInsights": {
            "average": number,
            "range": [number, number],
            "trend": "increasing|decreasing|stable"
          },
          "skillDemand": [
            {
              "skill": "навык",
              "demand": number,
              "growth": number
            }
          ],
          "competitorAnalysis": [
            {
              "company": "компания",
              "advantages": ["преимущество1"],
              "disadvantages": ["недостаток1"]
            }
          ],
          "recommendations": ["рекомендация1", "рекомендация2"]
        }
      `;
      
      const insightsResult = await generateText(insightsPrompt, 'hr_expert', {
        temperature: 0.3,
        maxTokens: 2500,
        useCache: true
      });
      
      const insights = JSON.parse(insightsResult) as AIInsights;
      
      // Cache for 2 hours
      this.setCache(cacheKey, insights, 7200000);
      
      return insights;
      
    } catch (error) {
      console.error('Error getting market insights:', error);
      throw new Error('Failed to get market insights');
    }
  }

  // Job optimization recommendations
  async optimizeJobPosting(
    jobId: string,
    performanceData?: {
      views: number;
      applications: number;
      timeOnMarket: number;
    }
  ): Promise<{
    score: number;
    recommendations: Array<{
      category: string;
      suggestion: string;
      priority: 'high' | 'medium' | 'low';
      expectedImprovement: string;
    }>;
    optimizedTitle: string;
    optimizedDescription: string;
    suggestedSkills: string[];
    competitiveSalary: { min: number; max: number };
  }> {
    try {
      const jobDoc = await getDoc(doc(db, 'posts', jobId));
      if (!jobDoc.exists()) {
        throw new Error('Job not found');
      }
      
      const jobData = jobDoc.data();
      
      const optimizationPrompt = `
        Оптимизируй вакансию для лучшей привлекательности:
        
        Текущая вакансия:
        Название: ${jobData.title}
        Описание: ${jobData.description}
        Компания: ${jobData.companyName}
        Локация: ${jobData.location}
        Зарплата: ${jobData.salary || 'Не указана'}
        Навыки: ${jobData.skills?.join(', ') || 'Не указаны'}
        Требования: ${jobData.requirements?.join(', ') || 'Не указаны'}
        Бенефиты: ${jobData.benefits?.join(', ') || 'Не указаны'}
        
        ${performanceData ? `
        Статистика:
        - Просмотры: ${performanceData.views}
        - Заявки: ${performanceData.applications}
        - На рынке: ${performanceData.timeOnMarket} дней
        ` : ''}
        
        Дай рекомендации по улучшению:
        1. Оцени текущую привлекательность (0-100)
        2. Предложи улучшения по категориям
        3. Оптимизируй название и описание
        4. Предложи дополнительные навыки
        5. Рекомендуй конкурентную зарплату
        
        Ответь в JSON формате с детальными рекомендациями.
      `;
      
      const result = await generateText(optimizationPrompt, 'hr_expert', {
        temperature: 0.3,
        maxTokens: 3000,
        useCache: true
      });
      
      return JSON.parse(result);
      
    } catch (error) {
      console.error('Error optimizing job posting:', error);
      throw new Error('Failed to optimize job posting');
    }
  }

  // Helper methods
  private calculateProfileCompleteness(profile: any): number {
    const fields = ['name', 'location', 'skills', 'experience', 'education'];
    const completedFields = fields.filter(field => {
      const value = profile[field];
      return value && (Array.isArray(value) ? value.length > 0 : value.toString().trim().length > 0);
    });
    
    return (completedFields.length / fields.length) * 100;
  }

  private calculateJobCompleteness(job: any): number {
    const fields = ['title', 'description', 'companyName', 'location', 'skills', 'requirements'];
    const completedFields = fields.filter(field => {
      const value = job[field];
      return value && (Array.isArray(value) ? value.length > 0 : value.toString().trim().length > 0);
    });
    
    return (completedFields.length / fields.length) * 100;
  }

  private async storeMatchResult(match: AIJobMatch): Promise<void> {
    try {
      const matchRef = doc(db, 'aiMatches', `${match.candidateId}_${match.jobId}`);
      await updateDoc(matchRef, {
        ...match,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error storing match result:', error);
    }
  }

  // Clear cache
  clearCache(): void {
    this.cache.clear();
  }

  // Get cache statistics
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Export singleton instance
export const aiService = AIService.getInstance();

// Export types and interfaces
export type { AIJobMatch, AIInsights, CandidateAnalysis };

// Export convenience functions
export const matchCandidateToJob = (candidateId: string, jobId: string, options?: any) =>
  aiService.matchCandidateToJob(candidateId, jobId, options);

export const batchMatchCandidates = (candidateIds: string[], jobId: string, options?: any) =>
  aiService.batchMatchCandidates(candidateIds, jobId, options);

export const analyzeCandidateProfile = (candidateId: string, targetRole?: string, industry?: string) =>
  aiService.analyzeCandidateProfile(candidateId, targetRole, industry);

export const getMarketInsights = (industry: string, location?: string, role?: string) =>
  aiService.getMarketInsights(industry, location, role);

export const optimizeJobPosting = (jobId: string, performanceData?: any) =>
  aiService.optimizeJobPosting(jobId, performanceData); 