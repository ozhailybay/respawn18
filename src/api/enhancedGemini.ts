import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY || '');

export interface ResumeProfile {
  displayName: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
  skills: string[];
  experience: string[];
  education: string[];
  languages: string[];
  interests: string[];
  position: string;
  university: string;
  graduationYear: string;
  linkedIn: string;
  portfolio: string;
  github: string;
  website: string;
}

export interface ResumeAnalysis {
  personalInfo: any;
  summary: string;
  experience: any[];
  education: any[];
  skills: any[];
  projects: any[];
}

export interface AIAnalysisResult {
  overallScore: number;
  strengths: string[];
  improvements: string[];
  detailedFeedback: string;
  enhancedContent: string;
  sectionScores: {
    personalInfo: number;
    summary: number;
    experience: number;
    education: number;
    skills: number;
    projects: number;
  };
}

export interface AISuggestion {
  type: 'summary' | 'experience' | 'skills' | 'education';
  original: string;
  suggestions: string[];
  reasoning: string;
}

// Enhanced Resume Generation with multiple templates
export const generateEnhancedResume = async (
  profile: ResumeProfile,
  template: string = 'modern',
  style: 'professional' | 'creative' | 'minimal' = 'professional'
): Promise<{ html: string; css: string; suggestions: string[] }> => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
Создай современное, элегантное резюме в HTML формате для следующего профиля:

Имя: ${profile.name}
Email: ${profile.email}
Телефон: ${profile.phone}
Местоположение: ${profile.location}
Позиция: ${profile.position}
Био: ${profile.bio}

Навыки: ${profile.skills.join(', ')}
Опыт работы: ${profile.experience.join('\n')}
Образование: ${profile.education.join('\n')}
Языки: ${profile.languages.join(', ')}

Требования к дизайну:
- Стиль: ${style}
- Шаблон: ${template}
- Цветовая схема: черно-белая, элегантная
- Современный и профессиональный дизайн
- Адаптивная верстка
- Красивые анимации и эффекты
- Используй CSS Grid и Flexbox
- Добавь иконки и визуальные элементы
- Сделай так, чтобы резюме выглядело премиально

Верни только HTML код с встроенными CSS стилями. Не добавляй никаких комментариев или пояснений.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const html = response.text();

    // Generate CSS for the template
    const css = generateTemplateCSS(template, style);

    // Generate suggestions for improvement
    const suggestions = await generateSuggestions(profile);

    return { html, css, suggestions };
  } catch (error) {
    console.error('Error generating enhanced resume:', error);
    throw error;
  }
};

