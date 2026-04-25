import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { UserData } from '../types';

interface ProfileHeroProps {
  userData: UserData | null;
}

const ProfileHero: React.FC<ProfileHeroProps> = ({ userData }) => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 300], [0, -100]);
  const opacity = useTransform(scrollY, [0, 200], [1, 0.3]);
  const scale = useTransform(scrollY, [0, 300], [1, 0.8]);
  
  if (!userData) return null;

  return (
    <motion.div 
      className="relative h-64 sm:h-80 md:h-96 rounded-3xl overflow-hidden" 
      style={{ 
        y,
        opacity
      }}
    >
      {/* Elegant black and white gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-black via-gray-800 to-black dark:from-white dark:via-gray-200 dark:to-white opacity-90"></div>
      
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_1px,transparent_1px)] dark:bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.1)_1px,transparent_1px)] bg-[length:20px_20px] opacity-30"></div>
      
      {/* Animated circles */}
      <motion.div 
        className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 dark:bg-black/10 blur-3xl"
        animate={{ 
          x: [0, 10, 0], 
          y: [0, 15, 0],
          scale: [1, 1.1, 1] 
        }} 
        transition={{ 
          duration: 8, 
          repeat: Infinity,
          repeatType: "reverse" 
        }}
      />
      
      <motion.div 
        className="absolute -bottom-32 -left-32 h-64 w-64 rounded-full bg-white/10 dark:bg-black/10 blur-3xl"
        animate={{ 
          x: [0, -15, 0], 
          y: [0, 10, 0],
          scale: [1, 1.2, 1] 
        }} 
        transition={{ 
          duration: 10, 
          repeat: Infinity,
          repeatType: "reverse" 
        }}
      />
      
      {/* User Information */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div 
          className="text-center text-white dark:text-black"
          style={{ scale }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-4 rounded-full bg-white/20 dark:bg-black/20 backdrop-blur-sm border-2 border-white/30 dark:border-black/30 flex items-center justify-center">
              {userData.avatar ? (
                <img 
                  src={userData.avatar} 
                  alt={userData.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-2xl sm:text-3xl font-bold text-white dark:text-black">
                  {userData.name?.charAt(0)?.toUpperCase() || '?'}
                </span>
              )}
            </div>
          </motion.div>
          
          <motion.h1 
            className="text-3xl sm:text-4xl md:text-5xl font-light mb-2"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <span className="font-thin">{userData.name?.split(' ')[0]}</span>
            {userData.name?.split(' ').length > 1 && (
              <span className="font-bold ml-2">
                {userData.name.split(' ').slice(1).join(' ')}
              </span>
            )}
          </motion.h1>
          
          <motion.p 
            className="text-lg sm:text-xl font-light opacity-90 mb-4"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {userData.position || 'Специалист'}
          </motion.p>
          
          <motion.div 
            className="flex items-center justify-center space-x-6 text-sm sm:text-base"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            {userData.location && (
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{userData.location}</span>
              </div>
            )}
            {userData.email && (
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>{userData.email}</span>
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ProfileHero; 