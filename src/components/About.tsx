import React, { useEffect, useRef } from 'react';
import { motion, useAnimation, useInView, AnimatePresence } from 'framer-motion';
import { FaGithub, FaInstagram, FaLinkedin } from 'react-icons/fa';

const IconArrowRight = ({ className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="5" y1="12" x2="19" y2="12"></line>
    <polyline points="12 5 19 12 12 19"></polyline>
  </svg>
);

const IconAward = ({ size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="7"></circle>
    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
  </svg>
);

const IconUsers = ({ size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);

const IconZap = ({ size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
  </svg>
);

const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { 
      type: "spring", 
      damping: 25, 
      stiffness: 100,
      duration: 0.8
    }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3
    }
  }
};

const AnimatedHeading = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => {
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  
  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [controls, isInView]);
  
  return (
    <motion.h2
      ref={ref}
      variants={fadeInUp}
      initial="hidden"
      animate={controls}
      className={`text-4xl md:text-5xl font-light text-black dark:text-white mb-6 ${className}`}
    >
      {children}
    </motion.h2>
  );
};

const AnimatedSection = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => {
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  
  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [controls, isInView]);
  
  return (
    <motion.div
      ref={ref}
      variants={staggerContainer}
      initial="hidden"
      animate={controls}
      className={className}
    >
      {children}
    </motion.div>
  );
};

interface CardItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay?: number;
}

const CardItem = ({ icon, title, description, delay = 0 }: CardItemProps) => (
  <motion.div
    variants={fadeInUp}
    className="relative bg-white dark:bg-black border border-gray-200 dark:border-gray-800 p-8 rounded-lg hover:border-black dark:hover:border-white transition-all duration-300 group"
  >
    <div className="relative">
      <div className="text-black dark:text-white mb-4 flex items-center justify-center w-16 h-16 border border-gray-200 dark:border-gray-800 rounded-lg">
        {icon}
      </div>
      <h3 className="text-xl font-light mb-3 text-black dark:text-white">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400 font-light">{description}</p>
    </div>
  </motion.div>
);

interface StatNumberProps {
  number: string | number;
  label: string;
  suffix?: string;
  delay?: number;
}

const StatNumber = ({ number, label, suffix = "+", delay = 0 }: StatNumberProps) => {
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  
  useEffect(() => {
    if (isInView) {
      controls.start({
        scale: [0.5, 1.2, 1],
        opacity: [0, 1, 1],
        transition: { delay, duration: 0.6, ease: "easeOut" }
      });
    }
  }, [controls, isInView, delay]);
  
  return (
    <motion.div 
      ref={ref}
      initial={{ scale: 0.5, opacity: 0 }}
      animate={controls}
      className="text-center p-6"
    >
      <h3 className="text-4xl md:text-5xl font-light text-black dark:text-white mb-2">{number}{suffix}</h3>
      <p className="text-gray-600 dark:text-gray-400 font-light">{label}</p>
    </motion.div>
  );
};

