import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Интерфейсы для типизации
interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  bio?: string;
  skills: Array<{
    name: string;
    level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    category: 'technical' | 'soft' | 'language' | 'domain';
  }>;
  education: Array<{
    degree: string;
    field: string;
    institution: string;
    location: string;
    startDate: string;
    endDate?: string;
    gpa?: number;
    highlights?: string[];
  }>;
  experience: Array<{
    title: string;
    company: string;
    location: string;
    type: 'internship' | 'part-time' | 'full-time' | 'volunteer';
    startDate: string;
    endDate?: string;
    current: boolean;
    description: string;
    achievements: string[];
    technologies?: string[];
  }>;
  projects: Array<{
    title: string;
    description: string;
    technologies: string[];
    githubUrl?: string;
    liveUrl?: string;
    status: 'completed' | 'in_progress' | 'planning';
  }>;
  certifications: Array<{
    name: string;
    issuer: string;
    date: string;
    url?: string;
  }>;
}

interface ResumeData {
  summary: string;
  skills: string[];
  experience: Array<{
    company: string;
    role: string;
    dates: string;
    achievements: string[];
  }>;
  education: Array<{
    institution: string;
    degree: string;
    dates: string;
    highlights?: string[];
  }>;
  certifications: string[];
  projects: Array<{
    title: string;
    description: string;
    technologies: string[];
    url?: string;
  }>;
}

interface JobRecommendation {
  title: string;
  company: string;
  location: string;
  salary: string;
  matchScore: number;
  skills: string[];
  requirements: string[];
  benefits: string[];
  description: string;
  applyUrl: string;
  postedDate: string;
}

// Системный промпт для генерации резюме
const RESUME_GENERATION_PROMPT = `
Ты опытный карьерный консультант уровня FAANG с 10+ годами опыта в HR и рекрутинге.
Твоя задача - создать профессиональное резюме на основе профиля пользователя.

ПРАВИЛА:
1. Используй только информацию из профиля пользователя
2. Если информации недостаточно, сделай разумные предположения
3. Пиши в профессиональном тоне
4. Используй action verbs и количественные результаты
5. Адаптируй под целевую позицию
6. Максимум 1 страница

ФОРМАТ ВЫВОДА - строго JSON:
{
  "summary": "1-2 предложения о профессиональном опыте и целях",
  "skills": ["навык 1", "навык 2", "навык 3", "навык 4", "навык 5", "навык 6"],
  "experience": [
    {
      "company": "Название компании",
      "role": "Должность",
      "dates": "Месяц Год - Месяц Год",
      "achievements": [
        "Достижение 1 с количественными результатами",
        "Достижение 2 с количественными результатами",
        "Достижение 3 с количественными результатами"
      ]
    }
  ],
  "education": [
    {
      "institution": "Название учебного заведения",
      "degree": "Степень и специальность",
      "dates": "Год - Год",
      "highlights": ["Достижение 1", "Достижение 2"]
    }
  ],
  "certifications": ["Сертификат 1", "Сертификат 2"],
  "projects": [
    {
      "title": "Название проекта",
      "description": "Краткое описание",
      "technologies": ["технология 1", "технология 2"],
      "url": "ссылка на проект"
    }
  ]
}
`;

// Системный промпт для подбора вакансий
const JOB_MATCHING_PROMPT = `
Ты AI-рекрутер с глубоким пониманием IT-рынка и навыков.
Твоя задача - найти подходящие вакансии на основе профиля пользователя.

АНАЛИЗ:
1. Оцени соответствие навыков требованиям
2. Учти опыт и образование
3. Рассмотри карьерные цели
4. Учти локацию и тип работы

ФОРМАТ ВЫВОДА - строго JSON массив:
[
  {
    "title": "Название позиции",
    "company": "Название компании",
    "location": "Локация (город, страна или Remote)",
    "salary": "Зарплатный диапазон",
    "matchScore": 85,
    "skills": ["требуемый навык 1", "требуемый навык 2"],
    "requirements": ["требование 1", "требование 2"],
    "benefits": ["бенефит 1", "бенефит 2"],
    "description": "Краткое описание позиции",
    "applyUrl": "ссылка на заявку",
    "postedDate": "дата публикации"
  }
]

Генерируй 5-8 реалистичных вакансий с разными уровнями соответствия (60-95%).
`;

