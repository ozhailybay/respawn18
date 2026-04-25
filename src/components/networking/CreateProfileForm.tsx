import React, { useState } from 'react';
import {
  Box, VStack, HStack, Text, Input, Textarea, Select, Checkbox,
  Button, Progress, Icon, useColorModeValue, Badge, Wrap, WrapItem,
  FormControl, FormLabel, FormErrorMessage, useToast, Alert,
  AlertIcon, AlertTitle, AlertDescription, Divider, Heading,
  SimpleGrid, Card, CardBody, Avatar, Tag, TagLabel, TagCloseButton,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody,
  ModalFooter, ModalCloseButton, useDisclosure, IconButton,
  Tooltip, Flex, Spacer, Circle, keyframes
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaUser, FaCode, FaMapMarkerAlt, FaGraduationCap, FaGlobe,
  FaGithub, FaLinkedin, FaLink, FaCheck, FaArrowRight,
  FaArrowLeft, FaPlus, FaTimes, FaEye, FaEyeSlash, FaStar,
  FaRocket, FaBrain, FaPalette, FaShieldAlt, FaServer,
  FaMobile, FaDatabase, FaCloud, FaLock, FaUnlock
} from 'react-icons/fa';
import { NetworkingProfile } from '../../hooks/useNetworkingProfile';

// @ts-ignore - motion() works with Chakra UI components
const MotionBox = motion(Box);
// @ts-ignore - motion() works with Chakra UI components
const MotionCard = motion(Card);

const fadeIn = keyframes`
  0% { opacity: 0; transform: translateY(20px); }
  100% { opacity: 1; transform: translateY(0); }
`;

