import React, { useState } from 'react';
import {
  Box, VStack, HStack, Text, Input, Textarea, Select, Checkbox,
  Button, Progress, Icon, useColorModeValue, Badge, Wrap, WrapItem,
  FormControl, FormLabel, FormErrorMessage, useToast, Alert,
  AlertIcon, AlertTitle, AlertDescription, Divider, Heading,
  SimpleGrid, Card, CardBody, Avatar, Tag, TagLabel, TagCloseButton,
  NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper,
  Tooltip, Flex, Spacer, Circle, keyframes, Textarea as ChakraTextarea
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaRocket, FaCode, FaUsers, FaMapMarkerAlt, FaCalendar, FaDollarSign,
  FaCheck, FaArrowRight, FaArrowLeft, FaPlus, FaTimes, FaEye,
  FaBrain, FaPalette, FaShieldAlt, FaServer, FaMobile, FaDatabase,
  FaCloud, FaGlobe, FaClock, FaStar, FaTrophy, FaGem
} from 'react-icons/fa';
import { Project } from '../../hooks/useProjects';

// @ts-ignore - motion() works with Chakra UI components
const MotionBox = motion(Box);
// @ts-ignore - motion() works with Chakra UI components
const MotionCard = motion(Card);

const fadeIn = keyframes`
  0% { opacity: 0; transform: translateY(20px); }
  100% { opacity: 1; transform: translateY(0); }
`;