// Generate template-specific CSS
const generateTemplateCSS = (template: string, style: string): string => {
  const baseCSS = `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      line-height: 1.6;
      color: #1a202c;
      background: #ffffff;
    }
    
    .resume-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 40px;
      background: #ffffff;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
      border-radius: 12px;
    }
    
    .header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 30px;
      border-bottom: 2px solid #e2e8f0;
    }
    
    .name {
      font-size: 2.5rem;
      font-weight: 700;
      color: #1a202c;
      margin-bottom: 10px;
      letter-spacing: -0.02em;
    }
    
    .title {
      font-size: 1.25rem;
      color: #4a5568;
      margin-bottom: 15px;
      font-weight: 500;
    }
    
    .contact-info {
      display: flex;
      justify-content: center;
      gap: 20px;
      flex-wrap: wrap;
      font-size: 0.9rem;
      color: #718096;
    }
    
    .section {
      margin-bottom: 30px;
    }
    
    .section-title {
      font-size: 1.5rem;
      font-weight: 600;
      color: #1a202c;
      margin-bottom: 15px;
      padding-bottom: 8px;
      border-bottom: 2px solid #e2e8f0;
      position: relative;
    }
    
    .section-title::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 0;
      width: 60px;
      height: 2px;
      background: #805ad5;
    }
    
    .experience-item, .education-item {
      margin-bottom: 20px;
      padding: 20px;
      background: #f7fafc;
      border-radius: 8px;
      border-left: 4px solid #805ad5;
    }
    
    .job-title {
      font-size: 1.1rem;
      font-weight: 600;
      color: #1a202c;
      margin-bottom: 5px;
    }
    
    .company {
      font-size: 1rem;
      color: #4a5568;
      margin-bottom: 5px;
    }
    
    .date {
      font-size: 0.9rem;
      color: #718096;
      margin-bottom: 10px;
    }
    
    .description {
      color: #2d3748;
      line-height: 1.6;
    }
    
    .skills-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      margin-top: 15px;
    }
    
    .skill-category {
      background: #f7fafc;
      padding: 15px;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
    }
    
    .skill-category h4 {
      font-size: 1rem;
      font-weight: 600;
      color: #1a202c;
      margin-bottom: 10px;
    }
    
    .skill-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    
    .skill-tag {
      background: #805ad5;
      color: white;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 500;
    }
    
    .projects-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
      margin-top: 15px;
    }
    
    .project-card {
      background: #f7fafc;
      padding: 20px;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
    }
    
    .project-title {
      font-size: 1.1rem;
      font-weight: 600;
      color: #1a202c;
      margin-bottom: 10px;
    }
    
    .project-description {
      color: #2d3748;
      margin-bottom: 10px;
    }
    
    .project-tech {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    
    .tech-tag {
      background: #e2e8f0;
      color: #4a5568;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 0.75rem;
    }
    
    @media print {
      .resume-container {
        box-shadow: none;
        padding: 20px;
      }
    }
    
    @media (max-width: 768px) {
      .resume-container {
        padding: 20px;
        margin: 10px;
      }
      
      .name {
        font-size: 2rem;
      }
      
      .contact-info {
        flex-direction: column;
        gap: 10px;
      }
      
      .skills-grid {
        grid-template-columns: 1fr;
      }
      
      .projects-grid {
        grid-template-columns: 1fr;
      }
    }
  `;

  return baseCSS;
};

// Generate AI suggestions for resume improvement
export const generateSuggestions = async (profile: ResumeProfile): Promise<string[]> => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
Проанализируй этот профиль резюме и дай 5 конкретных рекомендаций для улучшения:

Имя: ${profile.name}
Позиция: ${profile.position}
Био: ${profile.bio}
Навыки: ${profile.skills.join(', ')}
Опыт: ${profile.experience.length} позиций
Образование: ${profile.education.join(', ')}

Дай краткие, конкретные рекомендации для улучшения резюме. Каждая рекомендация должна быть в одном предложении.
Верни только список рекомендаций, без нумерации.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const suggestions = response.text().split('\n').filter(s => s.trim());

    return suggestions.slice(0, 5);
  } catch (error) {
    console.error('Error generating suggestions:', error);
    return [
      'Добавьте количественные результаты в описания опыта работы',
      'Расширьте раздел навыков конкретными технологиями',
      'Улучшите краткое описание, сделав его более конкретным',
      'Добавьте проекты с ссылками на GitHub',
      'Включите сертификации и достижения'
    ];
  }
};

// Enhanced resume analysis
export const generateEnhancedAnalysis = async (resumeData: ResumeAnalysis): Promise<AIAnalysisResult> => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
Проведи детальный анализ этого резюме и дай оценку по 100-балльной шкале:

Данные резюме:
${JSON.stringify(resumeData, null, 2)}

Проанализируй следующие аспекты:
1. Полнота информации (0-20 баллов)
2. Качество описаний (0-20 баллов)
3. Релевантность навыков (0-20 баллов)
4. Структура и читаемость (0-20 баллов)
5. Профессиональность (0-20 баллов)

