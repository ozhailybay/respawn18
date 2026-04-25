import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateText } from '../api/gemini';
import { useAuth } from '../hooks/useAuth';
import { 
  FiSend, FiMic, FiMicOff, FiStar, FiBookOpen, FiFileText, FiTrendingUp, 
  FiUser, FiDownload, FiZap, FiUsers, FiSettings, FiTrash2, FiMessageCircle, 
  FiBarChart, FiTarget, FiBriefcase, FiCpu, FiHeart, FiLightbulb, FiRocket,
  FiTrendingDown, FiClock, FiAward, FiGlobe, FiCode, FiDatabase, FiTool,
  FiSmile, FiThumbsUp, FiEye, FiHeadphones, FiPlay, FiPause, FiVolume2,
  FiVolumeX, FiRefreshCw, FiCopy, FiShare2, FiBookmark, FiFlag
} from 'react-icons/fi';
import { 
  BsRobot, BsStars, BsLightning, BsGear, BsMagic, BsShield, BsGem,
  BsRocket, BsBrain, BsEmojiSmile, BsChat, BsQuestionCircle, BsCheckCircle
} from 'react-icons/bs';

// Types
interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  isError?: boolean;
  model?: string;
  category?: string;
  confidence?: number;
  suggestions?: string[];
  resources?: Array<{
    title: string;
    url: string;
    type: 'article' | 'video' | 'course' | 'tool';
  }>;
}

interface CareerGoal {
  id: string;
  title: string;
  description: string;
  progress: number;
  deadline: Date;
  priority: 'high' | 'medium' | 'low';
  category: string;
}

interface AIPersonality {
  name: string;
  avatar: string;
  description: string;
  specialties: string[];
  tone: 'professional' | 'friendly' | 'casual' | 'motivational';
}

