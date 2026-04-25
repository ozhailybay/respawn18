export interface ShadowOnboardingData {
  categoryId: string;
  categoryTitle: string;
  profession: string;
  classGrade: '8' | '9' | '10' | '11';
  achievements?: string;
}

export interface ShadowChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface ShadowResult {
  strengths: string[];
  fit_score: number;
  fit_description: string;
  portfolio_text: string;
  salary_junior: string;
  salary_mid: string;
  salary_senior: string;
  top_universities: string[];
  grants: string[];
}

