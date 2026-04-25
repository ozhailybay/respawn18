import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateGroqText } from '../api/groq';
import { useAuth } from '../context/AuthContext';
import { FiChevronsDown, FiMessageCircle, FiTarget, FiFileText, FiTrendingUp, FiCpu } from 'react-icons/fi';
import { BsStars, BsRocket, BsHexagon, BsGrid3X3, BsLightbulb, BsArrowUpCircle } from 'react-icons/bs';
import Message from './chat/Message';
import ChatInput from './chat/ChatInput';
import ChatHeader from './chat/ChatHeader';

interface MessageType {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  isError?: boolean;
  model?: string;
}

interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
  questions: string[];
}

// Utility functions outside component to prevent recreation
const generateParticles = (count: number) => {
  return Array.from({ length: count }, () => ({
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    dx: Math.random() * 20 - 10,
    dy: Math.random() * 20 - 10,
    delay: Math.random() * 2,
    duration: 3 + Math.random() * 2
  }));
};

const formatMentorResponse = (text: string): string => {
  return text
    .replace(/\r/g, '')
    .replace(/```[\s\S]*?```/g, (m) => m.replace(/```/g, ''))
    .replace(/\*\*/g, '')
    .replace(/[#`>|]/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

const makeMessageId = (): string => `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;

const AIMentor = () => {
  const { user, userData } = useAuth();
  const [messages, setMessages] = useState<MessageType[]>([
    {
      id: 'welcome',
      content: 'Привет! Я твой AI-карьерный ментор. Готов помочь тебе достичь новых высот в карьере. Что тебя интересует сегодня?',
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [aiThinking, setAiThinking] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const thinkingTimeoutRef = useRef<NodeJS.Timeout>();

  // Memoized particles data
  const particles = useMemo(() => generateParticles(20), []);

  // Memoized categories to prevent recreation
  const categories: Category[] = useMemo(() => [
    {
      id: 'interview',
      name: 'Собеседования',
      icon: <FiTarget className="w-5 h-5 sm:w-6 sm:h-6" />,
      questions: [
        'Какие вопросы задают на интервью для Frontend разработчика?',
        'Как подготовиться к поведенческим вопросам?',
        'Как рассказать о слабых сторонах на собеседовании?',
        'Какие проекты включить в портфолио?'
      ]
    },
    {
      id: 'resume',
      name: 'Резюме',
      icon: <FiFileText className="w-5 h-5 sm:w-6 sm:h-6" />,
      questions: [
        'Как улучшить резюме для IT позиции?',
        'Какие ключевые навыки включить в резюме?',
        'Как оформить опыт работы с малым опытом?',
        'Как составить сопроводительное письмо?'
      ]
    },
    {
      id: 'career',
      name: 'Карьера',
      icon: <FiTrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />,
      questions: [
        'Как перейти с Junior на Middle?',
        'Какие навыки будут востребованы через 5 лет?',
        'Стоит ли сменить специализацию?',
        'Как стать тимлидом?'
      ]
    },
    {
      id: 'skills',
      name: 'Навыки',
      icon: <BsStars className="w-5 h-5 sm:w-6 sm:h-6" />,
      questions: [
        'Какие soft skills важны для IT?',
        'Как развить управление проектами?',
        'Какие курсы для full-stack?',
        'Как изучать новые технологии?'
      ]
    }
  ], []);

  // Memoized stats data
  const statsData = useMemo(() => [
    { value: '24/7', label: 'Доступность', icon: <FiCpu /> },
    { value: 'AI', label: 'Технологии', icon: <BsHexagon /> },
    { value: '∞', label: 'Возможности', icon: <BsGrid3X3 /> }
  ], []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleScroll = () => {
      if (!chatContainerRef.current) return;
      
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 150;
      setShowScrollButton(!isNearBottom);
    };

    const chatContainer = chatContainerRef.current;
    if (chatContainer) {
      chatContainer.addEventListener('scroll', handleScroll);
      return () => chatContainer.removeEventListener('scroll', handleScroll);
    }
  }, []);

  // Mouse tracking with RAF for performance
  useEffect(() => {
    let rafId: number;
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      
      rafId = requestAnimationFrame(() => {
        const rect = containerRef.current!.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        setMousePosition({ x, y });
        
        // Update CSS custom properties for lightweight transforms
        containerRef.current!.style.setProperty('--mouse-x', `${x}px`);
        containerRef.current!.style.setProperty('--mouse-y', `${y}px`);
      });
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      return () => {
        container.removeEventListener('mousemove', handleMouseMove);
        if (rafId) cancelAnimationFrame(rafId);
      };
    }
  }, []);

  // AI Thinking Animation Effect with proper cleanup
  useEffect(() => {
    if (isLoading) {
      setAiThinking(true);
      thinkingTimeoutRef.current = setTimeout(() => setAiThinking(false), 2000);
      return () => {
        if (thinkingTimeoutRef.current) {
          clearTimeout(thinkingTimeoutRef.current);
        }
      };
    }
  }, [isLoading]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (thinkingTimeoutRef.current) {
        clearTimeout(thinkingTimeoutRef.current);
      }
    };
  }, []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const handleSendMessage = useCallback(async (questionText?: string) => {
    const messageText = (questionText ?? input).trim();
    if (!messageText.trim() || isLoading) return;

    const userMessage: MessageType = {
      id: makeMessageId(),
      content: messageText,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      const userName = user?.displayName || userData?.displayName || 'Пользователь';
      const userRole = userData?.role || 'school';
      const systemPrompt = `Ты AI-карьерный ментор для Казахстана. Пользователь: ${userName}. Роль: ${userRole}.
Отвечай только на русском языке.
Важно:
- Пиши очень понятно для школьника/студента.
- Без markdown-таблиц, без символов типа ###, **, |, ---.
- Не перегружай терминами.
- Формат ответа: 1) короткое объяснение 2) список из 3-5 шагов 3) мини-пример.
- Максимум 12 коротких строк.`;
      const response = await generateGroqText(messageText, {
        systemPrompt,
        temperature: 0.45,
        maxTokens: 900
      });
      
      let aiResponseText = 'Извините, я не смог обработать ваш запрос. Пожалуйста, попробуйте еще раз.';
      
      if (typeof response === 'string') {
        aiResponseText = formatMentorResponse(response);
      } else if (response && typeof response === 'object' && response !== null && 'text' in response) {
        aiResponseText = formatMentorResponse((response as any).text);
      }
      if (!aiResponseText.trim()) {
        aiResponseText = 'Я получил пустой ответ от модели. Попробуй переформулировать вопрос короче.';
      }
      
      const aiMessage: MessageType = {
        id: makeMessageId(),
        content: aiResponseText,
        sender: 'ai',
        timestamp: new Date(),
        model: 'groq-gpt-oss-120b'
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      const errorMessage: MessageType = {
        id: makeMessageId(),
        content: 'Произошла ошибка при получении ответа. Пожалуйста, попробуйте позже.',
        sender: 'ai',
        timestamp: new Date(),
        isError: true
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  }, [input, isLoading, user, userData]);

  const handleCategorySelect = useCallback((categoryId: string) => {
    setSelectedCategory(categoryId);
  }, []);

  const handleQuestionSelect = useCallback((question: string) => {
    handleSendMessage(question);
  }, [handleSendMessage]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        staggerChildren: 0.15,
        ease: "easeOut"
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const floatingVariants = {
    animate: {
      y: [-10, 10, -10],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const typingVariants = {
    animate: {
      scale: [1, 1.2, 1],
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: "easeInOut"
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

  const pulseVariants = {
    animate: {
      scale: [1, 1.05, 1],
      opacity: [0.5, 1, 0.5],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const waveVariants = {
    animate: {
      x: [0, 10, 0],
      y: [0, -5, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div 
      ref={containerRef} 
      className="min-h-screen bg-white dark:bg-black text-black dark:text-white overflow-hidden relative"
      style={{
        '--mouse-x': '0px',
        '--mouse-y': '0px'
      } as React.CSSProperties}
    >
      {/* Animated Background Grid with CSS transforms */}
      <div 
        className="absolute inset-0 opacity-5 dark:opacity-10"
        style={{
          transform: 'translate3d(calc(var(--mouse-x) * 0.05), calc(var(--mouse-y) * 0.05), 0)',
          willChange: 'transform'
        }}
      >
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      {/* Floating Particles with memoized data */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-black dark:bg-white rounded-full"
            style={{
              left: particle.left,
              top: particle.top,
              transform: `translate3d(calc(var(--mouse-x) * ${particle.dx * 0.01}), calc(var(--mouse-y) * ${particle.dy * 0.01}), 0)`,
              willChange: 'transform'
            }}
            animate={{ y: [-10, 10, -10] }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              delay: particle.delay
            }}
          />
        ))}
      </div>

      {/* Hero Section with optimized 3D effects */}
      <motion.div 
        className="relative overflow-hidden py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        style={{
          transform: `
            perspective(1000px) 
            rotateX(calc(var(--mouse-y) * 0.02deg)) 
            rotateY(calc(var(--mouse-x) * 0.02deg))
            scale(calc(1 + var(--mouse-x) * 0.0001))
          `,
          willChange: 'transform'
        }}
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <motion.div
            animate={{ 
              rotate: 360,
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 20, 
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute top-10 left-10 w-32 h-32 sm:w-48 sm:h-48 lg:w-64 lg:h-64 border border-black/10 dark:border-white/10 rounded-full"
            style={{
              transform: `translate3d(calc(var(--mouse-x) * -0.1), calc(var(--mouse-y) * -0.1), 0)`,
              willChange: 'transform'
            }}
          />
          <motion.div
            animate={{ 
              rotate: -360,
              scale: [1.1, 1, 1.1]
            }}
            transition={{ 
              duration: 25, 
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute top-20 right-20 w-24 h-24 sm:w-32 sm:h-32 lg:w-48 lg:h-48 border border-black/10 dark:border-white/10 rounded-full"
            style={{
              transform: `translate3d(calc(var(--mouse-x) * 0.1), calc(var(--mouse-y) * -0.1), 0)`,
              willChange: 'transform'
            }}
          />
          <motion.div
            animate={{ x: [0, 10, 0], y: [0, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-10 left-1/4 w-16 h-16 sm:w-24 sm:h-24 lg:w-32 lg:h-32 border border-black/10 dark:border-white/10 rounded-full"
          />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="mb-8 sm:mb-12"
          >
            {/* Animated Logo with Magnetic Effect */}
            <motion.div
              whileHover={{ scale: 1.1, rotate: 360 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-black/10 dark:bg-white/10 backdrop-blur-xl rounded-full mb-6 sm:mb-8 border border-black/20 dark:border-white/20"
              style={{
                transform: `translate3d(calc(var(--mouse-x) * -0.03), calc(var(--mouse-y) * -0.03), 0)`,
                willChange: 'transform'
              }}
            >
              <motion.div
                animate={{ 
                  rotate: [0, 360],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 8, 
                  repeat: Infinity,
                  ease: "linear"
                }}
              >
                <BsRocket className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-black dark:text-white" />
              </motion.div>
            </motion.div>

            {/* Main Title with Advanced Typography and Pulse Effect */}
            <motion.h1 
              className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black mb-4 sm:mb-6 tracking-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <motion.span 
                className="block bg-gradient-to-r from-black via-gray-800 to-black dark:from-white dark:via-gray-200 dark:to-white bg-clip-text text-transparent"
                animate={{ scale: [1, 1.05, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                AI КАРЬЕРНЫЙ
              </motion.span>
              <motion.span 
                className="block bg-gradient-to-r from-gray-800 via-black to-gray-800 dark:from-gray-200 dark:via-white dark:to-gray-200 bg-clip-text text-transparent"
                animate={{ scale: [1, 1.05, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              >
                МЕНТОР
              </motion.span>
            </motion.h1>

            <motion.p 
              className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed font-light"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              Персональный AI-помощник для развития карьеры в IT
            </motion.p>
          </motion.div>

          {/* Advanced Stats with Magnetic Effect */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 max-w-3xl mx-auto"
          >
            {statsData.map((stat, index) => (
              <motion.div
                key={index}
                className="text-center group"
                whileHover={{ scale: 1.1, rotate: 360 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                style={{
                  transform: `translate3d(calc(var(--mouse-x) * ${(index - 1) * 0.02}), calc(var(--mouse-y) * ${(index - 1) * 0.02}), 0)`,
                  willChange: 'transform'
                }}
              >
                <motion.div
                  className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-black/10 dark:bg-white/10 backdrop-blur-sm rounded-2xl mb-3 sm:mb-4 border border-black/20 dark:border-white/20 group-hover:border-black/40 dark:group-hover:border-white/40 transition-all duration-300"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <motion.div 
                    className="text-xl sm:text-2xl text-black dark:text-white"
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  >
                    {stat.icon}
                  </motion.div>
                </motion.div>
                <motion.div 
                  className="text-2xl sm:text-3xl lg:text-4xl font-black text-black dark:text-white mb-1 sm:mb-2"
                  animate={{ scale: [1, 1.05, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: index * 0.2 }}
                >
                  {stat.value}
                </motion.div>
                <div className="text-gray-500 dark:text-gray-400 text-sm font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Main Content with optimized 3D effects */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Categories Sidebar with 3D Effect */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-1 order-2 lg:order-1"
          >
            <motion.div 
              className="bg-white/80 dark:bg-black/80 backdrop-blur-xl rounded-3xl border border-black/20 dark:border-white/20 p-6 sm:p-8 sticky top-6 shadow-xl"
              whileHover={{ scale: 1.01 }}
                              transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 30 }}
              style={{
                transform: `
                  perspective(600px) 
                  rotateX(calc(var(--mouse-y) * 0.01deg)) 
                  rotateY(calc(var(--mouse-x) * 0.01deg))
                `,
                willChange: 'transform'
              }}
            >
              <div className="flex items-center mb-6 sm:mb-8">
                <motion.div 
                  className="w-10 h-10 sm:w-12 sm:h-12 bg-black/10 dark:bg-white/10 rounded-2xl flex items-center justify-center mr-3 sm:mr-4 border border-black/20 dark:border-white/20"
                  whileHover={{ scale: 1.1, rotate: 360 }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                >
                  <FiMessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-black dark:text-white" />
                </motion.div>
                <h2 className="text-xl sm:text-2xl font-black text-black dark:text-white">Категории</h2>
              </div>
              
              <div className="space-y-4 sm:space-y-6">
                {categories.map((category, index) => (
                  <motion.div
                    key={category.id}
                    variants={itemVariants}
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <motion.button
                      onClick={() => handleCategorySelect(category.id)}
                      className={`w-full p-4 sm:p-6 rounded-2xl border-2 transition-all duration-500 ${
                        selectedCategory === category.id
                          ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black shadow-2xl'
                          : 'border-black/20 dark:border-white/20 bg-white/50 dark:bg-black/50 text-black dark:text-white hover:border-black/40 dark:hover:border-white/40 hover:bg-black/5 dark:hover:bg-white/5'
                      }`}
                      whileHover={{ 
                        boxShadow: selectedCategory === category.id 
                          ? "0 25px 50px -12px rgba(0, 0, 0, 0.25)" 
                          : "0 10px 25px -5px rgba(0, 0, 0, 0.1)"
                      }}
                      style={{
                        transform: `translate3d(calc(var(--mouse-x) * ${(index - 1.5) * 0.01}), calc(var(--mouse-y) * ${(index - 1.5) * 0.01}), 0)`,
                        willChange: 'transform'
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <motion.div 
                            className={`mr-3 sm:mr-4 p-2 sm:p-3 rounded-xl ${
                              selectedCategory === category.id 
                                ? 'bg-white text-black dark:bg-black dark:text-white' 
                                : 'bg-black/10 dark:bg-white/10 text-black dark:text-white'
                            }`}
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 0.6 }}
                          >
                            {category.icon}
                          </motion.div>
                          <span className="font-bold text-base sm:text-lg">{category.name}</span>
                        </div>
                        <motion.div
                          animate={{ rotate: selectedCategory === category.id ? 180 : 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <FiChevronsDown className="w-4 h-4 sm:w-5 sm:h-5" />
                        </motion.div>
                      </div>
                    </motion.button>

                    <AnimatePresence>
                      {selectedCategory === category.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.4, ease: "easeInOut" }}
                          className="mt-4 space-y-2 sm:space-y-3"
                        >
                          {category.questions.map((question, qIndex) => (
                            <motion.button
                              key={qIndex}
                              onClick={() => handleQuestionSelect(question)}
                              disabled={isLoading}
                              className="w-full p-3 sm:p-4 text-left text-sm bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-xl border border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20 transition-all duration-300 text-black dark:text-white"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: qIndex * 0.1 }}
                              whileHover={{ x: 8, scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              {question}
                            </motion.button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* Chat Area with 3D Effect */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-2 order-1 lg:order-2"
          >
            <motion.div 
              className="bg-white/80 dark:bg-black/80 backdrop-blur-xl rounded-3xl border border-black/20 dark:border-white/20 overflow-hidden shadow-2xl"
              whileHover={{ scale: 1.005 }}
                              transition={{ duration: 0.3, type: "spring", stiffness: 200, damping: 30 }}
              style={{
                transform: `
                  perspective(600px) 
                  rotateX(calc(var(--mouse-y) * 0.005deg)) 
                  rotateY(calc(var(--mouse-x) * 0.005deg))
                `,
                willChange: 'transform'
              }}
            >
              {/* Chat Header */}
              <ChatHeader />

              {/* Messages */}
              <div 
                ref={chatContainerRef}
                className="h-80 sm:h-96 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6"
              >
                <AnimatePresence>
                  {messages.map((message, index) => (
                    <Message 
                      key={message.id}
                      message={message} 
                      index={index} 
                      mouseX={mousePosition.x} 
                      mouseY={mousePosition.y} 
                    />
                  ))}
                </AnimatePresence>
                
                {/* AI Thinking Animation with Advanced Effects */}
                {aiThinking && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex justify-start p-4 sm:p-6 lg:p-8"
                    aria-live="polite"
                    aria-label="AI анализирует ваш запрос"
                  >
                    <motion.div 
                      className="flex items-center space-x-3 sm:space-x-4 bg-black/5 dark:bg-white/5 rounded-2xl p-4 sm:p-6 border border-black/10 dark:border-white/10 backdrop-blur-sm"
                      animate={{ x: [0, 10, 0], y: [0, -5, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                        className="w-8 h-8 bg-black dark:bg-white rounded-full flex items-center justify-center"
                      >
                        <BsLightbulb className="w-4 h-4 text-white dark:text-black" />
                      </motion.div>
                      <div className="flex space-x-1 sm:space-x-2">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            className="w-2 h-2 sm:w-3 sm:h-3 bg-black dark:bg-white rounded-full"
                            animate={{ scale: [1, 1.5, 1] }}
                            transition={{ 
                              duration: 1, 
                              repeat: Infinity, 
                              delay: i * 0.2 
                            }}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-black dark:text-white font-medium">AI анализирует...</span>
                    </motion.div>
                  </motion.div>
                )}

                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex justify-start p-4 sm:p-6 lg:p-8"
                    aria-live="polite"
                    aria-label="AI обрабатывает ваш запрос"
                  >
                    <motion.div 
                      className="flex items-center space-x-3 sm:space-x-4 bg-black/5 dark:bg-white/5 rounded-2xl p-4 sm:p-6 border border-black/10 dark:border-white/10 backdrop-blur-sm"
                      animate={{ x: [0, 10, 0], y: [0, -5, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <div className="flex space-x-1 sm:space-x-2">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            className="w-2 h-2 sm:w-3 sm:h-3 bg-black dark:bg-white rounded-full"
                            animate={{ scale: [1, 1.5, 1] }}
                            transition={{ 
                              duration: 1, 
                              repeat: Infinity, 
                              delay: i * 0.2 
                            }}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-black dark:text-white font-medium">AI думает...</span>
                    </motion.div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <ChatInput 
                input={input}
                setInput={setInput}
                onSend={(text) => { void handleSendMessage(text); }}
                isLoading={isLoading}
              />
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll to Bottom Button with Magnetic Effect */}
      <AnimatePresence>
        {showScrollButton && (
          <motion.button
            initial={{ opacity: 0, scale: 0, rotate: -180 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0, rotate: 180 }}
            onClick={scrollToBottom}
            className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 w-12 h-12 sm:w-14 sm:h-14 bg-black text-white dark:bg-white dark:text-black rounded-2xl shadow-2xl hover:shadow-black/25 dark:hover:shadow-white/25 transition-all duration-300 z-50 font-bold"
            whileHover={{ scale: 1.1, rotate: 360 }}
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            style={{
              transform: `translate3d(calc(var(--mouse-x) * 0.02), calc(var(--mouse-y) * 0.02), 0)`,
              willChange: 'transform'
            }}
            aria-label="Прокрутить к последнему сообщению"
          >
            <BsArrowUpCircle className="w-6 h-6 sm:w-7 sm:h-7 mx-auto" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIMentor; 