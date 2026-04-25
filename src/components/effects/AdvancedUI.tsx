import React, { useState, useRef, useEffect } from 'react';
import { motion, useAnimation, useMotionValue, useTransform, useScroll, useInView } from 'framer-motion';

// Морфинг-кнопка с эффектом перетекания жидкости
export const MorphButton: React.FC<{
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}> = ({ children, className = "", onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.button
      className={`relative py-3 px-6 rounded-full font-medium ${className}`}
      onClick={onClick}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileTap={{ scale: 0.97 }}
    >
      <motion.div 
        className="absolute inset-0 bg-gradient-to-r from-black to-gray-600 dark:from-white dark:to-gray-400 rounded-full -z-10"
        animate={{
          borderRadius: isHovered ? "2rem 1rem 2rem 1rem" : "2rem",
        }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      />
      
      {/* Blob effect on hover */}
      <motion.div
        className="absolute inset-0 -z-20 opacity-0"
        style={{ filter: "blur(20px)" }}
        animate={{ 
          opacity: isHovered ? 0.6 : 0,
          scale: isHovered ? 1.1 : 1
        }}
        transition={{ duration: 0.6 }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black to-gray-600 dark:from-white dark:to-gray-400 rounded-full" />
      </motion.div>
      
      {/* Text with subtle movement */}
      <motion.span
        className="relative z-10 text-white flex items-center justify-center"
        animate={{ 
          y: isHovered ? -2 : 0
        }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.span>
    </motion.button>
  );
};

// Анимированные шары, которые следуют за курсором (для фоновых эффектов)
export const CursorFollower: React.FC = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isActive, setIsActive] = useState(false);
  
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMousePosition({
        x: event.clientX,
        y: event.clientY
      });
      setIsActive(true);
    };
    
    const handleMouseLeave = () => {
      setIsActive(false);
    };
    
    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);
    
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);
  
  // Create multiple followers with different delays
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {isActive && [...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-32 h-32 rounded-full mix-blend-screen pointer-events-none"
          style={{
            background: i === 0 
              ? "radial-gradient(circle, rgba(79, 70, 229, 0.4) 0%, transparent 70%)" 
              : i === 1 
                ? "radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%)" 
                : "radial-gradient(circle, rgba(236, 72, 153, 0.2) 0%, transparent 70%)",
            filter: "blur(10px)",
          }}
          animate={{
            x: mousePosition.x - 64,
            y: mousePosition.y - 64,
          }}
          transition={{
            type: "spring",
            damping: 20,
            stiffness: 200,
            mass: i + 1,
            delay: i * 0.05
          }}
        />
      ))}
    </div>
  );
};

// Анимированный карточка с эффектом скретч-карты
export const ScratchRevealCard: React.FC<{
  revealContent: React.ReactNode;
  coverContent: React.ReactNode;
  className?: string;
}> = ({ revealContent, coverContent, className = "" }) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const controls = useAnimation();
  
  const handleReveal = () => {
    controls.start({
      clipPath: ["inset(0% 0% 0% 0%)", "inset(0% 0% 100% 0%)"],
      transition: { duration: 0.7, ease: "easeInOut" }
    });
    setTimeout(() => setIsRevealed(true), 500);
  };
  
  return (
    <div className={`relative overflow-hidden rounded-xl ${className}`}>
      {/* Reveal content (shown after animation) */}
      <div className="absolute inset-0 z-10">
        {revealContent}
      </div>
      
      {/* Cover that gets animated away */}
      {!isRevealed && (
        <motion.div 
          className="relative z-20 h-full"
          animate={controls}
          onClick={handleReveal}
        >
          {coverContent}
          <div className="absolute inset-0 flex items-center justify-center text-slate-300 font-medium pointer-events-none">
            <motion.div
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Нажмите чтобы раскрыть
            </motion.div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

// Компонент для появления элементов при скролле с более выразительной анимацией
export const ScrollReveal: React.FC<{
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  duration?: number;
  distance?: number;
  once?: boolean;
  rootMargin?: string;
}> = ({
  children,
  className = "",
  delay = 0,
  direction = 'up',
  duration = 0.6,
  distance = 50,
  once = true,
  rootMargin = "-100px",
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, margin: rootMargin });
  const controls = useAnimation();
  
  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    } else if (!once) {
      controls.start("hidden");
    }
  }, [isInView, controls, once]);
  
  // Determine the initial and target positions based on direction
  const getDirectionalProperties = () => {
    switch (direction) {
      case 'up':
        return { y: [distance, 0] };
      case 'down':
        return { y: [-distance, 0] };
      case 'left':
        return { x: [distance, 0] };
      case 'right':
        return { x: [-distance, 0] };
      case 'none':
        return { scale: [0.9, 1] };
      default:
        return { y: [distance, 0] };
    }
  };
  
  return (
    <div ref={ref} className={className}>
      <motion.div
        initial={{ opacity: 0, ...getDirectionalProperties() }}
        animate={controls}
        variants={{
          hidden: { opacity: 0, ...getDirectionalProperties() },
          visible: {
            opacity: 1,
            ...(direction === 'up' ? { y: 0 } : 
               direction === 'down' ? { y: 0 } : 
               direction === 'left' ? { x: 0 } : 
               direction === 'right' ? { x: 0 } : 
               { scale: 1 }),
            transition: {
              duration,
              delay,
              ease: [0.25, 0.1, 0.25, 1.0], // cubic-bezier(.25,.1,.25,1)
            },
          },
        }}
      >
        {children}
      </motion.div>
    </div>
  );
};

