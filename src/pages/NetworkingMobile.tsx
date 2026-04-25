import React, { useState, useEffect } from 'react';
import {
  Box, Container, Heading, Text, Tabs, TabList, Tab, TabPanels, TabPanel,
  Button, VStack, HStack, Flex, useColorModeValue, Image, Icon, SimpleGrid,
  Card, CardBody, Divider, Badge, Avatar, Link as ChakraLink, useToast,
  Tag, TagLabel, TagLeftIcon, Grid, Circle, Tooltip, IconButton, Modal, 
  ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, 
  ModalFooter, FormControl, FormLabel, Textarea, useDisclosure,
  Wrap, WrapItem, Spinner, Center, Input, Select, TagCloseButton,
  useBreakpointValue, Stack
} from '@chakra-ui/react';
import { 
  FaUserAlt, FaBriefcase, FaStar, FaRobot, FaUsers, FaLightbulb, 
  FaRegLightbulb, FaArrowRight, FaGlobe, FaRocket, FaCode, FaHandshake,
  FaPen, FaNetworkWired, FaLaptopCode, FaGraduationCap, FaTools, FaPlus
} from 'react-icons/fa';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import NetworkingProfile from '../components/networking/NetworkingProfile';
import CreateProject from '../components/CreateProject';
import RecommendedProjects from '../components/RecommendedProjects';
import HeaderSection from '../components/HeaderSection';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { professionKeywords } from '../components/shadowing/catalog';
import { SHADOW_FIRST_LOGIN_KEY } from '../components/shadowing/storage';

// @ts-ignore - motion() works with Chakra UI components
// @ts-ignore - motion() works with Chakra UI components
const MotionBox = motion(Box);
// @ts-ignore - motion() works with Chakra UI components
// @ts-ignore - motion() works with Chakra UI components
const MotionCard = motion(Card);

// Mobile-optimized Project Card Component
const MobileProjectCard: React.FC<{
  project: any;
  onApply: (projectId: string) => void;
}> = ({ project, onApply }) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.700', 'gray.300');
  
  return (
    <MotionCard
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      bg={cardBg}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="xl"
      overflow="hidden"
      shadow="sm"
      _hover={{ shadow: "md" }}
      transition="all 0.3s"
      w="full"
    >
      <CardBody p={4}>
        <VStack align="stretch" spacing={3}>
          {/* Header */}
          <Flex justify="space-between" align="start">
            <VStack align="start" spacing={1} flex={1}>
              <Heading size="sm" color={textColor} noOfLines={2}>
                {project.title}
              </Heading>
              <Text fontSize="xs" color="gray.500">
                {project.category}
              </Text>
            </VStack>
            <Badge 
              colorScheme={project.status === 'active' ? 'green' : 'gray'}
              fontSize="xs"
              px={2}
              py={1}
              borderRadius="full"
            >
              {project.status}
            </Badge>
          </Flex>

          {/* Description */}
          <Text fontSize="sm" color={textColor} noOfLines={3}>
            {project.description}
          </Text>

          {/* Tags */}
          <Wrap spacing={1}>
            {project.tags?.slice(0, 3).map((tag: string, index: number) => (
              <WrapItem key={index}>
                <Badge
                  colorScheme="teal"
                  fontSize="xs"
                  borderRadius="full"
                  px={2}
                  py={0.5}
                >
                  {tag}
                </Badge>
              </WrapItem>
            ))}
            {project.tags?.length > 3 && (
              <Badge colorScheme="gray" fontSize="xs" borderRadius="full" px={2} py={0.5}>
                +{project.tags.length - 3}
              </Badge>
            )}
          </Wrap>

          {/* Footer */}
          <Flex justify="space-between" align="center" pt={2}>
            <HStack spacing={2}>
              <Avatar size="xs" name={project.author} />
              <Text fontSize="xs" color="gray.500" noOfLines={1}>
                {project.author}
              </Text>
            </HStack>
            <Button
              size="sm"
              colorScheme="gray"
              variant="outline"
              borderRadius="full"
              onClick={() => onApply(project.id)}
              px={4}
            >
              Откликнуться
            </Button>
          </Flex>
        </VStack>
      </CardBody>
    </MotionCard>
  );
};

