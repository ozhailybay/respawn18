import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface Card3DProps {
  children: React.ReactNode;
  className?: string;
  glareIntensity?: number;
  tiltDegree?: number;
  disabled?: boolean;
  background?: string;
  shadow?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}

const Card3D: React.FC<Card3DProps> = ({
  children,
  className = '',
  glareIntensity = 0.4,
  tiltDegree = 15,
  disabled = false,
  background = 'bg-white dark:bg-slate-800',
  shadow = 'shadow-lg',
  onClick,
  style
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  // Обработка движения мыши над карточкой
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled) return;
    
    const element = e.currentTarget;
    const rect = element.getBoundingClientRect();
    
    // Вычисляем позицию мыши относительно карточки
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    
    setMousePosition({ x, y });
  };

  // Вычисляем величину поворота на основе положения мыши
  const rotateX = isHovered ? -mousePosition.y * tiltDegree : 0;
  const rotateY = isHovered ? mousePosition.x * tiltDegree : 0;

  // Вычисляем положение блика на основе положения мыши
  const glareX = mousePosition.x * 100 + 50;
  const glareY = mousePosition.y * 100 + 50;
  
  return (
    <motion.div
      className={`relative overflow-hidden rounded-xl ${background} ${shadow} ${className} ${disabled ? '' : 'cursor-pointer'} will-change-transform`}
      style={{
        perspective: '1000px',
        transformStyle: 'preserve-3d',
        ...style
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => !disabled && setIsHovered(true)}
      onMouseLeave={() => !disabled && setIsHovered(false)}
      onClick={disabled ? undefined : onClick}
      animate={{
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        transition: { type: 'spring', stiffness: 300, damping: 20 }
      }}
    >
      {/* Внутренний контент */}
      <div className="relative z-10">
        {children}
      </div>
      
      {/* Анимированный блик */}
      {!disabled && isHovered && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255, 255, 255, ${glareIntensity}), transparent)`,
            zIndex: 1
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        />
      )}
    </motion.div>
  );
};

export default Card3D; 