import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiUser, FiMail, FiPhone, FiMapPin, FiGlobe, FiLinkedin, FiGithub,
  FiCamera, FiEdit3, FiSave, FiX, FiPlus, FiMinus, FiCheck, FiEye,
  FiEyeOff, FiUpload, FiTrash2, FiCalendar, FiBriefcase, FiGraduationCap,
  FiAward, FiTarget, FiHeart, FiStar, FiZap, FiTrendingUp, FiCode,
  FiPenTool, FiMusic, FiBookOpen, FiCoffee, FiMonitor, FiSmartphone
} from 'react-icons/fi';
import { UserData } from '../types';

interface EnhancedProfileEditorProps {
  userData: UserData | null;
  onSave: (data: Partial<UserData>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

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

// Компонент поля ввода
const FormField = ({ 
  label, 
  icon: Icon, 
  children, 
  required = false,
  description,
  error 
}: {
  label: string;
  icon: React.ElementType;
  children: React.ReactNode;
  required?: boolean;
  description?: string;
  error?: string;
}) => (
  <motion.div
    variants={itemVariants}
    className="space-y-2 sm:space-y-3"
  >
    <div className="flex items-center space-x-2 sm:space-x-3">
      <motion.div
        whileHover={{ scale: 1.1, rotate: 5 }}
        className="p-2 sm:p-3 bg-black dark:bg-white rounded-xl sm:rounded-2xl shadow-lg"
      >
        <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white dark:text-black" />
      </motion.div>
      <div className="flex-1">
        <label className="block text-sm sm:text-base font-bold text-black dark:text-white">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {description && (
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
            {description}
          </p>
        )}
      </div>
    </div>
    
    <div className="pl-12 sm:pl-16">
      {children}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-500 text-xs sm:text-sm mt-1 font-medium"
        >
          {error}
        </motion.p>
      )}
    </div>
  </motion.div>
);

