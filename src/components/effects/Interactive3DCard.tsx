import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface Interactive3DCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  link: string;
  color: string;
  glowColor: string;
  index: number;
}

const Interactive3DCard: React.FC<Interactive3DCardProps> = ({
  icon,
  title,
  description,
  link,
  color,
  glowColor,
  index
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [scale, setScale] = useState(1);
  const [glowPosition, setGlowPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  // Calculate card rotation based on mouse position
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calculate rotation (more subtle than a full 3D effect)
    const rotateY = ((x / rect.width) - 0.5) * 15;
    const rotateX = -((y / rect.height) - 0.5) * 15;
    
    // Set glow effect position
    const glowX = (x / rect.width) * 100;
    const glowY = (y / rect.height) * 100;
    
    setRotateX(rotateX);
    setRotateY(rotateY);
    setGlowPosition({ x: glowX, y: glowY });
  };

  const handleMouseEnter = () => {
    setScale(1.02);
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setScale(1);
    setIsHovered(false);
    setGlowPosition({ x: 0, y: 0 });
  };

  return (
    <motion.div
      ref={cardRef}
      className="relative h-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.5, 
        delay: 0.1 * index,
        ease: "easeOut" 
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: "1200px",
        transformStyle: "preserve-3d"
      }}
    >
      <motion.div
        className={`relative h-full rounded-2xl p-8 ${color} overflow-hidden backdrop-blur-sm border border-white/10 shadow-xl`}
        style={{
          transformStyle: "preserve-3d",
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale})`,
          transition: "transform 0.2s ease-out"
        }}
      >
        {/* Hover glow effect */}
        {isHovered && (
          <div
            className="absolute inset-0 opacity-50 pointer-events-none"
            style={{
              background: `radial-gradient(circle at ${glowPosition.x}% ${glowPosition.y}%, ${glowColor} 0%, transparent 70%)`,
              mixBlendMode: "soft-light"
            }}
          />
        )}
        
        {/* Card content with 3D effect */}
        <div className="relative z-10 h-full flex flex-col">
          {/* Icon with floating animation */}
          <motion.div 
            className="mb-6"
            style={{
              transform: "translateZ(30px)",
              transformStyle: "preserve-3d"
            }}
            animate={{
              y: [0, -8, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-lg">
              {icon}
            </div>
          </motion.div>
          
          {/* Text content */}
          <div style={{ transform: "translateZ(20px)" }}>
            <h3 className="text-xl font-bold mb-3 text-white">{title}</h3>
            <p className="text-white/80 mb-6">{description}</p>
          </div>
          
          {/* Button with hover effect */}
          <div className="mt-auto" style={{ transform: "translateZ(40px)" }}>
            <motion.a
              href={link}
              className="inline-flex items-center text-white font-medium group"
              whileHover={{ x: 5 }}
            >
              <span>Подробнее</span>
              <motion.svg 
                className="w-5 h-5 ml-2" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                animate={isHovered ? { x: [0, 5, 0] } : {}}
                transition={{ 
                  duration: 1, 
                  repeat: isHovered ? Infinity : 0,
                  ease: "easeInOut" 
                }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </motion.svg>
            </motion.a>
          </div>
        </div>
        
        {/* Background elements */}
        <div 
          className="absolute -right-12 -bottom-12 w-40 h-40 rounded-full bg-white/10 blur-2xl"
          style={{ transform: "translateZ(5px)" }}
        />
        <div 
          className="absolute -left-12 -top-12 w-40 h-40 rounded-full bg-white/5 blur-xl"
          style={{ transform: "translateZ(5px)" }}
        />
        
        {/* Animated particles */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-white/40"
            style={{
              top: `${20 + i * 15}%`,
              left: `${80 - i * 10}%`,
              filter: "blur(1px)",
              transform: "translateZ(10px)"
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.4, 0.8, 0.4],
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.5
            }}
          />
        ))}
      </motion.div>
    </motion.div>
  );
};

export default Interactive3DCard; 