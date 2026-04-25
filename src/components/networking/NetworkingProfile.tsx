import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  Flex,
  Heading,
  Text,
  Avatar,
  Badge,
  Button,
  IconButton,
  Divider,
  HStack,
  VStack,
  Wrap,
  WrapItem,
  useColorModeValue,
  Container,
  SimpleGrid,
  Progress,
  Tooltip,
  Icon,
  Link,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  useBreakpointValue,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from '@chakra-ui/react';
import {
  FaLinkedin,
  FaGithub,
  FaGlobe,
  FaEnvelope,
  FaEdit,
  FaEllipsisV,
  FaPlus,
  FaUserPlus,
  FaComments,
  FaProjectDiagram,
  FaHistory,
  FaChartLine,
  FaRegStar,
  FaStar,
  FaRegBookmark,
  FaBookmark,
  FaShareAlt,
} from 'react-icons/fa';

// Типы данных
interface Skill {
  name: string;
  level: number; // от 0 до 100
  endorsements?: number;
}

interface Experience {
  title: string;
  company: string;
  period: string;
  description: string;
}

interface Project {
  id: string;
  title: string;
  description: string;
  tags: string[];
  thumbnail?: string;
}

interface ProfileProps {
  userId?: string;
  isCurrentUser?: boolean;
}

