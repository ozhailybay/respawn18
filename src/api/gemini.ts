import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from '@google/generative-ai';
import axios from 'axios';
import { RateLimiter } from '../utils/security';

// Initialize the Google Generative AI client
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const MODEL_NAME = "gemini-2.5-flash";

// Advanced configuration
const CONFIG = {
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
  RATE_LIMIT_WINDOW: 60000, // 1 minute
  MAX_REQUESTS_PER_WINDOW: 50,
  CACHE_DURATION: 300000, // 5 minutes
  MAX_TOKENS: 8192,
  TEMPERATURE: 0.7,
  TOP_P: 0.95,
  TOP_K: 40,
};

// Initialize rate limiter
const rateLimiter = new RateLimiter(CONFIG.MAX_REQUESTS_PER_WINDOW, CONFIG.RATE_LIMIT_WINDOW);

// Проверяем API ключ
console.log('Gemini API Key настроен:', API_KEY ? 'Да' : 'Нет');
if (!API_KEY) {
  console.error('ВНИМАНИЕ: API ключ Gemini не настроен в .env файле!');
} else {
  console.log('API ключ Gemini имеет длину:', API_KEY.length);
}

// Initialize the client only if API key is available
let genAI: GoogleGenerativeAI | null = null;
if (API_KEY) {
  genAI = new GoogleGenerativeAI(API_KEY);
  console.log('Gemini API клиент инициализирован');
} else {
  console.error('Gemini API клиент НЕ инициализирован из-за отсутствия ключа API');
}

// Enhanced rate limiting and caching
interface RateLimitInfo {
  requests: number[];
  lastReset: number;
  backoffUntil: number;
  fallbackMode: boolean;
}

interface CacheEntry {
  data: any;
  timestamp: number;
  expiresAt: number;
}

const rateLimitInfo: RateLimitInfo = {
  requests: [],
  lastReset: Date.now(),
  backoffUntil: 0,
  fallbackMode: false
};

const cache = new Map<string, CacheEntry>();

// Enhanced error handling
class GeminiError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = 'GeminiError';
  }
}

// Rate limiting functions
const isRateLimited = (userId: string = 'default'): boolean => {
  return !rateLimiter.canMakeRequest(userId);
};

const recordRequest = (userId: string = 'default'): void => {
  // Rate limiter handles recording internally
};

// Caching functions
const getCacheKey = (prompt: string, role: string, options?: any): string => {
  // Use a safe encoding method that handles Unicode characters
  const data = JSON.stringify({ prompt, role, options });
  return btoa(unescape(encodeURIComponent(data)));
};

const getCachedResponse = (key: string): any | null => {
  const entry = cache.get(key);
  if (!entry) return null;
  
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  
  return entry.data;
};

const setCachedResponse = (key: string, data: any): void => {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    expiresAt: Date.now() + CONFIG.CACHE_DURATION
  });
};

// Enhanced retry mechanism
const sleep = (ms: number): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms));

const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = CONFIG.MAX_RETRIES
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      
      // Don't retry on certain errors
      if (error.code === 'INVALID_ARGUMENT' || error.code === 'PERMISSION_DENIED') {
        throw error;
      }
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Exponential backoff
      const delay = CONFIG.RETRY_DELAY * Math.pow(2, attempt);
      console.log(`Retry attempt ${attempt + 1} after ${delay}ms`);
      await sleep(delay);
    }
  }
  
  throw lastError!;
};

// Safety settings configuration
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

// Enhanced error handling function
const handleGeminiError = (error: any): GeminiError => {
  console.error('Gemini API error:', error);
  
  if (error?.code === 'RESOURCE_EXHAUSTED' || error?.message?.includes('quota')) {
    return new GeminiError(
      'Превышен лимит запросов к AI. Пожалуйста, попробуйте позже.',
      'RATE_LIMIT_EXCEEDED',
      429,
      true
    );
  }
  
  if (error?.code === 'PERMISSION_DENIED') {
    return new GeminiError(
      'Доступ к AI сервису запрещен. Проверьте API ключ.',
      'PERMISSION_DENIED',
      403,
      false
    );
  }
  
  if (error?.message?.includes('safety') || error?.message?.includes('blocked')) {
    return new GeminiError(
      'Запрос был заблокирован системой безопасности AI.',
      'SAFETY_BLOCKED',
      400,
      false
    );
  }
  
  if (error?.code === 'UNAVAILABLE') {
    return new GeminiError(
      'AI сервис временно недоступен. Попробуйте позже.',
      'SERVICE_UNAVAILABLE',
      503,
      true
    );
  }
  
  return new GeminiError(
    'Произошла ошибка при обработке запроса.',
    'UNKNOWN_ERROR',
    500,
    true
  );
};

