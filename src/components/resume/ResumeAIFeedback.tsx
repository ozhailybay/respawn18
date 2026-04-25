import React, { useState } from 'react';
import {
  Box,
  VStack,
  Text,
  Heading,
  useColorModeValue,
  HStack,
  Icon,
  Badge,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Button,
  Flex,
  Tooltip,
  IconButton
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { 
  FaLightbulb,
  FaCheck,
  FaClipboard,
  FaExclamationTriangle,
  FaCheckCircle
} from 'react-icons/fa';
import { BiCodeBlock } from 'react-icons/bi';
import { MdPriorityHigh } from 'react-icons/md';

// @ts-ignore - motion() works with Chakra UI components
const MotionBox = motion(Box);

interface RecommendationType {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  exampleBefore?: string;
  exampleAfter?: string;
}

interface TipType {
  title: string;
  description: string;
  example?: string;
}

interface MissingElementType {
  element: string;
  description: string;
}

interface ResumeAIFeedbackProps {
  recommendations: RecommendationType[];
  tips: TipType[];
  missingElements: MissingElementType[];
}

const ResumeAIFeedback: React.FC<ResumeAIFeedbackProps> = ({
  recommendations,
  tips,
  missingElements
}) => {
  const [copiedText, setCopiedText] = useState<string | null>(null);
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const headingColor = useColorModeValue('gray.700', 'white');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const badgeBg = useColorModeValue('gray.100', 'gray.700');
  const highlightBg = useColorModeValue('gray.50', 'gray.800');
  
  const handleCopyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    
    setTimeout(() => {
      setCopiedText(null);
    }, 2000);
  };
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'red';
      case 'medium': return 'orange';
      case 'low': return 'gray';
      default: return 'gray';
    }
  };
  
  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Box mb={8}>
        <Heading as="h3" size="lg" mb={6} color={headingColor}>
          Рекомендации ИИ
        </Heading>
        
        {/* Рекомендации */}
        <Box mb={8}>
          <HStack spacing={2} mb={4}>
            <Icon as={MdPriorityHigh} color={useColorModeValue('black', 'white')} boxSize={5} />
            <Heading as="h4" size="md" color={headingColor}>
              Ключевые рекомендации
            </Heading>
          </HStack>
          
          <Accordion allowMultiple>
            {recommendations.map((rec, index) => (
              <MotionBox
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                mb={3}
              >
                <AccordionItem 
                  border="1px solid" 
                  borderColor={borderColor} 
                  borderRadius="md" 
                  overflow="hidden"
                >
                  <h2>
                    <AccordionButton py={3} px={4} _hover={{ bg: highlightBg }}>
                      <HStack flex="1" textAlign="left" spacing={3}>
                        <Badge 
                          colorScheme={getPriorityColor(rec.priority)} 
                          variant="solid"
                          borderRadius="full"
                          px={3}
                          py={1}
                        >
                          {rec.priority === 'high' ? 'Высокий' : 
                           rec.priority === 'medium' ? 'Средний' : 'Низкий'} приоритет
                        </Badge>
                        <Text fontWeight="medium" color={headingColor}>{rec.title}</Text>
                      </HStack>
                      <AccordionIcon />
                    </AccordionButton>
                  </h2>
                  <AccordionPanel pb={4} pt={2} px={4} bg={useColorModeValue('gray.50', 'gray.700')}>
                    <Text color={textColor} mb={4}>{rec.description}</Text>
                    
                    {(rec.exampleBefore || rec.exampleAfter) && (
                      <Box borderRadius="md" p={3} bg={highlightBg} mb={2}>
                        {rec.exampleBefore && (
                          <Box mb={4}>
                            <HStack justify="space-between" mb={1}>
                              <Text fontSize="sm" fontWeight="medium">До:</Text>
                              <Tooltip 
                                label={copiedText === `before-${index}` ? 'Скопировано!' : 'Копировать'} 
                                placement="top"
                              >
                                <IconButton
                                  aria-label="Copy text"
                                  icon={copiedText === `before-${index}` ? <FaCheckCircle /> : <FaClipboard />}
                                  size="xs"
                                  variant="ghost"
                                  onClick={() => handleCopyToClipboard(rec.exampleBefore || '', `before-${index}`)}
                                  color={copiedText === `before-${index}` ? 'green.500' : 'gray.500'}
                                />
                              </Tooltip>
                            </HStack>
                            <Box 
                              p={2} 
                              borderRadius="md" 
                              bg={useColorModeValue('white', 'gray.800')}
                              fontSize="sm"
                              fontFamily="mono"
                            >
                              {rec.exampleBefore}
                            </Box>
                          </Box>
                        )}
                        
                        {rec.exampleAfter && (
                          <Box>
                            <HStack justify="space-between" mb={1}>
                              <Text fontSize="sm" fontWeight="medium">После:</Text>
                              <Tooltip 
                                label={copiedText === `after-${index}` ? 'Скопировано!' : 'Копировать'} 
                                placement="top"
                              >
                                <IconButton
                                  aria-label="Copy text"
                                  icon={copiedText === `after-${index}` ? <FaCheckCircle /> : <FaClipboard />}
                                  size="xs"
                                  variant="ghost"
                                  onClick={() => handleCopyToClipboard(rec.exampleAfter || '', `after-${index}`)}
                                  color={copiedText === `after-${index}` ? 'green.500' : 'gray.500'}
                                />
                              </Tooltip>
                            </HStack>
                            <Box 
                              p={2} 
                              borderRadius="md" 
                              bg={useColorModeValue('white', 'gray.800')}
                              fontSize="sm"
                              fontFamily="mono"
                              borderLeft="3px solid"
                              borderLeftColor="green.400"
                            >
                              {rec.exampleAfter}
                            </Box>
                          </Box>
                        )}
                      </Box>
                    )}
                    
                    <Button 
                      size="sm" 
                      colorScheme="gray" 
                      variant="outline"
                      leftIcon={<FaCheck />}
                      mt={2}
                    >
                      Применить рекомендацию
                    </Button>
                  </AccordionPanel>
                </AccordionItem>
              </MotionBox>
            ))}
          </Accordion>
        </Box>
        
        {/* Советы */}
        <Box mb={8}>
          <HStack spacing={2} mb={4}>
            <Icon as={FaLightbulb} color="yellow.500" boxSize={5} />
            <Heading as="h4" size="md" color={headingColor}>
              Советы по улучшению
            </Heading>
          </HStack>
          
          <VStack spacing={4} align="stretch">
            {tips.map((tip, index) => (
              <MotionBox
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.1 * index }}
                p={4}
                borderWidth="1px"
                borderRadius="md"
                borderColor={borderColor}
                bg={useColorModeValue('white', 'gray.800')}
                boxShadow="sm"
                _hover={{ boxShadow: "md" }}
              >
                <Heading as="h5" size="sm" mb={2}>
                  {tip.title}
                </Heading>
                <Text mb={tip.example ? 3 : 0} color={textColor}>{tip.description}</Text>
                
                {tip.example && (
                  <Box mt={3} p={3} borderRadius="md" bg={badgeBg} position="relative">
                    <HStack justify="space-between" mb={1}>
                      <Text fontWeight="medium" fontSize="xs">Пример:</Text>
                      <Tooltip 
                        label={copiedText === `tip-${index}` ? 'Скопировано!' : 'Копировать'} 
                        placement="top"
                      >
                        <IconButton
                          aria-label="Copy example"
                          icon={copiedText === `tip-${index}` ? <FaCheckCircle /> : <FaClipboard />}
                          size="xs"
                          variant="ghost"
                          onClick={() => handleCopyToClipboard(tip.example || '', `tip-${index}`)}
                          color={copiedText === `tip-${index}` ? 'green.500' : 'gray.500'}
                        />
                      </Tooltip>
                    </HStack>
                    <Box 
                      p={2} 
                      borderRadius="md" 
                      bg={bgColor}
                      fontSize="sm"
                      fontFamily="mono"
                    >
                      {tip.example}
                    </Box>
                  </Box>
                )}
              </MotionBox>
            ))}
          </VStack>
        </Box>
        
        {/* Отсутствующие элементы */}
        {missingElements.length > 0 && (
          <Box>
            <HStack spacing={2} mb={4}>
              <Icon as={FaExclamationTriangle} color="gray.700" boxSize={5} />
              <Heading as="h4" size="md" color={headingColor}>
                Отсутствующие элементы
              </Heading>
            </HStack>
            
            <VStack spacing={3} align="stretch">
              {missingElements.map((element, index) => (
                <MotionBox
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 * index }}
                  p={4}
                  borderWidth="1px"
                  borderRadius="md"
                  borderColor={borderColor}
                  bg={useColorModeValue('white', 'gray.800')}
                  boxShadow="sm"
                >
                  <HStack align="flex-start" spacing={3}>
                    <Icon as={FaExclamationTriangle} color="gray.700" mt={1} />
                    <Box>
                      <Text fontWeight="medium">{element.element}</Text>
                      <Text fontSize="sm" color={textColor}>{element.description}</Text>
                    </Box>
                  </HStack>
                </MotionBox>
              ))}
            </VStack>
          </Box>
        )}
      </Box>
    </MotionBox>
  );
};

export default ResumeAIFeedback; 