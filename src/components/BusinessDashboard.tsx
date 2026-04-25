import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FaBriefcase, 
  FaUsers, 
  FaChartLine, 
  FaFileAlt,
  FaSearch,
  FaPlus,
  FaEye,
  FaEdit,
  FaTrash,
  FaCheck,
  FaTimes,
  FaStar,
  FaClock,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaGraduationCap,
  FaCode,
  FaLightbulb,
  FaRocket,
  FaTrophy,
  FaBell,
  FaCog,
  FaDownload,
  FaUpload,
  FaFilter,
  FaSort,
  FaSyncAlt,
  FaUserTie,
  FaBuilding,
  FaHandshake,
  FaCalendarAlt,
  FaEnvelope,
  FaPhone,
  FaLinkedin,
  FaGlobe,
  FaHeart,
  FaBookmark,
  FaShare,
  FaPrint,
  FaCopy,
  FaPaste,
  FaCut,
  FaUndo,
  FaRedo,
  FaSave,
  FaFolder,
  FaFolderOpen,
  FaFile,
  FaFileAlt as FaFileAltIcon,
  FaFilePdf,
  FaFileWord,
  FaFileExcel,
  FaFileImage,
  FaFileArchive,
  FaFileCode,
  FaFileVideo,
  FaFileAudio,
  FaFileContract,
  FaFileInvoice,
  FaFileInvoiceDollar,
  FaFileMedical,
  FaFilePrescription,
  FaFileSignature,
  FaFileUpload,
  FaFileDownload,
  FaFileExport,
  FaFileImport,
  FaFileCheck,
  FaFileTimes,
  FaFileMinus,
  FaFilePlus,
  FaFileEdit,
  FaFileSearch,
  FaFileShield,
  FaFileLock,
  FaFileUnlock,
  FaFileKey,
  FaFileCertificate,
  FaFileClipboard,
  FaFileDatabase,
  FaFileNetwork,
  FaFileCloud,
  FaFileUser,
  FaFileCog,
  FaFileWrench,
  FaFileTools,
  FaFileHammer,
  FaFileScrewdriver,
  FaFileWrench as FaFileWrenchIcon,
  FaFileTools as FaFileToolsIcon,
  FaFileHammer as FaFileHammerIcon,
  FaFileScrewdriver as FaFileScrewdriverIcon
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
import { db } from '../firebase';
import RespawnLogo from './RespawnLogo';

// Интерфейсы для бизнес-данных
interface JobPosting {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: 'full-time' | 'part-time' | 'contract' | 'internship';
  status: 'active' | 'paused' | 'closed';
  applications: number;
  views: number;
  createdAt: Date;
  deadline?: Date;
  requirements: string[];
  benefits: string[];
  description: string;
}

interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  experience: number;
  skills: string[];
  education: string;
  matchScore: number;
  status: 'new' | 'reviewing' | 'interviewed' | 'hired' | 'rejected';
  appliedAt: Date;
  resumeUrl?: string;
  photoURL?: string;
}

interface BusinessMetric {
  id: string;
  label: string;
  value: number | string;
  unit?: string;
  change?: number;
  trend: 'up' | 'down' | 'stable';
  icon: React.ReactNode;
  color: string;
}

interface RecentActivity {
  id: string;
  type: 'job_posted' | 'application_received' | 'candidate_hired' | 'interview_scheduled';
  title: string;
  description: string;
  timestamp: Date;
  icon: React.ReactNode;
}

