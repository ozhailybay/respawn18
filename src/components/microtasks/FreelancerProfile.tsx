import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FiArrowLeft, FiStar, FiMapPin, FiCalendar, FiDollarSign, 
  FiUser, FiMail, FiPhone, FiGlobe, FiLinkedin, FiGithub,
  FiAward, FiTrendingUp, FiClock, FiCheckCircle, FiEye,
  FiThumbsUp, FiMessageSquare, FiShare2, FiBookmark
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { microTaskService } from '../../services/microTaskService';
import { MicroTask, User } from '../../types';
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

// Компонент статистики
const StatCard = ({ icon: Icon, label, value, color = 'blue' }: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color?: string;
}) => (
  <motion.div
    variants={itemVariants}
    className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700"
  >
    <div className="flex items-center space-x-3">
      <div className={`p-3 rounded-xl bg-${color}-100 dark:bg-${color}-900`}>
        <Icon className={`w-6 h-6 text-${color}-600 dark:text-${color}-400`} />
      </div>
      <div>
        <p className="text-sm text-gray-600 dark:text-gray-300">{label}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      </div>
    </div>
  </motion.div>
);

// Компонент рейтинга
const RatingStars = ({ rating, size = 'md' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <FiStar
          key={star}
          className={`${sizeClasses[size]} ${
            star <= rating 
              ? 'text-yellow-400 fill-current' 
              : 'text-gray-300 dark:text-gray-600'
          }`}
        />
      ))}
      <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">
        {rating.toFixed(1)}
      </span>
    </div>
  );
};

// Компонент портфолио
const PortfolioItem = ({ project }: { project: any }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 cursor-pointer"
  >
    <div className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-xl mb-4 overflow-hidden">
      {project.image ? (
        <img 
          src={project.image} 
          alt={project.title}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <FiEye className="w-12 h-12 text-gray-400" />
        </div>
      )}
    </div>
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
      {project.title}
    </h3>
    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
      {project.description}
    </p>
    <div className="flex items-center justify-between">
      <div className="flex flex-wrap gap-2">
        {project.tags?.map((tag: string, index: number) => (
          <span
            key={index}
            className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs"
          >
            {tag}
          </span>
        ))}
      </div>
      <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
        <FiCalendar className="w-4 h-4" />
        <span>{project.date}</span>
      </div>
    </div>
  </motion.div>
);

// Компонент отзыва
const ReviewCard = ({ review }: { review: any }) => (
  <motion.div
    variants={itemVariants}
    className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700"
  >
    <div className="flex items-start space-x-4">
      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
        {review.clientName.charAt(0)}
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold text-gray-900 dark:text-white">
            {review.clientName}
          </h4>
          <RatingStars rating={review.rating} size="sm" />
        </div>
        <p className="text-gray-600 dark:text-gray-300 mb-3">
          {review.comment}
        </p>
        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
          <span>{review.projectTitle}</span>
          <span>•</span>
          <span>{review.date}</span>
        </div>
      </div>
    </div>
  </motion.div>
);

