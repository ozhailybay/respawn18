import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface AnimatedTextProps {
  text: string;
  className?: string;
  delay?: number;
  cursor?: boolean;
  speed?: number;
  loop?: boolean;
  loopDelay?: number;
}

const AnimatedText: React.FC<AnimatedTextProps> = ({
  text,
  className = '',
  delay = 0,
  cursor = true,
  speed = 40,
  loop = false,
  loopDelay = 3000
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [isWaiting, setIsWaiting] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    // Начальная задержка перед анимацией
    if (delay > 0 && currentIndex === 0) {
      timeout = setTimeout(() => {
        animateText();
      }, delay);
      return () => clearTimeout(timeout);
    }

    if (isWaiting) {
      timeout = setTimeout(() => {
        setIsWaiting(false);
        setIsTyping(false);
      }, loopDelay);
      return () => clearTimeout(timeout);
    }

    if (!isTyping && loop) {
      timeout = setTimeout(() => {
        setDisplayedText('');
        setCurrentIndex(0);
        setIsTyping(true);
      }, 500);
      return () => clearTimeout(timeout);
    }

    animateText();
    
    return () => clearTimeout(timeout);
  }, [currentIndex, delay, isTyping, isWaiting, loop, loopDelay, text]);

  const animateText = () => {
    if (isTyping) {
      if (currentIndex < text.length) {
        const timeout = setTimeout(() => {
          setDisplayedText(prev => prev + text.charAt(currentIndex));
          setCurrentIndex(prev => prev + 1);
        }, speed);
        return () => clearTimeout(timeout);
      } else {
        setIsWaiting(true);
      }
    }
  };

  return (
    <span className={className} aria-label={text}>
      {displayedText}
      {cursor && isTyping && (
        <motion.span
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.8, repeat: Infinity, repeatType: 'reverse' }}
          className="inline-block w-[2px] h-[1em] bg-current align-middle ml-1"
        />
      )}
    </span>
  );
};

export default AnimatedText; 