const BusinessDashboard: React.FC = () => {
  const { user, userData } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'jobs' | 'candidates' | 'analytics'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Бизнес-данные
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);

  // Загрузка данных
  useEffect(() => {
    const fetchBusinessData = async () => {
      if (!user?.uid) return;

      setIsLoading(true);
      try {
        // Загружаем вакансии
        const jobsQuery = query(
          collection(db, 'jobPostings'),
          where('companyId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const jobsSnapshot = await getDocs(jobsQuery);
        const jobs = jobsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          deadline: doc.data().deadline?.toDate()
        })) as JobPosting[];
        setJobPostings(jobs);

        // Загружаем кандидатов
        const candidatesQuery = query(
          collection(db, 'candidates'),
          where('companyId', '==', user.uid),
          orderBy('appliedAt', 'desc'),
          limit(20)
        );
        const candidatesSnapshot = await getDocs(candidatesQuery);
        const candidates = candidatesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          appliedAt: doc.data().appliedAt?.toDate() || new Date()
        })) as Candidate[];
        setCandidates(candidates);

      } catch (error) {
        console.error('Error fetching business data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBusinessData();
  }, [user?.uid]);

  // Вычисляемые метрики для бизнеса
  const businessMetrics: BusinessMetric[] = useMemo(() => [
    {
      id: 'active-jobs',
      label: 'Активные вакансии',
      value: jobPostings.filter(job => job.status === 'active').length,
      unit: '',
      change: jobPostings.filter(job => 
        job.createdAt > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ).length,
      trend: 'up',
      icon: <FaBriefcase className="w-6 h-6" />,
      color: 'from-blue-600 to-blue-700'
    },
    {
      id: 'total-applications',
      label: 'Всего заявок',
      value: candidates.length,
      unit: '',
      change: candidates.filter(candidate => 
        candidate.appliedAt > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ).length,
      trend: 'up',
      icon: <FaUsers className="w-6 h-6" />,
      color: 'from-green-600 to-green-700'
    },
    {
      id: 'hired-candidates',
      label: 'Нанятые кандидаты',
      value: candidates.filter(candidate => candidate.status === 'hired').length,
      unit: '',
      change: candidates.filter(candidate => 
        candidate.status === 'hired' && 
        candidate.appliedAt > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      ).length,
      trend: 'up',
      icon: <FaHandshake className="w-6 h-6" />,
      color: 'from-purple-600 to-purple-700'
    },
    {
      id: 'avg-match-score',
      label: 'Средний рейтинг',
      value: candidates.length > 0 
        ? Math.round(candidates.reduce((acc, candidate) => acc + candidate.matchScore, 0) / candidates.length)
        : 0,
      unit: '%',
      change: 5,
      trend: 'up',
      icon: <FaStar className="w-6 h-6" />,
      color: 'from-yellow-600 to-yellow-700'
    }
  ], [jobPostings, candidates]);

  // Быстрые действия
  const quickActions = [
    {
      id: 'post-job',
      title: 'Разместить вакансию',
      description: 'Создать новую вакансию',
      icon: <FaPlus className="w-6 h-6" />,
      action: () => navigate('/post-job'),
      color: 'from-blue-600 to-blue-700'
    },
    {
      id: 'view-candidates',
      title: 'Просмотр кандидатов',
      description: 'Управление заявками',
      icon: <FaUsers className="w-6 h-6" />,
      action: () => setActiveTab('candidates'),
      color: 'from-green-600 to-green-700'
    },
    {
      id: 'analytics',
      title: 'Аналитика',
      description: 'Статистика и отчеты',
      icon: <FaChartLine className="w-6 h-6" />,
      action: () => setActiveTab('analytics'),
      color: 'from-purple-600 to-purple-700'
    },
    {
      id: 'ai-recruit',
      title: 'AI Рекрутинг',
      description: 'Умный подбор кандидатов',
      icon: <FaLightbulb className="w-6 h-6" />,
      action: () => navigate('/ai-recruit'),
      color: 'from-orange-600 to-orange-700'
    }
  ];

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
            Загружаем бизнес-дашборд...
          </motion.div>
        </motion.div>
      </div>
    );
  }

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
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
                <FaBuilding className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-gray-900 dark:text-white">
                  Бизнес-дашборд
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Управление наймом и аналитика
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-3 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
              >
                <FaBell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-3 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
              >
                <FaCog className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
          {[
            { id: 'overview', label: 'Обзор', icon: <FaEye className="w-4 h-4" /> },
            { id: 'jobs', label: 'Вакансии', icon: <FaBriefcase className="w-4 h-4" /> },
            { id: 'candidates', label: 'Кандидаты', icon: <FaUsers className="w-4 h-4" /> },
            { id: 'analytics', label: 'Аналитика', icon: <FaChartLine className="w-4 h-4" /> }
          ].map((tab) => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Метрики */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {businessMetrics.map((metric) => (
                <motion.div
                  key={metric.id}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
                >
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
                </motion.div>
              ))}
            </div>

            {/* Быстрые действия */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Быстрые действия
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {quickActions.map((action) => (
                  <motion.div
                    key={action.id}
                    whileHover={{ y: -5, scale: 1.02 }}
                    onClick={action.action}
                    className="group bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 cursor-pointer"
                  >
                    <div className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-xl flex items-center justify-center mb-4`}>
                      <div className="text-white">
                        {action.icon}
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      {action.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {action.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Последние вакансии */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Последние вакансии
                  </h3>
                  <Link 
                    to="/jobs"
                    className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
                  >
                    Все вакансии →
                  </Link>
                </div>

                <div className="space-y-4">
                  {jobPostings.slice(0, 3).map((job) => (
                    <div key={job.id} className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-bold text-gray-900 dark:text-white">
                            {job.title}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {job.location} • {job.type}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-gray-900 dark:text-white">
                            {job.applications} заявок
                          </div>
                          <div className="text-xs text-gray-500">
                            {job.views} просмотров
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Последние кандидаты */}
              <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Последние кандидаты
                  </h3>
                  <Link 
                    to="/candidates"
                    className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
                  >
                    Все кандидаты →
                  </Link>
                </div>

                <div className="space-y-4">
                  {candidates.slice(0, 3).map((candidate) => (
                    <div key={candidate.id} className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center">
                          <FaUserTie className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900 dark:text-white">
                            {candidate.name}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {candidate.experience} лет опыта • {candidate.matchScore}% совпадение
                          </p>
                        </div>
                        <div className="text-right">
                          <div className={`px-2 py-1 rounded-full text-xs font-bold ${
                            candidate.status === 'hired' ? 'bg-green-100 text-green-800' :
                            candidate.status === 'interviewed' ? 'bg-blue-100 text-blue-800' :
                            candidate.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {candidate.status === 'hired' ? 'Нанят' :
                             candidate.status === 'interviewed' ? 'Интервью' :
                             candidate.status === 'rejected' ? 'Отклонен' :
                             candidate.status === 'reviewing' ? 'На рассмотрении' : 'Новый'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Jobs Tab */}
        {activeTab === 'jobs' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Управление вакансиями
              </h2>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/post-job')}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700"
              >
                <FaPlus className="w-4 h-4 mr-2 inline" />
                Разместить вакансию
              </motion.button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobPostings.map((job) => (
                <motion.div
                  key={job.id}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                        {job.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {job.location} • {job.type}
                      </p>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-bold ${
                      job.status === 'active' ? 'bg-green-100 text-green-800' :
                      job.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {job.status === 'active' ? 'Активна' :
                       job.status === 'paused' ? 'Приостановлена' : 'Закрыта'}
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Заявки:</span>
                      <span className="font-bold text-gray-900 dark:text-white">{job.applications}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Просмотры:</span>
                      <span className="font-bold text-gray-900 dark:text-white">{job.views}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Зарплата:</span>
                      <span className="font-bold text-gray-900 dark:text-white">{job.salary}</span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold"
                    >
                      <FaEye className="w-4 h-4 mr-1 inline" />
                      Просмотр
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-3 py-2 bg-gray-600 text-white rounded-lg text-sm font-bold"
                    >
                      <FaEdit className="w-4 h-4" />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Candidates Tab */}
        {activeTab === 'candidates' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Кандидаты
              </h2>
              <div className="flex space-x-3">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="all">Все статусы</option>
                  <option value="new">Новые</option>
                  <option value="reviewing">На рассмотрении</option>
                  <option value="interviewed">Интервью</option>
                  <option value="hired">Нанятые</option>
                  <option value="rejected">Отклоненные</option>
                </select>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Кандидат
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Позиция
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Опыт
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Совпадение
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Статус
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Дата
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Действия
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {candidates.map((candidate) => (
                      <tr key={candidate.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center">
                              <FaUserTie className="w-5 h-5 text-white" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {candidate.name}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {candidate.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          Frontend Developer
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {candidate.experience} лет
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="text-sm font-medium text-gray-900 dark:text-white mr-2">
                              {candidate.matchScore}%
                            </div>
                            <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div 
                                className="h-2 bg-green-500 rounded-full"
                                style={{ width: `${candidate.matchScore}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                            candidate.status === 'hired' ? 'bg-green-100 text-green-800' :
                            candidate.status === 'interviewed' ? 'bg-blue-100 text-blue-800' :
                            candidate.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            candidate.status === 'reviewing' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {candidate.status === 'hired' ? 'Нанят' :
                             candidate.status === 'interviewed' ? 'Интервью' :
                             candidate.status === 'rejected' ? 'Отклонен' :
                             candidate.status === 'reviewing' ? 'На рассмотрении' : 'Новый'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {candidate.appliedAt.toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <FaEye className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="text-green-600 hover:text-green-900"
                            >
                              <FaCheck className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="text-red-600 hover:text-red-900"
                            >
                              <FaTimes className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Аналитика и отчеты
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Статистика найма
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Всего вакансий:</span>
                    <span className="font-bold text-gray-900 dark:text-white">{jobPostings.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Активных вакансий:</span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {jobPostings.filter(job => job.status === 'active').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Всего кандидатов:</span>
                    <span className="font-bold text-gray-900 dark:text-white">{candidates.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Нанятых:</span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {candidates.filter(candidate => candidate.status === 'hired').length}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Быстрые отчеты
                </h3>
                <div className="space-y-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700"
                  >
                    <FaDownload className="w-4 h-4 mr-2 inline" />
                    Отчет по вакансиям
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full px-4 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700"
                  >
                    <FaDownload className="w-4 h-4 mr-2 inline" />
                    Отчет по кандидатам
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700"
                  >
                    <FaDownload className="w-4 h-4 mr-2 inline" />
                    Аналитика эффективности
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default BusinessDashboard; 