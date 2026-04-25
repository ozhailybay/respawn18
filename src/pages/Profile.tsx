import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';
import { doc, getDoc, updateDoc, collection, addDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { db, storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { UserData } from '../types';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import html2pdf from 'html2pdf.js';
import { FiUser, FiEdit, FiSave, FiX, FiMessageCircle, FiStar, FiFileText, FiEye, FiEyeOff, FiDownload, FiHome, FiMail, FiPhone, FiMapPin, FiCalendar, FiGraduationCap, FiBriefcase, FiAward, FiTarget, FiEdit3, FiZap, FiHeart, FiGlobe, FiLinkedin, FiGithub } from 'react-icons/fi';
import EnhancedProfileEditor from '../components/EnhancedProfileEditor';

// Анимационные варианты
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
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: { 
      duration: 0.6, 
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

const floatingVariants = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

// Премиальный анимированный фон
const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-black dark:via-gray-950 dark:to-gray-900" />
      
      {/* Геометрические формы */}
      <motion.div
        animate={{ 
          rotate: [0, 360],
          scale: [1, 1.2, 1],
          opacity: [0.03, 0.08, 0.03]
        }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="absolute -top-40 -left-40 w-80 h-80 border border-black/10 dark:border-white/10 rounded-full"
      />
      
      <motion.div
        animate={{ 
          rotate: [360, 0],
          scale: [1, 1.3, 1],
          opacity: [0.05, 0.1, 0.05]
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute -bottom-40 -right-40 w-96 h-96 border border-black/10 dark:border-white/10 rounded-full"
      />
      
      {/* Плавающие элементы */}
      {Array.from({ length: 6 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 sm:w-4 sm:h-4 border border-black/10 dark:border-white/10 rounded-full"
          style={{
            left: `${15 + (i * 15)}%`,
            top: `${25 + (i * 10)}%`,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.1, 0.4, 0.1],
          }}
          transition={{
            duration: 8 + (i * 2),
            repeat: Infinity,
            delay: i * 0.5,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
};

const Profile: React.FC = () => {
  const [user, loading] = useAuthState(auth);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<UserData>>({});
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [showResume, setShowResume] = useState(false);
  const [resumeLoading, setResumeLoading] = useState(false);
  const [resumeError, setResumeError] = useState<string | null>(null);
  const resumeRef = useRef<HTMLDivElement>(null);
  
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setError(null);
        // Определяем, чей профиль нужно загрузить
        const profileUserId = userId || (user ? user.uid : null);
        
        // Проверяем, является ли просматриваемый профиль профилем текущего пользователя
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
          
          // Если это профиль текущего пользователя, инициализируем форму данными
          if (isCurrentUserProfile) {
          setFormData({
            displayName: data.displayName,
            interests: data.interests,
            skills: data.skills,
            education: data.education,
            experience: data.experience,
            // Add these properties only if they exist in the data
            ...(data.age !== undefined && { age: data.age }),
            ...(data.field !== undefined && { field: data.field })
          });
        }
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'interests' || name === 'skills') {
      setFormData({
        ...formData,
        [name]: value.split(',').map(item => item.trim())
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSave = async (profileData: Partial<UserData>) => {
    if (!user || !isCurrentUser) return;
    
    setSaveLoading(true);
    setSaveSuccess(false);
    
    try {
      // Handle avatar upload if provided
      let photoURL = userData?.photoURL;
      const avatarFile = profileData.avatarFile as File;
      
      if (avatarFile && avatarFile instanceof File) {
        const avatarRef = ref(storage, `avatars/${user.uid}/${avatarFile.name}`);
        await uploadBytes(avatarRef, avatarFile);
        photoURL = await getDownloadURL(avatarRef);
      }
      
      // Remove the avatarFile property before saving to Firestore
      const { avatarFile: _, ...dataToSave } = profileData;
      
      // Update document
      await updateDoc(doc(db, 'users', user.uid), {
        ...dataToSave,
        photoURL,
        updatedAt: serverTimestamp()
      });
      
      // Update local state
      setUserData({
        ...userData!,
        ...dataToSave,
        photoURL
      });
      
      setSaveSuccess(true);
      setIsEditing(false);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Не удалось сохранить изменения');
    } finally {
      setSaveLoading(false);
    }
  };

  const startChat = async () => {
    if (!user || !userData || user.uid === userData.uid) return;
    
    try {
      // Создаем новый чат
      const chatData = {
        participants: [user.uid, userData.uid],
        participantNames: [user.displayName || user.email, userData.displayName || userData.email],
        lastMessage: '',
        lastMessageTime: new Date(),
        createdAt: new Date()
      };
      
      const chatRef = await addDoc(collection(db, 'chats'), chatData);
      navigate(`/chat/${chatRef.id}`);
    } catch (error) {
      console.error('Error starting chat:', error);
    }
  };

  const exportResumeToPDF = () => {
    if (!resumeRef.current) return;
    
    const element = resumeRef.current;
    const opt = {
      margin: 1,
      filename: `${userData?.displayName || 'profile'}_resume.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    
    html2pdf().set(opt).from(element).save();
  };

  const addToFavorites = async () => {
    if (!user || !userData || user.uid === userData.uid) return;
    
    try {
      await addDoc(collection(db, 'favorites'), {
        userId: user.uid,
        favoriteUserId: userData.uid,
        createdAt: new Date()
      });
    } catch (error) {
      console.error('Error adding to favorites:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-black dark:border-white border-t-transparent rounded-full"
        />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiX className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-xl font-bold text-black dark:text-white mb-2">Ошибка</h3>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  // Если редактируем профиль, показываем улучшенный редактор
  if (isEditing && isCurrentUser) {
    return (
      <EnhancedProfileEditor
        userData={userData}
        onSave={handleSave}
        onCancel={() => setIsEditing(false)}
        isLoading={saveLoading}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black relative overflow-hidden">
      <AnimatedBackground />
      
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        {/* Success Message */}
        <AnimatePresence>
          {saveSuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="mb-6 sm:mb-8 p-4 sm:p-6 bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-2xl sm:rounded-3xl"
            >
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <FiSave className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <p className="text-green-800 dark:text-green-200 font-bold text-sm sm:text-base">
                    Профиль успешно обновлен!
                  </p>
                  <p className="text-green-600 dark:text-green-400 text-xs sm:text-sm">
                    Все изменения сохранены
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Profile Card */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="bg-white/95 dark:bg-black/95 backdrop-blur-xl rounded-3xl sm:rounded-4xl shadow-2xl border border-gray-200/50 dark:border-gray-800/50 overflow-hidden"
        >
          {/* Header */}
          <div className="relative p-6 sm:p-8 lg:p-12 border-b border-gray-200 dark:border-gray-800">
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 lg:space-x-8">
              {/* Avatar */}
                <motion.div 
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                className="relative"
              >
                <div className="w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-900 border-4 border-gray-200 dark:border-gray-800 shadow-lg">
                  {userData?.photoURL ? (
                    <img 
                      src={userData.photoURL} 
                      alt={userData.displayName || 'Profile'} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-600">
                      <FiUser className="w-8 h-8 sm:w-12 sm:h-12 lg:w-16 lg:h-16" />
                    </div>
                  )}
                </div>
                
                {/* Status indicator */}
                <div className="absolute -bottom-2 -right-2 w-6 h-6 sm:w-8 sm:h-8 bg-green-500 rounded-full border-4 border-white dark:border-black shadow-lg"></div>
                </motion.div>
              
              {/* User Info */}
              <div className="flex-1 text-center sm:text-left">
                  <motion.h1 
                  variants={itemVariants}
                  className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black dark:text-white mb-2 sm:mb-3"
                  >
                  {userData?.displayName || 'Пользователь'}
                  </motion.h1>
                
                <motion.div 
                  variants={itemVariants}
                  className="flex flex-col sm:flex-row items-center sm:items-start space-y-2 sm:space-y-0 sm:space-x-4 lg:space-x-6 text-gray-600 dark:text-gray-400"
                >
                  {userData?.field && (
                    <div className="flex items-center space-x-2">
                      <FiBriefcase className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="text-sm sm:text-base font-medium">{userData.field}</span>
                    </div>
                  )}
                  
                  {userData?.location && (
                    <div className="flex items-center space-x-2">
                      <FiMapPin className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="text-sm sm:text-base font-medium">{userData.location}</span>
                    </div>
                  )}
                  
                  {userData?.age && (
                    <div className="flex items-center space-x-2">
                      <FiCalendar className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="text-sm sm:text-base font-medium">{userData.age} лет</span>
                    </div>
                  )}
                </motion.div>
                
                {/* Bio */}
                {userData?.bio && (
                  <motion.p 
                    variants={itemVariants}
                    className="mt-3 sm:mt-4 text-gray-700 dark:text-gray-300 text-sm sm:text-base leading-relaxed max-w-2xl"
                  >
                    {userData.bio}
                  </motion.p>
                )}
              </div>
              
              {/* Action Buttons */}
                <motion.div 
                variants={itemVariants}
                className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto"
              >
                {isCurrentUser ? (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsEditing(true)}
                    className="flex items-center justify-center space-x-2 px-4 sm:px-6 py-2 sm:py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl sm:rounded-2xl hover:bg-gray-800 dark:hover:bg-gray-200 transition-all duration-300 font-bold text-sm sm:text-base shadow-lg"
                  >
                    <FiEdit3 className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Редактировать</span>
                  </motion.button>
                ) : (
                  <>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                      onClick={startChat}
                      className="flex items-center justify-center space-x-2 px-4 sm:px-6 py-2 sm:py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl sm:rounded-2xl hover:bg-gray-800 dark:hover:bg-gray-200 transition-all duration-300 font-bold text-sm sm:text-base shadow-lg"
                    >
                      <FiMessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span>Написать</span>
                  </motion.button>
                  
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={addToFavorites}
                      className="flex items-center justify-center space-x-2 px-4 sm:px-6 py-2 sm:py-3 border-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl sm:rounded-2xl hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white transition-all duration-300 font-bold text-sm sm:text-base"
                    >
                      <FiHeart className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span>В избранное</span>
                    </motion.button>
                  </>
                  )}
                </motion.div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 sm:p-8 lg:p-12">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-8 sm:space-y-12"
            >
              {/* Skills */}
              {userData?.skills && Array.isArray(userData.skills) && userData.skills.length > 0 && (
                <motion.div variants={itemVariants}>
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-black dark:text-white mb-4 sm:mb-6 flex items-center">
                    <FiZap className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
                    <span>Навыки</span>
                  </h3>
                  <div className="flex flex-wrap gap-2 sm:gap-3">
                    {userData.skills.map((skill, index) => (
                      <motion.span
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.05 }}
                        className="px-3 sm:px-4 py-2 sm:py-3 bg-black dark:bg-white text-white dark:text-black rounded-full text-xs sm:text-sm font-bold shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        {typeof skill === 'string' ? skill : skill.name || skill}
                      </motion.span>
                    ))}
                      </div>
                </motion.div>
              )}

              {/* Interests */}
              {userData?.interests && Array.isArray(userData.interests) && userData.interests.length > 0 && (
                <motion.div variants={itemVariants}>
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-black dark:text-white mb-4 sm:mb-6 flex items-center">
                    <FiHeart className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
                    <span>Интересы</span>
                  </h3>
                  <div className="flex flex-wrap gap-2 sm:gap-3">
                    {userData.interests.map((interest, index) => (
                      <motion.span
                          key={index} 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.05 }}
                        className="px-3 sm:px-4 py-2 sm:py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-xs sm:text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300"
                      >
                        {interest}
                      </motion.span>
                      ))}
                    </div>
                  </motion.div>
                )}
                
              {/* Education */}
              {userData?.education && Array.isArray(userData.education) && userData.education.length > 0 && (
                <motion.div variants={itemVariants}>
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-black dark:text-white mb-4 sm:mb-6 flex items-center">
                    <FiGraduationCap className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
                    <span>Образование</span>
                  </h3>
                  <div className="space-y-4 sm:space-y-6">
                    {userData.education.map((edu, index) => (
                  <motion.div 
                        key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 sm:p-6 bg-gray-50 dark:bg-gray-900 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-800"
                      >
                        <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 font-medium">
                          {typeof edu === 'string' ? edu : edu.institution || edu}
                        </p>
                  </motion.div>
                    ))}
                    </div>
                  </motion.div>
                )}
                
              {/* Experience */}
              {userData?.experience && Array.isArray(userData.experience) && userData.experience.length > 0 && (
                <motion.div variants={itemVariants}>
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-black dark:text-white mb-4 sm:mb-6 flex items-center">
                    <FiBriefcase className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
                    <span>Опыт работы</span>
                  </h3>
                  <div className="space-y-4 sm:space-y-6">
                    {userData.experience.map((exp, index) => (
                  <motion.div 
                        key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 sm:p-6 bg-gray-50 dark:bg-gray-900 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-800"
                      >
                        <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 font-medium">
                          {typeof exp === 'string' ? exp : exp.company || exp}
                        </p>
                      </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
                
              {/* Contact Links */}
              <motion.div variants={itemVariants}>
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-black dark:text-white mb-4 sm:mb-6 flex items-center">
                  <FiMail className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
                  <span>Контакты</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {userData?.email && (
                    <motion.a
                      href={`mailto:${userData.email}`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center space-x-3 p-4 sm:p-6 bg-gray-50 dark:bg-gray-900 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-800 hover:border-black dark:hover:border-white transition-all duration-300"
                    >
                      <FiMail className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 dark:text-gray-400" />
                      <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300 font-medium">
                        {userData.email}
                      </span>
                    </motion.a>
                  )}
                  
                  {userData?.phone && (
                    <motion.a
                      href={`tel:${userData.phone}`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center space-x-3 p-4 sm:p-6 bg-gray-50 dark:bg-gray-900 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-800 hover:border-black dark:hover:border-white transition-all duration-300"
                    >
                      <FiPhone className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 dark:text-gray-400" />
                      <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300 font-medium">
                        {userData.phone}
                      </span>
                    </motion.a>
                  )}
                  
                  {userData?.website && (
                    <motion.a
                      href={userData.website}
                      target="_blank"
                      rel="noopener noreferrer"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                      className="flex items-center space-x-3 p-4 sm:p-6 bg-gray-50 dark:bg-gray-900 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-800 hover:border-black dark:hover:border-white transition-all duration-300"
                    >
                      <FiGlobe className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 dark:text-gray-400" />
                      <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300 font-medium">
                        Веб-сайт
                      </span>
                    </motion.a>
                  )}
                  
                  {userData?.linkedin && (
                    <motion.a
                      href={userData.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center space-x-3 p-4 sm:p-6 bg-gray-50 dark:bg-gray-900 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-800 hover:border-black dark:hover:border-white transition-all duration-300"
                    >
                      <FiLinkedin className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 dark:text-gray-400" />
                      <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300 font-medium">
                        LinkedIn
                      </span>
                    </motion.a>
                  )}
                  
                  {userData?.github && (
                    <motion.a
                      href={userData.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center space-x-3 p-4 sm:p-6 bg-gray-50 dark:bg-gray-900 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-800 hover:border-black dark:hover:border-white transition-all duration-300"
                    >
                      <FiGithub className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 dark:text-gray-400" />
                      <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300 font-medium">
                        GitHub
                      </span>
                    </motion.a>
                )}
              </div>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile; 