import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db, storage } from '../firebase';
import { doc, getDoc, updateDoc, collection, addDoc, query, where, getDocs, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { UserData } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import html2pdf from 'html2pdf.js';

// Импортируем созданные компоненты
import ProfileHero from './ProfileHero';
import ProfileView from './ProfileView';
import ProfileEdit from './ProfileEdit';
import ProfileResume from './ProfileResume';

// Интерфейс для FAQ элемента
interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category: 'profile' | 'resume' | 'job' | 'general';
}

const FAQ: React.FC = () => {
  // Список категорий 
  const categories = [
    { id: 'all', name: 'Все вопросы' },
    { id: 'profile', name: 'Профиль' },
    { id: 'resume', name: 'Резюме' },
    { id: 'job', name: 'Поиск работы' },
    { id: 'general', name: 'Общие вопросы' }
  ];
  
  // Список часто задаваемых вопросов
  const faqItems: FAQItem[] = [
    {
      id: 1,
      question: 'Как создать эффективный профиль на Respawn?',
      answer: 'Для создания эффективного профиля заполните все ключевые разделы: личная информация, образование, навыки и опыт работы. Добавьте профессиональное фото и подробно опишите свои достижения. Регулярно обновляйте информацию и используйте ключевые слова, связанные с вашей сферой деятельности.',
      category: 'profile'
    },
    {
      id: 2,
      question: 'Как использовать AI генератор резюме?',
      answer: 'AI генератор резюме создаст профессиональное резюме на основе данных вашего профиля. Перейдите в раздел "Генератор резюме", выберите подходящий шаблон, настройте разделы и формат, и система автоматически заполнит его вашими данными. Вы можете редактировать результат перед скачиванием.',
      category: 'resume'
    },
    {
      id: 3,
      question: 'Как найти стажировку, соответствующую моим навыкам?',
      answer: 'Для поиска подходящей стажировки используйте фильтры по отрасли, специализации и навыкам. Наша система AI-подбора автоматически рекомендует вакансии, соответствующие вашему профилю. Также включите уведомления о новых предложениях и активно откликайтесь на интересные позиции.',
      category: 'job'
    },
    {
      id: 4,
      question: 'Как работает AI ментор и чем он может помочь?',
      answer: 'AI ментор - это интеллектуальный помощник, который предоставляет персонализированные карьерные советы и рекомендации на основе ваших навыков, интересов и карьерных целей. Он может предложить стратегии развития карьеры, помочь с подготовкой к собеседованию и дать рекомендации по улучшению резюме.',
      category: 'general'
    },
    {
      id: 5,
      question: 'Как получить максимальную отдачу от своего профиля для работодателей?',
      answer: 'Для привлечения внимания работодателей регулярно обновляйте профиль, добавляйте конкретные примеры проектов и достижений, используйте ключевые слова из вашей отрасли, загружайте примеры работ и запрашивайте рекомендации от коллег. Активно участвуйте в сообществе, делясь профессиональными знаниями.',
      category: 'profile'
    },
    {
      id: 6,
      question: 'Какие форматы резюме я могу создать через платформу?',
      answer: 'Наша платформа поддерживает создание резюме в различных форматах, включая PDF, DOCX и HTML. Вы также можете выбрать из нескольких профессиональных шаблонов, оптимизированных для разных отраслей и должностей, с возможностью настройки цветовой схемы и структуры.',
      category: 'resume'
    },
    {
      id: 7,
      question: 'Как узнать, что моя заявка на стажировку была просмотрена?',
      answer: 'После отправки заявки вы сможете отслеживать ее статус в разделе "Мои заявки". Вы будете получать уведомления при каждом изменении статуса: "Просмотрено", "На рассмотрении", "Приглашение на собеседование" или "Отклонено". Также вы можете установить уведомления по электронной почте.',
      category: 'job'
    },
    {
      id: 8,
      question: 'Могу ли я использовать платформу на мобильных устройствах?',
      answer: 'Да, наша платформа полностью адаптирована для мобильных устройств. Вы можете получить доступ ко всем функциям через мобильный браузер или загрузить наше приложение, доступное для iOS и Android. Мобильная версия позволяет просматривать вакансии, обновлять профиль и общаться с работодателями на ходу.',
      category: 'general'
    }
  ];
  
  const [activeCategory, setActiveCategory] = useState('all');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  
  // Фильтруем вопросы по категории
  const filteredItems = activeCategory === 'all' 
    ? faqItems 
    : faqItems.filter(item => item.category === activeCategory);
  
  // Переключение открытого вопроса
  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };
  
  // Анимации для контейнеров вопросов и ответов
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300 }
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
      {/* Заголовок с анимацией */}
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-16"
      >
        <h2 className="text-3xl font-light text-black dark:text-white sm:text-4xl">
          <span className="font-thin">Часто задаваемые</span>
          <span className="font-bold ml-2">вопросы</span>
        </h2>
        <p className="mt-4 text-xl text-gray-600 dark:text-gray-400 font-light">
          Все, что вам нужно знать для эффективного использования платформы
        </p>
        
        {/* Декоративные элементы */}
        <div className="relative">
          <div className="absolute top-0 left-1/4 w-12 h-12 bg-black/10 dark:bg-white/10 rounded-full filter blur-xl opacity-20"></div>
          <div className="absolute top-0 right-1/4 w-12 h-12 bg-black/10 dark:bg-white/10 rounded-full filter blur-xl opacity-20"></div>
        </div>
      </motion.div>
      
      {/* Категории */}
      <div className="flex justify-center flex-wrap gap-2 mb-12">
        {categories.map(category => (
          <motion.button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
              activeCategory === category.id
                ? 'bg-black dark:bg-white text-white dark:text-black shadow-md'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {category.name}
          </motion.button>
        ))}
      </div>
      
      {/* Список вопросов */}
      <motion.div 
        className="space-y-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <AnimatePresence>
          {filteredItems.map(item => (
            <motion.div
              key={item.id}
              variants={itemVariants}
              className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-700"
            >
              <button
                className="w-full px-6 py-4 text-left flex justify-between items-center focus:outline-none"
                onClick={() => toggleExpand(item.id)}
              >
                <span className="text-lg font-medium text-gray-900 dark:text-white">
                  {item.question}
                </span>
                <motion.span
                  animate={{ rotate: expandedId === item.id ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <svg className="w-5 h-5 text-black dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </motion.span>
              </button>
              
              <AnimatePresence>
                {expandedId === item.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-4 text-gray-700 dark:text-gray-300 border-t border-gray-100 dark:border-gray-700">
                      <p className="pt-4">{item.answer}</p>
                      
                      <div className="mt-4 flex justify-between items-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                          item.category === 'profile' ? 'bg-white dark:bg-black text-black dark:text-white border-black dark:border-white' :
                          item.category === 'resume' ? 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600' :
                          item.category === 'job' ? 'bg-white dark:bg-black text-black dark:text-white border-gray-400 dark:border-gray-500' :
                          'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border-gray-300 dark:border-gray-600'
                        }`}>
                          {item.category === 'profile' ? 'Профиль' :
                           item.category === 'resume' ? 'Резюме' :
                           item.category === 'job' ? 'Поиск работы' : 'Общие вопросы'}
                        </span>
                        
                        <button className="text-black dark:text-white hover:text-gray-600 dark:hover:text-gray-300 text-sm flex items-center gap-1 transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                          </svg>
                          Полезно
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
      
      {/* Дополнительная помощь */}
      <motion.div 
        className="mt-16 text-center bg-white dark:bg-black border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h3 className="text-xl font-light text-black dark:text-white mb-2">
          <span className="font-thin">Не нашли</span>
          <span className="font-bold ml-2">ответ на свой вопрос?</span>
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6 font-light">
          Свяжитесь с нашей службой поддержки или задайте вопрос AI Ментору
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <motion.button
            className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex items-center space-x-2 font-medium"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <span>Служба поддержки</span>
          </motion.button>
          <motion.button
            className="px-6 py-3 bg-white dark:bg-black text-black dark:text-white border-2 border-black dark:border-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 flex items-center space-x-2 font-medium"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <span>Спросить AI Ментора</span>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export { FAQ };

const ProfileNew: React.FC = () => {
  // States
  const [user, loading] = useAuthState(auth);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  
  // Navigation
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();

  // Load user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setError(null);
        // Determine which profile to load
        const profileUserId = userId || (user ? user.uid : null);
        
        // Check if the viewed profile is the current user's profile
        const isCurrentUserProfile = !!user && user.uid === profileUserId;
        setIsCurrentUser(isCurrentUserProfile);
        
        if (!profileUserId) {
          navigate('/login');
          return;
        }
        
        const userDoc = await getDoc(doc(db, 'users', profileUserId));
        if (userDoc.exists()) {
          const data = userDoc.data() as UserData;
          setUserData(data);
        } else {
          setError('Профиль пользователя не найден');
        }
      } catch (fetchError) {
        console.error('Ошибка при загрузке профиля:', fetchError);
        setError('Не удалось загрузить профиль пользователя');
      }
    };
    
    fetchUserData();
  }, [user, userId, navigate]);

  // Handle save
  const handleSave = async (formData: Partial<UserData>) => {
    if (!user || !isCurrentUser) return;
    
    setSaveLoading(true);
    setSaveSuccess(false);
    
    try {
      // Ensure we have valid data and remove any undefined values or event objects
      const cleanedData = Object.fromEntries(
        Object.entries(formData).filter(([_, value]) => 
          value !== undefined && 
          value !== null && 
          (typeof value !== 'object' || 
          (typeof value === 'object' && value instanceof File) || // Allow File objects
          (typeof value === 'object' && Array.isArray(value)) || // Allow arrays
          (typeof value === 'object' && !(value as any).nativeEvent)) // Filter out event objects
        )
      );

      const avatarFile = cleanedData.avatarFile as File;
      let photoURL = userData?.photoURL;
      
      // Upload avatar if provided
      if (avatarFile && avatarFile instanceof File) {
        const avatarRef = ref(storage, `avatars/${user.uid}/${avatarFile.name}`);
        await uploadBytes(avatarRef, avatarFile);
        photoURL = await getDownloadURL(avatarRef);
      }
      
      // Remove the avatarFile property before saving to Firestore
      const { avatarFile: _, ...dataToSave } = cleanedData;
      
      // Clean photoURL to ensure it's either a string or undefined
      const cleanPhotoURL = typeof photoURL === 'string' ? photoURL : undefined;
      
      // Update the data in Firestore
      await updateDoc(doc(db, 'users', user.uid), {
        ...dataToSave,
        photoURL: cleanPhotoURL,
        updatedAt: serverTimestamp()
      });
      
      // Update the local state
      setUserData({
        ...userData!,
        ...dataToSave,
        photoURL: cleanPhotoURL
      });
      
      setSaveSuccess(true);
      setIsEditing(false);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    } finally {
      setSaveLoading(false);
    }
  };

  // Start chat with user
  const handleStartChat = async () => {
    if (!user || !userData) return;
    
    try {
      // Check if a chat already exists
      const chatsRef = collection(db, 'chats');
      const q = query(
        chatsRef,
        where('participants', 'array-contains', user.uid)
      );
      
      const querySnapshot = await getDocs(q);
      let existingChatId = null;
      
      querySnapshot.forEach((doc) => {
        const chatData = doc.data();
        if (chatData.participants.includes(userData.uid)) {
          existingChatId = doc.id;
        }
      });
      
      // If a chat exists, navigate to it
      if (existingChatId) {
        navigate(`/chat/${existingChatId}`);
        return;
      }
      
      // Otherwise, create a new chat
      const newChatRef = await addDoc(chatsRef, {
        participants: [user.uid, userData.uid],
        createdAt: serverTimestamp(),
        lastMessage: null,
        lastMessageTime: null
      });
      
      navigate(`/chat/${newChatRef.id}`);
    } catch (error) {
      console.error('Error creating chat:', error);
    }
  };

  // Add user to favorites
  const handleAddToFavorites = async () => {
    if (!user || !userData) return;
    
    try {
      // Check if already in favorites
      const favoritesRef = collection(db, `users/${user.uid}/favorites`);
      const q = query(favoritesRef, where('userId', '==', userData.uid));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        // Already in favorites, remove it
        const favoriteDoc = querySnapshot.docs[0];
        await deleteDoc(favoriteDoc.ref);
        alert('Пользователь удален из избранного');
      } else {
        // Add to favorites
        await addDoc(favoritesRef, {
          userId: userData.uid,
          displayName: userData.displayName,
          photoURL: userData.photoURL,
          addedAt: serverTimestamp()
        });
        alert('Пользователь добавлен в избранное');
      }
    } catch (error) {
      console.error('Error updating favorites:', error);
    }
  };

  // Rendering loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 pt-24 pb-12 flex justify-center items-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 relative">
            <div className="absolute top-0 left-0 w-full h-full border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
            <div className="absolute top-3 left-3 w-10 h-10 border-4 border-indigo-200 border-b-indigo-600 rounded-full animate-spin animation-delay-500"></div>
          </div>
          <p className="mt-6 text-lg text-slate-600 dark:text-slate-300 font-medium">Загрузка профиля...</p>
        </div>
      </div>
    );
  }

  // Rendering error
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 pt-24 pb-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Ошибка</h1>
              <p className="text-slate-600 dark:text-slate-300 mb-8 max-w-md">{error}</p>
              <button 
                onClick={() => navigate('/')} 
                className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-lg hover:shadow-lg transition-all duration-300"
              >
                Вернуться на главную
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black pt-20 pb-12 transition-colors duration-300">
      {/* Subtle animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-40 right-[10%] w-64 h-64 bg-black/3 dark:bg-white/3 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ y: [0, 15, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute bottom-20 left-[5%] w-64 h-64 bg-black/3 dark:bg-white/3 rounded-full blur-3xl"
        />
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Hero section */}
          <ProfileHero userData={userData} />
          
          {/* Main content section */}
          <div className="bg-white dark:bg-black border-2 border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl p-8 hover:border-black dark:hover:border-white transition-all duration-300">
            {/* Success message */}
            <AnimatePresence>
              {saveSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg flex items-center border border-green-200 dark:border-green-700"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Профиль успешно обновлен!</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Switch between view and edit mode */}
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-light text-black dark:text-white">
                <span className="font-thin">Мой</span>
                <span className="font-bold ml-2">профиль</span>
              </h2>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-all duration-300 font-medium"
                >
                  {isEditing ? 'Отменить' : 'Редактировать'}
                </button>
                {isEditing && (
                  <button
                    onClick={() => setIsEditing(false)}
                    disabled={saveLoading}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium"
                  >
                    {saveLoading ? 'Сохранение...' : 'Сохранить'}
                  </button>
                )}
              </div>
            </div>

            {/* Profile content */}
            {isEditing ? (
              <ProfileEdit 
                userData={userData} 
                onSave={handleSave}
                onCancel={() => setIsEditing(false)}
              />
            ) : (
              <ProfileView 
                userData={userData} 
                isCurrentUser={isCurrentUser}
                onEdit={() => setIsEditing(true)}
                onChat={handleStartChat}
                onAddToFavorites={handleAddToFavorites}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileNew; 