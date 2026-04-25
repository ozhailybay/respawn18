import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, getDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { UserData } from '../types';
import { useAuth } from '../context/AuthContext';
import UserProfileError from '../components/UserProfileError';
import { FiUser, FiSend, FiMail, FiStar, FiArrowRight, FiTrendingUp, FiEdit, FiEye, FiTarget, FiBookOpen, FiBriefcase } from 'react-icons/fi';

interface CareerStats {
  profileCompletion: number;
  applicationsSent: number;
  invitationsReceived: number;
  resumeRating: number;
}

interface RecommendedJob {
  id: string;
  title: string;
  company: string;
  location: string;
  match: number;
  description: string;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [user] = useAuthState(auth);
  const { userData: authUserData, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [careerStats, setCareerStats] = useState<CareerStats>({
    profileCompletion: 0,
    applicationsSent: 0,
    invitationsReceived: 0,
    resumeRating: 0
  });
  const [recommendedJobs, setRecommendedJobs] = useState<RecommendedJob[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !authUserData) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Use data from AuthContext instead of fetching again
        const userData = authUserData as UserData;
        setUserData(userData);
        
        // Calculate profile completion
        const requiredFields = [
          'firstName', 'lastName', 'email', 'phoneNumber', 'location',
          'bio', 'position', 'education', 'skills', 'experience'
        ];
        
        let filledFields = 0;
        let fieldWeights = {
          firstName: 5,
          lastName: 5,
          email: 5,
          phoneNumber: 5,
          location: 5,
          bio: 10,
          position: 5,
          education: 20,
          skills: 20,
          experience: 20
        };
        
        let totalWeight = 0;
        let completedWeight = 0;
        
        for (const [field, weight] of Object.entries(fieldWeights)) {
          totalWeight += weight;
          const value = userData[field as keyof UserData];
          
          if (value) {
            if (Array.isArray(value)) {
              if (value.length > 0) {
                completedWeight += weight;
                filledFields++;
              }
            } else if (typeof value === 'string' && value.trim() !== '') {
              completedWeight += weight;
              filledFields++;
            } else if (typeof value === 'object' && value !== null && Object.keys(value).length > 0) {
              completedWeight += weight;
              filledFields++;
            }
          }
        }
        
        const profileCompletion = Math.floor((completedWeight / totalWeight) * 100);
        
        // Fetch applications stats with real data
        const applicationsRef = collection(db, 'applications');
        const sentQuery = query(
          applicationsRef, 
          where('userId', '==', user.uid)
        );
        
        const applicationsSnapshot = await getDocs(sentQuery);
        
        const applications = applicationsSnapshot.docs.map(doc => doc.data());
        const applicationsSent = applications.length;
        
        // Count invitations (status == 'invited' or similar)
        const invitationsReceived = applications.filter(app => 
          app.status === 'invited' || 
          app.status === 'interview' || 
          app.status === 'shortlisted'
        ).length;
        
        // Get resume rating from user data or calculate if available
        let resumeRating = 0;
        if (userData.resume?.analysis?.overallScore) {
          resumeRating = Math.min(5, Math.round(userData.resume.analysis.overallScore / 20)); // Convert 0-100 to 0-5
        } else if (userData.resume?.lastGenerated) {
          // If resume exists but no analysis, give partial rating
          resumeRating = 3;
        }
        
        setCareerStats({
          profileCompletion,
          applicationsSent,
          invitationsReceived,
          resumeRating
        });
        
        // Fetch recommended jobs with real matching algorithm
        const jobsRef = collection(db, 'jobs');
        // Get active jobs only - simplified query to avoid index requirements
        const jobsQuery = query(
          jobsRef, 
          where('status', '!=', 'expired'),
          limit(50)  // Get more to filter for best matches
        );
        const jobsSnapshot = await getDocs(jobsQuery);
        
        // Extract user skills properly
        const userSkillNames = getUserSkillNames(userData);
        
        // Match jobs to user profile
        const matchedJobs = await matchJobsToUserProfile(jobsSnapshot.docs, userData, userSkillNames);
        
        // Sort by match and take top 3
        matchedJobs.sort((a, b) => b.match - a.match);
        setRecommendedJobs(matchedJobs.slice(0, 3));
        
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center transition-colors duration-300">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-2 border-black dark:border-white rounded-full animate-spin mx-auto mb-4 border-t-transparent"></div>
          <p className="text-gray-600 dark:text-gray-400 font-light">
            <span className="font-medium">Загружаем</span> ваши данные...
          </p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <UserProfileError 
        error={error} 
        onRetry={() => window.location.reload()}
        showBackButton={true}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors duration-300">
      {/* Subtle animated background elements */}
      <motion.div
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute top-20 left-4 sm:left-10 w-32 h-32 sm:w-48 sm:h-48 bg-black/3 dark:bg-white/3 rounded-full blur-3xl"
      />
      <motion.div
        animate={{ y: [0, 20, 0] }}
        transition={{ duration: 10, repeat: Infinity }}
        className="absolute bottom-20 right-4 sm:right-10 w-40 h-40 sm:w-64 sm:h-64 bg-black/3 dark:bg-white/3 rounded-full blur-3xl"
      />

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12 max-w-6xl">
        {/* Header */}
        <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12 gap-6"
        >
          <div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light text-black dark:text-white mb-4">
              <span className="font-thin">Привет, </span>
              <span className="font-bold italic underline decoration-wavy decoration-2 underline-offset-4">
                {userData?.firstName || userData?.displayName || 'друг'}
              </span>
              <span className="font-thin">!</span>
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 font-light">
              Добро пожаловать в ваш <span className="font-medium italic">личный кабинет</span>
            </p>
          </div>
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/jobs')}
            className="group flex items-center space-x-3 px-8 py-4 bg-black dark:bg-white text-white dark:text-black rounded-2xl hover:bg-gray-800 dark:hover:bg-gray-200 transition-all duration-200 font-medium"
          >
            <FiBriefcase className="w-5 h-5" />
            <span>Найти вакансии</span>
            <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </motion.div>

        {/* Career Progress */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-3xl p-6 sm:p-8 mb-8 shadow-sm hover:border-black dark:hover:border-white transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl sm:text-3xl font-light text-black dark:text-white">
              <span className="font-thin">Ваш </span>
              <span className="font-bold italic">карьерный</span>
              <span className="font-thin"> прогресс</span>
          </h2>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate('/profile/edit')}
              className="p-3 text-gray-400 hover:text-black dark:hover:text-white transition-colors duration-200"
            >
              <FiEdit className="w-5 h-5" />
            </motion.button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card 
              title="Профиль заполнен" 
              value={`${careerStats.profileCompletion}%`} 
              icon={<FiUser className="w-6 h-6" />}
              progress={careerStats.profileCompletion}
            />
            <Card 
              title="Отправлено заявок" 
              value={careerStats.applicationsSent} 
              icon={<FiSend className="w-6 h-6" />}
            />
            <Card 
              title="Приглашений" 
              value={careerStats.invitationsReceived} 
              icon={<FiMail className="w-6 h-6" />}
            />
            <Card 
              title="Рейтинг резюме" 
              value={`${careerStats.resumeRating}/5`} 
              icon={<FiStar className="w-6 h-6" />}
              progress={careerStats.resumeRating * 20}
            />
          </div>

          <div className="mt-8 text-center">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/profile/edit')}
              className="inline-flex items-center space-x-2 text-sm text-black dark:text-white hover:text-gray-700 dark:hover:text-gray-300 font-medium underline decoration-dotted underline-offset-2 transition-all duration-200"
            >
              <FiEdit className="w-4 h-4" />
              <span>Обновить профиль</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Recommended Jobs */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm hover:border-black dark:hover:border-white transition-all duration-300"
        >
          <h2 className="text-2xl sm:text-3xl font-light text-black dark:text-white mb-8">
            <span className="font-thin">Рекомендованные </span>
            <span className="font-bold italic">вакансии</span>
          </h2>
          
          {recommendedJobs.length > 0 ? (
            <div className="space-y-6">
              {recommendedJobs.map((job, index) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * (index + 1) }}
                  whileHover={{ scale: 1.02 }}
                  className="cursor-pointer group"
                  onClick={() => navigate(`/jobs/${job.id}`)}
                >
                  <div className="p-6 rounded-2xl border border-gray-200 dark:border-gray-800 hover:border-black dark:hover:border-white transition-all duration-300 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-medium text-black dark:text-white group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors mb-2">
                        {job.title}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 font-light">
                        <span className="font-medium">{job.company}</span> • {job.location}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300 font-light line-clamp-2">
                        {job.description}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className={`px-4 py-2 rounded-full text-sm font-medium ${getMatchStyle(job.match)}`}>
                        {job.match}% соответствие
                      </div>
                      <FiArrowRight className="w-5 h-5 text-black dark:text-white group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </motion.div>
              ))}
              
