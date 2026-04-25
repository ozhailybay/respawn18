import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FaRocket, 
  FaGraduationCap, 
  FaBriefcase, 
  FaChartLine, 
  FaTrophy,
  FaLightbulb,
  FaUsers,
  FaFileAlt,
  FaStar,
  FaArrowRight,
  FaPlay,
  FaBook,
  FaCode,
  FaGlobe,
  FaCalendarAlt,
  FaBell,
  FaCog,
  FaUserGraduate,
  FaHandshake,
  FaAward,
  FaMedal,
  FaFire,
  FaGem,
  FaCrown,
  FaBrain,
  FaBullseye,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaHeart,
  FaEye,
  FaDownload,
  FaShare,
  FaBookmark,
  FaSearch,
  FaFilter,
  FaSort,
  FaSyncAlt,
  FaPlus,
  FaMinus,
  FaExpand,
  FaCompress,
  FaEdit,
  FaTrash,
  FaSave,
  FaUndo,
  FaRedo,
  FaCopy,
  FaPaste,
  FaCut,
  FaPrint,
  FaQrcode,
  FaBarcode,
  FaFingerprint,
  FaShieldAlt,
  FaLock,
  FaUnlock,
  FaKey,
  FaUserSecret,
  FaUserShield,
  FaUserCheck,
  FaUserTimes,
  FaUserPlus,
  FaUserMinus,
  FaUserEdit,
  FaUserCog,
  FaUserGraduate as FaUserGraduateIcon,
  FaUserTie,
  FaUserNinja,
  FaUserAstronaut,
  FaUserInjured,
  FaUserMd,
  FaUserNurse,
  FaChalkboardTeacher,
  FaUserFriends,
  FaUserClock,
  FaUserTag,
  FaUserSlash,
  FaUserLock
} from 'react-icons/fa';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc, 
  updateDoc, 
  addDoc, 
  orderBy, 
  limit,
  serverTimestamp 
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '../firebase';
import RespawnLogo from './RespawnLogo';

// Интерфейсы для реальных данных
interface DashboardMetric {
  id: string;
  label: string;
  value: number | string;
  unit?: string;
  change?: number;
  trend: 'up' | 'down' | 'stable';
  icon: React.ReactNode;
  color: string;
  priority: 'high' | 'medium' | 'low';
}

interface SkillData {
  name: string;
  level: number;
  experience: number;
  demand: number;
  salary: number;
  growth: number;
  category: 'technical' | 'soft' | 'language' | 'domain';
  certifications: string[];
  projects: number;
  lastUsed: Date;
}

interface JobApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  status: 'applied' | 'reviewing' | 'interview' | 'accepted' | 'rejected';
  appliedAt: Date;
  matchScore: number;
  salary: string;
  location: string;
}

interface LearningProgress {
  id: string;
  title: string;
  type: 'course' | 'certification' | 'project';
  progress: number;
  totalHours: number;
  completedHours: number;
  startDate: Date;
  endDate?: Date;
  status: 'not_started' | 'in_progress' | 'completed' | 'paused';
}

interface Project {
  id: string;
  title: string;
  description: string;
  type: 'personal' | 'freelance' | 'academic' | 'open_source';
  technologies: string[];
  status: 'planning' | 'in_progress' | 'completed' | 'on_hold';
  startDate: Date;
  endDate?: Date;
  githubUrl?: string;
  liveUrl?: string;
  imageUrl?: string;
}

interface NetworkConnection {
  id: string;
  name: string;
  title: string;
  company: string;
  photoURL: string;
  connectedAt: Date;
  mutualConnections: number;
  lastInteraction?: Date;
}

