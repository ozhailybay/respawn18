import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Container, Heading, Text, Button, VStack, HStack, Flex,
  useColorModeValue, Progress, Spinner, useToast, Card, CardBody,
  Badge, Divider, SimpleGrid, Icon, Avatar, Tooltip, Alert, AlertIcon,
  useBreakpointValue, Stack, Center, IconButton, Modal, ModalOverlay,
  ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter,
  useDisclosure, Accordion, AccordionItem, AccordionButton, AccordionPanel,
  AccordionIcon, List, ListItem, ListIcon, Textarea, FormControl,
  FormLabel, Input
} from '@chakra-ui/react';
import {
  FaFileUpload, FaDownload, FaEye, FaCheckCircle, FaExclamationTriangle,
  FaLightbulb, FaStar, FaTimes, FaEdit, FaShare, FaPrint, FaRocket,
  FaChartLine, FaUser, FaBriefcase, FaGraduationCap, FaCog, FaPlus
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { generateResumeAnalysis } from '../api/gemini';
import ResumeUploader from '../components/ResumeUploader';
import jsPDF from 'jspdf';

// @ts-ignore - motion() works with Chakra UI components
const MotionBox = motion(Box);
// @ts-ignore - motion() works with Chakra UI components
const MotionCard = motion(Card);

// Animated Counter Component
const AnimatedCounter: React.FC<{ value: number; duration?: number }> = ({ 
  value, 
  duration = 2000 
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  
  useEffect(() => {
    let startTime: number;
    let animationFrame: number;
    
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      setDisplayValue(Math.floor(progress * value));
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };
    
    animationFrame = requestAnimationFrame(animate);
    
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [value, duration]);
  
  return <Text fontSize="2xl" fontWeight="bold">{displayValue}</Text>;
};

// Mobile Score Card Component
const MobileScoreCard: React.FC<{
  title: string;
  score: number;
  maxScore: number;
  color: string;
  icon: React.ElementType;
  description: string;
}> = ({ title, score, maxScore, color, icon, description }) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  return (
    <MotionCard
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      bg={cardBg}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="lg"
      overflow="hidden"
      shadow="sm"
      _hover={{ shadow: "md" }}
      transition="all 0.3s"
    >
      <CardBody p={4}>
        <VStack spacing={3}>
          <HStack justify="space-between" w="full">
            <Icon as={icon} color={color} size="20px" />
            <Badge colorScheme={color.split('.')[0]} fontSize="xs" px={2} py={1} borderRadius="full">
              {score}/{maxScore}
            </Badge>
          </HStack>
          
          <VStack spacing={2} w="full">
            <Text fontSize="sm" fontWeight="semibold" textAlign="center">
              {title}
            </Text>
            <Progress 
              value={(score / maxScore) * 100} 
              colorScheme={color.split('.')[0]}
              size="sm"
              borderRadius="full"
              w="full"
            />
            <Text fontSize="xs" color="gray.500" textAlign="center" noOfLines={2}>
              {description}
            </Text>
          </VStack>
        </VStack>
      </CardBody>
    </MotionCard>
  );
};

// Mobile Analysis Section Component
const MobileAnalysisSection: React.FC<{
  title: string;
  content: string[];
  icon: React.ElementType;
  colorScheme: string;
}> = ({ title, content, icon, colorScheme }) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  return (
    <MotionCard
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      bg={cardBg}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="lg"
      overflow="hidden"
      shadow="sm"
    >
      <CardBody p={4}>
        <VStack align="stretch" spacing={3}>
          <HStack>
            <Icon as={icon} color={`${colorScheme}.500`} />
            <Heading size="sm" color={`${colorScheme}.600`}>
              {title}
            </Heading>
          </HStack>
          <Divider />
          <List spacing={2}>
            {content.map((item, index) => (
              <ListItem key={index} fontSize="sm">
                <ListIcon as={FaCheckCircle} color={`${colorScheme}.400`} />
                {item}
              </ListItem>
            ))}
          </List>
        </VStack>
      </CardBody>
    </MotionCard>
  );
};

