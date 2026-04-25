import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  accentColor?: string;
  animate?: boolean;
  className?: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ 
  icon, 
  title, 
  description, 
  accentColor = 'black',
  animate = false,
  className = ''
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const cardAnimation = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    hover: { y: -5, transition: { duration: 0.3 } }
  };
  
  const iconAnimation = {
    hover: { scale: 1.1, rotate: 5 }
  };
  
  const gradientAnimation = {
    hover: { 
      backgroundPosition: '200% 0',
      transition: { duration: 0.8 }
    }
  };
  
  const getCardStyle = () => {
    return `p-6 rounded-xl bg-white dark:bg-black border-2 border-gray-200 dark:border-gray-700 
            hover:border-black dark:hover:border-white transition-all duration-300 
            shadow-sm hover:shadow-lg ${className}`;
  };
  
  return (
    <motion.div
      className={getCardStyle()}
      initial="initial"
      animate={animate ? "animate" : "initial"}
      whileHover="hover"
      variants={cardAnimation}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <div className="flex items-start">
        <motion.div 
          className="flex-shrink-0 mr-4"
          variants={iconAnimation}
        >
          <motion.div 
            className="w-12 h-12 rounded-xl flex items-center justify-center bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
            variants={gradientAnimation}
          >
            <div className="text-black dark:text-white">
              {icon}
            </div>
          </motion.div>
        </motion.div>
        <div>
          <motion.h3 
            className="text-lg font-semibold text-black dark:text-white mb-2"
            animate={isHovered ? { color: '#000' } : {}}
            transition={{ duration: 0.3 }}
          >
            {title}
          </motion.h3>
          <motion.p 
            className="text-gray-600 dark:text-gray-400"
            initial={{ opacity: 0.9 }}
            animate={isHovered ? { opacity: 1 } : { opacity: 0.9 }}
          >
            {description}
          </motion.p>
          
          {/* Индикатор действия при наведении */}
          <motion.div 
            className="h-0.5 bg-black dark:bg-white mt-3 rounded-full"
            initial={{ width: 0 }}
            animate={isHovered ? { width: '100%' } : { width: 0 }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default FeatureCard; 