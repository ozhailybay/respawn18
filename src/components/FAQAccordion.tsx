import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronDown, FiThumbsUp, FiBookmark, FiShare2, FiCheckCircle, FiList, FiBarChart2 } from 'react-icons/fi';


export interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category: 'profile' | 'resume' | 'job' | 'general' | 'career' | 'technical' | 'ai';
  helpfulCount?: number;
  isBookmarked?: boolean;
}

interface FAQAccordionProps {
  items: FAQItem[];
  activeCategory: string;
}

const FAQAccordion: React.FC<FAQAccordionProps> = ({ items, activeCategory }) => {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [helpfulItems, setHelpfulItems] = useState<Record<number, boolean>>({});
  const [bookmarkedItems, setBookmarkedItems] = useState<Record<number, boolean>>({});
  
  
  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };
  
  
  const markAsHelpful = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setHelpfulItems({
      ...helpfulItems,
      [id]: !helpfulItems[id]
    });
  };
  
  // Добавить в закладки
  const toggleBookmark = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setBookmarkedItems({
      ...bookmarkedItems,
      [id]: !bookmarkedItems[id]
    });
  };
  
  // Поделиться
  const shareItem = (id: number, question: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: 'Respawn FAQ',
        text: question,
        url: window.location.href + '#faq-' + id
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href + '#faq-' + id)
        .then(() => alert('Ссылка скопирована в буфер обмена'))
        .catch(console.error);
    }
  };

  // Форматирование ответа для лучшей читабельности
  const formatAnswer = (answer: string) => {
    // Проверяем, содержит ли ответ нумерованные шаги (1), 2), и т.д.)
    const hasNumberedSteps = /\d+\)/.test(answer);
    
    if (hasNumberedSteps) {
      
      const parts = answer.split(/(\d+\))/).filter(Boolean);
      
      
      let intro = '';
      let stepsStart = 0;
      
      if (!parts[0].trim().match(/^\d+\)/)) {
        intro = parts[0];
        stepsStart = 1;
      }
      
      
      const steps = [];
      for (let i = stepsStart; i < parts.length; i += 2) {
        if (i + 1 < parts.length) {
          steps.push({
            number: parts[i].trim(),
            content: parts[i + 1].trim()
          });
        }
      }
      
      return (
        <div className="space-y-4">
          {intro && <p className="leading-relaxed text-gray-700 dark:text-gray-300 font-light">{intro}</p>}
          
          <div className="space-y-3 mt-2">
            {steps.map((step, index) => (
              <div key={index} className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mr-3 mt-1 border border-gray-200 dark:border-gray-700">
                  <span className="text-black dark:text-white font-light text-sm">{index + 1}</span>
                </div>
                <div className="flex-1">
                  <p className="text-gray-800 dark:text-gray-200 font-light">{step.content}</p>
                </div>
              </div>
            ))}
          </div>
          
          
          {answer.includes('статистика показывает') && (
            <div className="mt-4 bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <FiBarChart2 className="text-black dark:text-white mr-2" />
                <span className="text-black dark:text-white font-light">Статистика</span>
              </div>
              <p className="text-gray-700 dark:text-gray-300 mt-1 text-sm font-light">
                {answer.split('статистика показывает')[1].trim()}
              </p>
            </div>
          )}
        </div>
      );
    } else {
      
      const sentences = answer.split('.').filter(s => s.trim().length > 0);
      
      if (sentences.length > 3) {
        return (
          <div className="space-y-4">
            <p className="leading-relaxed text-gray-700 dark:text-gray-300 font-light">{sentences[0]}.</p>
            
            <div className="ml-2 space-y-2 border-l-2 border-gray-200 dark:border-gray-700 pl-4">
              {sentences.slice(1, -1).map((sentence, index) => (
                <p key={index} className="text-gray-700 dark:text-gray-300 font-light">{sentence.trim()}.</p>
              ))}
            </div>
            
            {sentences.length > 1 && (
              <p className="text-gray-700 dark:text-gray-300 font-light">{sentences[sentences.length - 1].trim()}.</p>
            )}
          </div>
        );
      } else {
        return <p className="leading-relaxed text-gray-700 dark:text-gray-300 font-light">{answer}</p>;
      }
    }
  };
  
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300 }
    }
  };
  
  return (
    <motion.div 
      className="space-y-6"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { staggerChildren: 0.1 }
        }
      }}
    >
      <AnimatePresence>
        {items.map(item => (
          <motion.div
            id={`faq-${item.id}`}
            key={item.id}
            variants={itemVariants}
            className="bg-white dark:bg-black rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-300"
            whileHover={{ scale: 1.01 }}
          >
            <button
              className="w-full px-6 py-5 text-left flex justify-between items-center focus:outline-none"
              onClick={() => toggleExpand(item.id)}
            >
              <span className="text-lg font-light text-black dark:text-white">
                {item.question}
              </span>
              <motion.div
                animate={{ rotate: expandedId === item.id ? 180 : 0 }}
                transition={{ duration: 0.3 }}
                className="w-8 h-8 flex-shrink-0 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-black dark:text-white border border-gray-200 dark:border-gray-700"
              >
                <FiChevronDown />
              </motion.div>
            </button>
            
            <AnimatePresence>
              {expandedId === item.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-5 text-gray-700 dark:text-gray-300 border-t border-gray-200 dark:border-gray-800">
                    <div className="pt-4">
                      {formatAnswer(item.answer)}
                    </div>
                    
                    <div className="mt-6 flex justify-between items-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-light border ${
                        item.category === 'profile' ? 'bg-gray-100 dark:bg-gray-800 text-black dark:text-white border-gray-200 dark:border-gray-700' :
                        item.category === 'resume' ? 'bg-gray-100 dark:bg-gray-800 text-black dark:text-white border-gray-200 dark:border-gray-700' :
                        item.category === 'job' ? 'bg-gray-100 dark:bg-gray-800 text-black dark:text-white border-gray-200 dark:border-gray-700' :
                        item.category === 'career' ? 'bg-gray-100 dark:bg-gray-800 text-black dark:text-white border-gray-200 dark:border-gray-700' :
                        item.category === 'technical' ? 'bg-gray-100 dark:bg-gray-800 text-black dark:text-white border-gray-200 dark:border-gray-700' :
                        item.category === 'ai' ? 'bg-gray-100 dark:bg-gray-800 text-black dark:text-white border-gray-200 dark:border-gray-700' :
                        'bg-gray-100 dark:bg-gray-800 text-black dark:text-white border-gray-200 dark:border-gray-700'
                      }`}>
                        {item.category === 'profile' ? 'Профиль' :
                         item.category === 'resume' ? 'Резюме' :
                         item.category === 'job' ? 'Поиск работы' :
                         item.category === 'career' ? 'Карьера' :
                         item.category === 'technical' ? 'Техническое' :
                         item.category === 'ai' ? 'ИИ и технологии' :
                         'Общие вопросы'}
                      </span>
                      
                      <div className="flex items-center gap-2">
                        <button 
                          className={`text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white flex items-center gap-1 transition-colors ${
                            helpfulItems[item.id] ? 'text-black dark:text-white' : ''
                          }`}
                          onClick={(e) => markAsHelpful(item.id, e)}
                        >
                          <FiThumbsUp className="w-4 h-4" />
                          <span className="text-sm font-light">Полезно</span>
                        </button>
                        
                        <button 
                          className={`text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white flex items-center gap-1 transition-colors ${
                            bookmarkedItems[item.id] ? 'text-black dark:text-white' : ''
                          }`}
                          onClick={(e) => toggleBookmark(item.id, e)}
                        >
                          <FiBookmark className="w-4 h-4" />
                        </button>
                        
                        <button 
                          className="text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white flex items-center gap-1 transition-colors"
                          onClick={(e) => shareItem(item.id, item.question, e)}
                        >
                          <FiShare2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
};

export default FAQAccordion; 