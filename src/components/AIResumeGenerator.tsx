import React, { useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  Button,
  Select,
  Input,
  FormControl,
  FormLabel,
  Flex,
  HStack,
  Icon,
  useColorModeValue,
  Grid,
  GridItem,
  Badge,
  useToast,
  Radio,
  RadioGroup,
  Stack,
  Divider,
  Card,
  CardBody,
  List,
  ListItem,
  ListIcon,
  Image,
  Skeleton,
  SimpleGrid
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { 
  FaUserAlt, 
  FaFileAlt, 
  FaMagic, 
  FaCheckCircle, 
  FaDownload, 
  FaBriefcase, 
  FaGraduationCap, 
  FaRocket,
  FaChartLine,
  FaRegLightbulb,
  FaUserTie,
  FaClipboardCheck
} from 'react-icons/fa';

// @ts-ignore - motion() works with Chakra UI components
const MotionBox = motion(Box);
// @ts-ignore - motion() works with Chakra UI components
const MotionFlex = motion(Flex);
// @ts-ignore - motion() works with Chakra UI components
const MotionHeading = motion(Heading);
// @ts-ignore - motion() works with Chakra UI components
const MotionText = motion(Text);

const AIResumeGenerator: React.FC = () => {
  const [targetPosition, setTargetPosition] = useState('');
  const [industry, setIndustry] = useState('');
  const [resumeStyle, setResumeStyle] = useState('modern');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const toast = useToast();

  // Unified black and white color scheme
  const bgColor = useColorModeValue('white', 'black');
  const cardBg = useColorModeValue('white', 'black');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.700', 'gray.200');
  const headingColor = useColorModeValue('black', 'white');
  const buttonBg = useColorModeValue('black', 'white');
  const buttonColor = useColorModeValue('white', 'black');
  const buttonHoverBg = useColorModeValue('gray.800', 'gray.200');

  const handleGenerateResume = () => {
    if (!targetPosition || !industry) {
      toast({
        title: 'Заполните все поля',
        description: 'Пожалуйста, укажите целевую должность и отрасль',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsGenerating(true);
    // Имитируем процесс генерации
    setTimeout(() => {
      setIsGenerating(false);
      setIsGenerated(true);
      toast({
        title: 'Резюме создано!',
        description: 'Ваше персонализированное резюме готово для скачивания',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    }, 3000);
  };

  const handleDownload = () => {
    toast({
      title: 'Загрузка...',
      description: 'Резюме загружается в формате PDF',
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  };

  const steps = [
    {
      title: 'Анализ профиля',
      description: 'Наш ИИ анализирует ваш профиль Respawn, включая навыки, образование, опыт и достижения, чтобы понять ваши квалификации.',
      icon: FaUserAlt,
      color: 'blue'
    },
    {
      title: 'Соответствие вакансии',
      description: 'Система определяет наиболее релевантные навыки и опыт для целевых должностей, гарантируя, что ваше резюме подчеркивает то, что ищут работодатели.',
      icon: FaBriefcase,
      color: 'purple'
    },
    {
      title: 'Создание резюме',
      description: 'ИИ генерирует профессионально отформатированное резюме с убедительными описаниями вашего опыта и достижений, которые помогут вам выделиться.',
      icon: FaMagic,
      color: 'teal'
    },
    {
      title: 'Скачивание и редактирование',
      description: 'Просмотрите свое резюме, внесите необходимые изменения и скачайте его в формате PDF, готовом к отправке потенциальным работодателям.',
      icon: FaDownload,
      color: 'green'
    }
  ];

  const benefits = [
    {
      title: 'Экономия времени',
      description: 'Создавайте профессиональное резюме за считанные минуты, а не часы',
      icon: FaRocket
    },
    {
      title: 'Персонализированный контент',
      description: 'Оптимизировано под ваши конкретные карьерные цели и целевые должности',
      icon: FaUserTie
    },
    {
      title: 'Профессиональное форматирование',
      description: 'Четкий современный дизайн, привлекающий внимание работодателей',
      icon: FaFileAlt
    },
    {
      title: 'Совместимость с ATS',
      description: 'Разработано для прохождения через системы отслеживания соискателей',
      icon: FaCheckCircle
    },
    {
      title: 'Множество форматов',
      description: 'Скачивайте в формате PDF, Word или обычного текста',
      icon: FaClipboardCheck
    },
    {
      title: 'Подсказки по улучшению',
      description: 'Получайте рекомендации, как сделать ваше резюме еще лучше',
      icon: FaRegLightbulb
    }
  ];

  const industries = [
    'IT и разработка ПО',
    'Маркетинг и реклама',
    'Финансы и банковское дело',
    'Образование',
    'Здравоохранение',
    'Розничная торговля',
    'Производство',
    'Логистика и транспорт',
    'Консалтинг',
    'Медиа и коммуникации'
  ];

  return (
    <Box bg={bgColor} minH="100vh" py={12} px={4} position="relative" overflow="hidden">
      {/* Subtle animated background elements */}
      <MotionBox
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 8, repeat: Infinity }}
        position="absolute"
        top="20"
        left="10"
        w="48"
        h="48"
        bg={useColorModeValue('black/3', 'white/3')}
        borderRadius="full"
        filter="blur(60px)"
        pointerEvents="none"
      />
      <MotionBox
        animate={{ y: [0, 20, 0] }}
        transition={{ duration: 10, repeat: Infinity }}
        position="absolute"
        bottom="20"
        right="10"
        w="64"
        h="64"
        bg={useColorModeValue('black/3', 'white/3')}
        borderRadius="full"
        filter="blur(60px)"
        pointerEvents="none"
      />

      <Container maxW="container.xl" position="relative" zIndex={1}>
        <VStack spacing={12}>
          {/* Header */}
          <MotionBox 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            textAlign="center"
            w="full"
          >
            <MotionHeading 
              as="h1" 
              fontSize="3xl"
              fontWeight="light"
              mb={4}
              color={headingColor}
              lineHeight="1.2"
            >
              <Box as="span" fontWeight="thin">AI-генератор</Box>
              <Box as="span" fontWeight="bold" ml={2}>резюме</Box>
            </MotionHeading>
            <MotionText 
              fontSize="xl" 
              color={textColor}
              maxW="3xl"
              mx="auto"
              fontWeight="light"
            >
              Создайте профессиональное, адаптированное резюме за считанные секунды 
              с помощью нашей передовой технологии искусственного интеллекта
            </MotionText>
          </MotionBox>

          {/* Main Form */}
                <MotionBox
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
                  bg={cardBg}
            p={8}
                  borderRadius="xl"
            boxShadow="xl"
            w="full"
            maxW="2xl"
            border="1px solid"
            borderColor={borderColor}
            _hover={{
              borderColor: useColorModeValue('black', 'white'),
              boxShadow: '2xl',
            }}
          >
            <VStack spacing={6}>
              <FormControl>
                <FormLabel color={textColor} fontWeight="medium">
                  Целевая должность
                </FormLabel>
                        <Input 
                          value={targetPosition}
                          onChange={(e) => setTargetPosition(e.target.value)}
                  placeholder="Например: Frontend разработчик"
                  bg={useColorModeValue('gray.50', 'gray.900')}
                  border="1px solid"
                          borderColor={borderColor}
                  _hover={{
                    borderColor: useColorModeValue('black', 'white'),
                  }}
                  _focus={{
                    borderColor: useColorModeValue('black', 'white'),
                    boxShadow: 'none',
                  }}
                        />
                      </FormControl>

              <FormControl>
                <FormLabel color={textColor} fontWeight="medium">
                  Отрасль
                </FormLabel>
                        <Select 
                          value={industry}
                          onChange={(e) => setIndustry(e.target.value)}
                  placeholder="Выберите отрасль"
                  bg={useColorModeValue('gray.50', 'gray.900')}
                  border="1px solid"
                          borderColor={borderColor}
                  _hover={{
                    borderColor: useColorModeValue('black', 'white'),
                  }}
                  _focus={{
                    borderColor: useColorModeValue('black', 'white'),
                    boxShadow: 'none',
                  }}
                >
                  <option value="tech">Технологии</option>
                  <option value="finance">Финансы</option>
                  <option value="marketing">Маркетинг</option>
                  <option value="design">Дизайн</option>
                  <option value="sales">Продажи</option>
                  <option value="healthcare">Здравоохранение</option>
                  <option value="education">Образование</option>
                  <option value="other">Другое</option>
                        </Select>
                      </FormControl>

                      <FormControl>
                <FormLabel color={textColor} fontWeight="medium">
                  Стиль резюме
                </FormLabel>
                <Select
                  value={resumeStyle}
                  onChange={(e) => setResumeStyle(e.target.value)}
                  bg={useColorModeValue('gray.50', 'gray.900')}
                  border="1px solid"
                  borderColor={borderColor}
                  _hover={{
                    borderColor: useColorModeValue('black', 'white'),
                  }}
                  _focus={{
                    borderColor: useColorModeValue('black', 'white'),
                    boxShadow: 'none',
                  }}
                >
                  <option value="modern">Современный</option>
                  <option value="classic">Классический</option>
                  <option value="creative">Креативный</option>
                  <option value="minimal">Минималистичный</option>
                </Select>
                      </FormControl>

                      <Button
                        onClick={handleGenerateResume}
                        isLoading={isGenerating}
                loadingText="Генерируем резюме..."
                bg={buttonBg}
                color={buttonColor}
                        _hover={{
                  bg: buttonHoverBg,
                  transform: 'translateY(-2px)',
                }}
                _active={{
                  transform: 'translateY(0)',
                }}
                size="lg"
                w="full"
                fontWeight="medium"
                py={6}
                fontSize="lg"
                transition="all 0.2s"
                      >
                        Создать резюме
                      </Button>
                    </VStack>
              </MotionBox>

          {/* Generated Resume Preview */}
          {isGenerated && (
              <MotionBox
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              bg={cardBg}
              p={8}
              borderRadius="xl"
              boxShadow="xl"
              w="full"
              maxW="4xl"
              border="1px solid"
              borderColor={borderColor}
            >
              <VStack spacing={6}>
                <Heading size="lg" color={headingColor} fontWeight="light">
                  <Box as="span" fontWeight="thin">Ваше</Box>
                  <Box as="span" fontWeight="bold" ml={2}>резюме готово!</Box>
                        </Heading>
                
                <Text color={textColor} textAlign="center" maxW="2xl">
                  Резюме создано с учетом требований для позиции "{targetPosition}" в сфере "{industry}". 
                  Вы можете скачать его в формате PDF или продолжить редактирование.
                        </Text>

                <HStack spacing={4}>
                          <Button
                            onClick={handleDownload}
                    bg={buttonBg}
                    color={buttonColor}
                    _hover={{
                      bg: buttonHoverBg,
                      transform: 'translateY(-2px)',
                    }}
                    _active={{
                      transform: 'translateY(0)',
                    }}
                    size="lg"
                    fontWeight="medium"
                    transition="all 0.2s"
                          >
                            Скачать PDF
                          </Button>
                        
                  <Button
                    variant="outline"
                          borderColor={borderColor} 
                    color={textColor}
                    _hover={{
                      borderColor: useColorModeValue('black', 'white'),
                      color: useColorModeValue('black', 'white'),
                    }}
                    size="lg"
                    fontWeight="medium"
                  >
                    Редактировать
                  </Button>
                </HStack>
              </VStack>
            </MotionBox>
          )}

          {/* How it works section */}
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
                            w="full"
            maxW="4xl"
          >
            <Heading size="lg" textAlign="center" mb={8} color={headingColor} fontWeight="light">
              <Box as="span" fontWeight="thin">Как это</Box>
              <Box as="span" fontWeight="bold" ml={2}>работает</Box>
            </Heading>
            
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
              {[
                {
                  step: '1',
                  title: 'Заполните форму',
                  description: 'Укажите желаемую должность, отрасль и стиль резюме'
                },
                {
                  step: '2',
                  title: 'AI анализирует',
                  description: 'Искусственный интеллект подбирает оптимальную структуру и контент'
                },
                {
                  step: '3',
                  title: 'Получите результат',
                  description: 'Скачайте готовое резюме или продолжите редактирование'
                }
              ].map((item, index) => (
                <MotionBox
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                            textAlign="center"
                  p={6}
                  bg={cardBg}
                  borderRadius="xl"
                  border="1px solid"
                  borderColor={borderColor}
                  _hover={{
                    borderColor: useColorModeValue('black', 'white'),
                    transform: 'translateY(-4px)',
                  }}
                  transition="all 0.2s"
                >
                  <Box
                    w="12"
                    h="12"
                    borderRadius="full"
                    bg={useColorModeValue('black', 'white')}
                    color={useColorModeValue('white', 'black')}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    fontSize="xl"
                    fontWeight="bold"
                    mx="auto"
                    mb={4}
                  >
                    {item.step}
                          </Box>
                  <Heading size="md" mb={2} color={headingColor} fontWeight="medium">
                    {item.title}
                  </Heading>
                  <Text color={textColor} fontSize="sm">
                    {item.description}
                              </Text>
                </MotionBox>
              ))}
            </SimpleGrid>
              </MotionBox>
        </VStack>
      </Container>
    </Box>
  );
};

export default AIResumeGenerator; 