import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

interface TypewriterTextProps {
  text: string;
  delay?: number;
  speed?: number;
  className?: string;
  showCursor?: boolean;
  deleteSpeed?: number;
  pauseTime?: number;
  loop?: boolean;
  alternateTexts?: string[];
  cursorStyle?: 'bar' | 'underscore' | 'block';
  cursorColor?: string;
}

const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  delay = 0,
  speed = 40,
  className = '',
  showCursor = true,
  deleteSpeed = 20,
  pauseTime = 1500,
  loop = false,
  alternateTexts = [],
  cursorStyle = 'bar',
  cursorColor = 'currentColor'
}) => {
  const [displayText, setDisplayText] = useState('');
  const [index, setIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [textIndex, setTextIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  const allTexts = [text, ...alternateTexts];
  const currentText = allTexts[textIndex];
  
  const resetTypewriter = useCallback(() => {
    setDisplayText('');
    setIndex(0);
    setIsComplete(false);
    setIsDeleting(false);
  }, []);
  
  const switchToNextText = useCallback(() => {
    setTextIndex((prevIndex) => (prevIndex + 1) % allTexts.length);
    resetTypewriter();
  }, [allTexts.length, resetTypewriter]);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    if (isPaused) {
      timeout = setTimeout(() => {
        setIsPaused(false);
        if (loop || textIndex < allTexts.length - 1) {
          setIsDeleting(true);
        }
      }, pauseTime);
      return () => clearTimeout(timeout);
    }
    
    if (isDeleting) {
      if (displayText.length === 0) {
        setIsDeleting(false);
        switchToNextText();
        return;
      }
      
      timeout = setTimeout(() => {
        setDisplayText(prev => prev.slice(0, -1));
      }, deleteSpeed);
      return () => clearTimeout(timeout);
    }
    
    if (index < currentText.length) {
      timeout = setTimeout(() => {
        setDisplayText(prev => prev + currentText[index]);
        setIndex(index + 1);
      }, index === 0 ? delay : speed);
      
      return () => clearTimeout(timeout);
    } else {
      setIsComplete(true);
      if (loop || textIndex < allTexts.length - 1) {
        setIsPaused(true);
      }
    }
  }, [currentText, index, delay, speed, isDeleting, isPaused, loop, textIndex, allTexts.length, displayText.length, deleteSpeed, switchToNextText]);

  // Cursor style variations
  const getCursorElement = () => {
    const baseAnimationProps = {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      transition: { duration: 0.5, repeat: Infinity, repeatType: 'reverse' as const }
    };
    
    switch (cursorStyle) {
      case 'underscore':
        return (
          <motion.span
            {...baseAnimationProps}
            className="inline-block w-[0.6em] h-[2px] bg-current align-bottom ml-[1px]"
            style={{ backgroundColor: cursorColor }}
          />
        );
      case 'block':
        return (
          <motion.span
            {...baseAnimationProps}
            className="inline-block w-[0.6em] h-[1em] align-middle ml-[1px]"
            style={{ backgroundColor: cursorColor, opacity: 0.7 }}
          />
        );
      case 'bar':
      default:
        return (
          <motion.span
            {...baseAnimationProps}
            className="inline-block w-[2px] h-[1em] align-middle ml-1"
            style={{ backgroundColor: cursorColor }}
          />
        );
    }
  };

  return (
    <span className={className}>
      {displayText}
      {showCursor && (!isComplete || loop || textIndex < allTexts.length - 1) && getCursorElement()}
    </span>
  );
};

export default TypewriterText; 