// Скролл-прогресс индикатор
export const ScrollProgress: React.FC = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);
  
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-indigo-600 origin-left z-50"
      style={{ scaleX, transformOrigin: "0%" }}
    />
  );
};

// Компонент для магнитной кнопки, которая притягивается к курсору
export const MagneticButton: React.FC<{
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  strength?: number;
}> = ({
  children,
  className = "",
  onClick,
  strength = 50
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!buttonRef.current) return;
    
    const rect = buttonRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Calculate distance from cursor to center
    const distanceX = e.clientX - centerX;
    const distanceY = e.clientY - centerY;
    
    // Set position with magnetic effect
    setPosition({ 
      x: distanceX / strength, 
      y: distanceY / strength 
    });
  };
  
  const handleMouseLeave = () => {
    // Reset position when mouse leaves
    setPosition({ x: 0, y: 0 });
  };
  
  return (
    <motion.button
      ref={buttonRef}
      className={`relative ${className}`}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", damping: 10, stiffness: 200 }}
      whileTap={{ scale: 0.95 }}
    >
      {children}
    </motion.button>
  );
};

// Компонент с эффектом блестящего градиента
export const ShimmerButton: React.FC<{
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}> = ({ children, className = "", onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`relative overflow-hidden rounded-lg px-6 py-3 group ${className}`}
    >
      {/* Основной фон */}
      <div className="absolute inset-0 bg-gradient-to-r from-black to-gray-600 dark:from-white dark:to-gray-400 z-10"></div>
      
      {/* Эффект блеска */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 z-20">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-600 to-black dark:from-gray-400 dark:to-white"></div>
        <motion.div
          className="absolute top-0 bottom-0 w-1/3 -left-full bg-gradient-to-r from-transparent via-white/30 dark:via-black/30 to-transparent skew-x-12"
          animate={{ left: ["0%", "200%"] }}
          transition={{ 
            repeat: Infinity, 
            repeatDelay: 1,
            duration: 2, 
            ease: "easeInOut" 
          }}
        ></motion.div>
      </div>
      
      {/* Контент */}
      <div className="relative z-30 text-white font-medium">
        {children}
      </div>
    </button>
  );
};

// Ripple эффект для элементов
export const RippleEffect: React.FC<{
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  color?: string;
}> = ({ children, className = "", onClick, color = "rgba(255, 255, 255, 0.5)" }) => {
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; size: number; id: number }>>([]);
  const nextId = useRef(0);
  
  const addRipple = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    const newRipple = {
      x,
      y,
      size,
      id: nextId.current
    };
    
    nextId.current += 1;
    setRipples([...ripples, newRipple]);
    
    // Trigger onClick if provided
    if (onClick) onClick();
  };
  
  // Remove ripple after animation completes
  const removeRipple = (id: number) => {
    setRipples(ripples.filter(ripple => ripple.id !== id));
  };
  
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      onClick={addRipple}
    >
      {ripples.map(ripple => (
        <motion.div
          key={ripple.id}
          className="absolute rounded-full"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: ripple.size,
            height: ripple.size,
            background: color,
          }}
          initial={{ transform: "scale(0)", opacity: 0.8 }}
          animate={{ transform: "scale(1)", opacity: 0 }}
          transition={{ duration: 0.8 }}
          onAnimationComplete={() => removeRipple(ripple.id)}
        />
      ))}
      {children}
    </div>
  );
};

export default { 
  MorphButton, 
  CursorFollower, 
  ScratchRevealCard, 
  ScrollReveal,
  ScrollProgress,
  MagneticButton,
  ShimmerButton,
  RippleEffect
}; 