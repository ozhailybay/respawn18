import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

type Particle = {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  duration: number;
  delay: number;
};

const FloatingParticles: React.FC = () => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    // Generate random particles
    const generateParticles = () => {
      const colors = [
        'bg-black/10', 
        'bg-gray-800/10', 
        'bg-gray-600/10', 
        'bg-gray-900/10',
        'bg-black/5', 
        'bg-gray-800/5', 
        'bg-gray-600/5', 
        'bg-gray-900/5'
      ];
      
      const darkColors = [
        'dark:bg-white/20', 
        'dark:bg-gray-200/20', 
        'dark:bg-gray-400/20', 
        'dark:bg-gray-100/20',
        'dark:bg-white/10', 
        'dark:bg-gray-200/10', 
        'dark:bg-gray-400/10', 
        'dark:bg-gray-100/10'
      ];
      
      const particlesArray: Particle[] = [];
      
      // Generate 15 particles
      for (let i = 0; i < 15; i++) {
        const randomColor = Math.floor(Math.random() * colors.length);
        const size = Math.random() * 8 + 2; // Size between 2-10px
        
        particlesArray.push({
          id: i,
          x: Math.random() * 100, // Random position (0-100%)
          y: Math.random() * 100,
          size,
          color: `${colors[randomColor]} ${darkColors[randomColor]}`,
          duration: Math.random() * 15 + 10, // Duration between 10-25s
          delay: Math.random() * 5, // Delay between 0-5s
        });
      }
      
      setParticles(particlesArray);
    };
    
    generateParticles();
    
    // Regenerate particles periodically for continuous effect
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        generateParticles();
      }
    }, 20000); // Every 20 seconds
    
    return () => {
      clearInterval(interval);
    };
  }, []);
  
  if (!isMounted) return null;
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className={`absolute rounded-full blur-sm ${particle.color}`}
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
          }}
          animate={{
            x: [
              0,
              Math.random() * 60 - 30, // Move randomly -30px to +30px
              Math.random() * 60 - 30,
              0,
            ],
            y: [
              0,
              Math.random() * 60 - 30,
              Math.random() * 60 - 30,
              0,
            ],
            opacity: [0, 1, 1, 0],
            scale: [0, 1, 1, 0],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

export default FloatingParticles; 