// Enhanced system prompts
const getSystemPrompt = (role: string): string => {
  const prompts: Record<string, string> = {
    'career_advisor': `Ты опытный карьерный консультант с 15+ лет опыта. Ты помогаешь людям развивать карьеру, находить работу и профессионально расти. Отвечай на казахском и русском языках, используй эмодзи для лучшего восприятия. Давай практические советы.`,
    
    'resume_reviewer': `Ты эксперт по резюме с опытом работы в HR и рекрутинге. Анализируй резюме детально, указывай сильные стороны и области для улучшения. Давай конкретные рекомендации по улучшению.`,
    
    'interview_coach': `Ты тренер по собеседованиям с опытом подготовки кандидатов к интервью в крупных компаниях. Помогай готовиться к собеседованиям, отвечать на сложные вопросы и презентовать себя.`,
    
    'ai_mentor': `Ты AI-ментор JumysAI - умный помощник для студентов и молодых специалистов Казахстана. Ты знаешь местный рынок труда, особенности образования и карьеры в Казахстане. Отвечай дружелюбно, мотивируй и давай практические советы.`,
    
    'hr_expert': `Ты HR-эксперт с глубоким пониманием современных тенденций в управлении персоналом. Помогай с вопросами найма, развития сотрудников и HR-процессов.`,
    
    'skill_analyzer': `Ты эксперт по анализу навыков и компетенций. Помогай определить сильные стороны, пробелы в навыках и пути развития.`,
    
    'job_matcher': `Ты эксперт по подбору вакансий. Анализируй профили кандидатов и подбирай наиболее подходящие позиции, объясняя степень соответствия.`,
    
    'default': `Ты полезный AI-помощник, специализирующийся на карьерных вопросах и профессиональном развитии.`
  };
  
  return prompts[role] || prompts['default'];
};

// Main text generation function with full functionality
export async function generateText(
  prompt: string, 
  role: string = 'career_advisor',
  options: {
    temperature?: number;
    maxTokens?: number;
    useCache?: boolean;
    priority?: 'high' | 'normal' | 'low';
    context?: string;
    userId?: string;
  } = {}
): Promise<string> {
  const { userId = 'default' } = options;
  
  // Validate inputs
  if (!prompt?.trim()) {
    throw new GeminiError('Prompt cannot be empty', 'INVALID_INPUT', 400, false);
  }
  
    if (!API_KEY) {
    throw new GeminiError('Gemini API key is not configured', 'NO_API_KEY', 500, false);
  }
  
  // Check cache first
  const cacheKey = getCacheKey(prompt, role, options);
  if (options.useCache !== false) {
    const cached = getCachedResponse(cacheKey);
    if (cached) {
      console.log('Returning cached response');
      return cached;
    }
  }
  
  // Check rate limiting
  if (isRateLimited(userId)) {
    throw new GeminiError(
      'Превышен лимит запросов. Пожалуйста, попробуйте позже.',
      'RATE_LIMIT_EXCEEDED',
      429,
      true
    );
  }
  
  const systemPrompt = getSystemPrompt(role);
  const contextPrompt = options.context ? `\n\nКонтекст: ${options.context}` : '';
  const fullPrompt = `${systemPrompt}${contextPrompt}\n\nЗапрос пользователя: ${prompt}`;
  
  return retryWithBackoff(async () => {
    recordRequest(userId);
    
    if (!genAI) {
      throw new GeminiError('Gemini client not initialized', 'CLIENT_ERROR', 500, false);
    }
    
    try {
      const model = genAI.getGenerativeModel({ 
        model: MODEL_NAME,
        safetySettings,
        generationConfig: {
          temperature: options.temperature || CONFIG.TEMPERATURE,
          topK: CONFIG.TOP_K,
          topP: CONFIG.TOP_P,
          maxOutputTokens: options.maxTokens || CONFIG.MAX_TOKENS,
        }
      });
      
      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      const text = response.text();
      
      if (!text?.trim()) {
        throw new GeminiError('Empty response from AI', 'EMPTY_RESPONSE', 500, true);
      }
      
      // Cache the response
      if (options.useCache !== false) {
        setCachedResponse(cacheKey, text);
      }
      
      console.log('Gemini API response successful:', { length: text.length, role });
      return text;
      
    } catch (error: any) {
      // Try REST API fallback
      if (error?.message?.includes('SDK')) {
        console.log('Trying REST API fallback...');
        return await generateTextViaREST(fullPrompt, options);
      }
      
      throw handleGeminiError(error);
    }
  });
}

