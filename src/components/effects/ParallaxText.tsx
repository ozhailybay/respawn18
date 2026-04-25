import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

interface ParallaxTextProps {
  children: React.ReactNode;
  className?: string;
  baseVelocity?: number;
  direction?: 'left' | 'right';
}

const ParallaxText: React.FC<ParallaxTextProps> = ({ 
  children, 
  className = "", 
  baseVelocity = 5,
  direction = 'left'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });
  
  const springConfig = { damping: 50, stiffness: 400 };
  const smoothProgress = useSpring(scrollYProgress, springConfig);
  
  // Map scroll progress to y-position for parallax effect
  const y = useTransform(
    smoothProgress, 
    [0, 1], 
    direction === 'left' ? [0, -100] : [0, 100]
  );
  
  // Add a subtle rotation based on scroll
  const rotate = useTransform(
    smoothProgress,
    [0, 1],
    [0, direction === 'left' ? -5 : 5]
  );
  
  return (
    <div ref={containerRef} className={`relative overflow-hidden ${className}`}>
      <motion.div
        style={{ y, rotate }}
        className="flex items-center space-x-4"
      >
        {children}
      </motion.div>
    </div>
  );
};

// Компонент для эффекта сияющего текста
export const GlowingText: React.FC<{ text: string; className?: string }> = ({ text, className = "" }) => {
  const words = text.split(' ');
  
  return (
    <h2 className={`text-5xl md:text-7xl font-extrabold ${className}`}>
      {words.map((word, i) => (
        <React.Fragment key={i}>
          <motion.span
            className="inline-block relative"
            whileInView={{ 
              opacity: [0, 1],
              y: [20, 0]
            }}
            viewport={{ once: true }}
            transition={{ 
              duration: 0.8, 
              delay: i * 0.1 + 0.2,
              ease: "easeOut"
            }}
          >
            <span className="relative z-10 bg-clip-text text-transparent bg-gradient-to-r from-black to-gray-600 dark:from-white dark:to-gray-400">
              {word}
            </span>
            <motion.span 
              className="absolute inset-0 blur-xl bg-gradient-to-r from-black/30 to-gray-600/30 dark:from-white/30 dark:to-gray-400/30 opacity-0"
              whileInView={{ 
                opacity: [0, 0.7, 0.4],
                scale: [0.8, 1.1, 1]
              }}
              viewport={{ once: true }}
              transition={{ 
                duration: 2, 
                delay: i * 0.1 + 0.3,
                ease: "easeOut"
              }}
            />
          </motion.span>
          {i !== words.length - 1 && " "}
        </React.Fragment>
      ))}
    </h2>
  );
};

// Анимированный скролл-индикатор
export const ScrollIndicator: React.FC = () => {
  return (
    <motion.div 
      className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 2, duration: 0.8 }}
    >
      <span className="text-sm text-slate-400 dark:text-slate-500 mb-2">Прокрутите вниз</span>
      <motion.div 
        className="w-6 h-10 border-2 border-slate-400 dark:border-slate-500 rounded-full flex justify-center p-1"
        animate={{ boxShadow: ["0 0 0 rgba(99,102,241,0)", "0 0 10px rgba(99,102,241,0.5)", "0 0 0 rgba(99,102,241,0)"] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <motion.div 
          className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full"
          animate={{ y: [0, 15, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
    </motion.div>
  );
};

export default ParallaxText; 