import { Project } from '../hooks/useProjects';
import { NetworkingProfile } from '../hooks/useNetworkingProfile';

export interface RecommendationScore {
  project: Project;
  score: number;
  factors: {
    skillMatch: number;
    interestMatch: number;
    locationMatch: number;
    experienceMatch: number;
    categoryMatch: number;
    technologyMatch: number;
    availabilityMatch: number;
    workStyleMatch: number;
    communicationMatch: number;
    popularityBonus: number;
    recencyBonus: number;
  };
  explanation: string[];
}

export class RecommendationEngine {
  private static readonly SKILL_WEIGHT = 0.25;
  private static readonly INTEREST_WEIGHT = 0.20;
  private static readonly LOCATION_WEIGHT = 0.15;
  private static readonly EXPERIENCE_WEIGHT = 0.15;
  private static readonly CATEGORY_WEIGHT = 0.10;
  private static readonly TECHNOLOGY_WEIGHT = 0.10;
  private static readonly AVAILABILITY_WEIGHT = 0.05;

  static calculateRecommendations(
    projects: Project[],
    userProfile: NetworkingProfile | null,
    userHistory?: {
      viewedProjects: string[];
      appliedProjects: string[];
      bookmarkedProjects: string[];
    }
  ): RecommendationScore[] {
    if (!userProfile) {
      // Для пользователей без профиля - базовая сортировка по популярности
      return projects.map(project => ({
        project,
        score: this.calculateBaseScore(project),
        factors: {
          skillMatch: 0,
          interestMatch: 0,
          locationMatch: 0,
          experienceMatch: 0,
          categoryMatch: 0,
          technologyMatch: 0,
          availabilityMatch: 0,
          workStyleMatch: 0,
          communicationMatch: 0,
          popularityBonus: this.calculatePopularityBonus(project),
          recencyBonus: this.calculateRecencyBonus(project),
        },
        explanation: ['Рекомендуем популярные проекты для начала работы'],
      }));
    }

    const recommendations = projects.map(project => {
      const factors = {
        skillMatch: this.calculateSkillMatch(project, userProfile),
        interestMatch: this.calculateInterestMatch(project, userProfile),
        locationMatch: this.calculateLocationMatch(project, userProfile),
        experienceMatch: this.calculateExperienceMatch(project, userProfile),
        categoryMatch: this.calculateCategoryMatch(project, userProfile),
        technologyMatch: this.calculateTechnologyMatch(project, userProfile),
        availabilityMatch: this.calculateAvailabilityMatch(project, userProfile),
        workStyleMatch: this.calculateWorkStyleMatch(project, userProfile),
        communicationMatch: this.calculateCommunicationMatch(project, userProfile),
        popularityBonus: this.calculatePopularityBonus(project),
        recencyBonus: this.calculateRecencyBonus(project),
      };

      const score = this.calculateWeightedScore(factors);
      const explanation = this.generateExplanation(factors, project, userProfile);

      return {
        project,
        score,
        factors,
        explanation,
      };
    });

    // Сортировка по убыванию релевантности
    return recommendations.sort((a, b) => b.score - a.score);
  }

  private static calculateSkillMatch(project: Project, profile: NetworkingProfile): number {
    if (!profile.skills.length) return 0;

    const projectSkills = [...project.technologies, ...project.tags];
    const matchedSkills = profile.skills.filter(skill =>
      projectSkills.some(projectSkill =>
        projectSkill.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(projectSkill.toLowerCase())
      )
    );

    return Math.min(matchedSkills.length / profile.skills.length, 1);
  }

  private static calculateInterestMatch(project: Project, profile: NetworkingProfile): number {
    if (!profile.interests.length) return 0;

    const projectInterests = [project.category, ...project.tags];
    const matchedInterests = profile.interests.filter(interest =>
      projectInterests.some(projectInterest =>
        projectInterest.toLowerCase().includes(interest.toLowerCase()) ||
        interest.toLowerCase().includes(projectInterest.toLowerCase())
      )
    );

    return Math.min(matchedInterests.length / profile.interests.length, 1);
  }

  private static calculateLocationMatch(project: Project, profile: NetworkingProfile): number {
    if (project.isRemote && profile.isRemote) return 1;
    if (!project.isRemote && !profile.isRemote) {
      return project.location.toLowerCase() === profile.location.toLowerCase() ? 1 : 0.3;
    }
    return 0.5; // Смешанный режим
  }

  private static calculateExperienceMatch(project: Project, profile: NetworkingProfile): number {
    const experienceMap = { entry: 1, mid: 2, senior: 3 };
    const difficultyMap = { beginner: 1, intermediate: 2, advanced: 3 };
    const userLevel = experienceMap[profile.experience];
    const projectLevel = difficultyMap[project.difficulty] || 2;

    const diff = Math.abs(userLevel - projectLevel);
    return Math.max(0, 1 - diff * 0.3);
  }

  private static calculateCategoryMatch(project: Project, profile: NetworkingProfile): number {
    if (!profile.preferredCategories.length) return 0.5;

    return profile.preferredCategories.includes(project.category) ? 1 : 0;
  }

  private static calculateTechnologyMatch(project: Project, profile: NetworkingProfile): number {
    if (!profile.preferredTechnologies.length) return 0.5;

    const matchedTechs = profile.preferredTechnologies.filter(tech =>
      project.technologies.includes(tech)
    );

    return Math.min(matchedTechs.length / profile.preferredTechnologies.length, 1);
  }

