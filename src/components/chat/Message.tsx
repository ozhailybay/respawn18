import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiZap } from 'react-icons/fi';
import { BsStars } from 'react-icons/bs';

interface MessageProps {
  message: {
    id: string;
    content: string;
    sender: 'user' | 'ai';
    timestamp: Date | string | number;
    isError?: boolean;
    model?: string;
  };
  index: number;
  mouseX: number;
  mouseY: number;
}

const formatTimestamp = (value: Date | string | number): string => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '--:--';
  }
  return date.toLocaleTimeString('ru-RU', {
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

const Message = memo<MessageProps>(({ message, index, mouseX, mouseY }) => {
  const messageVariants = {
    hidden: { opacity: 0, x: -30, scale: 0.95 },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const magneticVariants = {
    hover: {
      scale: 1.1,
      rotate: 360,
      transition: {
        duration: 0.6,
        ease: "easeInOut"
      }
    }
  };

  return (
    <motion.div
      variants={messageVariants}
      initial="hidden"
      animate="visible"
      transition={{ delay: index * 0.1 }}
      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`max-w-[85%] sm:max-w-[80%] ${message.sender === 'user' ? 'order-2' : 'order-1'}`}>
        <motion.div 
          className={`p-4 sm:p-6 rounded-2xl backdrop-blur-sm ${
            message.sender === 'user'
              ? 'bg-black text-white dark:bg-white dark:text-black border border-black/20 dark:border-white/20'
              : 'bg-black/10 dark:bg-white/10 text-black dark:text-white border border-black/10 dark:border-white/10'
          } ${message.isError ? 'bg-red-500/90 text-white border-red-500/50' : ''}`}
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.3, ease: "spring", stiffness: 300 }}
          style={{
            transform: `translate3d(calc(${mouseX}px * ${(index % 3 - 1) * 0.005}), calc(${mouseY}px * ${(index % 3 - 1) * 0.005}), 0)`,
            willChange: 'transform'
          }}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium">{message.content}</p>
          <div className={`flex items-center justify-between mt-3 sm:mt-4 text-xs ${
            message.sender === 'user' ? 'text-gray-300 dark:text-gray-600' : 'text-gray-500 dark:text-gray-400'
          }`}>
            <span className="font-medium">{formatTimestamp(message.timestamp)}</span>
            {message.model && (
              <span className="flex items-center bg-white/10 dark:bg-black/10 px-2 py-1 rounded-full">
                <FiZap className="w-3 h-3 mr-1" />
                <span className="font-medium">{message.model}</span>
              </span>
            )}
          </div>
        </motion.div>
      </div>
      
      <motion.div 
        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center mx-2 sm:mx-4 ${
          message.sender === 'user' 
            ? 'bg-black text-white dark:bg-white dark:text-black order-1' 
            : 'bg-black/10 dark:bg-white/10 text-black dark:text-white order-2 border border-black/20 dark:border-white/20'
        }`}
        whileHover={{ scale: 1.1, rotate: 360 }}
        transition={{ duration: 0.6 }}
        variants={magneticVariants}
      >
        {message.sender === 'user' ? (
          <FiUser className="w-4 h-4 sm:w-5 sm:h-5" />
        ) : (
          <BsStars className="w-4 h-4 sm:w-5 sm:h-5" />
        )}
      </motion.div>
    </motion.div>
  );
});

Message.displayName = 'Message';

export default Message; 