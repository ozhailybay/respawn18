export interface ResumeAnalysis {
  overallScore: number;
  sectionScores: {
    content: number;
    formatting: number;
    language: number;
    relevance: number;
    achievements: number;
  };
  strengths: string[];
  weaknesses: string[];
  recommendations: {
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    exampleBefore?: string;
    exampleAfter?: string;
  }[];
  keywords?: {
    term: string;
    relevance: number;
    included: boolean;
  }[];
  improvementTips: {
    title: string;
    description: string;
    example?: string;
  }[];
  missingElements: {
    element: string;
    description: string;
  }[];
  enhancedContent?: string;
  improvedResume?: string; // для обратной совместимости
  keywordDensity?: Record<string, number>;
  stats: {
    readTime?: number;
    matches?: number;
    missingKeywords?: number;
    passRate?: number;
    atsScore?: number;
    optimizationPotential?: number;
  };
} 