import React, { useEffect, useState } from 'react';
import {
  Box, Button, FormControl, FormLabel, Input, Textarea,
  Select, Checkbox, Heading, Text, VStack, HStack,
  useToast, Flex, Tag, TagLabel, TagCloseButton, TagInput,
  InputGroup, InputRightElement, IconButton, Badge, useColorModeValue,
  Divider, FormHelperText, Switch, Icon
} from '@chakra-ui/react';
import { FaPlus, FaSave, FaRobot, FaMagic, FaGlobeAmericas, FaLightbulb } from 'react-icons/fa';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { collection, addDoc } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { generateText } from '../api/gemini';

// Типы для профиля
interface NetworkingProfile {
  uid: string;
  role: 'seeker' | 'mentor' | 'founder';
  headline?: string;
  bio?: string;
  skills: string[];
  interests: string[];
  lookingFor: Array<'project' | 'people' | 'mentor'>;
  location?: string;
  openToRemote: boolean;
  experienceMonths?: number;
  age?: number;
  languages?: string[];
  education?: string;
  lastUpdated?: any;
}

const defaultProfile: NetworkingProfile = {
  uid: '',
  role: 'seeker',
  headline: '',
  bio: '',
  skills: [],
  interests: [],
  lookingFor: ['project'],
  location: '',
  openToRemote: true,
  experienceMonths: 0,
  languages: [],
  education: ''
};

// Предопределенные навыки для подсказок
const suggestedSkills = [
  'JavaScript', 'Python', 'React', 'Node.js', 'TypeScript', 'Java',
  'UI/UX Design', 'Product Management', 'Data Science', 'Machine Learning',
  'Mobile Development', 'DevOps', 'Cloud Computing', 'Firebase', 'AWS',
  'Marketing', 'Business Development', 'Sales', 'Content Creation',
  'Project Management', 'Leadership', 'Communication', 'Problem Solving'
];

