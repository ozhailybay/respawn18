import React, { useState, useEffect } from 'react';

interface GradientTextProps {
  children: React.ReactNode;
  className?: string;
  from?: string;
  to?: string;
  via?: string;
  animate?: boolean;
  animationDuration?: number;
  direction?: 'r' | 'l' | 'b' | 't' | 'br' | 'bl' | 'tr' | 'tl';
  hover?: boolean;
  shimmer?: boolean;
}

const GradientText: React.FC<GradientTextProps> = ({ 
  children, 
  className = "", 
  from = "black", 
  to = "gray-600",
  via,
  animate = false,
  animationDuration = 3,
  direction = 'r',
  hover = false,
  shimmer = false
}) => {
  const [gradientAngle, setGradientAngle] = useState(0);
  
  // Animation effect for rotating gradient
  useEffect(() => {
    if (!animate) return;
    
    const interval = setInterval(() => {
      setGradientAngle(prev => (prev + 1) % 360);
    }, 50);
    
    return () => clearInterval(interval);
  }, [animate]);
  
  // Create the gradient class based on props - using black/white theme
  const getGradientClass = () => {
    let baseClass = 'bg-clip-text text-transparent bg-gradient-to-';
    baseClass += direction;
    
    if (via) {
      return `${baseClass} from-${from} via-${via} to-${to}`;
    }
    
    return `${baseClass} from-${from} to-${to}`;
  };
  
  // Create the shimmer effect with black/white theme
  const shimmerStyle = shimmer ? {
    backgroundSize: '200% 100%',
    animation: `shimmer ${animationDuration}s infinite linear`,
    background: 'linear-gradient(90deg, #000 0%, #666 50%, #000 100%)',
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    color: 'transparent',
  } : {};
  
  // Create the animated gradient style with black/white theme
  const animatedStyle = animate ? {
    backgroundImage: `linear-gradient(${gradientAngle}deg, #000, #666, #000)`,
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    color: 'transparent',
  } : {};
  
  // Create hover effect class
  const hoverClass = hover ? 'transition-all duration-300 hover:scale-105' : '';
  
  if (shimmer) {
    return (
      <>
        <style jsx>{`
          @keyframes shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        `}</style>
        <span 
          className={`${getGradientClass()} ${className} ${hoverClass}`}
          style={shimmerStyle}
        >
          {children}
        </span>
      </>
    );
  }
  
  return (
    <span 
      className={`${getGradientClass()} ${className} ${hoverClass}`}
      style={animatedStyle}
    >
      {children}
    </span>
  );
};

export default GradientText; 