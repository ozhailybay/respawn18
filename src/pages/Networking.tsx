import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Container, Heading, Text, Tabs, TabList, Tab, TabPanels, TabPanel,
  Button, VStack, HStack, Flex, useColorModeValue, Image, Icon, SimpleGrid,
  Card, CardBody, Divider, Badge, Avatar, Link as ChakraLink, useToast,
  Tag, TagLabel, TagLeftIcon, Grid, Circle, Tooltip, IconButton, Modal, 
  ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, 
  ModalFooter, FormControl, FormLabel, Textarea, useDisclosure,
  Wrap, WrapItem, Spinner, Center, Input, Select, TagCloseButton,
  useBreakpointValue, Stack, keyframes, Stat, StatLabel, StatNumber,
  StatHelpText, StatArrow, Alert, AlertIcon, AlertTitle, AlertDescription
} from '@chakra-ui/react';
import { 
  FaUserAlt, FaBriefcase, FaStar, FaRobot, FaUsers, FaLightbulb, 
  FaRegLightbulb, FaArrowRight, FaGlobe, FaRocket, FaCode, FaHandshake,
  FaPen, FaNetworkWired, FaLaptopCode, FaGraduationCap, FaTools, FaPlus,
  FaFileAlt, FaFire, FaBolt, FaMagic, FaHeart, FaGamepad, FaMusic,
  FaSearch, FaFilter, FaSort, FaBookmark, FaShare, FaEye, FaEyeSlash,
  FaCheckCircle, FaTimesCircle, FaClock, FaThumbsUp, FaComment,
  FaMapMarkerAlt, FaCalendar, FaClock as FaTime, FaDollarSign,
  FaChartLine, FaTrophy, FaMedal, FaAward, FaCrown, FaGem,
  FaShieldAlt, FaLock, FaUnlock, FaBell, FaCog, FaUserCog,
  FaSignOutAlt, FaHome, FaCompass, FaUserFriends, FaProjectDiagram,
  FaLayerGroup, FaPalette, FaBrain, FaInfinity
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { doc, getDoc, setDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

// Import our new components
import NetworkingProfile from '../components/networking/NetworkingProfile';
import { CreateProfileForm } from '../components/networking/CreateProfileForm';
import { CreateProjectForm } from '../components/networking/CreateProjectForm';
import HeaderSection from '../components/HeaderSection';
import PageWrapper from '../components/layout/PageWrapper';
import ErrorBoundary from '../components/layout/ErrorBoundary';
import EnhancedProjectCard from '../components/networking/EnhancedProjectCard';
import EnhancedSearchFilters from '../components/networking/EnhancedSearchFilters';
import NetworkingStats from '../components/networking/NetworkingStats';

// Import our hooks
import { useProjects, Project } from '../hooks/useProjects';
import { useNetworkingProfile } from '../hooks/useNetworkingProfile';
import { RecommendationEngine } from '../utils/recommendationAlgorithm';
import { projectService } from '../services/projectService';
import { RecommendationsInsights } from '../components/networking/RecommendationsInsights';
import { professionKeywords } from '../components/shadowing/catalog';
import { SHADOW_FIRST_LOGIN_KEY } from '../components/shadowing/storage';

// @ts-ignore - motion() works with Chakra UI components
const MotionBox = motion(Box);
// @ts-ignore - motion() works with Chakra UI components
const MotionFlex = motion(Flex);
// @ts-ignore - motion() works with Chakra UI components
const MotionCard = motion(Card);

// Keyframes for elegant animations
const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

const fadeIn = keyframes`
  0% { opacity: 0; transform: translateY(20px); }
  100% { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  0% { transform: translateX(-100%); opacity: 0; }
  100% { transform: translateX(0); opacity: 1; }
`;

// Animation variants for staggered animations
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100
    }
  }
};

// Floating Particles Component - Elegant version
const FloatingParticles: React.FC = () => {
  const particles = Array.from({ length: 8 }, (_, i) => i);
  
  return (
    <Box position="absolute" inset={0} overflow="hidden" pointerEvents="none" zIndex={0}>
      {particles.map((i) => (
        <MotionBox
          key={i}
          position="absolute"
          animate={{
            y: [0, -30, 0],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: 6 + i * 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.8,
          }}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
        >
          <Circle
            size={`${4 + Math.random() * 8}px`}
            bg={useColorModeValue('black', 'white')}
            opacity={0.1}
          />
        </MotionBox>
      ))}
    </Box>
  );
};

