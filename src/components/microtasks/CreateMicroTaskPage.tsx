import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FiArrowLeft, FiPlus, FiX, FiDollarSign, FiCalendar, FiTag, 
  FiFileText, FiCheckCircle, FiAlertCircle, FiInfo, FiSave
} from 'react-icons/fi';
import { MicroTaskCategory } from '../../types';
import { microTaskService } from '../../services/microTaskService';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

// Анимационные варианты
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5 }
  }
};

// Интерфейс для формы
interface TaskFormData {
  title: string;
  description: string;
  category: MicroTaskCategory | '';
  price: number | '';
  deadlineAt: string;
  requirements?: string;
  tags: string[];
  requiredSkills?: string[];
}

// Компонент тега
const TagInput = ({ 
  tags, 
  onTagsChange, 
  placeholder = "Добавить тег" 
}: { 
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  placeholder?: string;
}) => {
  const [inputValue, setInputValue] = useState('');

  const handleAddTag = () => {
    const trimmedValue = inputValue.trim();
    if (trimmedValue && !tags.includes(trimmedValue)) {
      onTagsChange([...tags, trimmedValue]);
      setInputValue('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onTagsChange(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex space-x-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="button"
          onClick={handleAddTag}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-1"
        >
          <FiPlus className="w-4 h-4" />
          <span>Добавить</span>
        </motion.button>
      </div>
      
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <motion.span
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm flex items-center space-x-1"
            >
              <span>{tag}</span>
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
              >
                <FiX className="w-3 h-3" />
              </button>
            </motion.span>
          ))}
        </div>
      )}
    </div>
  );
};