// Компонент ввода текста
const TextInput = ({ 
  value, 
  onChange, 
  placeholder, 
  type = 'text',
  disabled = false,
  multiline = false,
  rows = 3
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  disabled?: boolean;
  multiline?: boolean;
  rows?: number;
}) => {
  const InputComponent = multiline ? 'textarea' : 'input';
  
  return (
    <motion.div
      whileFocus={{ scale: 1.02 }}
      className="relative"
    >
      <InputComponent
        type={multiline ? undefined : type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        rows={multiline ? rows : undefined}
        className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-white dark:bg-black border-2 border-gray-200 dark:border-gray-800 rounded-xl sm:rounded-2xl focus:border-black dark:focus:border-white focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10 transition-all duration-300 text-sm sm:text-base font-medium text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed resize-none"
      />
      
      {/* Анимированная граница */}
      <motion.div
        className="absolute inset-0 rounded-xl sm:rounded-2xl border-2 border-transparent"
        whileFocus={{
          borderColor: "rgba(0, 0, 0, 0.3)",
          boxShadow: "0 0 0 4px rgba(0, 0, 0, 0.1)"
        }}
        transition={{ duration: 0.2 }}
      />
    </motion.div>
  );
};

// Компонент для тегов
const TagInput = ({ 
  tags, 
  onChange, 
  placeholder, 
  suggestions = [] 
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder: string;
  suggestions?: string[];
}) => {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const addTag = (tag: string) => {
    if (tag && !tags.includes(tag)) {
      onChange([...tags, tag]);
      setInputValue('');
      setShowSuggestions(false);
    }
  };
  
  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter(tag => tag !== tagToRemove));
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      addTag(inputValue.trim());
    }
  };
  
  const filteredSuggestions = suggestions.filter(
    suggestion => 
      suggestion.toLowerCase().includes(inputValue.toLowerCase()) &&
      !tags.includes(suggestion)
  );
  
  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Существующие теги */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 sm:gap-3">
          {tags.map((tag, index) => (
            <motion.div
              key={tag}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={{ scale: 1.05 }}
              className="group flex items-center space-x-2 px-3 sm:px-4 py-2 sm:py-3 bg-black dark:bg-white text-white dark:text-black rounded-full text-xs sm:text-sm font-bold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <span>{tag}</span>
              <motion.button
                whileHover={{ scale: 1.2, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => removeTag(tag)}
                className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-white/20 dark:bg-black/20 flex items-center justify-center hover:bg-white/30 dark:hover:bg-black/30 transition-colors"
              >
                <FiX className="w-3 h-3 sm:w-4 sm:h-4" />
              </motion.button>
            </motion.div>
          ))}
        </div>
      )}
      
      {/* Поле ввода */}
      <div className="relative">
        <TextInput
          value={inputValue}
          onChange={(value) => {
            setInputValue(value);
            setShowSuggestions(value.length > 0);
          }}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
        />
        
        {/* Кнопка добавления */}
        {inputValue.trim() && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => addTag(inputValue.trim())}
            className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 p-2 sm:p-3 bg-black dark:bg-white text-white dark:text-black rounded-xl hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
          >
            <FiPlus className="w-4 h-4 sm:w-5 sm:h-5" />
          </motion.button>
        )}
        
        {/* Предложения */}
        <AnimatePresence>
          {showSuggestions && filteredSuggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute z-10 w-full mt-2 bg-white dark:bg-black border-2 border-gray-200 dark:border-gray-800 rounded-xl sm:rounded-2xl shadow-2xl max-h-48 overflow-y-auto"
            >
              {filteredSuggestions.map((suggestion) => (
                <motion.button
                  key={suggestion}
                  whileHover={{ backgroundColor: 'rgba(0, 0, 0, 0.05)' }}
                  onClick={() => addTag(suggestion)}
                  className="w-full px-4 sm:px-6 py-3 sm:py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors text-sm sm:text-base font-medium"
                >
                  {suggestion}
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Компонент загрузки фото
const PhotoUpload = ({ 
  currentPhoto, 
  onPhotoChange 
}: {
  currentPhoto?: string;
  onPhotoChange: (file: File | null) => void;
}) => {
  const [preview, setPreview] = useState<string | null>(currentPhoto || null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      onPhotoChange(file);
    }
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };
  
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };
  
  return (
    <div className="flex flex-col items-center space-y-4 sm:space-y-6">
      <motion.div
        whileHover={{ scale: 1.05 }}
        className="relative group"
      >
        <div
          className={`w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-900 border-4 border-gray-200 dark:border-gray-800 group-hover:border-black dark:group-hover:border-white transition-all duration-300 ${
            isDragging ? 'border-black dark:border-white scale-105' : ''
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          {preview ? (
            <img 
              src={preview} 
              alt="Profile" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-600">
              <FiUser className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20" />
            </div>
          )}
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-sm">
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="text-white text-center"
            >
              <FiCamera className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2" />
              <p className="text-xs sm:text-sm font-bold">
                {preview ? 'Изменить' : 'Загрузить'}
              </p>
            </motion.div>
          </div>
        </div>
        
        {/* Кнопка удаления */}
        {preview && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              setPreview(null);
              onPhotoChange(null);
            }}
            className="absolute -top-2 -right-2 w-8 h-8 sm:w-10 sm:h-10 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
          >
            <FiTrash2 className="w-4 h-4 sm:w-5 sm:h-5" />
          </motion.button>
        )}
      </motion.div>
      
      {/* Кнопки управления */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => fileInputRef.current?.click()}
          className="px-4 sm:px-6 py-2 sm:py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl sm:rounded-2xl hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors font-bold text-sm sm:text-base flex items-center space-x-2"
        >
          <FiUpload className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>Выбрать файл</span>
        </motion.button>
        
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium">
          JPG, PNG до 5MB
        </p>
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        className="hidden"
      />
    </div>
  );
};

// Главный компонент
const EnhancedProfileEditor: React.FC<EnhancedProfileEditorProps> = ({
  userData,
  onSave,
  onCancel,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<Partial<UserData>>({
    displayName: userData?.displayName || '',
    email: userData?.email || '',
    phone: userData?.phone || '',
    location: userData?.location || '',
    bio: userData?.bio || '',
    website: userData?.website || '',
    linkedin: userData?.linkedin || '',
    github: userData?.github || '',
    skills: userData?.skills || [],
    interests: userData?.interests || [],
    experience: userData?.experience || [],
    education: userData?.education || [],
    languages: userData?.languages || [],
    age: userData?.age || undefined,
    field: userData?.field || '',
    company: userData?.company || '',
    position: userData?.position || ''
  });
  
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState('personal');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Предложения для навыков и интересов
  const skillSuggestions = [
    'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java', 'C++',
    'HTML/CSS', 'Vue.js', 'Angular', 'PHP', 'Ruby', 'Go', 'Rust', 'Swift',
    'Kotlin', 'Flutter', 'React Native', 'Docker', 'Kubernetes', 'AWS',
    'Azure', 'Google Cloud', 'MongoDB', 'PostgreSQL', 'MySQL', 'Redis',
    'GraphQL', 'REST API', 'Git', 'Linux', 'DevOps', 'CI/CD', 'Testing',
    'Agile', 'Scrum', 'Project Management', 'UI/UX Design', 'Figma',
    'Adobe Creative Suite', 'Marketing', 'SEO', 'Content Writing',
    'Data Analysis', 'Machine Learning', 'AI', 'Blockchain'
  ];
  
  const interestSuggestions = [
    'Программирование', 'Веб-разработка', 'Мобильная разработка', 'Дизайн',
    'UI/UX', 'Искусственный интеллект', 'Машинное обучение', 'Блокчейн',
    'Криптовалюты', 'Стартапы', 'Предпринимательство', 'Маркетинг',
    'SMM', 'Контент-маркетинг', 'SEO', 'Аналитика', 'Данные',
    'Кибербезопасность', 'DevOps', 'Облачные технологии', 'IoT',
    'Виртуальная реальность', 'Дополненная реальность', 'Игровая разработка',
    'Фотография', 'Видеомонтаж', 'Музыка', 'Искусство', 'Чтение',
    'Путешествия', 'Спорт', 'Фитнес', 'Кулинария', 'Изучение языков'
  ];
  
  const tabs = [
    { id: 'personal', label: 'Личная информация', icon: FiUser },
    { id: 'professional', label: 'Профессиональное', icon: FiBriefcase },
    { id: 'skills', label: 'Навыки и интересы', icon: FiZap },
    { id: 'contacts', label: 'Контакты', icon: FiMail }
  ];
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.displayName?.trim()) {
      newErrors.displayName = 'Имя обязательно для заполнения';
    }
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Некорректный email адрес';
    }
    
    if (formData.phone && !/^\+?[\d\s\-\(\)]+$/.test(formData.phone)) {
      newErrors.phone = 'Некорректный номер телефона';
    }
    
    if (formData.age && (formData.age < 14 || formData.age > 100)) {
      newErrors.age = 'Возраст должен быть от 14 до 100 лет';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSave = async () => {
    if (!validateForm()) return;
    
    try {
      const dataToSave = { ...formData };
      if (photoFile) {
        dataToSave.avatarFile = photoFile;
      }
      
      await onSave(dataToSave);
      setSaveSuccess(true);
      
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };
  
  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };
  
  return (
    <div className="min-h-screen bg-white dark:bg-black relative overflow-hidden">
      <AnimatedBackground />
      
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 sm:mb-12 lg:mb-16"
        >
          <motion.div
            variants={floatingVariants}
            animate="animate"
            className="inline-block mb-4 sm:mb-6"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-black dark:bg-white rounded-full flex items-center justify-center shadow-2xl">
              <FiEdit3 className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white dark:text-black" />
            </div>
          </motion.div>
          
          <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-black dark:text-white mb-4 sm:mb-6">
            <span className="font-thin">РЕДАКТИРОВАНИЕ</span>
            <br />
            <span className="font-black">ПРОФИЛЯ</span>
          </h1>
          
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto font-light">
            Создайте впечатляющий профиль, который выделит вас среди других
          </p>
        </motion.div>
        
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
                  <FiCheck className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
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
        
        {/* Main Form */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="bg-white/95 dark:bg-black/95 backdrop-blur-xl rounded-3xl sm:rounded-4xl shadow-2xl border border-gray-200/50 dark:border-gray-800/50 overflow-hidden"
        >
          {/* Tab Navigation */}
          <div className="border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 lg:px-8">
            <div className="flex overflow-x-auto scrollbar-hide">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <motion.button
                    key={tab.id}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 sm:space-x-3 px-4 sm:px-6 py-4 sm:py-6 border-b-2 transition-all duration-300 whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-black dark:border-white text-black dark:text-white'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                    <span className="font-bold text-sm sm:text-base">{tab.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>
          
          {/* Tab Content */}
          <div className="p-6 sm:p-8 lg:p-12">
            <AnimatePresence mode="wait">
              {activeTab === 'personal' && (
                <motion.div
                  key="personal"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6 sm:space-y-8"
                >
                  <PhotoUpload
                    currentPhoto={userData?.photoURL}
                    onPhotoChange={setPhotoFile}
                  />
                  
                  <FormField
                    label="Полное имя"
                    icon={FiUser}
                    required
                    error={errors.displayName}
                  >
                    <TextInput
                      value={formData.displayName || ''}
                      onChange={(value) => updateField('displayName', value)}
                      placeholder="Ваше полное имя"
                    />
                  </FormField>
                  
                  <FormField
                    label="О себе"
                    icon={FiBookOpen}
                    description="Расскажите о себе в нескольких предложениях"
                  >
                    <TextInput
                      value={formData.bio || ''}
                      onChange={(value) => updateField('bio', value)}
                      placeholder="Опишите себя, свои цели и достижения..."
                      multiline
                      rows={4}
                    />
                  </FormField>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                    <FormField
                      label="Возраст"
                      icon={FiCalendar}
                      error={errors.age}
                    >
                      <TextInput
                        value={formData.age?.toString() || ''}
                        onChange={(value) => updateField('age', value ? parseInt(value) : undefined)}
                        placeholder="Ваш возраст"
                        type="number"
                      />
                    </FormField>
                    
                    <FormField
                      label="Местоположение"
                      icon={FiMapPin}
                    >
                      <TextInput
                        value={formData.location || ''}
                        onChange={(value) => updateField('location', value)}
                        placeholder="Город, страна"
                      />
                    </FormField>
                  </div>
                </motion.div>
              )}
              
              {activeTab === 'professional' && (
                <motion.div
                  key="professional"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6 sm:space-y-8"
                >
                  <FormField
                    label="Область деятельности"
                    icon={FiTarget}
                    description="Ваша основная сфера деятельности"
                  >
                    <TextInput
                      value={formData.field || ''}
                      onChange={(value) => updateField('field', value)}
                      placeholder="Например: IT, Маркетинг, Дизайн"
                    />
                  </FormField>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                    <FormField
                      label="Компания"
                      icon={FiBriefcase}
                    >
                      <TextInput
                        value={formData.company || ''}
                        onChange={(value) => updateField('company', value)}
                        placeholder="Название компании"
                      />
                    </FormField>
                    
                    <FormField
                      label="Должность"
                      icon={FiAward}
                    >
                      <TextInput
                        value={formData.position || ''}
                        onChange={(value) => updateField('position', value)}
                        placeholder="Ваша должность"
                      />
                    </FormField>
                  </div>
                </motion.div>
              )}
              
              {activeTab === 'skills' && (
                <motion.div
                  key="skills"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6 sm:space-y-8"
                >
                  <FormField
                    label="Навыки"
                    icon={FiZap}
                    description="Добавьте свои профессиональные навыки"
                  >
                    <TagInput
                      tags={formData.skills || []}
                      onChange={(tags) => updateField('skills', tags)}
                      placeholder="Введите навык и нажмите Enter"
                      suggestions={skillSuggestions}
                    />
                  </FormField>
                  
                  <FormField
                    label="Интересы"
                    icon={FiHeart}
                    description="Что вас интересует и вдохновляет?"
                  >
                    <TagInput
                      tags={formData.interests || []}
                      onChange={(tags) => updateField('interests', tags)}
                      placeholder="Введите интерес и нажмите Enter"
                      suggestions={interestSuggestions}
                    />
                  </FormField>
                </motion.div>
              )}
              
              {activeTab === 'contacts' && (
                <motion.div
                  key="contacts"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6 sm:space-y-8"
                >
                  <FormField
                    label="Email"
                    icon={FiMail}
                    error={errors.email}
                  >
                    <TextInput
                      value={formData.email || ''}
                      onChange={(value) => updateField('email', value)}
                      placeholder="your@email.com"
                      type="email"
                    />
                  </FormField>
                  
                  <FormField
                    label="Телефон"
                    icon={FiPhone}
                    error={errors.phone}
                  >
                    <TextInput
                      value={formData.phone || ''}
                      onChange={(value) => updateField('phone', value)}
                      placeholder="+7 (xxx) xxx-xx-xx"
                      type="tel"
                    />
                  </FormField>
                  
                  <FormField
                    label="Веб-сайт"
                    icon={FiGlobe}
                  >
                    <TextInput
                      value={formData.website || ''}
                      onChange={(value) => updateField('website', value)}
                      placeholder="https://yourwebsite.com"
                      type="url"
                    />
                  </FormField>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                    <FormField
                      label="LinkedIn"
                      icon={FiLinkedin}
                    >
                      <TextInput
                        value={formData.linkedin || ''}
                        onChange={(value) => updateField('linkedin', value)}
                        placeholder="linkedin.com/in/yourprofile"
                      />
                    </FormField>
                    
                    <FormField
                      label="GitHub"
                      icon={FiGithub}
                    >
                      <TextInput
                        value={formData.github || ''}
                        onChange={(value) => updateField('github', value)}
                        placeholder="github.com/yourusername"
                      />
                    </FormField>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Action Buttons */}
          <div className="border-t border-gray-200 dark:border-gray-800 px-6 sm:px-8 lg:px-12 py-6 sm:py-8">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end space-y-3 sm:space-y-0 sm:space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onCancel}
                className="px-6 sm:px-8 py-3 sm:py-4 border-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl sm:rounded-2xl hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white transition-all duration-300 font-bold text-sm sm:text-base"
              >
                Отмена
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSave}
                disabled={isLoading}
                className="flex items-center justify-center space-x-2 sm:space-x-3 px-6 sm:px-8 py-3 sm:py-4 bg-black dark:bg-white text-white dark:text-black rounded-xl sm:rounded-2xl hover:bg-gray-800 dark:hover:bg-gray-200 transition-all duration-300 font-bold text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-white dark:border-black border-t-transparent rounded-full"
                  />
                ) : (
                  <FiSave className="w-5 h-5 sm:w-6 sm:h-6" />
                )}
                <span>{isLoading ? 'Сохранение...' : 'Сохранить изменения'}</span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default EnhancedProfileEditor; 