// Cloud Function для генерации резюме с помощью Gemini
export const generateResumeWithGemini = functions.https.onCall(async (data, context) => {
  try {
    // Проверяем аутентификацию
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { targetPosition, template } = data;
    const userId = context.auth.uid;

    // Получаем профиль пользователя из Firestore
    const userDoc = await admin.firestore().collection('users').doc(userId).get();
    if (!userDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'User profile not found');
    }

    const userProfile = userDoc.data() as UserProfile;

    // Формируем промпт для Gemini
    const prompt = `
${RESUME_GENERATION_PROMPT}

ПРОФИЛЬ ПОЛЬЗОВАТЕЛЯ:
${JSON.stringify(userProfile, null, 2)}

ЦЕЛЕВАЯ ПОЗИЦИЯ: ${targetPosition || 'Software Developer'}

Сгенерируй резюме для этой позиции.
`;

    // Вызываем Gemini API
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Парсим JSON ответ
    let resumeData: ResumeData;
    try {
      // Извлекаем JSON из ответа (может быть обернут в markdown)
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[1] || jsonMatch[0] : text;
      resumeData = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('Error parsing Gemini response:', parseError);
      throw new functions.https.HttpsError('internal', 'Failed to parse AI response');
    }

    // Сохраняем сгенерированное резюме в Firestore
    const resumeDoc = {
      userId,
      targetPosition: targetPosition || 'Software Developer',
      template: template || 'modern',
      data: resumeData,
      generatedAt: admin.firestore.FieldValue.serverTimestamp(),
      isEditable: true
    };

    const resumeRef = await admin.firestore().collection('resumes').add(resumeDoc);

    return {
      success: true,
      resumeId: resumeRef.id,
      data: resumeData
    };

  } catch (error) {
    console.error('Error generating resume:', error);
    throw new functions.https.HttpsError('internal', 'Failed to generate resume');
  }
});

// Cloud Function для подбора вакансий с помощью Gemini
export const matchJobsWithGemini = functions.https.onCall(async (data, context) => {
  try {
    // Проверяем аутентификацию
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { location, jobType, experienceLevel } = data;
    const userId = context.auth.uid;

    // Получаем профиль пользователя из Firestore
    const userDoc = await admin.firestore().collection('users').doc(userId).get();
    if (!userDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'User profile not found');
    }

    const userProfile = userDoc.data() as UserProfile;

    // Формируем промпт для Gemini
    const prompt = `
${JOB_MATCHING_PROMPT}

ПРОФИЛЬ ПОЛЬЗОВАТЕЛЯ:
${JSON.stringify(userProfile, null, 2)}

ПРЕДПОЧТЕНИЯ:
- Локация: ${location || 'Any'}
- Тип работы: ${jobType || 'Any'}
- Уровень опыта: ${experienceLevel || 'Any'}

Найди подходящие вакансии.
`;

    // Вызываем Gemini API
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Парсим JSON ответ
    let jobRecommendations: JobRecommendation[];
    try {
      // Извлекаем JSON из ответа
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\[\s*\{[\s\S]*\}\s*\]/);
      const jsonString = jsonMatch ? jsonMatch[1] || jsonMatch[0] : text;
      jobRecommendations = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('Error parsing Gemini response:', parseError);
      throw new functions.https.HttpsError('internal', 'Failed to parse AI response');
    }

    // Сохраняем рекомендации в Firestore
    const recommendationsDoc = {
      userId,
      recommendations: jobRecommendations,
      preferences: { location, jobType, experienceLevel },
      generatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await admin.firestore().collection('jobRecommendations').add(recommendationsDoc);

    return {
      success: true,
      recommendations: jobRecommendations
    };

  } catch (error) {
    console.error('Error matching jobs:', error);
    throw new functions.https.HttpsError('internal', 'Failed to match jobs');
  }
});

// Cloud Function для анализа навыков и рекомендаций по развитию
export const analyzeSkillsWithGemini = functions.https.onCall(async (data, context) => {
  try {
    // Проверяем аутентификацию
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const userId = context.auth.uid;

    // Получаем профиль пользователя из Firestore
    const userDoc = await admin.firestore().collection('users').doc(userId).get();
    if (!userDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'User profile not found');
    }

    const userProfile = userDoc.data() as UserProfile;

    const prompt = `
Ты карьерный консультант и эксперт по развитию навыков в IT.

ПРОФИЛЬ ПОЛЬЗОВАТЕЛЯ:
${JSON.stringify(userProfile, null, 2)}

ПРОАНАЛИЗИРУЙ:
1. Сильные стороны пользователя
2. Пробелы в навыках для целевых позиций
3. Рекомендации по развитию
4. Приоритетные навыки для изучения
5. Ресурсы для обучения

ФОРМАТ ВЫВОДА - строго JSON:
{
  "strengths": ["сильная сторона 1", "сильная сторона 2"],
  "skillGaps": [
    {
      "skill": "название навыка",
      "importance": "high|medium|low",
      "reason": "почему важен",
      "learningPath": "как изучить"
    }
  ],
  "recommendations": [
    {
      "category": "technical|soft|certification",
      "title": "название",
      "description": "описание",
      "priority": "high|medium|low",
      "estimatedTime": "время изучения",
      "resources": ["ресурс 1", "ресурс 2"]
    }
  ],
  "marketDemand": {
    "highDemandSkills": ["навык 1", "навык 2"],
    "salaryImpact": "влияние на зарплату",
    "growthTrend": "тренд роста"
  }
}
`;

    // Вызываем Gemini API
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Парсим JSON ответ
    let analysis;
    try {
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[1] || jsonMatch[0] : text;
      analysis = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('Error parsing Gemini response:', parseError);
      throw new functions.https.HttpsError('internal', 'Failed to parse AI response');
    }

    // Сохраняем анализ в Firestore
    const analysisDoc = {
      userId,
      analysis,
      generatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await admin.firestore().collection('skillAnalysis').add(analysisDoc);

    return {
      success: true,
      analysis
    };

  } catch (error) {
    console.error('Error analyzing skills:', error);
    throw new functions.https.HttpsError('internal', 'Failed to analyze skills');
  }
}); 