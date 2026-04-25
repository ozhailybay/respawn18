import React from 'react';
import { motion } from 'framer-motion';

interface RespawnLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
  className?: string;
}

const RespawnLogo: React.FC<RespawnLogoProps> = ({
  size = 'md',
  animated = true,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
    xl: 'text-3xl'
  };

  const LogoIcon = () => (
    <motion.svg
      viewBox="0 0 100 100"
      className={`${sizeClasses[size]} ${className}`}
      initial={animated ? { scale: 0, rotate: -180 } : false}
      animate={animated ? { scale: 1, rotate: 0 } : false}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Градиент определения */}
      <defs>
        <linearGradient id="respawnGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#000000" />
          <stop offset="50%" stopColor="#333333" />
          <stop offset="100%" stopColor="#666666" />
        </linearGradient>
        <linearGradient id="respawnGradientDark" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="50%" stopColor="#CCCCCC" />
          <stop offset="100%" stopColor="#999999" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <filter id="shadow">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.3"/>
        </filter>
      </defs>

      {/* Основная форма логотипа - стилизованная буква D */}
      <motion.path
        d="M20 15 L20 85 L60 85 Q80 85 80 65 L80 35 Q80 15 60 15 Z"
        fill="url(#respawnGradient)"
        className="dark:fill-[url(#respawnGradientDark)]"
        initial={animated ? { pathLength: 0 } : false}
        animate={animated ? { pathLength: 1 } : false}
        transition={{ duration: 1, delay: 0.2 }}
        filter="url(#glow)"
      />

      {/* Внутренняя форма - стилизованная буква E */}
      <motion.path
        d="M30 25 L30 75 L70 75 M30 50 L60 50 M30 25 L60 25"
        stroke="white"
        strokeWidth="3"
        fill="none"
        initial={animated ? { pathLength: 0 } : false}
        animate={animated ? { pathLength: 1 } : false}
        transition={{ duration: 0.8, delay: 0.6 }}
      />

      {/* Анимированные частицы */}
      {animated && (
        <>
          <motion.circle
            cx="25"
            cy="30"
            r="1.5"
            fill="#000000"
            className="dark:fill-white"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0 }}
          />
          <motion.circle
            cx="75"
            cy="70"
            r="1"
            fill="#333333"
            className="dark:fill-gray-300"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          />
          <motion.circle
            cx="70"
            cy="25"
            r="0.8"
            fill="#666666"
            className="dark:fill-gray-500"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: 1 }}
          />
        </>
      )}
    </motion.svg>
  );

  const LogoText = () => (
    <motion.div
      className={`font-black tracking-wider ${textSizes[size]} text-black dark:text-white`}
      initial={animated ? { opacity: 0, x: -20 } : false}
      animate={animated ? { opacity: 1, x: 0 } : false}
      transition={{ duration: 0.6, delay: 0.3 }}
    >
      RESPAWN
    </motion.div>
  );

  return (
    <motion.div
      className="flex items-center gap-2"
      whileHover={animated ? { scale: 1.05 } : false}
      whileTap={animated ? { scale: 0.95 } : false}
    >
      <LogoIcon />
      <LogoText />
    </motion.div>
  );
};

export default RespawnLogo;