              <div className="text-center mt-8">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/jobs')}
                  className="inline-flex items-center space-x-2 text-sm text-black dark:text-white hover:text-gray-700 dark:hover:text-gray-300 font-medium underline decoration-dotted underline-offset-2 transition-all duration-200"
                >
                  <span>Посмотреть все вакансии</span>
                  <FiArrowRight className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiBriefcase className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-medium text-black dark:text-white mb-3">
                <span className="font-light">Нет рекомендуемых</span> <span className="italic">вакансий</span>
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto font-light">
                Заполните свой профиль и добавьте навыки, чтобы мы могли рекомендовать вам подходящие вакансии
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/jobs')}
                className="px-8 py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-all duration-200 font-medium"
              >
                Просмотреть доступные вакансии
              </motion.button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

// Helper function to determine style for match percentage
const getMatchStyle = (match: number): string => {
  if (match >= 90) return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800';
  if (match >= 70) return 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800';
  if (match >= 50) return 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800';
  return 'bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-300 border border-orange-200 dark:border-orange-800';
};

// Card component for career stats
interface CardProps { 
  title: string; 
  value: string | number;
  icon: React.ReactNode;
  progress?: number;
}

const Card: React.FC<CardProps> = ({ title, value, icon, progress }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="p-6 bg-gray-50 dark:bg-gray-900/30 rounded-2xl border border-gray-200 dark:border-gray-800 hover:border-black dark:hover:border-white transition-all duration-300 text-center group"
    >
      <div className="flex items-center justify-center w-12 h-12 mb-4 mx-auto text-black dark:text-white group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div className="text-sm text-gray-500 dark:text-gray-400 mb-2 font-light">{title}</div>
      <div className="text-3xl font-bold text-black dark:text-white mb-2">{value}</div>
      {progress !== undefined && (
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1.5, delay: 0.5 }}
            className="bg-black dark:bg-white h-2 rounded-full"
          />
        </div>
      )}
    </motion.div>
  );
};

