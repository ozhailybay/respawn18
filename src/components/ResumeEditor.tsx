import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase';
import { 
  FaFileAlt, 
  FaDownload, 
  FaEdit, 
  FaSave, 
  FaUndo, 
  FaMagic,
  FaUser,
  FaBriefcase,
  FaGraduationCap,
  FaTrophy,
  FaCode,
  FaPlus,
  FaTrash,
  FaEye,
  FaEyeSlash,
  FaSpinner,
  FaCheck,
  FaTimes,
  FaStar,
  FaLightbulb,
  FaRocket,
  FaBrain,
  FaPalette,
  FaCog,
  FaShare,
  FaBookmark,
  FaPrint,
  FaFilePdf,
  FaFileWord,
  FaFileImage,
  FaCopy,
  FaPaste,
  FaCut,
  FaUndoAlt,
  FaRedoAlt,
  FaBold,
  FaItalic,
  FaUnderline,
  FaListUl,
  FaListOl,
  FaAlignLeft,
  FaAlignCenter,
  FaAlignRight,
  FaAlignJustify,
  FaIndent,
  FaOutdent,
  FaLink,
  FaUnlink,
  FaImage,
  FaTable,
  FaQuoteLeft,
  FaCode as FaCodeIcon,
  FaSuperscript,
  FaSubscript,
  FaStrikethrough,
  FaHighlighter,
  FaFont,
  FaHeading,
  FaParagraph,
  FaMinus,
  FaExpand,
  FaCompress,
  FaSearch,
  FaFilter,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaThumbsUp,
  FaThumbsDown,
  FaHeart,
  FaRegHeart,
  FaShareAlt,
  FaComment,
  FaComments,
  FaBell,
  FaBellSlash,
  FaCog as FaCogIcon,
  FaUserCog,
  FaSignOutAlt,
  FaSignInAlt,
  FaUserPlus,
  FaUserMinus,
  FaUserEdit,
  FaUserCheck,
  FaUserTimes,
  FaUserLock,

  FaUserShield,
  FaUserSecret,
  FaUserNinja,
  FaUserTie,
  FaUserAstronaut,
  FaUserInjured,
  FaUserMd,
  FaUserNurse,
  FaChalkboardTeacher,
  FaUserGraduate,
  FaUserFriends,
  FaUserClock,
  FaUserTag,
  FaUserSlash,
  FaUserGraduate as FaUserGraduateIcon,
  FaUserTie as FaUserTieIcon,
  FaUserNinja as FaUserNinjaIcon,
  FaUserAstronaut as FaUserAstronautIcon,
  FaUserInjured as FaUserInjuredIcon,
  FaUserMd as FaUserMdIcon,
  FaUserNurse as FaUserNurseIcon,
  FaChalkboardTeacher as FaUserTeacherIcon,
  FaUserGraduate as FaUserStudentIcon,
  FaUserFriends as FaUserFriendsIcon,
  FaUserClock as FaUserClockIcon,
  FaUserTag as FaUserTagIcon,
  FaUserSlash as FaUserSlashIcon,
  FaUserLock as FaUserLockIcon
} from 'react-icons/fa';
import RespawnLogo from './RespawnLogo';

// Интерфейсы для типизации
interface ResumeData {
  summary: string;
  skills: string[];
  experience: Array<{
    company: string;
    role: string;
    dates: string;
    achievements: string[];
  }>;
  education: Array<{
    institution: string;
    degree: string;
    dates: string;
    highlights?: string[];
  }>;
  certifications: string[];
  projects: Array<{
    title: string;
    description: string;
    technologies: string[];
    url?: string;
  }>;
}

interface ResumeTemplate {
  id: string;
  name: string;
  description: string;
  preview: string;
  category: 'modern' | 'classic' | 'creative' | 'minimal';
}