// Mobile Bottom Navigation Bar
const MobileBottomBar: React.FC<{
  activeTab: number;
  onTabChange: (index: number) => void;
  hasProfile: boolean;
}> = ({ activeTab, onTabChange, hasProfile }) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  const tabs = [
    { label: 'Проекты', icon: FaBriefcase },
    { label: hasProfile ? 'Профиль' : 'Создать', icon: FaUserAlt },
    { label: 'Создать', icon: FaPlus }
  ];

  return (
    <Box
      position="fixed"
      bottom={0}
      left={0}
      right={0}
      bg={bgColor}
      borderTopWidth="1px"
      borderColor={borderColor}
      p={2}
      zIndex={1000}
      display={{ base: 'block', md: 'none' }}
      shadow="lg"
    >
      <HStack justify="space-around">
        {tabs.map((tab, index) => (
          <Button
            key={index}
            variant={activeTab === index ? 'solid' : 'ghost'}
            colorScheme={activeTab === index ? 'gray' : 'gray'}
            size="sm"
            onClick={() => onTabChange(index)}
            leftIcon={<Icon as={tab.icon} />}
            borderRadius="full"
            minW="80px"
            fontSize="xs"
          >
            {tab.label}
          </Button>
        ))}
      </HStack>
    </Box>
  );
};

// Animated Section Title
const AnimatedSectionTitle: React.FC<{title: string; subtitle?: string}> = ({ title, subtitle }) => {
  return (
    <MotionBox
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      mb={{ base: 4, md: 6 }}
    >
      <Heading
        as="h2"
        fontSize={{ base: "lg", md: "xl", lg: "2xl" }}
        bgGradient="linear(to-r, black, gray.700)"
        bgClip="text"
        letterSpacing="tight"
        mb={2}
        textAlign={{ base: "center", md: "left" }}
      >
        {title}
      </Heading>
      {subtitle && (
        <Text 
          fontSize={{ base: "sm", md: "md" }} 
          color="gray.600" 
          _dark={{ color: "gray.300" }}
          textAlign={{ base: "center", md: "left" }}
        >
          {subtitle}
        </Text>
      )}
    </MotionBox>
  );
};

