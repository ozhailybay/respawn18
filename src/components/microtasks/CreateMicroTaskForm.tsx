import React, { useState } from 'react';
import { useForm, Controller, ControllerRenderProps } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Select,
  Textarea,
  Stack,
  Heading,
  Text,
  Flex,
  Tag,
  TagLabel,
  TagCloseButton,
  HStack,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  useToast,
  Divider,
  Card,
  CardBody,
  Badge,
  InputGroup,
  InputRightElement,
  Icon,
  Progress
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FiCalendar, FiTag, FiAlertTriangle } from 'react-icons/fi';
import { MicroTask, MicroTaskCategory } from '../../types';
import { microTaskService } from '../../services/microTaskService';
import { useAuth } from '../../contexts/AuthContext';

// Минимальные и максимальные значения для валидации
const MIN_TITLE_LENGTH = 5;
const MAX_TITLE_LENGTH = 100;
const MIN_DESCRIPTION_LENGTH = 20;
const MAX_DESCRIPTION_LENGTH = 5000;
const MIN_PRICE = 1000;
const MAX_PRICE = 20000;
const MIN_DEADLINE_HOURS = 24;
const MAX_DEADLINE_DAYS = 14;
const MAX_TAGS_COUNT = 10;
const MAX_TAG_LENGTH = 30;

// Категории микро-тасков
const CATEGORIES: { value: MicroTaskCategory; label: string }[] = [
  { value: 'design', label: 'Дизайн' },
  { value: 'copywriting', label: 'Копирайтинг' },
  { value: 'notion', label: 'Notion' },
  { value: 'other', label: 'Другое' }
];

// Популярные теги для каждой категории
const POPULAR_TAGS: Record<MicroTaskCategory, string[]> = {
  design: ['логотип', 'баннер', 'иконки', 'UI/UX', 'иллюстрация', 'презентация'],
  copywriting: ['статья', 'SEO', 'описание', 'рерайт', 'перевод', 'пресс-релиз'],
  notion: ['база знаний', 'онбординг', 'дашборд', 'CRM', 'трекер задач', 'wiki'],
  other: ['исследование', 'транскрипция', 'таблица', 'анализ данных', 'презентация']
};

// Тип для формы создания микро-таска
type CreateMicroTaskFormData = {
  title: string;
  category: MicroTaskCategory;
  description: string;
  price: number;
  deadlineDate: string;
  deadlineTime: string;
  tags: string[];
  agreeToNDA: boolean;
};

// @ts-ignore - motion() works with Chakra UI components
const MotionBox = motion(Box);

/**
 * Компонент формы для создания микро-таска
 */
