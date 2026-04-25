import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Input,
  Textarea,
  FormControl,
  FormLabel,
  Select,
  Badge,
  IconButton,
  useColorModeValue,
  useToast,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Divider,
  Flex,
  Icon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Spinner,
  Center,
  Grid,
  GridItem,
  Card,
  CardBody
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { 
  FaPlus, 
  FaTrash, 
  FaEdit, 
  FaDownload, 
  FaEye, 
  FaRobot,
  FaFileAlt,
  FaSave,
  FaUndo
} from 'react-icons/fa';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { generateResume } from '../../api/gemini';
import html2pdf from 'html2pdf.js';

// @ts-ignore - motion() works with Chakra UI components
const MotionBox = motion(Box);

interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
  location: string;
  website?: string;
  linkedIn?: string;
}

interface Experience {
  id: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
  achievements: string[];
}

interface Education {
  id: string;
  degree: string;
  institution: string;
  location: string;
  startDate: string;
  endDate: string;
  gpa?: string;
  description?: string;
}

interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  startDate: string;
  endDate: string;
  link?: string;
}

interface ResumeData {
  personalInfo: PersonalInfo;
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: string[];
  projects: Project[];
  languages: string[];
  certifications: string[];
}

interface EditableResumeGeneratorProps {
  userId?: string;
  onSave?: (resumeData: ResumeData) => void;
}

