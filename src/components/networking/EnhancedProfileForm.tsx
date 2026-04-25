import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Box,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Button,
  Heading,
  Text,
  Flex,
  Wrap,
  WrapItem,
  Tag,
  TagLabel,
  TagCloseButton,
  useColorModeValue,
  HStack,
  Icon
} from '@chakra-ui/react';
import { FaUser, FaCode, FaGraduationCap, FaLightbulb } from 'react-icons/fa';

// Типы данных
export interface ProfileFormData {
  name: string;
  bio: string;
  skills: string[];
  experience: string;
  interests: string[];
}

interface EnhancedProfileFormProps {
  onSubmit: (data: ProfileFormData) => void;
}

// Анимированный заголовок секции
const AnimatedSectionTitle: React.FC<{title: string; subtitle?: string; icon?: React.ReactElement}> = ({ 
  title, 
  subtitle,
  icon 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
    >
      <Flex align="center" mb={2}>
        {icon && <Box mr={3}>{icon}</Box>}
        <Heading
          as="h2"
          fontSize={{ base: "xl", md: "2xl" }}
          bgGradient="linear(to-r, black, gray.700)"
          bgClip="text"
          letterSpacing="tight"
        >
          {title}
        </Heading>
      </Flex>
      {subtitle && (
        <Text 
          fontSize={{ base: "sm", md: "md" }} 
          color="gray.600" 
          _dark={{ color: "gray.300" }}
          mb={4}
        >
          {subtitle}
        </Text>
      )}
    </motion.div>
  );
};

