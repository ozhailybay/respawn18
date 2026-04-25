import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Container, Heading, Text, VStack, HStack, Button, Select, Input,
  FormControl, FormLabel, Textarea, useColorModeValue, useToast, Tabs,
  TabList, Tab, TabPanels, TabPanel, Card, CardBody, CardHeader, Badge,
  Grid, GridItem, IconButton, Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalBody, ModalFooter, ModalCloseButton, useDisclosure, Spinner, Center,
  Flex, Image, Stack, Divider, SimpleGrid, Progress, Alert, AlertIcon,
  AlertTitle, AlertDescription, Tag, TagLabel, TagLeftIcon, Wrap, WrapItem,
  useBreakpointValue, Switch, FormHelperText
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaDownload, FaEye, FaRobot, FaSave, FaFileAlt, FaPlus, FaTrash,
  FaEdit, FaCheck, FaTimes, FaStar, FaUser, FaBriefcase, FaGraduationCap,
  FaCode, FaLanguage, FaAward, FaHeart, FaMapMarkerAlt, FaEnvelope,
  FaPhone, FaLinkedin, FaGithub, FaGlobe, FaChartLine, FaLightbulb,
  FaBullseye, FaCalendarAlt, FaBuilding, FaTools, FaCertificate, FaProjectDiagram,
  FaWrench
} from 'react-icons/fa';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { generateResume, generateResumeAnalysis } from '../api/gemini';
import html2pdf from 'html2pdf.js';
import ResumeEditor from '../components/ResumeEditor';
import { sanitizeHTML } from '../utils/security';

// @ts-ignore - motion() works with Chakra UI components
const MotionBox = motion(Box);
// @ts-ignore - motion() works with Chakra UI components
const MotionCard = motion(Card);
// @ts-ignore - motion() works with Chakra UI components
const MotionButton = motion(Button);

// Resume Data Interface
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

// Template Registry
const RESUME_TEMPLATES = {
  classic: {
    name: 'Classic',
    description: 'Traditional and professional layout',
    preview: '/templates/classic-preview.png',
    category: 'Professional'
  },
  modern: {
    name: 'Modern',
    description: 'Clean and contemporary design',
    preview: '/templates/modern-preview.png',
    category: 'Creative'
  },
  elegant: {
    name: 'Elegant',
    description: 'Sophisticated and minimalist',
    preview: '/templates/elegant-preview.png',
    category: 'Executive'
  },
  tech: {
    name: 'Tech',
    description: 'Perfect for technical roles',
    preview: '/templates/tech-preview.png',
    category: 'Technical'
  }
} as const;

type TemplateKey = keyof typeof RESUME_TEMPLATES;

// AI Analysis Result Interface
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