// Главный компонент
const FreelancerProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [freelancer, setFreelancer] = useState<User | null>(null);
  const [completedTasks, setCompletedTasks] = useState<MicroTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'portfolio' | 'reviews'>('overview');
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    if (id) {
      loadFreelancerProfile();
    }
  }, [id]);

  const loadFreelancerProfile = async () => {
    try {
      setLoading(true);
      
      // Загрузка профиля исполнителя
      const freelancerData = await microTaskService.getFreelancerProfile(id!);
      setFreelancer(freelancerData);
      
      // Загрузка выполненных заданий
      const tasks = await microTaskService.getFreelancerCompletedTasks(id!);
      setCompletedTasks(tasks);
      
    } catch (error) {
      console.error('Error loading freelancer profile:', error);
      toast.error('Не удалось загрузить профиль');
    } finally {
      setLoading(false);
    }
  };

  const handleBookmark = async () => {
    if (!user) {
      toast.error('Войдите в аккаунт');
      return;
    }

    try {
      if (isBookmarked) {
        await microTaskService.removeBookmark(user.uid, id!);
        setIsBookmarked(false);
        toast.success('Удалено из закладок');
      } else {
        await microTaskService.addBookmark(user.uid, id!);
        setIsBookmarked(true);
        toast.success('Добавлено в закладки');
      }
    } catch (error) {
      console.error('Error handling bookmark:', error);
      toast.error('Не удалось обновить закладки');
    }
  };

  const handleContact = () => {
    if (!user) {
      toast.error('Войдите в аккаунт');
      return;
    }
    // Логика для отправки сообщения
    toast.success('Сообщение отправлено');
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: `Профиль ${freelancer?.name}`,
        text: `Посмотрите профиль исполнителя ${freelancer?.name}`,
        url: window.location.href
      });
    } catch (error) {
      // Fallback для браузеров без поддержки Web Share API
      navigator.clipboard.writeText(window.location.href);
      toast.success('Ссылка скопирована');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Загрузка профиля...</p>
        </div>
      </div>
    );
  }

  if (!freelancer) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiUser className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Профиль не найден
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Исполнитель с таким ID не существует
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/microtasks')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Вернуться к заданиям
          </motion.button>
        </div>
      </div>
    );
  }

  const stats = {
    completedTasks: completedTasks.length,
    totalEarnings: completedTasks.reduce((sum, task) => sum + task.price, 0),
    averageRating: freelancer.rating || 0,
    responseTime: freelancer.responseTime || '2 часа',
    successRate: Math.round((completedTasks.length / Math.max(freelancer.totalTasks || 1, 1)) * 100)
  };

  // Мок данные для портфолио и отзывов
  const portfolioItems = [
    {
      id: 1,
      title: 'Дизайн мобильного приложения',
      description: 'Создание UI/UX дизайна для мобильного приложения доставки еды',
      tags: ['UI/UX', 'Mobile', 'Figma'],
      date: '2024-01-15',
      image: null
    },
    {
      id: 2,
      title: 'Логотип для стартапа',
      description: 'Разработка фирменного стиля и логотипа для IT-стартапа',
      tags: ['Logo', 'Branding', 'Illustrator'],
      date: '2024-01-10',
      image: null
    }
  ];

  const reviews = [
    {
      id: 1,
      clientName: 'Алексей Иванов',
      rating: 5,
      comment: 'Отличная работа! Выполнено быстро и качественно. Рекомендую!',
      projectTitle: 'Дизайн лендинга',
      date: '2024-01-20'
    },
    {
      id: 2,
      clientName: 'Мария Петрова',
      rating: 4,
      comment: 'Хорошая работа, но были небольшие задержки по срокам.',
      projectTitle: 'Создание логотипа',
      date: '2024-01-15'
    }
  ];

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
              <span>Назад</span>
            </motion.button>

            <div className="flex items-center space-x-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleShare}
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
              >
                <FiShare2 className="w-5 h-5" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleBookmark}
                className={`p-2 transition-colors duration-200 ${
                  isBookmarked 
                    ? 'text-yellow-500' 
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <FiBookmark className="w-5 h-5" />
              </motion.button>
            </div>
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
          {/* Profile Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Profile Card */}
              <motion.div
                variants={itemVariants}
                className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-700"
              >
                <div className="text-center mb-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                    {freelancer.name?.charAt(0) || 'F'}
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {freelancer.name}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {freelancer.title || 'Фрилансер'}
                  </p>
                  <RatingStars rating={stats.averageRating} size="lg" />
                </div>

                <div className="space-y-4">
                  {freelancer.location && (
                    <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-300">
                      <FiMapPin className="w-5 h-5" />
                      <span>{freelancer.location}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-300">
                    <FiCalendar className="w-5 h-5" />
                    <span>На платформе с {freelancer.joinedAt || '2024'}</span>
                  </div>
                  
                  <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-300">
                    <FiClock className="w-5 h-5" />
                    <span>Отвечает в течение {stats.responseTime}</span>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleContact}
                    className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center space-x-2"
                  >
                    <FiMessageSquare className="w-5 h-5" />
                    <span>Написать сообщение</span>
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 flex items-center justify-center space-x-2"
                  >
                    <FiThumbsUp className="w-5 h-5" />
                    <span>Пригласить на проект</span>
                  </motion.button>
                </div>
              </motion.div>

              {/* Skills */}
              <motion.div
                variants={itemVariants}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Навыки
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(freelancer.skills || ['UI/UX', 'Figma', 'Photoshop', 'Illustrator']).map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </motion.div>

              {/* Languages */}
              <motion.div
                variants={itemVariants}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Языки
                </h3>
                <div className="space-y-2">
                  {(freelancer.languages || [
                    { name: 'Русский', level: 'Родной' },
                    { name: 'Английский', level: 'Продвинутый' },
                    { name: 'Казахский', level: 'Средний' }
                  ]).map((language, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-gray-900 dark:text-white">{language.name}</span>
                      <span className="text-sm text-gray-600 dark:text-gray-300">{language.level}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <StatCard
                icon={FiCheckCircle}
                label="Выполнено"
                value={stats.completedTasks}
                color="green"
              />
              <StatCard
                icon={FiDollarSign}
                label="Заработано"
                value={`${stats.totalEarnings.toLocaleString()} ₸`}
                color="blue"
              />
              <StatCard
                icon={FiTrendingUp}
                label="Успешность"
                value={`${stats.successRate}%`}
                color="purple"
              />
              <StatCard
                icon={FiAward}
                label="Рейтинг"
                value={stats.averageRating.toFixed(1)}
                color="yellow"
              />
            </div>

            {/* Tabs */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 mb-6">
              <div className="flex border-b border-gray-100 dark:border-gray-700">
                {[
                  { id: 'overview', label: 'Обзор' },
                  { id: 'portfolio', label: 'Портфолио' },
                  { id: 'reviews', label: 'Отзывы' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-6 py-4 text-sm font-medium transition-colors duration-200 ${
                      activeTab === tab.id
                        ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        О себе
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        {freelancer.bio || 'Профессиональный дизайнер с опытом работы более 5 лет. Специализируюсь на создании UI/UX дизайна, логотипов и фирменного стиля. Работаю с современными инструментами и всегда стремлюсь к созданию качественного продукта.'}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Последние работы
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {completedTasks.slice(0, 4).map((task) => (
                          <motion.div
                            key={task.id}
                            whileHover={{ scale: 1.02 }}
                            className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 cursor-pointer"
                          >
                            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                              {task.title}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                              {task.description.substring(0, 100)}...
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                                {task.price.toLocaleString()} ₸
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {new Date(task.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Portfolio Tab */}
                {activeTab === 'portfolio' && (
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                  >
                    {portfolioItems.map((item) => (
                      <PortfolioItem key={item.id} project={item} />
                    ))}
                  </motion.div>
                )}

                {/* Reviews Tab */}
                {activeTab === 'reviews' && (
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-6"
                  >
                    {reviews.map((review) => (
                      <ReviewCard key={review.id} review={review} />
                    ))}
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default FreelancerProfile; 