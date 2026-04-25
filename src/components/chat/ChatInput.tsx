import React, { useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FiSend } from 'react-icons/fi';

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  onSend: (text: string) => void;
  isLoading: boolean;
}

const ChatInput = ({ input, setInput, onSend, isLoading }: ChatInputProps) => {
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  }, [input]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Standard chat UX:
    // - Enter sends message
    // - Shift+Enter inserts a new line
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const text = input.trim();
      if (!isLoading && text) {
        onSend(text);
      }
    }
  }, [onSend, isLoading, input]);

  const magneticVariants = {
    hover: {
      scale: 1.05,
      rotate: 5,
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    }
  };

  // Calculate character limit warning
  const charLeft = 1000 - input.length;
  const isCharLimitWarning = charLeft < 50;

  return (
    <div className="border-t border-black/20 dark:border-white/20 p-4 sm:p-6 lg:p-8 bg-black/5 dark:bg-white/5 backdrop-blur-sm">
      <form onSubmit={(e) => e.preventDefault()} className="flex items-end space-x-3 sm:space-x-4">
        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Задайте вопрос AI ментору... (Enter — отправить, Shift+Enter — новая строка)"
            className="w-full p-4 sm:p-6 pr-12 sm:pr-16 border-2 border-black/20 dark:border-white/20 rounded-2xl resize-none focus:border-black dark:focus:border-white focus:outline-none bg-white/50 dark:bg-black/50 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 font-medium backdrop-blur-sm"
            rows={1}
            maxLength={1000}
            aria-label="Введите сообщение для AI ментора"
          />
          <div 
            className={`absolute bottom-3 sm:bottom-4 right-3 sm:right-4 text-xs font-medium ${
              isCharLimitWarning ? 'text-red-500' : 'text-gray-400'
            }`}
            aria-live="polite"
          >
            {charLeft}/1000
          </div>
        </div>
        <motion.button
          type="button"
          disabled={!input.trim() || isLoading}
          onClick={() => {
            const text = input.trim();
            if (!isLoading && text) {
              onSend(text);
            }
          }}
          className="p-4 sm:p-6 bg-black text-white dark:bg-white dark:text-black rounded-2xl hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-bold shadow-lg hover:shadow-xl"
          whileHover="hover"
          whileTap={{ scale: 0.95, rotate: -5 }}
          variants={magneticVariants}
          aria-label="Отправить сообщение"
        >
          <FiSend className="w-5 h-5 sm:w-6 sm:h-6" />
        </motion.button>
      </form>
    </div>
  );
};

export default ChatInput; 