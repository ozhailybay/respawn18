import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';

interface GradientWavesProps {
  className?: string;
  colors?: Array<{
    from: string;
    via: string;
    to: string;
  }>;
  duration?: number;
  opacity?: number;
  mobileColors?: number;
}

const GradientWaves: React.FC<GradientWavesProps> = ({
  className = '',
  colors = [
    { from: 'from-black/5', via: 'via-gray-500/5', to: 'to-black/5' },
    { from: 'from-gray-500/5', via: 'via-black/5', to: 'to-gray-500/5' },
    { from: 'from-black/3', via: 'via-gray-400/3', to: 'to-black/3' },
  ],
  duration = 15,
  opacity = 0.1,
  mobileColors = 1
}) => {
  const prefersReducedMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);
  
  // Проверяем размер экрана при монтировании и изменении размера
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Проверка при монтировании
    checkMobile();
    
    // Проверка при изменении размера окна
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Определяем актуальные цвета в зависимости от устройства
  const actualColors = useMemo(() => {
    if (isMobile) {
      return colors.slice(0, mobileColors);
    }
    return colors;
  }, [colors, isMobile, mobileColors]);
  
  // Если пользователь предпочитает уменьшенное движение, показываем статичный градиент
  if (prefersReducedMotion) {
    return (
      <div 
        className={`absolute inset-0 bg-gradient-to-b ${colors[0].from} ${colors[0].via} ${colors[0].to} opacity-${Math.round(opacity * 100)} ${className}`}
      />
    );
  }
  
  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {actualColors.map((color, index) => (
        <motion.div
          key={index}
          className={`absolute inset-0 bg-gradient-to-r ${color.from} ${color.via} ${color.to} opacity-${Math.round(opacity * 100)}`}
          initial={{ y: '100%' }}
          animate={{ 
            y: [
              `${(index + 1) * 50}%`, 
              `${(index) * -30}%`, 
              `${(index + 1) * 50}%`
            ] 
          }}
          transition={{ 
            duration: (isMobile ? duration * 1.5 : duration) + index * 5, 
            ease: 'easeInOut', 
            repeat: Infinity,
            repeatType: 'loop'
          }}
          style={{ 
            filter: `blur(${isMobile ? '30px' : '50px'})`,
            transform: `rotate(${index * 10}deg)`,
            transformOrigin: 'center',
            willChange: 'transform', // Для оптимизации производительности
          }}
        />
      ))}
    </div>
  );
};

export default GradientWaves; 