// Elegant Card Component
const ElegantCard: React.FC<{ children: React.ReactNode; [key: string]: any }> = ({ children, ...props }) => {
  return (
    <MotionBox
      bg={useColorModeValue('white', 'gray.900')}
      borderRadius="2xl"
      border="1px solid"
      borderColor={useColorModeValue('gray.200', 'gray.700')}
      boxShadow="0 4px 20px rgba(0,0,0,0.08)"
      whileHover={{
        y: -4,
        boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
      }}
      transition="all 0.3s ease"
      {...props}
    >
      {children}
    </MotionBox>
  );
};

// Elegant Button Component
const ElegantButton: React.FC<{ children: React.ReactNode; onClick?: () => void; variant?: 'primary' | 'secondary'; [key: string]: any }> = ({ 
  children, 
  onClick, 
  variant = 'primary',
  ...props 
}) => {
  const isPrimary = variant === 'primary';
  
  return (
    <MotionBox
      as="button"
      bg={isPrimary ? useColorModeValue('black', 'white') : 'transparent'}
      color={isPrimary ? useColorModeValue('white', 'black') : useColorModeValue('black', 'white')}
      border="2px solid"
      borderColor={useColorModeValue('black', 'white')}
      borderRadius="full"
      px={6}
      py={3}
      fontSize="sm"
      fontWeight="medium"
      cursor="pointer"
      onClick={onClick}
      whileHover={{ 
        scale: 1.05,
        bg: isPrimary ? useColorModeValue('gray.800', 'gray.200') : useColorModeValue('black', 'white'),
        color: isPrimary ? 'white' : useColorModeValue('white', 'black')
      }}
      whileTap={{ scale: 0.95 }}
      transition="all 0.2s ease"
      {...props}
    >
      {children}
    </MotionBox>
  );
};

// Helper component for animated section titles
const AnimatedSectionTitle: React.FC<{title: string; subtitle?: string}> = ({ title, subtitle }) => {
  return (
    <MotionBox
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      mb={6}
    >
      <Heading
        as="h2"
        fontSize={{ base: "2xl", md: "3xl", lg: "4xl" }}
        color={useColorModeValue('black', 'white')}
        letterSpacing="tight"
        mb={2}
        textAlign={{ base: "center", md: "left" }}
        fontWeight="300"
      >
        {title}
      </Heading>
      {subtitle && (
        <Text 
          fontSize={{ base: "md", md: "lg" }} 
          color={useColorModeValue('gray.600', 'gray.400')}
          textAlign={{ base: "center", md: "left" }}
          fontWeight="light"
        >
          {subtitle}
        </Text>
      )}
    </MotionBox>
  );
};