const EnhancedAIMentor: React.FC = () => {
  const { user, userData } = useAuth();
  
  // Core state
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('general');
  
  // Enhanced features
  const [isListening, setIsListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [currentPersonality, setCurrentPersonality] = useState<AIPersonality>({
    name: 'Алекс',
    avatar: '🤖',
    description: 'Ваш персональный карьерный ментор',
    specialties: ['Карьерное планирование', 'Развитие навыков', 'Поиск работы'],
    tone: 'friendly'
  });
  
  // UI state
  const [showSettings, setShowSettings] = useState(false);
  const [showGoals, setShowGoals] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);
  
  // AI Personalities
  const personalities: AIPersonality[] = [
    {
      name: 'Алекс',
      avatar: '🤖',
      description: 'Универсальный карьерный ментор',
      specialties: ['Карьерное планирование', 'Развитие навыков'],
      tone: 'friendly'
    },
    {
      name: 'Мария',
      avatar: '👩‍💼',
      description: 'Эксперт по HR и рекрутингу',
      specialties: ['Собеседования', 'Резюме', 'Нетворкинг'],
      tone: 'professional'
    },
    {
      name: 'Дмитрий',
      avatar: '👨‍💻',
      description: 'IT-ментор и технический эксперт',
      specialties: ['Программирование', 'Технологии', 'Стартапы'],
      tone: 'casual'
    },
    {
      name: 'Анна',
      avatar: '🌟',
      description: 'Мотивационный коуч',
      specialties: ['Мотивация', 'Личностный рост', 'Лидерство'],
      tone: 'motivational'
    }
  ];

  // Quick questions by category
  const quickQuestions = {
    general: [
      'Как выбрать карьерный путь?',
      'Какие навыки нужны для успеха?',
      'Как найти работу мечты?',
      'Как развиваться профессионально?'
    ],
    interview: [
      'Как подготовиться к собеседованию?',
      'Какие вопросы задают на интервью?',
      'Как отвечать на сложные вопросы?',
      'Как произвести хорошее впечатление?'
    ],
    resume: [
      'Как написать эффективное резюме?',
      'Какие ключевые слова использовать?',
      'Как выделиться среди кандидатов?',
      'Как описать опыт работы?'
    ],
    skills: [
      'Какие навыки развивать в 2024?',
      'Как изучать новые технологии?',
      'Где найти курсы и обучение?',
      'Как получить сертификаты?'
    ],
    networking: [
      'Как строить профессиональные связи?',
      'Где найти менторов?',
      'Как участвовать в отраслевых событиях?',
      'Как использовать LinkedIn эффективно?'
    ]
  };

  // Initialize welcome message
  useEffect(() => {
    const welcomeMessage: Message = {
      id: 'welcome',
      content: `Привет${userData?.displayName ? `, ${userData.displayName}` : ''}! 👋 

Я ${currentPersonality.name}, твой AI-карьерный ментор. Я здесь, чтобы помочь тебе:

✨ **Планировать карьеру** - выбрать направление и построить план развития
🎯 **Развивать навыки** - определить, что изучать и как это делать эффективно  
💼 **Найти работу** - подготовиться к поиску и собеседованиям
📝 **Улучшить резюме** - сделать его привлекательным для работодателей
🤝 **Строить связи** - научиться нетворкингу и профессиональному общению

Выбери категорию ниже или просто расскажи, с чем тебе нужна помощь!`,
      sender: 'ai',
      timestamp: new Date(),
      category: 'welcome',
      confidence: 100
    };
    
    setMessages([welcomeMessage]);
  }, [userData?.displayName, currentPersonality.name]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Speech recognition setup
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'ru-RU';
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };
      
      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  // Handle voice input
  const toggleVoiceInput = () => {
    if (!recognitionRef.current) return;
    
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  // Handle sending a message
  const handleSendMessage = async (e?: React.FormEvent, questionText?: string) => {
    if (e) e.preventDefault();
    
    const messageText = questionText || input;
    if (!messageText.trim() || isLoading) return;

    // Create user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageText,
      sender: 'user',
      timestamp: new Date(),
      category: selectedCategory
    };

    // Add user message to chat
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setIsTyping(true);
    
    try {
      // Get user context
      const userName = user?.displayName || userData?.displayName || 'there';
      const userRole = userData?.role || 'job seeker';
      const userSkills = userData?.skills || [];
      const userInterests = userData?.interests || [];
      
      // Create enhanced context for AI
      const context = `
        You are ${currentPersonality.name}, a ${currentPersonality.description.toLowerCase()} with a ${currentPersonality.tone} tone.
        
        User Information:
        - Name: ${userName}
        - Role: ${userRole}
        - Skills: ${userSkills.join(', ') || 'Not specified'}
        - Interests: ${userInterests.join(', ') || 'Not specified'}
        - Category: ${selectedCategory}
        
        Your specialties: ${currentPersonality.specialties.join(', ')}
        
        Please provide a helpful, personalized response that matches your personality and tone.
        Include practical advice, actionable steps, and relevant resources when possible.
        Use emojis appropriately and maintain an encouraging, professional demeanor.
        
        If the question is about career planning, provide specific steps and timelines.
        If about skills, suggest concrete learning resources and practice methods.
        If about job search, give tactical advice for applications and interviews.
        If about networking, provide specific strategies and platforms.
        
        Format your response with clear sections and bullet points where helpful.
      `;
      
      // Generate AI response
      const response = await generateText(messageText, context);
      
      // Handle different response types
      let aiResponseText = 'Извините, я не смог обработать ваш запрос. Пожалуйста, попробуйте еще раз.';
      let confidence = 50;
      
      if (typeof response === 'string') {
        aiResponseText = response;
        confidence = 85;
      } else if (response && typeof response === 'object') {
        if ((response as any).success && (response as any).text) {
          aiResponseText = (response as any).text;
          confidence = 90;
        } else if ((response as any).error) {
          aiResponseText = `Ошибка: ${(response as any).error}`;
          confidence = 0;
        }
      }
      
      // Generate suggestions based on the response
      const suggestions = generateSuggestions(messageText, selectedCategory);
      
      // Create AI message
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponseText,
        sender: 'ai',
        timestamp: new Date(),
        model: 'gemini-pro',
        category: selectedCategory,
        confidence,
        suggestions
      };
      
      // Add AI message to chat
      setMessages(prev => [...prev, aiMessage]);
      
      // Speak response if voice is enabled
      if (voiceEnabled && 'speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(aiResponseText);
        utterance.lang = 'ru-RU';
        utterance.rate = 0.9;
        speechSynthesis.speak(utterance);
      }
      
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Произошла ошибка при обработке вашего запроса. Пожалуйста, попробуйте еще раз.',
        sender: 'ai',
        timestamp: new Date(),
        isError: true,
        confidence: 0
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  // Generate follow-up suggestions
  const generateSuggestions = (question: string, category: string): string[] => {
    const suggestions: { [key: string]: string[] } = {
      general: [
        'Расскажи больше о планировании карьеры',
        'Какие тренды в моей отрасли?',
        'Как найти ментора?'
      ],
      interview: [
        'Примеры ответов на популярные вопросы',
        'Как подготовиться к техническому интервью?',
        'Что спросить у интервьюера?'
      ],
      resume: [
        'Проанализируй мое резюме',
        'Как адаптировать резюме под вакансию?',
        'Примеры сопроводительных писем'
      ],
      skills: [
        'Составь план обучения',
        'Бесплатные ресурсы для изучения',
        'Как получить практический опыт?'
      ],
      networking: [
        'Как найти профессиональные события?',
        'Стратегии для интровертов',
        'Как поддерживать связи?'
      ]
    };
    
    return suggestions[category] || suggestions.general;
  };

  // Handle quick question
  const handleQuickQuestion = (question: string) => {
    handleSendMessage(undefined, question);
  };

  // Clear chat
  const clearChat = () => {
    setMessages([]);
    const welcomeMessage: Message = {
      id: 'welcome',
      content: `Чат очищен! Как дела, ${userData?.displayName || 'друг'}? С чем поможем сегодня? 🚀`,
      sender: 'ai',
      timestamp: new Date(),
      category: 'welcome'
    };
    setMessages([welcomeMessage]);
  };

  // Copy message
  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    // You could add a toast notification here
  };

  return (
    <div className={`relative min-h-screen transition-all duration-500 ${
      darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
    }`}>
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ 
            x: [0, 100, 0],
            y: [0, -50, 0],
            rotate: [0, 180, 360]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-xl"
        />
        <motion.div
          animate={{ 
            x: [0, -80, 0],
            y: [0, 100, 0],
            rotate: [360, 180, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-xl"
        />
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-indigo-400/10 to-cyan-400/10 rounded-full blur-3xl"
        />
      </div>

      {/* Main container */}
      <div className="container mx-auto px-4 py-8 max-w-6xl relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center mb-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="mr-3"
            >
              <BsRobot className="w-12 h-12 text-indigo-600" />
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              AI Карьерный Ментор
            </h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Персональный AI-помощник для развития карьеры с продвинутыми возможностями
          </p>
        </motion.div>

        {/* Personality selector */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-6"
        >
          <div className="flex flex-wrap justify-center gap-4 mb-6">
            {personalities.map((personality) => (
              <motion.button
                key={personality.name}
                onClick={() => setCurrentPersonality(personality)}
                className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                  currentPersonality.name === personality.name
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-indigo-300'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="text-center">
                  <div className="text-3xl mb-2">{personality.avatar}</div>
                  <div className="font-semibold text-gray-800 dark:text-gray-200">
                    {personality.name}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {personality.description}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Category selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-6"
        >
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {Object.keys(quickQuestions).map((category) => (
              <motion.button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  selectedCategory === category
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {category === 'general' ? 'Общие' :
                 category === 'interview' ? 'Собеседования' :
                 category === 'resume' ? 'Резюме' :
                 category === 'skills' ? 'Навыки' :
                 category === 'networking' ? 'Нетворкинг' : category}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Quick questions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {quickQuestions[selectedCategory as keyof typeof quickQuestions]?.map((question, index) => (
              <motion.button
                key={index}
                onClick={() => handleQuickQuestion(question)}
                className="p-4 text-left bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-indigo-300 hover:shadow-md transition-all duration-300"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center">
                  <BsQuestionCircle className="w-5 h-5 text-indigo-500 mr-3 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">{question}</span>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Chat interface */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
        >
          {/* Chat header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="text-2xl mr-3">{currentPersonality.avatar}</div>
                <div>
                  <div className="text-white font-semibold">{currentPersonality.name}</div>
                  <div className="text-indigo-100 text-sm">{currentPersonality.description}</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <motion.button
                  onClick={() => setVoiceEnabled(!voiceEnabled)}
                  className={`p-2 rounded-full transition-all duration-300 ${
                    voiceEnabled ? 'bg-white/20 text-white' : 'bg-white/10 text-indigo-200'
                  }`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {voiceEnabled ? <FiVolume2 className="w-5 h-5" /> : <FiVolumeX className="w-5 h-5" />}
                </motion.button>
                <motion.button
                  onClick={clearChat}
                  className="p-2 rounded-full bg-white/10 text-indigo-200 hover:bg-white/20 hover:text-white transition-all duration-300"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <FiRefreshCw className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div 
            ref={chatContainerRef}
            className="h-96 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900"
          >
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs lg:max-w-md xl:max-w-lg ${
                    message.sender === 'user' ? 'order-2' : 'order-1'
                  }`}>
                    <div className={`p-4 rounded-2xl ${
                      message.sender === 'user'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700'
                    } ${message.isError ? 'bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-700' : ''}`}>
                      <div className="whitespace-pre-wrap">{message.content}</div>
                      
                      {/* Message metadata */}
                      <div className="flex items-center justify-between mt-2 text-xs opacity-70">
                        <span>
                          {message.timestamp.toLocaleTimeString('ru-RU', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                        {message.sender === 'ai' && message.confidence && (
                          <span className="flex items-center">
                            <BsCheckCircle className="w-3 h-3 mr-1" />
                            {message.confidence}%
                          </span>
                        )}
                      </div>
                      
                      {/* Suggestions */}
                      {message.suggestions && message.suggestions.length > 0 && (
                        <div className="mt-3 space-y-2">
                          <div className="text-xs font-medium opacity-70">Предложения:</div>
                          {message.suggestions.map((suggestion, index) => (
                            <motion.button
                              key={index}
                              onClick={() => handleQuickQuestion(suggestion)}
                              className="block w-full text-left p-2 text-xs bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              {suggestion}
                            </motion.button>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {/* Message actions */}
                    {message.sender === 'ai' && (
                      <div className="flex items-center space-x-2 mt-2">
                        <motion.button
                          onClick={() => copyMessage(message.content)}
                          className="p-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <FiCopy className="w-3 h-3" />
                        </motion.button>
                        <motion.button
                          className="p-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <FiThumbsUp className="w-3 h-3" />
                        </motion.button>
                      </div>
                    )}
                  </div>
                  
                  {/* Avatar */}
                  <div className={`flex-shrink-0 ${
                    message.sender === 'user' ? 'order-1 mr-3' : 'order-2 ml-3'
                  }`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                      message.sender === 'user'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                    }`}>
                      {message.sender === 'user' ? (
                        <FiUser className="w-4 h-4" />
                      ) : (
                        <span>{currentPersonality.avatar}</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {/* Typing indicator */}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 p-3 rounded-2xl border border-gray-200 dark:border-gray-700">
                  <div className="text-sm">{currentPersonality.avatar}</div>
                  <div className="flex space-x-1">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                      className="w-2 h-2 bg-indigo-500 rounded-full"
                    />
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                      className="w-2 h-2 bg-indigo-500 rounded-full"
                    />
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                      className="w-2 h-2 bg-indigo-500 rounded-full"
                    />
                  </div>
                </div>
              </motion.div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            <form onSubmit={handleSendMessage} className="flex items-end space-x-3">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={`Спросите ${currentPersonality.name} о карьере...`}
                  className="w-full p-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                  rows={1}
                  style={{ minHeight: '44px', maxHeight: '120px' }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                
                {/* Voice input button */}
                {recognitionRef.current && (
                  <motion.button
                    type="button"
                    onClick={toggleVoiceInput}
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full transition-all duration-300 ${
                      isListening 
                        ? 'bg-red-500 text-white' 
                        : 'bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-500'
                    }`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {isListening ? <FiMicOff className="w-4 h-4" /> : <FiMic className="w-4 h-4" />}
                  </motion.button>
                )}
              </div>
              
              <motion.button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <FiRefreshCw className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <FiSend className="w-5 h-5" />
                )}
              </motion.button>
            </form>
          </div>
        </motion.div>

        {/* Features showcase */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <motion.div
            className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300"
            whileHover={{ scale: 1.02, y: -5 }}
          >
            <div className="flex items-center mb-4">
              <BsLightning className="w-6 h-6 text-yellow-500 mr-3" />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                Мгновенные ответы
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Получайте персонализированные советы по карьере в реальном времени
            </p>
          </motion.div>

          <motion.div
            className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300"
            whileHover={{ scale: 1.02, y: -5 }}
          >
            <div className="flex items-center mb-4">
              <BsBrain className="w-6 h-6 text-purple-500 mr-3" />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                Умные рекомендации
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              AI анализирует ваш профиль и предлагает конкретные шаги для роста
            </p>
          </motion.div>

          <motion.div
            className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300"
            whileHover={{ scale: 1.02, y: -5 }}
          >
            <div className="flex items-center mb-4">
              <BsGem className="w-6 h-6 text-indigo-500 mr-3" />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                Экспертные знания
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Доступ к знаниям лучших карьерных консультантов и HR-экспертов
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default EnhancedAIMentor; 