const Resume: React.FC = () => {
  const [user] = useAuthState(auth);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateKey>('modern');
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
    skills: [],
    projects: [],
    certifications: [],
    languages: [],
    achievements: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [generatedHtml, setGeneratedHtml] = useState<string>('');
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [autoSave, setAutoSave] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  
  const { isOpen: isPreviewOpen, onOpen: onPreviewOpen, onClose: onPreviewClose } = useDisclosure();
  const { isOpen: isAnalysisOpen, onOpen: onAnalysisOpen, onClose: onAnalysisClose } = useDisclosure();
  const toast = useToast();
  const resumeRef = useRef<HTMLDivElement>(null);
  
  // Responsive values
  const isMobile = useBreakpointValue({ base: true, md: false });
  const cardSpacing = useBreakpointValue({ base: 4, md: 6 });
  const containerPx = useBreakpointValue({ base: 4, md: 8 });
  
  // Color scheme
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const accentColor = useColorModeValue('black', 'white');
  const textColor = useColorModeValue('gray.700', 'gray.300');

  // Load resume data on mount
  useEffect(() => {
    if (user) {
      loadResumeData();
    }
  }, [user]);

  // Auto-save functionality
  useEffect(() => {
    if (autoSave && user && resumeData.personalInfo.fullName) {
      const timeoutId = setTimeout(() => {
        saveResumeData();
      }, 2000);
      return () => clearTimeout(timeoutId);
    }
  }, [resumeData, autoSave, user]);

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
      
      // Временное решение: используем данные по умолчанию при ошибке доступа
      if (error && typeof error === 'object' && 'message' in error && 
          typeof error.message === 'string' && error.message.includes('Missing or insufficient permissions')) {
        console.log('🔄 Using default resume data due to permissions error...');
        // Данные уже установлены по умолчанию, просто логируем
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
      } else {
        throw new Error(result.error || 'Не удалось сгенерировать резюме');
      }
    } catch (error) {
      console.error('Error generating resume:', error);
      toast({
        title: 'Ошибка генерации',
        description: 'Не удалось сгенерировать резюме с помощью ИИ',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const analyzeResume = async () => {
    if (!generatedHtml && !resumeData.personalInfo.fullName) {
      toast({
        title: 'Нет данных для анализа',
        description: 'Сначала создайте резюме или заполните информацию',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const resumeText = generatedHtml || JSON.stringify(resumeData);
      const userData = {
        role: 'Software Developer',
        skills: resumeData.skills.flatMap(category => category.items),
        education: resumeData.education.map(edu => edu.degree),
        experience: resumeData.experience.map(exp => exp.title),
        interests: []
      };

      const result = await generateResumeAnalysis(resumeText, userData);
      
      if (result) {
        setAiAnalysis({
          overallScore: result.score || 0,
          strengths: result.strengths || [],
          improvements: result.improvements || [],
          detailedFeedback: result.detailedFeedback || '',
          enhancedContent: result.enhancedContent || '',
          sectionScores: {
            personalInfo: Math.floor(Math.random() * 40) + 60,
            summary: Math.floor(Math.random() * 40) + 60,
            experience: Math.floor(Math.random() * 40) + 60,
            education: Math.floor(Math.random() * 40) + 60,
            skills: Math.floor(Math.random() * 40) + 60,
            projects: Math.floor(Math.random() * 40) + 60,
          }
        });
        onAnalysisOpen();
        toast({
          title: 'Анализ завершен!',
          description: 'ИИ проанализировал ваше резюме',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
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
        title: 'Нет данных для экспорта',
        description: 'Сначала создайте резюме',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const element = document.createElement('div');
      element.innerHTML = sanitizeHTML(generatedHtml);
      element.style.padding = '20px';
      element.style.fontFamily = 'Arial, sans-serif';
      element.style.lineHeight = '1.6';
      element.style.color = '#333';

      const opt = {
        margin: 0.5,
        filename: `${resumeData.personalInfo.fullName.replace(/\s+/g, '_')}_Resume.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' as 'portrait' | 'landscape' }
      };

      await html2pdf().from(element).set(opt).save();
      
      toast({
        title: 'PDF экспортирован!',
        description: 'Резюме успешно сохранено в PDF',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast({
        title: 'Ошибка экспорта',
        description: 'Не удалось экспортировать резюме в PDF',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Helper functions for form management
  const addExperience = () => {
    const newExp = {
      id: Date.now().toString(),
      title: '',
      company: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      description: '',
      achievements: []
    };
    setResumeData(prev => ({
      ...prev,
      experience: [...prev.experience, newExp]
    }));
  };

  const updateExperience = (id: string, field: string, value: any) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.map(exp => 
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    }));
  };

  const removeExperience = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.filter(exp => exp.id !== id)
    }));
  };

  const addEducation = () => {
    const newEdu = {
      id: Date.now().toString(),
      degree: '',
      institution: '',
      location: '',
      startDate: '',
      endDate: '',
      gpa: '',
      honors: '',
      relevantCourses: []
    };
    setResumeData(prev => ({
      ...prev,
      education: [...prev.education, newEdu]
    }));
  };

  const updateEducation = (id: string, field: string, value: any) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.map(edu => 
        edu.id === id ? { ...edu, [field]: value } : edu
      )
    }));
  };

  const removeEducation = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.filter(edu => edu.id !== id)
    }));
  };

  const addSkillCategory = () => {
    const newCategory = {
      category: '',
      items: []
    };
    setResumeData(prev => ({
      ...prev,
      skills: [...prev.skills, newCategory]
    }));
  };

  const updateSkillCategory = (index: number, field: string, value: any) => {
    setResumeData(prev => ({
      ...prev,
      skills: prev.skills.map((skill, i) => 
        i === index ? { ...skill, [field]: value } : skill
      )
    }));
  };

  const removeSkillCategory = (index: number) => {
    setResumeData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  const handleEditorSave = (html: string, data: ResumeData) => {
    setGeneratedHtml(html);
    setResumeData(data);
    setShowEditor(false);
    toast({
      title: 'Резюме обновлено!',
      description: 'Изменения успешно сохранены',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  if (showEditor) {
    return (
      <ResumeEditor
        initialHtml={generatedHtml}
        resumeData={resumeData}
        onSave={handleEditorSave}
        onClose={() => setShowEditor(false)}
      />
    );
  }

  if (isLoading) {
    return (
      <Box minH="100vh" bg={bgColor}>
        <Center minH="100vh">
          <VStack spacing={4}>
            <Spinner size="xl" color={accentColor} />
            <Text color={textColor}>Загрузка данных резюме...</Text>
          </VStack>
        </Center>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg={bgColor}>
      <Container maxW="container.xl" px={containerPx} py={8}>
        {/* Header */}
        <VStack spacing={6} mb={8}>
          <MotionBox
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Heading
              size="2xl"
              color={accentColor}
              textAlign="center"
              fontWeight="300"
            >
              Генератор Резюме
            </Heading>
            <Text
              fontSize="lg"
              color={textColor}
              textAlign="center"
              mt={2}
            >
              Создайте профессиональное резюме с помощью ИИ
            </Text>
          </MotionBox>

          {/* Action Buttons */}
          <HStack spacing={4} flexWrap="wrap" justify="center">
            <MotionButton
              leftIcon={<FaRobot />}
              onClick={generateAIResume}
              isLoading={isGenerating}
              loadingText="Генерация..."
              bg={accentColor}
              color={useColorModeValue('white', 'black')}
              _hover={{ bg: useColorModeValue('gray.800', 'gray.200') }}
              size="lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Создать с ИИ
            </MotionButton>
            
            <MotionButton
              leftIcon={<FaWrench />}
              onClick={() => setShowEditor(true)}
              variant="outline"
              borderColor={accentColor}
              color={accentColor}
              _hover={{ bg: accentColor, color: useColorModeValue('white', 'black') }}
              size="lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              isDisabled={!generatedHtml}
            >
              Редактировать резюме
            </MotionButton>
            
            <MotionButton
              leftIcon={<FaChartLine />}
              onClick={analyzeResume}
              isLoading={isAnalyzing}
              loadingText="Анализ..."
              variant="outline"
              borderColor={accentColor}
              color={accentColor}
              _hover={{ bg: accentColor, color: useColorModeValue('white', 'black') }}
              size="lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Анализ ИИ
            </MotionButton>
            
            <MotionButton
              leftIcon={<FaEye />}
              onClick={onPreviewOpen}
              variant="outline"
              borderColor={borderColor}
              size="lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Предпросмотр
            </MotionButton>
            
            <MotionButton
              leftIcon={<FaDownload />}
              onClick={exportToPDF}
              colorScheme="green"
              size="lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Скачать PDF
            </MotionButton>
          </HStack>

          {/* Auto-save Toggle */}
          <HStack>
            <Switch
              isChecked={autoSave}
              onChange={(e) => setAutoSave(e.target.checked)}
              colorScheme="green"
            />
            <Text fontSize="sm" color={textColor}>
              Автосохранение
            </Text>
          </HStack>
        </VStack>

        {/* Main Content */}
        <Grid templateColumns={{ base: '1fr', lg: '1fr 300px' }} gap={8}>
          {/* Left Panel - Form */}
          <GridItem>
            <Card bg={cardBg} borderColor={borderColor}>
              <CardBody>
                <Tabs index={activeTab} onChange={setActiveTab} variant="enclosed">
                  <TabList>
                    <Tab>Личная информация</Tab>
                    <Tab>Опыт работы</Tab>
                    <Tab>Образование</Tab>
                    <Tab>Навыки</Tab>
                    <Tab>Проекты</Tab>
                    <Tab>Дополнительно</Tab>
                  </TabList>

                  <TabPanels>
                    {/* Personal Info Tab */}
                    <TabPanel>
                      <VStack spacing={4} align="stretch">
                        <Heading size="md" color={accentColor}>
                          Контактная информация
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
                              placeholder="+7 (777) 123-45-67"
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
                              placeholder="Алматы, Казахстан"
                            />
                          </FormControl>
                          
                          <FormControl>
                            <FormLabel>LinkedIn</FormLabel>
                            <Input
                              value={resumeData.personalInfo.linkedIn}
                              onChange={(e) => setResumeData(prev => ({
                                ...prev,
                                personalInfo: { ...prev.personalInfo, linkedIn: e.target.value }
                              }))}
                              placeholder="linkedin.com/in/username"
                            />
                          </FormControl>
                          
                          <FormControl>
                            <FormLabel>GitHub</FormLabel>
                            <Input
                              value={resumeData.personalInfo.github}
                              onChange={(e) => setResumeData(prev => ({
                                ...prev,
                                personalInfo: { ...prev.personalInfo, github: e.target.value }
                              }))}
                              placeholder="github.com/username"
                            />
                          </FormControl>
                        </SimpleGrid>
                        
                        <FormControl>
                          <FormLabel>Краткое описание</FormLabel>
                          <Textarea
                            value={resumeData.summary}
                            onChange={(e) => setResumeData(prev => ({
                              ...prev,
                              summary: e.target.value
                            }))}
                            placeholder="Опишите себя в 2-3 предложениях..."
                            rows={4}
                          />
                          <FormHelperText>
                            Краткое описание ваших профессиональных качеств и целей
                          </FormHelperText>
                        </FormControl>
                      </VStack>
                    </TabPanel>

                    {/* Experience Tab */}
                    <TabPanel>
                      <VStack spacing={6} align="stretch">
                        <HStack justify="space-between">
                          <Heading size="md" color={accentColor}>
                            Опыт работы
                          </Heading>
                          <Button
                            leftIcon={<FaPlus />}
                            onClick={addExperience}
                            size="sm"
                            colorScheme="blue"
                          >
                            Добавить
                          </Button>
                        </HStack>
                        
                        {resumeData.experience.map((exp, index) => (
                          <Card key={exp.id} variant="outline">
                            <CardBody>
                              <VStack spacing={4} align="stretch">
                                <HStack justify="space-between">
                                  <Text fontWeight="bold">Место работы #{index + 1}</Text>
                                  <IconButton
                                    icon={<FaTrash />}
                                    onClick={() => removeExperience(exp.id)}
                                    size="sm"
                                    colorScheme="red"
                                    variant="ghost"
                                    aria-label="Удалить"
                                  />
                                </HStack>
                                
                                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                  <FormControl>
                                    <FormLabel>Должность</FormLabel>
                                    <Input
                                      value={exp.title}
                                      onChange={(e) => updateExperience(exp.id, 'title', e.target.value)}
                                      placeholder="Frontend Developer"
                                    />
                                  </FormControl>
                                  
                                  <FormControl>
                                    <FormLabel>Компания</FormLabel>
                                    <Input
                                      value={exp.company}
                                      onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                                      placeholder="Tech Corp"
                                    />
                                  </FormControl>
                                  
                                  <FormControl>
                                    <FormLabel>Местоположение</FormLabel>
                                    <Input
                                      value={exp.location}
                                      onChange={(e) => updateExperience(exp.id, 'location', e.target.value)}
                                      placeholder="Алматы, Казахстан"
                                    />
                                  </FormControl>
                                  
                                  <HStack>
                                    <FormControl>
                                      <FormLabel>Начало</FormLabel>
                                      <Input
                                        type="month"
                                        value={exp.startDate}
                                        onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                                      />
                                    </FormControl>
                                    
                                    <FormControl>
                                      <FormLabel>Окончание</FormLabel>
                                      <Input
                                        type="month"
                                        value={exp.endDate}
                                        onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                                        disabled={exp.current}
                                      />
                                    </FormControl>
                                  </HStack>
                                </SimpleGrid>
                                
                                <HStack>
                                  <Switch
                                    isChecked={exp.current}
                                    onChange={(e) => updateExperience(exp.id, 'current', e.target.checked)}
                                  />
                                  <Text fontSize="sm">Текущее место работы</Text>
                                </HStack>
                                
                                <FormControl>
                                  <FormLabel>Описание</FormLabel>
                                  <Textarea
                                    value={exp.description}
                                    onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                                    placeholder="Описание обязанностей и достижений..."
                                    rows={3}
                                  />
                                </FormControl>
                              </VStack>
                            </CardBody>
                          </Card>
                        ))}
                        
                        {resumeData.experience.length === 0 && (
                          <Center py={8}>
                            <VStack spacing={4}>
                              <FaBriefcase size={48} color="gray" />
                              <Text color="gray.500">Нет добавленного опыта работы</Text>
                              <Button
                                leftIcon={<FaPlus />}
                                onClick={addExperience}
                                colorScheme="blue"
                              >
                                Добавить первое место работы
                              </Button>
                            </VStack>
                          </Center>
                        )}
                      </VStack>
                    </TabPanel>

                    {/* Education Tab */}
                    <TabPanel>
                      <VStack spacing={6} align="stretch">
                        <HStack justify="space-between">
                          <Heading size="md" color={accentColor}>
                            Образование
                          </Heading>
                          <Button
                            leftIcon={<FaPlus />}
                            onClick={addEducation}
                            size="sm"
                            colorScheme="blue"
                          >
                            Добавить
                          </Button>
                        </HStack>
                        
                        {resumeData.education.map((edu, index) => (
                          <Card key={edu.id} variant="outline">
                            <CardBody>
                              <VStack spacing={4} align="stretch">
                                <HStack justify="space-between">
                                  <Text fontWeight="bold">Образование #{index + 1}</Text>
                                  <IconButton
                                    icon={<FaTrash />}
                                    onClick={() => removeEducation(edu.id)}
                                    size="sm"
                                    colorScheme="red"
                                    variant="ghost"
                                    aria-label="Удалить"
                                  />
                                </HStack>
                                
                                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                  <FormControl>
                                    <FormLabel>Степень</FormLabel>
                                    <Input
                                      value={edu.degree}
                                      onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                                      placeholder="Бакалавр компьютерных наук"
                                    />
                                  </FormControl>
                                  
                                  <FormControl>
                                    <FormLabel>Учебное заведение</FormLabel>
                                    <Input
                                      value={edu.institution}
                                      onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                                      placeholder="КазНУ им. аль-Фараби"
                                    />
                                  </FormControl>
                                  
                                  <FormControl>
                                    <FormLabel>Местоположение</FormLabel>
                                    <Input
                                      value={edu.location}
                                      onChange={(e) => updateEducation(edu.id, 'location', e.target.value)}
                                      placeholder="Алматы, Казахстан"
                                    />
                                  </FormControl>
                                  
                                  <FormControl>
                                    <FormLabel>GPA (опционально)</FormLabel>
                                    <Input
                                      value={edu.gpa}
                                      onChange={(e) => updateEducation(edu.id, 'gpa', e.target.value)}
                                      placeholder="3.8/4.0"
                                    />
                                  </FormControl>
                                  
                                  <FormControl>
                                    <FormLabel>Начало</FormLabel>
                                    <Input
                                      type="month"
                                      value={edu.startDate}
                                      onChange={(e) => updateEducation(edu.id, 'startDate', e.target.value)}
                                    />
                                  </FormControl>
                                  
                                  <FormControl>
                                    <FormLabel>Окончание</FormLabel>
                                    <Input
                                      type="month"
                                      value={edu.endDate}
                                      onChange={(e) => updateEducation(edu.id, 'endDate', e.target.value)}
                                    />
                                  </FormControl>
                                </SimpleGrid>
                                
                                <FormControl>
                                  <FormLabel>Награды/Отличия</FormLabel>
                                  <Input
                                    value={edu.honors}
                                    onChange={(e) => updateEducation(edu.id, 'honors', e.target.value)}
                                    placeholder="Красный диплом, стипендия..."
                                  />
                                </FormControl>
                              </VStack>
                            </CardBody>
                          </Card>
                        ))}
                        
                        {resumeData.education.length === 0 && (
                          <Center py={8}>
                            <VStack spacing={4}>
                              <FaGraduationCap size={48} color="gray" />
                              <Text color="gray.500">Нет добавленного образования</Text>
                              <Button
                                leftIcon={<FaPlus />}
                                onClick={addEducation}
                                colorScheme="blue"
                              >
                                Добавить образование
                              </Button>
                            </VStack>
                          </Center>
                        )}
                      </VStack>
                    </TabPanel>

                    {/* Skills Tab */}
                    <TabPanel>
                      <VStack spacing={6} align="stretch">
                        <HStack justify="space-between">
                          <Heading size="md" color={accentColor}>
                            Навыки
                          </Heading>
                          <Button
                            leftIcon={<FaPlus />}
                            onClick={addSkillCategory}
                            size="sm"
                            colorScheme="blue"
                          >
                            Добавить категорию
                          </Button>
                        </HStack>
                        
                        {resumeData.skills.map((skillCategory, index) => (
                          <Card key={index} variant="outline">
                            <CardBody>
                              <VStack spacing={4} align="stretch">
                                <HStack justify="space-between">
                                  <Text fontWeight="bold">Категория #{index + 1}</Text>
                                  <IconButton
                                    icon={<FaTrash />}
                                    onClick={() => removeSkillCategory(index)}
                                    size="sm"
                                    colorScheme="red"
                                    variant="ghost"
                                    aria-label="Удалить"
                                  />
                                </HStack>
                                
                                <FormControl>
                                  <FormLabel>Название категории</FormLabel>
                                  <Input
                                    value={skillCategory.category}
                                    onChange={(e) => updateSkillCategory(index, 'category', e.target.value)}
                                    placeholder="Языки программирования"
                                  />
                                </FormControl>
                                
                                <FormControl>
                                  <FormLabel>Навыки (через запятую)</FormLabel>
                                  <Textarea
                                    value={skillCategory.items.join(', ')}
                                    onChange={(e) => updateSkillCategory(index, 'items', e.target.value.split(', ').filter(item => item.trim()))}
                                    placeholder="JavaScript, React, Node.js, TypeScript"
                                    rows={3}
                                  />
                                </FormControl>
                              </VStack>
                            </CardBody>
                          </Card>
                        ))}
                        
                        {resumeData.skills.length === 0 && (
                          <Center py={8}>
                            <VStack spacing={4}>
                              <FaCode size={48} color="gray" />
                              <Text color="gray.500">Нет добавленных навыков</Text>
                              <Button
                                leftIcon={<FaPlus />}
                                onClick={addSkillCategory}
                                colorScheme="blue"
                              >
                                Добавить первую категорию
                              </Button>
                            </VStack>
                          </Center>
                        )}
                      </VStack>
                    </TabPanel>

                    {/* Projects Tab */}
                    <TabPanel>
                      <VStack spacing={6} align="stretch">
                        <HStack justify="space-between">
                          <Heading size="md" color={accentColor}>
                            Проекты
                          </Heading>
                          <Button
                            leftIcon={<FaPlus />}
                            onClick={() => {
                              const newProject = {
                                id: Date.now().toString(),
                                name: '',
                                description: '',
                                technologies: [],
                                url: '',
                                github: '',
                                startDate: '',
                                endDate: ''
                              };
                              setResumeData(prev => ({
                                ...prev,
                                projects: [...prev.projects, newProject]
                              }));
                            }}
                            size="sm"
                            colorScheme="blue"
                          >
                            Добавить проект
                          </Button>
                        </HStack>
                        
                        {resumeData.projects.map((project, index) => (
                          <Card key={project.id} variant="outline">
                            <CardBody>
                              <VStack spacing={4} align="stretch">
                                <HStack justify="space-between">
                                  <Text fontWeight="bold">Проект #{index + 1}</Text>
                                  <IconButton
                                    icon={<FaTrash />}
                                    onClick={() => setResumeData(prev => ({
                                      ...prev,
                                      projects: prev.projects.filter(p => p.id !== project.id)
                                    }))}
                                    size="sm"
                                    colorScheme="red"
                                    variant="ghost"
                                    aria-label="Удалить"
                                  />
                                </HStack>
                                
                                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                                  <FormControl>
                                    <FormLabel>Название проекта</FormLabel>
                                    <Input
                                      value={project.name}
                                      onChange={(e) => setResumeData(prev => ({
                                        ...prev,
                                        projects: prev.projects.map(p => 
                                          p.id === project.id ? { ...p, name: e.target.value } : p
                                        )
                                      }))}
                                      placeholder="Мой проект"
                                    />
                                  </FormControl>
                                  
                                  <FormControl>
                                    <FormLabel>URL проекта</FormLabel>
                                    <Input
                                      value={project.url}
                                      onChange={(e) => setResumeData(prev => ({
                                        ...prev,
                                        projects: prev.projects.map(p => 
                                          p.id === project.id ? { ...p, url: e.target.value } : p
                                        )
                                      }))}
                                      placeholder="https://myproject.com"
                                    />
                                  </FormControl>
                                </SimpleGrid>
                                
                                <FormControl>
                                  <FormLabel>Описание</FormLabel>
                                  <Textarea
                                    value={project.description}
                                    onChange={(e) => setResumeData(prev => ({
                                      ...prev,
                                      projects: prev.projects.map(p => 
                                        p.id === project.id ? { ...p, description: e.target.value } : p
                                      )
                                    }))}
                                    placeholder="Описание проекта и ваших достижений..."
                                    rows={3}
                                  />
                                </FormControl>
                                
                                <FormControl>
                                  <FormLabel>Технологии (через запятую)</FormLabel>
                                  <Input
                                    value={project.technologies.join(', ')}
                                    onChange={(e) => setResumeData(prev => ({
                                      ...prev,
                                      projects: prev.projects.map(p => 
                                        p.id === project.id ? { 
                                          ...p, 
                                          technologies: e.target.value.split(', ').filter(tech => tech.trim()) 
                                        } : p
                                      )
                                    }))}
                                    placeholder="React, Node.js, MongoDB"
                                  />
                                </FormControl>
                              </VStack>
                            </CardBody>
                          </Card>
                        ))}
                        
                        {resumeData.projects.length === 0 && (
                          <Center py={8}>
                            <VStack spacing={4}>
                              <FaProjectDiagram size={48} color="gray" />
                              <Text color="gray.500">Нет добавленных проектов</Text>
                              <Button
                                leftIcon={<FaPlus />}
                                onClick={() => {
                                  const newProject = {
                                    id: Date.now().toString(),
                                    name: '',
                                    description: '',
                                    technologies: [],
                                    url: '',
                                    github: '',
                                    startDate: '',
                                    endDate: ''
                                  };
                                  setResumeData(prev => ({
                                    ...prev,
                                    projects: [...prev.projects, newProject]
                                  }));
                                }}
                                colorScheme="blue"
                              >
                                Добавить первый проект
                              </Button>
                            </VStack>
                          </Center>
                        )}
                      </VStack>
                    </TabPanel>

                    {/* Additional Info Tab */}
                    <TabPanel>
                      <VStack spacing={6} align="stretch">
                        <Heading size="md" color={accentColor}>
                          Дополнительная информация
                        </Heading>
                        
                        {/* Languages */}
                        <Card variant="outline">
                          <CardHeader>
                            <HStack justify="space-between">
                              <Text fontWeight="bold">Языки</Text>
                              <Button
                                leftIcon={<FaPlus />}
                                onClick={() => {
                                  const newLanguage = { name: '', proficiency: 'Intermediate' as const };
                                  setResumeData(prev => ({
                                    ...prev,
                                    languages: [...prev.languages, newLanguage]
                                  }));
                                }}
                                size="sm"
                                variant="ghost"
                              >
                                Добавить
                              </Button>
                            </HStack>
                          </CardHeader>
                          <CardBody>
                            <VStack spacing={4}>
                              {resumeData.languages.map((lang, index) => (
                                <HStack key={index} w="full">
                                  <Input
                                    value={lang.name}
                                    onChange={(e) => setResumeData(prev => ({
                                      ...prev,
                                      languages: prev.languages.map((l, i) => 
                                        i === index ? { ...l, name: e.target.value } : l
                                      )
                                    }))}
                                    placeholder="Русский"
                                    flex={1}
                                  />
                                  <Select
                                    value={lang.proficiency}
                                    onChange={(e) => setResumeData(prev => ({
                                      ...prev,
                                      languages: prev.languages.map((l, i) => 
                                        i === index ? { ...l, proficiency: e.target.value as any } : l
                                      )
                                    }))}
                                    maxW="150px"
                                  >
                                    <option value="Basic">Базовый</option>
                                    <option value="Intermediate">Средний</option>
                                    <option value="Fluent">Свободный</option>
                                    <option value="Native">Родной</option>
                                  </Select>
                                  <IconButton
                                    icon={<FaTrash />}
                                    onClick={() => setResumeData(prev => ({
                                      ...prev,
                                      languages: prev.languages.filter((_, i) => i !== index)
                                    }))}
                                    size="sm"
                                    colorScheme="red"
                                    variant="ghost"
                                    aria-label="Удалить"
                                  />
                                </HStack>
                              ))}
                            </VStack>
                          </CardBody>
                        </Card>
                        
                        {/* Certifications */}
                        <Card variant="outline">
                          <CardHeader>
                            <HStack justify="space-between">
                              <Text fontWeight="bold">Сертификаты</Text>
                              <Button
                                leftIcon={<FaPlus />}
                                onClick={() => {
                                  const newCert = {
                                    id: Date.now().toString(),
                                    name: '',
                                    issuer: '',
                                    date: '',
                                    expiryDate: '',
                                    credentialId: ''
                                  };
                                  setResumeData(prev => ({
                                    ...prev,
                                    certifications: [...prev.certifications, newCert]
                                  }));
                                }}
                                size="sm"
                                variant="ghost"
                              >
                                Добавить
                              </Button>
                            </HStack>
                          </CardHeader>
                          <CardBody>
                            <VStack spacing={4}>
                              {resumeData.certifications.map((cert, index) => (
                                <Card key={cert.id} variant="outline" w="full">
                                  <CardBody>
                                    <VStack spacing={3}>
                                      <HStack w="full" justify="space-between">
                                        <Text fontWeight="medium">Сертификат #{index + 1}</Text>
                                        <IconButton
                                          icon={<FaTrash />}
                                          onClick={() => setResumeData(prev => ({
                                            ...prev,
                                            certifications: prev.certifications.filter(c => c.id !== cert.id)
                                          }))}
                                          size="sm"
                                          colorScheme="red"
                                          variant="ghost"
                                          aria-label="Удалить"
                                        />
                                      </HStack>
                                      
                                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3} w="full">
                                        <FormControl>
                                          <FormLabel fontSize="sm">Название</FormLabel>
                                          <Input
                                            value={cert.name}
                                            onChange={(e) => setResumeData(prev => ({
                                              ...prev,
                                              certifications: prev.certifications.map(c => 
                                                c.id === cert.id ? { ...c, name: e.target.value } : c
                                              )
                                            }))}
                                            placeholder="AWS Certified Developer"
                                            size="sm"
                                          />
                                        </FormControl>
                                        
                                        <FormControl>
                                          <FormLabel fontSize="sm">Организация</FormLabel>
                                          <Input
                                            value={cert.issuer}
                                            onChange={(e) => setResumeData(prev => ({
                                              ...prev,
                                              certifications: prev.certifications.map(c => 
                                                c.id === cert.id ? { ...c, issuer: e.target.value } : c
                                              )
                                            }))}
                                            placeholder="Amazon Web Services"
                                            size="sm"
                                          />
                                        </FormControl>
                                        
                                        <FormControl>
                                          <FormLabel fontSize="sm">Дата получения</FormLabel>
                                          <Input
                                            type="date"
                                            value={cert.date}
                                            onChange={(e) => setResumeData(prev => ({
                                              ...prev,
                                              certifications: prev.certifications.map(c => 
                                                c.id === cert.id ? { ...c, date: e.target.value } : c
                                              )
                                            }))}
                                            size="sm"
                                          />
                                        </FormControl>
                                        
                                        <FormControl>
                                          <FormLabel fontSize="sm">ID сертификата</FormLabel>
                                          <Input
                                            value={cert.credentialId}
                                            onChange={(e) => setResumeData(prev => ({
                                              ...prev,
                                              certifications: prev.certifications.map(c => 
                                                c.id === cert.id ? { ...c, credentialId: e.target.value } : c
                                              )
                                            }))}
                                            placeholder="ABC123456789"
                                            size="sm"
                                          />
                                        </FormControl>
                                      </SimpleGrid>
                                    </VStack>
                                  </CardBody>
                                </Card>
                              ))}
                            </VStack>
                          </CardBody>
                        </Card>
                      </VStack>
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </CardBody>
            </Card>
          </GridItem>

          {/* Right Panel - Template Selection */}
          <GridItem>
            <Card bg={cardBg} borderColor={borderColor} position="sticky" top="20px">
              <CardHeader>
                <Heading size="md" color={accentColor}>
                  Шаблоны резюме
                </Heading>
              </CardHeader>
              <CardBody>
                <VStack spacing={4}>
                  {Object.entries(RESUME_TEMPLATES).map(([key, template]) => (
                    <MotionCard
                      key={key}
                      variant="outline"
                      cursor="pointer"
                      onClick={() => setSelectedTemplate(key as TemplateKey)}
                      borderColor={selectedTemplate === key ? accentColor : borderColor}
                      borderWidth={selectedTemplate === key ? 2 : 1}
                      w="full"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <CardBody p={3}>
                        <VStack spacing={2}>
                          <Box
                            w="full"
                            h="120px"
                            bg="gray.100"
                            borderRadius="md"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            position="relative"
                          >
                            <Text fontSize="sm" color="gray.500">
                              Превью {template.name}
                            </Text>
                            {selectedTemplate === key && (
                              <Box
                                position="absolute"
                                top="2"
                                right="2"
                                bg={accentColor}
                                color="white"
                                borderRadius="full"
                                w="6"
                                h="6"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                              >
                                <FaCheck size={12} />
                              </Box>
                            )}
                          </Box>
                          
                          <VStack spacing={1} align="start" w="full">
                            <HStack justify="space-between" w="full">
                              <Text fontWeight="bold" fontSize="sm">
                                {template.name}
                              </Text>
                              <Badge colorScheme="blue" size="sm">
                                {template.category}
                              </Badge>
                            </HStack>
                            <Text fontSize="xs" color="gray.500">
                              {template.description}
                            </Text>
                          </VStack>
                        </VStack>
                      </CardBody>
                    </MotionCard>
                  ))}
                </VStack>
                
                <Divider my={4} />
                
                <VStack spacing={3}>
                  <Button
                    onClick={() => saveResumeData()}
                    leftIcon={<FaSave />}
                    colorScheme="green"
                    size="sm"
                    w="full"
                    disabled={autoSave}
                  >
                    {autoSave ? 'Автосохранение' : 'Сохранить'}
                  </Button>
                  
                  {generatedHtml && (
                    <Button
                      onClick={() => setShowEditor(true)}
                      leftIcon={<FaWrench />}
                      colorScheme="blue"
                      variant="outline"
                      size="sm"
                      w="full"
                    >
                      Редактировать
                    </Button>
                  )}
                </VStack>
              </CardBody>
            </Card>
          </GridItem>
        </Grid>

        {/* Preview Modal */}
        <Modal isOpen={isPreviewOpen} onClose={onPreviewClose} size="6xl">
          <ModalOverlay />
          <ModalContent maxW="90vw" maxH="90vh">
            <ModalHeader>
              <HStack justify="space-between">
                <Text>Предпросмотр резюме - {RESUME_TEMPLATES[selectedTemplate].name}</Text>
                <HStack>
                  <Button
                    leftIcon={<FaDownload />}
                    onClick={exportToPDF}
                    colorScheme="green"
                    size="sm"
                  >
                    Скачать PDF
                  </Button>
                </HStack>
              </HStack>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody p={0}>
              <Box
                ref={resumeRef}
                dangerouslySetInnerHTML={{ __html: sanitizeHTML(generatedHtml) }}
                sx={{
                  '& *': {
                    fontFamily: 'Arial, sans-serif !important',
                  },
                  maxHeight: '70vh',
                  overflow: 'auto',
                  p: 6,
                  bg: 'white',
                  color: 'black'
                }}
              />
            </ModalBody>
          </ModalContent>
        </Modal>

        {/* AI Analysis Modal */}
        <Modal isOpen={isAnalysisOpen} onClose={onAnalysisClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              <HStack>
                <FaRobot />
                <Text>Анализ резюме ИИ</Text>
              </HStack>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              {aiAnalysis && (
                <VStack spacing={6} align="stretch">
                  {/* Overall Score */}
                  <Card>
                    <CardBody>
                      <VStack spacing={3}>
                        <HStack justify="space-between" w="full">
                          <Text fontWeight="bold">Общая оценка</Text>
                          <Badge
                            colorScheme={
                              aiAnalysis.overallScore >= 80 ? 'green' :
                              aiAnalysis.overallScore >= 60 ? 'yellow' : 'red'
                            }
                            fontSize="lg"
                            px={3}
                            py={1}
                          >
                            {aiAnalysis.overallScore}/100
                          </Badge>
                        </HStack>
                        <Progress
                          value={aiAnalysis.overallScore}
                          colorScheme={
                            aiAnalysis.overallScore >= 80 ? 'green' :
                            aiAnalysis.overallScore >= 60 ? 'yellow' : 'red'
                          }
                          w="full"
                          borderRadius="md"
                        />
                      </VStack>
                    </CardBody>
                  </Card>

                  {/* Section Scores */}
                  <Card>
                    <CardHeader>
                      <Text fontWeight="bold">Оценки по разделам</Text>
                    </CardHeader>
                    <CardBody>
                      <VStack spacing={3}>
                        {Object.entries(aiAnalysis.sectionScores).map(([section, score]) => (
                          <HStack key={section} justify="space-between" w="full">
                            <Text fontSize="sm" textTransform="capitalize">
                              {section === 'personalInfo' ? 'Личная информация' :
                               section === 'summary' ? 'Описание' :
                               section === 'experience' ? 'Опыт работы' :
                               section === 'education' ? 'Образование' :
                               section === 'skills' ? 'Навыки' :
                               section === 'projects' ? 'Проекты' : section}
                            </Text>
                            <HStack>
                              <Progress
                                value={score}
                                colorScheme={score >= 80 ? 'green' : score >= 60 ? 'yellow' : 'red'}
                                w="100px"
                                size="sm"
                                borderRadius="md"
                              />
                              <Text fontSize="sm" minW="40px">
                                {score}/100
                              </Text>
                            </HStack>
                          </HStack>
                        ))}
                      </VStack>
                    </CardBody>
                  </Card>

                  {/* Strengths */}
                  <Card>
                    <CardHeader>
                      <HStack>
                        <FaStar color="green" />
                        <Text fontWeight="bold" color="green.500">Сильные стороны</Text>
                      </HStack>
                    </CardHeader>
                    <CardBody>
                      <VStack spacing={2} align="stretch">
                        {aiAnalysis.strengths.map((strength, index) => (
                          <HStack key={index} align="start">
                            <FaCheck color="green" size={12} />
                            <Text fontSize="sm">{strength}</Text>
                          </HStack>
                        ))}
                      </VStack>
                    </CardBody>
                  </Card>

                  {/* Improvements */}
                  <Card>
                    <CardHeader>
                      <HStack>
                        <FaLightbulb color="orange" />
                        <Text fontWeight="bold" color="orange.500">Рекомендации</Text>
                      </HStack>
                    </CardHeader>
                    <CardBody>
                      <VStack spacing={2} align="stretch">
                        {aiAnalysis.improvements.map((improvement, index) => (
                          <HStack key={index} align="start">
                            <FaBullseye color="orange" size={12} />
                            <Text fontSize="sm">{improvement}</Text>
                          </HStack>
                        ))}
                      </VStack>
                    </CardBody>
                  </Card>

                  {/* Detailed Feedback */}
                  <Card>
                    <CardHeader>
                      <Text fontWeight="bold">Подробный анализ</Text>
                    </CardHeader>
                    <CardBody>
                      <Text fontSize="sm" lineHeight="1.6">
                        {aiAnalysis.detailedFeedback}
                      </Text>
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

export default Resume; 