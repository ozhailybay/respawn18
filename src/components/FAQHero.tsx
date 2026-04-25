import React from 'react';
import { motion } from 'framer-motion';
import { FiHelpCircle, FiUsers } from 'react-icons/fi';

const FAQHero: React.FC = () => {
  return (
    <motion.div 
      className="relative py-16 md:py-24 overflow-hidden bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Декоративные элементы */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <motion.div 
          className="absolute top-0 right-0 w-64 h-64 bg-black dark:bg-white rounded-full filter blur-3xl opacity-5 dark:opacity-10"
          animate={{ 
            scale: [1, 1.1, 1],
            x: [0, 10, 0],
            y: [0, -10, 0],
          }}
          transition={{ 
            duration: 10, 
            repeat: Infinity,
            repeatType: "reverse" 
          }}
        />
        <motion.div 
          className="absolute bottom-0 left-0 w-80 h-80 bg-gray-800 dark:bg-gray-200 rounded-full filter blur-3xl opacity-5 dark:opacity-10"
          animate={{ 
            scale: [1, 1.2, 1],
            x: [0, -10, 0],
            y: [0, 15, 0],
          }}
          transition={{ 
            duration: 12, 
            repeat: Infinity,
            repeatType: "reverse",
            delay: 1
          }}
        />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center mb-6"
          >
            <span className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-black dark:bg-white shadow-lg text-white dark:text-black border border-gray-200 dark:border-gray-800">
              <FiHelpCircle className="w-8 h-8" />
            </span>
          </motion.div>
          
          <motion.h1
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-5xl text-center mb-4 tracking-tight text-black dark:text-white"
          >
            <span className="font-thin">Часто задаваемые</span> <span className="font-bold">вопросы</span>
          </motion.h1>
          
          <motion.p
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-gray-600 dark:text-gray-300 mb-8 font-light"
          >
            Все, что вам нужно знать для эффективного использования платформы
          </motion.p>
          
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex justify-center mb-12"
          >
            <div className="flex items-center bg-white dark:bg-black py-2 px-4 rounded-full shadow-md border border-gray-200 dark:border-gray-800">
              <FiUsers className="mr-2 text-black dark:text-white" />
              <span className="text-sm font-light text-gray-600 dark:text-gray-300">
                Уже помогли 50,000+ пользователям
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default FAQHero; 