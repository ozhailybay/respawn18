import React from 'react';
import { motion } from 'framer-motion';
import { BsStars } from 'react-icons/bs';

const ChatHeader = () => {
  const pulseVariants = {
    animate: {
      scale: [1, 1.05, 1],
      opacity: [0.5, 1, 0.5],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const magneticVariants = {
    hover: {
      scale: 1.1,
      rotate: 360,
      transition: {
        duration: 0.6,
        ease: "easeInOut"
      }
    }
  };

  return (
    <motion.div 
      className="bg-black/10 dark:bg-white/10 backdrop-blur-sm p-6 sm:p-8 border-b border-black/20 dark:border-white/20"
      variants={pulseVariants}
      animate="animate"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <motion.div 
            className="w-10 h-10 sm:w-12 sm:h-12 bg-black/10 dark:bg-white/10 rounded-2xl flex items-center justify-center mr-3 sm:mr-4 border border-black/20 dark:border-white/20"
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            variants={magneticVariants}
            whileHover="hover"
          >
            <BsStars className="w-5 h-5 sm:w-6 sm:h-6 text-black dark:text-white" />
          </motion.div>
          <div>
            <h3 className="font-black text-lg sm:text-xl text-black dark:text-white">AI Ментор</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Онлайн • Готов помочь</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-3">
          <motion.div 
            className="w-2 h-2 sm:w-3 sm:h-3 bg-black dark:bg-white rounded-full"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">Активен</span>
        </div>
      </div>
    </motion.div>
  );
};

export default ChatHeader; 