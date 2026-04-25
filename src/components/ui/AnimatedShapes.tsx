import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';

interface AnimatedShapesProps {
  count?: number;
  colors?: string[];
  className?: string;
  minSize?: number;
  maxSize?: number;
  duration?: number;
  mobileCount?: number;
}

const AnimatedShapes: React.FC<AnimatedShapesProps> = ({
  count = 6,
  mobileCount = 3,
  colors = ['bg-blue-500/10', 'bg-indigo-500/10', 'bg-purple-500/10', 'bg-pink-500/10'],
  className = '',
  minSize = 20,
  maxSize = 80,
  duration = 20,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const [isMounted, setIsMounted] = useState(false);
  
  // Определяем количество форм в зависимости от размера экрана
  const actualCount = useMemo(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768 ? mobileCount : count;
    }
    return count;
  }, [count, mobileCount]);
  
  // Генерируем формы только один раз при монтировании
  const shapes = useMemo(() => {
    if (prefersReducedMotion) return [];
    
    return Array.from({ length: actualCount }, (_, i) => {
      const shape = ['circle', 'square', 'triangle'][Math.floor(Math.random() * 3)] as 'circle' | 'square' | 'triangle';
      const size = Math.floor(Math.random() * (maxSize - minSize)) + minSize;
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const rotate = Math.random() * 360;
      const delay = Math.random() * 5;
      const shapeDuration = duration - 5 + Math.random() * 10;
      
      // Предварительно вычисляем случайные значения для анимации
      const xMovement1 = Math.random() * 100 - 50;
      const xMovement2 = Math.random() * 100 - 50;
      const yMovement1 = Math.random() * 100 - 50;
      const yMovement2 = Math.random() * 100 - 50;
      
      return {
        id: i,
        x,
        y,
        size,
        rotate,
        color,
        shape,
        delay,
        duration: shapeDuration,
        movements: {
          x: [0, xMovement1, xMovement2, 0],
          y: [0, yMovement1, yMovement2, 0],
          rotate: [0, rotate, rotate * 2, rotate * 3, 360],
        }
      };
    });
  }, [actualCount, colors, minSize, maxSize, duration, prefersReducedMotion]);

  // Устанавливаем флаг монтирования только после первого рендера
  useEffect(() => {
    setIsMounted(true);
    
    // Обработчик изменения размера окна для мобильных устройств
    const handleResize = () => {
      // Вместо непосредственного изменения состояния, просто обновляем флаг монтирования
      // для перерендера с новым useMemo
      setIsMounted(prevState => !prevState);
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  if (prefersReducedMotion || shapes.length === 0) {
    return null;
  }

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {shapes.map((shape) => (
        <motion.div
          key={shape.id}
          className={`absolute ${shape.color}`}
          style={{
            width: shape.size,
            height: shape.size,
            borderRadius: shape.shape === 'circle' ? '50%' : shape.shape === 'square' ? '15%' : '0',
            top: `${shape.y}%`,
            left: `${shape.x}%`,
            transformOrigin: 'center',
            zIndex: 0,
            // Уменьшаем интенсивность размытия для улучшения производительности
            backdropFilter: 'blur(3px)',
          }}
          initial={{
            x: 0,
            y: 0,
            rotate: 0, 
            opacity: 0,
            scale: 0.5,
          }}
          animate={{
            x: shape.movements.x,
            y: shape.movements.y,
            rotate: shape.movements.rotate,
            opacity: [0, 0.5, 0.5, 0],
            scale: [0.5, 1, 0.8, 0.5],
          }}
          transition={{
            duration: shape.duration,
            ease: 'easeInOut',
            times: [0, 0.3, 0.7, 1],
            repeat: Infinity,
            delay: shape.delay,
            repeatDelay: 1,
          }}
        >
          {shape.shape === 'triangle' && (
            <div
              className="w-full h-full"
              style={{
                clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)',
              }}
            />
          )}
        </motion.div>
      ))}
    </div>
  );
};

export default AnimatedShapes; 