const CreateMicroTaskForm: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  
  // Состояние для тегов
  const [tagInput, setTagInput] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  // Состояние для загрузки
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitProgress, setSubmitProgress] = useState(0);
  
  // Настройка react-hook-form
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isValid, touchedFields },
    setValue,
    getValues,
    trigger
  } = useForm<CreateMicroTaskFormData>({
    defaultValues: {
      title: '',
      category: 'design',
      description: '',
      price: 3000,
      deadlineDate: getMinDeadlineDate(),
      deadlineTime: '18:00',
      tags: [],
      agreeToNDA: false
    },
    mode: 'onTouched' // Изменено с 'onChange' на 'onTouched' для улучшения UX
  });
  
  // Наблюдаем за изменением категории для предложения тегов
  const selectedCategory = watch('category');
  const watchedTags = watch('tags');
  const agreeToNDA = watch('agreeToNDA');
  
  // Обработчик добавления тега
  const handleAddTag = (tag: string = tagInput) => {
    const trimmedTag = tag.trim().toLowerCase();
    
    if (!trimmedTag) {
      return;
    }
    
    // Проверка длины тега
    if (trimmedTag.length > MAX_TAG_LENGTH) {
      toast({
        title: 'Ошибка валидации',
        description: `Максимальная длина тега: ${MAX_TAG_LENGTH} символов`,
        status: 'error',
        duration: 3000,
        isClosable: true
      });
      return;
    }
    
    // Проверка на дубликат
    if (selectedTags.includes(trimmedTag)) {
      toast({
        title: 'Дубликат тега',
        description: 'Такой тег уже добавлен',
        status: 'info',
        duration: 2000,
        isClosable: true
      });
      setTagInput('');
      return;
    }
    
    // Проверка максимального количества тегов
    if (selectedTags.length >= MAX_TAGS_COUNT) {
      toast({
        title: 'Лимит тегов',
        description: `Максимальное количество тегов: ${MAX_TAGS_COUNT}`,
        status: 'error',
        duration: 3000,
        isClosable: true
      });
      return;
    }
    
    const newTags = [...selectedTags, trimmedTag];
    setSelectedTags(newTags);
    setValue('tags', newTags);
    
    setTagInput('');
  };
  
  // Обработчик удаления тега
  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = selectedTags.filter(tag => tag !== tagToRemove);
    setSelectedTags(newTags);
    setValue('tags', newTags);
  };
  
  // Проверка дедлайна перед отправкой
  const validateDeadline = (deadlineDate: string, deadlineTime: string): boolean => {
    const deadlineDateTime = new Date(`${deadlineDate}T${deadlineTime}`);
    const now = new Date();
    
    // Минимальный дедлайн: сейчас + 24 часа
    const minDeadline = new Date(now.getTime() + MIN_DEADLINE_HOURS * 60 * 60 * 1000);
    
    // Максимальный дедлайн: сейчас + 14 дней
    const maxDeadline = new Date(now.getTime() + MAX_DEADLINE_DAYS * 24 * 60 * 60 * 1000);
    
    if (deadlineDateTime < minDeadline) {
      toast({
        title: 'Ошибка валидации',
        description: `Дедлайн должен быть не менее ${MIN_DEADLINE_HOURS} часов от текущего момента`,
        status: 'error',
        duration: 5000,
        isClosable: true
      });
      return false;
    }
    
    if (deadlineDateTime > maxDeadline) {
      toast({
        title: 'Ошибка валидации',
        description: `Дедлайн должен быть не более ${MAX_DEADLINE_DAYS} дней от текущего момента`,
        status: 'error',
        duration: 5000,
        isClosable: true
      });
      return false;
    }
    
    return true;
  };
  
  // Обработчик отправки формы
  const onSubmit = async (data: CreateMicroTaskFormData) => {
    if (!currentUser) {
      toast({
        title: 'Ошибка авторизации',
        description: 'Пожалуйста, войдите в систему, чтобы создать задание',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
      return;
    }
    
    // Дополнительная проверка дедлайна (защита от манипуляций с DevTools)
    if (!validateDeadline(data.deadlineDate, data.deadlineTime)) {
      return;
    }
    
    // Дополнительная проверка тегов
    if (data.tags.length > MAX_TAGS_COUNT) {
      toast({
        title: 'Ошибка валидации',
        description: `Максимальное количество тегов: ${MAX_TAGS_COUNT}`,
        status: 'error',
        duration: 5000,
        isClosable: true
      });
      return;
    }
    
    // Нормализация тегов (trim, lowercase, удаление дубликатов)
    const normalizedTags = [...new Set(
      data.tags.map(tag => tag.trim().toLowerCase())
        .filter(tag => tag.length > 0 && tag.length <= MAX_TAG_LENGTH)
    )];
    
    try {
      setIsSubmitting(true);
      setSubmitProgress(25);
      
      // Формируем дату дедлайна
      const deadlineAt = new Date(`${data.deadlineDate}T${data.deadlineTime}`);
      
      setSubmitProgress(50);
      
      // Создаем объект микро-таска
      const taskData: Omit<MicroTask, 'id' | 'status' | 'createdAt'> = {
        title: data.title,
        description: data.description,
        category: data.category,
        price: data.price,
        deadlineAt: deadlineAt.toISOString(),
        employerId: currentUser.uid,
        employerName: currentUser.displayName || 'Пользователь',
        employerPhotoURL: currentUser.photoURL || undefined,
        tags: normalizedTags,
        revisionCount: 0
      };
      
      setSubmitProgress(75);
      
      // Отправляем запрос на создание микро-таска
      const taskId = await microTaskService.createMicroTask(taskData);
      
      setSubmitProgress(100);
      
      toast({
        title: 'Задание создано',
        description: 'Ваше задание успешно опубликовано и доступно для исполнителей',
        status: 'success',
        duration: 5000,
        isClosable: true
      });
      
      // Переходим на страницу созданного таска
      try {
        navigate(`/microtasks/${taskId}`);
      } catch (navigationError) {
        console.error('Ошибка при навигации:', navigationError);
        // Fallback на список заданий при ошибке
        navigate('/microtasks');
      }
    } catch (error: any) {
      console.error('Error creating micro task:', error);
      
      toast({
        title: 'Ошибка при создании задания',
        description: error.message || 'Произошла ошибка при создании задания. Пожалуйста, попробуйте снова.',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    } finally {
      setIsSubmitting(false);
      setSubmitProgress(0);
    }
  };
  
  // Получаем минимальную дату для дедлайна (сегодня + 24 часа)
  function getMinDeadlineDate(): string {
    const date = new Date();
    date.setHours(date.getHours() + MIN_DEADLINE_HOURS);
    return date.toISOString().split('T')[0];
  }
  
  // Получаем максимальную дату для дедлайна (сегодня + 14 дней)
  function getMaxDeadlineDate(): string {
    const date = new Date();
    date.setDate(date.getDate() + MAX_DEADLINE_DAYS);
    return date.toISOString().split('T')[0];
  }
  
  // Рассчитываем комиссию платформы
  function calculatePlatformFee(price: number): number {
    const fee = price * 0.1;
    return Math.max(fee, 200);
  }
  
  // Получаем итоговую сумму к оплате
  const watchPrice = watch('price');
  const platformFee = calculatePlatformFee(watchPrice || 0);
  const totalAmount = (watchPrice || 0) + platformFee;
  
  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      maxW="800px"
      mx="auto"
      p={4}
    >
      <Heading as="h1" size="xl" mb={6}>
        Создание микро-задания
      </Heading>
      
      <Text mb={8} color="gray.600">
        Опубликуйте задание для подростков (14-18 лет) с фиксированной оплатой. 
        Вы получите быстрый результат без долгосрочных обязательств.
      </Text>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={8}>
          {/* Основная информация */}
          <Card>
            <CardBody>
              <Heading as="h2" size="md" mb={4}>
                Основная информация
              </Heading>
              
              <Stack spacing={4}>
                {/* Заголовок */}
                <FormControl isInvalid={!!errors.title}>
                  <FormLabel htmlFor="title">Заголовок задания</FormLabel>
                  <Input
                    id="title"
                    placeholder="Например: Создать логотип для стартапа"
                    {...register('title', {
                      required: 'Заголовок обязателен',
                      minLength: {
                        value: MIN_TITLE_LENGTH,
                        message: `Заголовок должен содержать минимум ${MIN_TITLE_LENGTH} символов`
                      },
                      maxLength: {
                        value: MAX_TITLE_LENGTH,
                        message: `Заголовок не должен превышать ${MAX_TITLE_LENGTH} символов`
                      }
                    })}
                  />
                  <FormErrorMessage>
                    {errors.title && errors.title.message}
                  </FormErrorMessage>
                </FormControl>
                
                {/* Категория */}
                <FormControl isInvalid={!!errors.category}>
                  <FormLabel htmlFor="category">Категория</FormLabel>
                  <Select
                    id="category"
                    {...register('category', {
                      required: 'Выберите категорию'
                    })}
                  >
                    {CATEGORIES.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </Select>
                  <FormErrorMessage>
                    {errors.category && errors.category.message}
                  </FormErrorMessage>
                </FormControl>
                
                {/* Описание */}
                <FormControl isInvalid={!!errors.description}>
                  <FormLabel htmlFor="description">
                    Описание задания
                    <Box as="span" ml={1} fontSize="sm" color="gray.500">
                      (максимум {MAX_DESCRIPTION_LENGTH} символов)
                    </Box>
                  </FormLabel>
                  <Textarea
                    id="description"
                    placeholder="Опишите подробно, что нужно сделать, какой результат вы ожидаете, и какие требования у вас есть"
                    minH="150px"
                    {...register('description', {
                      required: 'Описание обязательно',
                      minLength: {
                        value: MIN_DESCRIPTION_LENGTH,
                        message: `Описание должно содержать минимум ${MIN_DESCRIPTION_LENGTH} символов`
                      },
                      maxLength: {
                        value: MAX_DESCRIPTION_LENGTH,
                        message: `Описание не должно превышать ${MAX_DESCRIPTION_LENGTH} символов`
                      }
                    })}
                  />
                  <FormErrorMessage>
                    {errors.description && errors.description.message}
                  </FormErrorMessage>
                </FormControl>
                
                {/* Теги */}
                <FormControl>
                  <FormLabel>
                    Теги
                    <Box as="span" ml={1} fontSize="sm" color="gray.500">
                      (максимум {MAX_TAGS_COUNT} тегов)
                    </Box>
                  </FormLabel>
                  <Flex direction="column" gap={3}>
                    <InputGroup>
                      <Input
                        placeholder="Введите теги через Enter"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddTag();
                          }
                        }}
                        isDisabled={selectedTags.length >= MAX_TAGS_COUNT}
                      />
                      <InputRightElement>
                        <Icon as={FiTag} />
                      </InputRightElement>
                    </InputGroup>
                    
                    {/* Счетчик тегов */}
                    <Flex justify="space-between" fontSize="sm" color="gray.500">
                      <Text>Добавлено: {selectedTags.length} из {MAX_TAGS_COUNT}</Text>
                      {selectedTags.length > 0 && (
                        <Text>
                          Осталось: {MAX_TAGS_COUNT - selectedTags.length}
                        </Text>
                      )}
                    </Flex>
                    
                    {/* Популярные теги */}
                    <Box>
                      <Text fontSize="sm" mb={2}>
                        Популярные теги:
                      </Text>
                      <Flex wrap="wrap" gap={2}>
                        {POPULAR_TAGS[selectedCategory as MicroTaskCategory]?.map((tag) => (
                          <Tag
                            key={tag}
                            size="sm"
                            colorScheme="gray"
                            variant="outline"
                            cursor={selectedTags.length >= MAX_TAGS_COUNT ? 'not-allowed' : 'pointer'}
                            opacity={selectedTags.length >= MAX_TAGS_COUNT ? 0.5 : 1}
                            onClick={() => {
                              if (selectedTags.length < MAX_TAGS_COUNT) {
                                handleAddTag(tag);
                              }
                            }}
                          >
                            <TagLabel>{tag}</TagLabel>
                          </Tag>
                        ))}
                      </Flex>
                    </Box>
                    
                    {/* Выбранные теги */}
                    {selectedTags.length > 0 && (
                      <Box mt={2}>
                        <Text fontSize="sm" mb={2}>
                          Выбранные теги:
                        </Text>
                        <Flex wrap="wrap" gap={2}>
                          {selectedTags.map((tag) => (
                            <Tag key={tag} size="md" colorScheme="gray">
                              <TagLabel>{tag}</TagLabel>
                              <TagCloseButton onClick={() => handleRemoveTag(tag)} />
                            </Tag>
                          ))}
                        </Flex>
                      </Box>
                    )}
                  </Flex>
                </FormControl>
              </Stack>
            </CardBody>
          </Card>
          
          {/* Бюджет и сроки */}
          <Card>
            <CardBody>
              <Heading as="h2" size="md" mb={4}>
                Бюджет и сроки
              </Heading>
              
              <Stack spacing={4}>
                {/* Цена */}
                <FormControl isInvalid={!!errors.price}>
                  <FormLabel htmlFor="price">Бюджет (KZT)</FormLabel>
                  <Controller
                    name="price"
                    control={control}
                    rules={{
                      required: 'Укажите бюджет',
                      min: {
                        value: MIN_PRICE,
                        message: `Минимальный бюджет: ${MIN_PRICE} KZT`
                      },
                      max: {
                        value: MAX_PRICE,
                        message: `Максимальный бюджет: ${MAX_PRICE} KZT`
                      }
                    }}
                    render={({ field }: { field: ControllerRenderProps<CreateMicroTaskFormData, 'price'> }) => (
                      <NumberInput
                        id="price"
                        min={MIN_PRICE}
                        max={MAX_PRICE}
                        step={500}
                        value={field.value}
                        onChange={(valueString) => field.onChange(Number(valueString))}
                      >
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    )}
                  />
                  <FormErrorMessage>
                    {errors.price && errors.price.message}
                  </FormErrorMessage>
                </FormControl>
                
                {/* Дедлайн */}
                <Flex gap={4} direction={{ base: 'column', md: 'row' }}>
                  <FormControl isInvalid={!!errors.deadlineDate}>
                    <FormLabel htmlFor="deadlineDate">Дата дедлайна</FormLabel>
                    <Input
                      id="deadlineDate"
                      type="date"
                      min={getMinDeadlineDate()}
                      max={getMaxDeadlineDate()}
                      {...register('deadlineDate', {
                        required: 'Укажите дату дедлайна',
                        validate: (value) => {
                          const date = new Date(value);
                          const minDate = new Date(getMinDeadlineDate());
                          const maxDate = new Date(getMaxDeadlineDate());
                          if (date < minDate) return `Минимальная дата: ${getMinDeadlineDate()}`;
                          if (date > maxDate) return `Максимальная дата: ${getMaxDeadlineDate()}`;
                          return true;
                        }
                      })}
                    />
                    <FormErrorMessage>
                      {errors.deadlineDate && errors.deadlineDate.message}
                    </FormErrorMessage>
                  </FormControl>
                  
                  <FormControl isInvalid={!!errors.deadlineTime}>
                    <FormLabel htmlFor="deadlineTime">Время дедлайна</FormLabel>
                    <Input
                      id="deadlineTime"
                      type="time"
                      {...register('deadlineTime', {
                        required: 'Укажите время дедлайна'
                      })}
                    />
                    <FormErrorMessage>
                      {errors.deadlineTime && errors.deadlineTime.message}
                    </FormErrorMessage>
                  </FormControl>
                </Flex>
                
                <Box bg="yellow.50" p={4} borderRadius="md">
                  <Flex align="center" mb={2}>
                    <Icon as={FiAlertTriangle} color="orange" boxSize={5} />
                    <Box ml={2}>
                      <Text fontWeight="medium">Важная информация</Text>
                    </Box>
                  </Flex>
                  <Text fontSize="sm">
                    Дедлайн должен быть не менее {MIN_DEADLINE_HOURS} часов и не более {MAX_DEADLINE_DAYS} дней с момента публикации.
                    Если исполнитель не успеет сдать работу до дедлайна, задание будет автоматически отменено,
                    а платеж возвращен.
                  </Text>
                </Box>
              </Stack>
            </CardBody>
          </Card>
          
          {/* Оплата и условия */}
          <Card>
            <CardBody>
              <Heading as="h2" size="md" mb={4}>
                Оплата и условия
              </Heading>
              
              <Stack spacing={4}>
                <Box bg="gray.50" p={4} borderRadius="md">
                  <Heading as="h3" size="sm" mb={2}>
                    Детали платежа
                  </Heading>
                  
                  <Flex justify="space-between" mb={2}>
                    <Text>Сумма исполнителю:</Text>
                    <Text>{watchPrice?.toLocaleString() || 0} KZT</Text>
                  </Flex>
                  
                  <Flex justify="space-between" mb={2}>
                    <Text>Комиссия платформы (10%):</Text>
                    <Text>{platformFee.toLocaleString()} KZT</Text>
                  </Flex>
                  
                  <Divider my={2} />
                  
                  <Flex justify="space-between" fontWeight="bold">
                    <Text>Итого к оплате:</Text>
                    <Text>{totalAmount.toLocaleString()} KZT</Text>
                  </Flex>
                </Box>
                
                <Box>
                  <Text fontSize="sm" mb={4}>
                    При создании задания сумма будет зарезервирована на вашем счете.
                    Оплата будет переведена исполнителю только после того, как вы примете выполненную работу.
                  </Text>
                  
                  <FormControl isInvalid={!!errors.agreeToNDA}>
                    <Flex align="center">
                      <input
                        type="checkbox"
                        id="agreeToNDA"
                        {...register('agreeToNDA', {
                          required: 'Необходимо согласие с условиями сервиса'
                        })}
                        style={{ marginRight: '8px' }}
                      />
                      <FormLabel htmlFor="agreeToNDA" mb={0}>
                        Я согласен с условиями сервиса и политикой конфиденциальности
                      </FormLabel>
                    </Flex>
                    <FormErrorMessage>
                      {errors.agreeToNDA && errors.agreeToNDA.message}
                    </FormErrorMessage>
                  </FormControl>
                </Box>
              </Stack>
            </CardBody>
          </Card>
          
          {/* Индикатор загрузки */}
          {isSubmitting && (
            <Box mt={4}>
              <Text mb={2} fontSize="sm" textAlign="center">
                Создание задания...
              </Text>
              <Progress 
                value={submitProgress} 
                size="sm" 
                colorScheme="gray" 
                hasStripe 
                isAnimated
                borderRadius="md"
              />
            </Box>
          )}
          
          {/* Кнопки */}
          <Flex justify="flex-end" gap={4} direction={{ base: 'column', md: 'row' }}>
            <Button
              variant="outline"
              onClick={() => {
                // Безопасная навигация назад
                try {
                  navigate(-1);
                } catch (error) {
                  console.error('Ошибка при навигации назад:', error);
                  navigate('/microtasks');
                }
              }}
              isDisabled={isSubmitting}
              width={{ base: '100%', md: 'auto' }}
            >
              Отмена
            </Button>
            
            <Button
              type="submit"
              colorScheme="gray"
              isLoading={isSubmitting}
              loadingText="Создание..."
              isDisabled={!isValid || !agreeToNDA}
              width={{ base: '100%', md: 'auto' }}
            >
              Создать задание
            </Button>
          </Flex>
        </Stack>
      </form>
    </MotionBox>
  );
};

export default CreateMicroTaskForm; 