// Функция для правильного извлечения навыков пользователя
const getUserSkillNames = (userData: UserData): string[] => {
  let skills: string[] = [];
  
  if (userData.skills) {
    if (Array.isArray(userData.skills)) {
      skills = userData.skills.map((skill: any) => {
        if (typeof skill === 'string') {
          return skill.toLowerCase();
        } else if (skill && typeof skill === 'object') {
          return (skill.name || '').toLowerCase();
        }
        return '';
      }).filter(Boolean);
    }
  }
  
  // Дополнительно извлекаем навыки из опыта работы
  if (userData.experience && Array.isArray(userData.experience)) {
    userData.experience.forEach((exp: any) => {
      if (exp.technologies && Array.isArray(exp.technologies)) {
        skills = [...skills, ...exp.technologies.map((tech: string) => tech.toLowerCase())];
      }
    });
  }
  
  // Дополнительно извлекаем навыки из проектов
  if (userData.projects && Array.isArray(userData.projects)) {
    userData.projects.forEach((project: any) => {
      if (project.technologies && Array.isArray(project.technologies)) {
        skills = [...skills, ...project.technologies.map((tech: string) => tech.toLowerCase())];
      }
    });
  }
  
  // Удаляем дубликаты
  return [...new Set(skills)];
};

// Функция для сопоставления вакансий с профилем пользователя
const matchJobsToUserProfile = async (
  jobDocs: any[], 
  userData: UserData, 
  userSkills: string[]
): Promise<RecommendedJob[]> => {
  const matchedJobs: RecommendedJob[] = [];
  
  // Основные данные пользователя для сопоставления
  const userLocation = (userData.location || '').toLowerCase();
  const userIndustry = userData.careerGoals?.preferredIndustries || [];
  const userWorkTypes = userData.workPreferences?.employmentTypes || [];
  
  for (const jobDoc of jobDocs) {
    const jobData = jobDoc.data();
    
    // Базовая информация о вакансии
    const job: RecommendedJob = {
      id: jobDoc.id,
      title: jobData.title || 'Unnamed Position',
      company: jobData.companyName || jobData.company || 'Company',
      location: jobData.location || 'Remote',
      match: 0,
      description: jobData.description || ''
    };
    
    // Извлекаем навыки из вакансии
    const jobSkills = [
      ...(jobData.skills || []), 
      ...(jobData.skillsRequired || [])
    ].map((s: string) => s.toLowerCase());
    
    // Извлекаем другие критерии из вакансии
    const jobLocation = (jobData.location || '').toLowerCase();
    const jobEmploymentType = (jobData.employmentType || '').toLowerCase();
    
    // Расчет соответствия по навыкам (60% от общего веса)
    let skillMatchScore = 0;
    if (userSkills.length > 0 && jobSkills.length > 0) {
      let matchingSkills = 0;
      
      for (const skill of userSkills) {
        if (jobSkills.some(jobSkill => 
          jobSkill.includes(skill) || skill.includes(jobSkill))) {
          matchingSkills++;
        }
      }
      
      skillMatchScore = Math.min(60, (matchingSkills / Math.max(1, jobSkills.length)) * 60);
    }
    
    // Соответствие по местоположению (20% от общего веса)
    let locationScore = 0;
    if (userLocation && jobLocation) {
      if (jobLocation.includes(userLocation) || userLocation.includes(jobLocation)) {
        locationScore = 20;
      } else if (jobData.format === 'remote' || jobData.remote === true) {
        locationScore = 15; // Если удаленная работа, тоже хорошее соответствие
      }
    } else if (jobData.format === 'remote' || jobData.remote === true) {
      locationScore = 15;
    }
    
    // Соответствие по типу занятости (10% от общего веса)
    let employmentTypeScore = 0;
    if (userWorkTypes.length > 0 && jobEmploymentType) {
      const normalizedType = jobEmploymentType.toLowerCase();
      
      if (userWorkTypes.some((type: string) => normalizedType.includes(type.toLowerCase()))) {
        employmentTypeScore = 10;
      }
    } else {
      employmentTypeScore = 5; // Если нет предпочтений, даем небольшой балл
    }
    
    // Добавляем базовый скор для всех вакансий (10% от общего веса)
    const baseScore = 10;
    
    // Финальный скор соответствия
    job.match = Math.round(skillMatchScore + locationScore + employmentTypeScore + baseScore);
    
    // Если соответствие больше 30%, добавляем в результат
    if (job.match > 30) {
      matchedJobs.push(job);
    }
  }
  
  return matchedJobs;
};

export default Dashboard; 