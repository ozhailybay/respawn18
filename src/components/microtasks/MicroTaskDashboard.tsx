import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiPlus, FiEye, FiEdit3, FiTrash2, FiDollarSign, FiClock, 
  FiUsers, FiTrendingUp, FiCalendar, FiFilter, FiSearch,
  FiMoreVertical, FiCheckCircle, FiAlertCircle, FiXCircle,
  FiBarChart, FiPieChart, FiActivity, FiTarget, FiStar, FiRefreshCw
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { microTaskService } from '../../services/microTaskService';
import { MicroTask, MicroTaskStatus } from '../../types';
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
const StatCard = ({ icon: Icon, label, value, trend, color = 'blue' }: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  trend?: { value: number; isPositive: boolean };
  color?: string;
}) => (
  <motion.div
    variants={itemVariants}
    className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700"
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className={`p-3 rounded-xl bg-${color}-100 dark:bg-${color}-900`}>
          <Icon className={`w-6 h-6 text-${color}-600 dark:text-${color}-400`} />
        </div>
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-300">{label}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
      </div>
      {trend && (
        <div className={`flex items-center space-x-1 text-sm ${
          trend.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
        }`}>
          <FiTrendingUp className={`w-4 h-4 ${trend.isPositive ? '' : 'rotate-180'}`} />
          <span>{Math.abs(trend.value)}%</span>
        </div>
      )}
    </div>
  </motion.div>
);

