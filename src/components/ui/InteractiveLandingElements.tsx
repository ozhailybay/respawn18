import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiZap, FiStar, FiHeart, FiTarget } from 'react-icons/fi';
import { FaRocket, FaMagic, FaGem, FaBolt } from 'react-icons/fa';

// Floating Icons Component
export const FloatingIcons = () => {
  const [icons] = useState([
    { id: 1, icon: FiZap, x: 10, y: 20, delay: 0 },
    { id: 2, icon: FiStar, x: 80, y: 30, delay: 1 },
    { id: 3, icon: FiHeart, x: 20, y: 70, delay: 2 },
    { id: 4, icon: FaRocket, x: 70, y: 80, delay: 3 },
    { id: 5, icon: FaMagic, x: 90, y: 50, delay: 4 },
  ]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {icons.map((item) => (
        <motion.div
          key={item.id}
          className="absolute text-black/10 dark:text-white/10"
          style={{
            left: `${item.x}%`,
            top: `${item.y}%`,
          }}
          animate={{
            y: [0, -30, 0],
            rotate: [0, 360],
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            delay: item.delay,
            ease: "easeInOut"
          }}
        >
          <item.icon className="w-6 h-6" />
        </motion.div>
      ))}
    </div>
  );
};

// Interactive Button Component
export const InteractiveButton = ({ 
  children, 
  onClick, 
  variant = "primary",
  className = "" 
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary";
  className?: string;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const variants = {
    primary: "bg-gradient-to-r from-black to-gray-800 dark:from-white dark:to-gray-200 text-white dark:text-black",
    secondary: "bg-gradient-to-r from-purple-600 to-pink-600 text-white",
  };

  return (
    <motion.button
      className={`
        relative overflow-hidden font-bold rounded-2xl transition-all duration-300 
        px-12 py-4 text-lg ${variants[variant]} ${className}
        shadow-lg hover:shadow-xl
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      whileHover={{ scale: 1.05, y: -3 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Shimmer Effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
        initial={{ x: "-100%" }}
        animate={{ x: isHovered ? "200%" : "-100%" }}
        transition={{ duration: 0.6 }}
      />
      
      <span className="relative z-10 flex items-center justify-center">
        {children}
      </span>
    </motion.button>
  );
};

// Feature Card Component
export const FeatureCard = ({ 
  icon: Icon, 
  title, 
  description, 
  color, 
  delay = 0 
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
  delay?: number;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ 
        scale: 1.05, 
        y: -10,
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group relative p-8 bg-white/50 dark:bg-black/50 backdrop-blur-xl rounded-3xl border border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20 transition-all duration-500 overflow-hidden cursor-pointer"
    >
      {/* Gradient Background */}
      <motion.div 
        className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-3xl`}
        animate={{ opacity: isHovered ? 0.1 : 0 }}
      />
      
      {/* Floating Icon */}
      <motion.div
        className={`relative z-10 w-16 h-16 bg-gradient-to-br ${color} rounded-2xl flex items-center justify-center text-white mb-6 shadow-2xl`}
        animate={{ 
          rotate: isHovered ? [0, -10, 10, 0] : 0,
          scale: isHovered ? 1.1 : 1
        }}
        transition={{ duration: 0.5 }}
      >
        <Icon className="w-8 h-8" />
      </motion.div>

      <h3 className="text-2xl font-bold text-black dark:text-white mb-4 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-pink-600 transition-all duration-300">
        {title}
      </h3>
      
      <p className="text-black/60 dark:text-white/60 leading-relaxed text-lg">
        {description}
      </p>

      {/* Hover Effect Arrow */}
      <motion.div
        className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        animate={{ x: isHovered ? 5 : 0 }}
      >
        <FiTarget className="w-6 h-6 text-purple-600" />
      </motion.div>
    </motion.div>
  );
};

export default {
  FloatingIcons,
  InteractiveButton,
  FeatureCard
}; 