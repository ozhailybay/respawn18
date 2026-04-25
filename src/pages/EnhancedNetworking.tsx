import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Container, Heading, Text, Button, VStack, HStack, Flex, 
  useColorModeValue, Image, Icon, SimpleGrid, Card, CardBody, 
  Badge, Avatar, useToast, Tag, TagLabel, Grid, Circle, 
  Tooltip, IconButton, Modal, ModalOverlay, ModalContent, 
  ModalHeader, ModalCloseButton, ModalBody, ModalFooter, 
  FormControl, FormLabel, Textarea, useDisclosure, Wrap, 
  WrapItem, Spinner, Center, Input, Select, useBreakpointValue, 
  Stack, keyframes, Tabs, TabList, Tab, TabPanels, TabPanel,
  Divider, Progress, Alert, AlertIcon, AlertTitle, AlertDescription,
  Drawer, DrawerBody, DrawerHeader, DrawerOverlay, DrawerContent,
  DrawerCloseButton, List, ListItem, ListIcon, Stat, StatLabel,
  StatNumber, StatHelpText, StatArrow, Breadcrumb, BreadcrumbItem,
  BreadcrumbLink, Menu, MenuButton, MenuList, MenuItem, MenuDivider,
  Popover, PopoverTrigger, PopoverContent, PopoverHeader,
  PopoverBody, PopoverArrow, PopoverCloseButton, Switch,
  Slider, SliderTrack, SliderFilledTrack, SliderThumb, SliderMark,
  Accordion, AccordionItem, AccordionButton, AccordionPanel,
  AccordionIcon, Kbd, Code, LinkBox, LinkOverlay
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
  FaLayerGroup, FaPalette, FaBrain, FaInfinity, FaZap, FaSparkles
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { doc, getDoc, setDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

// Custom Components
import NetworkingProfile from '../components/networking/NetworkingProfile';
import CreateProject from '../components/CreateProject';
import HeaderSection from '../components/HeaderSection';
import PageWrapper from '../components/layout/PageWrapper';
import ErrorBoundary from '../components/layout/ErrorBoundary';

// Motion Components
const MotionBox = motion(Box);
const MotionFlex = motion(Flex);
const MotionCard = motion(Card);
const MotionButton = motion(Button);

// Enhanced Animations
const float = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  25% { transform: translateY(-10px) rotate(1deg); }
  50% { transform: translateY(-5px) rotate(-1deg); }
  75% { transform: translateY(-15px) rotate(0.5deg); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.05); }
