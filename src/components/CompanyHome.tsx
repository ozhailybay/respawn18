import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

// Компонент домашней страницы для компаний
const CompanyHome: React.FC = () => {
  const [activeTab, setActiveTab] = useState('about');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-white dark:bg-black pt-16 pb-24 transition-colors duration-300"
    >
      {/* Subtle animated background elements */}
      <motion.div
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute top-20 right-4 sm:right-10 w-32 h-32 sm:w-48 sm:h-48 bg-black/3 dark:bg-white/3 rounded-full blur-3xl"
      />
      <motion.div
        animate={{ y: [0, 15, 0] }}
        transition={{ duration: 10, repeat: Infinity }}
        className="absolute bottom-20 left-4 sm:left-10 w-40 h-40 sm:w-64 sm:h-64 bg-black/3 dark:bg-white/3 rounded-full blur-3xl"
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16 pt-12"
        >
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-light text-black dark:text-white mb-6 leading-tight">
            <span className="font-thin">Найдите </span>
            <span className="font-bold italic underline decoration-wavy decoration-2 underline-offset-4">
              лучших
            </span>
            <span className="font-thin"> кандидатов</span>
          </h1>
          
          <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-400 mb-12 max-w-4xl mx-auto font-light">
            Платформа для поиска талантливых студентов и молодых специалистов
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/create-post"
              className="group bg-black dark:bg-white text-white dark:text-black px-8 py-3 text-lg font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-all duration-200 flex items-center border border-transparent hover:border-gray-300 dark:hover:border-gray-700"
            >
              <span className="font-light">Создать вакансию</span>
              <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            
            <Link
              to="/candidates"
              className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors duration-200 text-lg font-light underline decoration-dotted underline-offset-2"
            >
              Просмотреть кандидатов
            </Link>
          </div>
        </motion.div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
        >
          <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-2xl p-8 hover:border-black dark:hover:border-white transition-all duration-300 group">
            <div className="w-12 h-12 bg-black dark:bg-white rounded-xl flex items-center justify-center text-white dark:text-black mb-6 group-hover:scale-105 transition-transform">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-light text-black dark:text-white mb-4">
              <span className="font-medium">Умный</span> поиск
            </h3>
            <p className="text-gray-600 dark:text-gray-400 font-light">
              AI-алгоритмы помогают найти идеальных кандидатов для ваших вакансий
            </p>
          </div>

          <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-2xl p-8 hover:border-black dark:hover:border-white transition-all duration-300 group">
            <div className="w-12 h-12 bg-black dark:bg-white rounded-xl flex items-center justify-center text-white dark:text-black mb-6 group-hover:scale-105 transition-transform">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-light text-black dark:text-white mb-4">
              <span className="font-medium">Аналитика</span> найма
            </h3>
            <p className="text-gray-600 dark:text-gray-400 font-light">
              Подробная статистика по вакансиям и эффективности найма
          </p>
        </div>
        
          <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-2xl p-8 hover:border-black dark:hover:border-white transition-all duration-300 group">
            <div className="w-12 h-12 bg-black dark:bg-white rounded-xl flex items-center justify-center text-white dark:text-black mb-6 group-hover:scale-105 transition-transform">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-xl font-light text-black dark:text-white mb-4">
              <span className="font-medium">Прямое</span> общение
            </h3>
            <p className="text-gray-600 dark:text-gray-400 font-light">
              Встроенный чат для быстрого общения с кандидатами
            </p>
          </div>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex justify-center mb-12"
        >
          <div className="flex space-x-1 bg-gray-100 dark:bg-gray-900 rounded-lg p-1 border border-gray-200 dark:border-gray-800">
            {[
              { id: 'about', label: 'О платформе' },
              { id: 'features', label: 'Возможности' },
              { id: 'pricing', label: 'Тарифы' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-2 rounded-md text-sm font-light transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-black dark:bg-white text-white dark:text-black'
                    : 'text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto text-center"
        >
        {activeTab === 'about' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-light text-black dark:text-white">
                <span className="font-thin">Платформа для </span>
                <span className="font-bold italic">эффективного</span>
                <span className="font-thin"> найма</span>
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 font-light leading-relaxed">
                Respawn объединяет работодателей с талантливыми студентами и молодыми специалистами. 
                Используйте современные инструменты для поиска и найма лучших кандидатов.
              </p>
          </div>
        )}
        
        {activeTab === 'features' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-light text-black dark:text-white">
                <span className="font-thin">Все необходимые </span>
                <span className="font-bold italic">инструменты</span>
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 font-light leading-relaxed">
                AI-поиск кандидатов, автоматическое сопоставление навыков, встроенный чат, 
                аналитика эффективности найма и многое другое в одной платформе.
              </p>
          </div>
        )}
        
        {activeTab === 'pricing' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-light text-black dark:text-white">
                <span className="font-thin">Гибкие </span>
                <span className="font-bold italic">тарифы</span>
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 font-light leading-relaxed">
                Начните бесплатно с базовым функционалом. Переходите на расширенные планы 
                по мере роста ваших потребностей в найме.
              </p>
              <Link
                to="/subscription"
                className="inline-block bg-black dark:bg-white text-white dark:text-black px-6 py-3 rounded-lg font-light hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors duration-200"
              >
                Посмотреть тарифы
              </Link>
          </div>
        )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default CompanyHome; 