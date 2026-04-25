import { MicroTask } from '../types';

export const mockMicroTasks: MicroTask[] = [
  {
    id: '1',
    title: 'Создание логотипа для стартапа',
    description: 'Нужен современный и запоминающийся логотип для IT-стартапа. Предпочтительно минималистичный дизайн в современном стиле.',
    category: 'design',
    price: 15000,
    deadlineAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 дней
    requirements: [
      'Опыт в создании логотипов',
      'Портфолио с примерами работ',
      'Предоставление исходных файлов (AI, PSD)',
      'До 3 вариантов дизайна'
    ],
    tags: ['логотип', 'дизайн', 'стартап', 'минимализм'],
    status: 'open',
    employerId: 'employer1',
    employerName: 'Асхат Жумабаев',
    employerPhotoURL: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    employerRating: 4.8,
    createdAt: new Date(),
    updatedAt: new Date(),
    viewCount: 45,
    applicationCount: 12
  },
  {
    id: '2',
    title: 'Написание статьи о криптовалютах',
    description: 'Требуется качественная статья на 2000-3000 слов о перспективах криптовалют в Казахстане. Статья должна быть информативной и легко читаемой.',
    category: 'copywriting',
    price: 8000,
    deadlineAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 дней
    requirements: [
      'Опыт в финансовой журналистике',
      'Знание темы криптовалют',
      'Грамотная речь',
      'Уникальность не менее 95%'
    ],
    tags: ['копирайтинг', 'криптовалюты', 'статья', 'финансы'],
    status: 'open',
    employerId: 'employer2',
    employerName: 'Динара Сагинова',
    employerPhotoURL: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    employerRating: 4.9,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 дня назад
    updatedAt: new Date(),
    viewCount: 78,
    applicationCount: 8
  },
  {
    id: '3',
    title: 'Настройка Notion для команды',
    description: 'Нужно создать структуру рабочего пространства в Notion для команды из 15 человек. Включить управление проектами, базы знаний и трекинг задач.',
    category: 'notion',
    price: 12000,
    deadlineAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 дня
    requirements: [
      'Опыт работы с Notion',
      'Понимание процессов управления проектами',
      'Создание шаблонов и автоматизации',
      'Инструкция по использованию'
    ],
    tags: ['notion', 'управление проектами', 'организация', 'команда'],
    status: 'in_progress',
    employerId: 'employer3',
    employerName: 'Ерлан Токтаров',
    employerPhotoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    employerRating: 4.7,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 дней назад
    updatedAt: new Date(),
    viewCount: 32,
    applicationCount: 15
  },
  {
    id: '4',
    title: 'Исследование рынка мобильных приложений',
    description: 'Провести анализ конкурентов в сфере мобильных приложений для доставки еды в Алматы. Подготовить отчет с рекомендациями.',
    category: 'other',
    price: 25000,
    deadlineAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 дней
    requirements: [
      'Опыт в маркетинговых исследованиях',
      'Знание рынка Казахстана',
      'Аналитические навыки',
      'Презентация результатов'
    ],
    tags: ['исследование', 'анализ', 'мобильные приложения', 'рынок'],
    status: 'open',
    employerId: 'employer4',
    employerName: 'Жанар Абдрахманова',
    employerPhotoURL: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    employerRating: 4.6,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 день назад
    updatedAt: new Date(),
    viewCount: 67,
    applicationCount: 6
  },
  {
    id: '5',
    title: 'Создание иконок для мобильного приложения',
    description: 'Требуется набор из 20 иконок для мобильного приложения в стиле iOS. Иконки должны быть в векторном формате и соответствовать гайдлайнам Apple.',
    category: 'design',
    price: 18000,
    deadlineAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 дня
    requirements: [
      'Опыт в дизайне иконок',
      'Знание iOS Human Interface Guidelines',
      'Векторные форматы (SVG, AI)',
      'Разные размеры (@1x, @2x, @3x)'
    ],
    tags: ['иконки', 'мобильный дизайн', 'iOS', 'векторная графика'],
    status: 'completed',
    employerId: 'employer5',
    employerName: 'Бауржан Назарбаев',
    employerPhotoURL: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    employerRating: 4.9,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 дней назад
    updatedAt: new Date(),
    viewCount: 89,
    applicationCount: 22
  },
  {
    id: '6',
    title: 'Перевод технической документации',
    description: 'Перевести техническую документацию API с английского на казахский язык. Объем: около 50 страниц. Требуется сохранение технических терминов.',
    category: 'copywriting',
    price: 20000,
    deadlineAt: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000), // 8 дней
    requirements: [
      'Знание технического английского',
      'Опыт перевода IT-документации',
      'Знание казахского языка',
      'Сохранение форматирования'
    ],
    tags: ['перевод', 'техническая документация', 'казахский язык', 'API'],
    status: 'open',
    employerId: 'employer6',
    employerName: 'Алмас Сейтказиев',
    employerPhotoURL: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=150&h=150&fit=crop&crop=face',
    employerRating: 4.5,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 дня назад
    updatedAt: new Date(),
    viewCount: 23,
    applicationCount: 4
  }
]; 