const EditableResumeGenerator: React.FC<EditableResumeGeneratorProps> = ({ 
  userId,
  onSave 
}) => {
  const [user] = useAuthState(auth);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [newSkill, setNewSkill] = useState('');
  const [newLanguage, setNewLanguage] = useState('');
  const [newCertification, setNewCertification] = useState('');
  const [generatedHtml, setGeneratedHtml] = useState<string>('');
  const [resumeTemplate, setResumeTemplate] = useState<'modern' | 'classic' | 'creative' | 'minimal'>('modern');
  
  const { isOpen: isPreviewOpen, onOpen: onPreviewOpen, onClose: onPreviewClose } = useDisclosure();
  const toast = useToast();
  const resumeRef = useRef<HTMLDivElement>(null);

  // Color scheme
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const accentColor = useColorModeValue('black', 'white');
  const textColor = useColorModeValue('gray.700', 'gray.300');
  const cardBg = useColorModeValue('gray.50', 'gray.700');

  // Resume data state
  const [resumeData, setResumeData] = useState<ResumeData>({
    personalInfo: {
      name: '',
      email: '',
      phone: '',
      location: '',
      website: '',
      linkedIn: ''
    },
    summary: '',
    experience: [],
    education: [],
    skills: [],
    projects: [],
    languages: [],
    certifications: []
  });

  // Load existing resume data
  useEffect(() => {
    loadResumeData();
  }, [user, userId]);

  const loadResumeData = async () => {
    if (!user && !userId) return;
    
    setIsLoading(true);
    try {
      const docRef = doc(db, 'users', userId || user!.uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const userData = docSnap.data();
        if (userData.resumeData) {
          setResumeData(userData.resumeData);
        } else {
          // Initialize with user's basic info
          setResumeData(prev => ({
            ...prev,
            personalInfo: {
              ...prev.personalInfo,
              name: userData.displayName || '',
              email: userData.email || '',
              location: userData.location || '',
              linkedIn: userData.linkedIn || ''
            },
            summary: userData.bio || '',
            skills: userData.skills || []
          }));
        }
      }
    } catch (error) {
      console.error('Error loading resume data:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить данные резюме',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveResumeData = async () => {
    if (!user && !userId) return;
    
    try {
      const docRef = doc(db, 'users', userId || user!.uid);
      await updateDoc(docRef, {
        resumeData: resumeData,
        updatedAt: new Date()
      });
      
      toast({
        title: 'Сохранено',
        description: 'Данные резюме успешно сохранены',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      if (onSave) {
        onSave(resumeData);
      }
    } catch (error) {
      console.error('Error saving resume data:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить данные резюме',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const generateAIResume = async () => {
    setIsGenerating(true);
    try {
      const profileData = {
        displayName: resumeData.personalInfo.name,
        name: resumeData.personalInfo.name,
        email: resumeData.personalInfo.email,
        photo: '',
        location: resumeData.personalInfo.location,
        bio: resumeData.summary,
        skills: resumeData.skills,
        experience: resumeData.experience.map(exp => 
          `${exp.title} в ${exp.company} (${exp.startDate} - ${exp.current ? 'настоящее время' : exp.endDate}): ${exp.description}`
        ),
        education: resumeData.education.map(edu => 
          `${edu.degree} - ${edu.institution} (${edu.startDate} - ${edu.endDate})`
        ),
        languages: resumeData.languages,
        interests: [],
        position: resumeData.experience[0]?.title || 'Специалист',
        university: resumeData.education[0]?.institution || '',
        graduationYear: resumeData.education[0]?.endDate || '',
        linkedIn: resumeData.personalInfo.linkedIn || ''
      };

      const result = await generateResume(profileData, 'gemini-1.5-flash', resumeTemplate);
      
      if (result.html) {
        setGeneratedHtml(result.html);
        onPreviewOpen();
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

  const exportToPDF = () => {
    if (!resumeRef.current) return;
    
    const opt = {
      margin: 10,
      filename: `${resumeData.personalInfo.name || 'resume'}_${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    html2pdf().set(opt).from(resumeRef.current).save();
  };

  // Add/Remove functions
  const addExperience = () => {
    const newExp: Experience = {
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

  const removeExperience = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.filter(exp => exp.id !== id)
    }));
  };

  const addEducation = () => {
    const newEdu: Education = {
      id: Date.now().toString(),
      degree: '',
      institution: '',
      location: '',
      startDate: '',
      endDate: '',
      gpa: '',
      description: ''
    };
    setResumeData(prev => ({
      ...prev,
      education: [...prev.education, newEdu]
    }));
  };

  const removeEducation = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.filter(edu => edu.id !== id)
    }));
  };

  const addProject = () => {
    const newProject: Project = {
      id: Date.now().toString(),
      title: '',
      description: '',
      technologies: [],
      startDate: '',
      endDate: '',
      link: ''
    };
    setResumeData(prev => ({
      ...prev,
      projects: [...prev.projects, newProject]
    }));
  };

  const removeProject = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      projects: prev.projects.filter(proj => proj.id !== id)
    }));
  };

  const addSkill = () => {
    if (newSkill.trim() && !resumeData.skills.includes(newSkill.trim())) {
      setResumeData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setResumeData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const addLanguage = () => {
    if (newLanguage.trim() && !resumeData.languages.includes(newLanguage.trim())) {
      setResumeData(prev => ({
        ...prev,
        languages: [...prev.languages, newLanguage.trim()]
      }));
      setNewLanguage('');
    }
  };

  const removeLanguage = (language: string) => {
    setResumeData(prev => ({
      ...prev,
      languages: prev.languages.filter(l => l !== language)
    }));
  };

  const addCertification = () => {
    if (newCertification.trim() && !resumeData.certifications.includes(newCertification.trim())) {
      setResumeData(prev => ({
        ...prev,
        certifications: [...prev.certifications, newCertification.trim()]
      }));
      setNewCertification('');
    }
  };

  const removeCertification = (cert: string) => {
    setResumeData(prev => ({
      ...prev,
      certifications: prev.certifications.filter(c => c !== cert)
    }));
  };

  if (isLoading) {
    return (
      <Center minH="400px">
        <VStack spacing={4}>
          <Spinner size="xl" color={accentColor} />
          <Text color={textColor}>Загрузка данных резюме...</Text>
        </VStack>
      </Center>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Flex justify="space-between" align="center" mb={6}>
        <VStack align="start" spacing={1}>
          <Heading size="lg" color={accentColor} fontWeight="light">
            <Box as="span" fontWeight="thin">Конструктор</Box>
            <Box as="span" fontWeight="bold" ml={2}>Резюме</Box>
          </Heading>
          <Text color={textColor} fontSize="sm">
            Создайте и отредактируйте своё профессиональное резюме
          </Text>
        </VStack>
        
        <HStack spacing={2}>
          <Button
            leftIcon={<FaRobot />}
            onClick={generateAIResume}
            isLoading={isGenerating}
            loadingText="Генерация..."
            bg={accentColor}
            color={useColorModeValue('white', 'black')}
            _hover={{ bg: useColorModeValue('gray.800', 'gray.200') }}
            size="sm"
          >
            ИИ Генерация
          </Button>
          <Button
            leftIcon={<FaEye />}
            onClick={onPreviewOpen}
            variant="outline"
            borderColor={borderColor}
            size="sm"
          >
            Предпросмотр
          </Button>
          <Button
            leftIcon={<FaSave />}
            onClick={saveResumeData}
            colorScheme="green"
            size="sm"
          >
            Сохранить
          </Button>
        </HStack>
      </Flex>

      {/* Main Content */}
      <Tabs index={activeTab} onChange={setActiveTab} variant="enclosed">
        <TabList borderColor={borderColor}>
          <Tab _selected={{ color: accentColor, borderColor: accentColor }}>
            Личная информация
          </Tab>
          <Tab _selected={{ color: accentColor, borderColor: accentColor }}>
            Опыт работы
          </Tab>
          <Tab _selected={{ color: accentColor, borderColor: accentColor }}>
            Образование
          </Tab>
          <Tab _selected={{ color: accentColor, borderColor: accentColor }}>
            Навыки
          </Tab>
          <Tab _selected={{ color: accentColor, borderColor: accentColor }}>
            Проекты
          </Tab>
        </TabList>

        <TabPanels>
          {/* Personal Information Tab */}
          <TabPanel>
            <VStack spacing={6} align="stretch">
              <Card bg={cardBg} borderColor={borderColor}>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <Heading size="md" color={accentColor}>Контактная информация</Heading>
                    
                    <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4}>
                      <FormControl>
                        <FormLabel>Полное имя</FormLabel>
                        <Input
                          value={resumeData.personalInfo.name}
                          onChange={(e) => setResumeData(prev => ({
                            ...prev,
                            personalInfo: { ...prev.personalInfo, name: e.target.value }
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
                        <FormLabel>Веб-сайт</FormLabel>
                        <Input
                          value={resumeData.personalInfo.website}
                          onChange={(e) => setResumeData(prev => ({
                            ...prev,
                            personalInfo: { ...prev.personalInfo, website: e.target.value }
                          }))}
                          placeholder="https://mywebsite.com"
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
                          placeholder="https://linkedin.com/in/username"
                        />
                      </FormControl>
                    </Grid>
                  </VStack>
                </CardBody>
              </Card>

              <Card bg={cardBg} borderColor={borderColor}>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <Heading size="md" color={accentColor}>Краткое описание</Heading>
                    <FormControl>
                      <Textarea
                        value={resumeData.summary}
                        onChange={(e) => setResumeData(prev => ({
                          ...prev,
                          summary: e.target.value
                        }))}
                        placeholder="Краткое описание вашего профессионального опыта и целей..."
                        rows={4}
                      />
                    </FormControl>
                  </VStack>
                </CardBody>
              </Card>
            </VStack>
          </TabPanel>

          {/* Experience Tab */}
          <TabPanel>
            <VStack spacing={4} align="stretch">
              <Flex justify="space-between" align="center">
                <Heading size="md" color={accentColor}>Опыт работы</Heading>
                <Button leftIcon={<FaPlus />} onClick={addExperience} size="sm">
                  Добавить
                </Button>
              </Flex>
              
              {resumeData.experience.map((exp, index) => (
                <Card key={exp.id} bg={cardBg} borderColor={borderColor}>
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      <Flex justify="space-between" align="center">
                        <Text fontWeight="bold">Опыт работы #{index + 1}</Text>
                        <IconButton
                          aria-label="Удалить опыт"
                          icon={<FaTrash />}
                          size="sm"
                          colorScheme="red"
                          variant="ghost"
                          onClick={() => removeExperience(exp.id)}
                        />
                      </Flex>
                      
                      <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4}>
                        <FormControl>
                          <FormLabel>Должность</FormLabel>
                          <Input
                            value={exp.title}
                            onChange={(e) => setResumeData(prev => ({
                              ...prev,
                              experience: prev.experience.map(item => 
                                item.id === exp.id ? { ...item, title: e.target.value } : item
                              )
                            }))}
                            placeholder="Frontend Developer"
                          />
                        </FormControl>
                        
                        <FormControl>
                          <FormLabel>Компания</FormLabel>
                          <Input
                            value={exp.company}
                            onChange={(e) => setResumeData(prev => ({
                              ...prev,
                              experience: prev.experience.map(item => 
                                item.id === exp.id ? { ...item, company: e.target.value } : item
                              )
                            }))}
                            placeholder="Tech Company"
                          />
                        </FormControl>
                        
                        <FormControl>
                          <FormLabel>Местоположение</FormLabel>
                          <Input
                            value={exp.location}
                            onChange={(e) => setResumeData(prev => ({
                              ...prev,
                              experience: prev.experience.map(item => 
                                item.id === exp.id ? { ...item, location: e.target.value } : item
                              )
                            }))}
                            placeholder="Алматы, Казахстан"
                          />
                        </FormControl>
                        
                        <FormControl>
                          <FormLabel>Дата начала</FormLabel>
                          <Input
                            type="month"
                            value={exp.startDate}
                            onChange={(e) => setResumeData(prev => ({
                              ...prev,
                              experience: prev.experience.map(item => 
                                item.id === exp.id ? { ...item, startDate: e.target.value } : item
                              )
                            }))}
                          />
                        </FormControl>
                        
                        <FormControl>
                          <FormLabel>Дата окончания</FormLabel>
                          <Input
                            type="month"
                            value={exp.endDate}
                            onChange={(e) => setResumeData(prev => ({
                              ...prev,
                              experience: prev.experience.map(item => 
                                item.id === exp.id ? { ...item, endDate: e.target.value } : item
                              )
                            }))}
                            disabled={exp.current}
                          />
                        </FormControl>
                      </Grid>
                      
                      <FormControl>
                        <Textarea
                          value={exp.description}
                          onChange={(e) => setResumeData(prev => ({
                            ...prev,
                            experience: prev.experience.map(item => 
                              item.id === exp.id ? { ...item, description: e.target.value } : item
                            )
                          }))}
                          placeholder="Описание ваших обязанностей и достижений..."
                          rows={3}
                        />
                      </FormControl>
                    </VStack>
                  </CardBody>
                </Card>
              ))}
              
              {resumeData.experience.length === 0 && (
                <Center py={8}>
                  <VStack spacing={2}>
                    <Text color={textColor}>Опыт работы не добавлен</Text>
                    <Button leftIcon={<FaPlus />} onClick={addExperience} size="sm">
                      Добавить первый опыт
                    </Button>
                  </VStack>
                </Center>
              )}
            </VStack>
          </TabPanel>

          {/* Education Tab */}
          <TabPanel>
            <VStack spacing={4} align="stretch">
              <Flex justify="space-between" align="center">
                <Heading size="md" color={accentColor}>Образование</Heading>
                <Button leftIcon={<FaPlus />} onClick={addEducation} size="sm">
                  Добавить
                </Button>
              </Flex>
              
              {resumeData.education.map((edu, index) => (
                <Card key={edu.id} bg={cardBg} borderColor={borderColor}>
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      <Flex justify="space-between" align="center">
                        <Text fontWeight="bold">Образование #{index + 1}</Text>
                        <IconButton
                          aria-label="Удалить образование"
                          icon={<FaTrash />}
                          size="sm"
                          colorScheme="red"
                          variant="ghost"
                          onClick={() => removeEducation(edu.id)}
                        />
                      </Flex>
                      
                      <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4}>
                        <FormControl>
                          <FormLabel>Степень/Специальность</FormLabel>
                          <Input
                            value={edu.degree}
                            onChange={(e) => setResumeData(prev => ({
                              ...prev,
                              education: prev.education.map(item => 
                                item.id === edu.id ? { ...item, degree: e.target.value } : item
                              )
                            }))}
                            placeholder="Бакалавр Информатики"
                          />
                        </FormControl>
                        
                        <FormControl>
                          <FormLabel>Учебное заведение</FormLabel>
                          <Input
                            value={edu.institution}
                            onChange={(e) => setResumeData(prev => ({
                              ...prev,
                              education: prev.education.map(item => 
                                item.id === edu.id ? { ...item, institution: e.target.value } : item
                              )
                            }))}
                            placeholder="КазНУ им. аль-Фараби"
                          />
                        </FormControl>
                        
                        <FormControl>
                          <FormLabel>Местоположение</FormLabel>
                          <Input
                            value={edu.location}
                            onChange={(e) => setResumeData(prev => ({
                              ...prev,
                              education: prev.education.map(item => 
                                item.id === edu.id ? { ...item, location: e.target.value } : item
                              )
                            }))}
                            placeholder="Алматы, Казахстан"
                          />
                        </FormControl>
                        
                        <FormControl>
                          <FormLabel>GPA (опционально)</FormLabel>
                          <Input
                            value={edu.gpa}
                            onChange={(e) => setResumeData(prev => ({
                              ...prev,
                              education: prev.education.map(item => 
                                item.id === edu.id ? { ...item, gpa: e.target.value } : item
                              )
                            }))}
                            placeholder="3.8/4.0"
                          />
                        </FormControl>
                        
                        <FormControl>
                          <FormLabel>Дата начала</FormLabel>
                          <Input
                            type="month"
                            value={edu.startDate}
                            onChange={(e) => setResumeData(prev => ({
                              ...prev,
                              education: prev.education.map(item => 
                                item.id === edu.id ? { ...item, startDate: e.target.value } : item
                              )
                            }))}
                          />
                        </FormControl>
                        
                        <FormControl>
                          <FormLabel>Дата окончания</FormLabel>
                          <Input
                            type="month"
                            value={edu.endDate}
                            onChange={(e) => setResumeData(prev => ({
                              ...prev,
                              education: prev.education.map(item => 
                                item.id === edu.id ? { ...item, endDate: e.target.value } : item
                              )
                            }))}
                          />
                        </FormControl>
                      </Grid>
                      
                      <FormControl>
                        <FormLabel>Дополнительная информация</FormLabel>
                        <Textarea
                          value={edu.description}
                          onChange={(e) => setResumeData(prev => ({
                            ...prev,
                            education: prev.education.map(item => 
                              item.id === edu.id ? { ...item, description: e.target.value } : item
                            )
                          }))}
                          placeholder="Релевантные курсы, достижения, активности..."
                          rows={2}
                        />
                      </FormControl>
                    </VStack>
                  </CardBody>
                </Card>
              ))}
              
              {resumeData.education.length === 0 && (
                <Center py={8}>
                  <VStack spacing={2}>
                    <Text color={textColor}>Образование не добавлено</Text>
                    <Button leftIcon={<FaPlus />} onClick={addEducation} size="sm">
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
              {/* Skills Section */}
              <Card bg={cardBg} borderColor={borderColor}>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <Heading size="md" color={accentColor}>Навыки</Heading>
                    
                    <HStack>
                      <Input
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        placeholder="Добавить навык"
                        onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                      />
                      <Button onClick={addSkill} leftIcon={<FaPlus />}>
                        Добавить
                      </Button>
                    </HStack>
                    
                    <Flex wrap="wrap" gap={2}>
                      {resumeData.skills.map((skill) => (
                        <Badge
                          key={skill}
                          colorScheme="blue"
                          display="flex"
                          alignItems="center"
                          px={3}
                          py={1}
                          borderRadius="full"
                        >
                          {skill}
                          <IconButton
                            aria-label="Удалить навык"
                            icon={<FaTrash />}
                            size="xs"
                            variant="ghost"
                            ml={1}
                            onClick={() => removeSkill(skill)}
                          />
                        </Badge>
                      ))}
                    </Flex>
                  </VStack>
                </CardBody>
              </Card>

              {/* Languages Section */}
              <Card bg={cardBg} borderColor={borderColor}>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <Heading size="md" color={accentColor}>Языки</Heading>
                    
                    <HStack>
                      <Input
                        value={newLanguage}
                        onChange={(e) => setNewLanguage(e.target.value)}
                        placeholder="Добавить язык"
                        onKeyPress={(e) => e.key === 'Enter' && addLanguage()}
                      />
                      <Button onClick={addLanguage} leftIcon={<FaPlus />}>
                        Добавить
                      </Button>
                    </HStack>
                    
                    <Flex wrap="wrap" gap={2}>
                      {resumeData.languages.map((language) => (
                        <Badge
                          key={language}
                          colorScheme="green"
                          display="flex"
                          alignItems="center"
                          px={3}
                          py={1}
                          borderRadius="full"
                        >
                          {language}
                          <IconButton
                            aria-label="Удалить язык"
                            icon={<FaTrash />}
                            size="xs"
                            variant="ghost"
                            ml={1}
                            onClick={() => removeLanguage(language)}
                          />
                        </Badge>
                      ))}
                    </Flex>
                  </VStack>
                </CardBody>
              </Card>

              {/* Certifications Section */}
              <Card bg={cardBg} borderColor={borderColor}>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <Heading size="md" color={accentColor}>Сертификаты</Heading>
                    
                    <HStack>
                      <Input
                        value={newCertification}
                        onChange={(e) => setNewCertification(e.target.value)}
                        placeholder="Добавить сертификат"
                        onKeyPress={(e) => e.key === 'Enter' && addCertification()}
                      />
                      <Button onClick={addCertification} leftIcon={<FaPlus />}>
                        Добавить
                      </Button>
                    </HStack>
                    
                    <Flex wrap="wrap" gap={2}>
                      {resumeData.certifications.map((cert) => (
                        <Badge
                          key={cert}
                          colorScheme="purple"
                          display="flex"
                          alignItems="center"
                          px={3}
                          py={1}
                          borderRadius="full"
                        >
                          {cert}
                          <IconButton
                            aria-label="Удалить сертификат"
                            icon={<FaTrash />}
                            size="xs"
                            variant="ghost"
                            ml={1}
                            onClick={() => removeCertification(cert)}
                          />
                        </Badge>
                      ))}
                    </Flex>
                  </VStack>
                </CardBody>
              </Card>
            </VStack>
          </TabPanel>

          {/* Projects Tab */}
          <TabPanel>
            <VStack spacing={4} align="stretch">
              <Flex justify="space-between" align="center">
                <Heading size="md" color={accentColor}>Проекты</Heading>
                <Button leftIcon={<FaPlus />} onClick={addProject} size="sm">
                  Добавить
                </Button>
              </Flex>
              
              {resumeData.projects.map((project, index) => (
                <Card key={project.id} bg={cardBg} borderColor={borderColor}>
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      <Flex justify="space-between" align="center">
                        <Text fontWeight="bold">Проект #{index + 1}</Text>
                        <IconButton
                          aria-label="Удалить проект"
                          icon={<FaTrash />}
                          size="sm"
                          colorScheme="red"
                          variant="ghost"
                          onClick={() => removeProject(project.id)}
                        />
                      </Flex>
                      
                      <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4}>
                        <FormControl>
                          <FormLabel>Название проекта</FormLabel>
                          <Input
                            value={project.title}
                            onChange={(e) => setResumeData(prev => ({
                              ...prev,
                              projects: prev.projects.map(item => 
                                item.id === project.id ? { ...item, title: e.target.value } : item
                              )
                            }))}
                            placeholder="Мое приложение"
                          />
                        </FormControl>
                        
                        <FormControl>
                          <FormLabel>Ссылка (опционально)</FormLabel>
                          <Input
                            value={project.link}
                            onChange={(e) => setResumeData(prev => ({
                              ...prev,
                              projects: prev.projects.map(item => 
                                item.id === project.id ? { ...item, link: e.target.value } : item
                              )
                            }))}
                            placeholder="https://github.com/username/project"
                          />
                        </FormControl>
                        
                        <FormControl>
                          <FormLabel>Дата начала</FormLabel>
                          <Input
                            type="month"
                            value={project.startDate}
                            onChange={(e) => setResumeData(prev => ({
                              ...prev,
                              projects: prev.projects.map(item => 
                                item.id === project.id ? { ...item, startDate: e.target.value } : item
                              )
                            }))}
                          />
                        </FormControl>
                        
                        <FormControl>
                          <FormLabel>Дата окончания</FormLabel>
                          <Input
                            type="month"
                            value={project.endDate}
                            onChange={(e) => setResumeData(prev => ({
                              ...prev,
                              projects: prev.projects.map(item => 
                                item.id === project.id ? { ...item, endDate: e.target.value } : item
                              )
                            }))}
                          />
                        </FormControl>
                      </Grid>
                      
                      <FormControl>
                        <FormLabel>Описание</FormLabel>
                        <Textarea
                          value={project.description}
                          onChange={(e) => setResumeData(prev => ({
                            ...prev,
                            projects: prev.projects.map(item => 
                              item.id === project.id ? { ...item, description: e.target.value } : item
                            )
                          }))}
                          placeholder="Описание проекта и ваших достижений..."
                          rows={3}
                        />
                      </FormControl>
                    </VStack>
                  </CardBody>
                </Card>
              ))}
              
              {resumeData.projects.length === 0 && (
                <Center py={8}>
                  <VStack spacing={2}>
                    <Text color={textColor}>Проекты не добавлены</Text>
                    <Button leftIcon={<FaPlus />} onClick={addProject} size="sm">
                      Добавить первый проект
                    </Button>
                  </VStack>
                </Center>
              )}
            </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* Preview Modal */}
      <Modal isOpen={isPreviewOpen} onClose={onPreviewClose} size="6xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack justify="space-between" w="full">
              <Text>Предпросмотр резюме</Text>
              <HStack>
                <Select
                  value={resumeTemplate}
                  onChange={(e) => setResumeTemplate(e.target.value as any)}
                  size="sm"
                  w="150px"
                >
                  <option value="modern">Современный</option>
                  <option value="classic">Классический</option>
                  <option value="creative">Креативный</option>
                  <option value="minimal">Минималистичный</option>
                </Select>
                <Button
                  leftIcon={<FaDownload />}
                  onClick={exportToPDF}
                  size="sm"
                  colorScheme="blue"
                >
                  Скачать PDF
                </Button>
              </HStack>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box
              ref={resumeRef}
              border="1px solid"
              borderColor={borderColor}
              borderRadius="md"
              p={6}
              bg="white"
              color="black"
              minH="800px"
              dangerouslySetInnerHTML={{ __html: generatedHtml || generateSimpleResumeHTML() }}
            />
          </ModalBody>
          <ModalFooter>
            <Button onClick={onPreviewClose}>Закрыть</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );

  // Generate simple HTML preview if no AI-generated content
  function generateSimpleResumeHTML(): string {
    return `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <header style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px;">
          <h1 style="margin: 0; font-size: 2.5em; color: #333;">${resumeData.personalInfo.name || 'Ваше имя'}</h1>
          <p style="margin: 5px 0; font-size: 1.1em; color: #666;">
            ${resumeData.personalInfo.email} | ${resumeData.personalInfo.phone} | ${resumeData.personalInfo.location}
          </p>
          ${resumeData.personalInfo.linkedIn ? `<p style="margin: 5px 0;"><a href="${resumeData.personalInfo.linkedIn}">LinkedIn</a></p>` : ''}
        </header>

        ${resumeData.summary ? `
        <section style="margin-bottom: 25px;">
          <h2 style="color: #333; border-bottom: 1px solid #ccc; padding-bottom: 5px;">Краткое описание</h2>
          <p>${resumeData.summary}</p>
        </section>
        ` : ''}

        ${resumeData.experience.length > 0 ? `
        <section style="margin-bottom: 25px;">
          <h2 style="color: #333; border-bottom: 1px solid #ccc; padding-bottom: 5px;">Опыт работы</h2>
          ${resumeData.experience.map(exp => `
            <div style="margin-bottom: 15px;">
              <h3 style="margin: 0; font-size: 1.2em;">${exp.title} - ${exp.company}</h3>
              <p style="margin: 2px 0; color: #666; font-style: italic;">${exp.startDate} - ${exp.current ? 'настоящее время' : exp.endDate} | ${exp.location}</p>
              <p style="margin: 5px 0;">${exp.description}</p>
            </div>
          `).join('')}
        </section>
        ` : ''}

        ${resumeData.education.length > 0 ? `
        <section style="margin-bottom: 25px;">
          <h2 style="color: #333; border-bottom: 1px solid #ccc; padding-bottom: 5px;">Образование</h2>
          ${resumeData.education.map(edu => `
            <div style="margin-bottom: 15px;">
              <h3 style="margin: 0; font-size: 1.2em;">${edu.degree}</h3>
              <p style="margin: 2px 0; color: #666; font-style: italic;">${edu.institution} | ${edu.startDate} - ${edu.endDate}</p>
              ${edu.gpa ? `<p style="margin: 2px 0;">GPA: ${edu.gpa}</p>` : ''}
              ${edu.description ? `<p style="margin: 5px 0;">${edu.description}</p>` : ''}
            </div>
          `).join('')}
        </section>
        ` : ''}

        ${resumeData.skills.length > 0 ? `
        <section style="margin-bottom: 25px;">
          <h2 style="color: #333; border-bottom: 1px solid #ccc; padding-bottom: 5px;">Навыки</h2>
          <p>${resumeData.skills.join(', ')}</p>
        </section>
        ` : ''}

        ${resumeData.projects.length > 0 ? `
        <section style="margin-bottom: 25px;">
          <h2 style="color: #333; border-bottom: 1px solid #ccc; padding-bottom: 5px;">Проекты</h2>
          ${resumeData.projects.map(project => `
            <div style="margin-bottom: 15px;">
              <h3 style="margin: 0; font-size: 1.2em;">${project.title}</h3>
              <p style="margin: 2px 0; color: #666; font-style: italic;">${project.startDate} - ${project.endDate}</p>
              <p style="margin: 5px 0;">${project.description}</p>
              ${project.link ? `<p style="margin: 2px 0;"><a href="${project.link}">Ссылка на проект</a></p>` : ''}
            </div>
          `).join('')}
        </section>
        ` : ''}

        ${resumeData.languages.length > 0 ? `
        <section style="margin-bottom: 25px;">
          <h2 style="color: #333; border-bottom: 1px solid #ccc; padding-bottom: 5px;">Языки</h2>
          <p>${resumeData.languages.join(', ')}</p>
        </section>
        ` : ''}

        ${resumeData.certifications.length > 0 ? `
        <section style="margin-bottom: 25px;">
          <h2 style="color: #333; border-bottom: 1px solid #ccc; padding-bottom: 5px;">Сертификаты</h2>
          <ul>
            ${resumeData.certifications.map(cert => `<li>${cert}</li>`).join('')}
          </ul>
        </section>
        ` : ''}
      </div>
    `;
  }
};

export default EditableResumeGenerator; 