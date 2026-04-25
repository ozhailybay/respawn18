import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import {
  FiSearch, FiPlus, FiFilter, FiClock, FiTag, FiUser, FiDollarSign, 
  FiCalendar, FiTrendingUp, FiZap, FiTarget, FiStar, FiArrowRight,
  FiCheckCircle, FiUsers, FiGlobe, FiCode, FiPenTool, FiLayers,
  FiHeart, FiEye, FiMessageCircle, FiShare2, FiBookmark, FiGrid,
  FiList, FiRefreshCw, FiAward, FiTrendingDown, FiActivity, FiMail,
  FiPhone, FiLinkedin, FiGithub, FiMapPin, FiCpu, FiDatabase,
  FiSmartphone, FiCamera, FiMusic, FiVideo, FiEdit3, FiMonitor,
  FiHexagon, FiTriangle, FiCircle, FiSquare, FiOctagon
} from 'react-icons/fi';
import { MicroTask, MicroTaskCategory, MicroTaskFilters, MicroTaskStatus } from '../../types';
import { microTaskService } from '../../services/microTaskService';
import { useAuth } from '../../context/AuthContext';

// Мок данные с реалистичными казахскими и русскими именами
const mockTasks: MicroTask[] = [
  {
    id: '1',
    title: 'Логотип для кафе "Бақыт"',
    description: 'Нужен современный логотип для семейного кафе. Стиль - минимализм, цвета - теплые тона. Включить элементы казахской культуры.',
    category: 'design',
    price: 25000,
    employerName: 'Айгүл Сәтбаева',
    employerRating: 4.8,
    deadlineAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    status: 'open',
    tags: ['логотип', 'кафе', 'минимализм', 'культура'],
    viewCount: 47,
    applicationCount: 8
  },
  {
    id: '2',
    title: 'Контент для Instagram магазина одежды',
    description: 'Написать 10 постов для Instagram аккаунта магазина женской одежды. Тон - дружелюбный, целевая аудитория - девушки 18-35 лет.',
    category: 'copywriting',
    price: 15000,
    employerName: 'Мәдина Қасымова',
    employerRating: 4.9,
    deadlineAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    status: 'open',
    tags: ['instagram', 'контент', 'мода', 'женская одежда'],
    viewCount: 63,
    applicationCount: 12
  },
  {
    id: '3',
    title: 'Мобильное приложение для доставки еды',
    description: 'Разработать простое мобильное приложение для доставки еды. React Native, интеграция с картами, система оплаты.',
    category: 'development',
    price: 150000,
    employerName: 'Ерлан Тұрсынов',
    employerRating: 4.7,
    deadlineAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    status: 'open',
    tags: ['мобильное приложение', 'доставка', 'react native', 'карты'],
    viewCount: 89,
    applicationCount: 5
  },
  {
    id: '4',
    title: 'Фотосессия для свадебного салона',
    description: 'Нужны качественные фотографии свадебных платьев для каталога. 15-20 фото, профессиональная обработка.',
    category: 'photo',
    price: 35000,
    employerName: 'Гүлнара Әбдіқадырова',
    employerRating: 5.0,
    deadlineAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    status: 'open',
    tags: ['фотосессия', 'свадебные платья', 'каталог', 'обработка'],
    viewCount: 34,
    applicationCount: 7
  },
  {
    id: '5',
    title: 'Видеоролик для YouTube канала',
    description: 'Смонтировать 5-минутный ролик для образовательного канала. Есть исходники, нужна анимация и озвучка.',
    category: 'video',
    price: 45000,
    employerName: 'Асылбек Нұрланов',
    employerRating: 4.6,
    deadlineAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    status: 'open',
    tags: ['видеомонтаж', 'youtube', 'анимация', 'образование'],
    viewCount: 56,
    applicationCount: 9
  },
  {
    id: '6',
    title: 'Настройка CRM системы',
    description: 'Настроить Notion для управления клиентами небольшой IT компании. Создать базы данных, автоматизацию.',
    category: 'notion',
    price: 20000,
    employerName: 'Диана Смагулова',
    employerRating: 4.8,
    deadlineAt: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    status: 'open',
    tags: ['notion', 'crm', 'автоматизация', 'база данных'],
    viewCount: 41,
    applicationCount: 6
  },
  {
    id: '7',
    title: 'SMM стратегия для ресторана',
    description: 'Разработать стратегию продвижения ресторана казахской кухни в социальных сетях. Контент-план на месяц.',
    category: 'marketing',
    price: 30000,
    employerName: 'Жанат Есімов',
    employerRating: 4.9,
    deadlineAt: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    status: 'open',
    tags: ['smm', 'ресторан', 'стратегия', 'казахская кухня'],
    viewCount: 72,
    applicationCount: 11
  },
  {
    id: '8',
    title: 'Дизайн визиток для адвоката',
    description: 'Создать элегантный дизайн визиток для юридической фирмы. Строгий стиль, качественная печать.',
    category: 'design',
    price: 12000,
    employerName: 'Сәуле Бейсенова',
    employerRating: 4.7,
    deadlineAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    status: 'open',
    tags: ['визитки', 'юридическая фирма', 'элегантный дизайн'],
    viewCount: 28,
    applicationCount: 4
  },
  {
    id: '9',
    title: 'Веб-сайт для стоматологии',
    description: 'Разработать сайт для стоматологической клиники. Запись на прием, галерея работ, информация о услугах.',
    category: 'web',
    price: 80000,
    employerName: 'Алмас Жүсіпов',
    employerRating: 4.8,
    deadlineAt: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    status: 'open',
    tags: ['веб-сайт', 'стоматология', 'запись на прием', 'галерея'],
    viewCount: 95,
    applicationCount: 8
  },
  {
    id: '10',
    title: 'Озвучка рекламного ролика',
    description: 'Нужен мужской голос для озвучки 30-секундного рекламного ролика автосалона. Казахский и русский язык.',
    category: 'audio',
    price: 18000,
    employerName: 'Бауыржан Омаров',
    employerRating: 4.9,
    deadlineAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    status: 'open',
    tags: ['озвучка', 'реклама', 'автосалон', 'двуязычие'],
    viewCount: 52,
    applicationCount: 13
  },
  {
    id: '11',
    title: 'Тексты для сайта юридических услуг',
    description: 'Написать тексты для сайта юридической компании. 5 страниц, SEO-оптимизация, юридическая терминология.',
    category: 'copywriting',
    price: 22000,
    employerName: 'Анель Қожахметова',
    employerRating: 4.8,
    deadlineAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    status: 'open',
    tags: ['копирайтинг', 'юридические услуги', 'seo', 'терминология'],
    viewCount: 38,
    applicationCount: 7
  },
  {
    id: '12',
    title: 'Мобильная игра на Unity',
    description: 'Разработать простую мобильную игру-головоломку на Unity. 2D графика, 20 уровней, система достижений.',
    category: 'mobile',
    price: 120000,
    employerName: 'Нұрлан Қайратов',
    employerRating: 4.6,
    deadlineAt: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    status: 'open',
    tags: ['unity', 'мобильная игра', 'головоломка', 'достижения'],
    viewCount: 76,
    applicationCount: 4
  },
  {
    id: '13',
    title: 'Фотосъемка продуктов для маркетплейса',
    description: 'Сфотографировать 50 товаров для размещения на Kaspi.kz. Белый фон, разные ракурсы, обработка.',
    category: 'photo',
    price: 40000,
    employerName: 'Жанара Абишева',
    employerRating: 5.0,
    deadlineAt: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    status: 'open',
    tags: ['фотосъемка', 'товары', 'маркетплейс', 'kaspi'],
    viewCount: 61,
    applicationCount: 10
  },
  {
    id: '14',
    title: 'Анимационный ролик для презентации',
    description: 'Создать 2-минутный анимационный ролик для презентации IT продукта. Motion graphics, современный стиль.',
    category: 'video',
    price: 55000,
    employerName: 'Әлия Төлеуова',
    employerRating: 4.9,
    deadlineAt: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    status: 'open',
    tags: ['анимация', 'презентация', 'motion graphics', 'IT'],
    viewCount: 43,
    applicationCount: 6
  },
  {
    id: '15',
    title: 'База данных клиентов в Notion',
    description: 'Создать систему управления клиентами в Notion для салона красоты. Записи, история, автоматические напоминания.',
    category: 'notion',
    price: 25000,
    employerName: 'Камила Рахимова',
    employerRating: 4.7,
    deadlineAt: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    status: 'open',
    tags: ['notion', 'салон красоты', 'клиенты', 'напоминания'],
    viewCount: 35,
    applicationCount: 8
  },
  {
    id: '16',
    title: 'Реклама в Google Ads для клиники',
    description: 'Настроить и запустить рекламную кампанию в Google Ads для частной медицинской клиники.',
    category: 'marketing',
    price: 35000,
    employerName: 'Ерболат Сыдыков',
    employerRating: 4.8,
    deadlineAt: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    status: 'open',
    tags: ['google ads', 'медицинская клиника', 'реклама', 'настройка'],
    viewCount: 67,
    applicationCount: 9
  },
  {
    id: '17',
    title: 'Дизайн упаковки для меда',
    description: 'Разработать дизайн этикетки для натурального меда. Эко-стиль, информация о продукте, штрих-код.',
    category: 'design',
    price: 28000,
    employerName: 'Гүлжан Мұратова',
    employerRating: 4.9,
    deadlineAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    status: 'open',
    tags: ['упаковка', 'мед', 'эко-стиль', 'этикетка'],
    viewCount: 49,
    applicationCount: 7
  },
  {
    id: '18',
    title: 'Интернет-магазин на Shopify',
    description: 'Создать интернет-магазин детской одежды на Shopify. Каталог, корзина, оплата, доставка.',
    category: 'web',
    price: 90000,
    employerName: 'Айжан Қасенова',
    employerRating: 4.8,
    deadlineAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    status: 'open',
    tags: ['shopify', 'детская одежда', 'интернет-магазин', 'каталог'],
    viewCount: 82,
    applicationCount: 6
  },
  {
    id: '19',
    title: 'Подкаст для бизнес-канала',
    description: 'Записать и смонтировать подкаст интервью с успешными предпринимателями Казахстана. 45 минут.',
    category: 'audio',
    price: 32000,
    employerName: 'Серікжан Әбдіров',
    employerRating: 4.7,
    deadlineAt: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    status: 'open',
    tags: ['подкаст', 'интервью', 'предприниматели', 'бизнес'],
    viewCount: 58,
    applicationCount: 11
  },
  {
    id: '20',
    title: 'Приложение для фитнес-тренера',
    description: 'Разработать мобильное приложение для персонального тренера. Расписание, клиенты, программы тренировок.',
    category: 'mobile',
    price: 110000,
    employerName: 'Дәурен Жақсыбаев',
    employerRating: 4.9,
    deadlineAt: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    status: 'open',
    tags: ['фитнес', 'тренер', 'мобильное приложение', 'расписание'],
    viewCount: 73,
    applicationCount: 5
  },
  {
    id: '21',
    title: 'Контент-план для TikTok',
    description: 'Создать контент-план на месяц для TikTok аккаунта танцевальной студии. Тренды, челленджи, обучающие видео.',
    category: 'copywriting',
    price: 16000,
    employerName: 'Амина Сарсенова',
    employerRating: 4.8,
    deadlineAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    status: 'open',
    tags: ['tiktok', 'танцевальная студия', 'контент-план', 'тренды'],
    viewCount: 44,
    applicationCount: 14
  },
  {
    id: '22',
    title: 'Корпоративный сайт на WordPress',
    description: 'Создать корпоративный сайт для строительной компании на WordPress. Портфолио проектов, контакты, блог.',
    category: 'web',
    price: 70000,
    employerName: 'Мұрат Әлімжанов',
    employerRating: 4.6,
    deadlineAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    status: 'open',
    tags: ['wordpress', 'строительная компания', 'корпоративный сайт', 'портфолио'],
    viewCount: 91,
    applicationCount: 7
  }
];

