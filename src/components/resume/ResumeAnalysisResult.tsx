import React, { useState } from 'react';
import {
  Box,
  Text,
  Heading,
  VStack,
  HStack,
  Badge,
  Divider,
  Button,
  useColorModeValue,
  Flex,
  Icon,
  Tooltip,
  Progress,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  List,
  ListItem,
  ListIcon,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Code
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import {
  FiDownload,
  FiShare2,
  FiEdit3,
  FiBarChart2,
  FiCheckCircle,
  FiAlertCircle
} from 'react-icons/fi';
import { FaCheckCircle, FaExclamationTriangle, FaClipboard } from 'react-icons/fa';
import { MdContentCopy } from 'react-icons/md';
import { ResumeAnalysis } from '../../types';

// @ts-ignore - motion() works with Chakra UI components
const MotionBox = motion(Box);

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
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const headingColor = useColorModeValue('gray.700', 'white');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const badgeBg = useColorModeValue('gray.100', 'gray.700');
  const highlightBg = useColorModeValue('gray.50', 'gray.800');
  
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
                <VStack align="start" spacing={3}>
                  {analysis.keywords && analysis.keywords.map((keyword, index) => (
                    <HStack key={index}>
                      <Badge 
                        colorScheme={keyword.included ? 'green' : 'gray'} 
                        px={2} 
                        py={1} 
                        borderRadius="full"
                      >
                        {keyword.term}
                      </Badge>
                      <Text>{keyword.relevance}%</Text>
                    </HStack>
                  ))}
                  
                  {analysis.keywordDensity && Object.entries(analysis.keywordDensity).map(([keyword, density], index) => (
                    <HStack key={`density-${index}`}>
                      <Badge 
                        colorScheme={density > 0.05 ? 'green' : density > 0.02 ? 'blue' : 'gray'} 
                        px={2} 
                        py={1} 
                        borderRadius="full"
                      >
                        {keyword}
                      </Badge>
                      <Text>{density.toFixed(2)}</Text>
                    </HStack>
                  ))}
                </VStack>
              </Box>
            </ModalBody>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      w="100%"
    >
      <Box
        bg={bgColor}
      borderWidth="1px"
        borderColor={borderColor}
      borderRadius="lg"
      overflow="hidden"
        boxShadow="sm"
      >
        <Box p={6}>
          <VStack spacing={6} align="stretch">
            {/* Заголовок и общая оценка */}
            <Flex direction={{ base: 'column', md: 'row' }} justify="space-between" align="center">
              <Box>
                <Heading as="h2" size="lg" color={headingColor} mb={2}>
                  Анализ резюме
          </Heading>
          <Text color={textColor}>
                  Подробный анализ вашего резюме с рекомендациями по улучшению
          </Text>
              </Box>
              
              <Box 
                mt={{ base: 4, md: 0 }}
          p={4}
          borderRadius="lg"
                bg={highlightBg}
                textAlign="center"
              >
                <Text fontWeight="bold" mb={1}>Общая оценка</Text>
                <Flex justify="center" align="center">
                  <Text fontSize="4xl" fontWeight="bold" color={`${getScoreColor(analysis.overallScore)}.500`}>
                    {analysis.overallScore}
                  </Text>
                  <Text fontSize="xl" color={textColor} ml={1}>/100</Text>
                </Flex>
              </Box>
      </Flex>
      
            <Divider />
            
            {/* Секция оценок по категориям */}
            <Box>
              <Heading as="h3" size="md" mb={4}>
                Оценки по категориям
        </Heading>
        
              <VStack spacing={4} align="stretch">
                {Object.entries(analysis.sectionScores).map(([section, score]) => (
                  <Box key={section}>
                    <Flex justify="space-between" align="center" mb={1}>
                      <Text fontWeight="medium">
                        {section === 'content' && 'Содержание'}
                        {section === 'formatting' && 'Форматирование'}
                        {section === 'language' && 'Язык и грамматика'}
                        {section === 'relevance' && 'Релевантность'}
                        {section === 'achievements' && 'Достижения'}
                      </Text>
                      <Badge colorScheme={getScoreColor(score)} px={2} py={1}>
                        {score}/100
                      </Badge>
        </Flex>
          <Progress 
                      value={score} 
                      colorScheme={getScoreColor(score)} 
            size="sm" 
            borderRadius="full" 
                    />
                  </Box>
                ))}
              </VStack>
      </Box>
      
            <Divider />
            
            {/* Сильные и слабые стороны */}
            <Box>
              <Heading as="h3" size="md" mb={4}>
                Сильные и слабые стороны
              </Heading>
              
              <Flex direction={{ base: 'column', md: 'row' }} gap={4}>
                <Box flex="1" p={4} borderWidth="1px" borderRadius="md" borderColor={borderColor}>
                  <Heading as="h4" size="sm" mb={3} color="green.500">
                    Сильные стороны
                  </Heading>
                  <List spacing={2}>
                    {analysis.strengths.map((strength, index) => (
                      <ListItem key={index}>
                        <HStack align="start">
                          <ListIcon as={FaCheckCircle} color="green.500" mt={1} />
                          <Text>{strength}</Text>
            </HStack>
                      </ListItem>
                    ))}
                  </List>
                </Box>
                
                <Box flex="1" p={4} borderWidth="1px" borderRadius="md" borderColor={borderColor}>
                  <Heading as="h4" size="sm" mb={3} color="red.500">
                    Слабые стороны
                  </Heading>
            <List spacing={2}>
                    {analysis.weaknesses.map((weakness, index) => (
                      <ListItem key={index}>
                        <HStack align="start">
                          <ListIcon as={FaExclamationTriangle} color="red.500" mt={1} />
                          <Text>{weakness}</Text>
                        </HStack>
                </ListItem>
              ))}
            </List>
                </Box>
              </Flex>
            </Box>
            
            <Divider />
            
            {/* Рекомендации */}
            <Box>
              <Heading as="h3" size="md" mb={4}>
                Рекомендации
              </Heading>
              
              <Accordion allowMultiple>
                {analysis.recommendations.map((rec, index) => (
                  <AccordionItem key={index} borderWidth="1px" borderRadius="md" mb={2} overflow="hidden">
                    <h2>
                      <AccordionButton py={3}>
                        <HStack flex="1" textAlign="left" spacing={3}>
                          <Badge 
                            colorScheme={
                              rec.priority === 'high' ? 'red' : 
                              rec.priority === 'medium' ? 'yellow' : 'blue'
                            }
                            variant="solid"
                          >
                            {rec.priority === 'high' ? 'Высокий' : 
                             rec.priority === 'medium' ? 'Средний' : 'Низкий'} приоритет
                          </Badge>
                          <Text fontWeight="medium">{rec.title}</Text>
            </HStack>
            <AccordionIcon />
          </AccordionButton>
                    </h2>
          <AccordionPanel pb={4}>
                      <Text>{rec.description}</Text>
          </AccordionPanel>
        </AccordionItem>
                ))}
              </Accordion>
            </Box>
            
            <Divider />
            
            {/* Советы по улучшению */}
            <Box>
              <Heading as="h3" size="md" mb={4}>
                Советы по улучшению
              </Heading>
              
              <VStack spacing={4} align="stretch">
                {analysis.improvementTips.map((tip, index) => (
                  <Box key={index} p={4} borderWidth="1px" borderRadius="md" borderColor={borderColor}>
                    <Heading as="h4" size="sm" mb={2}>
                      {tip.title}
                    </Heading>
                    <Text mb={tip.example ? 3 : 0}>{tip.description}</Text>
                    {tip.example && (
                      <Box mt={2} p={3} borderRadius="md" bg={badgeBg}>
                        <Text fontWeight="medium" mb={1} fontSize="sm">Пример:</Text>
                        <Code p={2} borderRadius="md" w="100%">
                          {tip.example}
                        </Code>
                      </Box>
                    )}
                  </Box>
                ))}
              </VStack>
            </Box>
            
            {/* Отсутствующие элементы */}
            {analysis.missingElements && analysis.missingElements.length > 0 && (
              <>
                <Divider />
                
                <Box>
                  <Heading as="h3" size="md" mb={4}>
                    Отсутствующие элементы
                  </Heading>
                  
                  <List spacing={3}>
                    {analysis.missingElements.map((element, index) => (
                      <ListItem key={index} p={3} borderWidth="1px" borderRadius="md" borderColor={borderColor}>
                        <HStack align="start" spacing={3}>
                          <Icon as={FaExclamationTriangle} color="gray.700" mt={1} />
                          <Box>
                            <Text fontWeight="medium">{element.element}</Text>
                            <Text fontSize="sm" color={textColor}>{element.description}</Text>
                          </Box>
            </HStack>
                </ListItem>
              ))}
            </List>
                </Box>
              </>
            )}
            
            {/* Улучшенное резюме */}
            {analysis.enhancedContent && (
              <>
                <Divider />
                
                <Box>
                  <Flex justify="space-between" align="center" mb={4}>
                    <Heading as="h3" size="md">
                      Улучшенная версия резюме
            </Heading>
                    <HStack>
                      <Tooltip label="Посмотреть улучшенное резюме">
                        <Button 
                          size="sm" 
                          leftIcon={<FiEdit3 />} 
                          colorScheme="gray" 
                          variant="outline"
                          onClick={() => openModal('improved')}
                        >
                          Просмотр
                        </Button>
                      </Tooltip>
                      <Tooltip label={copiedText === 'improved' ? 'Скопировано!' : 'Копировать в буфер обмена'}>
                        <IconButton
                          aria-label="Копировать в буфер обмена"
                          icon={copiedText === 'improved' ? <FaCheckCircle /> : <MdContentCopy />}
                          size="sm"
                          colorScheme={copiedText === 'improved' ? 'green' : 'gray'}
                          onClick={() => handleCopyToClipboard(analysis.enhancedContent || '', 'improved')}
                        />
                      </Tooltip>
                    </HStack>
                  </Flex>
                  
                  <Text fontSize="sm" color={textColor} mb={4}>
                    Мы создали улучшенную версию вашего резюме на основе проведенного анализа.
                    Нажмите "Просмотр" для детального ознакомления.
                  </Text>
                </Box>
              </>
            )}
            
            {/* Кнопка генерации улучшенного резюме */}
            {!analysis.enhancedContent && !analysis.improvedResume && (
              <>
                <Divider />
                
                <Box textAlign="center" py={4}>
                  <Button
                    colorScheme="gray"
                    size="lg"
                    leftIcon={<FiEdit3 />}
                    onClick={onGenerateImproved}
                    isLoading={isGenerating}
                    loadingText="Генерация..."
                  >
                    Создать улучшенную версию резюме
                  </Button>
                  <Text fontSize="sm" color={textColor} mt={2}>
                    Наш ИИ создаст улучшенную версию вашего резюме на основе проведенного анализа
                  </Text>
                </Box>
              </>
            )}
            
            {/* Кнопки действий */}
            <Divider />
            <Flex justify="space-between">
              <Button 
                leftIcon={<FiDownload />}
                colorScheme="gray"
                variant="outline"
                onClick={onDownload}
              >
                Скачать отчет
              </Button>
              
              <Button
                leftIcon={<FiShare2 />}
                colorScheme="gray"
                variant="outline"
                onClick={onShare}
              >
                Поделиться
              </Button>
            </Flex>
          </VStack>
        </Box>
      </Box>
      
      {/* Модальное окно для детального просмотра */}
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