const About = () => {
  const teamMembers = [
    {
      name: 'Даниял Талгатов',
      role: 'Основатель & Разработчик',
      image: '/assets/team/daniyal.jpg',
      bio: 'Ученик 10 класса НИШ ХБН Алматы. Создал платформу Jumys Al, чтобы помочь подросткам найти первые рабочие проекты и превратить свои навыки в капитал.',
      social: {
        linkedin: '#',
        instagram: 'https://www.instagram.com/danchouvzv/',
        github: 'https://github.com/Danchouvzv',
      }
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-black py-24 px-4">
      <div className="container max-w-6xl mx-auto">
        {/* Hero Section */}
        <AnimatedSection className="text-center mb-24">
          <motion.div variants={fadeInUp}>
            <h1 className="text-5xl md:text-7xl font-light mb-6 text-black dark:text-white">
              О Jumys Al
            </h1>
            <div className="w-32 h-0.5 bg-black dark:bg-white mx-auto mb-8"></div>
          </motion.div>
          
          <motion.p 
            variants={fadeInUp}
            className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 font-light max-w-3xl mx-auto mb-12"
          >
            Казахстанская платформа, созданная школьником для школьников и студентов, чтобы превратить навыки в первый доход
          </motion.p>
          
          <motion.div 
            variants={fadeInUp}
            className="flex flex-wrap justify-center gap-4"
          >
                <a 
                  href="/jobs" 
              className="inline-flex items-center px-8 py-4 bg-black dark:bg-white text-white dark:text-black font-light border border-black dark:border-white hover:bg-white dark:hover:bg-black hover:text-black dark:hover:text-white transition-all duration-300"
            >
              Исследовать возможности
              <IconArrowRight className="ml-2" />
            </a>
            <a 
              href="/signup" 
              className="inline-flex items-center px-8 py-4 bg-white dark:bg-black text-black dark:text-white border border-black dark:border-white hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black font-light transition-all duration-300"
            >
              Присоединиться
            </a>
          </motion.div>
        </AnimatedSection>
        
        {/* Our Mission */}
        <AnimatedSection className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-32">
          <motion.div variants={fadeInUp} className="order-2 md:order-1">
            <AnimatedHeading>Наша миссия</AnimatedHeading>
            <motion.p 
              variants={fadeInUp}
              className="text-lg text-gray-600 dark:text-gray-400 font-light mb-6"
            >
              В Jumys Al мы создаем мост между талантливыми школьниками и реальными бизнес-задачами. Наша платформа помогает подросткам с навыками программирования, дизайна или маркетинга начать зарабатывать, пока компании получают доступ к свежим и мотивированным талантам.
            </motion.p>
            <motion.p 
              variants={fadeInUp}
              className="text-lg text-gray-600 dark:text-gray-400 font-light mb-6"
            >
              Мы верим, что каждый молодой человек заслуживает возможности монетизировать свои знания и развивать ключевые навыки на практике. Соединяя молодежь с бизнесом, мы создаем экосистему, выгодную для всех сторон.
            </motion.p>
          </motion.div>
          
          <motion.div 
            variants={fadeInUp} 
            className="order-1 md:order-2 relative"
          >
            <div className="w-full h-[400px] border border-gray-200 dark:border-gray-800 overflow-hidden transform hover:scale-105 transition-transform duration-500">
              <img 
                src="/assets/respawn-mission.jpg" 
                alt="Jumys Al Миссия" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1740&auto=format&fit=crop";
                }}
              />
            </div>
          </motion.div>
        </AnimatedSection>
        
        {/* История */}
        <AnimatedSection className="mb-32">
          <div className="text-center mb-16">
            <AnimatedHeading>Наша история</AnimatedHeading>
          </div>
          
          <motion.div 
            variants={fadeInUp}
            className="relative bg-white dark:bg-black border border-gray-200 dark:border-gray-800 p-8 md:p-12"
          >
            <div className="space-y-6 text-lg text-gray-600 dark:text-gray-400 font-light">
              <p>
                <span className="font-medium text-black dark:text-white text-xl">Всё началось летом 2023 года.</span> Я, ученик НИШ ХБН в Алматы, только что перешел в 10-й класс. У меня были навыки программирования, изучал веб-разработку и искусственный интеллект — но пришло лето, и я хотел найти оплачиваемую работу, чтобы применить эти знания.
              </p>
              <p>
                Реальность оказалась суровой: компании не брали подростков даже на стажировку. "Приходи, когда закончишь университет" — говорили мне. Изучив вопрос, я выяснил, что более 70% школьников-программистов и дизайнеров сталкиваются с той же проблемой. Мы оказываемся в парадоксальной ситуации: без опыта не берут на работу, а опыт негде получить.
              </p>
              <p>
                В то же время многие стартапы и небольшие компании нуждаются в современных цифровых решениях: сайтах, приложениях, дизайне, продвижении в социальных сетях. Но им не по карману нанимать опытных специалистов с рыночной зарплатой.
              </p>
              <p>
                <span className="font-medium text-black dark:text-white">Так родилась идея Jumys Al:</span> создать платформу, где подростки могут работать над настоящими бизнес-задачами. Стартапы получают доступ к талантливым и мотивированным исполнителям по доступной цене, а школьники — первую оплачиваемую работу в портфолио и ценный опыт.
              </p>
              <p>
                Начав как личный проект, Jumys Al быстро привлек внимание. Первые компании начали размещать задания, первые школьники — выполнять их. К концу 2023 года мы уже помогли более 50 молодым талантам заработать первые деньги своими навыками.
              </p>
              <p>
                Сегодня Jumys Al — это не просто платформа фриланса. Мы создаем полноценную экосистему для профессионального развития молодежи, где AI-инструменты помогают составлять резюме, готовиться к собеседованиям и постоянно улучшать навыки через реальные проекты.
              </p>
            </div>
          </motion.div>
        </AnimatedSection>
        
        {/* Наше влияние */}
        <AnimatedSection className="mb-32">
          <div className="text-center mb-16">
            <AnimatedHeading>Наше влияние</AnimatedHeading>
            <motion.p 
              variants={fadeInUp}
              className="text-lg text-gray-600 dark:text-gray-400 font-light max-w-3xl mx-auto"
            >
              За небольшой срок мы уже помогли многим школьникам и студентам начать карьеру
            </motion.p>
          </div>
          
          <motion.div variants={fadeInUp} className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 p-6">
            <StatNumber number="250" label="Школьников на платформе" delay={0.1} />
            <StatNumber number="50" label="Компаний-партнеров" delay={0.2} />
            <StatNumber number="120" label="Успешных проектов" delay={0.3} />
            <StatNumber number="85" suffix="%" label="Удовлетворенность клиентов" delay={0.4} />
          </motion.div>
        </AnimatedSection>
        
        {/* Наши преимущества */}
        <AnimatedSection className="mb-32">
          <div className="text-center mb-16">
            <AnimatedHeading>Наши преимущества</AnimatedHeading>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <CardItem 
              icon={<IconUsers size={32} />}
              title="Доступ к талантам"
              description="Платформа для молодых специалистов с навыками в программировании, дизайне и маркетинге. Мы помогаем подросткам найти свой первый оплачиваемый проект."
            />
            <CardItem 
              icon={<IconAward size={32} />}
              title="AI-помощники"
              description="Наши искусственный интеллект помогает составить профессиональное резюме, подготовиться к собеседованию и выбрать оптимальную карьерную траекторию."
            />
            <CardItem 
              icon={<IconZap size={32} />}
              title="Безопасные сделки"
              description="Гарантируем оплату за выполненную работу. Проверяем компании и задания, защищаем интересы молодых исполнителей и обеспечиваем прозрачность."
            />
          </div>
        </AnimatedSection>
        
        {/* Команда */}
        <AnimatedSection className="mb-32">
          <div className="text-center mb-16">
            <AnimatedHeading>Наша команда</AnimatedHeading>
            <motion.p 
              variants={fadeInUp}
              className="text-lg text-gray-600 dark:text-gray-400 font-light max-w-3xl mx-auto"
            >
              Познакомьтесь с людьми, стоящими за Jumys Al
            </motion.p>
          </div>
          
          <div className="flex justify-center">
            {teamMembers.map((member, index) => (
              <motion.div 
                key={index}
                variants={fadeInUp}
                className="max-w-md bg-white dark:bg-black border border-gray-200 dark:border-gray-800 overflow-hidden transform transition-all duration-500 hover:border-black dark:hover:border-white"
              >
                <div className="h-72 overflow-hidden relative bg-black dark:bg-white">
                  <div className="absolute bottom-0 left-0 p-6 text-white dark:text-black flex items-center">
                    <div className="w-20 h-20 border border-white dark:border-black flex items-center justify-center text-white dark:text-black text-3xl font-light mr-4">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-2xl font-light">{member.name}</h3>
                      <p className="text-gray-300 dark:text-gray-700 font-light">{member.role}</p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-gray-600 dark:text-gray-400 font-light mb-6">{member.bio}</p>
                  <div className="flex space-x-4">
                    <a href={member.social.github} target="_blank" rel="noopener noreferrer" className="text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors duration-300">
                      <FaGithub className="w-6 h-6" />
                    </a>
                    <a href={member.social.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors duration-300">
                      <FaInstagram className="w-6 h-6" />
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatedSection>
        
        {/* CTA */}
        <AnimatedSection>
          <motion.div 
            variants={fadeInUp}
            className="relative bg-black dark:bg-white border border-black dark:border-white px-8 py-16 text-center text-white dark:text-black"
          >
            <h2 className="text-3xl md:text-4xl font-light mb-6">Присоединяйтесь к нашей миссии</h2>
            <p className="text-xl text-gray-300 dark:text-gray-700 font-light max-w-3xl mx-auto mb-10">
              Если вы школьник, ищущий первую работу, или компания, ищущая молодые таланты — 
              Jumys Al готов помочь вам на этом пути!
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              <a 
                href="/signup" 
                className="px-8 py-4 bg-white dark:bg-black text-black dark:text-white border border-white dark:border-black font-light hover:bg-transparent dark:hover:bg-transparent hover:text-white dark:hover:text-black transition-all duration-300"
              >
                Зарегистрироваться
            </a>
            <a 
              href="/contact" 
                className="px-8 py-4 bg-transparent text-white dark:text-black font-light border border-white dark:border-black hover:bg-white dark:hover:bg-black hover:text-black dark:hover:text-white transition-all duration-300"
            >
                Связаться с нами
            </a>
          </div>
          </motion.div>
        </AnimatedSection>

        {/* Партнеры */}
        <section className="py-12 bg-white dark:bg-black">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-light mb-8 text-center text-black dark:text-white">
              Наши партнеры
            </h2>
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-12">
              <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 p-6 flex flex-col items-center max-w-md">
                <div className="w-32 h-32 mb-4 border border-gray-200 dark:border-gray-800 flex items-center justify-center text-black dark:text-white text-4xl font-light">
                  НИШ
                </div>
                <h3 className="text-xl font-light text-black dark:text-white mb-2">Назарбаев Интеллектуальные Школы</h3>
                <p className="text-gray-600 dark:text-gray-400 font-light text-center mb-4">
                  Официальный партнер Jumys Al, обеспечивающий доступ к стажировкам для талантливых школьников по всему Казахстану.
                </p>
                <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 w-full">
                  <p className="text-gray-600 dark:text-gray-400 font-light text-sm">
                    "Сотрудничество с Jumys Al позволяет нашим ученикам применять знания на практике и получать ценный опыт работы, значительно улучшая их карьерные перспективы."
                  </p>
                </div>
              </div>
              <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 p-6 flex flex-col items-center max-w-md">
                <div className="w-32 h-32 mb-4 border border-gray-200 dark:border-gray-800 flex items-center justify-center text-black dark:text-white text-4xl font-light">
                  АК
                </div>
                <h3 className="text-xl font-light text-black dark:text-white mb-2">Astana Knowledge</h3>
                <p className="text-gray-600 dark:text-gray-400 font-light text-center mb-4">
                  Партнерский центр образования, предоставляющий возможности для стажировок и профессионального развития молодежи.
                </p>
                <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 w-full">
                  <p className="text-gray-600 dark:text-gray-400 font-light text-sm">
                    "Партнерство с Jumys Al позволяет нам находить мотивированных и талантливых стажеров, которые привносят свежие идеи и энергию в наши проекты."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About; 