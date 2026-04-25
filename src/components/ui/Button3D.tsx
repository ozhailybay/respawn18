import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface Button3DProps {
  children: React.ReactNode;
  to: string;
  primary?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
}

const Button3D: React.FC<Button3DProps> = ({
  children,
  to,
  primary = false,
  size = 'md',
  className = '',
  onClick
}) => {
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };
  
  const colorClasses = primary 
    ? 'text-white dark:text-black' 
    : 'text-black dark:text-white';
  
  const hoverGradient = primary 
    ? 'from-gray-800 to-black dark:from-gray-200 dark:to-white'
    : 'from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700';
  
  return (
    <Link
      to={to}
      className={`group relative overflow-hidden rounded-xl font-medium transition-all duration-300 hover:scale-105 will-change-transform ${sizeClasses[size]} ${colorClasses} ${className}`}
      onClick={onClick}
    >
      {/* 3D глубина (имитация кнопки) */}
      <span 
        className="absolute inset-0 z-0 translate-y-[3px] rounded-xl bg-black/20 dark:bg-white/20 transition-transform duration-300 group-hover:translate-y-[2px]"
      ></span>
      
      {/* Основа кнопки */}
      <span 
        className={`absolute inset-0 z-10 rounded-xl ${primary ? 'bg-black dark:bg-white' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'} shadow-sm transition-transform duration-300 group-hover:translate-y-0`}
      ></span>
      
      {/* Градиентное наложение при наведении */}
      <span 
        className={`absolute bottom-0 left-0 right-0 h-full z-20 rounded-xl bg-gradient-to-br ${hoverGradient} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
      ></span>
      
      {/* Блики */}
      <motion.span 
        className="absolute inset-0 z-30 rounded-xl opacity-0 group-hover:opacity-20"
        animate={{ 
          background: [
            "radial-gradient(circle at 50% 0%, rgba(255,255,255,0.3) 0%, transparent 70%)",
            "radial-gradient(circle at 50% 100%, rgba(255,255,255,0.3) 0%, transparent 70%)",
            "radial-gradient(circle at 50% 0%, rgba(255,255,255,0.3) 0%, transparent 70%)"
          ]
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      />
      
      {/* Текстовый контент */}
      <span className="relative z-30 flex items-center justify-center transition-colors duration-300 group-hover:text-white dark:group-hover:text-black">
        {children}
      </span>
    </Link>
  );
};

export default Button3D; 