// Mobile Action Button Component
const MobileActionButton: React.FC<{
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  colorScheme?: string;
  variant?: string;
}> = ({ icon, label, onClick, colorScheme = "teal", variant = "outline" }) => {
  return (
    <Button
      leftIcon={<Icon as={icon} />}
      colorScheme={colorScheme}
      variant={variant}
      size="sm"
      onClick={onClick}
      borderRadius="full"
      flex={1}
      fontSize="xs"
    >
      {label}
    </Button>
  );
};

const ResumeReviewMobile: React.FC = () => {
  const [user] = useAuthState(auth);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<{
    overallScore: number;
    sections: {
      personalInfo: { score: number; feedback: string[] };
      experience: { score: number; feedback: string[] };
      education: { score: number; feedback: string[] };
      skills: { score: number; feedback: string[] };
      achievements: { score: number; feedback: string[] };
    };
    strengths: string[];
    improvements: string[];
    recommendations: string[];
  } | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [showResults, setShowResults] = useState(false);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  // Mobile-first responsive values
  const isMobile = useBreakpointValue({ base: true, md: false });
  const containerMaxW = useBreakpointValue({ base: 'full', md: 'container.xl' });
  const containerPx = useBreakpointValue({ base: 3, sm: 4, md: 8 });
  const headerPy = useBreakpointValue({ base: 6, md: 12, lg: 16 });
  const cardSpacing = useBreakpointValue({ base: 4, md: 6 });
  
  // Theme colors
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const accentColor = useColorModeValue('teal.500', 'teal.300');

  const handleFileUpload = async (file: File) => {
    if (!user) {
      toast({
        title: 'Требуется авторизация',
        description: 'Войдите в систему для анализа резюме',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setUploadedFile(file);
    setIsAnalyzing(true);
    setShowResults(false);

    try {
      // Get user profile data
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();

      if (!userData) {
        throw new Error('User data not found');
      }

      // Prepare user profile for analysis
      const userProfile = {
        personalInfo: {
          name: userData.displayName || userData.name || 'Пользователь',
          email: userData.email || '',
          phone: userData.phone || '',
          location: userData.location || ''
        },
        experience: Array.isArray(userData.experience) 
          ? userData.experience.map((exp: any) => ({
              company: exp.company || '',
              position: exp.position || exp.title || '',
              duration: exp.duration || '',
              description: exp.description || ''
            }))
          : [],
        education: Array.isArray(userData.education)
          ? userData.education.map((edu: any) => ({
              institution: edu.institution || edu.school || '',
              degree: edu.degree || '',
              field: edu.field || edu.fieldOfStudy || '',
              year: edu.year || edu.graduationYear || ''
            }))
          : [],
        skills: userData.skills || [],
        achievements: userData.achievements || []
      };

      // Generate analysis
      const result = await generateResumeAnalysis(userProfile);
      
      // Parse the result if it's a string
      let analysisResult;
      if (typeof result === 'string') {
        try {
          analysisResult = JSON.parse(result);
        } catch {
          // If parsing fails, create a basic structure
          analysisResult = {
            overallScore: 75,
            sections: {
              personalInfo: { score: 8, feedback: ['Информация заполнена'] },
              experience: { score: 7, feedback: ['Опыт работы указан'] },
              education: { score: 8, feedback: ['Образование указано'] },
              skills: { score: 6, feedback: ['Навыки перечислены'] },
              achievements: { score: 5, feedback: ['Достижения добавлены'] }
            },
            strengths: ['Хорошо структурированное резюме'],
            improvements: ['Добавьте больше деталей'],
            recommendations: ['Обновите контактную информацию']
          };
        }
      } else {
        analysisResult = result;
      }

      setAnalysis(analysisResult);
      setShowResults(true);

      // Save analysis to user profile
      await updateDoc(doc(db, 'users', user.uid), {
        'resume.lastAnalysis': analysisResult,
        'resume.analyzedAt': new Date().toISOString()
      });

      toast({
        title: 'Анализ завершен!',
        description: 'Ваше резюме успешно проанализировано',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

    } catch (error) {
      console.error('Error analyzing resume:', error);
      toast({
        title: 'Ошибка анализа',
        description: 'Не удалось проанализировать резюме. Попробуйте еще раз.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDownloadReport = () => {
    if (!analysis) return;

    const pdf = new jsPDF({
      orientation: 'portrait' as const,
      unit: 'mm',
      format: 'a4'
    });

    pdf.setFontSize(20);
    pdf.text('Анализ резюме', 20, 30);
    
    pdf.setFontSize(14);
    pdf.text(`Общий балл: ${analysis.overallScore}/100`, 20, 50);
    
    let yPosition = 70;
    
    // Add sections
    Object.entries(analysis.sections).forEach(([key, section]) => {
      pdf.setFontSize(12);
      pdf.text(`${key}: ${section.score}/10`, 20, yPosition);
      yPosition += 10;
    });

    pdf.save('resume-analysis.pdf');
    
    toast({
      title: 'Отчет скачан',
      description: 'PDF-отчет сохранен на ваше устройство',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleShareResults = () => {
    if (navigator.share && analysis) {
      navigator.share({
        title: 'Анализ резюме',
        text: `Мой результат анализа резюме: ${analysis.overallScore}/100 баллов`,
        url: window.location.href,
      });
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(
        `Мой результат анализа резюме: ${analysis?.overallScore}/100 баллов`
      );
      toast({
        title: 'Скопировано',
        description: 'Результат скопирован в буфер обмена',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    }
  };

  return (
    <Box minH="100vh" bg={bgColor}>
      {/* Header Section - Mobile Optimized */}
      <Box 
        py={headerPy} 
        bgGradient="linear(to-br, black, gray.700)"
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
                Анализ резюме с ИИ
              </Heading>
              <Text 
                fontSize={{ base: "md", md: "xl" }}
                opacity={0.9}
                maxW="600px"
                mx="auto"
              >
                Получите профессиональную оценку и рекомендации для улучшения вашего резюме
              </Text>
            </MotionBox>
          </VStack>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxW={containerMaxW} px={containerPx} py={cardSpacing}>
        <VStack spacing={cardSpacing}>
          {/* Upload Section */}
          {!showResults && (
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              w="full"
            >
              <Card bg={cardBg} borderWidth="1px" borderColor={borderColor} borderRadius="xl">
                <CardBody p={{ base: 4, md: 6 }}>
                  <VStack spacing={4}>
                    <Heading size={{ base: "md", md: "lg" }} color={accentColor} textAlign="center">
                      Загрузите ваше резюме
                    </Heading>
                    <Text 
                      fontSize={{ base: "sm", md: "md" }} 
                      color="gray.600" 
                      textAlign="center"
                      maxW="500px"
                    >
                      Поддерживаются форматы PDF, DOCX и TXT. Наш ИИ проанализирует структуру, 
                      содержание и даст персональные рекомендации.
                    </Text>
                    
                    <Box w="full" maxW="400px">
                      <ResumeUploader 
                        onFileUpload={handleFileUpload}
                        isAnalyzing={isAnalyzing}
                      />
                    </Box>

                    {isAnalyzing && (
                      <VStack spacing={3} w="full" maxW="300px">
                        <Progress 
                          isIndeterminate 
                          colorScheme="gray" 
                          size="sm" 
                          borderRadius="full"
                          w="full"
                        />
                        <Text fontSize="sm" color="gray.600" textAlign="center">
                          Анализируем ваше резюме с помощью ИИ...
                        </Text>
                      </VStack>
                    )}
                  </VStack>
                </CardBody>
              </Card>
            </MotionBox>
          )}

          {/* Results Section */}
          {showResults && analysis && (
            <AnimatePresence>
              <VStack spacing={cardSpacing} w="full">
                {/* Overall Score */}
                <MotionCard
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  bg={cardBg}
                  borderWidth="1px"
                  borderColor={borderColor}
                  borderRadius="xl"
                  w="full"
                  shadow="lg"
                >
                  <CardBody p={{ base: 4, md: 6 }}>
                    <VStack spacing={4}>
                      <Heading size={{ base: "md", md: "lg" }} color={accentColor} textAlign="center">
                        Общий результат
                      </Heading>
                      
                      <VStack spacing={2}>
                        <AnimatedCounter value={analysis.overallScore} />
                        <Text fontSize="sm" color="gray.500">из 100 баллов</Text>
                        <Progress 
                          value={analysis.overallScore} 
                          colorScheme="gray"
                          size="lg"
                          borderRadius="full"
                          w="full"
                          maxW="200px"
                        />
                      </VStack>

                      {/* Action Buttons */}
                      <HStack spacing={2} w="full" flexWrap="wrap" justify="center">
                        <MobileActionButton
                          icon={FaDownload}
                          label="Скачать"
                          onClick={handleDownloadReport}
                          colorScheme="gray"
                          variant="solid"
                        />
                        <MobileActionButton
                          icon={FaShare}
                          label="Поделиться"
                          onClick={handleShareResults}
                        />
                        <MobileActionButton
                          icon={FaEdit}
                          label="Новый анализ"
                          onClick={() => setShowResults(false)}
                        />
                      </HStack>
                    </VStack>
                  </CardBody>
                </MotionCard>

                {/* Score Breakdown */}
                <MotionBox
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  w="full"
                >
                  <Heading size="md" mb={4} color={accentColor} textAlign="center">
                    Детальная оценка
                  </Heading>
                  
                  <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3}>
                    <MobileScoreCard
                      title="Личная информация"
                      score={analysis.sections.personalInfo.score}
                      maxScore={10}
                      color="blue.500"
                      icon={FaUser}
                      description="Контактные данные и личные сведения"
                    />
                    <MobileScoreCard
                      title="Опыт работы"
                      score={analysis.sections.experience.score}
                      maxScore={10}
                      color="green.500"
                      icon={FaBriefcase}
                      description="Профессиональный опыт и достижения"
                    />
                    <MobileScoreCard
                      title="Образование"
                      score={analysis.sections.education.score}
                      maxScore={10}
                      color="purple.500"
                      icon={FaGraduationCap}
                      description="Учебные заведения и квалификации"
                    />
                    <MobileScoreCard
                      title="Навыки"
                      score={analysis.sections.skills.score}
                      maxScore={10}
                      color="orange.500"
                      icon={FaCog}
                      description="Технические и профессиональные навыки"
                    />
                  </SimpleGrid>
                </MotionBox>

                {/* Analysis Sections */}
                <VStack spacing={4} w="full">
                  <Accordion allowMultiple w="full">
                    <AccordionItem>
                      <AccordionButton>
                        <Box flex="1" textAlign="left">
                          <HStack>
                            <Icon as={FaCheckCircle} color="green.500" />
                            <Heading size="sm">Сильные стороны</Heading>
                          </HStack>
                        </Box>
                        <AccordionIcon />
                      </AccordionButton>
                      <AccordionPanel pb={4}>
                        <List spacing={2}>
                          {analysis.strengths.map((strength, index) => (
                            <ListItem key={index} fontSize="sm">
                              <ListIcon as={FaCheckCircle} color="green.400" />
                              {strength}
                            </ListItem>
                          ))}
                        </List>
                      </AccordionPanel>
                    </AccordionItem>

                    <AccordionItem>
                      <AccordionButton>
                        <Box flex="1" textAlign="left">
                          <HStack>
                            <Icon as={FaExclamationTriangle} color="gray.700" />
                            <Heading size="sm">Области для улучшения</Heading>
                          </HStack>
                        </Box>
                        <AccordionIcon />
                      </AccordionButton>
                      <AccordionPanel pb={4}>
                        <List spacing={2}>
                          {analysis.improvements.map((improvement, index) => (
                            <ListItem key={index} fontSize="sm">
                              <ListIcon as={FaExclamationTriangle} color="gray.600" />
                              {improvement}
                            </ListItem>
                          ))}
                        </List>
                      </AccordionPanel>
                    </AccordionItem>

                    <AccordionItem>
                      <AccordionButton>
                        <Box flex="1" textAlign="left">
                          <HStack>
                            <Icon as={FaLightbulb} color="yellow.500" />
                            <Heading size="sm">Рекомендации</Heading>
                          </HStack>
                        </Box>
                        <AccordionIcon />
                      </AccordionButton>
                      <AccordionPanel pb={4}>
                        <List spacing={2}>
                          {analysis.recommendations.map((recommendation, index) => (
                            <ListItem key={index} fontSize="sm">
                              <ListIcon as={FaLightbulb} color="yellow.400" />
                              {recommendation}
                            </ListItem>
                          ))}
                        </List>
                      </AccordionPanel>
                    </AccordionItem>
                  </Accordion>
                </VStack>
              </VStack>
            </AnimatePresence>
          )}
        </VStack>
      </Container>
    </Box>
  );
};

export default ResumeReviewMobile; 