// REST API fallback
async function generateTextViaREST(
  prompt: string, 
  options: { temperature?: number; maxTokens?: number } = {}
): Promise<string> {
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;
  
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
      contents: [{
        parts: [{ text: prompt }]
      }],
            generationConfig: {
        temperature: options.temperature || CONFIG.TEMPERATURE,
        topK: CONFIG.TOP_K,
        topP: CONFIG.TOP_P,
        maxOutputTokens: options.maxTokens || CONFIG.MAX_TOKENS,
      },
      safetySettings: safetySettings.map(setting => ({
        category: setting.category.replace('HARM_CATEGORY_', 'HARM_CATEGORY_'),
        threshold: setting.threshold.replace('BLOCK_', 'BLOCK_')
      }))
          })
        });
        
        if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new GeminiError(
      `API error: ${response.status} ${response.statusText}`,
      'API_ERROR',
      response.status,
      response.status >= 500
    );
        }
        
        const data = await response.json();
  
  if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
    throw new GeminiError('Invalid response format', 'INVALID_RESPONSE', 500, true);
  }
  
  return data.candidates[0].content.parts[0].text;
}

// Enhanced resume generation
export interface ResumeGenerationOptions {
  style: 'modern' | 'classic' | 'professional' | 'creative';
  language: 'ru' | 'kz' | 'en';
  includePhoto: boolean;
  sections: string[];
  template: string;
}

export async function generateResume(
  profileData: any,
  options: Partial<ResumeGenerationOptions> = {}
): Promise<{ html: string; error?: string }> {
  
  const defaultOptions: ResumeGenerationOptions = {
    style: 'modern',
    language: 'ru',
    includePhoto: true,
    sections: ['personal', 'education', 'experience', 'skills', 'projects'],
    template: 'standard'
  };
  
  const config = { ...defaultOptions, ...options };
  
  try {
    const prompt = `
Создай профессиональное резюме в HTML формате на основе следующих данных:

Стиль: ${config.style}
Язык: ${config.language}
Включить фото: ${config.includePhoto}

Данные профиля:
${JSON.stringify(profileData, null, 2)}

Требования:
1. Создай полный HTML код с встроенными CSS стилями
2. Используй современный дизайн в стиле ${config.style}
3. Адаптируй под печать (A4 формат)
4. Включи все релевантные секции: ${config.sections.join(', ')}
5. Используй профессиональную типографику
6. Добавь иконки для контактов и секций
7. Сделай резюме визуально привлекательным
8. Оптимизируй для ATS систем

Верни только HTML код без дополнительных комментариев.
`;

    const html = await generateText(prompt, 'resume_reviewer', {
      temperature: 0.3,
      maxTokens: 4000,
      useCache: true
    });
        
        return { html };
    
  } catch (error: any) {
    console.error('Resume generation error:', error);
    return {
      html: '',
      error: error.message || 'Failed to generate resume'
    };
  }
}

// Enhanced resume analysis
export interface ResumeAnalysisOptions {
  jobDescription?: string;
  industry?: string;
  level?: 'entry' | 'mid' | 'senior';
  language?: 'ru' | 'kz' | 'en';
}

export interface ResumeAnalysisResult {
  score: number;
  strengths: string[];
  improvements: string[];
  detailedFeedback: string;
  enhancedContent: string;
  lastAnalyzed?: string;
  skillScores?: {[key: string]: number};
  keywordDensity?: {[key: string]: number};
  readabilityScore?: number;
  industryFit?: number;
  technicalScore?: number;
  softSkillsScore?: number;
  experienceScore?: number;
  educationScore?: number;
  overallImpact?: number;
}

