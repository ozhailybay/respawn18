const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, setDoc, doc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyDSVo3dr51l-eMYD1gDm1FsTG1lAUsiq1k",
  authDomain: "respawn-76195.firebaseapp.com",
  projectId: "respawn-76195",
  storageBucket: "respawn-76195.firebasestorage.app",
  messagingSenderId: "54916948108",
  appId: "1:54916948108:web:22c67b3d1de6f0716c1ba9",
  measurementId: "G-LE0VPJ7423"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const sampleProjects = [
  {
    title: "AI Платформа для Персонализированного Обучения",
    description: "Разрабатываем инновационную образовательную платформу с использованием машинного обучения для создания персонализированных учебных программ. Интеграция с VR/AR технологиями для иммерсивного обучения.",
    category: "Искусственный интеллект",
    status: "active",
    author: "Алексей Иванов",
    authorId: "user1",
    authorRole: "AI Research Lead",
    authorAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    tags: ["React", "Python", "TensorFlow", "Firebase", "TypeScript", "VR"],
    teamSize: "4-6",
    duration: "6-12 мес",
    location: "Удаленно",
    budget: "500,000 - 800,000 ₽",
    difficulty: "advanced",
    technologies: ["React", "Python", "TensorFlow", "Firebase"],
    benefits: ["Опыт работы с AI", "Портфолио проектов", "Сетевые возможности"],
    isRemote: true,
    experienceLevel: "senior",
    projectType: "research",
    views: 156,
    applications: 23,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "Децентрализованная Финансовая Платформа",
    description: "Создаем DeFi протокол для безопасного кредитования и инвестирования с использованием смарт-контрактов. Интеграция с множественными блокчейнами и продвинутая аналитика рисков.",
    category: "Блокчейн",
    status: "active",
    author: "Мария Петрова",
    authorId: "user2",
    authorRole: "Blockchain Architect",
    authorAvatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    tags: ["Solidity", "React", "Node.js", "Ethereum", "Web3"],
    teamSize: "3-5",
    duration: "3-6 мес",
    location: "Москва",
    budget: "300,000 - 500,000 ₽",
    difficulty: "advanced",
    technologies: ["Solidity", "React", "Node.js", "Ethereum"],
    benefits: ["Опыт в DeFi", "Криптовалютные выплаты", "Международная команда"],
    isRemote: false,
    experienceLevel: "senior",
    projectType: "commercial",
    views: 234,
    applications: 18,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "Экологический Мониторинг с IoT",
    description: "Система мониторинга окружающей среды с использованием IoT датчиков и машинного обучения для предсказания экологических изменений. Мобильное приложение для гражданского мониторинга.",
    category: "IoT",
    status: "recruiting",
    author: "Дмитрий Сидоров",
    authorId: "user3",
    authorRole: "IoT Engineer",
    authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    tags: ["Arduino", "Python", "Flutter", "AWS", "Machine Learning"],
    teamSize: "5-8",
    duration: "6-12 мес",
    location: "Санкт-Петербург",
    budget: "400,000 - 600,000 ₽",
    difficulty: "intermediate",
    technologies: ["Arduino", "Python", "Flutter", "AWS"],
    benefits: ["Экологический вклад", "IoT опыт", "Публикации"],
    isRemote: false,
    experienceLevel: "mid",
    projectType: "research",
    views: 89,
    applications: 12,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "Кибербезопасность для Малого Бизнеса",
    description: "Комплексное решение для защиты малого и среднего бизнеса от киберугроз. Включает мониторинг, обнаружение вторжений и автоматическое реагирование на инциденты.",
    category: "Кибербезопасность",
    status: "active",
    author: "Анна Смирнова",
    authorId: "user4",
    authorRole: "Security Expert",
    authorAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    tags: ["Python", "Docker", "Kubernetes", "ELK Stack", "SIEM"],
    teamSize: "3-4",
    duration: "3-6 мес",
    location: "Удаленно",
    budget: "250,000 - 400,000 ₽",
    difficulty: "advanced",
    technologies: ["Python", "Docker", "Kubernetes", "ELK Stack"],
    benefits: ["Security опыт", "Сертификации", "Консультации"],
    isRemote: true,
    experienceLevel: "senior",
    projectType: "commercial",
    views: 167,
    applications: 15,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "Платформа для Управления Творческими Проектами",
    description: "Специализированная платформа для творческих команд с инструментами планирования, коллаборации и монетизации. Интеграция с социальными сетями и платежными системами.",
    category: "UI/UX дизайн",
    status: "recruiting",
    author: "Елена Козлова",
    authorId: "user5",
    authorRole: "Creative Director",
    authorAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
    tags: ["Figma", "React", "Node.js", "Stripe", "Social APIs"],
    teamSize: "4-7",
    duration: "6-12 мес",
    location: "Новосибирск",
    budget: "350,000 - 550,000 ₽",
    difficulty: "intermediate",
    technologies: ["Figma", "React", "Node.js", "Stripe"],
    benefits: ["Портфолио дизайна", "Творческая свобода", "Процент от продаж"],
    isRemote: true,
    experienceLevel: "mid",
    projectType: "commercial",
    views: 123,
    applications: 9,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

const sampleProfiles = [
  {
    userId: "user1",
    displayName: "Алексей Иванов",
    bio: "AI исследователь с 5-летним опытом в машинном обучении и компьютерном зрении. Специализируюсь на разработке инновационных решений для образования и здравоохранения.",
    role: "AI Research Lead",
    skills: ["Python", "TensorFlow", "PyTorch", "Computer Vision", "NLP", "React"],
    interests: ["Искусственный интеллект", "Образование", "Здравоохранение", "Исследования"],
    experience: "senior",
    location: "Москва",
    isRemote: true,
    availability: "project-based",
    education: "МГУ, Математика и компьютерные науки",
    languages: ["Русский", "Английский"],
    achievements: ["PhD в Computer Science", "10+ научных публикаций", "Патент на алгоритм"],
    projectsCreated: 3,
    projectsJoined: 7,
    applicationsSubmitted: 12,
    applicationsAccepted: 8,
    matchScore: 92,
    rank: "Эксперт",
    preferredCategories: ["Искусственный интеллект", "Аналитика данных"],
    preferredTechnologies: ["Python", "TensorFlow", "React"],
    workStyle: "team",
    communicationStyle: "formal",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    userId: "user2",
    displayName: "Мария Петрова",
    bio: "Blockchain разработчик с опытом создания DeFi протоколов и смарт-контрактов. Участвовала в разработке нескольких успешных DeFi проектов.",
    role: "Blockchain Architect",
    skills: ["Solidity", "React", "Node.js", "Ethereum", "Web3", "TypeScript"],
    interests: ["Блокчейн", "DeFi", "Криптовалюты", "Финансовые технологии"],
    experience: "senior",
    location: "Москва",
    isRemote: true,
    availability: "project-based",
    education: "МФТИ, Прикладная математика",
    languages: ["Русский", "Английский"],
    achievements: ["5+ DeFi проектов", "Сертификация Ethereum", "Конференции"],
    projectsCreated: 2,
    projectsJoined: 5,
    applicationsSubmitted: 8,
    applicationsAccepted: 6,
    matchScore: 88,
    rank: "Специалист",
    preferredCategories: ["Блокчейн", "Финансовые технологии"],
    preferredTechnologies: ["Solidity", "React", "Ethereum"],
    workStyle: "both",
    communicationStyle: "mixed",
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

async function seedData() {
  try {
    console.log('🌱 Начинаем добавление тестовых данных...');

    // Добавляем проекты
    console.log('📝 Добавляем проекты...');
    for (const project of sampleProjects) {
      await addDoc(collection(db, 'projects'), project);
      console.log(`✅ Проект "${project.title}" добавлен`);
    }

    // Добавляем профили
    console.log('👤 Добавляем профили...');
    for (const profile of sampleProfiles) {
      await setDoc(doc(db, 'networkingProfiles', profile.userId), profile);
      console.log(`✅ Профиль "${profile.displayName}" добавлен`);
    }

    console.log('🎉 Все тестовые данные успешно добавлены!');
  } catch (error) {
    console.error('❌ Ошибка при добавлении данных:', error);
  }
}

// Запускаем скрипт
seedData(); 