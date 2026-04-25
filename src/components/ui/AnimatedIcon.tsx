import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface AnimatedIconProps {
  icon: React.ReactNode;
  color?: string;
  size?: string;
  className?: string;
  animationType?: 'pulse' | 'bounce' | 'rotate' | 'shake' | 'glow' | 'none';
  gradient?: boolean;
  gradientFrom?: string;
  gradientTo?: string;
  onClick?: () => void;
  iconSize?: string;
  iconColor?: string;
  hoverEffect?: boolean;
  shadow?: boolean;
}

const AnimatedIcon: React.FC<AnimatedIconProps> = ({ 
  icon, 
  color = "bg-blue-500", 
  size = "w-12 h-12",
  className = "",
  animationType = 'none',
  gradient = false,
  gradientFrom = "from-blue-500",
  gradientTo = "to-indigo-600",
  onClick,
  iconSize = "w-6 h-6",
  iconColor = "text-white",
  hoverEffect = true,
  shadow = false
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Определяем анимацию на основе типа
  const getAnimation = () => {
    switch (animationType) {
      case 'pulse':
        return {
          scale: [1, 1.05, 1],
          transition: { 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }
        };
      case 'bounce':
        return {
          y: [0, -8, 0],
          transition: { 
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }
        };
      case 'rotate':
        return {
          rotate: [0, 10, 0, -10, 0],
          transition: { 
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }
        };
      case 'shake':
        return {
          x: [0, 5, -5, 5, 0],
          transition: { 
            duration: 0.5,
            repeat: Infinity,
            repeatDelay: 2,
            ease: "easeInOut"
          }
        };
      case 'glow':
        return {
          boxShadow: [
            '0 0 0 rgba(66, 153, 225, 0.5)',
            '0 0 20px rgba(66, 153, 225, 0.7)',
            '0 0 0 rgba(66, 153, 225, 0.5)'
          ],
          transition: { 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }
        };
      case 'none':
      default:
        return {};
    }
  };
  
  // Определяем стиль фона
  const getBackgroundClass = () => {
    if (gradient) {
      return `bg-gradient-to-br ${gradientFrom} ${gradientTo}`;
    }
    return color;
  };
  
  // Определяем стиль тени
  const getShadowClass = () => {
    if (shadow) {
      return isHovered ? 'shadow-lg' : 'shadow-md';
    }
    return '';
  };
  
  // Анимация для иконки внутри контейнера
  const iconAnimation = {
    initial: { scale: 1, rotate: 0 },
    hover: { 
      scale: 1.2, 
      rotate: 10,
      transition: { duration: 0.3 }
    }
  };
  
  return (
    <motion.div
      className={`${size} rounded-xl ${getBackgroundClass()} flex items-center justify-center ${getShadowClass()} ${className}`}
      whileHover={hoverEffect ? { scale: 1.1, y: -5 } : {}}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        ...getAnimation()
      }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        className={`${iconSize} ${iconColor}`}
        variants={hoverEffect ? iconAnimation : {}}
        initial="initial"
        whileHover="hover"
      >
        {icon}
      </motion.div>
      
      {/* Дополнительный эффект свечения при наведении */}
      {isHovered && (
        <motion.div
          className="absolute inset-0 rounded-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            background: gradient 
              ? `radial-gradient(circle, ${gradientFrom.replace('from-', 'var(--tw-gradient-from)')}, transparent 70%)`
              : `radial-gradient(circle, ${color.replace('bg-', 'var(--tw-gradient-from)')}, transparent 70%)`,
            filter: 'blur(15px)',
            opacity: 0.3,
            zIndex: -1
          }}
        />
      )}
    </motion.div>
  );
};

export default AnimatedIcon; 