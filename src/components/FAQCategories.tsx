import React from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiFileText, FiBriefcase, FiHelpCircle, FiTrendingUp, FiCode, FiCpu, FiStar } from 'react-icons/fi';

interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
}

interface FAQCategoriesProps {
  activeCategory: string;
  setActiveCategory: (id: string) => void;
}

const FAQCategories: React.FC<FAQCategoriesProps> = ({ activeCategory, setActiveCategory }) => {
  // Список категорий с иконками
  const categories: Category[] = [
    { 
      id: 'all', 
      name: 'Все вопросы',
      icon: <FiStar />
    },
    { 
      id: 'profile', 
      name: 'Профиль',
      icon: <FiUser />
    },
    { 
      id: 'resume', 
      name: 'Резюме',
      icon: <FiFileText />
    },
    { 
      id: 'job', 
      name: 'Поиск работы',
      icon: <FiBriefcase />
    },
    { 
      id: 'career', 
      name: 'Карьера',
      icon: <FiTrendingUp />
    },
    { 
      id: 'technical', 
      name: 'Техническое',
      icon: <FiCode />
    },
    { 
      id: 'ai', 
      name: 'ИИ и технологии',
      icon: <FiCpu />
    },
    { 
      id: 'general', 
      name: 'Общие вопросы',
      icon: <FiHelpCircle />
    }
  ];
  
  return (
    <div className="overflow-x-auto pb-2 -mx-4 px-4 md:px-0 md:mx-0 snap-x">
      <div className="flex space-x-2 min-w-max">
        {categories.map((category) => (
          <motion.button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`px-4 py-2 rounded-full text-sm font-light transition-all duration-300 snap-start flex items-center gap-2 border ${
              activeCategory === category.id
                ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white shadow-md'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {category.icon}
            {category.name}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default FAQCategories; 