// Компонент профиля пользователя
const NetworkingProfile: React.FC<ProfileProps> = ({
  userId = 'demo-user',
  isCurrentUser = false,
}) => {
  // Демо-данные для профиля
  const demoProfile = {
    id: 'demo-user',
    name: 'Анна Смирнова',
    title: 'Senior Frontend Developer',
    location: 'Москва, Россия',
    bio: 'Опытный фронтенд-разработчик с более чем 5-летним стажем создания современных веб-приложений. Специализируюсь на React, TypeScript и доступности. Увлечена созданием красивых и удобных пользовательских интерфейсов.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    coverImage: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
    skills: [
      { name: 'React', level: 95, endorsements: 18 },
      { name: 'TypeScript', level: 90, endorsements: 15 },
      { name: 'CSS/SCSS', level: 85, endorsements: 12 },
      { name: 'Node.js', level: 75, endorsements: 8 },
      { name: 'GraphQL', level: 70, endorsements: 6 },
      { name: 'UI/UX Design', level: 65, endorsements: 10 },
    ],
    experience: [
      {
        title: 'Senior Frontend Developer',
        company: 'TechInnovate',
        period: '2021 - Настоящее время',
        description: 'Разработка и поддержка масштабируемых веб-приложений с использованием React и TypeScript. Внедрение современных практик разработки и оптимизация производительности.',
      },
      {
        title: 'Frontend Developer',
        company: 'WebSolutions',
        period: '2018 - 2021',
        description: 'Создание отзывчивых пользовательских интерфейсов, работа с REST API, внедрение новых функций и улучшение UX.',
      },
      {
        title: 'Junior Web Developer',
        company: 'CreativeStudio',
        period: '2016 - 2018',
        description: 'Верстка сайтов, разработка интерактивных элементов, оптимизация для мобильных устройств.',
      },
    ],
    projects: [
      {
        id: 'p1',
        title: 'E-commerce платформа',
        description: 'Современный интернет-магазин с каталогом товаров, корзиной и системой оплаты',
        tags: ['React', 'Redux', 'Node.js'],
        thumbnail: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
      },
      {
        id: 'p2',
        title: 'Дашборд аналитики',
        description: 'Интерактивная панель с визуализацией данных и настраиваемыми отчетами',
        tags: ['TypeScript', 'D3.js', 'GraphQL'],
        thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
      },
      {
        id: 'p3',
        title: 'Приложение для планирования',
        description: 'Инструмент для управления задачами и проектами с календарем и напоминаниями',
        tags: ['React', 'Firebase', 'Material-UI'],
        thumbnail: 'https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
      },
    ],
    contacts: {
      email: 'anna.smirnova@example.com',
      linkedin: 'linkedin.com/in/annasmirnova',
      github: 'github.com/annasmirnova',
      website: 'annasmirnova.dev',
    },
    stats: {
      projectsCompleted: 15,
      collaborations: 8,
      endorsements: 42,
      connections: 187,
    },
  };

  // Состояния
  const [profile] = useState(demoProfile);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  // Стили
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.700', 'gray.300');
  const mutedTextColor = useColorModeValue('gray.600', 'gray.400');
  const skillBg = useColorModeValue('gray.100', 'gray.700');
  const accentColor = useColorModeValue('teal.500', 'teal.300');
  const tabBg = useColorModeValue('gray.100', 'gray.700');
  const tabHoverBg = useColorModeValue('gray.200', 'gray.600');

  // Респонсивные настройки
  const isMobile = useBreakpointValue({ base: true, md: false });
  const avatarSize = useBreakpointValue({ base: 'xl', md: '2xl' });
  const statsColumns = useBreakpointValue({ base: 2, md: 4 });

  // Анимации
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15,
      },
    },
  };

  // Обработчики событий
  const handleFollow = () => {
    setIsFollowing(!isFollowing);
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
  };

  const handleTabChange = (index: number) => {
    setActiveTab(index);
  };

  // Получение цвета для прогресс-бара навыка
  const getSkillColor = (level: number) => {
    if (level >= 90) return 'green';
    if (level >= 70) return 'teal';
    if (level >= 50) return 'blue';
    if (level >= 30) return 'orange';
    return 'red';
  };

  return (
    <Container maxW="container.xl" py={8}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Обложка профиля */}
        <motion.div variants={itemVariants}>
          <Box
            h={{ base: '150px', md: '250px' }}
            w="100%"
            bgImage={`url(${profile.coverImage})`}
            bgSize="cover"
            bgPosition="center"
            borderRadius="lg"
            position="relative"
            mb={{ base: '60px', md: '80px' }}
            overflow="hidden"
          >
            {/* Градиентный оверлей */}
            <Box
              position="absolute"
              top="0"
              left="0"
              right="0"
              bottom="0"
              bgGradient="linear(to-b, transparent 50%, rgba(0,0,0,0.7))"
            />

            {/* Аватар */}
            <Box
              position="absolute"
              bottom={{ base: '-40px', md: '-60px' }}
              left={{ base: '50%', md: '5%' }}
              transform={{ base: 'translateX(-50%)', md: 'translateX(0)' }}
            >
              <Avatar
                src={profile.avatar}
                name={profile.name}
                size={avatarSize}
                border="4px solid"
                borderColor={cardBg}
                boxShadow="lg"
              />
            </Box>

            {/* Кнопки действий */}
            {!isCurrentUser && (
              <HStack
                position="absolute"
                top="4"
                right="4"
                spacing={2}
              >
                <IconButton
                  aria-label="Сохранить профиль"
                  icon={isSaved ? <FaBookmark /> : <FaRegBookmark />}
                  colorScheme={isSaved ? 'teal' : 'gray'}
                  variant="solid"
                  onClick={handleSave}
                  size="sm"
                />
                <IconButton
                  aria-label="Поделиться профилем"
                  icon={<FaShareAlt />}
                  colorScheme="gray"
                  variant="solid"
                  size="sm"
                />
                <Menu>
                  <MenuButton
                    as={IconButton}
                    aria-label="Дополнительные действия"
                    icon={<FaEllipsisV />}
                    colorScheme="gray"
                    variant="solid"
                    size="sm"
                  />
                  <MenuList>
                    <MenuItem icon={<FaEnvelope />}>Отправить сообщение</MenuItem>
                    <MenuItem icon={<FaPlus />}>Пригласить в проект</MenuItem>
                  </MenuList>
                </Menu>
              </HStack>
            )}

            {/* Редактирование профиля (для текущего пользователя) */}
            {isCurrentUser && (
              <Button
                leftIcon={<FaEdit />}
                position="absolute"
                top="4"
                right="4"
                colorScheme="gray"
                size="sm"
              >
                Редактировать профиль
              </Button>
            )}
          </Box>
        </motion.div>

        {/* Информация о пользователе */}
        <Flex
          direction={{ base: 'column', md: 'row' }}
          justify="space-between"
          align={{ base: 'center', md: 'flex-end' }}
          mb={6}
          mt={{ base: 0, md: '-60px' }}
        >
          <Box
            textAlign={{ base: 'center', md: 'left' }}
            ml={{ base: 0, md: '140px' }}
            mb={{ base: 4, md: 0 }}
          >
            <motion.div variants={itemVariants}>
              <Heading as="h1" size="xl" mb={1}>
                {profile.name}
              </Heading>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Text fontSize="lg" color={accentColor} fontWeight="medium" mb={1}>
                {profile.title}
              </Text>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Text color={mutedTextColor} fontSize="sm">
                {profile.location}
              </Text>
            </motion.div>
          </Box>

          {!isCurrentUser && (
            <HStack spacing={3}>
              <motion.div variants={itemVariants}>
                <Button
                  colorScheme={isFollowing ? 'gray' : 'teal'}
                  leftIcon={isFollowing ? undefined : <FaUserPlus />}
                  onClick={handleFollow}
                >
                  {isFollowing ? 'В контактах' : 'Добавить в контакты'}
                </Button>
              </motion.div>
              <motion.div variants={itemVariants}>
                <Button
                  leftIcon={<FaComments />}
                  variant="outline"
                  colorScheme="gray"
                >
                  Сообщение
                </Button>
              </motion.div>
            </HStack>
          )}
        </Flex>

        {/* Статистика профиля */}
        <motion.div variants={itemVariants}>
          <SimpleGrid
            columns={statsColumns}
            spacing={4}
            mb={8}
            bg={cardBg}
            p={5}
            borderRadius="lg"
            boxShadow="md"
            borderWidth="1px"
            borderColor={borderColor}
          >
            <Box textAlign="center">
              <Text fontSize="3xl" fontWeight="bold" color={accentColor}>
                {profile.stats.projectsCompleted}
              </Text>
              <Text fontSize="sm" color={mutedTextColor}>
                Проектов
              </Text>
            </Box>
            <Box textAlign="center">
              <Text fontSize="3xl" fontWeight="bold" color={accentColor}>
                {profile.stats.collaborations}
              </Text>
              <Text fontSize="sm" color={mutedTextColor}>
                Коллабораций
              </Text>
            </Box>
            <Box textAlign="center">
              <Text fontSize="3xl" fontWeight="bold" color={accentColor}>
                {profile.stats.endorsements}
              </Text>
              <Text fontSize="sm" color={mutedTextColor}>
                Рекомендаций
              </Text>
            </Box>
            <Box textAlign="center">
              <Text fontSize="3xl" fontWeight="bold" color={accentColor}>
                {profile.stats.connections}
              </Text>
              <Text fontSize="sm" color={mutedTextColor}>
                Контактов
              </Text>
            </Box>
          </SimpleGrid>
        </motion.div>

        {/* Основное содержимое профиля */}
        <Flex
          direction={{ base: 'column', lg: 'row' }}
          gap={6}
        >
          {/* Левая колонка */}
          <Box width={{ base: '100%', lg: '35%' }}>
            {/* О себе */}
            <motion.div variants={itemVariants}>
              <Box
                bg={cardBg}
                p={5}
                borderRadius="lg"
                boxShadow="md"
                mb={6}
                borderWidth="1px"
                borderColor={borderColor}
              >
                <Heading size="md" mb={4}>
                  О себе
                </Heading>
                <Text color={textColor}>{profile.bio}</Text>
              </Box>
            </motion.div>

            {/* Контакты */}
            <motion.div variants={itemVariants}>
              <Box
                bg={cardBg}
                p={5}
                borderRadius="lg"
                boxShadow="md"
                mb={6}
                borderWidth="1px"
                borderColor={borderColor}
              >
                <Heading size="md" mb={4}>
                  Контакты
                </Heading>
                <VStack align="stretch" spacing={3}>
                  <HStack>
                    <Icon as={FaEnvelope} color={accentColor} />
                    <Text>{profile.contacts.email}</Text>
                  </HStack>
                  <HStack>
                    <Icon as={FaLinkedin} color={accentColor} />
                    <Link href={`https://${profile.contacts.linkedin}`} isExternal>
                      {profile.contacts.linkedin}
                    </Link>
                  </HStack>
                  <HStack>
                    <Icon as={FaGithub} color={accentColor} />
                    <Link href={`https://${profile.contacts.github}`} isExternal>
                      {profile.contacts.github}
                    </Link>
                  </HStack>
                  <HStack>
                    <Icon as={FaGlobe} color={accentColor} />
                    <Link href={`https://${profile.contacts.website}`} isExternal>
                      {profile.contacts.website}
                    </Link>
                  </HStack>
                </VStack>
              </Box>
            </motion.div>

            {/* Навыки */}
            <motion.div variants={itemVariants}>
              <Box
                bg={cardBg}
                p={5}
                borderRadius="lg"
                boxShadow="md"
                borderWidth="1px"
                borderColor={borderColor}
              >
                <Flex justify="space-between" align="center" mb={4}>
                  <Heading size="md">Навыки</Heading>
                  {isCurrentUser && (
                    <IconButton
                      size="sm"
                      aria-label="Добавить навык"
                      icon={<FaPlus />}
                      colorScheme="gray"
                      variant="ghost"
                    />
                  )}
                </Flex>
                <VStack align="stretch" spacing={4}>
                  {profile.skills.map((skill, index) => (
                    <Box key={index}>
                      <Flex justify="space-between" mb={1}>
                        <Text fontWeight="medium">{skill.name}</Text>
                        <HStack>
                          <Icon as={FaRegStar} color="yellow.500" />
                          <Text fontSize="sm">{skill.endorsements}</Text>
                        </HStack>
                      </Flex>
                      <Tooltip label={`${skill.level}%`}>
                        <Progress
                          value={skill.level}
                          colorScheme={getSkillColor(skill.level)}
                          borderRadius="full"
                          size="sm"
                        />
                      </Tooltip>
                    </Box>
                  ))}
                </VStack>
              </Box>
            </motion.div>
          </Box>

          {/* Правая колонка */}
          <Box width={{ base: '100%', lg: '65%' }}>
            <motion.div variants={itemVariants}>
              <Box
                bg={cardBg}
                borderRadius="lg"
                boxShadow="md"
                overflow="hidden"
                borderWidth="1px"
                borderColor={borderColor}
              >
                <Tabs
                  isFitted
                  variant="enclosed"
                  colorScheme="gray"
                  onChange={handleTabChange}
                  defaultIndex={activeTab}
                >
                  <TabList>
                    <Tab
                      _selected={{ color: accentColor, borderBottomColor: accentColor }}
                      fontWeight="medium"
                      py={4}
                    >
                      <Icon as={FaHistory} mr={2} />
                      <Text display={{ base: 'none', sm: 'inline' }}>Опыт работы</Text>
                    </Tab>
                    <Tab
                      _selected={{ color: accentColor, borderBottomColor: accentColor }}
                      fontWeight="medium"
                      py={4}
                    >
                      <Icon as={FaProjectDiagram} mr={2} />
                      <Text display={{ base: 'none', sm: 'inline' }}>Проекты</Text>
                    </Tab>
                    <Tab
                      _selected={{ color: accentColor, borderBottomColor: accentColor }}
                      fontWeight="medium"
                      py={4}
                    >
                      <Icon as={FaChartLine} mr={2} />
                      <Text display={{ base: 'none', sm: 'inline' }}>Активность</Text>
                    </Tab>
                  </TabList>

                  <TabPanels>
                    {/* Опыт работы */}
                    <TabPanel p={5}>
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={`tab-${activeTab}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                        >
                          <VStack spacing={6} align="stretch">
                            {profile.experience.map((exp, index) => (
                              <Box key={index}>
                                <Flex
                                  direction={{ base: 'column', sm: 'row' }}
                                  justify="space-between"
                                  mb={2}
                                >
                                  <Heading size="md" color={textColor}>
                                    {exp.title}
                                  </Heading>
                                  <Text
                                    fontSize="sm"
                                    color={mutedTextColor}
                                    fontWeight="medium"
                                  >
                                    {exp.period}
                                  </Text>
                                </Flex>
                                <Text
                                  fontSize="md"
                                  fontWeight="medium"
                                  color={accentColor}
                                  mb={2}
                                >
                                  {exp.company}
                                </Text>
                                <Text color={textColor}>{exp.description}</Text>
                                {index < profile.experience.length - 1 && (
                                  <Divider mt={6} />
                                )}
                              </Box>
                            ))}
                          </VStack>
                        </motion.div>
                      </AnimatePresence>
                    </TabPanel>

                    {/* Проекты */}
                    <TabPanel p={5}>
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={`tab-${activeTab}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                        >
                          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                            {profile.projects.map((project) => (
                              <Box
                                key={project.id}
                                borderWidth="1px"
                                borderRadius="md"
                                overflow="hidden"
                                bg={cardBg}
                                transition="all 0.3s"
                                _hover={{
                                  transform: 'translateY(-4px)',
                                  boxShadow: 'md',
                                  borderColor: 'teal.300',
                                }}
                              >
                                {project.thumbnail && (
                                  <Box
                                    h="160px"
                                    bgImage={`url(${project.thumbnail})`}
                                    bgSize="cover"
                                    bgPosition="center"
                                  />
                                )}
                                <Box p={4}>
                                  <Heading size="md" mb={2}>
                                    {project.title}
                                  </Heading>
                                  <Text
                                    fontSize="sm"
                                    color={textColor}
                                    noOfLines={2}
                                    mb={3}
                                  >
                                    {project.description}
                                  </Text>
                                  <Wrap mb={3}>
                                    {project.tags.map((tag) => (
                                      <WrapItem key={`${project.id}-${tag}`}>
                                        <Badge
                                          colorScheme={
                                            tag.includes('React')
                                              ? 'blue'
                                              : tag.includes('Type')
                                              ? 'green'
                                              : tag.includes('UI')
                                              ? 'pink'
                                              : 'gray'
                                          }
                                          borderRadius="full"
                                          px={2}
                                        >
                                          {tag}
                                        </Badge>
                                      </WrapItem>
                                    ))}
                                  </Wrap>
                                  <Button
                                    size="sm"
                                    colorScheme="gray"
                                    variant="outline"
                                    width="100%"
                                  >
                                    Подробнее
                                  </Button>
                                </Box>
                              </Box>
                            ))}
                          </SimpleGrid>
                        </motion.div>
                      </AnimatePresence>
                    </TabPanel>

                    {/* Активность */}
                    <TabPanel p={5}>
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={`tab-${activeTab}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Flex
                            direction="column"
                            align="center"
                            justify="center"
                            py={10}
                          >
                            <Text fontSize="lg" mb={4} textAlign="center">
                              Здесь будет отображаться активность пользователя
                            </Text>
                            <Button colorScheme="gray" variant="outline">
                              Показать все обновления
                            </Button>
                          </Flex>
                        </motion.div>
                      </AnimatePresence>
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </Box>
            </motion.div>
          </Box>
        </Flex>
      </motion.div>
    </Container>
  );
};

export default NetworkingProfile; 