export async function analyzeResume(
  resumeContent: string,
  options: ResumeAnalysisOptions = {}
): Promise<any> {
  
  const prompt = `
Проанализируй следующее резюме и дай детальную оценку:

${resumeContent}

${options.jobDescription ? `\nЦелевая вакансия: ${options.jobDescription}` : ''}
${options.industry ? `\nИндустрия: ${options.industry}` : ''}
${options.level ? `\nУровень позиции: ${options.level}` : ''}

Проанализируй по следующим критериям:
1. Общая оценка (0-100)
2. Структура и форматирование
3. Содержание и релевантность
4. Ключевые навыки
5. Опыт работы
6. Образование
7. Достижения
8. Соответствие ATS
9. Языковая грамотность
10. Профессиональная презентация

Для каждого критерия дай:
- Оценку (0-10)
- Сильные стороны
- Области для улучшения
- Конкретные рекомендации

Также предложи:
- Топ-5 улучшений
- Недостающие ключевые слова
- Рекомендации по структуре
- Примеры улучшенных формулировок

Ответ дай в формате JSON с четкой структурой.
`;

  try {
    const analysis = await generateText(prompt, 'resume_reviewer', {
      temperature: 0.2,
      maxTokens: 3000,
      useCache: true
    });
    
    return JSON.parse(analysis);
    
  } catch (error: any) {
    console.error('Resume analysis error:', error);
    throw new GeminiError(
      'Failed to analyze resume',
      'ANALYSIS_ERROR',
      500,
      true
    );
  }
}

// Legacy function name for backward compatibility
export async function generateResumeAnalysis(
  resumeContent: string,
  userData?: any
): Promise<ResumeAnalysisResult> {
  try {
    const options: ResumeAnalysisOptions = {};
    
    if (userData) {
      options.industry = userData.industry || userData.field;
      options.level = userData.experienceLevel || 'mid';
    }
    
    const result = await analyzeResume(resumeContent, options);
    
    // Transform to legacy format
    return {
      score: result.overallScore || result.score || 75,
      strengths: result.strengths || [],
      improvements: result.improvements || result.recommendations || [],
      detailedFeedback: result.detailedFeedback || result.explanation || '',
      enhancedContent: result.enhancedContent || '',
      lastAnalyzed: new Date().toISOString(),
      skillScores: result.skillScores || {},
      keywordDensity: result.keywordDensity || {},
      readabilityScore: result.readabilityScore || 80,
      industryFit: result.industryFit || 75,
      technicalScore: result.technicalScore || 70,
      softSkillsScore: result.softSkillsScore || 75,
      experienceScore: result.experienceScore || 70,
      educationScore: result.educationScore || 75,
      overallImpact: result.overallImpact || 75
    };
    
  } catch (error: any) {
    console.error('Resume analysis error:', error);
    throw new GeminiError(
      'Failed to analyze resume',
      'ANALYSIS_ERROR',
      500,
      true
    );
  }
}

// Job matching functionality
export async function matchJobToCandidate(
  jobDescription: string,
  candidateProfile: any,
  options: { includeExplanation?: boolean } = {}
): Promise<{
  score: number;
  explanation?: string;
  matchedSkills: string[];
  missingSkills: string[];
  recommendations: string[];
}> {
  
    const prompt = `
Оцени соответствие кандидата вакансии:

ВАКАНСИЯ:
${jobDescription}

ПРОФИЛЬ КАНДИДАТА:
${JSON.stringify(candidateProfile, null, 2)}

Проанализируй:
1. Соответствие навыков (0-100)
2. Соответствие опыта (0-100)
3. Соответствие образования (0-100)
4. Культурное соответствие (0-100)
5. Потенциал роста (0-100)

Дай общую оценку соответствия (0-100) и детальное объяснение.

Верни результат в JSON формате:
      {
        "score": number,
  "explanation": "string",
  "matchedSkills": ["skill1", "skill2"],
  "missingSkills": ["skill1", "skill2"],
  "recommendations": ["rec1", "rec2"]
}
`;

  try {
    const result = await generateText(prompt, 'job_matcher', {
      temperature: 0.3,
      maxTokens: 2000,
      useCache: true
    });
    
    return JSON.parse(result);
    
  } catch (error: any) {
    console.error('Job matching error:', error);
    throw new GeminiError(
      'Failed to match job to candidate',
      'MATCHING_ERROR',
      500,
      true
    );
  }
}