// Elegant Project Card Component
const ElegantProjectCard: React.FC<{
  project: any;
  onApply: (projectId: string) => void;
}> = ({ project, onApply }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <ElegantCard
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      p={6}
      position="relative"
      overflow="hidden"
    >
      {/* Subtle accent line */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        h="2px"
        bg={useColorModeValue('black', 'white')}
        opacity={isHovered ? 1 : 0}
        transition="opacity 0.3s ease"
      />
      
      <VStack align="stretch" spacing={4}>
        {/* Header */}
        <Flex justify="space-between" align="start">
          <VStack align="start" spacing={2} flex={1}>
            <MotionBox
              whileHover={{ x: 4 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Heading 
                size="md" 
                color={useColorModeValue('black', 'white')}
                noOfLines={2} 
                fontWeight="400"
              >
                {project.title}
              </Heading>
            </MotionBox>
            <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')} fontWeight="light">
              {project.category}
            </Text>
          </VStack>
          <Badge 
            bg={project.status === 'active' ? 
              useColorModeValue('black', 'white') : 
              useColorModeValue('gray.100', 'gray.800')
            }
            color={project.status === 'active' ? 
              useColorModeValue('white', 'black') : 
              useColorModeValue('gray.600', 'gray.400')
            }
            fontSize="xs"
            px={3}
            py={1}
            borderRadius="full"
            fontWeight="medium"
            textTransform="uppercase"
            letterSpacing="wide"
          >
            {project.status}
          </Badge>
        </Flex>

        {/* Description */}
        <Text 
          fontSize="sm" 
          color={useColorModeValue('gray.700', 'gray.300')} 
          noOfLines={3}
          lineHeight="1.6"
        >
          {project.description}
        </Text>

        {/* Tags */}
        <Wrap spacing={2}>
          {project.tags?.slice(0, 4).map((tag: string, index: number) => (
            <WrapItem key={index}>
              <Badge
                bg={useColorModeValue('gray.100', 'gray.800')}
                color={useColorModeValue('gray.700', 'gray.300')}
                fontSize="xs"
                borderRadius="full"
                px={3}
                py={1}
                fontWeight="medium"
                border="1px solid"
                borderColor={useColorModeValue('gray.200', 'gray.700')}
              >
                {tag}
              </Badge>
            </WrapItem>
          ))}
          {project.tags?.length > 4 && (
            <Badge 
              bg={useColorModeValue('gray.200', 'gray.700')}
              color={useColorModeValue('gray.600', 'gray.400')}
              fontSize="xs" 
              borderRadius="full" 
              px={3} 
              py={1}
              fontWeight="medium"
            >
              +{project.tags.length - 4}
            </Badge>
          )}
        </Wrap>

        {/* Footer */}
        <Flex justify="space-between" align="center" pt={2}>
          <HStack spacing={3}>
            <Avatar 
              size="sm" 
              name={project.author}
              border="1px solid"
              borderColor={useColorModeValue('gray.200', 'gray.700')}
            />
            <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')} fontWeight="light">
              {project.author}
            </Text>
          </HStack>
          <ElegantButton onClick={() => onApply(project.id)} size="sm">
            Присоединиться
          </ElegantButton>
        </Flex>
      </VStack>
    </ElegantCard>
  );
};

// Elegant Bottom Navigation
const ElegantBottomBar: React.FC<{
  activeTab: number;
  onTabChange: (index: number) => void;
  hasProfile: boolean;
}> = ({ activeTab, onTabChange, hasProfile }) => {
  const bgColor = useColorModeValue('rgba(255,255,255,0.95)', 'rgba(0,0,0,0.95)');
  const activeColor = useColorModeValue('black', 'white');
  const inactiveColor = useColorModeValue('gray.500', 'gray.400');

  return (
    <Box
      position="fixed"
      bottom={0}
      left={0}
      right={0}
      bg={bgColor}
      backdropFilter="blur(20px)"
      borderTopWidth="1px"
      borderColor={useColorModeValue('gray.200', 'gray.700')}
      py={3}
      px={4}
      zIndex={1000}
      boxShadow="0 -4px 20px rgba(0,0,0,0.08)"
    >
      <Flex justify="space-around" align="center">
        {[
          { icon: FaRocket, label: 'Проекты', index: 0 },
          { icon: FaUserAlt, label: hasProfile ? 'Профиль' : 'Создать', index: 1 },
          { icon: FaPlus, label: 'Создать', index: 2 }
        ].map((item) => (
          <MotionBox
            key={item.index}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onTabChange(item.index)}
            cursor="pointer"
          >
            <VStack spacing={1}>
              <Box
                bg={activeTab === item.index ? activeColor : "transparent"}
                color={activeTab === item.index ? 
                  useColorModeValue('white', 'black') : 
                  inactiveColor
                }
                borderRadius="full"
                p={2}
                transition="all 0.3s ease"
              >
                <Icon as={item.icon} boxSize={5} />
              </Box>
              <Text 
                fontSize="xs" 
                fontWeight="medium"
                color={activeTab === item.index ? activeColor : inactiveColor}
              >
                {item.label}
              </Text>
            </VStack>
          </MotionBox>
        ))}
      </Flex>
    </Box>
  );
};

const Networking: React.FC = () => {
  const [user] = useAuthState(auth);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [applicationText, setApplicationText] = useState('');
  const [bookmarkedProjects, setBookmarkedProjects] = useState<string[]>([]);
  const [shadowProfessionFilter, setShadowProfessionFilter] = useState<string | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const navigate = useNavigate();
  
  // Responsive values
  const isMobile = useBreakpointValue({ base: true, md: false });
  const containerMaxW = useBreakpointValue({ base: "100%", md: "container.xl" });
  const containerPx = useBreakpointValue({ base: 4, md: 8 });
  const cardSpacing = useBreakpointValue({ base: 4, md: 8 });
  const headerPy = useBreakpointValue({ base: 8, md: 12 });
  const tabSize = useBreakpointValue({ base: "sm", md: "md" });
  const modalSize = useBreakpointValue({ base: "full", md: "md" });

  // Real data hooks
  const { projects, loading: projectsLoading, error: projectsError, hasMore, loadMore, refresh: refreshProjects, filters, setFilters } = useProjects();
  const { profile, loading: profileLoading, error: profileError, createProfile, updateProfile, refresh: refreshProfile } = useNetworkingProfile(user?.uid);
  
  const hasProfile = !!profile;
  const isLoading = projectsLoading || profileLoading;

  // Calculate recommendations
  const recommendations = useMemo(() => {
    return RecommendationEngine.calculateRecommendations(projects, profile);
  }, [projects, profile]);

  const visibleRecommendations = useMemo(() => {
    if (!shadowProfessionFilter) return recommendations;

    const keywords = professionKeywords(shadowProfessionFilter).map((item) => item.toLowerCase());
    return recommendations.filter(({ project }) => {
      const source = [
        project.title,
        project.description,
        project.category,
        ...(project.tags || []),
        ...(project.technologies || []),
      ]
        .join(' ')
        .toLowerCase();

      return keywords.some((keyword) => source.includes(keyword));
    });
  }, [recommendations, shadowProfessionFilter]);

  // Calculate insights
  const insights = useMemo(() => {
    return RecommendationEngine.getPersonalizedInsights(profile, recommendations);
  }, [profile, recommendations]);

  // Calculate stats from real data
  const stats = useMemo(() => {
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === 'active' || p.status === 'recruiting').length;
    
    // Calculate categories distribution
    const categoryCounts = projects.reduce((acc, project) => {
      acc[project.category] = (acc[project.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const categories = Object.entries(categoryCounts)
      .map(([name, count]) => ({ name, count, percentage: Math.round((count / totalProjects) * 100) }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 7);

    // Calculate top technologies
    const techCounts = projects.reduce((acc, project) => {
      if (project.technologies && Array.isArray(project.technologies)) {
        project.technologies.forEach(tech => {
          acc[tech] = (acc[tech] || 0) + 1;
        });
      }
      return acc;
    }, {} as Record<string, number>);

    const topTechnologies = Object.entries(techCounts)
      .map(([name, count]) => ({ name, count, trend: 'up' as const }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    return {
      totalProjects,
      activeProjects,
      totalUsers: 1247, // Mock for now
      activeUsers: 892, // Mock for now
      successRate: 89, // Mock for now
      averageMatchScore: Math.round(recommendations.reduce((sum, rec) => sum + rec.score, 0) / recommendations.length * 100),
      totalApplications: 2341, // Mock for now
      acceptedApplications: 1892, // Mock for now
      categories,
      topTechnologies,
      recentActivity: [
        { type: 'project_created', description: 'Создан новый проект', time: '2 часа назад' },
        { type: 'application_accepted', description: 'Заявка принята', time: '4 часа назад' },
        { type: 'project_completed', description: 'Проект завершен', time: '1 день назад' },
        { type: 'new_member', description: 'Новый участник', time: '2 дня назад' }
      ],
      userStats: profile ? {
        projectsCreated: profile.projectsCreated || 0,
        projectsJoined: profile.projectsJoined || 0,
        applicationsSubmitted: profile.applicationsSubmitted || 0,
        applicationsAccepted: profile.applicationsAccepted || 0,
        matchScore: profile.matchScore || 0,
        rank: profile.rank || 'Новичок',
        achievements: profile.achievements || []
      } : undefined
    };
  }, [projects, profile, recommendations]);

  useEffect(() => {
    const profession = localStorage.getItem(SHADOW_FIRST_LOGIN_KEY);
    if (!profession) return;

    setShadowProfessionFilter(profession);
    localStorage.removeItem(SHADOW_FIRST_LOGIN_KEY);
    toast({
      title: 'Автофильтр включен',
      description: `Показываем проекты по направлению: ${profession}`,
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  }, [toast]);

  // Handle project creation
  const handleCreateProject = async (projectData: Partial<Project>) => {
    if (!user) {
      toast({
        title: 'Авторизация қатесі',
        description: 'Жоба жасау үшін жүйеге кіріңіз',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const projectId = await projectService.createProject({
        ...projectData,
        author: user.displayName || 'Анонимный пользователь',
        authorId: user.uid,
        authorAvatar: user.photoURL || undefined,
      } as any);
      
      toast({
        title: 'Жоба жасалды!',
        description: 'Енді басқа қатысушылар сіздің жобаңызды таба алады',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      setActiveTab(0);
      refreshProjects();
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: 'Қате',
        description: 'Жоба жасау мүмкін емес',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleTabChange = (index: number) => {
    setActiveTab(index);
  };

  const handleApplyToProject = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    setSelectedProject(project || null);
    onOpen();
  };

  const handleBookmarkProject = (projectId: string) => {
    setBookmarkedProjects(prev => 
      prev.includes(projectId) 
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
    
    toast({
      title: bookmarkedProjects.includes(projectId) ? 'Убрано из закладок' : 'Добавлено в закладки',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  const handleShareProject = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    const shareText = `Посмотрите этот интересный проект: ${project?.title}`;
    const shareUrl = `${window.location.origin}/project/${projectId}`;
    
    if (navigator.share) {
      navigator.share({
        title: project?.title,
        text: shareText,
        url: shareUrl,
      });
    } else {
      navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      toast({
        title: 'Ссылка скопирована',
        description: 'Ссылка на проект скопирована в буфер обмена',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    }
  };

  const handleCreateProfile = async (profileData: any) => {
    try {
      await createProfile(profileData);
      toast({
        title: 'Профиль создан!',
        description: 'Теперь вы можете участвовать в проектах',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      setActiveTab(0);
    } catch (error) {
      console.error('Error creating profile:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось создать профиль',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };
  
  const handleSubmitApplication = async () => {
    if (!applicationText.trim()) {
      toast({
        title: 'Заполните заявку',
        description: 'Напишите сопроводительное письмо',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      // Here you would submit the application
      await new Promise(resolve => setTimeout(resolve, 1000)); // Mock API call
      
      toast({
        title: 'Заявка отправлена!',
        description: 'Автор проекта рассмотрит вашу заявку',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      setApplicationText('');
      onClose();
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось отправить заявку',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };
  
  if (isLoading) {
    return (
      <Box minH="100vh" bg={useColorModeValue('gray.50', 'gray.900')} position="relative">
        <FloatingParticles />
        <Center minH="100vh">
          <VStack spacing={6}>
            <MotionBox
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Icon as={FaRocket} boxSize={12} color={useColorModeValue('black', 'white')} />
            </MotionBox>
            <Text color={useColorModeValue('gray.600', 'gray.400')} fontSize="lg" fontWeight="light">
              Загрузка...
            </Text>
          </VStack>
        </Center>
      </Box>
    );
  }

    return (
    <Box 
      minH="100vh" 
      bg={useColorModeValue('gray.50', 'gray.900')}
      position="relative"
    >
      {/* Floating particles background */}
      <FloatingParticles />

      {/* Hero Section */}
      <Box py={headerPy} position="relative" zIndex={2}>
        <Container maxW={containerMaxW} px={containerPx}>
          <MotionBox
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            textAlign="center"
            mb={8}
          >
            <VStack spacing={6}>
              {/* Main title */}
              <Heading
                as="h1"
                fontSize={{ base: "4xl", md: "6xl", lg: "7xl" }}
                fontWeight="100"
                color={useColorModeValue('black', 'white')}
                letterSpacing="tight"
                lineHeight="1.1"
              >
                Нетворкинг
                <Text as="span" fontWeight="300" display="block" fontSize={{ base: "2xl", md: "3xl", lg: "4xl" }}>
                  Платформасы
                </Text>
              </Heading>

              {/* Subtitle */}
              <Text 
                fontSize={{ base: "lg", md: "xl", lg: "2xl" }} 
                color={useColorModeValue('gray.600', 'gray.400')}
                maxW="4xl"
                mx="auto"
                fontWeight="light"
                lineHeight="1.6"
              >
                Ойласушыларды табыңыз, жобалар жасаңыз және кәсіби қоғамдастықтың элегантты ортасында мансабыңызды дамытыңыз
              </Text>

              {/* Action buttons */}
              <HStack spacing={4} justify="center" flexWrap="wrap">
                <ElegantButton onClick={() => setActiveTab(0)}>
                  Жобаларды табу
                </ElegantButton>
                <ElegantButton 
                  variant="secondary" 
                  onClick={() => setActiveTab(hasProfile ? 1 : 1)}
                >
                  {hasProfile ? 'Менің профилім' : 'Профиль жасау'}
                </ElegantButton>
              </HStack>
            </VStack>
          </MotionBox>
        </Container>
        </Box>

      {/* Main Content */}
      <Box py={cardSpacing} minH="calc(100vh - 200px)" position="relative" zIndex={2}>
        <Container maxW={containerMaxW} px={containerPx}>
          <ElegantCard p={0} overflow="hidden">
            {/* Desktop Tabs */}
            {!isMobile && (
              <Tabs 
                isFitted
                onChange={handleTabChange} 
                index={activeTab}
                variant="enclosed"
                size={tabSize}
              >
                <TabList 
                  bg={useColorModeValue('white', 'gray.800')} 
                  borderColor={useColorModeValue('gray.200', 'gray.700')}
                >
                  {[
                    { label: 'Жобалар', index: 0 },
                    { label: hasProfile ? 'Менің профилім' : 'Профиль жасау', index: 1 },
                    { label: 'Жоба жасау', index: 2 }
                  ].map((tab) => (
                    <Tab 
                      key={tab.index}
                      py={4} 
                      fontWeight="medium"
                      color={useColorModeValue('gray.600', 'gray.400')}
                      _selected={{ 
                        color: useColorModeValue('black', 'white'),
                        borderColor: useColorModeValue('black', 'white'),
                        bg: useColorModeValue('gray.50', 'gray.700')
                      }}
                      _hover={{ 
                        color: useColorModeValue('black', 'white')
                      }}
                      transition="all 0.2s ease"
                    >
                      {tab.label}
                    </Tab>
                  ))}
                </TabList>

                <TabPanels bg={useColorModeValue('white', 'gray.800')}>
                  {/* Projects Tab */}
                  <TabPanel p={0}>
                    <VStack spacing={8} align="stretch">
                                          {/* Stats Section */}
                    <NetworkingStats stats={stats} />

                    {/* Recommendations and Insights */}
                    <RecommendationsInsights
                      recommendations={recommendations}
                      profile={profile}
                      insights={insights}
                    />
                      
                      {/* Search and Filters */}
                      <EnhancedSearchFilters
                        filters={filters}
                        onFiltersChange={setFilters}
                        onClearFilters={() => setFilters({})}
                        isMobile={isMobile}
                      />
                      
                      {/* Projects Grid */}
                      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                        <AnimatePresence>
                          {visibleRecommendations.map((recommendation) => (
                            <EnhancedProjectCard
                              key={recommendation.project.id}
                              project={recommendation.project}
                              onApply={handleApplyToProject}
                              onBookmark={handleBookmarkProject}
                              onShare={handleShareProject}
                              onView={(projectId) => {
                                // Handle project view
                                console.log('View project:', projectId);
                              }}
                              isBookmarked={bookmarkedProjects.includes(recommendation.project.id)}
                              isLiked={false}
                            />
                          ))}
                        </AnimatePresence>
                      </SimpleGrid>
                    </VStack>
                  </TabPanel>

                  {/* Profile Tab */}
                  <TabPanel p={8}>
                    <VStack spacing={6} align="stretch">
                      {hasProfile ? (
                        <Box>
                          <AnimatedSectionTitle title="Мой профиль" />
                          <ElegantCard p={6}>
                            <NetworkingProfile 
                              userId={user?.uid} 
                              isCurrentUser={true} 
                            />
                          </ElegantCard>
                        </Box>
                      ) : (
                        <Box>
                          <AnimatedSectionTitle 
                            title="Создать профиль"
                            subtitle="Расскажите о себе и станьте частью профессионального сообщества"
                          />
                          <ElegantCard p={6}>
                            <CreateProfileForm
                              onSubmit={handleCreateProfile}
                              onCancel={() => setActiveTab(0)}
                              isLoading={false}
                            />
                          </ElegantCard>
                        </Box>
                      )}
                    </VStack>
                  </TabPanel>

                  {/* Create Project Tab */}
                  <TabPanel p={8}>
                    <VStack spacing={6} align="stretch">
                      <AnimatedSectionTitle 
                        title="Создать проект"
                        subtitle="Опишите свою идею и найдите команду для её реализации"
                      />
                      <ElegantCard p={6}>
                        <CreateProjectForm
                          onSubmit={handleCreateProject}
                          onCancel={() => setActiveTab(0)}
                          isLoading={false}
                        />
                      </ElegantCard>
                    </VStack>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            )}

            {/* Mobile Content */}
            {isMobile && (
              <Box p={4} pb={20}>
                {activeTab === 0 && (
                  <VStack spacing={6} align="stretch">
                    <AnimatedSectionTitle 
                      title="Активные проекты"
                      subtitle="Найдите свою команду"
                    />
                    
                    <VStack spacing={4}>
                      {visibleRecommendations.slice(0, 5).map((recommendation) => (
                        <ElegantProjectCard
                          key={recommendation.project.id}
                          project={recommendation.project}
                          onApply={handleApplyToProject}
                        />
                      ))}
                    </VStack>
                  </VStack>
                )}

                {activeTab === 1 && (
                  <VStack spacing={6} align="stretch">
                    {hasProfile ? (
                      <Box>
                        <AnimatedSectionTitle title="Мой профиль" />
                        <ElegantCard p={4}>
                          <NetworkingProfile 
                            userId={user?.uid} 
                            isCurrentUser={true} 
                          />
                        </ElegantCard>
                      </Box>
                    ) : (
                      <Box>
                        <AnimatedSectionTitle 
                          title="Создать профиль"
                          subtitle="Станьте частью сообщества"
                        />
                        <ElegantCard p={4}>
                          <CreateProjectForm
                            onSubmit={handleCreateProject}
                            onCancel={() => setActiveTab(0)}
                            isLoading={false}
                          />
                        </ElegantCard>
                      </Box>
                    )}
                  </VStack>
                )}

                {activeTab === 2 && (
                  <VStack spacing={6} align="stretch">
                    <AnimatedSectionTitle 
                      title="Создать проект"
                      subtitle="Воплотите свою идею"
                    />
                    <ElegantCard p={4}>
                      <CreateProjectForm
                        onSubmit={handleCreateProject}
                        onCancel={() => setActiveTab(0)}
                        isLoading={false}
                      />
                    </ElegantCard>
                  </VStack>
                )}
              </Box>
            )}
          </ElegantCard>
        </Container>
      </Box>

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <ElegantBottomBar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          hasProfile={hasProfile}
        />
      )}

      {/* Application Modal */}
      <Modal 
        isOpen={isOpen} 
        onClose={onClose} 
        size={modalSize}
        motionPreset="slideInBottom"
      >
        <ModalOverlay backdropFilter="blur(10px)" />
        <ModalContent 
          mx={isMobile ? 2 : 0} 
          bg={useColorModeValue('white', 'gray.800')}
          borderRadius="2xl"
          border="1px solid"
          borderColor={useColorModeValue('gray.200', 'gray.700')}
        >
          <ModalHeader 
            color={useColorModeValue('black', 'white')}
            fontWeight="300"
            fontSize="xl"
          >
            Подать заявку
          </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
            <FormControl>
              <FormLabel color={useColorModeValue('gray.700', 'gray.300')} fontWeight="medium">
                Сопроводительное письмо
              </FormLabel>
                <Textarea
                placeholder="Расскажите о себе и почему хотите участвовать в этом проекте..."
                  value={applicationText}
                  onChange={(e) => setApplicationText(e.target.value)}
                rows={6}
                resize="vertical"
                borderRadius="xl"
                border="1px solid"
                borderColor={useColorModeValue('gray.200', 'gray.700')}
                _hover={{ borderColor: useColorModeValue('gray.300', 'gray.600') }}
                _focus={{ 
                  borderColor: useColorModeValue('black', 'white'), 
                  boxShadow: 'none' 
                }}
                bg={useColorModeValue('white', 'gray.700')}
                color={useColorModeValue('gray.800', 'gray.200')}
              />
            </FormControl>
            </ModalBody>
            <ModalFooter>
            <Button 
              variant="ghost" 
              mr={3} 
              onClick={onClose}
              color={useColorModeValue('gray.600', 'gray.400')}
              _hover={{ bg: useColorModeValue('gray.100', 'gray.700') }}
              borderRadius="full"
            >
                Отмена
              </Button>
            <ElegantButton onClick={handleSubmitApplication}>
                Отправить заявку
            </ElegantButton>
            </ModalFooter>
          </ModalContent>
        </Modal>
    </Box>
  );
};

export default Networking; 