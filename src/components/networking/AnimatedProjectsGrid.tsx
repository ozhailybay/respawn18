import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Heading, 
  Text, 
  SimpleGrid, 
  Flex, 
  Tag, 
  Avatar, 
  Button, 
  HStack, 
  VStack, 
  Icon, 
  useColorModeValue,
  Input,
  InputGroup,
  InputLeftElement,
  Badge,
  Wrap,
  WrapItem,
  Divider,
  useBreakpointValue,
  Container
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaFilter, FaUsers, FaCalendarAlt, FaBookmark, FaRegBookmark } from 'react-icons/fa';

// Типы данных
interface Project {
  id: string;
  title: string;
  description: string;
  tags: string[];
  members: {
    count: number;
    avatars: string[];
  };
  createdAt: string;
  saved?: boolean;
}

interface AnimatedProjectsGridProps {
  initialProjects?: Project[];
  isLoading?: boolean;
}

// Компонент для отображения сетки проектов
const AnimatedProjectsGrid: React.FC<AnimatedProjectsGridProps> = ({ 
  initialProjects = [], 
  isLoading = false 
}) => {
  // Демо-данные для проектов, если не переданы извне
  const demoProjects: Project[] = [
    {
      id: '1',
      title: 'Мобильное приложение для трекинга привычек',
      description: 'Разработка кроссплатформенного мобильного приложения для формирования полезных привычек с геймификацией и социальными элементами',
      tags: ['React Native', 'Firebase', 'UX/UI', 'Mobile'],
      members: {
        count: 4,
        avatars: ['/avatar1.jpg', '/avatar2.jpg', '/avatar3.jpg']
      },
      createdAt: '2023-05-15'
    },
    {
      id: '2',
      title: 'Платформа для онлайн-обучения',
      description: 'Создание веб-платформы для проведения онлайн-курсов с интерактивными элементами и системой отслеживания прогресса',
      tags: ['React', 'Node.js', 'MongoDB', 'WebRTC'],
      members: {
        count: 6,
        avatars: ['/avatar4.jpg', '/avatar5.jpg']
      },
      createdAt: '2023-06-02'
    },
    {
      id: '3',
      title: 'AI-ассистент для написания текстов',
      description: 'Разработка сервиса на основе искусственного интеллекта для помощи в создании и редактировании текстов различных форматов',
      tags: ['Python', 'ML', 'NLP', 'API'],
      members: {
        count: 3,
        avatars: ['/avatar6.jpg', '/avatar7.jpg', '/avatar8.jpg']
      },
      createdAt: '2023-04-20'
    },
    {
      id: '4',
      title: 'Маркетплейс для фрилансеров',
      description: 'Создание платформы для соединения фрилансеров и заказчиков с системой безопасных платежей и рейтингами',
      tags: ['Vue.js', 'Django', 'PostgreSQL', 'Payments'],
      members: {
        count: 5,
        avatars: ['/avatar9.jpg', '/avatar10.jpg']
      },
      createdAt: '2023-05-28'
    },
    {
      id: '5',
      title: 'Система автоматизации для малого бизнеса',
      description: 'Разработка комплексного решения для автоматизации процессов в малом бизнесе: CRM, бухгалтерия, аналитика',
      tags: ['Angular', 'Express', 'MySQL', 'Business'],
      members: {
        count: 7,
        avatars: ['/avatar11.jpg', '/avatar12.jpg', '/avatar13.jpg']
      },
      createdAt: '2023-03-10'
    },
    {
      id: '6',
      title: 'Социальная сеть для творческих людей',
      description: 'Создание специализированной социальной платформы для художников, музыкантов и других творческих профессионалов',
      tags: ['React', 'GraphQL', 'AWS', 'Social'],
      members: {
        count: 4,
        avatars: ['/avatar14.jpg', '/avatar15.jpg']
      },
      createdAt: '2023-06-10'
    }
  ];

  // Состояния
  const [projects, setProjects] = useState<Project[]>(initialProjects.length > 0 ? initialProjects : demoProjects);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>(projects);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  
  // Извлечение всех уникальных тегов из проектов
  useEffect(() => {
    const tags = projects.reduce((acc, project) => {
      project.tags.forEach(tag => {
        if (!acc.includes(tag)) {
          acc.push(tag);
        }
      });
      return acc;
    }, [] as string[]);
    
    setAllTags(tags);
  }, [projects]);
  
  // Фильтрация проектов при изменении поискового запроса или выбранных тегов
  useEffect(() => {
    let result = [...projects];
    
    // Фильтрация по поисковому запросу
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        project => 
          project.title.toLowerCase().includes(query) || 
          project.description.toLowerCase().includes(query) ||
          project.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    // Фильтрация по выбранным тегам
    if (selectedTags.length > 0) {
      result = result.filter(
        project => selectedTags.some(tag => project.tags.includes(tag))
      );
    }
    
    setFilteredProjects(result);
  }, [searchQuery, selectedTags, projects]);
  
  // Обработчики событий
  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag) 
        : [...prev, tag]
    );
  };
  
  const handleSaveProject = (id: string) => {
    setProjects(prev => 
      prev.map(project => 
        project.id === id 
          ? { ...project, saved: !project.saved } 
          : project
      )
    );
  };
  
  // Стили
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const tagBg = useColorModeValue('gray.100', 'gray.700');
  const tagActiveBg = useColorModeValue('gray.100', 'gray.700');
  const tagActiveColor = useColorModeValue('gray.800', 'gray.200');
  
  // Респонсивные настройки
  const columns = useBreakpointValue({ base: 1, md: 2, lg: 3 }) || 1;
  
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
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };
  
  return (
    <Container maxW="container.xl" py={8}>
      {/* Заголовок и поиск */}
      <VStack spacing={8} align="stretch" mb={8}>
        <Flex 
          direction={{ base: "column", md: "row" }} 
          justify="space-between" 
          align={{ base: "stretch", md: "center" }}
          gap={4}
        >
          <Heading 
            as="h2" 
            size="xl" 
            bgGradient="linear(to-r, black, gray.700)" 
            bgClip="text"
          >
            Проекты для коллаборации
          </Heading>
          
          <InputGroup maxW={{ base: "100%", md: "320px" }}>
            <InputLeftElement pointerEvents="none">
              <Icon as={FaSearch} color="gray.400" />
            </InputLeftElement>
            <Input 
              placeholder="Поиск проектов..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              borderRadius="full"
              _focus={{ borderColor: "black", boxShadow: "0 0 0 1px black" }}
            />
          </InputGroup>
        </Flex>
        
        {/* Фильтры по тегам */}
        <Box>
          <Flex align="center" mb={3}>
            <Icon as={FaFilter} mr={2} color="gray.500" />
            <Text fontWeight="medium" color="gray.500">Фильтры:</Text>
          </Flex>
          
          <Wrap spacing={2}>
            {allTags.map(tag => (
              <WrapItem key={tag}>
                <Tag 
                  size="md" 
                  borderRadius="full" 
                  variant="solid"
                  bg={selectedTags.includes(tag) ? tagActiveBg : tagBg}
                  color={selectedTags.includes(tag) ? tagActiveColor : 'inherit'}
                  cursor="pointer"
                  onClick={() => handleTagToggle(tag)}
                  px={3}
                  py={1}
                  _hover={{
                    transform: "translateY(-2px)",
                    boxShadow: "sm"
                  }}
                  transition="all 0.2s"
                >
                  {tag}
                </Tag>
              </WrapItem>
            ))}
          </Wrap>
        </Box>
      </VStack>
      
      {/* Сетка проектов */}
      {isLoading ? (
        <Flex justify="center" py={10}>
          <Text>Загрузка проектов...</Text>
        </Flex>
      ) : filteredProjects.length === 0 ? (
        <Flex 
          direction="column" 
          align="center" 
          justify="center" 
          py={10} 
          px={4}
          bg={useColorModeValue('gray.50', 'gray.900')}
          borderRadius="lg"
        >
          <Heading size="md" mb={2}>Проекты не найдены</Heading>
          <Text textAlign="center">
            Попробуйте изменить параметры поиска или фильтры
          </Text>
          {selectedTags.length > 0 && (
            <Button 
              mt={4} 
              variant="outline" 
              colorScheme="gray"
              onClick={() => setSelectedTags([])}
            >
              Сбросить фильтры
            </Button>
          )}
        </Flex>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <SimpleGrid columns={columns} spacing={6}>
            <AnimatePresence>
              {filteredProjects.map(project => (
                <motion.div
                  key={project.id}
                  variants={itemVariants}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Box
                    borderWidth="1px"
                    borderRadius="lg"
                    overflow="hidden"
                    bg={cardBg}
                    borderColor={borderColor}
                    boxShadow="md"
                    position="relative"
                    transition="all 0.3s"
                    _hover={{
                      transform: "translateY(-4px)",
                      boxShadow: "lg",
                      borderColor: "gray.300"
                    }}
                    height="100%"
                    display="flex"
                    flexDirection="column"
                  >
                    {/* Верхняя часть карточки с кнопкой сохранения */}
                    <Flex justify="space-between" p={4} align="flex-start">
                      <Heading size="md" noOfLines={2}>
                        {project.title}
                      </Heading>
                      <Box 
                        as="button"
                        onClick={() => handleSaveProject(project.id)}
                        color={project.saved ? "black" : "gray.400"}
                        _hover={{ color: project.saved ? "gray.800" : "black" }}
                        transition="all 0.2s"
                      >
                        <Icon 
                          as={project.saved ? FaBookmark : FaRegBookmark} 
                          boxSize={5}
                          transform={project.saved ? "scale(1.1)" : "scale(1)"}
                          transition="transform 0.2s"
                        />
                      </Box>
                    </Flex>
                    
                    {/* Описание проекта */}
                    <Box p={4} pt={0} flex="1">
                      <Text noOfLines={3} color="gray.600" _dark={{ color: "gray.300" }} mb={4}>
                        {project.description}
                      </Text>
                      
                      {/* Теги проекта */}
                      <Wrap mb={4}>
                        {project.tags.map(tag => (
                          <WrapItem key={`${project.id}-${tag}`}>
                            <Badge 
                              borderRadius="full" 
                              px={2} 
                              colorScheme={
                                tag.includes("React") ? "blue" :
                                tag.includes("Node") ? "green" :
                                tag.includes("ML") || tag.includes("AI") ? "purple" :
                                tag.includes("UI") ? "pink" :
                                tag.includes("Mobile") ? "orange" :
                                "gray"
                              }
                            >
                              {tag}
                            </Badge>
                          </WrapItem>
                        ))}
                      </Wrap>
                    </Box>
                    
                    <Divider />
                    
                    {/* Нижняя часть карточки с информацией о команде и датой */}
                    <Flex p={4} justify="space-between" align="center">
                      <HStack>
                        <Icon as={FaUsers} color="gray.500" />
                        <HStack spacing={1}>
                          <Avatar size="xs" name="Team Member" src={project.members.avatars[0]} />
                          {project.members.avatars.length > 1 && (
                            <Avatar size="xs" name="Team Member" src={project.members.avatars[1]} />
                          )}
                          {project.members.count > 2 && (
                            <Box 
                              w="20px" 
                              h="20px" 
                              borderRadius="full" 
                              bg="gray.500" 
                              color="white" 
                              fontSize="xs" 
                              display="flex" 
                              alignItems="center" 
                              justifyContent="center"
                            >
                              +{project.members.count - 2}
                            </Box>
                          )}
                        </HStack>
                      </HStack>
                      
                      <HStack>
                        <Icon as={FaCalendarAlt} color="gray.500" />
                        <Text fontSize="sm" color="gray.500">
                          {new Date(project.createdAt).toLocaleDateString('ru-RU')}
                        </Text>
                      </HStack>
                    </Flex>
                    
                    {/* Кнопка действия */}
                    <Box p={4} pt={0}>
                      <Button 
                        colorScheme="gray" 
                        size="sm" 
                        width="100%"
                        _hover={{
                          transform: "translateY(-2px)",
                          boxShadow: "md"
                        }}
                        transition="all 0.2s"
                      >
                        Подробнее
                      </Button>
                    </Box>
                  </Box>
                </motion.div>
              ))}
            </AnimatePresence>
          </SimpleGrid>
        </motion.div>
      )}
    </Container>
  );
};

export default AnimatedProjectsGrid; 