const NetworkingMobile: React.FC = () => {
  const [user] = useAuthState(auth);
  const [activeTab, setActiveTab] = useState(0);
  const [hasProfile, setHasProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [applicationText, setApplicationText] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [shadowProfessionFilter, setShadowProfessionFilter] = useState<string | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const navigate = useNavigate();
  
  // Mobile-first responsive values
  const isMobile = useBreakpointValue({ base: true, md: false });
  const containerMaxW = useBreakpointValue({ base: 'full', md: 'container.xl' });
  const containerPx = useBreakpointValue({ base: 3, sm: 4, md: 8 });
  const modalSize = useBreakpointValue({ base: 'full', md: 'lg' });
  const cardSpacing = useBreakpointValue({ base: 4, md: 6 });
  const headerPy = useBreakpointValue({ base: 6, md: 12, lg: 20 });
  
  // Theme colors
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const accentColor = useColorModeValue('black', 'white');

  // Mock data for projects
  const [projects] = useState([
    {
      id: '1',
      title: 'Мобильное приложение для изучения языков',
      description: 'Разрабатываем инновативное приложение с ИИ для персонализированного изучения языков',
      category: 'Mobile Development',
      tags: ['React Native', 'TypeScript', 'AI/ML', 'Firebase'],
      author: 'Анна Петрова',
      status: 'active',
      participants: 3,
      maxParticipants: 5
    },
    {
      id: '2',
      title: 'Платформа для фриланс-проектов',
      description: 'Создаем современную платформу для поиска и управления фриланс-проектами',
      category: 'Web Development',
      tags: ['Next.js', 'PostgreSQL', 'Prisma', 'TailwindCSS'],
      author: 'Дмитрий Козлов',
      status: 'active',
      participants: 2,
      maxParticipants: 4
    },
    {
      id: '3',
      title: 'ИИ-ассистент для анализа данных',
      description: 'Разработка умного помощника для автоматизации анализа больших данных',
      category: 'Data Science',
      tags: ['Python', 'TensorFlow', 'FastAPI', 'Docker'],
      author: 'Мария Сидорова',
      status: 'recruiting',
      participants: 1,
      maxParticipants: 3
    }
  ]);

  const filteredProjects = React.useMemo(() => {
    if (!shadowProfessionFilter) return projects;
    const keywords = professionKeywords(shadowProfessionFilter).map((item) => item.toLowerCase());
    return projects.filter((project) => {
      const source = [project.title, project.description, project.category, ...(project.tags || [])]
        .join(' ')
        .toLowerCase();
      return keywords.some((keyword) => source.includes(keyword));
    });
  }, [projects, shadowProfessionFilter]);

  // Effects
  useEffect(() => {
    checkProfileExists();
  }, [user]);

  useEffect(() => {
    // Add padding to body for mobile bottom bar
    if (isMobile) {
      document.body.style.paddingBottom = '80px';
    } else {
      document.body.style.paddingBottom = '0';
    }
    
    return () => {
      document.body.style.paddingBottom = '0';
    };
  }, [isMobile]);

  useEffect(() => {
    const profession = localStorage.getItem(SHADOW_FIRST_LOGIN_KEY);
    if (!profession) return;
    setShadowProfessionFilter(profession);
    localStorage.removeItem(SHADOW_FIRST_LOGIN_KEY);
  }, []);

  // Handlers
  const checkProfileExists = async () => {
    if (user) {
      try {
        const profileRef = doc(db, 'networkingProfiles', user.uid);
        const profileSnap = await getDoc(profileRef);
        
        setHasProfile(profileSnap.exists());
        setIsLoading(false);
      } catch (error) {
        console.error('Error checking profile:', error);
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  };

  const handleTabChange = (index: number) => {
    setActiveTab(index);
  };

  const handleApplyToProject = (projectId: string) => {
    if (!user) {
      toast({
        title: 'Авторизация қажет',
        description: 'Жобаларға қатысу үшін жүйеге кіріңіз',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      navigate('/login');
      return;
    }

    if (!hasProfile) {
      toast({
        title: 'Профиль жасаңыз',
        description: 'Жобаларға қатысу үшін профиль жасау қажет',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
      setActiveTab(1);
      return;
    }

    setSelectedProjectId(projectId);
    onOpen();
  };

  const handleCreateProfile = async (profileData: any) => {
    if (!user) return;
    
    try {
      const profileRef = doc(db, 'networkingProfiles', user.uid);
      await setDoc(profileRef, {
        ...profileData,
        userId: user.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      setHasProfile(true);
      toast({
        title: 'Профиль жасалды!',
        description: 'Енді сіз жобаларға қатыса аласыз',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error creating profile:', error);
      toast({
        title: 'Қате',
        description: 'Профиль жасау мүмкін емес',
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
      <Center minH="100vh">
        <Spinner size="xl" color={useColorModeValue('black', 'white')} />
      </Center>
    );
  }

  return (
    <Box minH="100vh" pb={{ base: "80px", md: 0 }}>
      {/* Header Section - Mobile Optimized */}
      <Box 
        py={headerPy} 
        bgGradient={useColorModeValue("linear(to-br, gray.100, white)", "linear(to-br, gray.800, black)")}
        color="white"
        position="relative"
        overflow="hidden"
      >
        <Container maxW={containerMaxW} px={containerPx}>
          <VStack spacing={{ base: 4, md: 6 }} textAlign="center">
            <MotionBox
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Heading 
                fontSize={{ base: "2xl", md: "4xl", lg: "5xl" }}
                fontWeight="bold"
                letterSpacing="tight"
                mb={2}
              >
                Нетворкинг
              </Heading>
              <Text 
                fontSize={{ base: "md", md: "xl" }}
                opacity={0.9}
                maxW="600px"
                mx="auto"
              >
                Найдите единомышленников и создавайте проекты вместе
              </Text>
            </MotionBox>
          </VStack>
        </Container>
      </Box>

      {/* Main Content */}
      <Box py={cardSpacing} bg={bgColor} minH="calc(100vh - 200px)">
        <Container maxW={containerMaxW} px={containerPx}>
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            bg={cardBg} 
            borderRadius={{ base: "lg", md: "xl" }}
            boxShadow={{ base: "sm", md: "md" }}
            overflow="hidden"
            borderWidth="1px"
            borderColor={borderColor}
          >
            {/* Desktop Tabs */}
            {!isMobile && (
              <Tabs 
                isFitted
                colorScheme="gray" 
                onChange={handleTabChange} 
                index={activeTab}
                variant="enclosed"
              >
                <TabList>
                  <Tab py={4} fontWeight="medium">
                    Проекты
                  </Tab>
                  <Tab py={4} fontWeight="medium">
                    {hasProfile ? "Мой профиль" : "Создать профиль"}
                  </Tab>
                  <Tab py={4} fontWeight="medium">
                    Создать проект
                  </Tab>
                </TabList>

                <TabPanels>
                  {/* Projects Tab */}
                  <TabPanel p={6}>
                    <VStack spacing={6} align="stretch">
                      <AnimatedSectionTitle 
                        title="Активные проекты"
                        subtitle="Найдите интересный проект и присоединяйтесь к команде"
                      />
                      
                      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={4}>
                        {filteredProjects.map((project) => (
                          <MobileProjectCard
                            key={project.id}
                            project={project}
                            onApply={handleApplyToProject}
                          />
                        ))}
                      </SimpleGrid>
                    </VStack>
                  </TabPanel>

                  {/* Profile Tab */}
                  <TabPanel p={6}>
                    <VStack spacing={6} align="stretch">
                      {hasProfile ? (
                        <Box>
                          <Heading size="lg" mb={4} color={accentColor}>
                            Мой профиль
                          </Heading>
                          <NetworkingProfile 
                            userId={user?.uid} 
                            isCurrentUser={true} 
                          />
                        </Box>
                      ) : (
                        <Box>
                          <Heading size="lg" mb={2} color={accentColor}>
                            Создать профиль
                          </Heading>
                          <Text color="gray.600" mb={6}>
                            Создайте свой профиль для участия в проектах
                          </Text>
                          <CreateProject onSubmit={handleCreateProfile} />
                        </Box>
                      )}
                    </VStack>
                  </TabPanel>

                  {/* Create Project Tab */}
                  <TabPanel p={6}>
                    <VStack spacing={6} align="stretch">
                      <AnimatedSectionTitle 
                        title="Создать новый проект"
                        subtitle="Опишите свою идею и найдите команду для реализации"
                      />
                      <CreateProject />
                    </VStack>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            )}

            {/* Mobile Content */}
            {isMobile && (
              <Box p={4}>
                {activeTab === 0 && (
                  <VStack spacing={4} align="stretch">
                    <AnimatedSectionTitle 
                      title="Активные проекты"
                      subtitle="Найдите интересный проект"
                    />
                    
                    <VStack spacing={3}>
                      {filteredProjects.map((project) => (
                        <MobileProjectCard
                          key={project.id}
                          project={project}
                          onApply={handleApplyToProject}
                        />
                      ))}
                    </VStack>
                  </VStack>
                )}

                {activeTab === 1 && (
                  <VStack spacing={4} align="stretch">
                    {hasProfile ? (
                      <Box>
                        <Heading size="md" mb={4} color={accentColor} textAlign="center">
                          Мой профиль
                        </Heading>
                        <NetworkingProfile 
                          userId={user?.uid} 
                          isCurrentUser={true} 
                        />
                      </Box>
                    ) : (
                      <Box>
                        <Heading size="md" mb={2} color={accentColor} textAlign="center">
                          Создать профиль
                        </Heading>
                        <Text color="gray.600" mb={4} fontSize="sm" textAlign="center">
                          Создайте профиль для участия в проектах
                        </Text>
                        <CreateProject onSubmit={handleCreateProfile} />
                      </Box>
                    )}
                  </VStack>
                )}

                {activeTab === 2 && (
                  <VStack spacing={4} align="stretch">
                    <AnimatedSectionTitle 
                      title="Создать проект"
                      subtitle="Опишите свою идею"
                    />
                    <CreateProject />
                  </VStack>
                )}
              </Box>
            )}
          </MotionBox>
        </Container>
      </Box>

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <MobileBottomBar
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
        <ModalOverlay />
        <ModalContent mx={isMobile ? 2 : 0}>
          <ModalHeader>
            Подать заявку на участие
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Сопроводительное письмо</FormLabel>
              <Textarea
                placeholder="Расскажите о себе и почему хотите участвовать в этом проекте..."
                value={applicationText}
                onChange={(e) => setApplicationText(e.target.value)}
                rows={6}
                resize="vertical"
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Отмена
            </Button>
            <Button colorScheme="gray" onClick={handleSubmitApplication}>
              Отправить заявку
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default NetworkingMobile; 