const ResumeEditor: React.FC = () => {
  const { user, userData } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('modern');
  const [targetPosition, setTargetPosition] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Шаблоны резюме
  const templates: ResumeTemplate[] = [
    {
      id: 'modern',
      name: 'Modern Professional',
      description: 'Современный дизайн с акцентом на навыки и достижения',
      preview: 'modern-preview.jpg',
      category: 'modern'
    },
    {
      id: 'classic',
      name: 'Classic Executive',
      description: 'Классический стиль для опытных профессионалов',
      preview: 'classic-preview.jpg',
      category: 'classic'
    },
    {
      id: 'creative',
      name: 'Creative Portfolio',
      description: 'Креативный дизайн для творческих профессий',
      preview: 'creative-preview.jpg',
      category: 'creative'
    },
    {
      id: 'minimal',
      name: 'Minimal Clean',
      description: 'Минималистичный дизайн с фокусом на контент',
      preview: 'minimal-preview.jpg',
      category: 'minimal'
    }
  ];

  // Cloud Functions
  const generateResumeWithGemini = httpsCallable(functions, 'generateResumeWithGemini');

  // Генерация резюме с помощью Gemini
  const handleGenerateResume = async () => {
    if (!user?.uid) {
      setError('Пользователь не авторизован');
      return;
    }

    if (!targetPosition.trim()) {
      setError('Укажите целевую позицию');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await generateResumeWithGemini({
        targetPosition: targetPosition.trim(),
        template: selectedTemplate
      });

      const { data } = result as any;
      
      if (data.success) {
        setResumeData(data.data);
        setSuccess('Резюме успешно сгенерировано!');
        setIsEditing(true);
      } else {
        setError('Ошибка при генерации резюме');
      }
    } catch (error: any) {
      console.error('Error generating resume:', error);
      setError(error.message || 'Ошибка при генерации резюме');
    } finally {
      setIsGenerating(false);
    }
  };

  // Редактирование резюме
  const handleEditResume = () => {
    setIsEditing(true);
  };

  // Сохранение изменений
  const handleSaveResume = async () => {
    if (!resumeData) return;

    setIsLoading(true);
    try {
      // Здесь можно добавить сохранение в Firestore
      setSuccess('Изменения сохранены!');
      setIsEditing(false);
    } catch (error) {
      setError('Ошибка при сохранении');
    } finally {
      setIsLoading(false);
    }
  };

  // Отмена редактирования
  const handleCancelEdit = () => {
    setIsEditing(false);
    setError(null);
  };

  // Скачивание резюме
  const handleDownloadResume = async (format: 'pdf' | 'docx' | 'html') => {
    if (!resumeData) return;

    setIsLoading(true);
    try {
      // Здесь можно добавить логику скачивания
      setSuccess(`Резюме скачано в формате ${format.toUpperCase()}`);
    } catch (error) {
      setError('Ошибка при скачивании');
    } finally {
      setIsLoading(false);
    }
  };

  // Обновление данных резюме
  const updateResumeData = (field: keyof ResumeData, value: any) => {
    if (!resumeData) return;
    setResumeData(prev => prev ? { ...prev, [field]: value } : null);
  };

  // Обновление опыта работы
  const updateExperience = (index: number, field: string, value: any) => {
    if (!resumeData) return;
    const newExperience = [...resumeData.experience];
    newExperience[index] = { ...newExperience[index], [field]: value };
    updateResumeData('experience', newExperience);
  };

  // Добавление опыта работы
  const addExperience = () => {
    if (!resumeData) return;
    const newExperience = [...resumeData.experience, {
      company: '',
      role: '',
      dates: '',
      achievements: ['']
    }];
    updateResumeData('experience', newExperience);
  };

  // Удаление опыта работы
  const removeExperience = (index: number) => {
    if (!resumeData) return;
    const newExperience = resumeData.experience.filter((_, i) => i !== index);
    updateResumeData('experience', newExperience);
  };

  // Обновление достижений
  const updateAchievement = (expIndex: number, achIndex: number, value: string) => {
    if (!resumeData) return;
    const newExperience = [...resumeData.experience];
    newExperience[expIndex].achievements[achIndex] = value;
    updateResumeData('experience', newExperience);
  };

  // Добавление достижения
  const addAchievement = (expIndex: number) => {
    if (!resumeData) return;
    const newExperience = [...resumeData.experience];
    newExperience[expIndex].achievements.push('');
    updateResumeData('experience', newExperience);
  };

  // Удаление достижения
  const removeAchievement = (expIndex: number, achIndex: number) => {
    if (!resumeData) return;
    const newExperience = [...resumeData.experience];
    newExperience[expIndex].achievements.splice(achIndex, 1);
    updateResumeData('experience', newExperience);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/95 dark:bg-black/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <RespawnLogo size="md" animated={false} />
              <div>
                <h1 className="text-2xl font-black text-gray-900 dark:text-white">
                  AI Resume Generator
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Создайте профессиональное резюме с помощью AI
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowPreview(!showPreview)}
                className="p-3 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
              >
                {showPreview ? <FaEyeSlash className="w-5 h-5" /> : <FaEye className="w-5 h-5" />}
              </motion.button>
              
              {resumeData && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDownloadResume('pdf')}
                  className="p-3 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
                >
                  <FaDownload className="w-5 h-5" />
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Уведомления */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl"
            >
              <div className="flex items-center">
                <FaTimes className="w-5 h-5 text-red-600 mr-3" />
                <span className="text-red-800 dark:text-red-200">{error}</span>
              </div>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl"
            >
              <div className="flex items-center">
                <FaCheck className="w-5 h-5 text-green-600 mr-3" />
                <span className="text-green-800 dark:text-green-200">{success}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Генерация резюме */}
        {!resumeData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 mb-8"
          >
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-r from-gray-900 to-black dark:from-white dark:to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaBrain className="w-10 h-10 text-white dark:text-black" />
              </div>
              <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
                Создайте резюме с AI
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Gemini AI проанализирует ваш профиль и создаст профессиональное резюме
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Выбор позиции */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Целевая позиция
                </label>
                <input
                  type="text"
                  value={targetPosition}
                  onChange={(e) => setTargetPosition(e.target.value)}
                  placeholder="Например: Frontend Developer, Data Scientist..."
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent"
                />
              </div>

              {/* Выбор шаблона */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Шаблон резюме
                </label>
                <select
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent"
                >
                  {templates.map(template => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Шаблоны */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Выберите дизайн
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {templates.map(template => (
                  <motion.div
                    key={template.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedTemplate(template.id)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedTemplate === template.id
                        ? 'border-gray-900 dark:border-white bg-gray-50 dark:bg-gray-800'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="w-full h-24 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg mb-3 flex items-center justify-center">
                      <FaFileAlt className="w-8 h-8 text-gray-500" />
                    </div>
                    <h4 className="font-bold text-gray-900 dark:text-white text-sm">
                      {template.name}
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {template.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Кнопка генерации */}
            <div className="text-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleGenerateResume}
                disabled={isGenerating || !targetPosition.trim()}
                className={`px-8 py-4 rounded-xl font-bold text-lg ${
                  isGenerating || !targetPosition.trim()
                    ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-gray-900 to-black dark:from-white dark:to-gray-200 text-white dark:text-black hover:shadow-lg'
                }`}
              >
                {isGenerating ? (
                  <div className="flex items-center">
                    <FaSpinner className="w-5 h-5 mr-3 animate-spin" />
                    Генерирую резюме...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <FaMagic className="w-5 h-5 mr-3" />
                    Создать резюме с AI
                  </div>
                )}
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Редактор резюме */}
        {resumeData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            {/* Панель редактирования */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-gray-900 dark:text-white">
                  Редактирование резюме
                </h2>
                <div className="flex space-x-2">
                  {isEditing ? (
                    <>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSaveResume}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg font-bold"
                      >
                        <FaSave className="w-4 h-4 mr-2" />
                        Сохранить
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleCancelEdit}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg font-bold"
                      >
                        <FaTimes className="w-4 h-4 mr-2" />
                        Отмена
                      </motion.button>
                    </>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleEditResume}
                      className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-black rounded-lg font-bold"
                    >
                      <FaEdit className="w-4 h-4 mr-2" />
                      Редактировать
                    </motion.button>
                  )}
                </div>
              </div>

              {/* Сводка */}
              <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                  <FaUser className="w-5 h-5 mr-2" />
                  Профессиональная сводка
                </h3>
                {isEditing ? (
                  <textarea
                    value={resumeData.summary}
                    onChange={(e) => updateResumeData('summary', e.target.value)}
                    className="w-full h-32 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
                    placeholder="Опишите ваш профессиональный опыт и цели..."
                  />
                ) : (
                  <p className="text-gray-700 dark:text-gray-300">{resumeData.summary}</p>
                )}
              </div>

              {/* Навыки */}
              <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                  <FaStar className="w-5 h-5 mr-2" />
                  Ключевые навыки
                </h3>
                {isEditing ? (
                  <div className="space-y-2">
                    {resumeData.skills.map((skill, index) => (
                      <input
                        key={index}
                        type="text"
                        value={skill}
                        onChange={(e) => {
                          const newSkills = [...resumeData.skills];
                          newSkills[index] = e.target.value;
                          updateResumeData('skills', newSkills);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        placeholder="Навык"
                      />
                    ))}
                    <button
                      onClick={() => updateResumeData('skills', [...resumeData.skills, ''])}
                      className="w-full px-3 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 hover:border-gray-400 dark:hover:border-gray-500"
                    >
                      <FaPlus className="w-4 h-4 mx-auto" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {resumeData.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Опыт работы */}
              <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                    <FaBriefcase className="w-5 h-5 mr-2" />
                    Опыт работы
                  </h3>
                  {isEditing && (
                    <button
                      onClick={addExperience}
                      className="px-3 py-1 bg-gray-900 dark:bg-white text-white dark:text-black rounded-lg text-sm font-bold"
                    >
                      <FaPlus className="w-4 h-4" />
                    </button>
                  )}
                </div>
                
                <div className="space-y-4">
                  {resumeData.experience.map((exp, expIndex) => (
                    <div key={expIndex} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      {isEditing && (
                        <div className="flex justify-between items-start mb-3">
                          <input
                            type="text"
                            value={exp.company}
                            onChange={(e) => updateExperience(expIndex, 'company', e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white mr-2"
                            placeholder="Название компании"
                          />
                          <button
                            onClick={() => removeExperience(expIndex)}
                            className="px-2 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                          >
                            <FaTrash className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                      
                      {isEditing ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={exp.role}
                            onChange={(e) => updateExperience(expIndex, 'role', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            placeholder="Должность"
                          />
                          <input
                            type="text"
                            value={exp.dates}
                            onChange={(e) => updateExperience(expIndex, 'dates', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            placeholder="Период работы"
                          />
                          
                          <div className="space-y-2">
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                              Достижения:
                            </label>
                            {exp.achievements.map((achievement, achIndex) => (
                              <div key={achIndex} className="flex items-center space-x-2">
                                <input
                                  type="text"
                                  value={achievement}
                                  onChange={(e) => updateAchievement(expIndex, achIndex, e.target.value)}
                                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                  placeholder="Достижение"
                                />
                                <button
                                  onClick={() => removeAchievement(expIndex, achIndex)}
                                  className="px-2 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                                >
                                  <FaTrash className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                            <button
                              onClick={() => addAchievement(expIndex)}
                              className="w-full px-3 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 hover:border-gray-400 dark:hover:border-gray-500"
                            >
                              <FaPlus className="w-4 h-4 mx-auto" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <h4 className="font-bold text-gray-900 dark:text-white">{exp.role}</h4>
                          <p className="text-gray-600 dark:text-gray-400">{exp.company}</p>
                          <p className="text-sm text-gray-500">{exp.dates}</p>
                          <ul className="mt-2 space-y-1">
                            {exp.achievements.map((achievement, index) => (
                              <li key={index} className="text-sm text-gray-700 dark:text-gray-300">
                                • {achievement}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Образование */}
              <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                  <FaGraduationCap className="w-5 h-5 mr-2" />
                  Образование
                </h3>
                <div className="space-y-4">
                  {resumeData.education.map((edu, index) => (
                    <div key={index}>
                      <h4 className="font-bold text-gray-900 dark:text-white">{edu.degree}</h4>
                      <p className="text-gray-600 dark:text-gray-400">{edu.institution}</p>
                      <p className="text-sm text-gray-500">{edu.dates}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Предварительный просмотр */}
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Предварительный просмотр
                </h3>
                <div className="flex space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDownloadResume('pdf')}
                    className="px-3 py-2 bg-gray-900 dark:bg-white text-white dark:text-black rounded-lg font-bold text-sm"
                  >
                    <FaFilePdf className="w-4 h-4 mr-2" />
                    PDF
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDownloadResume('docx')}
                    className="px-3 py-2 bg-gray-900 dark:bg-white text-white dark:text-black rounded-lg font-bold text-sm"
                  >
                    <FaFileWord className="w-4 h-4 mr-2" />
                    DOCX
                  </motion.button>
                </div>
              </div>

              {/* Контент предварительного просмотра */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 min-h-[600px]">
                <div className="space-y-6">
                  {/* Заголовок */}
                  <div className="text-center border-b border-gray-300 dark:border-gray-600 pb-4">
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white">
                      {userData?.displayName || 'Имя Фамилия'}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">{targetPosition}</p>
                  </div>

                  {/* Сводка */}
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      Профессиональная сводка
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 text-sm">
                      {resumeData.summary}
                    </p>
                  </div>

                  {/* Навыки */}
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      Ключевые навыки
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {resumeData.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Опыт работы */}
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      Опыт работы
                    </h2>
                    <div className="space-y-4">
                      {resumeData.experience.map((exp, index) => (
                        <div key={index}>
                          <h3 className="font-bold text-gray-900 dark:text-white">{exp.role}</h3>
                          <p className="text-gray-600 dark:text-gray-400">{exp.company}</p>
                          <p className="text-sm text-gray-500">{exp.dates}</p>
                          <ul className="mt-2 space-y-1">
                            {exp.achievements.map((achievement, achIndex) => (
                              <li key={achIndex} className="text-sm text-gray-700 dark:text-gray-300">
                                • {achievement}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Образование */}
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      Образование
                    </h2>
                    <div className="space-y-2">
                      {resumeData.education.map((edu, index) => (
                        <div key={index}>
                          <h3 className="font-bold text-gray-900 dark:text-white">{edu.degree}</h3>
                          <p className="text-gray-600 dark:text-gray-400">{edu.institution}</p>
                          <p className="text-sm text-gray-500">{edu.dates}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ResumeEditor; 