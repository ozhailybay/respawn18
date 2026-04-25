import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const HeroAnimation: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [spheres, setSpheres] = useState<Array<{ x: number; y: number; z: number; size: number; color: string; speed: number }>>([]);

  // Initialize dimensions and create spheres
  useEffect(() => {
    if (containerRef.current) {
      const { width, height } = containerRef.current.getBoundingClientRect();
      setDimensions({ width, height });
      
      // Create random spheres
      const newSpheres = Array(15).fill(0).map(() => ({
        x: Math.random() * width,
        y: Math.random() * height,
        z: Math.random() * 400 - 200,
        size: Math.random() * 60 + 20,
        color: getRandomColor(),
        speed: Math.random() * 0.5 + 0.2
      }));
      
      setSpheres(newSpheres);
    }
    
    function handleResize() {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
      }
    }
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Handle mouse movement
  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePosition({
          x: ((e.clientX - rect.left) / dimensions.width - 0.5) * 2,
          y: ((e.clientY - rect.top) / dimensions.height - 0.5) * 2
        });
      }
    }
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [dimensions]);
  
  // Animation loop for spheres
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = 0;
    
    const animate = (time: number) => {
      if (lastTime === 0) lastTime = time;
      const deltaTime = time - lastTime;
      lastTime = time;
      
      setSpheres(prev => prev.map(sphere => {
        let newZ = sphere.z + sphere.speed * deltaTime * 0.05;
        if (newZ > 200) newZ = -200;
        
        return {
          ...sphere,
          z: newZ
        };
      }));
      
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);
  
  // Helper functions
  const getRandomColor = () => {
    const colors = [
      'rgba(59, 130, 246, 0.7)', // blue-500
      'rgba(99, 102, 241, 0.7)', // indigo-500
      'rgba(139, 92, 246, 0.7)', // purple-500
      'rgba(236, 72, 153, 0.7)', // pink-500
      'rgba(248, 113, 113, 0.7)', // red-400
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };
  
  const calculateScale = (z: number) => {
    // Scale based on z-position (perspective)
    return 1 - (z + 200) / 400 * 0.7;
  };
  
  const calculateOpacity = (z: number) => {
    // Opacity based on z-position
    return 1 - (z + 200) / 400 * 0.9;
  };
  
  const calculateRotation = (index: number, z: number) => {
    // Create varied rotation based on index and z position
    const baseRotation = index % 2 === 0 ? 1 : -1;
    return baseRotation * (1 - z / 200) * 15;
  };
  
  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 overflow-hidden pointer-events-none z-0"
    >
      {spheres.map((sphere, index) => {
        const scale = calculateScale(sphere.z);
        const opacity = calculateOpacity(sphere.z);
        const rotation = calculateRotation(index, sphere.z);
        
        // Calculate parallax effect based on mouse position
        const xOffset = mousePosition.x * (20 + sphere.z / 10);
        const yOffset = mousePosition.y * (20 + sphere.z / 10);
        
        return (
          <motion.div
            key={index}
            className="absolute rounded-full backdrop-blur-md"
            style={{
              left: sphere.x,
              top: sphere.y,
              width: sphere.size,
              height: sphere.size,
              backgroundColor: sphere.color,
              transform: `translate(-50%, -50%) translate3d(${xOffset}px, ${yOffset}px, ${sphere.z}px) scale(${scale}) rotate(${rotation}deg)`,
              zIndex: Math.round(200 - sphere.z),
              opacity: opacity,
              boxShadow: `0 4px 30px ${sphere.color}`,
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}
            animate={{
              boxShadow: [
                `0 4px 20px ${sphere.color}`,
                `0 4px 40px ${sphere.color}`,
                `0 4px 20px ${sphere.color}`
              ]
            }}
            transition={{
              boxShadow: {
                duration: 3 + index % 4,
                repeat: Infinity,
                ease: "easeInOut"
              }
            }}
          />
        );
      })}
      
      {/* Radial light effect */}
      <div 
        className="absolute left-1/2 top-1/2 w-[800px] h-[800px] rounded-full pointer-events-none opacity-30 mix-blend-screen"
        style={{
          background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(99,102,241,0.3) 30%, rgba(0,0,0,0) 70%)',
          transform: `translate(-50%, -50%) translate(${mousePosition.x * 50}px, ${mousePosition.y * 50}px)`
        }}
      />
      
      {/* Dynamic light beams */}
      <div className="absolute inset-0">
        {[...Array(3)].map((_, index) => (
          <motion.div
            key={`beam-${index}`}
            className="absolute top-1/2 left-1/2 w-2 h-[200vh] origin-center"
            style={{
              background: 'linear-gradient(to bottom, rgba(255,255,255,0.2), rgba(99,102,241,0.1), transparent)',
              filter: 'blur(8px)',
              transform: `translate(-50%, -50%) rotate(${index * 60}deg)`,
            }}
            animate={{
              rotate: [`${index * 60}deg`, `${index * 60 + 30}deg`, `${index * 60}deg`],
              opacity: [0.4, 0.7, 0.4]
            }}
            transition={{
              duration: 8 + index * 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroAnimation; 