  private static calculateAvailabilityMatch(project: Project, profile: NetworkingProfile): number {
    // Логика сопоставления доступности
    if (project.duration.includes('мес') && profile.availability === 'project-based') return 1;
    if (project.duration.includes('нед') && profile.availability === 'freelance') return 1;
    return 0.7; // Базовое совпадение
  }

  private static calculateWorkStyleMatch(project: Project, profile: NetworkingProfile): number {
    // Анализ размера команды и стиля работы
    const teamSize = parseInt(project.teamSize.split('-')[0]);
    if (teamSize <= 3 && profile.workStyle === 'individual') return 1;
    if (teamSize > 5 && profile.workStyle === 'team') return 1;
    return 0.8; // Универсальный стиль
  }

  private static calculateCommunicationMatch(project: Project, profile: NetworkingProfile): number {
    // Базовое совпадение стилей коммуникации
    return 0.8;
  }

  private static calculatePopularityBonus(project: Project): number {
    // Бонус за популярность проекта
    const viewsBonus = Math.min(project.views / 1000, 0.1);
    const applicationsBonus = Math.min(project.applications / 50, 0.05);
    return viewsBonus + applicationsBonus;
  }

  private static calculateRecencyBonus(project: Project): number {
    // Бонус за свежесть проекта
    const daysSinceCreation = (Date.now() - project.createdAt.getTime()) / (1000 * 60 * 60 * 24);
    return Math.max(0, 0.1 - daysSinceCreation * 0.001);
  }

  private static calculateBaseScore(project: Project): number {
    return this.calculatePopularityBonus(project) + this.calculateRecencyBonus(project);
  }

  private static calculateWeightedScore(factors: any): number {
    return (
      factors.skillMatch * this.SKILL_WEIGHT +
      factors.interestMatch * this.INTEREST_WEIGHT +
      factors.locationMatch * this.LOCATION_WEIGHT +
      factors.experienceMatch * this.EXPERIENCE_WEIGHT +
      factors.categoryMatch * this.CATEGORY_WEIGHT +
      factors.technologyMatch * this.TECHNOLOGY_WEIGHT +
      factors.availabilityMatch * this.AVAILABILITY_WEIGHT +
      factors.popularityBonus +
      factors.recencyBonus
    );
  }

  private static generateExplanation(factors: any, project: Project, profile: NetworkingProfile): string[] {
    const explanations: string[] = [];

    if (factors.skillMatch > 0.7) {
      explanations.push(`Отлично подходит вашим навыкам (${Math.round(factors.skillMatch * 100)}% совпадение)`);
    }

    if (factors.interestMatch > 0.7) {
      explanations.push(`Соответствует вашим интересам (${Math.round(factors.interestMatch * 100)}% совпадение)`);
    }

    if (factors.locationMatch > 0.8) {
      explanations.push('Идеально подходит по локации');
    }

    if (factors.experienceMatch > 0.8) {
      explanations.push('Соответствует вашему уровню опыта');
    }

    if (factors.categoryMatch === 1) {
      explanations.push('Входит в ваши предпочитаемые категории');
    }

    if (factors.technologyMatch > 0.7) {
      explanations.push(`Использует ваши любимые технологии (${Math.round(factors.technologyMatch * 100)}% совпадение)`);
    }

    if (project.applications > 20) {
      explanations.push('Популярный проект с множеством заявок');
    }

    if (project.views > 500) {
      explanations.push('Высокий интерес к проекту');
    }

    if (explanations.length === 0) {
      explanations.push('Интересный проект для расширения навыков');
    }

    return explanations;
  }

  static getPersonalizedInsights(profile: NetworkingProfile | null, recommendations: RecommendationScore[]): string[] {
    if (!profile) return ['Создайте профиль для персонализированных рекомендаций'];

    const insights: string[] = [];

    // Анализ топ-рекомендаций
    const topRecommendations = recommendations.slice(0, 3);
    const avgScore = topRecommendations.reduce((sum, rec) => sum + rec.score, 0) / topRecommendations.length;

    if (avgScore > 0.8) {
      insights.push('Отличные совпадения! Ваш профиль идеально подходит для активных проектов');
    } else if (avgScore > 0.6) {
      insights.push('Хорошие совпадения. Рассмотрите расширение навыков для лучших возможностей');
    } else {
      insights.push('Попробуйте обновить профиль или расширить интересы для большего количества совпадений');
    }

    // Анализ категорий
    const categoryCounts = topRecommendations.reduce((acc, rec) => {
      acc[rec.project.category] = (acc[rec.project.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topCategory = Object.entries(categoryCounts).sort(([,a], [,b]) => b - a)[0];
    if (topCategory) {
      insights.push(`Большинство рекомендаций в категории "${topCategory[0]}"`);
    }

    // Анализ технологий
    const allTechnologies = topRecommendations.flatMap(rec => rec.project.technologies);
    const techCounts = allTechnologies.reduce((acc, tech) => {
      acc[tech] = (acc[tech] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topTechs = Object.entries(techCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([tech]) => tech);

    if (topTechs.length > 0) {
      insights.push(`Популярные технологии в рекомендациях: ${topTechs.join(', ')}`);
    }

    return insights;
  }
} 