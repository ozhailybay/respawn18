import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Container, Heading, Text, VStack, HStack, Button, Input,
  FormControl, FormLabel, Textarea, useColorModeValue, useToast,
  Card, CardBody, CardHeader, Badge, Grid, GridItem, IconButton,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody,
  ModalFooter, ModalCloseButton, useDisclosure, Spinner, Center,
  Flex, Stack, Divider, Progress, Alert, AlertIcon, AlertTitle,
  AlertDescription, Tag, TagLabel, Wrap, WrapItem, useBreakpointValue,
  Switch, FormHelperText, Text as ChakraText, Avatar, Icon, Tooltip,
  Accordion, AccordionItem, AccordionButton, AccordionPanel,
  AccordionIcon, List, ListItem, ListIcon, SimpleGrid, Stat,
  StatLabel, StatNumber, StatHelpText, StatArrow, useClipboard,
  Code, Kbd, Highlight, Skeleton, SkeletonText, SkeletonCircle
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaDownload, FaEye, FaRobot, FaSave, FaFileAlt, FaPlus, FaTrash,
  FaEdit, FaCheck, FaTimes, FaStar, FaUser, FaBriefcase, FaGraduationCap,
  FaCode, FaLanguage, FaAward, FaHeart, FaMapMarkerAlt, FaEnvelope,
  FaPhone, FaLinkedin, FaGithub, FaGlobe, FaChartLine, FaLightbulb,
  FaBullseye, FaCalendarAlt, FaBuilding, FaTools, FaCertificate, 
  FaProjectDiagram, FaWrench, FaMagic, FaSparkles, FaBrain, FaRocket,
  FaShieldAlt, FaCrown, FaGem, FaDiamond, FaInfinity, FaZap, FaFire,
  FaCopy, FaShare, FaThumbsUp, FaComments, FaSync, FaPlay, FaPause,
  FaStop, FaVolumeUp, FaVolumeMute, FaExpand, FaCompress, FaSearch,
  FaFilter, FaSort, FaBookmark, FaBookmark as FaBookmarkOutline
} from 'react-icons/fa';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { generateResume, generateResumeAnalysis } from '../api/gemini';
import html2pdf from 'html2pdf.js';

// @ts-ignore - motion() works with Chakra UI components
const MotionBox = motion(Box);
// @ts-ignore - motion() works with Chakra UI components
const MotionCard = motion(Card);
// @ts-ignore - motion() works with Chakra UI components
const MotionButton = motion(Button);

interface ResumeData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    website?: string;
    linkedIn?: string;
    github?: string;
    portfolio?: string;
  };
  summary: string;
  experience: Array<{
    id: string;
    title: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string;
    achievements: string[];
  }>;
  education: Array<{
    id: string;
    degree: string;
    institution: string;
    location: string;
    startDate: string;
    endDate: string;
    gpa?: string;
    honors?: string;
    relevantCourses?: string[];
  }>;
  skills: Array<{
    category: string;
    items: string[];
  }>;
  projects: Array<{
    id: string;
    name: string;
    description: string;
    technologies: string[];
    url?: string;
    github?: string;
    startDate: string;
    endDate: string;
  }>;
  certifications: Array<{
    id: string;
    name: string;
    issuer: string;
    date: string;
    expiryDate?: string;
    credentialId?: string;
  }>;
  languages: Array<{
    name: string;
    proficiency: 'Native' | 'Fluent' | 'Intermediate' | 'Basic';
  }>;
  achievements: Array<{
    id: string;
    title: string;
    description: string;
    date: string;
  }>;
}

interface AIAnalysisResult {
  overallScore: number;
  strengths: string[];
  improvements: string[];
  detailedFeedback: string;
  enhancedContent: string;
  sectionScores: {
    personalInfo: number;
    summary: number;
    experience: number;
    education: number;
    skills: number;
    projects: number;
  };
}

