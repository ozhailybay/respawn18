import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  List,
  ListItem,
  ListIcon,
  Button,
  IconButton,
  Tooltip,
  useColorModeValue,
  Flex,
  Divider,
  Icon,
  Progress,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Code,
  Tag,
  Wrap,
  WrapItem,
  chakra,
  Grid,
  GridItem
} from '@chakra-ui/react';
import {
  FiCheckCircle,
  FiAlertCircle,
  FiDownload,
  FiShare2,
  FiEdit3,
  FiInfo,
  FiBarChart2,
  FiTrendingUp,
  FiThumbsUp,
  FiStar,
  FiAward
} from 'react-icons/fi';
import { 
  BsLightningChargeFill, 
  BsShieldCheck,
  BsStars,
  BsGraphUp,
  BsBullseye,
  BsSpeedometer
} from 'react-icons/bs';
import { 
  FaCheckCircle, 
  FaTimesCircle, 
  FaExclamationTriangle, 
  FaClipboard, 
  FaGraduationCap, 
  FaBriefcase, 
  FaTools, 
  FaLightbulb 
} from 'react-icons/fa';
import { MdContentCopy, MdFormatQuote } from 'react-icons/md';
import { ResumeAnalysis } from '../types';

// @ts-ignore - motion() works with Chakra UI components
const MotionBox = motion(Box);
// @ts-ignore - motion() works with Chakra UI components
const MotionFlex = motion(Flex);
// @ts-ignore - motion() works with Chakra UI components
const MotionText = motion(Text);
// @ts-ignore - motion() works with Chakra UI components
const MotionBadge = motion(Badge);

interface ResumeAnalysisResultProps {
  analysis: ResumeAnalysis;
  onDownload: () => void;
  onShare: () => void;
  onGenerateImproved: () => void;
  isGenerating: boolean;
}