interface CreateProfileFormProps {
  onSubmit: (profileData: Partial<NetworkingProfile>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const STEPS = [
  { id: 1, title: 'Основная информация', icon: FaUser },
  { id: 2, title: 'Навыки и интересы', icon: FaCode },
  { id: 3, title: 'Опыт и предпочтения', icon: FaGraduationCap },
  { id: 4, title: 'Контакты и ссылки', icon: FaGlobe },
  { id: 5, title: 'Предварительный просмотр', icon: FaEye },
];

const SKILL_OPTIONS = [
  { name: 'React', category: 'Frontend', icon: FaCode },
  { name: 'TypeScript', category: 'Frontend', icon: FaCode },
  { name: 'Node.js', category: 'Backend', icon: FaServer },
  { name: 'Python', category: 'Backend', icon: FaServer },
  { name: 'Docker', category: 'DevOps', icon: FaCloud },
  { name: 'AWS', category: 'Cloud', icon: FaCloud },
  { name: 'Firebase', category: 'Backend', icon: FaDatabase },
  { name: 'Flutter', category: 'Mobile', icon: FaMobile },
  { name: 'Figma', category: 'Design', icon: FaPalette },
  { name: 'TensorFlow', category: 'AI', icon: FaBrain },
  { name: 'Solidity', category: 'Blockchain', icon: FaShieldAlt },
  { name: 'Kubernetes', category: 'DevOps', icon: FaCloud },
];

const CATEGORY_OPTIONS = [
  'Искусственный интеллект',
  'Веб-разработка',
  'Мобильные приложения',
  'UI/UX дизайн',
  'Блокчейн',
  'Кибербезопасность',
  'Аналитика данных',
  'Облачные технологии',
  'DevOps',
  'IoT',
  'Игровая разработка',
  'Другое'
];

export const CreateProfileForm: React.FC<CreateProfileFormProps> = ({
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<NetworkingProfile>>({
    displayName: '',
    bio: '',
    role: 'developer',
    skills: [],
    interests: [],
    experience: 'entry',
    location: '',
    isRemote: false,
    availability: 'project-based',
    education: '',
    languages: ['Русский'],
    preferredCategories: [],
    preferredTechnologies: [],
    workStyle: 'both',
    communicationStyle: 'mixed',
    portfolio: '',
    github: '',
    linkedin: '',
    website: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [customSkill, setCustomSkill] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'gray.100');
  const mutedColor = useColorModeValue('gray.600', 'gray.400');
  const accentColor = useColorModeValue('blue.500', 'blue.300');

  const updateFormData = (field: keyof NetworkingProfile, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.displayName?.trim()) {
          newErrors.displayName = 'Имя обязательно для заполнения';
        }
        if (!formData.bio?.trim()) {
          newErrors.bio = 'Расскажите немного о себе';
        }
        break;
      case 2:
        if (formData.skills?.length === 0) {
          newErrors.skills = 'Выберите хотя бы один навык';
        }
        if (formData.interests?.length === 0) {
          newErrors.interests = 'Выберите хотя бы один интерес';
        }
        break;
      case 3:
        if (!formData.location?.trim()) {
          newErrors.location = 'Укажите вашу локацию';
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

  const addSkill = (skill: string) => {
    if (skill && !formData.skills?.includes(skill)) {
      updateFormData('skills', [...(formData.skills || []), skill]);
    }
  };

  const removeSkill = (skill: string) => {
    updateFormData('skills', formData.skills?.filter(s => s !== skill) || []);
  };

  const addInterest = (interest: string) => {
    if (interest && !formData.interests?.includes(interest)) {
      updateFormData('interests', [...(formData.interests || []), interest]);
    }
  };

  const removeInterest = (interest: string) => {
    updateFormData('interests', formData.interests?.filter(i => i !== interest) || []);
  };

  const handleSubmit = async () => {
    if (validateStep(currentStep)) {
      try {
        await onSubmit(formData);
        toast({
          title: 'Профиль создан!',
          description: 'Теперь вы можете участвовать в проектах',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } catch (error) {
        toast({
          title: 'Ошибка',
          description: 'Не удалось создать профиль',
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
              <FormControl isInvalid={!!errors.displayName}>
                <FormLabel color={textColor} fontWeight="medium">
                  Имя и фамилия
                </FormLabel>
                <Input
                  value={formData.displayName}
                  onChange={(e) => updateFormData('displayName', e.target.value)}
                  placeholder="Как вас зовут?"
                  size="lg"
                  borderRadius="xl"
                  borderColor={borderColor}
                  _focus={{ borderColor: accentColor, boxShadow: 'none' }}
                />
                <FormErrorMessage>{errors.displayName}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.bio}>
                <FormLabel color={textColor} fontWeight="medium">
                  О себе
                </FormLabel>
                <Textarea
                  value={formData.bio}
                  onChange={(e) => updateFormData('bio', e.target.value)}
                  placeholder="Расскажите о своем опыте, целях и интересах..."
                  rows={4}
                  borderRadius="xl"
                  borderColor={borderColor}
                  _focus={{ borderColor: accentColor, boxShadow: 'none' }}
                />
                <FormErrorMessage>{errors.bio}</FormErrorMessage>
              </FormControl>

              <FormControl>
                <FormLabel color={textColor} fontWeight="medium">
                  Роль в команде
                </FormLabel>
                <Select
                  value={formData.role}
                  onChange={(e) => updateFormData('role', e.target.value)}
                  size="lg"
                  borderRadius="xl"
                  borderColor={borderColor}
                  _focus={{ borderColor: accentColor, boxShadow: 'none' }}
                >
                  <option value="developer">Разработчик</option>
                  <option value="designer">Дизайнер</option>
                  <option value="manager">Менеджер проекта</option>
                  <option value="analyst">Аналитик</option>
                  <option value="devops">DevOps инженер</option>
                  <option value="qa">QA инженер</option>
                  <option value="other">Другое</option>
                </Select>
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
              <FormControl isInvalid={!!errors.skills}>
                <FormLabel color={textColor} fontWeight="medium">
                  Навыки и технологии
                </FormLabel>
                <Box>
                  <Wrap spacing={2} mb={4}>
                    {formData.skills?.map((skill) => (
                      <WrapItem key={skill}>
                        <Tag
                          size="lg"
                          borderRadius="full"
                          variant="solid"
                          colorScheme="blue"
                        >
                          <TagLabel>{skill}</TagLabel>
                          <TagCloseButton onClick={() => removeSkill(skill)} />
                        </Tag>
                      </WrapItem>
                    ))}
                  </Wrap>
                  
                  <SimpleGrid columns={{ base: 2, md: 3 }} spacing={3}>
                    {SKILL_OPTIONS.map((skill) => (
                      <Button
                        key={skill.name}
                        variant={formData.skills?.includes(skill.name) ? 'solid' : 'outline'}
                        colorScheme={formData.skills?.includes(skill.name) ? 'blue' : 'gray'}
                        size="sm"
                        onClick={() => addSkill(skill.name)}
                        leftIcon={<Icon as={skill.icon} />}
                        borderRadius="xl"
                      >
                        {skill.name}
                      </Button>
                    ))}
                  </SimpleGrid>
                  
                  <HStack mt={4}>
                    <Input
                      value={customSkill}
                      onChange={(e) => setCustomSkill(e.target.value)}
                      placeholder="Добавить свой навык..."
                      size="sm"
                      borderRadius="xl"
                    />
                    <Button
                      size="sm"
                      onClick={() => {
                        if (customSkill.trim()) {
                          addSkill(customSkill.trim());
                          setCustomSkill('');
                        }
                      }}
                      borderRadius="xl"
                    >
                      <Icon as={FaPlus} />
                    </Button>
                  </HStack>
                </Box>
                <FormErrorMessage>{errors.skills}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.interests}>
                <FormLabel color={textColor} fontWeight="medium">
                  Интересы и предпочтения
                </FormLabel>
                <Box>
                  <Wrap spacing={2} mb={4}>
                    {formData.interests?.map((interest) => (
                      <WrapItem key={interest}>
                        <Tag
                          size="lg"
                          borderRadius="full"
                          variant="solid"
                          colorScheme="green"
                        >
                          <TagLabel>{interest}</TagLabel>
                          <TagCloseButton onClick={() => removeInterest(interest)} />
                        </Tag>
                      </WrapItem>
                    ))}
                  </Wrap>
                  
                  <SimpleGrid columns={{ base: 2, md: 3 }} spacing={3}>
                    {CATEGORY_OPTIONS.map((category) => (
                      <Button
                        key={category}
                        variant={formData.interests?.includes(category) ? 'solid' : 'outline'}
                        colorScheme={formData.interests?.includes(category) ? 'green' : 'gray'}
                        size="sm"
                        onClick={() => addInterest(category)}
                        borderRadius="xl"
                      >
                        {category}
                      </Button>
                    ))}
                  </SimpleGrid>
                </Box>
                <FormErrorMessage>{errors.interests}</FormErrorMessage>
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
              <FormControl isInvalid={!!errors.location}>
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
                <FormErrorMessage>{errors.location}</FormErrorMessage>
              </FormControl>

              <FormControl>
                <FormLabel color={textColor} fontWeight="medium">
                  Уровень опыта
                </FormLabel>
                <Select
                  value={formData.experience}
                  onChange={(e) => updateFormData('experience', e.target.value)}
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

              <FormControl>
                <FormLabel color={textColor} fontWeight="medium">
                  Доступность
                </FormLabel>
                <Select
                  value={formData.availability}
                  onChange={(e) => updateFormData('availability', e.target.value)}
                  size="lg"
                  borderRadius="xl"
                  borderColor={borderColor}
                  _focus={{ borderColor: accentColor, boxShadow: 'none' }}
                >
                  <option value="project-based">Проектная работа</option>
                  <option value="freelance">Фриланс</option>
                  <option value="part-time">Частичная занятость</option>
                  <option value="full-time">Полная занятость</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel color={textColor} fontWeight="medium">
                  Стиль работы
                </FormLabel>
                <Select
                  value={formData.workStyle}
                  onChange={(e) => updateFormData('workStyle', e.target.value)}
                  size="lg"
                  borderRadius="xl"
                  borderColor={borderColor}
                  _focus={{ borderColor: accentColor, boxShadow: 'none' }}
                >
                  <option value="team">Командная работа</option>
                  <option value="individual">Индивидуальная работа</option>
                  <option value="both">Оба варианта</option>
                </Select>
              </FormControl>

              <Checkbox
                isChecked={formData.isRemote}
                onChange={(e) => updateFormData('isRemote', e.target.checked)}
                colorScheme="blue"
                size="lg"
              >
                Готов к удаленной работе
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
              <FormControl>
                <FormLabel color={textColor} fontWeight="medium">
                  Портфолио
                </FormLabel>
                <Input
                  value={formData.portfolio}
                  onChange={(e) => updateFormData('portfolio', e.target.value)}
                  placeholder="Ссылка на портфолио"
                  size="lg"
                  borderRadius="xl"
                  borderColor={borderColor}
                  _focus={{ borderColor: accentColor, boxShadow: 'none' }}
                />
              </FormControl>

              <FormControl>
                <FormLabel color={textColor} fontWeight="medium">
                  GitHub
                </FormLabel>
                <Input
                  value={formData.github}
                  onChange={(e) => updateFormData('github', e.target.value)}
                  placeholder="Ваш GitHub профиль"
                  size="lg"
                  borderRadius="xl"
                  borderColor={borderColor}
                  _focus={{ borderColor: accentColor, boxShadow: 'none' }}
                  leftIcon={<Icon as={FaGithub} />}
                />
              </FormControl>

              <FormControl>
                <FormLabel color={textColor} fontWeight="medium">
                  LinkedIn
                </FormLabel>
                <Input
                  value={formData.linkedin}
                  onChange={(e) => updateFormData('linkedin', e.target.value)}
                  placeholder="Ваш LinkedIn профиль"
                  size="lg"
                  borderRadius="xl"
                  borderColor={borderColor}
                  _focus={{ borderColor: accentColor, boxShadow: 'none' }}
                  leftIcon={<Icon as={FaLinkedin} />}
                />
              </FormControl>

              <FormControl>
                <FormLabel color={textColor} fontWeight="medium">
                  Личный сайт
                </FormLabel>
                <Input
                  value={formData.website}
                  onChange={(e) => updateFormData('website', e.target.value)}
                  placeholder="Ваш личный сайт"
                  size="lg"
                  borderRadius="xl"
                  borderColor={borderColor}
                  _focus={{ borderColor: accentColor, boxShadow: 'none' }}
                  leftIcon={<Icon as={FaLink} />}
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
                    Проверьте информацию перед созданием профиля
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
                  <HStack>
                    <Avatar size="lg" name={formData.displayName} />
                    <VStack align="start" spacing={1}>
                      <Heading size="md" color={textColor}>
                        {formData.displayName}
                      </Heading>
                      <Text color={mutedColor} fontSize="sm">
                        {formData.role}
                      </Text>
                    </VStack>
                  </HStack>

                  <Text color={textColor} fontSize="sm">
                    {formData.bio}
                  </Text>

                  <Divider />

                  <Box>
                    <Text fontWeight="medium" color={textColor} mb={2}>
                      Навыки
                    </Text>
                    <Wrap spacing={2}>
                      {formData.skills?.slice(0, 6).map((skill) => (
                        <WrapItem key={skill}>
                          <Badge colorScheme="blue" borderRadius="full" px={3} py={1}>
                            {skill}
                          </Badge>
                        </WrapItem>
                      ))}
                      {formData.skills && formData.skills.length > 6 && (
                        <Badge colorScheme="gray" borderRadius="full" px={3} py={1}>
                          +{formData.skills.length - 6}
                        </Badge>
                      )}
                    </Wrap>
                  </Box>

                  <Box>
                    <Text fontWeight="medium" color={textColor} mb={2}>
                      Интересы
                    </Text>
                    <Wrap spacing={2}>
                      {formData.interests?.slice(0, 4).map((interest) => (
                        <WrapItem key={interest}>
                          <Badge colorScheme="green" borderRadius="full" px={3} py={1}>
                            {interest}
                          </Badge>
                        </WrapItem>
                      ))}
                    </Wrap>
                  </Box>

                  <HStack spacing={4} fontSize="sm" color={mutedColor}>
                    <HStack>
                      <Icon as={FaMapMarkerAlt} />
                      <Text>{formData.location}</Text>
                    </HStack>
                    <HStack>
                      <Icon as={FaGraduationCap} />
                      <Text>{formData.experience}</Text>
                    </HStack>
                    {formData.isRemote && (
                      <HStack>
                        <Icon as={FaGlobe} />
                        <Text>Удаленно</Text>
                      </HStack>
                    )}
                  </HStack>
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
            Создать профиль
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