const StudentDashboard: React.FC = () => {
  const { user, userData } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('relevance');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'kanban'>('grid');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [notifications, setNotifications] = useState<number>(0);

  // Реальные данные из Firebase
  const [jobApplications, setJobApplications] = useState<JobApplication[]>([]);
  const [learningProgress, setLearningProgress] = useState<LearningProgress[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [networkConnections, setNetworkConnections] = useState<NetworkConnection[]>([]);
  const [skillsData, setSkillsData] = useState<SkillData[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  // Загрузка реальных данных
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.uid) return;

      setIsLoading(true);
      try {
        // Загружаем заявки на работу
        const applicationsQuery = query(
          collection(db, 'jobApplications'),
          where('userId', '==', user.uid),
          orderBy('appliedAt', 'desc'),
          limit(10)
        );
        const applicationsSnapshot = await getDocs(applicationsQuery);
        const applications = applicationsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          appliedAt: doc.data().appliedAt?.toDate() || new Date()
        })) as JobApplication[];
        setJobApplications(applications);

        // Загружаем прогресс обучения
        const learningQuery = query(
          collection(db, 'learningProgress'),
          where('userId', '==', user.uid),
          orderBy('startDate', 'desc')
        );
        const learningSnapshot = await getDocs(learningQuery);
        const learning = learningSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          startDate: doc.data().startDate?.toDate() || new Date(),
          endDate: doc.data().endDate?.toDate()
        })) as LearningProgress[];
        setLearningProgress(learning);

        // Загружаем проекты
        const projectsQuery = query(
          collection(db, 'projects'),
          where('userId', '==', user.uid),
          orderBy('startDate', 'desc')
        );
        const projectsSnapshot = await getDocs(projectsQuery);
        const projects = projectsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          startDate: doc.data().startDate?.toDate() || new Date(),
          endDate: doc.data().endDate?.toDate()
        })) as Project[];
        setProjects(projects);

        // Загружаем сетевые связи
        const connectionsQuery = query(
          collection(db, 'networkConnections'),
          where('userId', '==', user.uid),
          orderBy('connectedAt', 'desc'),
          limit(20)
        );
        const connectionsSnapshot = await getDocs(connectionsQuery);
        const connections = connectionsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          connectedAt: doc.data().connectedAt?.toDate() || new Date(),
          lastInteraction: doc.data().lastInteraction?.toDate()
        })) as NetworkConnection[];
        setNetworkConnections(connections);

        // Загружаем навыки пользователя
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userSkills = userDoc.data().skills || [];
          setSkillsData(userSkills);
        }

        // Загружаем уведомления
        const notificationsQuery = query(
          collection(db, 'notifications'),
          where('userId', '==', user.uid),
          where('read', '==', false)
        );
        const notificationsSnapshot = await getDocs(notificationsQuery);
        setNotifications(notificationsSnapshot.size);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        
        // Временное решение: используем пустые данные при ошибке доступа
        if (error && typeof error === 'object' && 'message' in error && 
            typeof error.message === 'string' && error.message.includes('Missing or insufficient permissions')) {
          console.log('🔄 Using empty dashboard data due to permissions error...');
          setJobApplications([]);
          setLearningProgress([]);
          setProjects([]);
          setNetworkConnections([]);
          setSkillsData([]);
          setNotifications(0);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user?.uid]);

  // Автообновление данных
  useEffect(() => {
    if (!autoRefresh || !user?.uid) return;
    
    const interval = setInterval(() => {
      // Обновляем только уведомления
      const fetchNotifications = async () => {
        try {
          const notificationsQuery = query(
            collection(db, 'notifications'),
            where('userId', '==', user.uid),
            where('read', '==', false)
          );
          const notificationsSnapshot = await getDocs(notificationsQuery);
          setNotifications(notificationsSnapshot.size);
        } catch (error) {
          console.error('Error fetching notifications:', error);
        }
      };
      
      fetchNotifications();
    }, 30000); // 30 секунд

    return () => clearInterval(interval);
  }, [autoRefresh, user?.uid]);

  // Простые и понятные метрики
  const dashboardMetrics: DashboardMetric[] = useMemo(() => [
    {
      id: 'applications',
      label: 'Заявки на работу',
      value: jobApplications.length,
      unit: '',
      change: jobApplications.filter(app => 
        app.appliedAt > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ).length,
      trend: 'up',
      icon: <FaBriefcase className="w-6 h-6" />,
      color: 'from-blue-600 to-blue-700',
      priority: 'high'
    },
    {
      id: 'learning-progress',
      label: 'Прогресс обучения',
      value: learningProgress.length > 0 
        ? Math.round(learningProgress.reduce((acc, item) => acc + item.progress, 0) / learningProgress.length)
        : 0,
      unit: '%',
      change: learningProgress.filter(item => item.status === 'completed').length,
      trend: 'up',
      icon: <FaGraduationCap className="w-6 h-6" />,
      color: 'from-green-600 to-green-700',
      priority: 'high'
    },
    {
      id: 'projects',
      label: 'Активные проекты',
      value: projects.filter(p => p.status === 'in_progress').length,
      unit: '',
      change: projects.filter(p => p.status === 'completed').length,
      trend: 'up',
      icon: <FaCode className="w-6 h-6" />,
      color: 'from-purple-600 to-purple-700',
      priority: 'medium'
    },
    {
      id: 'network',
      label: 'Контакты',
      value: networkConnections.length,
      unit: '',
      change: networkConnections.filter(conn => 
        conn.connectedAt > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      ).length,
      trend: 'up',
      icon: <FaUsers className="w-6 h-6" />,
      color: 'from-orange-600 to-orange-700',
      priority: 'medium'
    }
  ], [jobApplications, learningProgress, projects, networkConnections]);

  // Функции для работы с данными
  const handleQuickAction = useCallback((action: string) => {
    switch (action) {
      case 'apply-jobs':
        navigate('/jobs');
        break;
      case 'create-resume':
        navigate('/resume');
        break;
      case 'ai-mentor':
        navigate('/ai-mentor');
        break;
      case 'networking':
        navigate('/networking');
        break;
      case 'microtasks':
        navigate('/microtasks');
        break;
      case 'courses':
        navigate('/courses');
        break;
      default:
        break;
    }
  }, [navigate]);

  const handleJobApplication = useCallback(async (jobId: string) => {
    if (!user?.uid) return;

    try {
      // Создаем заявку на работу
      const applicationData = {
        userId: user.uid,
        jobId,
        status: 'applied',
        appliedAt: serverTimestamp(),
        matchScore: Math.floor(Math.random() * 30) + 70, // Имитация AI-оценки
      };

      await addDoc(collection(db, 'jobApplications'), applicationData);
      
      // Обновляем локальное состояние
      setJobApplications(prev => [{
        id: Date.now().toString(),
        jobId,
        jobTitle: 'New Job Application',
        company: 'Company',
        status: 'applied',
        appliedAt: new Date(),
        matchScore: applicationData.matchScore,
        salary: '$50,000 - $80,000',
        location: 'Remote'
      }, ...prev]);

    } catch (error) {
      console.error('Error applying for job:', error);
    }
  }, [user?.uid]);

  // Gemini AI функции
  const matchJobsWithGemini = httpsCallable(functions, 'matchJobsWithGemini');
  const analyzeSkillsWithGemini = httpsCallable(functions, 'analyzeSkillsWithGemini');

  // Получение рекомендаций вакансий с помощью Gemini
  const handleGetJobRecommendations = useCallback(async () => {
    if (!user?.uid) return;

    setIsLoading(true);
    try {
      const result = await matchJobsWithGemini({
        location: 'Any',
        jobType: 'Any',
        experienceLevel: 'Any'
      });

      const { data } = result as any;
      if (data.success) {
        // Здесь можно обновить состояние с рекомендациями
        console.log('Job recommendations:', data.recommendations);
      }
    } catch (error) {
      console.error('Error getting job recommendations:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.uid, matchJobsWithGemini]);

  // Анализ навыков с помощью Gemini
  const handleAnalyzeSkills = useCallback(async () => {
    if (!user?.uid) return;

    setIsLoading(true);
    try {
      const result = await analyzeSkillsWithGemini({});

      const { data } = result as any;
      if (data.success) {
        // Здесь можно обновить состояние с анализом навыков
        console.log('Skills analysis:', data.analysis);
      }
    } catch (error) {
      console.error('Error analyzing skills:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.uid, analyzeSkillsWithGemini]);

  const handleProjectStatusUpdate = useCallback(async (projectId: string, newStatus: Project['status']) => {
    try {
      await updateDoc(doc(db, 'projects', projectId), {
        status: newStatus,
        updatedAt: serverTimestamp()
      });

      // Обновляем локальное состояние
      setProjects(prev => prev.map(project => 
        project.id === projectId 
          ? { ...project, status: newStatus }
          : project
      ));

    } catch (error) {
      console.error('Error updating project status:', error);
    }
  }, []);

  const handleLearningProgressUpdate = useCallback(async (learningId: string, newProgress: number) => {
    try {
      await updateDoc(doc(db, 'learningProgress', learningId), {
        progress: newProgress,
        updatedAt: serverTimestamp()
      });

      // Обновляем локальное состояние
      setLearningProgress(prev => prev.map(item => 
        item.id === learningId 
          ? { ...item, progress: newProgress }
          : item
      ));

    } catch (error) {
      console.error('Error updating learning progress:', error);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <RespawnLogo size="xl" animated={true} />
          <motion.div
            className="mt-8 text-gray-600 dark:text-gray-300"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            Loading your personalized dashboard...
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
      {/* Header с реальными данными */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/95 dark:bg-black/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="w-16 h-16 bg-gradient-to-r from-gray-900 to-black dark:from-white dark:to-gray-200 rounded-2xl flex items-center justify-center">
                {userData?.photoURL ? (
                  <img 
                    src={userData.photoURL} 
                    alt={userData.displayName}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <FaUserGraduate className="w-8 h-8 text-white dark:text-black" />
                )}
              </div>
              <div>
                <h1 className="text-2xl font-black text-gray-900 dark:text-white">
                  Welcome back, {userData?.displayName || 'Student'}! 🚀
                </h1>
                <p className="text-gray-600 dark:text-gray-400 font-medium">
                  Your AI-powered career dashboard is ready
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Уведомления */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative p-3 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
              >
                <FaBell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                {notifications > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center"
                  >
                    {notifications}
                  </motion.span>
                )}
              </motion.button>
              
              {/* Настройки */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-3 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
              >
                <FaCog className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </motion.button>
              
              {/* Автообновление */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`p-3 rounded-xl shadow-sm border ${
                  autoRefresh 
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700' 
                    : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700'
                }`}
              >
                <FaSyncAlt className={`w-5 h-5 ${
                  autoRefresh ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-300'
                }`} />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Основной контент */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Реальные метрики */}
        <motion.div
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.1 }
            }
          }}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {dashboardMetrics.map((metric) => (
            <motion.div
              key={metric.id}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
              }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="group relative bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              {/* Градиентный фон */}
              <div className={`absolute inset-0 bg-gradient-to-r ${metric.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-r ${metric.color} rounded-xl flex items-center justify-center`}>
                    <div className="text-white">
                      {metric.icon}
                    </div>
                  </div>
                  <div className={`text-sm font-bold ${
                    metric.trend === 'up' ? 'text-green-600' : 
                    metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {metric.change && metric.change > 0 ? '+' : ''}{metric.change || 0}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    {metric.label}
                  </p>
                  <p className="text-2xl font-black text-gray-900 dark:text-white">
                    {metric.value}{metric.unit}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Карточки действий */}
        <motion.div
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.1 }
            }
          }}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
        >
          {[
            {
              id: 'resume',
              title: 'Создать резюме',
              description: 'AI поможет создать профессиональное резюме',
              icon: <FaFileAlt className="w-6 h-6" />,
              gradient: 'from-blue-600 to-blue-700',
              action: 'create-resume'
            },
            {
              id: 'jobs',
              title: 'Найти работу',
              description: 'Умный поиск вакансий по вашему профилю',
              icon: <FaBriefcase className="w-6 h-6" />,
              gradient: 'from-green-600 to-green-700',
              action: 'apply-jobs'
            },
            {
              id: 'ai-mentor',
              title: 'AI Ментор',
              description: 'Персональные советы по карьере',
              icon: <FaBrain className="w-6 h-6" />,
              gradient: 'from-purple-600 to-purple-700',
              action: 'ai-mentor'
            },
            {
              id: 'networking',
              title: 'Нетворкинг',
              description: 'Общение с профессионалами',
              icon: <FaUsers className="w-6 h-6" />,
              gradient: 'from-orange-600 to-orange-700',
              action: 'networking'
            },
            {
              id: 'microtasks',
              title: 'Микро-проекты',
              description: 'Практические задания для портфолио',
              icon: <FaCode className="w-6 h-6" />,
              gradient: 'from-red-600 to-red-700',
              action: 'microtasks'
            },
            {
              id: 'courses',
              title: 'Курсы',
              description: 'Обучение для развития навыков',
              icon: <FaGraduationCap className="w-6 h-6" />,
              gradient: 'from-indigo-600 to-indigo-700',
              action: 'courses'
            }
          ].map((card) => (
            <motion.div
              key={card.id}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
              }}
              whileHover={{ y: -5, scale: 1.02 }}
              onClick={() => handleQuickAction(card.action)}
              className="group relative bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden cursor-pointer"
            >
              {/* Градиентный фон */}
              <div className={`absolute inset-0 bg-gradient-to-r ${card.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
              


              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-r ${card.gradient} rounded-xl flex items-center justify-center`}>
                    <div className="text-white">
                      {card.icon}
                    </div>
                  </div>
                  <FaArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
                </div>

                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  {card.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                  {card.description}
                </p>


              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Реальные данные в сетке */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Активные проекты */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Active Projects
              </h3>
              <FaCode className="w-5 h-5 text-gray-400" />
            </div>

            <div className="space-y-4">
              {projects.filter(p => p.status === 'in_progress').slice(0, 3).map((project) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white">
                        {project.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {project.description}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleProjectStatusUpdate(project.id, 'completed')}
                        className="px-3 py-1 text-xs font-bold text-white bg-gradient-to-r from-gray-900 to-black rounded-lg"
                      >
                        Complete
                      </motion.button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{project.technologies.join(', ')}</span>
                    <span>{project.type}</span>
                  </div>
                </motion.div>
              ))}
              
              {projects.filter(p => p.status === 'in_progress').length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <FaCode className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No active projects</p>
                  <button 
                    onClick={() => navigate('/microtasks')}
                    className="mt-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  >
                    Start a new project
                  </button>
                </div>
              )}
            </div>
          </motion.div>

          {/* Прогресс обучения */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Learning Progress
              </h3>
              <FaGraduationCap className="w-5 h-5 text-gray-400" />
            </div>

            <div className="space-y-4">
              {learningProgress.filter(item => item.status === 'in_progress').slice(0, 3).map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white">
                        {item.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {item.type} • {item.completedHours}/{item.totalHours} hours
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-gray-900 dark:text-white">
                        {item.progress}%
                      </div>
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.progress}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-2 bg-gradient-to-r from-gray-900 to-black dark:from-white dark:to-gray-200 rounded-full"
                    />
                  </div>
                  
                  <div className="flex justify-between">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleLearningProgressUpdate(item.id, Math.min(item.progress + 10, 100))}
                      className="px-3 py-1 text-xs font-bold text-white bg-gradient-to-r from-gray-900 to-black rounded-lg"
                    >
                      Update Progress
                    </motion.button>
                  </div>
                </motion.div>
              ))}
              
              {learningProgress.filter(item => item.status === 'in_progress').length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <FaGraduationCap className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No active learning</p>
                  <button 
                    onClick={() => navigate('/courses')}
                    className="mt-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  >
                    Start learning
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Призыв к действию */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-gray-900 to-black dark:from-white dark:to-gray-200 rounded-2xl p-6 text-white dark:text-black"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-black mb-2">
                Ready for the next level? 🚀
              </h3>
              <p className="text-gray-100 dark:text-gray-800">
                Your AI assistant has identified {jobApplications.filter(app => app.status === 'applied').length} opportunities
              </p>
            </div>
            <div className="flex space-x-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/jobs')}
                className="px-6 py-3 bg-white dark:bg-black text-black dark:text-white rounded-xl font-bold hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
              >
                Explore Jobs
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/ai-mentor')}
                className="px-6 py-3 bg-white/20 dark:bg-black/20 text-white dark:text-black rounded-xl font-bold hover:bg-white/30 dark:hover:bg-black/30 transition-colors"
              >
                AI Mentor
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default StudentDashboard; 