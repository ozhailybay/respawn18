import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import { 
  FiArrowRight, FiTrendingUp, FiUsers, FiFileText, FiBriefcase, 
  FiStar, FiZap, FiTarget, FiHeart, FiPlay, FiCheck, FiGlobe,
  FiShield, FiCode, FiEye, FiClock, FiAward, FiTrendingDown,
  FiBarChart, FiLayers, FiSmile, FiThumbsUp, FiMoon, FiSun,
  FiSearch, FiMail, FiPhone, FiMapPin, FiCalendar, FiDownload
} from 'react-icons/fi';
import { 
  FaUserGraduate, FaCheckCircle, FaBuilding, FaBriefcase, 
  FaUsers, FaRocket, FaMagic, FaGamepad, FaMusic, FaFire,
  FaBolt, FaGem, FaCrown, FaInfinity, FaAtom, FaSpaceShuttle,
  FaRobot, FaBrain, FaLightbulb, FaChartLine, FaHandshake
} from 'react-icons/fa';

const MinimalistLanding = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [currentFeature, setCurrentFeature] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const statsRef = useRef(null);
  
  const { scrollY: scrollYProgress } = useScroll();
  const heroInView = useInView(heroRef, { once: true });
  const featuresInView = useInView(featuresRef, { once: true });
  const statsInView = useInView(statsRef, { once: true });
  
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.3], [1, 0.8]);

  // Mouse tracking and window resize
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Auto-rotate features
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Floating particles generator
  const generateFloatingElements = () => {
    const isMobile = windowWidth < 768;
    const elementCount = isMobile ? 15 : 30;
    
    return Array.from({ length: elementCount }, (_, i) => (
      <motion.div
        key={i}
        className="absolute w-1 h-1 sm:w-2 sm:h-2 bg-black/5 dark:bg-white/5 rounded-full"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
        }}
        animate={{
          y: [0, -40, 0],
          x: [0, Math.random() * 30 - 15, 0],
          opacity: [0.05, 0.3, 0.05],
          scale: [1, 1.5, 1],
        }}
        transition={{
          duration: 6 + Math.random() * 4,
          repeat: Infinity,
          delay: Math.random() * 3,
          ease: "easeInOut"
        }}
      />
    ));
  };

  const features = [
    {
      icon: FaRobot,
      title: "AI-Powered Matching",
      subtitle: "Умный подбор",
      description: "Искусственный интеллект анализирует ваш профиль и находит идеальные вакансии за секунды",
      color: "from-purple-600 to-pink-600",
      stats: "99.2% точность",
      delay: 0.1
    },
    {
      icon: FaBrain,
      title: "Smart Analytics",
      subtitle: "Умная аналитика",
      description: "Глубокая аналитика рынка труда поможет принимать правильные карьерные решения",
      color: "from-blue-600 to-cyan-600",
      stats: "50K+ инсайтов",
      delay: 0.2
    },
    {
      icon: FaLightbulb,
      title: "Career Insights",
      subtitle: "Карьерные инсайты",
      description: "Персональные рекомендации для роста и развития на основе трендов индустрии",
      color: "from-yellow-500 to-orange-500",
      stats: "24/7 поддержка",
      delay: 0.3
    },
    {
      icon: FaChartLine,
      title: "Growth Tracking",
      subtitle: "Отслеживание роста",
      description: "Следите за своим карьерным прогрессом и достигайте новых высот",
      color: "from-green-500 to-emerald-500",
      stats: "300% рост",
      delay: 0.4
    },
    {
      icon: FaHandshake,
      title: "Network Building",
      subtitle: "Нетворкинг",
      description: "Создавайте профессиональные связи с лидерами индустрии",
      color: "from-indigo-600 to-purple-600",
      stats: "10K+ контактов",
      delay: 0.5
    },
    {
      icon: FaRocket,
      title: "Fast Deployment",
      subtitle: "Быстрое трудоустройство",
      description: "Средний срок трудоустройства через нашу платформу - всего 7 дней",
      color: "from-red-500 to-pink-500",
      stats: "7 дней в среднем",
      delay: 0.6
    }
  ];

  const stats = [
    { 
      number: "50K+", 
      label: "Активных пользователей",
      icon: FiUsers,
      color: "text-purple-600",
      description: "Растущее сообщество"
    },
    { 
      number: "2.5K+", 
      label: "Партнерских компаний",
      icon: FiGlobe,
      color: "text-blue-600",
      description: "Проверенные работодатели"
    },
    { 
      number: "98%", 
      label: "Успешных трудоустройств",
      icon: FiTarget,
      color: "text-green-600",
      description: "Высокая эффективность"
    },
    { 
      number: "4.9", 
      label: "Рейтинг платформы",
      icon: FiStar,
      color: "text-yellow-600",
      description: "Отзывы пользователей"
    }
  ];

  const testimonials = [
    {
      name: "Айгүл Нұрланова",
      role: "Senior Frontend Developer",
      company: "Kaspi.kz",
      text: "Respawn изменил мою жизнь! Нашла работу мечты всего за 5 дней. AI-рекомендации просто невероятные!",
      rating: 5,
      avatar: "https://i.pravatar.cc/150?img=1",
      salary: "+150%"
    },
    {
      name: "Ерлан Қасымов",
      role: "Product Manager",
      company: "Beeline Kazakhstan",
      text: "Платформа будущего! Интуитивный интерфейс, умные рекомендации и отличная поддержка.",
      rating: 5,
      avatar: "https://i.pravatar.cc/150?img=2",
      salary: "+200%"
    },
    {
      name: "Мәдина Сәрсенова",
      role: "UX/UI Designer",
      company: "Halyk Bank",
      text: "Благодаря Respawn я не только нашла работу, но и построила карьеру. Рекомендую всем!",
      rating: 5,
      avatar: "https://i.pravatar.cc/150?img=3",
      salary: "+180%"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 60, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  const floatingVariants = {
    animate: {
      y: [0, -30, 0],
      rotate: [0, 5, -5, 0],
      scale: [1, 1.05, 1],
      transition: {
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black transition-all duration-700 overflow-hidden relative">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Dynamic Grid */}
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] dark:opacity-[0.05]" />
        
        {/* Floating Geometric Shapes */}
        <motion.div
          animate={{
            rotate: [0, 360],
            scale: [1, 1.2, 1],
            opacity: [0.03, 0.08, 0.03]
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -top-40 -left-40 w-80 h-80 sm:w-96 sm:h-96 border border-black/5 dark:border-white/5 rounded-full"
        />
        
        <motion.div
          animate={{
            rotate: [360, 0],
            scale: [1, 1.3, 1],
            opacity: [0.05, 0.1, 0.05]
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -bottom-40 -right-40 w-96 h-96 sm:w-[500px] sm:h-[500px] border border-black/5 dark:border-white/5 rounded-full"
        />

        {/* Floating Particles */}
        <AnimatePresence>
          {generateFloatingElements()}
        </AnimatePresence>

        {/* Dynamic Lines */}
        {Array.from({ length: windowWidth < 768 ? 3 : 6 }, (_, i) => (
          <motion.div
            key={i}
            className="absolute w-px h-full bg-gradient-to-b from-transparent via-black/5 dark:via-white/5 to-transparent"
            style={{
              left: `${15 + (i * 15)}%`,
            }}
            animate={{
              opacity: [0.05, 0.2, 0.05],
              scaleY: [1, 1.2, 1],
            }}
            transition={{
              duration: 4 + (i * 0.5),
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </div>

      {/* Custom Cursor */}
      {windowWidth >= 768 && (
        <motion.div
          className="fixed w-4 h-4 bg-black/10 dark:bg-white/10 rounded-full pointer-events-none z-50 mix-blend-difference"
          animate={{
            x: mousePosition.x - 8,
            y: mousePosition.y - 8,
            scale: isHovered ? 3 : 1,
          }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 28
          }}
        />
      )}

      {/* Hero Section */}
      <motion.section 
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16"
        style={{ opacity, scale }}
      >
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <AnimatePresence>
            {heroInView && (
              <motion.div
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -100 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              >
                {/* Floating Status Badge */}
                <motion.div
                  variants={floatingVariants}
                  animate="animate"
                  className="inline-flex items-center px-4 py-2 sm:px-6 sm:py-3 mb-8 sm:mb-12 bg-black/5 dark:bg-white/5 backdrop-blur-sm rounded-full border border-black/10 dark:border-white/10 shadow-lg"
                >
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  >
                    <FaFire className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500 mr-2 sm:mr-3" />
                  </motion.div>
                  <span className="text-sm sm:text-base font-bold text-black/80 dark:text-white/80">
                    #1 AI-платформа для карьеры в Казахстане
                  </span>
                </motion.div>

                {/* Main Heading with Staggered Animation */}
                <motion.div className="mb-8 sm:mb-12">
                  <motion.h1 
                    className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-[12rem] font-black text-black dark:text-white mb-4 sm:mb-6 tracking-tighter leading-none"
                    initial={{ opacity: 0, y: 100 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 1 }}
                  >
                    <motion.span
                      className="inline-block"
                      whileHover={{ 
                        scale: 1.05,
                        textShadow: "0 0 20px rgba(0,0,0,0.3)"
                      }}
                    >
                      RESPAWN
                    </motion.span>
                  </motion.h1>
                  
                  <motion.div
                    className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-light text-black/70 dark:text-white/70 leading-tight"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 1 }}
                  >
                    <span className="font-thin">Будущее</span>{' '}
                    <motion.span 
                      className="font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent"
                      animate={{ 
                        backgroundPosition: ["0%", "100%", "0%"] 
                      }}
                      transition={{ 
                        duration: 3, 
                        repeat: Infinity 
                      }}
                    >
                      карьеры
                    </motion.span>{' '}
                    <span className="font-thin">уже</span>{' '}
                    <motion.span 
                      className="font-bold text-green-600"
                      animate={{ 
                        scale: [1, 1.1, 1] 
                      }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity 
                      }}
                    >
                      здесь
                    </motion.span>
                  </motion.div>
                </motion.div>

                {/* Description with Typewriter Effect */}
                <motion.p
                  className="text-base sm:text-lg md:text-xl lg:text-2xl text-black/60 dark:text-white/60 mb-12 sm:mb-16 max-w-4xl mx-auto font-light leading-relaxed px-4"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 1 }}
                >
                  Революционная AI-платформа нового поколения для поиска работы и построения карьеры. 
                  Мы соединяем таланты с возможностями, используя силу искусственного интеллекта.
                </motion.p>

                {/* Enhanced CTA Buttons */}
                <motion.div
                  className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center mb-16 sm:mb-20"
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 1 }}
                >
                  <motion.div
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    onHoverStart={() => setIsHovered(true)}
                    onHoverEnd={() => setIsHovered(false)}
                  >
                    <Link
                      to="/signup"
                      className="group relative px-8 sm:px-12 py-4 sm:py-5 bg-black dark:bg-white text-white dark:text-black text-base sm:text-lg font-bold rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center overflow-hidden min-w-[200px] justify-center"
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        layoutId="button-bg"
                      />
                      <span className="relative z-10 mr-3">Начать карьеру</span>
                      <motion.div
                        className="relative z-10"
                        animate={{ x: [0, 5, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                      >
                        <FiArrowRight className="w-5 h-5" />
                      </motion.div>
                    </Link>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      to="/jobs"
                      className="group px-8 sm:px-12 py-4 sm:py-5 bg-transparent border-2 border-black/20 dark:border-white/20 text-black dark:text-white text-base sm:text-lg font-medium rounded-2xl hover:bg-black/5 dark:hover:bg-white/5 hover:border-black/40 dark:hover:border-white/40 transition-all duration-300 flex items-center backdrop-blur-sm min-w-[200px] justify-center"
                    >
                      <FiPlay className="w-5 h-5 mr-3" />
                      Смотреть демо
                    </Link>
                  </motion.div>
                </motion.div>

                {/* Enhanced Social Proof */}
                <motion.div
                  className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12 text-sm sm:text-base text-black/50 dark:text-white/50"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1, duration: 1 }}
                >
                  <div className="flex items-center">
                    <div className="flex -space-x-2">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <motion.img
                          key={i}
                          src={`https://i.pravatar.cc/40?img=${i}`}
                          alt={`User ${i}`}
                          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-white dark:border-black shadow-lg"
                          whileHover={{ scale: 1.3, zIndex: 10 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        />
                      ))}
                    </div>
                    <span className="ml-4 font-medium">50,000+ довольных пользователей</span>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="flex text-yellow-500 mr-2">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <motion.div
                          key={i}
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ delay: 1 + (i * 0.1), type: "spring" }}
                        >
                          <FiStar className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                        </motion.div>
                      ))}
                    </div>
                    <span className="font-medium">4.9/5 рейтинг</span>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 sm:bottom-12 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 sm:w-8 sm:h-12 border-2 border-black/20 dark:border-white/20 rounded-full flex justify-center">
            <motion.div
              className="w-1 h-3 sm:w-1.5 sm:h-4 bg-black/40 dark:bg-white/40 rounded-full mt-2"
              animate={{ y: [0, 16, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </motion.section>

      {/* Features Section */}
      <motion.section 
        ref={featuresRef}
        className="relative py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8"
        style={{ y: y2 }}
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={featuresInView ? "visible" : "hidden"}
            className="text-center mb-16 sm:mb-20"
          >
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center px-4 py-2 sm:px-6 sm:py-3 mb-6 sm:mb-8 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-full border border-purple-200/50 dark:border-purple-800/50"
            >
              <FaMagic className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400 mr-2 sm:mr-3" />
              <span className="text-sm sm:text-base font-bold text-purple-600 dark:text-purple-400">
                Технологии будущего
              </span>
            </motion.div>

            <motion.h2 
              variants={itemVariants}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-black dark:text-white mb-6 sm:mb-8 leading-tight px-4"
            >
              Почему <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">Respawn</span> — это{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">революция</span>?
            </motion.h2>

            <motion.p
              variants={itemVariants}
              className="text-lg sm:text-xl md:text-2xl text-black/60 dark:text-white/60 max-w-4xl mx-auto font-light leading-relaxed px-4"
            >
              Мы создали платформу, которая использует передовые технологии ИИ 
              для полной трансформации процесса поиска работы и построения карьеры
            </motion.p>
          </motion.div>

          {/* Interactive Features Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={featuresInView ? "visible" : "hidden"}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ 
                  scale: 1.03, 
                  y: -10,
                  rotateY: windowWidth >= 768 ? 5 : 0,
                  rotateX: windowWidth >= 768 ? 5 : 0
                }}
                className="group relative p-6 sm:p-8 bg-white/60 dark:bg-black/60 backdrop-blur-xl rounded-3xl border border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20 transition-all duration-500 overflow-hidden cursor-pointer"
                style={{
                  perspective: "1000px",
                  transformStyle: "preserve-3d"
                }}
              >
                {/* Animated Background Gradient */}
                <motion.div 
                  className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-3xl`}
                  animate={{ 
                    scale: [1, 1.05, 1],
                    opacity: [0, 0.05, 0]
                  }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity,
                    delay: index * 0.2
                  }}
                />
                
                {/* Floating Icon Container */}
                <motion.div
                  className={`relative z-10 w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center text-white mb-6 shadow-2xl`}
                  whileHover={{ 
                    rotate: [0, -10, 10, 0],
                    scale: 1.1
                  }}
                  transition={{ duration: 0.6 }}
                >
                  <feature.icon className="w-6 h-6 sm:w-8 sm:h-8" />
                </motion.div>

                {/* Content */}
                <div className="relative z-10">
                  <h3 className="text-xl sm:text-2xl font-bold text-black dark:text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-pink-600 transition-all duration-300">
                    {feature.title}
                  </h3>
                  
                  <p className="text-sm sm:text-base text-purple-600 dark:text-purple-400 font-semibold mb-4">
                    {feature.subtitle}
                  </p>
                  
                  <p className="text-black/60 dark:text-white/60 leading-relaxed text-sm sm:text-base mb-4">
                    {feature.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-bold text-green-600 dark:text-green-400">
                      {feature.stats}
                    </span>
                    
                    <motion.div
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      whileHover={{ scale: 1.2, x: 5 }}
                    >
                      <FiArrowRight className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                    </motion.div>
                  </div>
                </div>

                {/* Hover Effect Particles */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                  {Array.from({ length: 5 }, (_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1 h-1 bg-purple-400 rounded-full"
                      style={{
                        left: `${20 + (i * 15)}%`,
                        top: `${20 + (i * 10)}%`,
                      }}
                      animate={{
                        y: [0, -20, 0],
                        opacity: [0, 1, 0],
                        scale: [0, 1, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.2,
                      }}
                    />
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Stats Section */}
      <motion.section 
        ref={statsRef}
        className="relative py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black"
        style={{ y: y1 }}
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16 sm:mb-20"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-black dark:text-white mb-6 sm:mb-8 px-4">
              Цифры, которые впечатляют
            </h2>
            <p className="text-lg sm:text-xl text-black/60 dark:text-white/60 max-w-2xl mx-auto px-4">
              Результаты, которые говорят сами за себя
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={statsInView ? "visible" : "hidden"}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-10"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ 
                  scale: 1.05, 
                  y: -10,
                  rotateY: windowWidth >= 768 ? 10 : 0
                }}
                className="text-center group relative p-6 sm:p-8 bg-white/70 dark:bg-black/70 backdrop-blur-xl rounded-3xl border border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20 transition-all duration-500 overflow-hidden"
              >
                {/* Animated Background */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  animate={{
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: index * 0.3
                  }}
                />

                <motion.div
                  className={`relative z-10 w-14 h-14 sm:w-16 sm:h-16 ${stat.color} rounded-2xl flex items-center justify-center mx-auto mb-6 bg-opacity-10 group-hover:bg-opacity-20 transition-all duration-300 shadow-lg`}
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.8 }}
                >
                  <stat.icon className={`w-6 h-6 sm:w-8 sm:h-8 ${stat.color}`} />
                </motion.div>

                <motion.div
                  className="relative z-10 text-3xl sm:text-4xl md:text-5xl font-black text-black dark:text-white mb-2 sm:mb-3"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ 
                    delay: index * 0.1, 
                    type: "spring", 
                    stiffness: 200,
                    damping: 10
                  }}
                >
                  {stat.number}
                </motion.div>
                
                <p className="relative z-10 text-black/70 dark:text-white/70 font-bold text-base sm:text-lg mb-2">
                  {stat.label}
                </p>
                
                <p className="relative z-10 text-black/50 dark:text-white/50 text-sm">
                  {stat.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Testimonials Section */}
      <motion.section className="relative py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16 sm:mb-20"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-black dark:text-white mb-6 sm:mb-8 px-4">
              Истории <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">успеха</span>
            </h2>
            <p className="text-lg sm:text-xl text-black/60 dark:text-white/60 max-w-3xl mx-auto px-4">
              Тысячи людей уже изменили свою жизнь с помощью нашей платформы
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                whileHover={{ scale: 1.03, y: -5 }}
                className="bg-white/80 dark:bg-black/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20 transition-all duration-500 relative overflow-hidden"
              >
                {/* Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative z-10">
                  <div className="flex items-center mb-6">
                    <motion.img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="w-12 h-12 sm:w-16 sm:h-16 rounded-full mr-4 border-4 border-purple-200 dark:border-purple-800 shadow-lg"
                      whileHover={{ scale: 1.1 }}
                    />
                    <div>
                      <h4 className="text-lg sm:text-xl font-bold text-black dark:text-white">
                        {testimonial.name}
                      </h4>
                      <p className="text-purple-600 dark:text-purple-400 font-medium text-sm sm:text-base">
                        {testimonial.role}
                      </p>
                      <p className="text-black/60 dark:text-white/60 text-xs sm:text-sm">
                        {testimonial.company}
                      </p>
                    </div>
                  </div>

                  <p className="text-black/80 dark:text-white/80 leading-relaxed mb-6 text-sm sm:text-base">
                    "{testimonial.text}"
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex text-yellow-500">
                      {Array.from({ length: testimonial.rating }, (_, i) => (
                        <motion.div
                          key={i}
                          initial={{ scale: 0 }}
                          whileInView={{ scale: 1 }}
                          transition={{ delay: i * 0.1 }}
                        >
                          <FiStar className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                        </motion.div>
                      ))}
                    </div>
                    
                    <div className="text-green-600 font-bold text-sm sm:text-base">
                      {testimonial.salary} зарплата
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section className="relative py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 bg-black dark:bg-white overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
              opacity: [0.1, 0.3, 0.1]
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute -top-40 -right-40 w-80 h-80 sm:w-96 sm:h-96 bg-purple-500/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              rotate: [360, 180, 0],
              opacity: [0.1, 0.2, 0.1]
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute -bottom-40 -left-40 w-96 h-96 sm:w-[500px] sm:h-[500px] bg-blue-500/20 rounded-full blur-3xl"
          />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white dark:text-black mb-6 sm:mb-8 leading-tight px-4">
              Готов изменить свою{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                жизнь
              </span>?
            </h2>
            
            <p className="text-lg sm:text-xl md:text-2xl text-white/80 dark:text-black/80 mb-12 sm:mb-16 max-w-4xl mx-auto font-light leading-relaxed px-4">
              Присоединяйся к революции в мире карьеры. 
              Твоя идеальная работа и успешное будущее ждут тебя прямо сейчас!
            </p>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center mb-12 sm:mb-16">
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/signup"
                  className="group px-8 sm:px-12 py-4 sm:py-5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-base sm:text-lg font-bold rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center min-w-[200px] justify-center"
                >
                  <FaRocket className="w-5 h-5 mr-3 group-hover:animate-bounce" />
                  Начать прямо сейчас
                  <motion.div
                    className="ml-3"
                    animate={{ x: [0, 5, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    <FiArrowRight className="w-5 h-5" />
                  </motion.div>
                </Link>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/jobs"
                  className="px-8 sm:px-12 py-4 sm:py-5 bg-transparent border-2 border-white/30 dark:border-black/30 text-white dark:text-black text-base sm:text-lg font-medium rounded-2xl hover:bg-white/10 dark:hover:bg-black/10 hover:border-white/50 dark:hover:border-black/50 transition-all duration-300 flex items-center backdrop-blur-sm min-w-[200px] justify-center"
                >
                  <FiEye className="w-5 h-5 mr-3" />
                  Посмотреть вакансии
                </Link>
              </motion.div>
            </div>

            {/* Trust Badges */}
            <motion.div
              className="flex flex-wrap justify-center items-center gap-6 sm:gap-8 opacity-60"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 0.6 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex items-center text-white dark:text-black text-sm sm:text-base">
                <FiShield className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                <span>Безопасность данных</span>
              </div>
              <div className="flex items-center text-white dark:text-black text-sm sm:text-base">
                <FiCheck className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                <span>Проверенные компании</span>
              </div>
              <div className="flex items-center text-white dark:text-black text-sm sm:text-base">
                <FiClock className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                <span>24/7 поддержка</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Footer */}
      <motion.footer className="relative py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <h3 className="text-2xl sm:text-3xl font-bold text-black dark:text-white mb-2">RESPAWN</h3>
              <p className="text-black/60 dark:text-white/60 text-sm sm:text-base">
                Будущее карьеры начинается здесь
              </p>
            </motion.div>

            <motion.div
              className="flex flex-wrap justify-center gap-6 sm:gap-8 mb-8"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Link to="/about" className="text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors text-sm sm:text-base">
                О нас
              </Link>
              <Link to="/jobs" className="text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors text-sm sm:text-base">
                Вакансии
              </Link>
              <Link to="/contact" className="text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors text-sm sm:text-base">
                Контакты
              </Link>
              <Link to="/privacy" className="text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors text-sm sm:text-base">
                Конфиденциальность
              </Link>
            </motion.div>

            <motion.div
              className="text-xs sm:text-sm text-black/40 dark:text-white/40"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <p>© 2024 Respawn. Все права защищены.</p>
              <p className="mt-2">Сделано с ❤️ в Казахстане 🇰🇿</p>
            </motion.div>
          </div>
        </div>
      </motion.footer>
    </div>
  );
};

export default MinimalistLanding; 