interface CreateProjectFormProps {
  onSubmit: (projectData: Partial<Project>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const STEPS = [
  { id: 1, title: 'Основная информация', icon: FaRocket },
  { id: 2, title: 'Описание и требования', icon: FaCode },
  { id: 3, title: 'Команда и сроки', icon: FaUsers },
  { id: 4, title: 'Бюджет и условия', icon: FaDollarSign },
  { id: 5, title: 'Предварительный просмотр', icon: FaEye },
];

const CATEGORY_OPTIONS = [
  { name: 'Искусственный интеллект', icon: FaBrain, color: 'purple' },
  { name: 'Веб-разработка', icon: FaCode, color: 'blue' },
  { name: 'Мобильные приложения', icon: FaMobile, color: 'green' },
  { name: 'UI/UX дизайн', icon: FaPalette, color: 'pink' },
  { name: 'Блокчейн', icon: FaGlobe, color: 'orange' },
  { name: 'Кибербезопасность', icon: FaShieldAlt, color: 'red' },
  { name: 'Аналитика данных', icon: FaDatabase, color: 'teal' },
  { name: 'Облачные технологии', icon: FaCloud, color: 'cyan' },
  { name: 'DevOps', icon: FaServer, color: 'gray' },
  { name: 'IoT', icon: FaGlobe, color: 'yellow' },
  { name: 'Игровая разработка', icon: FaStar, color: 'purple' },
  { name: 'Другое', icon: FaGem, color: 'gray' },
];

const TECHNOLOGY_OPTIONS = [
  { name: 'React', category: 'Frontend' },
  { name: 'Vue.js', category: 'Frontend' },
  { name: 'Angular', category: 'Frontend' },
  { name: 'TypeScript', category: 'Frontend' },
  { name: 'Node.js', category: 'Backend' },
  { name: 'Python', category: 'Backend' },
  { name: 'Java', category: 'Backend' },
  { name: 'C#', category: 'Backend' },
  { name: 'Docker', category: 'DevOps' },
  { name: 'Kubernetes', category: 'DevOps' },
  { name: 'AWS', category: 'Cloud' },
  { name: 'Firebase', category: 'Backend' },
  { name: 'Flutter', category: 'Mobile' },
  { name: 'React Native', category: 'Mobile' },
  { name: 'TensorFlow', category: 'AI' },
  { name: 'PyTorch', category: 'AI' },
  { name: 'Solidity', category: 'Blockchain' },
  { name: 'Figma', category: 'Design' },
  { name: 'PostgreSQL', category: 'Database' },
  { name: 'MongoDB', category: 'Database' },
];

const BENEFIT_OPTIONS = [
  'Опыт работы с современными технологиями',
  'Портфолио проектов',
  'Сетевые возможности',
  'Финансовое вознаграждение',
  'Криптовалютные выплаты',
  'Публикации и патенты',
  'Сертификации',
  'Консультации экспертов',
  'Творческая свобода',
  'Процент от продаж',
  'Экологический вклад',
  'Международная команда',
  'Гибкий график',
  'Удаленная работа',
  'Карьерный рост',
];

export const CreateProjectForm: React.FC<CreateProjectFormProps> = ({
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<Project>>({
    title: '',
    description: '',
    category: '',
    status: 'recruiting',
    tags: [],
    technologies: [],
    teamSize: '1-3',
    duration: '1-3 мес',
    location: '',
    isRemote: false,
    budget: '',
    difficulty: 'intermediate',
    experienceLevel: 'mid',
    projectType: 'personal',
    benefits: [],
    requirements: '',
    goals: '',
    timeline: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [customTag, setCustomTag] = useState('');
  const [customBenefit, setCustomBenefit] = useState('');
  const toast = useToast();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'gray.100');
  const mutedColor = useColorModeValue('gray.600', 'gray.400');
  const accentColor = useColorModeValue('blue.500', 'blue.300');

  const updateFormData = (field: keyof Project, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.title?.trim()) {
          newErrors.title = 'Название проекта обязательно';
        }
        if (!formData.category?.trim()) {
          newErrors.category = 'Выберите категорию проекта';
        }
        break;
      case 2:
        if (!formData.description?.trim()) {
          newErrors.description = 'Описание проекта обязательно';
        }
        if (formData.technologies?.length === 0) {
          newErrors.technologies = 'Выберите хотя бы одну технологию';
        }
        break;
      case 3:
        if (!formData.teamSize?.trim()) {
          newErrors.teamSize = 'Укажите размер команды';
        }
        if (!formData.duration?.trim()) {
          newErrors.duration = 'Укажите сроки проекта';
        }
        break;
      case 4:
        if (!formData.budget?.trim()) {
          newErrors.budget = 'Укажите бюджет проекта';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const addTag = (tag: string) => {
    if (tag && !formData.tags?.includes(tag)) {
      updateFormData('tags', [...(formData.tags || []), tag]);
    }
  };

  const removeTag = (tag: string) => {
    updateFormData('tags', formData.tags?.filter(t => t !== tag) || []);
  };

  const addTechnology = (tech: string) => {
    if (tech && !formData.technologies?.includes(tech)) {
      updateFormData('technologies', [...(formData.technologies || []), tech]);
    }
  };

  const removeTechnology = (tech: string) => {
    updateFormData('technologies', formData.technologies?.filter(t => t !== tech) || []);
  };

  const addBenefit = (benefit: string) => {
    if (benefit && !formData.benefits?.includes(benefit)) {
      updateFormData('benefits', [...(formData.benefits || []), benefit]);
    }
  };

  const removeBenefit = (benefit: string) => {
    updateFormData('benefits', formData.benefits?.filter(b => b !== benefit) || []);
  };

  const handleSubmit = async () => {
    if (validateStep(currentStep)) {
      try {
        await onSubmit(formData);
        toast({
          title: 'Проект создан!',
          description: 'Теперь другие участники смогут найти ваш проект',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } catch (error) {
        toast({
          title: 'Ошибка',
          description: 'Не удалось создать проект',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <VStack spacing={6} align="stretch">
              <FormControl isInvalid={!!errors.title}>
                <FormLabel color={textColor} fontWeight="medium">
                  Название проекта
                </FormLabel>
                <Input
                  value={formData.title}
                  onChange={(e) => updateFormData('title', e.target.value)}
                  placeholder="Краткое и понятное название"
                  size="lg"
                  borderRadius="xl"
                  borderColor={borderColor}
                  _focus={{ borderColor: accentColor, boxShadow: 'none' }}
                />
                <FormErrorMessage>{errors.title}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.category}>
                <FormLabel color={textColor} fontWeight="medium">
                  Категория проекта
                </FormLabel>
                <SimpleGrid columns={{ base: 2, md: 3 }} spacing={3}>
                  {CATEGORY_OPTIONS.map((category) => (
                    <Button
                      key={category.name}
                      variant={formData.category === category.name ? 'solid' : 'outline'}
                      colorScheme={formData.category === category.name ? category.color : 'gray'}
                      size="lg"
                      onClick={() => updateFormData('category', category.name)}
                      leftIcon={<Icon as={category.icon} />}
                      borderRadius="xl"
                      h="auto"
                      p={4}
                      flexDirection="column"
                      gap={2}
                    >
                      <Text fontSize="sm" fontWeight="medium">
                        {category.name}
                      </Text>
                    </Button>
                  ))}
                </SimpleGrid>
                <FormErrorMessage>{errors.category}</FormErrorMessage>
              </FormControl>

              <FormControl>
                <FormLabel color={textColor} fontWeight="medium">
                  Тип проекта
                </FormLabel>
                <Select
                  value={formData.projectType}
                  onChange={(e) => updateFormData('projectType', e.target.value)}
                  size="lg"
                  borderRadius="xl"
                  borderColor={borderColor}
                  _focus={{ borderColor: accentColor, boxShadow: 'none' }}
                >
                  <option value="personal">Личный проект</option>
                  <option value="commercial">Коммерческий проект</option>
                  <option value="open-source">Open Source</option>
                  <option value="research">Исследовательский</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel color={textColor} fontWeight="medium">
                  Теги проекта
                </FormLabel>
                <Box>
                  <Wrap spacing={2} mb={4}>
                    {formData.tags?.map((tag) => (
                      <WrapItem key={tag}>
                        <Tag
                          size="lg"
                          borderRadius="full"
                          variant="solid"
                          colorScheme="blue"
                        >
                          <TagLabel>{tag}</TagLabel>
                          <TagCloseButton onClick={() => removeTag(tag)} />
                        </Tag>
                      </WrapItem>
                    ))}
                  </Wrap>
                  
                  <HStack>
                    <Input
                      value={customTag}
                      onChange={(e) => setCustomTag(e.target.value)}
                      placeholder="Добавить тег..."
                      size="sm"
                      borderRadius="xl"
                    />
                    <Button
                      size="sm"
                      onClick={() => {
                        if (customTag.trim()) {
                          addTag(customTag.trim());
                          setCustomTag('');
                        }
                      }}
                      borderRadius="xl"
                    >
                      <Icon as={FaPlus} />
                    </Button>
                  </HStack>
                </Box>
              </FormControl>
            </VStack>
          </MotionBox>
        );

      case 2:
        return (
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <VStack spacing={6} align="stretch">
              <FormControl isInvalid={!!errors.description}>
                <FormLabel color={textColor} fontWeight="medium">
                  Описание проекта
                </FormLabel>
                <ChakraTextarea
                  value={formData.description}
                  onChange={(e) => updateFormData('description', e.target.value)}
                  placeholder="Подробно опишите идею проекта, цели, задачи и ожидаемые результаты..."
                  rows={6}
                  borderRadius="xl"
                  borderColor={borderColor}
                  _focus={{ borderColor: accentColor, boxShadow: 'none' }}
                />
                <FormErrorMessage>{errors.description}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.technologies}>
                <FormLabel color={textColor} fontWeight="medium">
                  Технологии и инструменты
                </FormLabel>
                <Box>
                  <Wrap spacing={2} mb={4}>
                    {formData.technologies?.map((tech) => (
                      <WrapItem key={tech}>
                        <Tag
                          size="lg"
                          borderRadius="full"
                          variant="solid"
                          colorScheme="green"
                        >
                          <TagLabel>{tech}</TagLabel>
                          <TagCloseButton onClick={() => removeTechnology(tech)} />
                        </Tag>
                      </WrapItem>
                    ))}
                  </Wrap>
                  
                  <SimpleGrid columns={{ base: 2, md: 3 }} spacing={3}>
                    {TECHNOLOGY_OPTIONS.map((tech) => (
                      <Button
                        key={tech.name}
                        variant={formData.technologies?.includes(tech.name) ? 'solid' : 'outline'}
                        colorScheme={formData.technologies?.includes(tech.name) ? 'green' : 'gray'}
                        size="sm"
                        onClick={() => addTechnology(tech.name)}
                        borderRadius="xl"
                      >
                        {tech.name}
                      </Button>
                    ))}
                  </SimpleGrid>
                </Box>
                <FormErrorMessage>{errors.technologies}</FormErrorMessage>
              </FormControl>

              <FormControl>
                <FormLabel color={textColor} fontWeight="medium">
                  Требования к участникам
                </FormLabel>
                <ChakraTextarea
                  value={formData.requirements}
                  onChange={(e) => updateFormData('requirements', e.target.value)}
                  placeholder="Опишите требования к навыкам, опыту и квалификации участников..."
                  rows={4}
                  borderRadius="xl"
                  borderColor={borderColor}
                  _focus={{ borderColor: accentColor, boxShadow: 'none' }}
                />
              </FormControl>

              <FormControl>
                <FormLabel color={textColor} fontWeight="medium">
                  Цели проекта
                </FormLabel>
                <ChakraTextarea
                  value={formData.goals}
                  onChange={(e) => updateFormData('goals', e.target.value)}
                  placeholder="Какие цели вы хотите достичь в рамках проекта?"
                  rows={3}
                  borderRadius="xl"
                  borderColor={borderColor}
                  _focus={{ borderColor: accentColor, boxShadow: 'none' }}
                />
              </FormControl>
            </VStack>
          </MotionBox>
        );

      case 3:
        return (
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <VStack spacing={6} align="stretch">
              <FormControl isInvalid={!!errors.teamSize}>
                <FormLabel color={textColor} fontWeight="medium">
                  Размер команды
                </FormLabel>
                <Select
                  value={formData.teamSize}
                  onChange={(e) => updateFormData('teamSize', e.target.value)}
                  size="lg"
                  borderRadius="xl"
                  borderColor={borderColor}
                  _focus={{ borderColor: accentColor, boxShadow: 'none' }}
                >
                  <option value="1-3">1-3 человека</option>
                  <option value="4-6">4-6 человек</option>
                  <option value="7-10">7-10 человек</option>
                  <option value="10+">10+ человек</option>
                </Select>
                <FormErrorMessage>{errors.teamSize}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.duration}>
                <FormLabel color={textColor} fontWeight="medium">
                  Сроки проекта
                </FormLabel>
                <Select
                  value={formData.duration}
                  onChange={(e) => updateFormData('duration', e.target.value)}
                  size="lg"
                  borderRadius="xl"
                  borderColor={borderColor}
                  _focus={{ borderColor: accentColor, boxShadow: 'none' }}
                >
                  <option value="1-3 мес">1-3 месяца</option>
                  <option value="3-6 мес">3-6 месяцев</option>
                  <option value="6-12 мес">6-12 месяцев</option>
                  <option value="1+ год">1+ год</option>
                </Select>
                <FormErrorMessage>{errors.duration}</FormErrorMessage>
              </FormControl>

              <FormControl>
                <FormLabel color={textColor} fontWeight="medium">
                  Локация
                </FormLabel>
                <Input
                  value={formData.location}
                  onChange={(e) => updateFormData('location', e.target.value)}
                  placeholder="Город или страна"
                  size="lg"
                  borderRadius="xl"
                  borderColor={borderColor}
                  _focus={{ borderColor: accentColor, boxShadow: 'none' }}
                  leftIcon={<Icon as={FaMapMarkerAlt} />}
                />
              </FormControl>

              <FormControl>
                <FormLabel color={textColor} fontWeight="medium">
                  Уровень сложности
                </FormLabel>
                <Select
                  value={formData.difficulty}
                  onChange={(e) => updateFormData('difficulty', e.target.value)}
                  size="lg"
                  borderRadius="xl"
                  borderColor={borderColor}
                  _focus={{ borderColor: accentColor, boxShadow: 'none' }}
                >
                  <option value="beginner">Начинающий</option>
                  <option value="intermediate">Средний</option>
                  <option value="advanced">Продвинутый</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel color={textColor} fontWeight="medium">
                  Требуемый опыт
                </FormLabel>
                <Select
                  value={formData.experienceLevel}
                  onChange={(e) => updateFormData('experienceLevel', e.target.value)}
                  size="lg"
                  borderRadius="xl"
                  borderColor={borderColor}
                  _focus={{ borderColor: accentColor, boxShadow: 'none' }}
                >
                  <option value="entry">Начинающий (0-2 года)</option>
                  <option value="mid">Средний (2-5 лет)</option>
                  <option value="senior">Старший (5+ лет)</option>
                </Select>
              </FormControl>

              <Checkbox
                isChecked={formData.isRemote}
                onChange={(e) => updateFormData('isRemote', e.target.checked)}
                colorScheme="blue"
                size="lg"
              >
                Удаленная работа возможна
              </Checkbox>
            </VStack>
          </MotionBox>
        );

      case 4:
        return (
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <VStack spacing={6} align="stretch">
              <FormControl isInvalid={!!errors.budget}>
                <FormLabel color={textColor} fontWeight="medium">
                  Бюджет проекта
                </FormLabel>
                <Input
                  value={formData.budget}
                  onChange={(e) => updateFormData('budget', e.target.value)}
                  placeholder="Например: 500,000 - 800,000 ₽"
                  size="lg"
                  borderRadius="xl"
                  borderColor={borderColor}
                  _focus={{ borderColor: accentColor, boxShadow: 'none' }}
                  leftIcon={<Icon as={FaDollarSign} />}
                />
                <FormErrorMessage>{errors.budget}</FormErrorMessage>
              </FormControl>

              <FormControl>
                <FormLabel color={textColor} fontWeight="medium">
                  Преимущества участия
                </FormLabel>
                <Box>
                  <Wrap spacing={2} mb={4}>
                    {formData.benefits?.map((benefit) => (
                      <WrapItem key={benefit}>
                        <Tag
                          size="lg"
                          borderRadius="full"
                          variant="solid"
                          colorScheme="purple"
                        >
                          <TagLabel>{benefit}</TagLabel>
                          <TagCloseButton onClick={() => removeBenefit(benefit)} />
                        </Tag>
                      </WrapItem>
                    ))}
                  </Wrap>
                  
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                    {BENEFIT_OPTIONS.map((benefit) => (
                      <Button
                        key={benefit}
                        variant={formData.benefits?.includes(benefit) ? 'solid' : 'outline'}
                        colorScheme={formData.benefits?.includes(benefit) ? 'purple' : 'gray'}
                        size="sm"
                        onClick={() => addBenefit(benefit)}
                        borderRadius="xl"
                        justifyContent="start"
                        textAlign="left"
                      >
                        {benefit}
                      </Button>
                    ))}
                  </SimpleGrid>
                  
                  <HStack mt={4}>
                    <Input
                      value={customBenefit}
                      onChange={(e) => setCustomBenefit(e.target.value)}
                      placeholder="Добавить свое преимущество..."
                      size="sm"
                      borderRadius="xl"
                    />
                    <Button
                      size="sm"
                      onClick={() => {
                        if (customBenefit.trim()) {
                          addBenefit(customBenefit.trim());
                          setCustomBenefit('');
                        }
                      }}
                      borderRadius="xl"
                    >
                      <Icon as={FaPlus} />
                    </Button>
                  </HStack>
                </Box>
              </FormControl>

              <FormControl>
                <FormLabel color={textColor} fontWeight="medium">
                  Временные рамки
                </FormLabel>
                <ChakraTextarea
                  value={formData.timeline}
                  onChange={(e) => updateFormData('timeline', e.target.value)}
                  placeholder="Опишите этапы проекта и временные рамки..."
                  rows={3}
                  borderRadius="xl"
                  borderColor={borderColor}
                  _focus={{ borderColor: accentColor, boxShadow: 'none' }}
                />
              </FormControl>
            </VStack>
          </MotionBox>
        );

      case 5:
        return (
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <VStack spacing={6} align="stretch">
              <Alert status="info" borderRadius="xl">
                <AlertIcon />
                <Box>
                  <AlertTitle>Предварительный просмотр</AlertTitle>
                  <AlertDescription>
                    Проверьте информацию перед созданием проекта
                  </AlertDescription>
                </Box>
              </Alert>

              <MotionCard
                bg={bgColor}
                border="1px solid"
                borderColor={borderColor}
                borderRadius="2xl"
                p={6}
                whileHover={{ y: -2 }}
                transition={{ duration: 0.2 }}
              >
                <VStack spacing={4} align="stretch">
                  <HStack justify="space-between">
                    <VStack align="start" spacing={1}>
                      <Heading size="md" color={textColor}>
                        {formData.title}
                      </Heading>
                      <Badge
                        colorScheme={CATEGORY_OPTIONS.find(c => c.name === formData.category)?.color || 'gray'}
                        borderRadius="full"
                        px={3}
                        py={1}
                      >
                        {formData.category}
                      </Badge>
                    </VStack>
                    <Badge
                      colorScheme={formData.status === 'active' ? 'green' : 'orange'}
                      borderRadius="full"
                      px={3}
                      py={1}
                    >
                      {formData.status === 'active' ? 'Активный' : 'Набор участников'}
                    </Badge>
                  </HStack>

                  <Text color={textColor} fontSize="sm" noOfLines={3}>
                    {formData.description}
                  </Text>

                  <Divider />

                  <Box>
                    <Text fontWeight="medium" color={textColor} mb={2}>
                      Технологии
                    </Text>
                    <Wrap spacing={2}>
                      {formData.technologies?.slice(0, 6).map((tech) => (
                        <WrapItem key={tech}>
                          <Badge colorScheme="green" borderRadius="full" px={3} py={1}>
                            {tech}
                          </Badge>
                        </WrapItem>
                      ))}
                      {formData.technologies && formData.technologies.length > 6 && (
                        <Badge colorScheme="gray" borderRadius="full" px={3} py={1}>
                          +{formData.technologies.length - 6}
                        </Badge>
                      )}
                    </Wrap>
                  </Box>

                  <HStack spacing={4} fontSize="sm" color={mutedColor}>
                    <HStack>
                      <Icon as={FaUsers} />
                      <Text>{formData.teamSize}</Text>
                    </HStack>
                    <HStack>
                      <Icon as={FaClock} />
                      <Text>{formData.duration}</Text>
                    </HStack>
                    <HStack>
                      <Icon as={FaMapMarkerAlt} />
                      <Text>{formData.location}</Text>
                    </HStack>
                    {formData.isRemote && (
                      <HStack>
                        <Icon as={FaGlobe} />
                        <Text>Удаленно</Text>
                      </HStack>
                    )}
                  </HStack>

                  <HStack spacing={4} fontSize="sm" color={mutedColor}>
                    <HStack>
                      <Icon as={FaDollarSign} />
                      <Text>{formData.budget}</Text>
                    </HStack>
                    <HStack>
                      <Icon as={FaStar} />
                      <Text>{formData.difficulty}</Text>
                    </HStack>
                  </HStack>

                  {formData.benefits && formData.benefits.length > 0 && (
                    <Box>
                      <Text fontWeight="medium" color={textColor} mb={2}>
                        Преимущества
                      </Text>
                      <Wrap spacing={2}>
                        {formData.benefits.slice(0, 4).map((benefit) => (
                          <WrapItem key={benefit}>
                            <Badge colorScheme="purple" borderRadius="full" px={3} py={1}>
                              {benefit}
                            </Badge>
                          </WrapItem>
                        ))}
                      </Wrap>
                    </Box>
                  )}
                </VStack>
              </MotionCard>
            </VStack>
          </MotionBox>
        );

      default:
        return null;
    }
  };

  return (
    <Box>
      {/* Progress Bar */}
      <VStack spacing={6} align="stretch" mb={8}>
        <Progress
          value={(currentStep / STEPS.length) * 100}
          colorScheme="blue"
          borderRadius="full"
          size="lg"
        />
        
        <HStack justify="space-between">
          {STEPS.map((step) => (
            <VStack key={step.id} spacing={2} align="center">
              <Circle
                size="40px"
                bg={currentStep >= step.id ? accentColor : 'gray.200'}
                color={currentStep >= step.id ? 'white' : mutedColor}
                border="2px solid"
                borderColor={currentStep >= step.id ? accentColor : borderColor}
              >
                <Icon as={step.icon} boxSize={4} />
              </Circle>
              <Text
                fontSize="xs"
                color={currentStep >= step.id ? accentColor : mutedColor}
                fontWeight="medium"
                textAlign="center"
              >
                {step.title}
              </Text>
            </VStack>
          ))}
        </HStack>
      </VStack>

      {/* Step Content */}
      <Box mb={8}>
        {renderStepContent()}
      </Box>

      {/* Navigation */}
      <HStack justify="space-between">
        <Button
          onClick={prevStep}
          isDisabled={currentStep === 1}
          leftIcon={<Icon as={FaArrowLeft} />}
          variant="outline"
          borderRadius="xl"
        >
          Назад
        </Button>

        <Spacer />

        {currentStep < STEPS.length ? (
          <Button
            onClick={nextStep}
            rightIcon={<Icon as={FaArrowRight} />}
            colorScheme="blue"
            borderRadius="xl"
          >
            Далее
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            isLoading={isLoading}
            rightIcon={<Icon as={FaCheck} />}
            colorScheme="green"
            borderRadius="xl"
            size="lg"
          >
            Создать проект
          </Button>
        )}
      </HStack>

      <Button
        onClick={onCancel}
        variant="ghost"
        mt={4}
        color={mutedColor}
        _hover={{ color: textColor }}
      >
        Отмена
      </Button>
    </Box>
  );
}; 