// Interview preparation
export async function generateInterviewQuestions(
  jobDescription: string,
  candidateProfile: any,
  difficulty: 'easy' | 'medium' | 'hard' = 'medium'
): Promise<{
  questions: Array<{
    question: string;
    type: 'behavioral' | 'technical' | 'situational';
    difficulty: string;
    tips: string[];
  }>;
}> {
  
  const prompt = `
Создай список вопросов для собеседования на основе:

ВАКАНСИЯ:
${jobDescription}

ПРОФИЛЬ КАНДИДАТА:
${JSON.stringify(candidateProfile, null, 2)}

СЛОЖНОСТЬ: ${difficulty}

Создай 10-15 вопросов разных типов:
- Поведенческие вопросы (behavioral)
- Технические вопросы (technical)
- Ситуационные вопросы (situational)

Для каждого вопроса дай:
- Сам вопрос
- Тип вопроса
- Уровень сложности
- Советы по ответу

Верни в JSON формате.
`;

  try {
    const result = await generateText(prompt, 'interview_coach', {
      temperature: 0.4,
      maxTokens: 3000,
      useCache: true
    });
    
    return JSON.parse(result);
    
  } catch (error: any) {
    console.error('Interview questions generation error:', error);
    throw new GeminiError(
      'Failed to generate interview questions',
      'INTERVIEW_ERROR',
      500,
      true
    );
  }
}

// Skills gap analysis
export async function analyzeSkillsGap(
  currentSkills: string[],
  targetRole: string,
  industry: string
): Promise<{
  gapAnalysis: {
    missingSkills: string[];
    skillsToImprove: string[];
    strongSkills: string[];
  };
  learningPath: Array<{
    skill: string;
    priority: 'high' | 'medium' | 'low';
    resources: string[];
    timeEstimate: string;
  }>;
  recommendations: string[];
}> {
  
  const prompt = `
Проанализируй пробелы в навыках для перехода на новую роль:

ТЕКУЩИЕ НАВЫКИ:
${currentSkills.join(', ')}

ЦЕЛЕВАЯ РОЛЬ: ${targetRole}
ИНДУСТРИЯ: ${industry}

Проанализируй:
1. Какие навыки отсутствуют
2. Какие навыки нужно улучшить
3. Какие навыки уже сильные
4. Приоритет изучения каждого навыка
5. Ресурсы для обучения
6. Временные рамки

Дай план развития с конкретными шагами.

Верни в JSON формате.
`;

  try {
    const result = await generateText(prompt, 'skill_analyzer', {
      temperature: 0.3,
      maxTokens: 2500,
      useCache: true
    });
    
    return JSON.parse(result);
    
  } catch (error: any) {
    console.error('Skills gap analysis error:', error);
    throw new GeminiError(
      'Failed to analyze skills gap',
      'SKILLS_ANALYSIS_ERROR',
      500,
      true
    );
  }
}

// API health check
export async function testGeminiAPI(): Promise<{ success: boolean; message: string }> {
  try {
    const response = await generateText(
      'Скажи "API работает" если получил это сообщение.',
      'default',
      { useCache: false, maxTokens: 50 }
    );
    
    console.log('Тестовый ответ от Gemini API:', response);
    
    return {
      success: true,
      message: `✅ Gemini API работает: ${response}`
    };
    
  } catch (error: any) {
    console.error('Gemini API test failed:', error);
    return {
      success: false,
      message: `❌ Gemini API не работает: ${error.message}`
    };
  }
}

// Cache management
export const cacheManager = {
  clear: () => {
    cache.clear();
    console.log('Cache cleared');
  },
  
  size: () => cache.size,
  
  stats: () => ({
    entries: cache.size,
    rateLimitRequests: rateLimitInfo.requests.length,
    backoffUntil: rateLimitInfo.backoffUntil,
    fallbackMode: rateLimitInfo.fallbackMode
  })
}; 