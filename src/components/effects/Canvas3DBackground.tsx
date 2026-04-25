import React, { useRef, useEffect } from 'react';

interface Canvas3DBackgroundProps {
  className?: string;
  colorFrom?: string;
  colorTo?: string;
  particleCount?: number;
  particleSize?: number;
  speed?: number;
}

const Canvas3DBackground: React.FC<Canvas3DBackgroundProps> = ({ 
  className = "",
  colorFrom = "#3b82f6", // blue-500
  colorTo = "#6366f1",   // indigo-500
  particleCount = 100,
  particleSize = 3,
  speed = 0.5
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const particlesRef = useRef<Array<{
    x: number;
    y: number;
    z: number;
    size: number;
    color: string;
    vx: number;
    vy: number;
    vz: number;
  }>>([]);
  
  // Animation frame reference
  const animationFrameIdRef = useRef<number>(0);
  
  // Setup canvas and particles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Setup canvas context
    contextRef.current = canvas.getContext('2d');
    const ctx = contextRef.current;
    if (!ctx) return;
    
    // Resize canvas to full width/height
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      // Re-initialize particles when canvas is resized
      initializeParticles();
    };
    
    // Generate a color between the two provided colors
    const getGradientColor = (ratio: number) => {
      // Parse hex colors to RGB
      const parseColor = (hex: string) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return { r, g, b };
      };
      
      const from = parseColor(colorFrom);
      const to = parseColor(colorTo);
      
      // Interpolate between the colors
      const r = Math.floor(from.r + (to.r - from.r) * ratio);
      const g = Math.floor(from.g + (to.g - from.g) * ratio);
      const b = Math.floor(from.b + (to.b - from.b) * ratio);
      
      return `rgb(${r}, ${g}, ${b})`;
    };
    
    // Initialize particles
    const initializeParticles = () => {
      particlesRef.current = [];
      
      for (let i = 0; i < particleCount; i++) {
        const z = Math.random() * 2 - 1; // z between -1 and 1
        const colorRatio = (z + 1) / 2; // Map z to 0-1 for color gradient
        
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          z: z,
          size: particleSize * (z + 1.5), // Size based on z-depth
          color: getGradientColor(colorRatio),
          vx: (Math.random() - 0.5) * speed,
          vy: (Math.random() - 0.5) * speed,
          vz: (Math.random() - 0.5) * speed * 0.3
        });
      }
    };
    
    // Set up resize listener and initialize
    window.addEventListener('resize', handleResize);
    handleResize();
    
    // Animation function
    const animate = () => {
      if (!ctx || !canvas) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update and draw particles
      particlesRef.current.forEach(particle => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.z += particle.vz;
        
        // Bounce off edges
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;
        if (particle.z < -1 || particle.z > 1) particle.vz *= -1;
        
        // Calculate size and opacity based on z position
        const scale = (particle.z + 2) / 3;
        const size = particle.size * scale;
        const opacity = 0.2 + scale * 0.6;
        
        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2);
        
        // Apply opacity to the color
        const rgbValues = particle.color.match(/\d+/g);
        if (rgbValues && rgbValues.length === 3) {
          ctx.fillStyle = `rgba(${rgbValues[0]}, ${rgbValues[1]}, ${rgbValues[2]}, ${opacity})`;
        } else {
          ctx.fillStyle = particle.color;
        }
        
        ctx.fill();
        
        // Optional: connect nearby particles
        connectParticles(particle);
      });
      
      // Continue animation loop
      animationFrameIdRef.current = requestAnimationFrame(animate);
    };
    
    // Connect particles that are close to each other
    const connectParticles = (p1: typeof particlesRef.current[0]) => {
      particlesRef.current.forEach(p2 => {
        // Skip connecting to self
        if (p1 === p2) return;
        
        // Calculate distance between particles
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dz = p1.z - p2.z;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Only connect if they're close enough
        const maxDistance = 150;
        if (distance < maxDistance) {
          // Calculate opacity based on distance
          const opacity = 1 - distance / maxDistance;
          
          // Calculate color based on z-positions
          const zAvg = (p1.z + p2.z) / 2;
          const colorRatio = (zAvg + 1) / 2;
          const color = getGradientColor(colorRatio);
          
          // Extract RGB values for opacity
          const rgbValues = color.match(/\d+/g);
          if (rgbValues && rgbValues.length === 3) {
            ctx.strokeStyle = `rgba(${rgbValues[0]}, ${rgbValues[1]}, ${rgbValues[2]}, ${opacity * 0.2})`;
          } else {
            ctx.strokeStyle = color;
          }
          
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      });
    };
    
    // Start animation
    animate();
    
    // Cleanup function
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameIdRef.current);
    };
  }, [colorFrom, colorTo, particleCount, particleSize, speed]);
  
  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 -z-10 ${className}`}
      style={{ pointerEvents: 'none' }}
    />
  );
};

export default Canvas3DBackground; 