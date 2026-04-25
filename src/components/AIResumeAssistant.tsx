import React, { useState, useEffect } from 'react';
import {
  Box, VStack, HStack, Text, Button, Input, Textarea, Card, CardBody,
  CardHeader, Avatar, Icon, useColorModeValue, useToast, Spinner,
  Progress, Badge, Tag, TagLabel, Wrap, WrapItem, Modal, ModalOverlay,
  ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton,
  useDisclosure, Accordion, AccordionItem, AccordionButton, AccordionPanel,
  AccordionIcon, List, ListItem, ListIcon, Alert, AlertIcon, AlertTitle,
  AlertDescription, Stat, StatLabel, StatNumber, StatHelpText, StatArrow,
  Tooltip, IconButton, Divider, SimpleGrid, useBreakpointValue
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaRobot, FaBrain, FaMagic, FaLightbulb, FaStar, FaCheck, FaTimes,
  FaEye, FaDownload, FaSave, FaShare, FaCopy, FaThumbsUp, FaComments,
  FaSync, FaPlay, FaPause, FaStop, FaVolumeUp, FaVolumeMute, FaExpand,
  FaCompress, FaSearch, FaFilter, FaSort, FaBookmark, FaBookmark as FaBookmarkOutline,
  FaUser, FaBriefcase, FaGraduationCap, FaTools, FaProjectDiagram,
  FaAward, FaCertificate, FaLanguage, FaMapMarkerAlt, FaEnvelope,
  FaPhone, FaLinkedin, FaGithub, FaGlobe, FaChartLine, FaBullseye,
  FaCalendarAlt, FaBuilding, FaWrench, FaGem, FaCrown,
  FaInfinity, FaFire, FaRocket, FaShieldAlt
} from 'react-icons/fa';
import { generateEnhancedResume, generateSuggestions, generateSectionSuggestions } from '../api/enhancedGemini';

// @ts-ignore - motion() works with Chakra UI components
const MotionBox = motion(Box);
// @ts-ignore - motion() works with Chakra UI components
const MotionCard = motion(Card);
// @ts-ignore - motion() works with Chakra UI components
const MotionButton = motion(Button);

interface AIAssistantProps {
  onResumeGenerated: (html: string, css: string) => void;
  onSuggestionSelected: (suggestion: string) => void;
}