const EnhancedResume: React.FC = () => {
  const { user, userData } = useAuth();
  const toast = useToast();
  const { isOpen: isPreviewOpen, onOpen: onPreviewOpen, onClose: onPreviewClose } = useDisclosure();
  const { isOpen: isAnalysisOpen, onOpen: onAnalysisOpen, onClose: onAnalysisClose } = useDisclosure();
  
  const [resumeData, setResumeData] = useState<ResumeData>({
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      location: '',
      website: '',
      linkedIn: '',
      github: '',
      portfolio: ''
    },
    summary: '',
    experience: [],
    education: [],
    skills: [{ category: 'Технические навыки', items: [] }],
    projects: [],
    certifications: [],
    languages: [],
    achievements: []
  });

  const [selectedTemplate, setSelectedTemplate] = useState('modern');
  const [generatedHtml, setGeneratedHtml] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [progress, setProgress] = useState(0);
  const [isAIGenerating, setIsAIGenerating] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState<string>('');

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // AI Generation Progress Simulation
  useEffect(() => {
    if (isAIGenerating) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            setIsAIGenerating(false);
            return 100;
          }
          return prev + Math.random() * 15;
        });
      }, 500);
      return () => clearInterval(interval);
    }
  }, [isAIGenerating]);

  const loadResumeData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const docRef = doc(db, 'resumeData', user.uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        setResumeData(data.resumeData || resumeData);
        setSelectedTemplate(data.selectedTemplate || 'modern');
        setGeneratedHtml(data.generatedHtml || '');
      }
    } catch (error) {
      console.error('Error loading resume data:', error);
      
      if (error && typeof error === 'object' && 'message' in error && 
          typeof error.message === 'string' && error.message.includes('Missing or insufficient permissions')) {
        console.log('🔄 Using default resume data due to permissions error...');
      } else {
        toast({
          title: 'Ошибка загрузки',
          description: 'Не удалось загрузить данные резюме',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const saveResumeData = async () => {
    if (!user) return;
    
    try {
      const docRef = doc(db, 'resumeData', user.uid);
      await setDoc(docRef, {
        resumeData,
        selectedTemplate,
        generatedHtml,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      
      if (!autoSave) {
        toast({
          title: 'Сохранено',
          description: 'Данные резюме успешно сохранены',
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error saving resume data:', error);
      toast({
        title: 'Ошибка сохранения',
        description: 'Не удалось сохранить данные резюме',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Auto-save effect
  useEffect(() => {
    if (autoSave && user) {
      const timeoutId = setTimeout(saveResumeData, 2000);
      return () => clearTimeout(timeoutId);
    }
  }, [resumeData, autoSave, user]);

  useEffect(() => {
    loadResumeData();
  }, [user]);

  const generateAIResume = async () => {
    if (!user || !resumeData.personalInfo.fullName) {
      toast({
        title: 'Заполните основную информацию',
        description: 'Укажите как минимум имя и контактные данные',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsGenerating(true);
    setIsAIGenerating(true);
    setProgress(0);
    
    try {
      const profileData = {
        displayName: resumeData.personalInfo.fullName,
        name: resumeData.personalInfo.fullName,
        email: resumeData.personalInfo.email,
        phone: resumeData.personalInfo.phone,
        location: resumeData.personalInfo.location,
        bio: resumeData.summary,
        skills: resumeData.skills.flatMap(category => category.items),
        experience: resumeData.experience.map(exp => 
          `${exp.title} в ${exp.company} (${exp.startDate} - ${exp.current ? 'настоящее время' : exp.endDate}): ${exp.description}`
        ),
        education: resumeData.education.map(edu => 
          `${edu.degree} - ${edu.institution} (${edu.startDate} - ${edu.endDate})`
        ),
        languages: resumeData.languages.map(lang => `${lang.name} - ${lang.proficiency}`),
        interests: [],
        position: resumeData.experience[0]?.title || 'Специалист',
        university: resumeData.education[0]?.institution || '',
        graduationYear: resumeData.education[0]?.endDate || '',
        linkedIn: resumeData.personalInfo.linkedIn || '',
        portfolio: resumeData.personalInfo.portfolio || '',
        github: resumeData.personalInfo.github || '',
        website: resumeData.personalInfo.website || ''
      };

      const result = await generateResume(profileData, 'gemini-1.5-flash', selectedTemplate);
      
      if (result.html) {
        setGeneratedHtml(result.html);
        onPreviewOpen();
        toast({
          title: 'Резюме создано!',
          description: 'ИИ успешно сгенерировал ваше резюме',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error generating resume:', error);
      toast({
        title: 'Ошибка генерации',
        description: 'Не удалось сгенерировать резюме',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsGenerating(false);
      setIsAIGenerating(false);
      setProgress(100);
    }
  };

  const analyzeResume = async () => {
    if (!resumeData.personalInfo.fullName) {
      toast({
        title: 'Заполните данные',
        description: 'Добавьте информацию для анализа',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const analysisData = {
        personalInfo: resumeData.personalInfo,
        summary: resumeData.summary,
        experience: resumeData.experience,
        education: resumeData.education,
        skills: resumeData.skills,
        projects: resumeData.projects
      };

      const result = await generateResumeAnalysis(analysisData);
      setAiAnalysis(result);
      onAnalysisOpen();
      
      toast({
        title: 'Анализ завершен',
        description: 'ИИ проанализировал ваше резюме',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error analyzing resume:', error);
      toast({
        title: 'Ошибка анализа',
        description: 'Не удалось проанализировать резюме',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const exportToPDF = async () => {
    if (!generatedHtml) {
      toast({
        title: 'Нет резюме для экспорта',
        description: 'Сначала сгенерируйте резюме',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const element = document.createElement('div');
      element.innerHTML = generatedHtml;
      document.body.appendChild(element);

      const opt = {
        margin: 1,
        filename: `${resumeData.personalInfo.fullName || 'resume'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
      };

      await html2pdf().set(opt).from(element).save();
      document.body.removeChild(element);

      toast({
        title: 'PDF экспортирован',
        description: 'Резюме успешно сохранено в PDF',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast({
        title: 'Ошибка экспорта',
        description: 'Не удалось экспортировать PDF',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // AI Suggestions Generator
  const generateAISuggestions = async (field: string, currentValue: string) => {
    try {
      const suggestions = [
        `Улучшенная версия для ${field}: "${currentValue}"`,
        `Альтернативный вариант: "${currentValue} с акцентом на результат"`,
        `Профессиональная формулировка: "${currentValue} с количественными показателями"`
      ];
      setAiSuggestions(suggestions);
    } catch (error) {
      console.error('Error generating suggestions:', error);
    }
  };

  const steps = [
    { id: 1, title: 'Основная информация', icon: FaUser },
    { id: 2, title: 'Опыт работы', icon: FaBriefcase },
    { id: 3, title: 'Образование', icon: FaGraduationCap },
    { id: 4, title: 'Навыки', icon: FaTools },
    { id: 5, title: 'Проекты', icon: FaProjectDiagram },
    { id: 6, title: 'Генерация', icon: FaMagic }
  ];

  return (
    <Box bg={bgColor} minH="100vh" py={8}>
      <Container maxW="7xl">
        {/* Header */}
        <MotionBox
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          mb={8}
        >
          <VStack spacing={4} textAlign="center">
            <HStack spacing={3}>
              <Icon as={FaGem} color="purple.500" boxSize={8} />
              <Heading size="2xl" bgGradient="linear(to-r, purple.500, blue.500)" bgClip="text">
                AI Генератор Резюме
              </Heading>
              <Icon as={FaBrain} color="blue.500" boxSize={8} />
            </HStack>
            <Text fontSize="lg" color="gray.600" maxW="2xl">
              Создайте профессиональное резюме с помощью искусственного интеллекта Gemini. 
              Элегантный дизайн, умные подсказки и мгновенная генерация.
            </Text>
          </VStack>
        </MotionBox>

        {/* Progress Steps */}
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          mb={8}
        >
          <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
            <CardBody>
              <HStack spacing={4} justify="center" flexWrap="wrap">
                {steps.map((step, index) => (
                  <HStack
                    key={step.id}
                    spacing={2}
                    px={4}
                    py={2}
                    borderRadius="full"
                    bg={currentStep >= step.id ? 'purple.500' : 'gray.100'}
                    color={currentStep >= step.id ? 'white' : 'gray.600'}
                    cursor="pointer"
                    onClick={() => setCurrentStep(step.id)}
                    transition="all 0.3s"
                    _hover={{ transform: 'translateY(-2px)' }}
                  >
                    <Icon as={step.icon} boxSize={4} />
                    <Text fontSize="sm" fontWeight="medium">
                      {step.title}
                    </Text>
                  </HStack>
                ))}
              </HStack>
            </CardBody>
          </Card>
        </MotionBox>

        {/* AI Generation Progress */}
        <AnimatePresence>
          {isAIGenerating && (
            <MotionBox
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              mb={6}
            >
              <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
                <CardBody>
                  <VStack spacing={4}>
                    <HStack spacing={3}>
                      <Spinner color="purple.500" />
                      <Text fontWeight="medium">ИИ генерирует ваше резюме...</Text>
                    </HStack>
                    <Progress 
                      value={progress} 
                      colorScheme="purple" 
                      size="lg" 
                      borderRadius="full"
                      w="full"
                    />
                    <Text fontSize="sm" color="gray.600">
                      {Math.round(progress)}% завершено
                    </Text>
                  </VStack>
                </CardBody>
              </Card>
            </MotionBox>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <Grid templateColumns={{ base: '1fr', lg: '1fr 400px' }} gap={8}>
          {/* Form Section */}
          <MotionBox
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
              <CardHeader>
                <HStack justify="space-between">
                  <Heading size="md">Информация о резюме</Heading>
                  <HStack spacing={2}>
                    <Switch 
                      isChecked={autoSave} 
                      onChange={(e) => setAutoSave(e.target.checked)}
                      size="sm"
                    />
                    <Text fontSize="sm">Автосохранение</Text>
                  </HStack>
                </HStack>
              </CardHeader>
              <CardBody>
                <VStack spacing={6} align="stretch">
                  {/* Personal Info */}
                  <Box>
                    <Heading size="sm" mb={4} color="purple.600">
                      <Icon as={FaUser} mr={2} />
                      Основная информация
                    </Heading>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      <FormControl>
                        <FormLabel>Полное имя</FormLabel>
                        <Input
                          value={resumeData.personalInfo.fullName}
                          onChange={(e) => setResumeData(prev => ({
                            ...prev,
                            personalInfo: { ...prev.personalInfo, fullName: e.target.value }
                          }))}
                          placeholder="Иван Иванов"
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel>Email</FormLabel>
                        <Input
                          type="email"
                          value={resumeData.personalInfo.email}
                          onChange={(e) => setResumeData(prev => ({
                            ...prev,
                            personalInfo: { ...prev.personalInfo, email: e.target.value }
                          }))}
                          placeholder="ivan@example.com"
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel>Телефон</FormLabel>
                        <Input
                          value={resumeData.personalInfo.phone}
                          onChange={(e) => setResumeData(prev => ({
                            ...prev,
                            personalInfo: { ...prev.personalInfo, phone: e.target.value }
                          }))}
                          placeholder="+7 (999) 123-45-67"
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel>Местоположение</FormLabel>
                        <Input
                          value={resumeData.personalInfo.location}
                          onChange={(e) => setResumeData(prev => ({
                            ...prev,
                            personalInfo: { ...prev.personalInfo, location: e.target.value }
                          }))}
                          placeholder="Москва, Россия"
                        />
                      </FormControl>
                    </SimpleGrid>
                  </Box>

                  {/* Summary */}
                  <Box>
                    <Heading size="sm" mb={4} color="purple.600">
                      <Icon as={FaLightbulb} mr={2} />
                      Краткое описание
                    </Heading>
                    <FormControl>
                      <Textarea
                        value={resumeData.summary}
                        onChange={(e) => setResumeData(prev => ({ ...prev, summary: e.target.value }))}
                        placeholder="Опишите ваш опыт, навыки и цели..."
                        rows={4}
                      />
                      <FormHelperText>
                        <Icon as={FaMagic} mr={1} />
                        ИИ поможет улучшить описание
                      </FormHelperText>
                    </FormControl>
                  </Box>

                  {/* Action Buttons */}
                  <HStack spacing={4} justify="center">
                    <MotionButton
                      leftIcon={<FaMagic />}
                      colorScheme="purple"
                      size="lg"
                      onClick={generateAIResume}
                      isLoading={isGenerating}
                      loadingText="Генерирую..."
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Создать резюме
                    </MotionButton>
                    <MotionButton
                      leftIcon={<FaBrain />}
                      colorScheme="blue"
                      variant="outline"
                      size="lg"
                      onClick={analyzeResume}
                      isLoading={isAnalyzing}
                      loadingText="Анализирую..."
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Анализ ИИ
                    </MotionButton>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>
          </MotionBox>

          {/* AI Assistant Panel */}
          <MotionBox
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Card bg={cardBg} border="1px solid" borderColor={borderColor} h="fit-content">
              <CardHeader>
                <HStack spacing={3}>
                  <Avatar size="sm" bg="purple.500" icon={<FaBrain />} />
                  <Box>
                    <Heading size="sm">AI Ассистент</Heading>
                    <Text fontSize="xs" color="gray.500">Gemini AI</Text>
                  </Box>
                </HStack>
              </CardHeader>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <Alert status="info" borderRadius="md">
                    <AlertIcon />
                    <Box>
                      <AlertTitle>Советы ИИ</AlertTitle>
                      <AlertDescription>
                        Заполните основную информацию, и ИИ поможет создать профессиональное резюме
                      </AlertDescription>
                    </Box>
                  </Alert>

                  <Stat>
                    <StatLabel>Качество резюме</StatLabel>
                    <StatNumber>95%</StatNumber>
                    <StatHelpText>
                      <StatArrow type="increase" />
                      23.36%
                    </StatHelpText>
                  </Stat>

                  <Box>
                    <Text fontSize="sm" fontWeight="medium" mb={2}>
                      Быстрые действия
                    </Text>
                    <VStack spacing={2} align="stretch">
                      <Button
                        size="sm"
                        variant="ghost"
                        leftIcon={<FaEye />}
                        onClick={onPreviewOpen}
                        isDisabled={!generatedHtml}
                      >
                        Предварительный просмотр
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        leftIcon={<FaDownload />}
                        onClick={exportToPDF}
                        isDisabled={!generatedHtml}
                      >
                        Экспорт PDF
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        leftIcon={<FaSave />}
                        onClick={saveResumeData}
                      >
                        Сохранить
                      </Button>
                    </VStack>
                  </Box>
                </VStack>
              </CardBody>
            </Card>
          </MotionBox>
        </Grid>

        {/* Preview Modal */}
        <Modal isOpen={isPreviewOpen} onClose={onPreviewClose} size="6xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              <HStack justify="space-between">
                <Text>Предварительный просмотр резюме</Text>
                <HStack spacing={2}>
                  <Button
                    leftIcon={<FaDownload />}
                    colorScheme="purple"
                    size="sm"
                    onClick={exportToPDF}
                  >
                    Экспорт PDF
                  </Button>
                  <IconButton
                    aria-label="Close"
                    icon={<FaTimes />}
                    onClick={onPreviewClose}
                    size="sm"
                  />
                </HStack>
              </HStack>
            </ModalHeader>
            <ModalBody>
              <Box
                dangerouslySetInnerHTML={{ __html: generatedHtml }}
                className="resume-preview"
                p={4}
                border="1px solid"
                borderColor={borderColor}
                borderRadius="md"
              />
            </ModalBody>
          </ModalContent>
        </Modal>

        {/* Analysis Modal */}
        <Modal isOpen={isAnalysisOpen} onClose={onAnalysisClose} size="4xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              <HStack spacing={3}>
                <Icon as={FaBrain} color="blue.500" />
                <Text>Анализ резюме от ИИ</Text>
              </HStack>
            </ModalHeader>
            <ModalBody>
              {aiAnalysis && (
                <VStack spacing={6} align="stretch">
                  <Card>
                    <CardBody>
                      <HStack justify="space-between" mb={4}>
                        <Text fontSize="lg" fontWeight="medium">
                          Общий балл
                        </Text>
                        <Badge colorScheme="green" fontSize="lg" px={3} py={1}>
                          {aiAnalysis.overallScore}/100
                        </Badge>
                      </HStack>
                      <Progress 
                        value={aiAnalysis.overallScore} 
                        colorScheme="green" 
                        size="lg" 
                        borderRadius="full"
                      />
                    </CardBody>
                  </Card>

                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <Card>
                      <CardHeader>
                        <HStack spacing={2}>
                          <Icon as={FaStar} color="green.500" />
                          <Text fontWeight="medium">Сильные стороны</Text>
                        </HStack>
                      </CardHeader>
                      <CardBody>
                        <List spacing={2}>
                          {aiAnalysis.strengths.map((strength, index) => (
                            <ListItem key={index}>
                              <ListIcon as={FaCheck} color="green.500" />
                              {strength}
                            </ListItem>
                          ))}
                        </List>
                      </CardBody>
                    </Card>

                    <Card>
                      <CardHeader>
                        <HStack spacing={2}>
                          <Icon as={FaLightbulb} color="orange.500" />
                          <Text fontWeight="medium">Рекомендации</Text>
                        </HStack>
                      </CardHeader>
                      <CardBody>
                        <List spacing={2}>
                          {aiAnalysis.improvements.map((improvement, index) => (
                            <ListItem key={index}>
                              <ListIcon as={FaTimes} color="orange.500" />
                              {improvement}
                            </ListItem>
                          ))}
                        </List>
                      </CardBody>
                    </Card>
                  </SimpleGrid>

                  <Card>
                    <CardHeader>
                      <Text fontWeight="medium">Детальная обратная связь</Text>
                    </CardHeader>
                    <CardBody>
                      <Text whiteSpace="pre-wrap">{aiAnalysis.detailedFeedback}</Text>
                    </CardBody>
                  </Card>
                </VStack>
              )}
            </ModalBody>
            <ModalFooter>
              <Button onClick={onAnalysisClose}>Закрыть</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Container>
    </Box>
  );
};

export default EnhancedResume; 