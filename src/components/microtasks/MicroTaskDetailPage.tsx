import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiArrowLeft, FiClock, FiDollarSign, FiUser, FiTag, FiCalendar,
  FiMessageSquare, FiSend, FiCheckCircle, FiXCircle, FiAlertCircle,
  FiEdit, FiTrash2, FiFlag, FiEye, FiShare2, FiHeart, FiStar,
  FiMapPin, FiGlobe, FiMail, FiPhone, FiLinkedin, FiGithub
} from 'react-icons/fi';
import { MicroTask, MicroTaskApplication, MicroTaskSubmission } from '../../types';
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

// Компонент статуса
const StatusBadge = ({ status }: { status: string }) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'open':
        return { color: 'bg-green-100 text-green-800 border-green-200', text: 'Открыто' };
      case 'in_progress':
        return { color: 'bg-blue-100 text-blue-800 border-blue-200', text: 'В работе' };
      case 'submitted':
        return { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', text: 'На проверке' };
      case 'completed':
        return { color: 'bg-green-100 text-green-800 border-green-200', text: 'Завершено' };
      case 'cancelled':
        return { color: 'bg-red-100 text-red-800 border-red-200', text: 'Отменено' };
      default:
        return { color: 'bg-gray-100 text-gray-800 border-gray-200', text: status };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${config.color}`}>
      {config.text}
    </span>
  );
};

// Компонент карточки заявки
const ApplicationCard = ({ 
  application, 
  onAccept, 
  onReject, 
  canManage 
}: { 
  application: MicroTaskApplication;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  canManage: boolean;
}) => (
  <motion.div
    variants={itemVariants}
    className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700"
  >
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-lg">
            {application.applicantName?.charAt(0) || 'A'}
          </span>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {application.applicantName || 'Исполнитель'}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Подал заявку {new Date(application.appliedAt).toLocaleDateString('ru-RU')}
          </p>
        </div>
      </div>
      <StatusBadge status={application.status} />
    </div>

    <div className="mb-4">
      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
        {application.proposal}
      </p>
    </div>

    {application.proposedPrice && (
      <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className="flex items-center space-x-2">
          <FiDollarSign className="w-4 h-4 text-green-600" />
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            Предложенная цена: {application.proposedPrice.toLocaleString()} ₸
          </span>
        </div>
      </div>
    )}

    {canManage && application.status === 'pending' && (
      <div className="flex space-x-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onAccept(application.id)}
          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center justify-center space-x-2"
        >
          <FiCheckCircle className="w-4 h-4" />
          <span>Принять</span>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onReject(application.id)}
          className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center justify-center space-x-2"
        >
          <FiXCircle className="w-4 h-4" />
          <span>Отклонить</span>
        </motion.button>
      </div>
    )}
  </motion.div>
);

// Компонент формы заявки
const ApplicationForm = ({ 
  taskId, 
  onSubmit, 
  onCancel 
}: { 
  taskId: string;
  onSubmit: (proposal: string, proposedPrice?: number) => void;
  onCancel: () => void;
}) => {
  const [proposal, setProposal] = useState('');
  const [proposedPrice, setProposedPrice] = useState<number | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proposal.trim()) {
      toast.error('Пожалуйста, опишите ваш подход к решению задачи');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(proposal, proposedPrice);
      setProposal('');
      setProposedPrice(undefined);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700"
    >
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Подать заявку
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Опишите ваш подход к решению задачи
          </label>
          <textarea
            value={proposal}
            onChange={(e) => setProposal(e.target.value)}
            placeholder="Расскажите, как вы планируете выполнить это задание..."
            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white resize-none"
            rows={4}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Предложенная цена (необязательно)
          </label>
          <div className="relative">
            <FiDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="number"
              value={proposedPrice || ''}
              onChange={(e) => setProposedPrice(e.target.value ? Number(e.target.value) : undefined)}
              placeholder="0"
              className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              min="0"
            />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Можете предложить свою цену за выполнение задания
          </p>
        </div>

        <div className="flex space-x-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <FiSend className="w-4 h-4" />
                <span>Отправить заявку</span>
              </>
            )}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={onCancel}
            className="px-6 py-3 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors duration-200"
          >
            Отмена
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
};

// Главный компонент
const MicroTaskDetailPage: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const { user, userData } = useAuth();

  // Состояние
  const [task, setTask] = useState<MicroTask | null>(null);
  const [applications, setApplications] = useState<MicroTaskApplication[]>([]);
  const [submission, setSubmission] = useState<MicroTaskSubmission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  // Загрузка данных
  useEffect(() => {
    if (taskId) {
      fetchTaskDetails();
    }
  }, [taskId]);

  const fetchTaskDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const [taskData, applicationsData, submissionData] = await Promise.all([
        microTaskService.getMicroTask(taskId!),
        microTaskService.getTaskApplications(taskId!),
        microTaskService.getSubmissionForTask(taskId!)
      ]);

      setTask(taskData);
      setApplications(applicationsData);
      setSubmission(submissionData);
    } catch (error) {
      console.error('Error fetching task details:', error);
      setError('Не удалось загрузить детали задания');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyToTask = async (proposal: string, proposedPrice?: number) => {
    if (!user || !task) return;

    try {
      await microTaskService.applyToMicroTask(task.id, user.uid, proposal, proposedPrice);
      toast.success('Заявка успешно отправлена!');
      setShowApplicationForm(false);
      fetchTaskDetails();
    } catch (error) {
      console.error('Error applying to task:', error);
      toast.error('Не удалось отправить заявку');
    }
  };

  const handleAcceptApplication = async (applicationId: string) => {
    try {
      await microTaskService.acceptApplication(applicationId);
      toast.success('Заявка принята!');
      fetchTaskDetails();
    } catch (error) {
      console.error('Error accepting application:', error);
      toast.error('Не удалось принять заявку');
    }
  };

  const handleRejectApplication = async (applicationId: string) => {
    try {
      await microTaskService.rejectApplication(applicationId, 'Не подходит');
      toast.success('Заявка отклонена');
      fetchTaskDetails();
    } catch (error) {
      console.error('Error rejecting application:', error);
      toast.error('Не удалось отклонить заявку');
    }
  };

  const getTimeLeft = (deadline: Date) => {
    const now = new Date();
    const diffMs = deadline.getTime() - now.getTime();
    
    if (diffMs <= 0) {
      return { value: 0, unit: 'ч', urgent: true };
    }
    
    const diffHours = diffMs / (1000 * 60 * 60);
    
    if (diffHours < 24) {
      return { value: Math.floor(diffHours), unit: 'ч', urgent: true };
    }
    
    const diffDays = diffHours / 24;
    return { value: Math.floor(diffDays), unit: 'д', urgent: diffDays <= 3 };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-600 rounded-full animate-spin animation-delay-150"></div>
        </div>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiAlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Задание не найдено
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {error || 'Задание не существует или было удалено'}
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

  const isOwner = user?.uid === task.employerId;
  const canApply = user && !isOwner && task.status === 'open' && 
                   !applications.some(app => app.applicantId === user.uid);
  const timeLeft = getTimeLeft(new Date(task.deadlineAt));

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

            <div className="flex items-center space-x-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsLiked(!isLiked)}
                className={`p-2 rounded-full transition-colors duration-200 ${
                  isLiked 
                    ? 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400' 
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                <FiHeart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-full bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
              >
                <FiShare2 className="w-5 h-5" />
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
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Task Header */}
            <motion.div
              variants={itemVariants}
              className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-700"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-4">
                    <StatusBadge status={task.status} />
                    <div className={`flex items-center space-x-1 text-sm ${timeLeft.urgent ? 'text-red-500' : 'text-gray-500'}`}>
                      <FiClock className="w-4 h-4" />
                      <span className="font-medium">{timeLeft.value}{timeLeft.unit} осталось</span>
                    </div>
                  </div>
                  
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
                    {task.title}
                  </h1>
                  
                  <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center space-x-1">
                      <FiEye className="w-4 h-4" />
                      <span>{task.viewsCount || 0} просмотров</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <FiUser className="w-4 h-4" />
                      <span>{task.applicationsCount || 0} заявок</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <FiCalendar className="w-4 h-4" />
                      <span>Создано {new Date(task.createdAt).toLocaleDateString('ru-RU')}</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
                    {task.price?.toLocaleString()} ₸
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    за выполнение
                  </div>
                </div>
              </div>

              {/* Tags */}
              {task.tags && task.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {task.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-sm rounded-full border border-blue-200 dark:border-blue-700"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Description */}
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {task.description}
                </p>
              </div>

              {/* Requirements */}
              {task.requirements && (
                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-2xl">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Требования
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {task.requirements}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-8 flex flex-wrap gap-3">
                {canApply && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowApplicationForm(true)}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
                  >
                    <FiSend className="w-4 h-4" />
                    <span>Подать заявку</span>
                  </motion.button>
                )}
                
                {isOwner && (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-6 py-3 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors duration-200 flex items-center space-x-2"
                    >
                      <FiEdit className="w-4 h-4" />
                      <span>Редактировать</span>
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center space-x-2"
                    >
                      <FiTrash2 className="w-4 h-4" />
                      <span>Удалить</span>
                    </motion.button>
                  </>
                )}
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors duration-200 flex items-center space-x-2"
                >
                  <FiFlag className="w-4 h-4" />
                  <span>Пожаловаться</span>
                </motion.button>
              </div>
            </motion.div>

            {/* Application Form */}
            <AnimatePresence>
              {showApplicationForm && (
                <ApplicationForm
                  taskId={task.id}
                  onSubmit={handleApplyToTask}
                  onCancel={() => setShowApplicationForm(false)}
                />
              )}
            </AnimatePresence>

            {/* Applications */}
            {(isOwner || applications.length > 0) && (
              <motion.div
                variants={itemVariants}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Заявки ({applications.length})
                </h2>
                
                {applications.length === 0 ? (
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center shadow-lg border border-gray-100 dark:border-gray-700">
                    <FiMessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Пока нет заявок
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Заявки будут появляться здесь по мере их поступления
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {applications.map((application) => (
                      <ApplicationCard
                        key={application.id}
                        application={application}
                        onAccept={handleAcceptApplication}
                        onReject={handleRejectApplication}
                        canManage={isOwner}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Employer Info */}
            <motion.div
              variants={itemVariants}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Заказчик
              </h3>
              
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {task.employerName?.charAt(0) || 'A'}
                  </span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {task.employerName || 'Заказчик'}
                  </h4>
                  <div className="flex items-center space-x-1">
                    <FiStar className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">4.8</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <div className="flex items-center space-x-2">
                  <FiMapPin className="w-4 h-4" />
                  <span>Алматы, Казахстан</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FiGlobe className="w-4 h-4" />
                  <span>Член с 2023 года</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">12</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Заданий</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">98%</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Успешных</div>
                  </div>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Связаться
              </motion.button>
            </motion.div>

            {/* Task Stats */}
            <motion.div
              variants={itemVariants}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Детали задания
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Категория</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {task.category === 'design' ? 'Дизайн' : 
                     task.category === 'copywriting' ? 'Копирайтинг' : 
                     task.category === 'notion' ? 'Notion' : 'Другое'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Дедлайн</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {new Date(task.deadlineAt).toLocaleDateString('ru-RU')}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Просмотры</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {task.viewsCount || 0}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Заявки</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {task.applicationsCount || 0}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Related Tasks */}
            <motion.div
              variants={itemVariants}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Похожие задания
              </h3>
              
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200 cursor-pointer">
                    <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-1">
                      Создать логотип для стартапа
                    </h4>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500 dark:text-gray-400">2 дня назад</span>
                      <span className="text-sm font-medium text-green-600 dark:text-green-400">
                        15,000 ₸
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default MicroTaskDetailPage; 