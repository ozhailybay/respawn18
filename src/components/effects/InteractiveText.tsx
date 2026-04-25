import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface InteractiveTextProps {
  text: string;
  className?: string;
  glowColor?: string;
  particleColors?: string[];
  particleCount?: number;
}

const InteractiveText: React.FC<InteractiveTextProps> = ({
  text,
  className = "",
  glowColor = "rgba(99, 102, 241, 0.8)",
  particleColors = ["#3b82f6", "#6366f1", "#8b5cf6", "#ec4899"],
  particleCount = 20
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [clickedIndex, setClickedIndex] = useState<number | null>(null);
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    size: number;
    color: string;
    duration: number;
  }>>([]);
  const nextParticleId = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Create explosion of particles when clicking on a letter
  const createParticleExplosion = (index: number, event: React.MouseEvent) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Create new particles
    const newParticles = [];
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const distance = 30 + Math.random() * 50;
      const size = 3 + Math.random() * 7;
      const duration = 0.6 + Math.random() * 1;
      const color = particleColors[Math.floor(Math.random() * particleColors.length)];
      
      newParticles.push({
        id: nextParticleId.current++,
        x,
        y,
        size,
        color,
        duration
      });
    }
    
    setParticles(prev => [...prev, ...newParticles]);
    setClickedIndex(index);
    
    // Reset clicked index after animation
    setTimeout(() => {
      setClickedIndex(null);
      // Clear particles after they've animated out
      setTimeout(() => {
        setParticles(prev => prev.filter(p => !newParticles.includes(p)));
      }, 1000);
    }, 300);
  };
  
  // Split text into characters
  const characters = text.split('');
  
  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      {/* Characters */}
      {characters.map((char, index) => (
        <motion.span
          key={index}
          className="relative inline-block"
          onHoverStart={() => setHoveredIndex(index)}
          onHoverEnd={() => setHoveredIndex(null)}
          onClick={(event) => createParticleExplosion(index, event)}
          animate={{
            y: clickedIndex === index ? -10 : 0,
            scale: clickedIndex === index ? 1.4 : hoveredIndex === index ? 1.2 : 1,
            color: hoveredIndex === index || clickedIndex === index ? 
              'rgb(99, 102, 241)' : undefined, // indigo-500
            transition: {
              y: { type: "spring", stiffness: 300, damping: 10 },
              scale: { type: "spring", stiffness: 500, damping: 15 }
            }
          }}
          style={{
            textShadow: hoveredIndex === index ? `0 0 15px ${glowColor}` : 'none',
          }}
        >
          {char === ' ' ? '\u00A0' : char}
          
          {/* Glow effect under the character */}
          {(hoveredIndex === index || clickedIndex === index) && (
            <motion.div
              className="absolute bottom-0 left-0 w-full h-1 rounded-full"
              style={{ 
                backgroundColor: glowColor,
                filter: 'blur(2px)'
              }}
              layoutId="underline"
              transition={{ type: "spring", bounce: 0.3 }}
            />
          )}
        </motion.span>
      ))}
      
      {/* Particles */}
      {particles.map(particle => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            x: particle.x,
            y: particle.y,
            position: 'absolute',
            zIndex: 10
          }}
          animate={{
            x: [particle.x, particle.x + (Math.random() - 0.5) * 100],
            y: [particle.y, particle.y - 50 - Math.random() * 50],
            opacity: [1, 0],
            scale: [1, Math.random() * 0.5 + 0.5]
          }}
          transition={{
            duration: particle.duration,
            ease: "easeOut"
          }}
        />
      ))}
    </div>
  );
};

// Компонент для "магического" текста с эффектом искр
export const MagicText: React.FC<{
  text: string;
  className?: string;
  sparkleColor?: string;
  sparkInterval?: number;
}> = ({ 
  text, 
  className = "", 
  sparkleColor = "#6366f1",
  sparkInterval = 1000
}) => {
  const [sparkles, setSparkles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    size: number;
  }>>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const nextSparkleId = useRef(0);
  
  // Automatically create sparkles at random positions
  useEffect(() => {
    if (!containerRef.current) return;
    
    const intervalId = setInterval(() => {
      const container = containerRef.current;
      if (!container) return;
      
      const rect = container.getBoundingClientRect();
      
      // Create a new sparkle at a random position
      const newSparkle = {
        id: nextSparkleId.current++,
        x: Math.random() * rect.width,
        y: Math.random() * rect.height,
        size: 2 + Math.random() * 5
      };
      
      setSparkles(prev => [...prev, newSparkle]);
      
      // Remove sparkle after animation
      setTimeout(() => {
        setSparkles(prev => prev.filter(s => s.id !== newSparkle.id));
      }, 2000);
    }, sparkInterval);
    
    return () => clearInterval(intervalId);
  }, [sparkInterval]);
  
  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      {/* Main text */}
      <span className="relative z-10">{text}</span>
      
      {/* Sparkles */}
      {sparkles.map(sparkle => (
        <motion.div
          key={sparkle.id}
          className="absolute pointer-events-none"
          style={{
            left: sparkle.x,
            top: sparkle.y,
            width: sparkle.size,
            height: sparkle.size,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ 
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
            rotate: [0, 180]
          }}
          transition={{ duration: 2 }}
        >
          <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
            <path
              d="M12 3L14.5 8.5L20 11L14.5 13.5L12 19L9.5 13.5L4 11L9.5 8.5L12 3Z"
              fill={sparkleColor}
              stroke="white"
              strokeWidth="0.5"
            />
          </svg>
        </motion.div>
      ))}
    </div>
  );
};

// Компонент для интерактивной акцентной фразы
export const AccentPhrase: React.FC<{
  text: string;
  accentText: string;
  className?: string;
  accentClassName?: string;
}> = ({
  text,
  accentText,
  className = "",
  accentClassName = "bg-clip-text text-transparent bg-gradient-to-r from-black to-gray-600 dark:from-white dark:to-gray-400"
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Find accent text in the full text to determine its position
  const parts = text.split(accentText);
  
  if (parts.length === 1) {
    // Accent text not found in the main text
    return <p className={className}>{text}</p>;
  }
  
  return (
    <p className={className}>
      {parts.map((part, index) => (
        <React.Fragment key={index}>
          {part}
          {index < parts.length - 1 && (
            <motion.span
              className={accentClassName}
              onHoverStart={() => setIsHovered(true)}
              onHoverEnd={() => setIsHovered(false)}
              animate={{
                scale: isHovered ? 1.1 : 1,
                y: isHovered ? -2 : 0,
              }}
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 10
              }}
            >
              {accentText}
              
              {isHovered && (
                <motion.div
                  className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-black to-gray-600 dark:from-white dark:to-gray-400"
                  layoutId="accent-underline"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
              )}
            </motion.span>
          )}
        </React.Fragment>
      ))}
    </p>
  );
};

export default InteractiveText; 