const ResumeAnalysisResult: React.FC<ResumeAnalysisResultProps> = ({
  analysis,
  onDownload,
  onShare,
  onGenerateImproved,
  isGenerating
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  
  // Animate on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setActiveIndex(0);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const headingColor = useColorModeValue('gray.700', 'white');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const badgeBg = useColorModeValue('gray.100', 'gray.700');
  const highlightBg = useColorModeValue('gray.50', 'gray.800');
  const cardBg = useColorModeValue('gray.50', 'gray.700');
  const accentColor = useColorModeValue('black', 'white');
  
  const handleCopyToClipboard = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(section);
    
    setTimeout(() => {
      setCopiedText(null);
    }, 2000);
  };
  
  const openModal = (section: string) => {
    setSelectedSection(section);
    onOpen();
  };
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'green';
    if (score >= 60) return 'yellow';
    return 'red';
  };
  
  const getScoreEmoji = (score: number) => {
    if (score >= 80) return '🚀';
    if (score >= 60) return '👍';
    return '⚠️';
  };

  const renderModalContent = () => {
    switch (selectedSection) {
      case 'improved':
        return (
          <>
            <ModalHeader>Улучшенное резюме</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <Box position="relative">
                <IconButton
                  aria-label="Копировать в буфер обмена"
                  icon={copiedText === 'improved' ? <FaCheckCircle /> : <FaClipboard />}
                  size="sm"
                  position="absolute"
                  top={2}
                  right={2}
                  colorScheme={copiedText === 'improved' ? 'green' : 'gray'}
                  onClick={() => handleCopyToClipboard(analysis.enhancedContent || '', 'improved')}
                />
                <Box
                  p={4}
                  borderWidth="1px"
                  borderRadius="md"
                  fontFamily="mono"
                  whiteSpace="pre-wrap"
                  fontSize="sm"
                  h="500px"
                  overflowY="auto"
                >
                  {analysis.enhancedContent || ''}
                </Box>
              </Box>
            </ModalBody>
          </>
        );
      case 'keywords':
        return (
          <>
            <ModalHeader>Ключевые слова</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <Text mb={4}>
                Эти ключевые слова были определены как важные для вашей отрасли и должности.
                Убедитесь, что ваше резюме включает эти термины там, где это уместно.
              </Text>
              <Box
                p={4}
                borderWidth="1px"
                borderRadius="md"
              >
                <Wrap spacing={3}>
                  {analysis.keywordDensity && Object.entries(analysis.keywordDensity).map(([keyword, density], index) => (
                    <WrapItem key={index}>
                      <MotionBadge 
                        colorScheme={density > 0.05 ? 'green' : density > 0.02 ? 'blue' : 'gray'} 
                        px={3} 
                        py={1.5} 
                        borderRadius="full"
                        fontSize="md"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ 
                          opacity: 1, 
                          scale: 1,
                          transition: { delay: index * 0.05 }
                        }}
                        whileHover={{ scale: 1.1 }}
                      >
                        {keyword} <chakra.span fontWeight="bold" ml={1}>({(density * 100).toFixed(1)}%)</chakra.span>
                      </MotionBadge>
                    </WrapItem>
                  ))}
                </Wrap>
              </Box>
            </ModalBody>
          </>
        );
      default:
        return null;
    }
  };
  
  // Function to render strength/weakness item with animation
  const renderItem = (text: string, isStrength: boolean, index: number) => (
    <MotionFlex
      key={index}
      align="center"
      mb={2}
      initial={{ opacity: 0, x: isStrength ? -20 : 20 }}
      animate={{ 
        opacity: 1, 
        x: 0,
        transition: { delay: index * 0.1 + 0.3 } 
      }}
    >
      <Icon
        as={isStrength ? FiCheckCircle : FiAlertCircle}
        color={isStrength ? 'green.500' : 'gray.700'}
        boxSize={5}
        mr={2}
      />
      <Text>{text}</Text>
    </MotionFlex>
  );
  
  // Generate sections of the radar chart based on section scores
  const sectionScores = Object.entries(analysis.sectionScores || {}).map(([key, value]) => ({
    name: key === 'content' ? 'Содержание' :
          key === 'formatting' ? 'Форматирование' :
          key === 'language' ? 'Язык' :
          key === 'relevance' ? 'Релевантность' :
          key === 'achievements' ? 'Достижения' : key,
    value,
    icon: key === 'content' ? FiEdit3 :
          key === 'formatting' ? FiBarChart2 :
          key === 'language' ? MdFormatQuote :
          key === 'relevance' ? BsBullseye :
          key === 'achievements' ? FiAward : FiInfo
  }));
  
  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      w="100%"
      mb={8}
    >
      <Box
        bg={bgColor}
        borderWidth="1px"
        borderColor={borderColor}
        borderRadius="xl"
        overflow="hidden"
        boxShadow="lg"
      >
        {/* Header with score */}
        <Box 
          bg={useColorModeValue('gray.50', 'gray.800')} 
          p={6}
          borderBottomWidth="1px"
          borderColor={borderColor}
        >
          <Flex direction={{ base: 'column', md: 'row' }} justify="space-between" align="center">
            <VStack align={{ base: 'center', md: 'start' }} spacing={1}>
              <Heading as="h2" size="lg" color={headingColor}>
                Анализ резюме
              </Heading>
              <HStack spacing={2}>
                <Icon as={BsStars} color={accentColor} />
                <Text color={textColor} fontWeight="medium">
                  Powered by AI
                </Text>
              </HStack>
            </VStack>
            
            <MotionBox 
              mt={{ base: 4, md: 0 }}
              px={6} 
              py={4}
              borderRadius="2xl" 
              bg={useColorModeValue('white', 'gray.800')}
              boxShadow="md"
              textAlign="center"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              whileHover={{ y: -5, boxShadow: "lg" }}
            >
              <Text fontWeight="bold" fontSize="md" mb={1} color={textColor}>Общая оценка</Text>
              <Flex justify="center" align="center">
                <MotionText 
                  fontSize="4xl" 
                  fontWeight="bold" 
                  color={`${getScoreColor(analysis.overallScore)}.500`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  {analysis.overallScore}
                </MotionText>
                <Text fontSize="xl" color={textColor} ml={1}>/100</Text>
              </Flex>
              <Tag 
                size="sm" 
                variant="solid" 
                colorScheme={getScoreColor(analysis.overallScore)}
                mt={1}
              >
                {getScoreEmoji(analysis.overallScore)} {analysis.overallScore >= 80 ? 'Отлично' : 
                  analysis.overallScore >= 60 ? 'Хорошо' : 'Требует улучшения'}
              </Tag>
            </MotionBox>
          </Flex>
        </Box>
        
        <Box p={6}>
          <VStack spacing={8} align="stretch">
            {/* Action buttons */}
            <Flex 
              wrap="wrap" 
              gap={3} 
              justify={{ base: 'center', md: 'flex-start' }}
            >
              <MotionBox
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Button
                  leftIcon={<FiDownload />}
                  colorScheme="teal"
                  variant="outline"
                  onClick={onDownload}
                  size="md"
                >
                  Скачать PDF
                </Button>
              </MotionBox>
              
              <MotionBox
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Button
                  leftIcon={<FiShare2 />}
                  colorScheme="teal"
                  variant="outline"
                  onClick={onShare}
                  size="md"
                >
                  Поделиться
                </Button>
              </MotionBox>
              
              <MotionBox
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Button
                  leftIcon={<BsLightningChargeFill />}
                  colorScheme="teal"
                  isLoading={isGenerating}
                  loadingText="Генерация..."
                  onClick={onGenerateImproved}
                  size="md"
                >
                  Улучшить резюме
                </Button>
              </MotionBox>
            </Flex>
            
            <Divider />
            
            {/* Section scores */}
            <Box>
              <Heading as="h3" size="md" mb={4} display="flex" alignItems="center">
                <Icon as={BsSpeedometer} mr={2} color={accentColor} />
                Оценки по категориям
              </Heading>
              
              <Grid 
                templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }}
                gap={4}
              >
                {sectionScores.map(({ name, value, icon }, index) => (
                  <GridItem key={name}>
                    <MotionBox 
                      p={4} 
                      bg={cardBg} 
                      borderRadius="lg"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ 
                        opacity: 1, 
                        y: 0,
                        transition: { delay: 0.1 * index } 
                      }}
                      whileHover={{ y: -4, boxShadow: "md" }}
                    >
                      <HStack mb={2}>
                        <Icon as={icon} color={accentColor} boxSize={5} />
                        <Text fontWeight="medium">{name}</Text>
                      </HStack>
                      
                      <Flex justify="space-between" align="center" mb={2}>
                        <MotionBadge 
                          colorScheme={getScoreColor(value)} 
                          px={2} 
                          py={1}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.3 + index * 0.1 }}
                        >
                          {value}/100
                        </MotionBadge>
                        <Text fontSize="sm" color={textColor}>
                          {value >= 80 ? 'Отлично' : value >= 60 ? 'Хорошо' : 'Требует улучшения'}
                        </Text>
                      </Flex>
                      
                      <Progress 
                        value={value} 
                        colorScheme={getScoreColor(value)} 
                        size="sm" 
                        borderRadius="full" 
                        hasStripe
                        isAnimated
                      />
                    </MotionBox>
                  </GridItem>
                ))}
              </Grid>
            </Box>
            
            {/* Strengths and weaknesses */}
            <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
              {/* Strengths */}
              <MotionBox
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Box 
                  p={5} 
                  borderWidth="1px" 
                  borderColor={borderColor} 
                  borderRadius="lg"
                  bg={useColorModeValue('green.50', 'rgba(72, 187, 120, 0.1)')}
                >
                  <Flex align="center" mb={4}>
                    <Icon as={FiThumbsUp} color="green.500" boxSize={5} mr={2} />
                    <Heading as="h3" size="md">Сильные стороны</Heading>
                  </Flex>
                  <VStack align="stretch">
                    {analysis.strengths.map((strength, index) => 
                      renderItem(strength, true, index)
                    )}
                  </VStack>
                </Box>
              </MotionBox>
              
              {/* Weaknesses */}
              <MotionBox
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Box 
                  p={5} 
                  borderWidth="1px" 
                  borderColor={borderColor} 
                  borderRadius="lg"
                  bg={useColorModeValue('orange.50', 'rgba(107, 114, 128, 0.1)')}
                >
                  <Flex align="center" mb={4}>
                    <Icon as={FiTrendingUp} color="gray.700" boxSize={5} mr={2} />
                    <Heading as="h3" size="md">Возможности для улучшения</Heading>
                  </Flex>
                  <VStack align="stretch">
                    {analysis.weaknesses.map((weakness, index) => 
                      renderItem(weakness, false, index)
                    )}
                  </VStack>
                </Box>
              </MotionBox>
            </Grid>
            
            {/* Recommendations */}
            <MotionBox
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Box>
                <Heading as="h3" size="md" mb={4} display="flex" alignItems="center">
                  <Icon as={FaLightbulb} color={accentColor} mr={2} />
                  Рекомендации
                </Heading>
                
                <Accordion allowToggle>
                  {analysis.recommendations.map((recommendation, index) => (
                    <AccordionItem key={index} border="1px solid" borderColor={borderColor} borderRadius="md" mb={3} overflow="hidden">
                      <AccordionButton 
                        py={3} 
                        _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}
                        bg={activeIndex === index ? useColorModeValue('gray.50', 'gray.800') : 'transparent'}
                        onClick={() => setActiveIndex(index)}
                      >
                        <Box flex="1" textAlign="left" fontWeight="medium">
                          {recommendation.title}
                        </Box>
                        <AccordionIcon />
                      </AccordionButton>
                      <AccordionPanel pb={4}>
                        <Text mb={2}>{recommendation.description}</Text>
                        
                        {recommendation.examples && (
                          <Box mt={3}>
                            <Text fontWeight="medium" mb={2}>Примеры:</Text>
                            <Box 
                              p={3} 
                              bg={useColorModeValue('gray.50', 'gray.700')} 
                              borderRadius="md"
                              fontStyle="italic"
                            >
                              {recommendation.examples}
                            </Box>
                          </Box>
                        )}
                      </AccordionPanel>
                    </AccordionItem>
                  ))}
                </Accordion>
              </Box>
            </MotionBox>
            
            {/* Keyword section */}
            <MotionBox
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Box>
                <Flex align="center" justify="space-between" mb={4}>
                  <Heading as="h3" size="md" display="flex" alignItems="center">
                    <Icon as={BsShieldCheck} color={accentColor} mr={2} />
                    Ключевые слова и навыки
                  </Heading>
                  <Button size="sm" variant="outline" onClick={() => openModal('keywords')}>
                    Показать все
                  </Button>
                </Flex>
                
                <Wrap spacing={3}>
                  {analysis.keywordDensity && 
                    Object.entries(analysis.keywordDensity)
                      .slice(0, 10)
                      .map(([keyword, density], index) => (
                        <WrapItem key={index}>
                          <MotionBadge 
                            colorScheme={density > 0.05 ? 'green' : density > 0.02 ? 'blue' : 'gray'} 
                            px={3} 
                            py={1.5} 
                            borderRadius="full"
                            fontSize="md"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ 
                              opacity: 1, 
                              scale: 1,
                              transition: { delay: index * 0.05 + 0.5 }
                            }}
                            whileHover={{ scale: 1.1 }}
                          >
                            {keyword}
                          </MotionBadge>
                        </WrapItem>
                      ))
                  }
                </Wrap>
              </Box>
            </MotionBox>
            
            {/* Improved resume button */}
            {analysis.enhancedContent && (
              <MotionBox
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                mt={4}
              >
                <Button
                  leftIcon={<FiStar />}
                  colorScheme="teal"
                  variant="solid"
                  size="lg"
                  width="100%"
                  onClick={() => openModal('improved')}
                  height="60px"
                  boxShadow="md"
                  _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
                  _active={{ transform: 'translateY(0)', boxShadow: 'md' }}
                >
                  Посмотреть улучшенное резюме
                </Button>
              </MotionBox>
            )}
          </VStack>
        </Box>
      </Box>
      
      {/* Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          {renderModalContent()}
        </ModalContent>
      </Modal>
    </MotionBox>
  );
};

export default ResumeAnalysisResult;