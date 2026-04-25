import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaQuoteLeft, FaQuoteRight, FaStar } from 'react-icons/fa';

interface TestimonialProps {
  name: string;
  role: string;
  content: string;
  rating: number;
  delay?: number;
}

const Testimonial: React.FC<TestimonialProps> = ({
  name,
  role,
  content,
  rating,
  delay = 0
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Extract first name for the background effect
  const firstName = name.split(' ')[0];
  const initials = name.split(' ').map(part => part[0]).join('');
  
  // Generate a unique gradient based on name
  const generateGradient = (name: string) => {
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const gradients = [
      'from-blue-500 to-indigo-600',
      'from-indigo-500 to-purple-600',
      'from-purple-500 to-pink-600',
      'from-pink-500 to-red-600',
      'from-red-500 to-orange-600',
      'from-orange-500 to-yellow-600',
      'from-green-500 to-teal-600',
      'from-teal-500 to-cyan-600'
    ];
    return gradients[hash % gradients.length];
  };
  
  const gradient = generateGradient(name);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.7, delay: delay * 0.2 }}
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Card background with animated effects */}
      <motion.div 
        className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${gradient} opacity-0`}
        animate={{ opacity: isHovered ? 0.05 : 0 }}
        transition={{ duration: 0.3 }}
      />
      
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden backdrop-blur-sm z-10 hover:shadow-2xl transition-all duration-500">
        {/* Background decorations */}
        <div className="absolute top-0 right-0 opacity-10">
          <div className={`w-32 h-32 rounded-full bg-gradient-to-br ${gradient} blur-xl -mt-10 -mr-10`} />
        </div>
        
        {/* Animated first name watermark */}
        <motion.div
          className="absolute -bottom-6 -right-3 text-6xl sm:text-7xl font-bold text-gray-100 dark:text-gray-800 pointer-events-none z-0 opacity-30"
          animate={{ 
            y: isHovered ? -5 : 0,
            x: isHovered ? -5 : 0,
            opacity: isHovered ? 0.5 : 0.3
          }}
          transition={{ duration: 0.5 }}
        >
          {firstName}
        </motion.div>
        
        {/* Quote symbol */}
        <motion.div
          className="mb-4 text-2xl"
          animate={{ 
            rotate: isHovered ? [0, -5, 0, 5, 0] : 0
          }}
          transition={{ duration: 2, repeat: isHovered ? Infinity : 0, repeatType: "reverse" }}
        >
          <FaQuoteLeft className={`text-${gradient.split('-')[1]} opacity-30`} />
        </motion.div>
        
        {/* Content with animated effect */}
        <div className="relative">
          <motion.p 
            className="text-gray-600 dark:text-gray-300 italic mb-6 relative z-10 text-lg"
            animate={{ scale: isHovered ? 1.02 : 1 }}
            transition={{ duration: 0.5 }}
          >
            {content}
            <motion.span 
              className="absolute bottom-0 right-0 opacity-30"
              animate={{ 
                rotate: isHovered ? [0, 5, 0, -5, 0] : 0
              }}
              transition={{ duration: 2, repeat: isHovered ? Infinity : 0, repeatType: "reverse" }}
            >
              <FaQuoteRight className={`text-${gradient.split('-')[1]}`} />
            </motion.span>
          </motion.p>
        </div>
        
        {/* Animated rating */}
        <div className="flex mb-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <motion.div 
              key={i}
              animate={{ 
                y: isHovered ? (i % 2 === 0 ? -3 : 3) : 0,
                scale: isHovered && i < rating ? 1.2 : 1 
              }}
              transition={{ 
                duration: 0.5, 
                delay: i * 0.1,
                type: "spring",
                stiffness: 200
              }}
              className="mr-1"
            >
              <FaStar 
                className={`w-5 h-5 ${i < rating ? 'text-yellow-500' : 'text-gray-300'}`}
              />
            </motion.div>
          ))}
        </div>
        
        {/* User info with hover animation - replaced image with abstract design */}
        <motion.div 
          className="flex items-center"
          animate={{ x: isHovered ? 5 : 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div 
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="mr-4"
          >
            <div className="relative">
              <motion.div 
                className={`absolute inset-0 rounded-full bg-gradient-to-br ${gradient} blur-sm -m-0.5 opacity-70`}
                animate={{
                  scale: isHovered ? [1, 1.2, 1] : 1,
                }}
                transition={{ duration: 1.5, repeat: isHovered ? Infinity : 0 }}
              />
              <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-xl relative z-10`}>
                {initials}
              </div>
            </div>
          </motion.div>
          <div>
            <motion.div 
              className="font-bold text-lg text-gray-900 dark:text-white"
              animate={{ y: isHovered ? -2 : 0 }}
              transition={{ duration: 0.3 }}
            >
              {name}
            </motion.div>
            <motion.div 
              className="text-sm text-gray-500 dark:text-gray-400"
              animate={{ y: isHovered ? 2 : 0 }}
              transition={{ duration: 0.3 }}
            >
              {role}
            </motion.div>
          </div>
        </motion.div>
        
        {/* Animated hover effect - glowing border */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`absolute inset-0 rounded-2xl border-2 border-${gradient.split('-')[1]} pointer-events-none`}
              style={{ boxShadow: `0 0 15px rgba(99, 102, 241, 0.3)` }}
            />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default Testimonial;