// Компонент статуса
const StatusBadge = ({ status }: { status: MicroTaskStatus }) => {
  const getStatusConfig = (status: MicroTaskStatus) => {
    switch (status) {
      case 'open':
        return { 
          label: 'Открыто', 
          color: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200',
          icon: FiTarget
        };
      case 'in_progress':
        return { 
          label: 'В работе', 
          color: 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
          icon: FiActivity
        };
      case 'submitted':
        return { 
          label: 'Отправлено', 
          color: 'bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200',
          icon: FiClock
        };
      case 'completed':
        return { 
          label: 'Завершено', 
          color: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
          icon: FiCheckCircle
        };
      case 'cancelled':
        return { 
          label: 'Отменено', 
          color: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
          icon: FiXCircle
        };
      default:
        return { 
          label: 'Неизвестно', 
          color: 'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200',
          icon: FiAlertCircle
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
      <Icon className="w-3 h-3" />
      <span>{config.label}</span>
    </span>
  );
};

// Компонент задания
const TaskCard = ({ task, onView, onEdit, onDelete }: {
  task: MicroTask;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}) => {
  const [showActions, setShowActions] = useState(false);

  const getTimeLeft = (deadline: string) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffMs = deadlineDate.getTime() - now.getTime();
    
    if (diffMs <= 0) return 'Просрочено';
    
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 1) return 'Сегодня';
    if (diffDays === 2) return 'Завтра';
    return `${diffDays} дн.`;
  };

  return (
    <motion.div
      variants={itemVariants}
      className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 relative"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {task.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
            {task.description.substring(0, 100)}...
          </p>
          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-1">
              <FiDollarSign className="w-4 h-4" />
              <span>{task.price.toLocaleString()} ₸</span>
            </div>
            <div className="flex items-center space-x-1">
              <FiClock className="w-4 h-4" />
              <span>{getTimeLeft(task.deadlineAt)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <FiUsers className="w-4 h-4" />
              <span>{task.applicationsCount || 0} заявок</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <StatusBadge status={task.status} />
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors duration-200"
            >
              <FiMoreVertical className="w-4 h-4" />
            </button>
            
            {showActions && (
              <div className="absolute right-0 top-10 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-100 dark:border-gray-600 py-2 z-10">
                <button
                  onClick={() => {
                    onView(task.id);
                    setShowActions(false);
                  }}
                  className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 w-full text-left"
                >
                  <FiEye className="w-4 h-4" />
                  <span>Просмотр</span>
                </button>
                <button
                  onClick={() => {
                    onEdit(task.id);
                    setShowActions(false);
                  }}
                  className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 w-full text-left"
                >
                  <FiEdit3 className="w-4 h-4" />
                  <span>Редактировать</span>
                </button>
                <button
                  onClick={() => {
                    onDelete(task.id);
                    setShowActions(false);
                  }}
                  className="flex items-center space-x-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 w-full text-left"
                >
                  <FiTrash2 className="w-4 h-4" />
                  <span>Удалить</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {task.tags?.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs"
            >
              #{tag}
            </span>
          ))}
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {new Date(task.createdAt).toLocaleDateString()}
        </span>
      </div>
    </motion.div>
  );
};

// Главный компонент
const MicroTaskDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, userData } = useAuth();
  
  const [tasks, setTasks] = useState<MicroTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<MicroTaskStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'price_high' | 'price_low'>('newest');
  const [showFilters, setShowFilters] = useState(false);

  // Проверка прав доступа
  const canManageTasks = userData?.role === 'employer' || 
                        userData?.role === 'business' || 
                        userData?.role === 'admin';

  useEffect(() => {
    if (canManageTasks) {
      loadTasks();
    }
  }, [canManageTasks]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const userTasks = await microTaskService.getUserTasks(user!.uid);
      setTasks(userTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
      toast.error('Не удалось загрузить задания');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Вы уверены, что хотите удалить это задание?')) return;

    try {
      await microTaskService.deleteMicroTask(taskId);
      setTasks(tasks.filter(task => task.id !== taskId));
      toast.success('Задание удалено');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Не удалось удалить задание');
    }
  };

  const handleViewTask = (taskId: string) => {
    navigate(`/microtasks/${taskId}`);
  };

  const handleEditTask = (taskId: string) => {
    navigate(`/microtasks/${taskId}/edit`);
  };

  const handleCreateTask = () => {
    navigate('/microtasks/create');
  };

  // Фильтрация и сортировка
  const filteredTasks = tasks
    .filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'price_high':
          return b.price - a.price;
        case 'price_low':
          return a.price - b.price;
        default:
          return 0;
      }
    });

  // Статистика
  const stats = {
    totalTasks: tasks.length,
    activeTasks: tasks.filter(t => t.status === 'open' || t.status === 'in_progress').length,
    completedTasks: tasks.filter(t => t.status === 'completed').length,
    totalSpent: tasks.filter(t => t.status === 'completed').reduce((sum, t) => sum + t.price, 0),
    averagePrice: tasks.length > 0 ? Math.round(tasks.reduce((sum, t) => sum + t.price, 0) / tasks.length) : 0,
    totalApplications: tasks.reduce((sum, t) => sum + (t.applicationsCount || 0), 0)
  };

  if (!canManageTasks) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiAlertCircle className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Нет доступа
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Только работодатели могут управлять заданиями
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/microtasks')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Перейти к заданиям
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-100 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Мои задания
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Управление микрозаданиями и аналитика
              </p>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCreateTask}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
            >
              <FiPlus className="w-5 h-5" />
              <span>Создать задание</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
            <StatCard
              icon={FiTarget}
              label="Всего заданий"
              value={stats.totalTasks}
              color="blue"
            />
            <StatCard
              icon={FiActivity}
              label="Активных"
              value={stats.activeTasks}
              color="yellow"
            />
            <StatCard
              icon={FiCheckCircle}
              label="Завершено"
              value={stats.completedTasks}
              color="green"
            />
            <StatCard
              icon={FiDollarSign}
              label="Потрачено"
              value={`${stats.totalSpent.toLocaleString()} ₸`}
              color="purple"
            />
            <StatCard
              icon={FiBarChart}
              label="Средняя цена"
              value={`${stats.averagePrice.toLocaleString()} ₸`}
              color="indigo"
            />
            <StatCard
              icon={FiUsers}
              label="Заявок"
              value={stats.totalApplications}
              color="pink"
            />
          </div>

          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              {/* Search */}
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Поиск по заданиям..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="flex items-center space-x-4">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="all">Все статусы</option>
                  <option value="open">Открытые</option>
                  <option value="in_progress">В работе</option>
                  <option value="submitted">Отправленные</option>
                  <option value="completed">Завершенные</option>
                  <option value="cancelled">Отмененные</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="newest">Сначала новые</option>
                  <option value="oldest">Сначала старые</option>
                  <option value="price_high">Цена: по убыванию</option>
                  <option value="price_low">Цена: по возрастанию</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tasks */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiTarget className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {searchTerm || statusFilter !== 'all' ? 'Задания не найдены' : 'Нет заданий'}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Попробуйте изменить фильтры поиска'
                  : 'Создайте свое первое задание'
                }
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCreateTask}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2 mx-auto"
                >
                  <FiPlus className="w-5 h-5" />
                  <span>Создать задание</span>
                </motion.button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onView={handleViewTask}
                  onEdit={handleEditTask}
                  onDelete={handleDeleteTask}
                />
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default MicroTaskDashboard; 