// Компонент формы профиля
export const EnhancedProfileForm: React.FC<EnhancedProfileFormProps> = ({ onSubmit }) => {
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const tagBg = useColorModeValue('gray.100', 'gray.700');
  const tagColor = useColorModeValue('gray.800', 'gray.200');
  
  const [formData, setFormData] = useState<ProfileFormData>({
    name: '',
    bio: '',
    skills: [],
    experience: 'junior',
    interests: []
  });
  const [skillInput, setSkillInput] = useState('');
  const [interestInput, setInterestInput] = useState('');
  
  // Обработчики изменения полей формы
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const addSkill = () => {
    if (skillInput && !formData.skills.includes(skillInput)) {
      setFormData(prev => ({ ...prev, skills: [...prev.skills, skillInput] }));
      setSkillInput('');
    }
  };
  
  const removeSkill = (skill: string) => {
    setFormData(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));
  };
  
  const addInterest = () => {
    if (interestInput && !formData.interests.includes(interestInput)) {
      setFormData(prev => ({ ...prev, interests: [...prev.interests, interestInput] }));
      setInterestInput('');
    }
  };
  
  const removeInterest = (interest: string) => {
    setFormData(prev => ({ ...prev, interests: prev.interests.filter(i => i !== interest) }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };
  
  // Варианты для выпадающих списков
  const experienceLevels = [
    { value: 'intern', label: 'Стажер' },
    { value: 'junior', label: 'Junior' },
    { value: 'middle', label: 'Middle' },
    { value: 'senior', label: 'Senior' },
    { value: 'lead', label: 'Team Lead' }
  ];
  
  // Популярные навыки и интересы для быстрого добавления
  const popularSkills = ['JavaScript', 'React', 'Python', 'Design', 'Node.js', 'SQL', 'UI/UX', 'CSS', 'HTML', 'Marketing'];
  const popularInterests = ['Frontend', 'Backend', 'Machine Learning', 'Mobile Dev', 'Data Science', 'DevOps', 'Blockchain'];
  
  // Анимации
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };
  
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Box
        as="form"
        onSubmit={handleSubmit}
        p={{ base: 4, md: 6 }}
        bg={bg}
        borderRadius="xl"
        borderWidth="1px"
        borderColor={borderColor}
        boxShadow="lg"
        w="100%"
        maxW="800px"
        mx="auto"
      >
        <VStack spacing={8} align="stretch">
          <AnimatedSectionTitle 
            title="Создайте свой профиль" 
            subtitle="Заполните информацию о себе, чтобы начать нетворкинг"
            icon={<Icon as={FaUser} boxSize={6} color="black" />}
          />
          
          <motion.div variants={itemVariants}>
            <FormControl isRequired>
              <FormLabel fontWeight="medium">Имя</FormLabel>
              <Input 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                placeholder="Ваше имя"
                focusBorderColor="black"
                size="lg"
              />
            </FormControl>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <FormControl isRequired>
              <FormLabel fontWeight="medium">О себе</FormLabel>
              <Textarea 
                name="bio" 
                value={formData.bio} 
                onChange={handleChange} 
                placeholder="Краткое описание о вас, ваш опыт и цели"
                focusBorderColor="black"
                minH="150px"
                size="lg"
              />
            </FormControl>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <FormControl isRequired>
              <FormLabel fontWeight="medium">Уровень опыта</FormLabel>
              <Select 
                name="experience" 
                value={formData.experience} 
                onChange={handleChange}
                focusBorderColor="black"
                size="lg"
                icon={<FaGraduationCap />}
              >
                {experienceLevels.map(level => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </Select>
            </FormControl>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <FormControl isRequired>
              <FormLabel fontWeight="medium">Навыки</FormLabel>
              <Flex mb={3}>
                <Input 
                  value={skillInput} 
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSkillInput(e.target.value)}
                  placeholder="Введите навык" 
                  mr={2}
                  focusBorderColor="black"
                  size="lg"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addSkill();
                    }
                  }}
                />
                <Button 
                  colorScheme="gray" 
                  onClick={addSkill}
                  leftIcon={<FaCode />}
                  size="lg"
                >
                  Добавить
                </Button>
              </Flex>
              
              {/* Популярные навыки */}
              <Box mb={3}>
                <Text fontSize="sm" mb={2} color="gray.600" _dark={{ color: "gray.400" }}>
                  Популярные навыки:
                </Text>
                <Wrap spacing={2}>
                  {popularSkills.map(skill => (
                    <WrapItem key={skill}>
                      <Tag 
                        size="md" 
                        borderRadius="full" 
                        variant="subtle" 
                        colorScheme="gray"
                        cursor="pointer"
                        onClick={() => {
                          if (!formData.skills.includes(skill)) {
                            setFormData(prev => ({ ...prev, skills: [...prev.skills, skill] }));
                          }
                        }}
                        _hover={{ bg: "gray.200", _dark: { bg: "gray.600" } }}
                      >
                        <TagLabel>{skill}</TagLabel>
                      </Tag>
                    </WrapItem>
                  ))}
                </Wrap>
              </Box>
              
              {/* Выбранные навыки */}
              <Wrap spacing={2}>
                {formData.skills.map(skill => (
                  <WrapItem key={skill}>
                    <Tag 
                      size="md" 
                      borderRadius="full" 
                      bg={tagBg}
                      color={tagColor}
                    >
                      <TagLabel>{skill}</TagLabel>
                      <TagCloseButton onClick={() => removeSkill(skill)} />
                    </Tag>
                  </WrapItem>
                ))}
              </Wrap>
            </FormControl>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <FormControl isRequired>
              <FormLabel fontWeight="medium">Интересы</FormLabel>
              <Flex mb={3}>
                <Input 
                  value={interestInput} 
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInterestInput(e.target.value)}
                  placeholder="Введите интерес" 
                  mr={2}
                  focusBorderColor="black"
                  size="lg"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addInterest();
                    }
                  }}
                />
                <Button 
                  colorScheme="gray" 
                  onClick={addInterest}
                  leftIcon={<FaLightbulb />}
                  size="lg"
                >
                  Добавить
                </Button>
              </Flex>
              
              {/* Популярные интересы */}
              <Box mb={3}>
                <Text fontSize="sm" mb={2} color="gray.600" _dark={{ color: "gray.400" }}>
                  Популярные интересы:
                </Text>
                <Wrap spacing={2}>
                  {popularInterests.map(interest => (
                    <WrapItem key={interest}>
                      <Tag 
                        size="md" 
                        borderRadius="full" 
                        variant="subtle" 
                        colorScheme="gray"
                        cursor="pointer"
                        onClick={() => {
                          if (!formData.interests.includes(interest)) {
                            setFormData(prev => ({ ...prev, interests: [...prev.interests, interest] }));
                          }
                        }}
                        _hover={{ bg: "gray.200", _dark: { bg: "gray.600" } }}
                      >
                        <TagLabel>{interest}</TagLabel>
                      </Tag>
                    </WrapItem>
                  ))}
                </Wrap>
              </Box>
              
              {/* Выбранные интересы */}
              <Wrap spacing={2}>
                {formData.interests.map(interest => (
                  <WrapItem key={interest}>
                    <Tag 
                      size="md" 
                      borderRadius="full" 
                      bg={tagBg}
                      color={tagColor}
                    >
                      <TagLabel>{interest}</TagLabel>
                      <TagCloseButton onClick={() => removeInterest(interest)} />
                    </Tag>
                  </WrapItem>
                ))}
              </Wrap>
            </FormControl>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <HStack justify="flex-end">
              <Button 
                type="submit" 
                colorScheme="gray" 
                size="lg"
                px={10}
                isDisabled={
                  !formData.name.trim() || 
                  !formData.bio.trim() || 
                  formData.skills.length === 0 || 
                  formData.interests.length === 0
                }
                _hover={{
                  transform: "translateY(-2px)",
                  boxShadow: "lg",
                }}
                transition="all 0.2s"
              >
                Создать профиль
              </Button>
            </HStack>
          </motion.div>
        </VStack>
      </Box>
    </motion.div>
  );
}; 