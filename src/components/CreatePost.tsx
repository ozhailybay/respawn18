import React, { useState, useEffect } from 'react';
import { collection, addDoc, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useNavigate } from 'react-router-dom';
import { triggerCandidateMatching } from '../api/aiRecruit';
import { motion, AnimatePresence } from 'framer-motion';
import FormSection from './FormSection';
import AnimatedInput from './AnimatedInput';
import AnimatedSelect from './AnimatedSelect';
import Sparkles from './Sparkles';

// Animation variants
const pageTransition = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.6, 
      ease: "easeOut",
      when: "beforeChildren",
      staggerChildren: 0.1
    }
  },
  exit: { 
    opacity: 0, 
    y: -20, 
    transition: { 
      duration: 0.4, 
      ease: "easeIn" 
    } 
  }
};

// Define the form data interface
interface PostFormData {
  title: string;
  description: string;
  companyName: string;
  companyLogo?: string;
  location: string;
  employmentType: string;
  format: string;
  experienceLevel: string;
  salary: string;
  skills: string[];
  requirements: string[];
  benefits: string[];
  // AI Matching fields
  aiMatching: boolean;
  skillsRequired: string[];
  minExperience: number;
  otherCriteria: string;
}

const CreatePost = (): React.ReactElement => {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [postData, setPostData] = useState<PostFormData>({
    title: '',
    description: '',
    companyName: '',
    companyLogo: '',
    location: '',
    employmentType: '',
    format: '',
    experienceLevel: '',
    salary: '',
    skills: [],
    requirements: [],
    benefits: [],
    // Initialize AI Matching fields
    aiMatching: false,
    skillsRequired: [],
    minExperience: 0,
    otherCriteria: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [lastCreatedPostId, setLastCreatedPostId] = useState<string>('');
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  // Предопределенные опции для выбора
  const locationOptions = ['Алматы', 'Астана', 'Шымкент', 'Другой'];
  const employmentTypeOptions = ['Полная занятость', 'Частичная занятость', 'Проектная работа', 'Стажировка'];
  const formatOptions = ['Офис', 'Удаленно', 'Гибрид'];
  const experienceLevelOptions = ['Без опыта', 'Начальный уровень', 'Средний уровень', 'Продвинутый уровень'];
  
  // Universities in Kazakhstan
  const universityOptions = [
    'КазНУ им. аль-Фараби',
    'ЕНУ им. Л.Н. Гумилева',
    'КБТУ',
    'КИМЭП',
    'Назарбаев Университет',
    'AIU',
    'Satbayev University',
    'МУИТ',
    'SDU',
    'Другой'
  ];

  const handleInputChange = (field: keyof PostFormData, value: string | number | boolean) => {
    setPostData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayInput = (field: 'skills' | 'requirements' | 'benefits' | 'skillsRequired', value: string) => {
    const items = value.split(',').map(item => item.trim()).filter(item => item);
    setPostData(prev => ({ ...prev, [field]: items }));
  };

  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, totalSteps));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setIsSubmitting(true);
      setError(null);

      // Get user data to verify role
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        setError('User profile not found');
        return;
      }

      const userData = userDoc.data();
      if (!userData.role || !['employer', 'business'].includes(userData.role)) {
        setError('Only employers can create job posts');
        return;
      }

      // Validate required fields
      if (!postData.title || !postData.description || !postData.companyName || 
          !postData.location || !postData.employmentType || !postData.format || 
          !postData.experienceLevel || !postData.salary) {
        setError('Please fill in all required fields');
        return;
      }

      // Create post object
      const newPostData = {
        ...postData,
        authorId: user.uid,
        createdAt: new Date(),
        postedDate: new Date(),
        status: 'active',
        type: 'job',
        // Add company info from user profile
        companyName: userData.companyName || postData.companyName,
        companyLogo: userData.companyLogo || postData.companyLogo,
        // Add AI matching data if enabled
        aiMatching: postData.aiMatching,
        aiMatchingData: postData.aiMatching ? {
          skillsRequired: postData.skillsRequired,
          minExperience: postData.minExperience,
          otherCriteria: postData.otherCriteria
        } : null
      };

      console.log("Создаем новую вакансию с данными:", {
        title: newPostData.title,
        type: newPostData.type,
        authorId: newPostData.authorId,
        createdAt: newPostData.createdAt
      });

      // Add post to Firestore
      const docRef = await addDoc(collection(db, 'posts'), newPostData);

      setLastCreatedPostId(docRef.id);
      console.log("Вакансия успешно создана с ID:", docRef.id, "Тип документа:", newPostData.type);

      // Trigger AI matching if enabled
      if (postData.aiMatching) {
        await triggerCandidateMatching(docRef.id);
      }

      // Show success message
      setSuccess(true);
      setError(null);

      // Reset form
      setPostData({
        title: '',
        description: '',
        companyName: '',
        companyLogo: '',
        location: '',
        employmentType: '',
        format: '',
        experienceLevel: '',
        salary: '',
        skills: [],
        requirements: [],
        benefits: [],
        aiMatching: false,
        skillsRequired: [],
        minExperience: 0,
        otherCriteria: ''
      });

      // Navigate to success page after delay
      setTimeout(() => {
        navigate('/jobs');
      }, 2000);

    } catch (error) {
      console.error('Error creating post:', error);
      setError('Failed to create post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center space-x-4 mb-8">
      {[1, 2, 3].map((step) => (
        <div key={step} className="flex items-center">
          <motion.div 
            className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
              step <= currentStep
                ? 'bg-black dark:bg-white border-black dark:border-white text-white dark:text-black'
                : 'bg-white dark:bg-black border-gray-300 dark:border-gray-700 text-gray-400 dark:text-gray-600'
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <span className="text-sm font-medium">{step}</span>
          </motion.div>
          {step < 3 && (
            <div className={`w-12 h-0.5 mx-2 transition-all duration-300 ${
              step < currentStep ? 'bg-black dark:bg-white' : 'bg-gray-200 dark:bg-gray-800'
            }`} />
          )}
            </div>
      ))}
          </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-light text-black dark:text-white mb-2">
                Основная информация
              </h2>
              <p className="text-gray-600 dark:text-gray-400 font-light">
                Расскажите о вакансии и компании
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-black dark:text-white">
                  Название вакансии *
                </label>
                <input
                  type="text"
                value={postData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-black text-black dark:text-white focus:border-black dark:focus:border-white focus:outline-none transition-all duration-300"
                  placeholder="Например: Frontend Developer"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-black dark:text-white">
                  Название компании *
                </label>
                <input
                  type="text"
                value={postData.companyName}
                onChange={(e) => handleInputChange('companyName', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-black text-black dark:text-white focus:border-black dark:focus:border-white focus:outline-none transition-all duration-300"
                  placeholder="Название вашей компании"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-black dark:text-white">
                  Местоположение *
                </label>
                <select
                  value={postData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-black text-black dark:text-white focus:border-black dark:focus:border-white focus:outline-none transition-all duration-300"
                >
                  <option value="">Выберите местоположение</option>
                  {locationOptions.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-black dark:text-white">
                  Тип занятости *
                </label>
                <select
                  value={postData.employmentType}
                  onChange={(e) => handleInputChange('employmentType', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-black text-black dark:text-white focus:border-black dark:focus:border-white focus:outline-none transition-all duration-300"
                >
                  <option value="">Выберите тип занятости</option>
                  {employmentTypeOptions.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-black dark:text-white">
                  Формат работы *
                </label>
                <select
                  value={postData.format}
                  onChange={(e) => handleInputChange('format', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-black text-black dark:text-white focus:border-black dark:focus:border-white focus:outline-none transition-all duration-300"
                >
                  <option value="">Выберите формат работы</option>
                  {formatOptions.map((format) => (
                    <option key={format} value={format}>
                      {format}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-black dark:text-white">
                  Уровень опыта *
                </label>
                <select
                  value={postData.experienceLevel}
                  onChange={(e) => handleInputChange('experienceLevel', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-black text-black dark:text-white focus:border-black dark:focus:border-white focus:outline-none transition-all duration-300"
                >
                  <option value="">Выберите уровень опыта</option>
                  {experienceLevelOptions.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-black dark:text-white">
                Зарплата *
              </label>
              <input
                type="text"
                value={postData.salary}
                onChange={(e) => handleInputChange('salary', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-black text-black dark:text-white focus:border-black dark:focus:border-white focus:outline-none transition-all duration-300"
                placeholder="Например: 200,000 - 350,000 ₸"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-black dark:text-white">
                Описание вакансии *
              </label>
              <textarea
                value={postData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={6}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-black text-black dark:text-white focus:border-black dark:focus:border-white focus:outline-none transition-all duration-300 resize-none"
                placeholder="Подробное описание вакансии, обязанностей и требований..."
              />
            </div>
          </motion.div>
        );
      
      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-light text-black dark:text-white mb-2">
                Требования и навыки
              </h2>
              <p className="text-gray-600 dark:text-gray-400 font-light">
                Укажите необходимые навыки и требования
              </p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-black dark:text-white">
                  Необходимые навыки
                </label>
                <textarea
                  value={postData.skills.join(', ')}
                  onChange={(e) => handleArrayInput('skills', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-black text-black dark:text-white focus:border-black dark:focus:border-white focus:outline-none transition-all duration-300 resize-none"
                  placeholder="React, JavaScript, TypeScript, Node.js (разделяйте запятыми)"
                />
            </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-black dark:text-white">
                  Требования к кандидату
                </label>
                <textarea
                  value={postData.requirements.join(', ')}
                  onChange={(e) => handleArrayInput('requirements', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-black text-black dark:text-white focus:border-black dark:focus:border-white focus:outline-none transition-all duration-300 resize-none"
                  placeholder="Высшее образование, опыт работы 2+ года, знание английского языка (разделяйте запятыми)"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-black dark:text-white">
                  Что мы предлагаем
                </label>
                <textarea
                  value={postData.benefits.join(', ')}
                  onChange={(e) => handleArrayInput('benefits', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-black text-black dark:text-white focus:border-black dark:focus:border-white focus:outline-none transition-all duration-300 resize-none"
                  placeholder="Медицинская страховка, гибкий график, обучение, корпоративные мероприятия (разделяйте запятыми)"
                />
            </div>
            </div>
          </motion.div>
        );
      
      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-light text-black dark:text-white mb-2">
                AI-подбор кандидатов
              </h2>
              <p className="text-gray-600 dark:text-gray-400 font-light">
                Настройте автоматический подбор подходящих кандидатов
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                  id="aiMatching"
                  checked={postData.aiMatching}
                onChange={(e) => handleInputChange('aiMatching', e.target.checked)}
                  className="w-5 h-5 text-black dark:text-white border-gray-300 dark:border-gray-700 rounded focus:ring-black dark:focus:ring-white"
              />
                <label htmlFor="aiMatching" className="text-sm font-medium text-black dark:text-white">
                    Включить AI-подбор кандидатов
              </label>
            </div>

            {postData.aiMatching && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                  className="space-y-4 pl-8 border-l-2 border-gray-200 dark:border-gray-800"
                >
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-black dark:text-white">
                      Ключевые навыки для AI-подбора
                    </label>
                    <textarea
                    value={postData.skillsRequired.join(', ')}
                    onChange={(e) => handleArrayInput('skillsRequired', e.target.value)}
                      rows={2}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-black text-black dark:text-white focus:border-black dark:focus:border-white focus:outline-none transition-all duration-300 resize-none"
                      placeholder="React, JavaScript, TypeScript (разделяйте запятыми)"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-black dark:text-white">
                      Минимальный опыт работы (лет)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="20"
                      value={postData.minExperience}
                        onChange={(e) => handleInputChange('minExperience', parseInt(e.target.value) || 0)}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-black text-black dark:text-white focus:border-black dark:focus:border-white focus:outline-none transition-all duration-300"
                      placeholder="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-black dark:text-white">
                      Дополнительные критерии
                    </label>
                    <textarea
                        value={postData.otherCriteria}
                        onChange={(e) => handleInputChange('otherCriteria', e.target.value)}
                        rows={3}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-black text-black dark:text-white focus:border-black dark:focus:border-white focus:outline-none transition-all duration-300 resize-none"
                      placeholder="Дополнительные требования для AI-подбора..."
                      />
                  </div>
                    </motion.div>
                  )}
                </div>
          </motion.div>
        );
      
      default:
        return null;
    }
  };

  if (!user) {
  return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-light text-black dark:text-white mb-4">
            Требуется авторизация
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Пожалуйста, войдите в систему для создания вакансий
          </p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-all duration-300 font-medium"
          >
            Войти
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors duration-300">
      {/* Subtle animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-20 left-10 w-32 h-32 bg-black/5 dark:bg-white/5 rounded-full blur-3xl"
        />
            <motion.div 
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
          }}
                  transition={{ 
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute bottom-20 right-10 w-40 h-40 bg-black/5 dark:bg-white/5 rounded-full blur-3xl"
        />
              </div>
              
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={pageTransition}
          className="space-y-8"
        >
          {/* Header */}
          <div className="text-center">
            <motion.h1 
              className="text-4xl sm:text-5xl font-light text-black dark:text-white mb-4"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="font-thin">Создать</span>{' '}
              <span className="font-bold italic">вакансию</span>
            </motion.h1>
            <motion.p 
              className="text-lg text-gray-600 dark:text-gray-400 font-light"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Найдите идеальных кандидатов для вашей команды
            </motion.p>
              </div>

          {/* Step Indicator */}
            {renderStepIndicator()}

          {/* Form Container */}
          <motion.div
            className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-2xl p-8 shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <form onSubmit={handleSubmit} className="space-y-8">
              <AnimatePresence mode="wait">
                {renderStepContent()}
              </AnimatePresence>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4"
                >
                  <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                </motion.div>
              )}

              {/* Success Message */}
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4"
                >
                  <p className="text-green-600 dark:text-green-400 text-sm">
                    Вакансия успешно создана! Перенаправляем вас к списку вакансий...
                  </p>
                </motion.div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center pt-6">
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                    currentStep === 1
                      ? 'bg-gray-100 dark:bg-gray-900 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                      : 'bg-white dark:bg-black border border-gray-200 dark:border-gray-800 text-black dark:text-white hover:border-black dark:hover:border-white'
                  }`}
                >
                  Назад
                </button>

                <div className="flex space-x-4">
                  {currentStep < totalSteps ? (
                    <button
                      type="button"
                      onClick={nextStep}
                      className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-all duration-300 font-medium"
                    >
                      Далее
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                        isSubmitting
                          ? 'bg-gray-400 dark:bg-gray-600 text-white cursor-not-allowed'
                          : 'bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200'
                      }`}
                    >
                      {isSubmitting ? 'Создание...' : 'Создать вакансию'}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default CreatePost; 