// Компонент для интересов/навыков
const TagsInput: React.FC<{
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder: string;
  suggestions?: string[];
}> = ({ tags, onChange, placeholder, suggestions = [] }) => {
  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    setShowSuggestions(e.target.value.length > 0);
  };
  
  const handleAddTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      onChange([...tags, trimmedTag]);
    }
    setInput('');
    setShowSuggestions(false);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && input) {
      e.preventDefault();
      handleAddTag(input);
    }
  };
  
  const handleRemoveTag = (indexToRemove: number) => {
    onChange(tags.filter((_, index) => index !== indexToRemove));
  };
  
  const filteredSuggestions = suggestions
    .filter(suggestion => 
      suggestion.toLowerCase().includes(input.toLowerCase()) && 
      !tags.includes(suggestion)
    )
    .slice(0, 5);
  
  return (
    <Box position="relative">
      <Flex wrap="wrap" mb={2} gap={2}>
        {tags.map((tag, index) => (
          <Tag
            key={index}
            size="md"
            borderRadius="full"
            variant="solid"
            colorScheme="gray"
          >
            <TagLabel>{tag}</TagLabel>
            <TagCloseButton onClick={() => handleRemoveTag(index)} />
          </Tag>
        ))}
      </Flex>
      
      <InputGroup size="md">
        <Input
          placeholder={placeholder}
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(input.length > 0)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        />
        <InputRightElement>
          <IconButton
            size="sm"
            colorScheme="gray"
            aria-label="Add tag"
            icon={<FaPlus />}
            onClick={() => handleAddTag(input)}
            disabled={!input.trim()}
          />
        </InputRightElement>
      </InputGroup>
      
      {showSuggestions && filteredSuggestions.length > 0 && (
        <Box
          position="absolute"
          mt={1}
          w="full"
          zIndex={10}
          bg="white"
          boxShadow="md"
          borderRadius="md"
          border="1px solid"
          borderColor="gray.200"
          _dark={{
            bg: "gray.700",
            borderColor: "gray.600"
          }}
        >
          {filteredSuggestions.map((suggestion, index) => (
            <Box
              key={index}
              p={2}
              cursor="pointer"
              _hover={{ bg: "gray.100", _dark: { bg: "gray.600" } }}
              onClick={() => handleAddTag(suggestion)}
            >
              {suggestion}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

// @ts-ignore - motion() works with Chakra UI components
const MotionBox = motion(Box);

const NetworkingProfile: React.FC = () => {
  const [user] = useAuthState(auth);
  const [profile, setProfile] = useState<NetworkingProfile>(defaultProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [suggestingSkills, setSuggestingSkills] = useState(false);
  const toast = useToast();
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const highlightBg = useColorModeValue('gray.50', 'gray.800');
  
  // Загрузка профиля при инициализации
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const profileRef = doc(db, 'networkingProfiles', user.uid);
        const profileSnap = await getDoc(profileRef);
        
        if (profileSnap.exists()) {
          setProfile({ 
            ...defaultProfile, 
            ...profileSnap.data() as NetworkingProfile 
          });
        } else {
          // Если профиля нет, создаем новый с данными из основного профиля пользователя
          const userRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userRef);
          
          if (userSnap.exists()) {
            const userData = userSnap.data();
            
            setProfile({
              ...defaultProfile,
              uid: user.uid,
              headline: userData.headline || userData.displayName || '',
              skills: userData.skills || [],
              interests: userData.interests || [],
              location: userData.location || '',
            });
          } else {
            setProfile({
              ...defaultProfile,
              uid: user.uid,
            });
          }
        }
      } catch (error) {
        console.error('Error fetching networking profile:', error);
        toast({
          title: 'Error loading profile',
          description: 'Could not load your networking profile. Please try again.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [user, toast]);
  
  // Функция сохранения профиля
  const handleSaveProfile = async () => {
    if (!user) return;
    
    try {
      setSaving(true);
      
      const profileData = {
        ...profile,
        uid: user.uid,
        lastUpdated: new Date(),
      };
      
      await setDoc(doc(db, 'networkingProfiles', user.uid), profileData);
      
      toast({
        title: 'Профиль сохранен',
        description: 'Ваш профиль успешно обновлен',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить профиль',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  };
  
  // Предложение навыков на основе данных пользователя
  const handleSuggestSkills = async () => {
    if (!profile.bio && !profile.headline) {
      toast({
        title: 'Недостаточно информации',
        description: 'Пожалуйста, заполните описание или заголовок профиля для генерации навыков',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    setSuggestingSkills(true);
    
    try {
      const prompt = `
        Проанализируй следующее описание профиля и предложи 5-7 релевантных навыков для этого человека.
        Верни только список навыков, разделенных запятыми, без дополнительного текста.
        
        Заголовок профиля: ${profile.headline || 'Не указан'}
        Описание: ${profile.bio || 'Не указано'}
        Текущие навыки: ${profile.skills.join(', ') || 'Не указаны'}
        Интересы: ${profile.interests.join(', ') || 'Не указаны'}
      `;
      
      const response = await generateText(prompt);
      
      if (response && typeof response === 'object' && 'text' in response) {
        // Обработка ответа
        const skillsText = response.text;
        
        // Разделение текста на отдельные навыки
        const suggestedSkillsArray = skillsText
          .split(',')
          .map(skill => skill.trim())
          .filter(skill => skill.length > 0 && !profile.skills.includes(skill));
        
        // Добавление новых навыков к существующим
        setProfile(prev => ({
          ...prev,
          skills: [...prev.skills, ...suggestedSkillsArray.slice(0, 5)]
        }));
        
        toast({
          title: 'Навыки предложены',
          description: `Добавлено ${suggestedSkillsArray.length} новых навыков`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } else {
        throw new Error('Неверный формат ответа от AI');
      }
    } catch (error) {
      console.error('Error suggesting skills:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось сгенерировать навыки',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setSuggestingSkills(false);
    }
  };
  
  // Обработчики изменения полей формы
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setProfile(prev => ({ ...prev, [name]: checked }));
  };
  
  const handleLookingForChange = (value: 'project' | 'people' | 'mentor', checked: boolean) => {
    setProfile(prev => ({
      ...prev,
      lookingFor: checked 
        ? [...prev.lookingFor, value]
        : prev.lookingFor.filter(item => item !== value)
    }));
  };
  
  if (loading) {
    return (
      <Box textAlign="center" py={10}>
        <Text>Загрузка профиля...</Text>
      </Box>
    );
  }
  
  return (
    <Box>
      <Heading size="lg" mb={6}>Ваш профиль нетворкинга</Heading>
      
      <Box 
        as="form" 
        bg={bgColor} 
        p={6} 
        borderRadius="lg" 
        borderWidth="1px"
        borderColor={borderColor}
        boxShadow="sm"
      >
        <VStack spacing={6} align="stretch">
          {/* Основная информация */}
          <Box>
            <Heading size="md" mb={4}>Основная информация</Heading>
            
            <FormControl mb={4}>
              <FormLabel>Роль</FormLabel>
              <Select 
                name="role" 
                value={profile.role} 
                onChange={handleChange}
              >
                <option value="seeker">Ищу проект/команду</option>
                <option value="mentor">Ментор</option>
                <option value="founder">Основатель проекта</option>
              </Select>
            </FormControl>
            
            <FormControl mb={4}>
              <FormLabel>Заголовок профиля</FormLabel>
              <Input 
                name="headline" 
                value={profile.headline || ''} 
                onChange={handleChange}
                placeholder="Например: Frontend разработчик с опытом в React"
              />
              <FormHelperText>
                Краткое описание вашей специализации или текущей роли
              </FormHelperText>
            </FormControl>
            
            <FormControl mb={4}>
              <FormLabel>Описание</FormLabel>
              <Textarea 
                name="bio" 
                value={profile.bio || ''} 
                onChange={handleChange}
                placeholder="Расскажите о себе, своём опыте и целях"
                rows={4}
              />
            </FormControl>
            
            <HStack spacing={4}>
              <FormControl mb={4}>
                <FormLabel>Локация</FormLabel>
                <Input 
                  name="location" 
                  value={profile.location || ''} 
                  onChange={handleChange}
                  placeholder="Город, страна"
                />
              </FormControl>
              
              <FormControl mb={4}>
                <FormLabel>Возраст</FormLabel>
                <Input 
                  name="age" 
                  type="number" 
                  value={profile.age || ''} 
                  onChange={handleChange}
                  placeholder="Ваш возраст"
                />
              </FormControl>
            </HStack>
            
            <FormControl mb={4}>
              <FormLabel>Месяцев опыта</FormLabel>
              <Input 
                name="experienceMonths" 
                type="number" 
                value={profile.experienceMonths || ''} 
                onChange={handleChange}
                placeholder="Количество месяцев опыта"
              />
              <FormHelperText>
                Общее количество месяцев опыта в вашей области
              </FormHelperText>
            </FormControl>
            
            <FormControl mb={4} display="flex" alignItems="center">
              <FormLabel mb="0">
                Готовность к удаленной работе
              </FormLabel>
              <Switch 
                name="openToRemote" 
                isChecked={profile.openToRemote} 
                onChange={handleCheckboxChange} 
                colorScheme="gray"
              />
            </FormControl>
          </Box>
          
          <Divider />
          
          {/* Навыки и интересы */}
          <Box>
            <Heading size="md" mb={4}>Навыки и интересы</Heading>
            
            <FormControl mb={4}>
              <FormLabel>
                <Flex align="center" justify="space-between">
                  <span>Навыки</span>
                  <Button 
                    size="xs" 
                    leftIcon={<Icon as={FaMagic} />} 
                    colorScheme="gray" 
                    variant="outline"
                    onClick={handleSuggestSkills}
                    isLoading={suggestingSkills}
                    loadingText="Генерация..."
                    isDisabled={!profile.bio && !profile.headline}
                  >
                    Предложить навыки с AI
                  </Button>
                </Flex>
              </FormLabel>
              <TagsInput 
                tags={profile.skills} 
                onChange={(newTags) => setProfile(prev => ({ ...prev, skills: newTags }))}
                placeholder="Добавьте навыки"
                suggestions={suggestedSkills}
              />
              <FormHelperText>
                Технические и другие профессиональные навыки
              </FormHelperText>
            </FormControl>
            
            <FormControl mb={4}>
              <FormLabel>Интересы</FormLabel>
              <TagsInput 
                tags={profile.interests} 
                onChange={(newTags) => setProfile(prev => ({ ...prev, interests: newTags }))}
                placeholder="Добавьте интересы"
              />
              <FormHelperText>
                Профессиональные интересы и области, которые вас привлекают
              </FormHelperText>
            </FormControl>
            
            <FormControl mb={4}>
              <FormLabel>Языки</FormLabel>
              <TagsInput 
                tags={profile.languages || []} 
                onChange={(newTags) => setProfile(prev => ({ ...prev, languages: newTags }))}
                placeholder="Добавьте языки, которыми вы владеете"
              />
            </FormControl>
            
            <FormControl mb={4}>
              <FormLabel>Образование</FormLabel>
              <Input 
                name="education" 
                value={profile.education || ''} 
                onChange={handleChange}
                placeholder="Например: Бакалавр информатики, КазНУ"
              />
            </FormControl>
          </Box>
          
          <Divider />
          
          {/* Предпочтения */}
          <Box>
            <Heading size="md" mb={4}>Что вы ищете?</Heading>
            
            <FormControl mb={4}>
              <FormLabel>Я ищу:</FormLabel>
              <VStack align="start">
                <Checkbox 
                  isChecked={profile.lookingFor.includes('project')}
                  onChange={(e) => handleLookingForChange('project', e.target.checked)}
                  colorScheme="gray"
                >
                  Проект для участия
                </Checkbox>
                <Checkbox 
                  isChecked={profile.lookingFor.includes('people')}
                  onChange={(e) => handleLookingForChange('people', e.target.checked)}
                  colorScheme="gray"
                >
                  Людей в команду
                </Checkbox>
                <Checkbox 
                  isChecked={profile.lookingFor.includes('mentor')}
                  onChange={(e) => handleLookingForChange('mentor', e.target.checked)}
                  colorScheme="gray"
                >
                  Ментора/наставника
                </Checkbox>
              </VStack>
            </FormControl>
          </Box>
          
          <Divider />
          
          {/* Кнопки действий */}
          <Flex justify="flex-end">
            <Button
              leftIcon={<Icon as={FaSave} />}
              colorScheme="gray"
              isLoading={saving}
              loadingText="Сохранение..."
              onClick={handleSaveProfile}
            >
              Сохранить профиль
            </Button>
          </Flex>
        </VStack>
      </Box>
    </Box>
  );
};

export default NetworkingProfile; 