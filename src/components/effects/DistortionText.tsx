import React, { useState, useEffect } from 'react';
import { motion, useAnimationControls } from 'framer-motion';

interface DistortionTextProps {
  text: string;
  className?: string;
  charClassName?: string;
  delay?: number;
  once?: boolean;
}

const DistortionText: React.FC<DistortionTextProps> = ({ 
  text, 
  className = "", 
  charClassName = "",
  delay = 0,
  once = true
}) => {
  const [characters, setCharacters] = useState<string[]>([]);
  const controls = useAnimationControls();
  
  useEffect(() => {
    setCharacters(text.split(''));
  }, [text]);
  
  useEffect(() => {
    const startAnimation = async () => {
      await new Promise(resolve => setTimeout(resolve, delay * 1000));
      
      await controls.start('visible');
    };
    
    startAnimation();
  }, [controls, delay]);
  
  // Random characters for the distortion effect
  const randomChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+{}|:<>?";
  
  const getRandomChar = () => {
    return randomChars.charAt(Math.floor(Math.random() * randomChars.length));
  };
  
  // Create an animation sequence that starts with random characters and resolves to the correct character
  const CharWrapper: React.FC<{ char: string; index: number }> = ({ char, index }) => {
    const [currentChar, setCurrentChar] = useState(getRandomChar());
    const [isAnimating, setIsAnimating] = useState(false);
    
    // Skip animation for spaces
    const shouldAnimate = char !== ' ';
    
    useEffect(() => {
      if (isAnimating && shouldAnimate) {
        const intervalId = setInterval(() => {
          setCurrentChar(getRandomChar());
        }, 50);
        
        return () => clearInterval(intervalId);
      }
    }, [isAnimating, shouldAnimate]);
    
    return (
      <motion.span
        className={`inline-block ${charClassName}`}
        custom={index}
        variants={{
          hidden: { 
            opacity: 0,
            y: 20,
            rotate: 10
          },
          visible: { 
            opacity: 1, 
            y: 0,
            rotate: 0,
            transition: { 
              duration: 0.5,
              delay: index * 0.03
            }
          }
        }}
        initial="hidden"
        animate={controls}
        onAnimationStart={() => setIsAnimating(true)}
        onAnimationComplete={() => setIsAnimating(false)}
      >
        {isAnimating && shouldAnimate ? currentChar : char}
      </motion.span>
    );
  };

  return (
    <motion.h1 
      className={className}
      onViewportEnter={() => {
        if (!once || (once && controls.getAnimationState().phase === 'initial')) {
          controls.start('visible');
        }
      }}
    >
      {characters.map((char, index) => (
        <CharWrapper key={`${index}-${char}`} char={char} index={index} />
      ))}
    </motion.h1>
  );
};

// Компонент для эффекта разделяющегося текста
export const SplitText: React.FC<{ 
  text: string; 
  className?: string;
  highlightIndices?: number[];
  highlightColor?: string;
}> = ({ 
  text, 
  className = "",
  highlightIndices = [],
  highlightColor = "text-blue-600 dark:text-blue-400"
}) => {
  const words = text.split(' ');
  
  return (
    <motion.h1 
      className={`${className} overflow-hidden`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {words.map((word, wordIndex) => (
        <span key={wordIndex} className="inline-block overflow-hidden mx-1">
          <motion.span
            className={`inline-block ${highlightIndices.includes(wordIndex) ? highlightColor : ''}`}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            transition={{ 
              duration: 0.75, 
              delay: wordIndex * 0.15,
              ease: [0.33, 1, 0.68, 1] // cubic-bezier(.33,1,.68,1)
            }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </motion.h1>
  );
};

// Компонент для текста с эффектом машинописи
export const TypewriterText: React.FC<{
  text: string;
  className?: string;
  typingSpeed?: number;
  startDelay?: number;
  cursorClassName?: string;
}> = ({
  text,
  className = "",
  typingSpeed = 50,
  startDelay = 0,
  cursorClassName = "animate-pulse"
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    let charIndex = 0;
    
    const startTyping = () => {
      setIsTyping(true);
      
      const typeNextChar = () => {
        if (charIndex < text.length) {
          setDisplayedText(text.substring(0, charIndex + 1));
          charIndex++;
          timeout = setTimeout(typeNextChar, typingSpeed);
        } else {
          setIsTyping(false);
        }
      };
      
      timeout = setTimeout(typeNextChar, typingSpeed);
    };
    
    const delayTimeout = setTimeout(startTyping, startDelay);
    
    return () => {
      clearTimeout(delayTimeout);
      clearTimeout(timeout);
    };
  }, [text, typingSpeed, startDelay]);
  
  return (
    <div className={className}>
      <span>{displayedText}</span>
      {isTyping && (
        <span className={`inline-block w-[0.05em] h-[1.2em] bg-current align-middle ml-1 ${cursorClassName}`}></span>
      )}
    </div>
  );
};

export default DistortionText; 