`;

const shimmer = keyframes`
  0% { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
`;

const slideInFromBottom = keyframes`
  0% { transform: translateY(100%); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
`;

// Enhanced Floating Particles
const EnhancedFloatingParticles: React.FC = () => {
  const particles = Array.from({ length: 12 }, (_, i) => i);
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];
  
  return (
    <Box position="absolute" inset={0} overflow="hidden" pointerEvents="none" zIndex={0}>
      {particles.map((i) => (
        <MotionBox
          key={i}
          position="absolute"
          animate={{
            y: [0, -50, 0],
            x: [0, Math.random() * 20 - 10, 0],
            opacity: [0.1, 0.6, 0.1],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 8 + i * 1.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.5,
          }}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
        >
          <Circle
            size={`${6 + Math.random() * 12}px`}
            bg={colors[i % colors.length]}
            opacity={0.3}
            filter="blur(1px)"
          />
        </MotionBox>
      ))}
    </Box>
  );
};

// Enhanced Project Card
const EnhancedProjectCard: React.FC<{
  project: any;
  onApply: (projectId: string) => void;
  onBookmark: (projectId: string) => void;
  onShare: (projectId: string) => void;
  isBookmarked?: boolean;
  matchScore?: number;
}> = ({ project, onApply, onBookmark, onShare, isBookmarked = false, matchScore }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  
  const cardBg = useColorModeValue('white', 'gray.800');
  const cardBorder = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'gray.100');
  const mutedColor = useColorModeValue('gray.600', 'gray.400');
  const accentColor = useColorModeValue('blue.500', 'blue.300');
  
  const getMatchColor = (score: number) => {
    if (score >= 90) return 'green.500';
    if (score >= 70) return 'yellow.500';
    if (score >= 50) return 'orange.500';
    return 'red.500';
  };

  return (
    <MotionCard
      bg={cardBg}
      border="1px solid"
      borderColor={cardBorder}
      borderRadius="2xl"
      overflow="hidden"
      position="relative"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ 
        y: -8,
        boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
        scale: 1.02
      }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      cursor="pointer"
    >
      {/* Gradient Overlay */}
      <MotionBox
        position="absolute"
        top={0}
        left={0}
        right={0}
        height="4px"
        bgGradient="linear(to-r, blue.400, purple.500, pink.500)"
        opacity={isHovered ? 1 : 0.7}
        transition="opacity 0.3s ease"
      />
      
      {/* Match Score Badge */}
      {matchScore && (
        <MotionBox
          position="absolute"
          top={4}
          right={4}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Badge
            bg={getMatchColor(matchScore)}
            color="white"
            borderRadius="full"
            px={3}
            py={1}
            fontSize="xs"
            fontWeight="bold"
            boxShadow="lg"
          >
            {matchScore}% совпадение
          </Badge>
        </MotionBox>
      )}

      <CardBody p={6}>
        <VStack align="stretch" spacing={4}>
          {/* Header */}
          <Flex justify="space-between" align="start">
            <VStack align="start" spacing={2} flex={1}>
              <Heading 
                size="md" 
                color={textColor}
                noOfLines={2} 
                fontWeight="600"
                lineHeight="1.3"
              >
                {project.title}
              </Heading>
              <HStack spacing={2}>
                <Badge 
                  colorScheme="blue" 
                  variant="subtle"
                  fontSize="xs"
                  px={2}
                  py={1}
                  borderRadius="full"
                >
                  {project.category}
                </Badge>
                <Badge 
                  colorScheme={project.status === 'active' ? 'green' : 'yellow'}
                  fontSize="xs"
                  px={2}
                  py={1}
                  borderRadius="full"
                >
                  {project.status === 'active' ? 'Активен' : 'Набор'}
                </Badge>
              </HStack>
            </VStack>
          </Flex>

          {/* Description */}
          <Text 
            fontSize="sm" 
            color={mutedColor} 
            noOfLines={3}
            lineHeight="1.6"
          >
            {project.description}
          </Text>

          {/* Tags */}
          <Wrap spacing={2}>
            {project.tags?.slice(0, 4).map((tag: string, index: number) => (
              <WrapItem key={index}>
                <Tag
                  size="sm"
                  colorScheme="gray"
                  variant="subtle"
                  borderRadius="full"
                  px={3}
                  py={1}
                  fontSize="xs"
                  fontWeight="medium"
                >
                  {tag}
                </Tag>
              </WrapItem>
            ))}
            {project.tags?.length > 4 && (
              <Tag 
                size="sm"
                colorScheme="gray"
                variant="outline"
                borderRadius="full" 
                px={3} 
                py={1}
                fontSize="xs"
              >
                +{project.tags.length - 4}
              </Tag>
            )}
          </Wrap>

          {/* Stats */}
          <HStack spacing={4} fontSize="xs" color={mutedColor}>
            <HStack spacing={1}>
              <Icon as={FaUsers} />
              <Text>Команда: {project.teamSize || 3-5}</Text>
            </HStack>
            <HStack spacing={1}>
              <Icon as={FaClock} />
              <Text>Срок: {project.duration || '3-6 мес'}</Text>
            </HStack>
            <HStack spacing={1}>
              <Icon as={FaMapMarkerAlt} />
              <Text>{project.location || 'Удаленно'}</Text>
            </HStack>
          </HStack>

          {/* Footer */}
          <Flex justify="space-between" align="center" pt={2}>
            <HStack spacing={3}>
              <Avatar 
                size="sm" 
                name={project.author}
                src={project.authorAvatar}
                border="2px solid"
                borderColor={accentColor}
              />
              <VStack align="start" spacing={0}>
                <Text fontSize="sm" fontWeight="medium" color={textColor}>
                  {project.author}
                </Text>
                <Text fontSize="xs" color={mutedColor}>
                  {project.authorRole || 'Руководитель проекта'}
                </Text>
              </VStack>
            </HStack>
            
            <HStack spacing={2}>
              <IconButton
                aria-label="Поделиться"
                icon={<FaShare />}
                size="sm"
                variant="ghost"
                colorScheme="gray"
                onClick={(e) => {
                  e.stopPropagation();
                  onShare(project.id);
                }}
              />
              <IconButton
                aria-label={isBookmarked ? "Убрать из закладок" : "Добавить в закладки"}
                icon={<FaBookmark />}
                size="sm"
                variant="ghost"
                colorScheme={isBookmarked ? "blue" : "gray"}
                onClick={(e) => {
                  e.stopPropagation();
                  onBookmark(project.id);
                }}
              />
              <MotionButton
                size="sm"
                colorScheme="blue"
                borderRadius="full"
                onClick={(e) => {
                  e.stopPropagation();
                  onApply(project.id);
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                leftIcon={<FaHandshake />}
              >
                Присоединиться
              </MotionButton>
            </HStack>
          </Flex>
        </VStack>
      </CardBody>
    </MotionCard>
  );
};

// Enhanced Filter Panel
const EnhancedFilterPanel: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  filters: any;
  onFiltersChange: (filters: any) => void;
}> = ({ isOpen, onClose, filters, onFiltersChange }) => {
  const categories = [
    'Все', 'Искусственный интеллект', 'Веб-разработка', 'Мобильные приложения',
    'Блокчейн', 'Кибербезопасность', 'Аналитика данных', 'UI/UX дизайн',
    'DevOps', 'Облачные технологии', 'IoT', 'Игровая разработка'
  ];

  const locations = ['Все', 'Удаленно', 'Москва', 'Санкт-Петербург', 'Новосибирск', 'Екатеринбург'];
  const teamSizes = ['Любой', '1-3', '4-6', '7-10', '10+'];
  const durations = ['Любой', '1-3 мес', '3-6 мес', '6-12 мес', '1+ год'];

  return (
    <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader borderBottomWidth="1px">
          <HStack spacing={3}>
            <Icon as={FaFilter} color="blue.500" />
            <Text>Фильтры</Text>
          </HStack>
        </DrawerHeader>

        <DrawerBody>
          <VStack spacing={6} align="stretch">
            {/* Category Filter */}
            <Box>
              <Text fontWeight="medium" mb={3}>Категория</Text>
              <Wrap spacing={2}>
                {categories.map((category) => (
                  <WrapItem key={category}>
                    <Tag
                      size="md"
                      variant={filters.category === category ? "solid" : "outline"}
                      colorScheme="blue"
                      cursor="pointer"
                      onClick={() => onFiltersChange({ ...filters, category })}
                    >
                      {category}
                    </Tag>
                  </WrapItem>
                ))}
              </Wrap>
            </Box>

            {/* Location Filter */}
            <Box>
              <Text fontWeight="medium" mb={3}>Локация</Text>
              <Select
                value={filters.location}
                onChange={(e) => onFiltersChange({ ...filters, location: e.target.value })}
              >
                {locations.map((location) => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </Select>
            </Box>

            {/* Team Size Filter */}
            <Box>
              <Text fontWeight="medium" mb={3}>Размер команды</Text>
              <Select
                value={filters.teamSize}
                onChange={(e) => onFiltersChange({ ...filters, teamSize: e.target.value })}
              >
                {teamSizes.map((size) => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </Select>
            </Box>

            {/* Duration Filter */}
            <Box>
              <Text fontWeight="medium" mb={3}>Длительность проекта</Text>
              <Select
                value={filters.duration}
                onChange={(e) => onFiltersChange({ ...filters, duration: e.target.value })}
              >
                {durations.map((duration) => (
                  <option key={duration} value={duration}>{duration}</option>
                ))}
              </Select>
            </Box>

            {/* Match Score Filter */}
            <Box>
              <Text fontWeight="medium" mb={3}>Минимальное совпадение: {filters.minMatchScore}%</Text>
              <Slider
                value={filters.minMatchScore}
                onChange={(value) => onFiltersChange({ ...filters, minMatchScore: value })}
                min={0}
                max={100}
                step={10}
              >
                <SliderTrack>
                  <SliderFilledTrack bg="blue.500" />
                </SliderTrack>
                <SliderThumb />
              </Slider>
            </Box>

            {/* Clear Filters */}
            <Button
              variant="outline"
              colorScheme="red"
              onClick={() => onFiltersChange({
                category: 'Все',
                location: 'Все',
                teamSize: 'Любой',
                duration: 'Любой',
                minMatchScore: 0
              })}
            >
              Сбросить фильтры
            </Button>
          </VStack>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};

// Main Component
const EnhancedNetworking: React.FC = () => {
  const [user] = useAuthState(auth);
  const [activeTab, setActiveTab] = useState(0);
  const [hasProfile, setHasProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [applicationText, setApplicationText] = useState('');
  const [bookmarkedProjects, setBookmarkedProjects] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    category: 'Все',
    location: 'Все',
    teamSize: 'Любой',
    duration: 'Любой',
    minMatchScore: 0
  });
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isFilterOpen, onOpen: onFilterOpen, onClose: onFilterClose } = useDisclosure();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Responsive values
  const isMobile = useBreakpointValue({ base: true, md: false });
  const containerMaxW = useBreakpointValue({ base: "100%", md: "container.xl" });
  const containerPx = useBreakpointValue({ base: 4, md: 8 });

  // Enhanced mock data with more details
  const projects = useMemo(() => [
    {
      id: 1,
      title: "AI Платформа для Персонализированного Обучения",
      description: "Разрабатываем инновационную образовательную платформу с использованием машинного обучения для создания персонализированных учебных программ. Интеграция с VR/AR технологиями для иммерсивного обучения.",
      category: "Искусственный интеллект",
      status: "active",
      author: "Алексей Иванов",
      authorRole: "AI Research Lead",
      authorAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      tags: ["React", "Python", "TensorFlow", "Firebase", "TypeScript", "VR"],
      teamSize: "4-6",
      duration: "6-12 мес",
      location: "Удаленно",
      matchScore: 95
    },
    {
      id: 2,
      title: "Децентрализованная Финансовая Платформа",
      description: "Создаем DeFi протокол для безопасного кредитования и инвестирования с использованием смарт-контрактов. Интеграция с множественными блокчейнами и продвинутая аналитика рисков.",
      category: "Блокчейн",
      status: "active",
      author: "Мария Петрова",
      authorRole: "Blockchain Architect",
      authorAvatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      tags: ["Solidity", "React", "Node.js", "Ethereum", "Web3"],
      teamSize: "3-5",
      duration: "3-6 мес",
      location: "Москва",
      matchScore: 87
    },
    {
      id: 3,
      title: "Экологический Мониторинг с IoT",
      description: "Система мониторинга окружающей среды с использованием IoT датчиков и машинного обучения для предсказания экологических изменений. Мобильное приложение для гражданского мониторинга.",
      category: "IoT",
      status: "recruiting",
      author: "Дмитрий Сидоров",
      authorRole: "IoT Engineer",
      authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      tags: ["Arduino", "Python", "Flutter", "AWS", "Machine Learning"],
      teamSize: "5-8",
      duration: "6-12 мес",
      location: "Санкт-Петербург",
      matchScore: 72
    },
    {
      id: 4,
      title: "Кибербезопасность для Малого Бизнеса",
      description: "Комплексное решение для защиты малого и среднего бизнеса от киберугроз. Включает мониторинг, обнаружение вторжений и автоматическое реагирование на инциденты.",
      category: "Кибербезопасность",
      status: "active",
      author: "Анна Смирнова",
      authorRole: "Security Expert",
      authorAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      tags: ["Python", "Docker", "Kubernetes", "ELK Stack", "SIEM"],
      teamSize: "3-4",
      duration: "3-6 мес",
      location: "Удаленно",
      matchScore: 89
    },
    {
      id: 5,
      title: "Платформа для Управления Творческими Проектами",
      description: "Специализированная платформа для творческих команд с инструментами планирования, коллаборации и монетизации. Интеграция с социальными сетями и платежными системами.",
      category: "UI/UX дизайн",
      status: "recruiting",
      author: "Елена Козлова",
      authorRole: "Creative Director",
      authorAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
      tags: ["Figma", "React", "Node.js", "Stripe", "Social APIs"],
      teamSize: "4-7",
      duration: "6-12 мес",
      location: "Новосибирск",
      matchScore: 78
    },
    {
      id: 6,
      title: "Аналитика Больших Данных для Здравоохранения",
      description: "Система анализа медицинских данных для улучшения диагностики и персонализированного лечения. Интеграция с медицинскими устройствами и базами данных.",
      category: "Аналитика данных",
      status: "active",
      author: "Сергей Волков",
      authorRole: "Data Scientist",
      authorAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
      tags: ["Python", "R", "TensorFlow", "PostgreSQL", "Docker"],
      teamSize: "6-10",
      duration: "1+ год",
      location: "Москва",
      matchScore: 91
    }
  ], []);

  // Filtered projects
  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      if (filters.category !== 'Все' && project.category !== filters.category) return false;
      if (filters.location !== 'Все' && project.location !== filters.location) return false;
      if (filters.teamSize !== 'Любой' && project.teamSize !== filters.teamSize) return false;
      if (filters.duration !== 'Любой' && project.duration !== filters.duration) return false;
      if (project.matchScore && project.matchScore < filters.minMatchScore) return false;
      return true;
    });
  }, [projects, filters]);

  useEffect(() => {
    if (user) {
      checkProfileExists();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const checkProfileExists = async () => {
    if (!user) return;
    
    try {
      const docRef = doc(db, 'networkingProfiles', user.uid);
      const docSnap = await getDoc(docRef);
      setHasProfile(docSnap.exists());
    } catch (error) {
      console.error('Error checking profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyToProject = (projectId: string) => {
    const project = projects.find(p => p.id === parseInt(projectId));
    setSelectedProject(project);
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
    const project = projects.find(p => p.id === parseInt(projectId));
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
      await new Promise(resolve => setTimeout(resolve, 1000));
      
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
        <EnhancedFloatingParticles />
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
      <EnhancedFloatingParticles />

      {/* Enhanced Hero Section */}
      <Box py={12} position="relative" zIndex={2}>
        <Container maxW={containerMaxW} px={containerPx}>
          <MotionBox
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            textAlign="center"
            mb={8}
          >
            <VStack spacing={8}>
              {/* Main title with enhanced styling */}
              <VStack spacing={4}>
                <MotionBox
                  animate={{ 
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                  bgGradient="linear(to-r, blue.400, purple.500, pink.500, blue.400)"
                  bgSize="200% 200%"
                  bgClip="text"
                >
                  <Heading
                    as="h1"
                    fontSize={{ base: "4xl", md: "6xl", lg: "7xl" }}
                    fontWeight="900"
                    letterSpacing="tight"
                    lineHeight="1.1"
                  >
                    Нетворкинг
                  </Heading>
                </MotionBox>
                <Text 
                  fontSize={{ base: "xl", md: "2xl", lg: "3xl" }} 
                  color={useColorModeValue('gray.600', 'gray.400')}
                  fontWeight="300"
                  maxW="3xl"
                  mx="auto"
                >
                  Находите единомышленников и создавайте будущее вместе
                </Text>
              </VStack>

              {/* Stats */}
              <HStack spacing={8} justify="center" flexWrap="wrap">
                <Stat textAlign="center">
                  <StatNumber color="blue.500" fontSize="2xl" fontWeight="bold">
                    {projects.length}+
                  </StatNumber>
                  <StatLabel color={useColorModeValue('gray.600', 'gray.400')}>
                    Активных проектов
                  </StatLabel>
                </Stat>
                <Stat textAlign="center">
                  <StatNumber color="green.500" fontSize="2xl" fontWeight="bold">
                    150+
                  </StatNumber>
                  <StatLabel color={useColorModeValue('gray.600', 'gray.400')}>
                    Участников
                  </StatLabel>
                </Stat>
                <Stat textAlign="center">
                  <StatNumber color="purple.500" fontSize="2xl" fontWeight="bold">
                    89%
                  </StatNumber>
                  <StatLabel color={useColorModeValue('gray.600', 'gray.400')}>
                    Успешных проектов
                  </StatLabel>
                </Stat>
              </HStack>

              {/* Action buttons */}
              <HStack spacing={4} justify="center" flexWrap="wrap">
                <MotionButton
                  size="lg"
                  colorScheme="blue"
                  borderRadius="full"
                  px={8}
                  py={6}
                  fontSize="lg"
                  fontWeight="semibold"
                  leftIcon={<FaRocket />}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveTab(0)}
                >
                  Найти проекты
                </MotionButton>
                <MotionButton
                  size="lg"
                  variant="outline"
                  colorScheme="blue"
                  borderRadius="full"
                  px={8}
                  py={6}
                  fontSize="lg"
                  fontWeight="semibold"
                  leftIcon={<FaPlus />}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveTab(2)}
                >
                  Создать проект
                </MotionButton>
              </HStack>
            </VStack>
          </MotionBox>
        </Container>
      </Box>

      {/* Main Content */}
      <Box py={8} minH="calc(100vh - 300px)" position="relative" zIndex={2}>
        <Container maxW={containerMaxW} px={containerPx}>
          <Tabs 
            isFitted
            onChange={setActiveTab} 
            index={activeTab}
            variant="enclosed"
            size="lg"
          >
            <TabList 
              bg={useColorModeValue('white', 'gray.800')} 
              borderColor={useColorModeValue('gray.200', 'gray.700')}
              borderRadius="xl"
              mb={6}
              boxShadow="lg"
            >
              {[
                { label: 'Проекты', icon: FaRocket, index: 0 },
                { label: hasProfile ? 'Мой профиль' : 'Создать профиль', icon: FaUserAlt, index: 1 },
                { label: 'Создать проект', icon: FaPlus, index: 2 }
              ].map((tab) => (
                <Tab 
                  key={tab.index}
                  py={4} 
                  fontWeight="semibold"
                  color={useColorModeValue('gray.600', 'gray.400')}
                  _selected={{ 
                    color: useColorModeValue('blue.600', 'blue.300'),
                    borderColor: useColorModeValue('blue.500', 'blue.300'),
                    bg: useColorModeValue('blue.50', 'blue.900')
                  }}
                  _hover={{ 
                    color: useColorModeValue('blue.600', 'blue.300')
                  }}
                  transition="all 0.2s ease"
                >
                  <HStack spacing={2}>
                    <Icon as={tab.icon} />
                    <Text>{tab.label}</Text>
                  </HStack>
                </Tab>
              ))}
            </TabList>

            <TabPanels>
              {/* Projects Tab */}
              <TabPanel p={0}>
                <VStack spacing={8} align="stretch">
                  {/* Search and Filter Bar */}
                  <Flex 
                    justify="space-between" 
                    align="center" 
                    flexWrap="wrap"
                    gap={4}
                  >
                    <HStack spacing={4} flex={1} minW="300px">
                      <Input
                        placeholder="Поиск проектов..."
                        size="lg"
                        borderRadius="full"
                        leftIcon={<FaSearch />}
                        bg={useColorModeValue('white', 'gray.800')}
                        border="2px solid"
                        borderColor={useColorModeValue('gray.200', 'gray.700')}
                        _focus={{
                          borderColor: 'blue.500',
                          boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)'
                        }}
                      />
                    </HStack>
                    
                    <HStack spacing={3}>
                      <MotionButton
                        variant="outline"
                        leftIcon={<FaFilter />}
                        onClick={onFilterOpen}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Фильтры
                      </MotionButton>
                      <MotionButton
                        variant="outline"
                        leftIcon={<FaSort />}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Сортировка
                      </MotionButton>
                    </HStack>
                  </Flex>

                  {/* Active Filters */}
                  {Object.values(filters).some(value => value !== 'Все' && value !== 'Любой' && value !== 0) && (
                    <Alert status="info" borderRadius="lg">
                      <AlertIcon />
                      <Box>
                        <AlertTitle>Активные фильтры:</AlertTitle>
                        <AlertDescription>
                          {Object.entries(filters)
                            .filter(([_, value]) => value !== 'Все' && value !== 'Любой' && value !== 0)
                            .map(([key, value]) => `${key}: ${value}`)
                            .join(', ')}
                        </AlertDescription>
                      </Box>
                    </Alert>
                  )}

                  {/* Projects Grid */}
                  <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                    <AnimatePresence>
                      {filteredProjects.map((project) => (
                        <EnhancedProjectCard
                          key={project.id}
                          project={project}
                          onApply={handleApplyToProject}
                          onBookmark={handleBookmarkProject}
                          onShare={handleShareProject}
                          isBookmarked={bookmarkedProjects.includes(project.id.toString())}
                          matchScore={project.matchScore}
                        />
                      ))}
                    </AnimatePresence>
                  </SimpleGrid>

                  {/* Empty State */}
                  {filteredProjects.length === 0 && (
                    <Center py={12}>
                      <VStack spacing={4}>
                        <Icon as={FaSearch} boxSize={12} color="gray.400" />
                        <Text fontSize="lg" color="gray.500">
                          Проекты не найдены
                        </Text>
                        <Text color="gray.400">
                          Попробуйте изменить фильтры или поисковый запрос
                        </Text>
                      </VStack>
                    </Center>
                  )}
                </VStack>
              </TabPanel>

              {/* Profile Tab */}
              <TabPanel p={0}>
                <VStack spacing={6} align="stretch">
                  {hasProfile ? (
                    <Box>
                      <Heading size="lg" mb={6}>Мой профиль</Heading>
                      <Card>
                        <CardBody>
                          <NetworkingProfile 
                            userId={user?.uid} 
                            isCurrentUser={true} 
                          />
                        </CardBody>
                      </Card>
                    </Box>
                  ) : (
                    <Box>
                      <Heading size="lg" mb={6}>Создать профиль</Heading>
                      <Card>
                        <CardBody>
                          <CreateProject />
                        </CardBody>
                      </Card>
                    </Box>
                  )}
                </VStack>
              </TabPanel>

              {/* Create Project Tab */}
              <TabPanel p={0}>
                <VStack spacing={6} align="stretch">
                  <Heading size="lg" mb={6}>Создать проект</Heading>
                  <Card>
                    <CardBody>
                      <CreateProject />
                    </CardBody>
                  </Card>
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Container>
      </Box>

      {/* Filter Panel */}
      <EnhancedFilterPanel
        isOpen={isFilterOpen}
        onClose={onFilterClose}
        filters={filters}
        onFiltersChange={setFilters}
      />

      {/* Application Modal */}
      <Modal 
        isOpen={isOpen} 
        onClose={onClose} 
        size="lg"
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
            fontWeight="600"
            fontSize="xl"
          >
            Подать заявку на проект
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedProject && (
              <VStack spacing={4} align="stretch" mb={6}>
                <Heading size="md" color={useColorModeValue('gray.800', 'gray.100')}>
                  {selectedProject.title}
                </Heading>
                <Text color={useColorModeValue('gray.600', 'gray.400')}>
                  {selectedProject.description}
                </Text>
                <HStack spacing={2}>
                  <Badge colorScheme="blue">{selectedProject.category}</Badge>
                  <Badge colorScheme="green">{selectedProject.status}</Badge>
                </HStack>
              </VStack>
            )}
            
            <FormControl>
              <FormLabel color={useColorModeValue('gray.700', 'gray.300')} fontWeight="medium">
                Сопроводительное письмо
              </FormLabel>
              <Textarea
                placeholder="Расскажите о себе, своем опыте и почему хотите участвовать в этом проекте..."
                value={applicationText}
                onChange={(e) => setApplicationText(e.target.value)}
                rows={6}
                resize="vertical"
                borderRadius="xl"
                border="2px solid"
                borderColor={useColorModeValue('gray.200', 'gray.700')}
                _hover={{ borderColor: useColorModeValue('gray.300', 'gray.600') }}
                _focus={{ 
                  borderColor: 'blue.500', 
                  boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)' 
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
            <MotionButton 
              colorScheme="blue"
              onClick={handleSubmitApplication}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              borderRadius="full"
            >
              Отправить заявку
            </MotionButton>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default EnhancedNetworking; 