Верни JSON в следующем формате:
{
  "overallScore": число,
  "strengths": ["сильная сторона 1", "сильная сторона 2"],
  "improvements": ["улучшение 1", "улучшение 2"],
  "detailedFeedback": "детальная обратная связь",
  "enhancedContent": "улучшенная версия описания",
  "sectionScores": {
    "personalInfo": число,
    "summary": число,
    "experience": число,
    "education": число,
    "skills": число,
    "projects": число
  }
}
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const analysisText = response.text();

    // Try to parse JSON from response
    try {
      const analysis = JSON.parse(analysisText);
      return analysis;
    } catch (parseError) {
      console.error('Error parsing analysis JSON:', parseError);
      // Return default analysis
      return {
        overallScore: 75,
        strengths: ['Хорошая структура', 'Релевантный опыт'],
        improvements: ['Добавить количественные результаты', 'Расширить навыки'],
        detailedFeedback: 'Резюме имеет хорошую основу, но нуждается в улучшениях.',
        enhancedContent: 'Опытный специалист с сильными техническими навыками.',
        sectionScores: {
          personalInfo: 80,
          summary: 70,
          experience: 75,
          education: 85,
          skills: 70,
          projects: 65
        }
      };
    }
  } catch (error) {
    console.error('Error generating enhanced analysis:', error);
    throw error;
  }
};

// Generate specific suggestions for different sections
export const generateSectionSuggestions = async (
  section: string,
  content: string,
  context: string
): Promise<AISuggestion> => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
Дай 3 улучшенных варианта для раздела "${section}" резюме.

Текущий контент: "${content}"
Контекст: ${context}

Верни JSON в формате:
{
  "type": "${section}",
  "original": "${content}",
  "suggestions": ["вариант 1", "вариант 2", "вариант 3"],
  "reasoning": "объяснение улучшений"
}
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const suggestionText = response.text();

    try {
      const suggestion = JSON.parse(suggestionText);
      return suggestion;
    } catch (parseError) {
      console.error('Error parsing suggestion JSON:', parseError);
      return {
        type: section as any,
        original: content,
        suggestions: [
          'Улучшенная версия 1',
          'Улучшенная версия 2',
          'Улучшенная версия 3'
        ],
        reasoning: 'Эти варианты более конкретны и профессиональны.'
      };
    }
  } catch (error) {
    console.error('Error generating section suggestions:', error);
    throw error;
  }
};

// Generate cover letter
export const generateCoverLetter = async (
  resumeProfile: ResumeProfile,
  jobDescription: string,
  companyName: string
): Promise<string> => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
Создай профессиональное сопроводительное письмо для кандидата:

Кандидат:
Имя: ${resumeProfile.name}
Позиция: ${resumeProfile.position}
Опыт: ${resumeProfile.experience.length} позиций
Навыки: ${resumeProfile.skills.join(', ')}

Вакансия:
Компания: ${companyName}
Описание: ${jobDescription}

Создай сопроводительное письмо, которое:
- Персонализировано под конкретную вакансию
- Подчеркивает релевантный опыт
- Показывает энтузиазм к компании
- Профессионально и убедительно
- Длина: 200-300 слов

Верни только текст письма без заголовков.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating cover letter:', error);
    throw error;
  }
};

// Generate interview questions
export const generateInterviewQuestions = async (
  resumeProfile: ResumeProfile,
  jobDescription: string
): Promise<string[]> => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
Создай 10 возможных вопросов для собеседования на основе резюме и описания вакансии:

Кандидат: ${resumeProfile.name}
Позиция: ${resumeProfile.position}
Навыки: ${resumeProfile.skills.join(', ')}

Описание вакансии: ${jobDescription}

Создай вопросы, которые:
- Касаются конкретного опыта кандидата
- Проверяют технические навыки
- Оценивают soft skills
- Релевантны для позиции

Верни только список вопросов, каждый с новой строки.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const questions = response.text().split('\n').filter(q => q.trim());

    return questions.slice(0, 10);
  } catch (error) {
    console.error('Error generating interview questions:', error);
    return [
      'Расскажите о вашем опыте работы с основными технологиями',
      'Как вы решаете сложные технические проблемы?',
      'Опишите проект, которым вы гордитесь',
      'Как вы работаете в команде?',
      'Какие у вас планы по развитию?'
    ];
  }
}; 