const AIResumeAssistant: React.FC<AIAssistantProps> = ({
  onResumeGenerated,
  onSuggestionSelected
}) => {
  const toast = useToast();
  const { isOpen: isSuggestionOpen, onOpen: onSuggestionOpen, onClose: onSuggestionClose } = useDisclosure();
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Simulate AI generation progress
  useEffect(() => {
    if (isGenerating) {
      const steps = [
        'Анализирую профиль...',
        'Генерирую контент...',
        'Применяю стили...',
        'Оптимизирую дизайн...',
        'Финальная проверка...'
      ];
      
      let stepIndex = 0;
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            setIsGenerating(false);
            return 100;
          }
          const newProgress = prev + Math.random() * 20;
          if (newProgress > (stepIndex + 1) * 20) {
            setCurrentStep(steps[stepIndex]);
            stepIndex++;
          }
          return newProgress;
        });
      }, 800);
      
      return () => clearInterval(interval);
    }
  }, [isGenerating]);

  const handleGenerateResume = async (profile: any) => {
    setIsGenerating(true);
    setProgress(0);
    setCurrentStep('Начинаю генерацию...');
    
    try {
      const result = await generateEnhancedResume(profile, 'modern', 'professional');
      onResumeGenerated(result.html, result.css);
      setSuggestions(result.suggestions);
      
      toast({
        title: 'Резюме создано!',
        description: 'ИИ успешно сгенерировал ваше резюме',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
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
      setProgress(100);
    }
  };

  const handleAnalyzeResume = async (resumeData: any) => {
    setIsAnalyzing(true);
    
    try {
      // Simulate analysis
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setAnalysisResult({
        overallScore: 85,
        strengths: [
          'Хорошая структура резюме',
          'Релевантный опыт работы',
          'Четкое описание навыков'
        ],
        improvements: [
          'Добавить количественные результаты',
          'Расширить раздел проектов',
          'Улучшить краткое описание'
        ],
        sectionScores: {
          personalInfo: 90,
          summary: 75,
          experience: 85,
          education: 80,
          skills: 90,
          projects: 70
        }
      });
      
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

  const handleSuggestionClick = (suggestion: string) => {
    setSelectedSuggestion(suggestion);
    onSuggestionSelected(suggestion);
    onSuggestionOpen();
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Скопировано',
      description: 'Текст скопирован в буфер обмена',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card bg={cardBg} border="1px solid" borderColor={borderColor} h="fit-content">
        <CardHeader>
          <HStack spacing={3} justify="space-between">
            <HStack spacing={3}>
              <Avatar size="md" bg="purple.500" icon={<FaBrain />} />
              <Box>
                <Text fontWeight="bold" fontSize="lg">AI Ассистент</Text>
                <Text fontSize="sm" color="gray.500">Gemini AI</Text>
              </Box>
            </HStack>
            <HStack spacing={2}>
              <Tooltip label={isMuted ? 'Включить звук' : 'Выключить звук'}>
                <IconButton
                  aria-label="Toggle sound"
                  icon={<Icon as={isMuted ? FaVolumeMute : FaVolumeUp} />}
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsMuted(!isMuted)}
                />
              </Tooltip>
              <Tooltip label={isExpanded ? 'Свернуть' : 'Развернуть'}>
                <IconButton
                  aria-label="Toggle expand"
                  icon={<Icon as={isExpanded ? FaCompress : FaExpand} />}
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsExpanded(!isExpanded)}
                />
              </Tooltip>
            </HStack>
          </HStack>
        </CardHeader>

        <CardBody>
          <VStack spacing={6} align="stretch">
            {/* AI Status */}
            <Alert status="info" borderRadius="md">
              <AlertIcon />
              <Box>
                <AlertTitle>Готов к работе</AlertTitle>
                <AlertDescription>
                  ИИ готов помочь создать профессиональное резюме
                </AlertDescription>
              </Box>
            </Alert>

            {/* Generation Progress */}
            <AnimatePresence>
              {isGenerating && (
                <MotionBox
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <VStack spacing={3}>
                    <HStack spacing={3} w="full">
                      <Spinner color="purple.500" size="sm" />
                      <Text fontSize="sm" fontWeight="medium">
                        {currentStep}
                      </Text>
                    </HStack>
                    <Progress 
                      value={progress} 
                      colorScheme="purple" 
                      size="sm" 
                      borderRadius="full"
                      w="full"
                    />
                    <Text fontSize="xs" color="gray.500">
                      {Math.round(progress)}% завершено
                    </Text>
                  </VStack>
                </MotionBox>
              )}
            </AnimatePresence>

            {/* Quick Actions */}
            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={3}>
                Быстрые действия
              </Text>
              <SimpleGrid columns={2} spacing={2}>
                <MotionButton
                  size="sm"
                  colorScheme="purple"
                  leftIcon={<FaMagic />}
                  onClick={() => handleGenerateResume({})}
                  isLoading={isGenerating}
                  loadingText="Генерирую..."
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Создать резюме
                </MotionButton>
                <MotionButton
                  size="sm"
                  colorScheme="blue"
                  variant="outline"
                  leftIcon={<FaBrain />}
                  onClick={() => handleAnalyzeResume({})}
                  isLoading={isAnalyzing}
                  loadingText="Анализирую..."
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Анализ ИИ
                </MotionButton>
              </SimpleGrid>
            </Box>

            {/* AI Suggestions */}
            {suggestions.length > 0 && (
              <Box>
                <Text fontSize="sm" fontWeight="medium" mb={3}>
                  Рекомендации ИИ
                </Text>
                <VStack spacing={2} align="stretch">
                  {suggestions.slice(0, 3).map((suggestion, index) => (
                    <MotionCard
                      key={index}
                      size="sm"
                      variant="outline"
                      cursor="pointer"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      <CardBody py={3}>
                        <HStack spacing={2}>
                          <Icon as={FaLightbulb} color="orange.500" boxSize={4} />
                          <Text fontSize="sm">{suggestion}</Text>
                        </HStack>
                      </CardBody>
                    </MotionCard>
                  ))}
                </VStack>
              </Box>
            )}

            {/* Analysis Results */}
            {analysisResult && (
              <Box>
                <Text fontSize="sm" fontWeight="medium" mb={3}>
                  Результаты анализа
                </Text>
                <VStack spacing={3} align="stretch">
                  <Stat>
                    <StatLabel>Общий балл</StatLabel>
                    <StatNumber color="green.500">{analysisResult.overallScore}/100</StatNumber>
                    <StatHelpText>
                      <StatArrow type="increase" />
                      15.2%
                    </StatHelpText>
                  </Stat>
                  
                  <SimpleGrid columns={2} spacing={2}>
                    <Box>
                      <Text fontSize="xs" color="gray.500">Сильные стороны</Text>
                      <Text fontSize="sm" fontWeight="medium" color="green.500">
                        {analysisResult.strengths.length}
                      </Text>
                    </Box>
                    <Box>
                      <Text fontSize="xs" color="gray.500">Улучшения</Text>
                      <Text fontSize="sm" fontWeight="medium" color="orange.500">
                        {analysisResult.improvements.length}
                      </Text>
                    </Box>
                  </SimpleGrid>
                </VStack>
              </Box>
            )}

            {/* AI Features */}
            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={3}>
                Возможности ИИ
              </Text>
              <Wrap spacing={2}>
                <WrapItem>
                  <Tag colorScheme="purple" size="sm">
                    <TagLabel>Умная генерация</TagLabel>
                  </Tag>
                </WrapItem>
                <WrapItem>
                  <Tag colorScheme="blue" size="sm">
                    <TagLabel>Анализ качества</TagLabel>
                  </Tag>
                </WrapItem>
                <WrapItem>
                  <Tag colorScheme="green" size="sm">
                    <TagLabel>Персонализация</TagLabel>
                  </Tag>
                </WrapItem>
                <WrapItem>
                  <Tag colorScheme="orange" size="sm">
                    <TagLabel>Рекомендации</TagLabel>
                  </Tag>
                </WrapItem>
              </Wrap>
            </Box>
          </VStack>
        </CardBody>
      </Card>

      {/* Suggestion Modal */}
      <Modal isOpen={isSuggestionOpen} onClose={onSuggestionClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack spacing={2}>
              <Icon as={FaLightbulb} color="orange.500" />
              <Text>Рекомендация ИИ</Text>
            </HStack>
          </ModalHeader>
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Text fontSize="lg" fontWeight="medium">
                {selectedSuggestion}
              </Text>
              <Alert status="info" borderRadius="md">
                <AlertIcon />
                <Box>
                  <AlertTitle>Как применить</AlertTitle>
                  <AlertDescription>
                    Эта рекомендация поможет улучшить качество вашего резюме
                  </AlertDescription>
                </Box>
              </Alert>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <HStack spacing={2}>
              <Button
                leftIcon={<FaCopy />}
                variant="outline"
                onClick={() => handleCopyToClipboard(selectedSuggestion)}
              >
                Копировать
              </Button>
              <Button
                leftIcon={<FaCheck />}
                colorScheme="purple"
                onClick={onSuggestionClose}
              >
                Применить
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </MotionBox>
  );
};

export default AIResumeAssistant; 