// Компонент предварительного просмотра
const TaskPreview = ({ formData }: { formData: TaskFormData }) => {
  const getCategoryName = (category: MicroTaskCategory | '') => {
    switch (category) {
      case 'design': return 'Дизайн';
      case 'copywriting': return 'Копирайтинг';
      case 'notion': return 'Notion';
      case 'other': return 'Другое';
      default: return 'Не выбрано';
    }
  };

  const getTimeLeft = (deadline: string) => {
    if (!deadline) return 'Не указан';
    
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffMs = deadlineDate.getTime() - now.getTime();
    
    if (diffMs <= 0) return 'Просрочен';
    
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return `${diffDays} дн.`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
        <FiInfo className="w-5 h-5" />
        <span>Предварительный просмотр</span>
      </h3>
      
      <div className="space-y-4">
        <div>
          <h4 className="text-xl font-bold text-gray-900 dark:text-white">
            {formData.title || 'Заголовок задания'}
          </h4>
          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
              {getCategoryName(formData.category)}
            </span>
            <span>Дедлайн: {getTimeLeft(formData.deadlineAt)}</span>
          </div>
        </div>
        
        <div>
          <p className="text-gray-700 dark:text-gray-300 text-sm">
            {formData.description || 'Описание задания будет здесь...'}
          </p>
        </div>
        
        {formData.requirements && (
          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h5 className="font-medium text-gray-900 dark:text-white mb-1">Требования:</h5>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {formData.requirements}
            </p>
          </div>
        )}
        
        {formData.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {formData.tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
        
        <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-700">
          <span className="text-sm text-gray-600 dark:text-gray-300">Бюджет:</span>
          <span className="text-2xl font-bold text-green-600 dark:text-green-400">
            {formData.price ? `${formData.price.toLocaleString()} ₸` : '0 ₸'}
          </span>
        </div>
      </div>
    </div>
  );
};

// Главный компонент
const CreateMicroTaskPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, userData } = useAuth();
  
  // Состояние формы
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    category: '',
    price: '',
    deadlineAt: '',
    requirements: '',
    tags: [],
    requiredSkills: []
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  // Проверка прав доступа
  const canCreateTasks = userData && (
    userData.role === 'employer' || 
    userData.role === 'business' || 
    userData.role === 'admin'
  );

  // Если пользователь не может создавать задания
  if (!canCreateTasks) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiAlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Доступ запрещен
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Только работодатели могут создавать микрозадания
          </p>
          <button
            onClick={() => navigate('/microtasks')}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            Вернуться к заданиям
          </button>
        </div>
      </div>
    );
  }

  // Валидация формы
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Заголовок обязателен';
    } else if (formData.title.length < 10) {
      newErrors.title = 'Заголовок должен содержать минимум 10 символов';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Описание обязательно';
    } else if (formData.description.length < 50) {
      newErrors.description = 'Описание должно содержать минимум 50 символов';
    }

    if (!formData.category) {
      newErrors.category = 'Выберите категорию';
    }

    if (!formData.price || formData.price <= 0) {
      newErrors.price = 'Укажите корректную цену';
    } else if (formData.price < 1000) {
      newErrors.price = 'Минимальная цена 1,000 ₸';
    }

    if (!formData.deadlineAt) {
      newErrors.deadlineAt = 'Укажите дедлайн';
    } else {
      const deadline = new Date(formData.deadlineAt);
      const now = new Date();
      const diffHours = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);
      
      if (diffHours < 24) {
        newErrors.deadlineAt = 'Дедлайн должен быть минимум через 24 часа';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Отправка формы
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Пожалуйста, исправьте ошибки в форме');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const taskData = {
        title: formData.title,
        description: formData.description,
        category: formData.category as MicroTaskCategory,
        price: formData.price as number,
        deadlineAt: formData.deadlineAt,
        requirements: formData.requirements ? formData.requirements.split('\n').filter(req => req.trim()) : [],
        tags: formData.tags,
        attachments: [],
        requiredSkills: formData.requiredSkills,
        employerId: user!.uid,
        employerName: userData?.displayName || userData?.firstName || 'Заказчик',
        employerPhotoURL: userData?.photoURL
      };

      const taskId = await microTaskService.createMicroTask(taskData);
      
      toast.success('Задание успешно создано!');
      navigate(`/microtasks/${taskId}`);
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Не удалось создать задание');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Обновление полей формы
  const updateFormData = (field: keyof TaskFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Компонент шага
  const StepIndicator = () => (
    <div className="flex items-center justify-center space-x-4 mb-8">
      {[1, 2, 3].map((step) => (
        <div key={step} className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors duration-200 ${
            step <= currentStep 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
          }`}>
            {step < currentStep ? <FiCheckCircle className="w-4 h-4" /> : step}
          </div>
          {step < 3 && (
            <div className={`w-12 h-0.5 mx-2 transition-colors duration-200 ${
              step < currentStep ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
            }`} />
          )}
        </div>
      ))}
    </div>
  );

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-100 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/microtasks')}
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
            >
              <FiArrowLeft className="w-5 h-5" />
              <span>Назад к заданиям</span>
            </motion.button>

            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Создать задание
            </h1>

            <div className="w-24" /> {/* Spacer */}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Form */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-700">
              <StepIndicator />
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Шаг 1: Основная информация */}
                {currentStep === 1 && (
                  <motion.div
                    variants={itemVariants}
                    className="space-y-6"
                  >
                    <div className="text-center mb-6">
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Основная информация
                      </h2>
                      <p className="text-gray-600 dark:text-gray-300">
                        Расскажите о вашем задании
                      </p>
                    </div>

                    {/* Заголовок */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Заголовок задания *
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => updateFormData('title', e.target.value)}
                        placeholder="Например: Создать логотип для стартапа"
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors duration-200 ${
                          errors.title ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'
                        }`}
                      />
                      {errors.title && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                          {errors.title}
                        </p>
                      )}
                    </div>

                    {/* Описание */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Описание задания *
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => updateFormData('description', e.target.value)}
                        placeholder="Подробно опишите что нужно сделать..."
                        rows={6}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white resize-none transition-colors duration-200 ${
                          errors.description ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'
                        }`}
                      />
                      {errors.description && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                          {errors.description}
                        </p>
                      )}
                    </div>

                    {/* Категория */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Категория *
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => updateFormData('category', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors duration-200 ${
                          errors.category ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'
                        }`}
                      >
                        <option value="">Выберите категорию</option>
                        <option value="design">Дизайн</option>
                        <option value="copywriting">Копирайтинг</option>
                        <option value="notion">Notion</option>
                        <option value="other">Другое</option>
                      </select>
                      {errors.category && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                          {errors.category}
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Шаг 2: Условия и требования */}
                {currentStep === 2 && (
                  <motion.div
                    variants={itemVariants}
                    className="space-y-6"
                  >
                    <div className="text-center mb-6">
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Условия и требования
                      </h2>
                      <p className="text-gray-600 dark:text-gray-300">
                        Укажите бюджет и сроки
                      </p>
                    </div>

                    {/* Цена */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Бюджет *
                      </label>
                      <div className="relative">
                        <FiDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="number"
                          value={formData.price}
                          onChange={(e) => updateFormData('price', e.target.value ? Number(e.target.value) : '')}
                          placeholder="0"
                          min="1000"
                          className={`w-full pl-10 pr-16 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors duration-200 ${
                            errors.price ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'
                          }`}
                        />
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">
                          ₸
                        </span>
                      </div>
                      {errors.price && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                          {errors.price}
                        </p>
                      )}
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Минимальная цена: 1,000 ₸
                      </p>
                    </div>

                    {/* Дедлайн */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Дедлайн *
                      </label>
                      <div className="relative">
                        <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="date"
                          value={formData.deadlineAt}
                          onChange={(e) => updateFormData('deadlineAt', e.target.value)}
                          min={getMinDate()}
                          className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors duration-200 ${
                            errors.deadlineAt ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'
                          }`}
                        />
                      </div>
                      {errors.deadlineAt && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                          {errors.deadlineAt}
                        </p>
                      )}
                    </div>

                    {/* Требования */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Особые требования
                      </label>
                      <textarea
                        value={formData.requirements}
                        onChange={(e) => updateFormData('requirements', e.target.value)}
                        placeholder="Укажите дополнительные требования к исполнителю..."
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white resize-none transition-colors duration-200"
                      />
                    </div>
                  </motion.div>
                )}

                {/* Шаг 3: Теги и навыки */}
                {currentStep === 3 && (
                  <motion.div
                    variants={itemVariants}
                    className="space-y-6"
                  >
                    <div className="text-center mb-6">
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Теги и навыки
                      </h2>
                      <p className="text-gray-600 dark:text-gray-300">
                        Помогите исполнителям найти ваше задание
                      </p>
                    </div>

                    {/* Теги */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Теги
                      </label>
                      <TagInput
                        tags={formData.tags}
                        onTagsChange={(tags) => updateFormData('tags', tags)}
                        placeholder="Добавить тег (например: логотип, брендинг)"
                      />
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Добавьте теги, чтобы исполнители легче находили ваше задание
                      </p>
                    </div>

                    {/* Необходимые навыки */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Необходимые навыки
                      </label>
                      <TagInput
                        tags={formData.requiredSkills || []}
                        onTagsChange={(skills) => updateFormData('requiredSkills', skills)}
                        placeholder="Добавить навык (например: Photoshop, Illustrator)"
                      />
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Укажите навыки, которые должны быть у исполнителя
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Навигация по шагам */}
                <div className="flex justify-between pt-6 border-t border-gray-100 dark:border-gray-700">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                    disabled={currentStep === 1}
                    className="px-6 py-3 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    Назад
                  </motion.button>

                  {currentStep < totalSteps ? (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => setCurrentStep(Math.min(totalSteps, currentStep + 1))}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                    >
                      Далее
                    </motion.button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center space-x-2"
                    >
                      {isSubmitting ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <FiSave className="w-4 h-4" />
                          <span>Создать задание</span>
                        </>
                      )}
                    </motion.button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* Preview */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <TaskPreview formData={formData} />
              
              {/* Tips */}
              <div className="mt-6 bg-blue-50 dark:bg-blue-900 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
                  💡 Советы для успешного задания
                </h3>
                <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                  <li>• Четко опишите что нужно сделать</li>
                  <li>• Укажите реалистичные сроки</li>
                  <li>• Добавьте примеры или референсы</li>
                  <li>• Используйте релевантные теги</li>
                  <li>• Установите справедливую цену</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CreateMicroTaskPage; 