// Элегантные анимационные варианты
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: { 
      duration: 0.6, 
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

const floatingVariants = {
  animate: {
    y: [0, -20, 0],
    rotate: [0, 5, -5, 0],
    scale: [1, 1.1, 1],
    transition: {
      duration: 8,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

const glowVariants = {
  animate: {
    boxShadow: [
      '0 0 20px rgba(255, 255, 255, 0.1)',
      '0 0 40px rgba(255, 255, 255, 0.3)',
      '0 0 20px rgba(255, 255, 255, 0.1)'
    ],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

// Премиальный анимированный фон
const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* Основной градиент */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-black dark:via-gray-950 dark:to-gray-900" />
      
      {/* Динамические геометрические формы */}
      <motion.div
        animate={{ 
          rotate: [0, 360],
          scale: [1, 1.2, 1],
          opacity: [0.03, 0.08, 0.03]
        }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="absolute -top-40 -left-40 w-80 h-80 border border-black/10 dark:border-white/10 rounded-full"
      />
      
      <motion.div
        animate={{ 
          rotate: [360, 0],
          scale: [1, 1.3, 1],
          opacity: [0.05, 0.1, 0.05]
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute -bottom-40 -right-40 w-96 h-96 border border-black/10 dark:border-white/10 rounded-full"
      />
      
      {/* Элегантные линии */}
      <motion.div
        animate={{ 
          x: [0, 100, 0],
          opacity: [0.1, 0.3, 0.1]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-black/20 dark:via-white/20 to-transparent"
      />
      
      <motion.div
        animate={{ 
          x: [100, 0, 100],
          opacity: [0.1, 0.3, 0.1]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-black/20 dark:via-white/20 to-transparent"
      />
      
      {/* Плавающие геометрические элементы */}
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={i}
          className={`absolute w-2 h-2 sm:w-4 sm:h-4 border border-black/10 dark:border-white/10 ${
            i % 4 === 0 ? 'rounded-full' : 
            i % 4 === 1 ? 'rounded-none rotate-45' :
            i % 4 === 2 ? 'rounded-sm' : 'rounded-full'
          }`}
          style={{
            left: `${10 + (i * 12)}%`,
            top: `${20 + (i * 8)}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.1, 0.4, 0.1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 8 + (i * 2),
            repeat: Infinity,
            delay: i * 0.5,
            ease: "easeInOut"
          }}
        />
      ))}
      
      {/* Сетка точек - скрыта на мобильных */}
      <div className="absolute inset-0 opacity-20 dark:opacity-10 hidden sm:block">
        <div className="grid grid-cols-20 gap-8 h-full w-full p-8">
          {Array.from({ length: 200 }).map((_, i) => (
            <motion.div
              key={i}
              className="w-1 h-1 bg-black dark:bg-white rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 0.8, 0.3]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                delay: i * 0.02,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Премиальная карточка статистики
const StatsCard = ({ icon: Icon, value, label, trend }: {
  icon: React.ElementType;
  value: string;
  label: string;
  trend?: { value: string; isPositive: boolean };
}) => (
  <motion.div
    variants={itemVariants}
    whileHover={{ 
      scale: 1.05, 
      y: -8,
      transition: { duration: 0.3 }
    }}
    className="group relative bg-white/90 dark:bg-black/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl border border-gray-200/50 dark:border-gray-800/50 hover:border-black/20 dark:hover:border-white/20 transition-all duration-500"
  >
    {/* Glow effect */}
    <motion.div
      className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-black/5 to-transparent dark:from-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
      animate={{
        background: [
          'linear-gradient(45deg, rgba(0,0,0,0.05) 0%, transparent 100%)',
          'linear-gradient(45deg, transparent 0%, rgba(0,0,0,0.05) 100%)',
          'linear-gradient(45deg, rgba(0,0,0,0.05) 0%, transparent 100%)'
        ]
      }}
      transition={{ duration: 3, repeat: Infinity }}
    />
    
    <div className="relative z-10">
      <div className="flex items-center justify-between mb-3 sm:mb-4 lg:mb-6">
        <motion.div 
          className="p-2 sm:p-3 lg:p-4 bg-black dark:bg-white rounded-xl sm:rounded-2xl shadow-lg"
          whileHover={{ rotate: 360 }}
          transition={{ duration: 0.6 }}
        >
          <Icon className="w-4 h-4 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-white dark:text-black" />
        </motion.div>
        {trend && (
          <div className={`flex items-center text-xs sm:text-sm font-medium ${
            trend.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
          }`}>
            {trend.isPositive ? <FiTrendingUp className="w-3 h-3 sm:w-4 sm:h-4 mr-1" /> : <FiTrendingDown className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />}
            {trend.value}
          </div>
        )}
      </div>
      
      <div className="text-xl sm:text-2xl lg:text-4xl font-bold text-black dark:text-white mb-1 sm:mb-2 lg:mb-3 font-mono">
        {value}
      </div>
      
      <div className="text-gray-600 dark:text-gray-400 font-medium uppercase tracking-wider text-xs sm:text-sm">
        {label}
      </div>
    </div>
  </motion.div>
);

// Элегантная карточка задания
const TaskCard = ({ task, onTaskClick }: { task: MicroTask; onTaskClick: (id: string) => void }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const getCategoryIcon = (category: MicroTaskCategory) => {
    switch (category) {
      case 'design': return FiPenTool;
      case 'copywriting': return FiEdit3;
      case 'notion': return FiDatabase;
      case 'development': return FiCode;
      case 'marketing': return FiTrendingUp;
      case 'video': return FiVideo;
      case 'audio': return FiMusic;
      case 'photo': return FiCamera;
      case 'mobile': return FiSmartphone;
      case 'web': return FiMonitor;
      default: return FiLayers;
    }
  };
  
  const CategoryIcon = getCategoryIcon(task.category);
  
  const getTimeLeft = (deadline: Date | string) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Просрочено';
    if (diffDays === 0) return 'Сегодня';
    if (diffDays === 1) return 'Завтра';
    return `${diffDays} дней`;
  };
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'KZT',
      minimumFractionDigits: 0
    }).format(price);
  };
  
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ 
        scale: 1.02, 
        y: -5,
        transition: { duration: 0.3 }
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group relative bg-white/95 dark:bg-black/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl border border-gray-200/50 dark:border-gray-800/50 hover:border-black/30 dark:hover:border-white/30 transition-all duration-500 cursor-pointer overflow-hidden"
      onClick={() => onTaskClick(task.id)}
    >
      {/* Animated border */}
      <motion.div
        className="absolute inset-0 rounded-2xl sm:rounded-3xl"
        animate={isHovered ? {
          background: [
            'linear-gradient(0deg, transparent, transparent)',
            'linear-gradient(180deg, rgba(0,0,0,0.1), transparent)',
            'linear-gradient(360deg, transparent, transparent)'
          ]
        } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      />
      
      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        animate={isHovered ? {
          boxShadow: [
            '0 0 0 rgba(0,0,0,0.1)',
            '0 0 40px rgba(0,0,0,0.2)',
            '0 0 0 rgba(0,0,0,0.1)'
          ]
        } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-3 sm:mb-4 lg:mb-6">
          <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4 flex-1 min-w-0">
            <motion.div 
              className="p-2 sm:p-3 bg-black dark:bg-white rounded-xl sm:rounded-2xl shadow-lg flex-shrink-0"
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.6 }}
            >
              <CategoryIcon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white dark:text-black" />
            </motion.div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm sm:text-base lg:text-xl font-bold text-black dark:text-white group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300 line-clamp-2">
                {task.title}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 capitalize font-medium tracking-wide">
                {task.category}
              </p>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
            <motion.button
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                setIsLiked(!isLiked);
              }}
              className={`p-2 sm:p-3 rounded-full border-2 transition-all duration-300 ${
                isLiked 
                  ? 'bg-black dark:bg-white border-black dark:border-white text-white dark:text-black' 
                  : 'border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white'
              }`}
            >
              <FiHeart className={`w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 ${isLiked ? 'fill-current' : ''}`} />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                setIsBookmarked(!isBookmarked);
              }}
              className={`p-2 sm:p-3 rounded-full border-2 transition-all duration-300 ${
                isBookmarked 
                  ? 'bg-black dark:bg-white border-black dark:border-white text-white dark:text-black' 
                  : 'border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white'
              }`}
            >
              <FiBookmark className={`w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 ${isBookmarked ? 'fill-current' : ''}`} />
            </motion.button>
          </div>
        </div>
        
        {/* Description */}
        <p className="text-xs sm:text-sm lg:text-base text-gray-700 dark:text-gray-300 mb-3 sm:mb-4 lg:mb-6 line-clamp-3 leading-relaxed">
            {task.description}
        </p>
          
        {/* Tags */}
        <div className="flex flex-wrap gap-1 sm:gap-2 mb-3 sm:mb-4 lg:mb-6">
            {task.tags.slice(0, 3).map((tag, index) => (
            <motion.span
              key={index}
              whileHover={{ scale: 1.05 }}
              className="px-2 sm:px-3 lg:px-4 py-1 sm:py-2 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-full text-xs sm:text-sm font-medium border border-gray-200 dark:border-gray-700 hover:border-black dark:hover:border-white transition-all duration-300"
            >
              {tag}
            </motion.span>
            ))}
            {task.tags.length > 3 && (
            <span className="px-2 sm:px-3 lg:px-4 py-1 sm:py-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full text-xs sm:text-sm font-medium border border-gray-200 dark:border-gray-700">
              +{task.tags.length - 3}
            </span>
          )}
        </div>
        
        {/* Employer Info */}
        <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4 mb-3 sm:mb-4 lg:mb-6 p-2 sm:p-3 lg:p-4 bg-gray-50 dark:bg-gray-900 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-800">
          <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-black dark:bg-white rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
            <FiUser className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white dark:text-black" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm sm:text-base lg:text-lg font-semibold text-black dark:text-white truncate">
              {task.employerName || 'Заказчик'}
            </p>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <div className="flex items-center space-x-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <FiStar 
                    key={i} 
                    className={`w-3 h-3 sm:w-4 sm:h-4 ${
                      i < Math.floor(task.employerRating || 5) 
                        ? 'text-black dark:text-white fill-current' 
                        : 'text-gray-300 dark:text-gray-700'
                    }`} 
                  />
                ))}
              </div>
              <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">
                {task.employerRating || 5.0}
              </span>
            </div>
          </div>
        </div>
        
        {/* Bottom Info */}
        <div className="flex items-center justify-between pt-3 sm:pt-4 lg:pt-6 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center space-x-3 sm:space-x-4 lg:space-x-6">
            <div className="flex items-center space-x-1 sm:space-x-2">
              <div className="p-1 sm:p-2 bg-green-100 dark:bg-green-900 rounded-lg sm:rounded-xl">
                <FiDollarSign className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-sm sm:text-base lg:text-xl font-bold text-black dark:text-white font-mono">
                {formatPrice(task.price)}
              </span>
            </div>
            
            <div className="flex items-center space-x-1 sm:space-x-2">
              <div className="p-1 sm:p-2 bg-orange-100 dark:bg-orange-900 rounded-lg sm:rounded-xl">
                <FiClock className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <span className="text-xs sm:text-sm lg:text-base text-gray-700 dark:text-gray-300 font-medium">
                {getTimeLeft(task.deadlineAt)}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4 text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-1">
              <FiEye className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm font-medium">{task.viewCount || 0}</span>
            </div>
            
            <div className="flex items-center space-x-1">
              <FiUsers className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm font-medium">{task.applicationCount || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Элегантная панель фильтров
const FiltersPanel = ({ 
  filters, 
  onFiltersChange, 
  categories, 
  isOpen, 
  onToggle 
}: {
  filters: MicroTaskFilters;
  onFiltersChange: (filters: MicroTaskFilters) => void;
  categories: MicroTaskCategory[];
  isOpen: boolean;
  onToggle: () => void;
}) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0, height: 0, y: -20 }}
        animate={{ opacity: 1, height: 'auto', y: 0 }}
        exit={{ opacity: 0, height: 0, y: -20 }}
        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="bg-white/95 dark:bg-black/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl border border-gray-200/50 dark:border-gray-800/50 mb-4 sm:mb-6 lg:mb-8 overflow-hidden"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {/* Category Filter */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-black dark:text-white mb-2 sm:mb-3 uppercase tracking-wider">
              Категория
            </label>
            <select
              value={filters.category || ''}
              onChange={(e) => onFiltersChange({ 
                ...filters, 
                category: e.target.value as MicroTaskCategory || undefined 
              })}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white dark:bg-black border-2 border-gray-200 dark:border-gray-800 rounded-xl sm:rounded-2xl focus:border-black dark:focus:border-white transition-all duration-300 font-medium text-sm sm:text-base"
            >
              <option value="">Все категории</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          
          {/* Max Price Filter */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-black dark:text-white mb-2 sm:mb-3 uppercase tracking-wider">
              Максимальная цена
            </label>
            <input
              type="number"
              value={filters.maxPrice || ''}
              onChange={(e) => onFiltersChange({ 
                ...filters, 
                maxPrice: e.target.value ? Number(e.target.value) : undefined 
              })}
              placeholder="Любая"
              className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white dark:bg-black border-2 border-gray-200 dark:border-gray-800 rounded-xl sm:rounded-2xl focus:border-black dark:focus:border-white transition-all duration-300 font-medium text-sm sm:text-base"
            />
          </div>
          
          {/* Deadline Filter */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-black dark:text-white mb-2 sm:mb-3 uppercase tracking-wider">
              Дедлайн в течение
            </label>
            <select
              value={filters.deadlineWithin || ''}
              onChange={(e) => onFiltersChange({ 
                ...filters, 
                deadlineWithin: e.target.value ? Number(e.target.value) : undefined 
              })}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white dark:bg-black border-2 border-gray-200 dark:border-gray-800 rounded-xl sm:rounded-2xl focus:border-black dark:focus:border-white transition-all duration-300 font-medium text-sm sm:text-base"
            >
              <option value="">Любой срок</option>
              <option value="24">24 часа</option>
              <option value="72">3 дня</option>
              <option value="168">1 неделя</option>
              <option value="336">2 недели</option>
            </select>
          </div>
          
          {/* Status Filter */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-black dark:text-white mb-2 sm:mb-3 uppercase tracking-wider">
              Статус
            </label>
            <select
              value={filters.status || ''}
              onChange={(e) => onFiltersChange({ 
                ...filters, 
                status: e.target.value as MicroTaskStatus || undefined 
              })}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white dark:bg-black border-2 border-gray-200 dark:border-gray-800 rounded-xl sm:rounded-2xl focus:border-black dark:focus:border-white transition-all duration-300 font-medium text-sm sm:text-base"
            >
              <option value="">Все статусы</option>
              <option value="open">Открытые</option>
              <option value="in_progress">В работе</option>
              <option value="completed">Завершенные</option>
            </select>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-end mt-4 sm:mt-6 lg:mt-8 space-y-2 sm:space-y-0 sm:space-x-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onFiltersChange({})}
            className="px-6 sm:px-8 py-2 sm:py-3 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors duration-300 font-medium text-sm sm:text-base"
          >
            Сбросить
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onToggle}
            className="px-6 sm:px-8 py-2 sm:py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl sm:rounded-2xl hover:bg-gray-800 dark:hover:bg-gray-200 transition-all duration-300 font-bold shadow-lg text-sm sm:text-base"
          >
            Применить
          </motion.button>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

// Главный компонент
const MicroTasksPage: React.FC = () => {
  const { user, userData } = useAuth();
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  
  // Анимации на основе скролла
  const heroY = useTransform(scrollY, [0, 300], [0, 100]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 300], [1, 0.8]);
  
  // Состояние
  const [tasks, setTasks] = useState<MicroTask[]>(mockTasks);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<MicroTaskCategory | ''>('');
  const [filters, setFilters] = useState<MicroTaskFilters>({ onlyOpen: true });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'price_low' | 'price_high' | 'deadline'>('newest');

  // Категории
  const categories: MicroTaskCategory[] = [
    'design', 'copywriting', 'notion', 'development', 'marketing', 
    'video', 'audio', 'photo', 'mobile', 'web'
  ];

  // Загрузка данных
  useEffect(() => {
    // Используем мок данные вместо API
    setTasks(mockTasks);
  }, [filters]);
  
  const loadTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Имитация загрузки
      await new Promise(resolve => setTimeout(resolve, 1000));
      setTasks(mockTasks);
    } catch (err) {
      console.error('Ошибка при загрузке заданий:', err);
      setError('Не удалось загрузить задания');
    } finally {
      setLoading(false);
    }
  };
  
  // Фильтрация задач
  const filteredTasks = tasks
    .filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || task.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'price_low':
          return a.price - b.price;
        case 'price_high':
          return b.price - a.price;
        case 'deadline':
          return new Date(a.deadlineAt).getTime() - new Date(b.deadlineAt).getTime();
        default:
          return 0;
      }
    });

  const handleTaskClick = (taskId: string) => {
    navigate(`/microtasks/${taskId}`);
  };
  
  const isEmployer = userData?.role === 'employer' || userData?.role === 'business' || userData?.role === 'admin';
  
  // Статистика
  const stats = {
    totalTasks: tasks.length,
    averagePrice: tasks.length > 0 ? Math.round(tasks.reduce((sum, t) => sum + t.price, 0) / tasks.length) : 0,
    completedToday: tasks.filter(t => t.status === 'completed' && 
      new Date(t.updatedAt || t.createdAt).toDateString() === new Date().toDateString()).length,
    activeUsers: Math.floor(Math.random() * 1000) + 500
  };
  
  return (
    <div className="min-h-screen bg-white dark:bg-black relative overflow-hidden">
      <AnimatedBackground />
      
      {/* Hero Section */}
      <motion.section 
        style={{ y: heroY, opacity: heroOpacity, scale: heroScale }}
        className="relative pt-20 sm:pt-24 lg:pt-32 pb-12 sm:pb-16 lg:pb-20 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="mb-8 sm:mb-10 lg:mb-12"
          >
            <motion.div
              variants={floatingVariants}
              animate="animate"
              className="inline-block mb-4 sm:mb-6 lg:mb-8"
            >
              <motion.div
                variants={glowVariants}
                animate="animate"
                className="w-16 h-16 sm:w-24 sm:h-24 lg:w-32 lg:h-32 bg-black dark:bg-white rounded-full flex items-center justify-center shadow-2xl border-2 sm:border-4 border-gray-200 dark:border-gray-800"
              >
                <FiZap className="w-8 h-8 sm:w-12 sm:h-12 lg:w-16 lg:h-16 text-white dark:text-black" />
              </motion.div>
            </motion.div>
            
            <motion.h1 
              className="text-4xl sm:text-6xl lg:text-7xl xl:text-9xl text-black dark:text-white mb-4 sm:mb-6 lg:mb-8 leading-none"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <span className="font-thin">МИКРО</span>
              <br />
              <span className="font-black">ЗАДАНИЯ</span>
            </motion.h1>
            
            <motion.p 
              className="text-base sm:text-xl lg:text-2xl xl:text-3xl text-gray-600 dark:text-gray-400 mb-8 sm:mb-10 lg:mb-12 max-w-4xl mx-auto font-light leading-relaxed px-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Элегантные проекты. Мгновенная оплата. 
              <br />
              <span className="font-bold text-black dark:text-white">Профессиональный подход к каждой задаче.</span>
            </motion.p>
            
            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mb-8 sm:mb-12 lg:mb-16"
            >
          {isEmployer && (
                <motion.button
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/microtasks/create')}
                  className="group w-full sm:w-auto px-8 sm:px-10 lg:px-12 py-4 sm:py-5 lg:py-6 bg-black dark:bg-white text-white dark:text-black rounded-full font-bold text-sm sm:text-base lg:text-lg shadow-2xl hover:shadow-3xl transition-all duration-500 flex items-center justify-center space-x-2 sm:space-x-3 border-4 border-transparent hover:border-gray-300 dark:hover:border-gray-700"
                >
                  <FiPlus className="w-5 h-5 sm:w-6 sm:h-6 group-hover:rotate-90 transition-transform duration-300" />
                  <span>СОЗДАТЬ ЗАДАНИЕ</span>
                </motion.button>
              )}
              
              <motion.button
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/microtasks/dashboard')}
                className="group w-full sm:w-auto px-8 sm:px-10 lg:px-12 py-4 sm:py-5 lg:py-6 bg-white dark:bg-black text-black dark:text-white rounded-full font-bold text-sm sm:text-base lg:text-lg shadow-2xl hover:shadow-3xl transition-all duration-500 flex items-center justify-center space-x-2 sm:space-x-3 border-4 border-black dark:border-white hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black"
              >
                <FiActivity className="w-5 h-5 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform duration-300" />
                <span>МОИ ЗАДАНИЯ</span>
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Статистика */}
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="relative px-4 sm:px-6 lg:px-8 mb-8 sm:mb-12 lg:mb-16"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8"
          >
            <StatsCard
              icon={FiTarget}
              value={stats.totalTasks.toString()}
              label="Активных заданий"
              trend={{ value: "+12%", isPositive: true }}
            />
            <StatsCard
              icon={FiDollarSign}
              value={`${stats.averagePrice.toLocaleString()} ₸`}
              label="Средняя цена"
              trend={{ value: "+5%", isPositive: true }}
            />
            <StatsCard
              icon={FiCheckCircle}
              value={stats.completedToday.toString()}
              label="Завершено сегодня"
            />
            <StatsCard
              icon={FiUsers}
              value={stats.activeUsers.toString()}
              label="Активных пользователей"
              trend={{ value: "+8%", isPositive: true }}
            />
          </motion.div>
        </div>
      </motion.section>

      {/* Поиск и фильтры */}
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="relative px-4 sm:px-6 lg:px-8 mb-6 sm:mb-8 lg:mb-12"
      >
        <div className="max-w-7xl mx-auto">
          {/* Поисковая строка */}
          <div className="bg-white/95 dark:bg-black/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl border border-gray-200/50 dark:border-gray-800/50 mb-4 sm:mb-6 lg:mb-8">
            <div className="flex flex-col gap-4 sm:gap-6">
              <div className="relative">
                <FiSearch className="absolute left-4 sm:left-6 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 sm:w-6 sm:h-6" />
                <input
                  type="text"
              placeholder="Поиск заданий..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 sm:pl-16 pr-4 sm:pr-6 py-3 sm:py-4 bg-white dark:bg-black border-2 border-gray-200 dark:border-gray-800 rounded-xl sm:rounded-2xl focus:border-black dark:focus:border-white transition-all duration-300 text-base sm:text-lg font-medium"
                />
              </div>
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as MicroTaskCategory | '')}
                  className="flex-1 px-4 sm:px-6 py-3 sm:py-4 bg-white dark:bg-black border-2 border-gray-200 dark:border-gray-800 rounded-xl sm:rounded-2xl focus:border-black dark:focus:border-white transition-all duration-300 font-medium text-sm sm:text-base"
                >
                  <option value="">Все категории</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="flex-1 px-4 sm:px-6 py-3 sm:py-4 bg-white dark:bg-black border-2 border-gray-200 dark:border-gray-800 rounded-xl sm:rounded-2xl focus:border-black dark:focus:border-white transition-all duration-300 font-medium text-sm sm:text-base"
                >
                  <option value="newest">Новые</option>
                  <option value="price_low">Цена ↑</option>
                  <option value="price_high">Цена ↓</option>
                  <option value="deadline">Дедлайн</option>
                </select>
                
                <div className="flex items-center gap-2 sm:gap-3">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowFilters(!showFilters)}
                    className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 transition-all duration-300 ${
                      showFilters 
                        ? 'bg-black dark:bg-white border-black dark:border-white text-white dark:text-black' 
                        : 'border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white'
                    }`}
                  >
                    <FiFilter className="w-5 h-5 sm:w-6 sm:h-6" />
                  </motion.button>
                  
                  <div className="flex bg-gray-100 dark:bg-gray-900 rounded-xl sm:rounded-2xl p-1 sm:p-2 border-2 border-gray-200 dark:border-gray-800">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setViewMode('grid')}
                      className={`p-2 sm:p-3 rounded-lg sm:rounded-xl transition-all duration-300 ${
                        viewMode === 'grid' 
                          ? 'bg-black dark:bg-white text-white dark:text-black shadow-lg' 
                          : 'text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white'
                      }`}
                    >
                      <FiGrid className="w-5 h-5 sm:w-6 sm:h-6" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setViewMode('list')}
                      className={`p-2 sm:p-3 rounded-lg sm:rounded-xl transition-all duration-300 ${
                        viewMode === 'list' 
                          ? 'bg-black dark:bg-white text-white dark:text-black shadow-lg' 
                          : 'text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white'
                      }`}
                    >
                      <FiList className="w-5 h-5 sm:w-6 sm:h-6" />
                    </motion.button>
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 180 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={loadTasks}
                    className="p-3 sm:p-4 bg-black dark:bg-white text-white dark:text-black rounded-xl sm:rounded-2xl hover:bg-gray-800 dark:hover:bg-gray-200 transition-all duration-300 shadow-lg"
                  >
                    <FiRefreshCw className="w-5 h-5 sm:w-6 sm:h-6" />
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Панель фильтров */}
          <FiltersPanel
            filters={filters}
            onFiltersChange={setFilters}
            categories={categories}
            isOpen={showFilters}
            onToggle={() => setShowFilters(!showFilters)}
          />
        </div>
      </motion.section>

      {/* Список заданий */}
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.7 }}
        className="relative px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24 lg:pb-32"
      >
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16 sm:py-24 lg:py-32">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-black dark:border-white border-t-transparent rounded-full"
              />
            </div>
          ) : error ? (
            <div className="text-center py-16 sm:py-24 lg:py-32">
              <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 lg:mb-8 border-4 border-red-200 dark:border-red-800">
                <FiZap className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-black dark:text-white mb-2 sm:mb-3 lg:mb-4">
                ОШИБКА ЗАГРУЗКИ
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4 sm:mb-6 lg:mb-8 text-sm sm:text-base lg:text-lg">{error}</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={loadTasks}
                className="px-6 sm:px-8 py-3 sm:py-4 bg-black dark:bg-white text-white dark:text-black rounded-xl sm:rounded-2xl hover:bg-gray-800 dark:hover:bg-gray-200 transition-all duration-300 font-bold shadow-lg text-sm sm:text-base"
              >
                ПОПРОБОВАТЬ СНОВА
              </motion.button>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="text-center py-16 sm:py-24 lg:py-32">
              <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gray-100 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 lg:mb-8 border-4 border-gray-200 dark:border-gray-800">
                <FiSearch className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-gray-400" />
              </div>
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-black dark:text-white mb-2 sm:mb-3 lg:mb-4">
                ЗАДАНИЯ НЕ НАЙДЕНЫ
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4 sm:mb-6 lg:mb-8 text-sm sm:text-base lg:text-lg">
                Попробуйте изменить параметры поиска или создайте новое задание
              </p>
              {isEmployer && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/microtasks/create')}
                  className="px-6 sm:px-8 py-3 sm:py-4 bg-black dark:bg-white text-white dark:text-black rounded-xl sm:rounded-2xl hover:bg-gray-800 dark:hover:bg-gray-200 transition-all duration-300 font-bold shadow-lg text-sm sm:text-base"
                >
                  СОЗДАТЬ ЗАДАНИЕ
                </motion.button>
              )}
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className={`grid gap-4 sm:gap-6 lg:gap-8 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
                  : 'grid-cols-1'
              }`}
            >
              {filteredTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onTaskClick={handleTaskClick}
                />
              ))}
            </motion.div>
          )}
        </div>
      </motion.section>
    </div>
  );
};

export default MicroTasksPage; 