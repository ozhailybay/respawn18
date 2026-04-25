import React from 'react';
import {
  Box, Container, Heading, Text, VStack, HStack, Button,
  useColorModeValue, SimpleGrid, Card, CardBody, Badge,
  Icon, Alert, AlertIcon, AlertTitle, AlertDescription,
  List, ListItem, ListIcon, Divider
} from '@chakra-ui/react';
import { 
  FaRocket, FaStar, FaCheck, FaArrowRight, FaUsers, 
  FaChartLine, FaHandshake, FaCode, FaPalette, FaBrain,
  FaShieldAlt, FaGlobe, FaMobile, FaServer, FaDatabase,
  FaCloud, FaLock, FaEye, FaHeart, FaBookmark, FaShare, FaFilter
} from 'react-icons/fa';
import { Link as RouterLink } from 'react-router-dom';

const NetworkingDemo: React.FC = () => {
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'gray.100');
  const mutedColor = useColorModeValue('gray.600', 'gray.400');
  const accentColor = useColorModeValue('blue.500', 'blue.300');

  const improvements = [
    {
      title: "Современный дизайн",
      description: "Полностью переработанный интерфейс с элегантными анимациями и современной типографикой",
      icon: FaStar,
      color: "yellow.500"
    },
    {
      title: "Улучшенные карточки проектов",
      description: "Детальная информация о проектах с рейтингом совместимости, бюджетом и преимуществами",
      icon: FaRocket,
      color: "blue.500"
    },
    {
      title: "Продвинутая фильтрация",
      description: "Мощная система фильтров с поиском по технологиям, локации, сложности и бюджету",
      icon: FaFilter,
      color: "green.500"
    },
    {
      title: "Статистика и аналитика",
      description: "Подробная статистика проектов, категорий и персональные достижения пользователей",
      icon: FaChartLine,
      color: "purple.500"
    },
    {
      title: "Социальные функции",
      description: "Закладки, лайки, шаринг проектов и система достижений для мотивации",
      icon: FaUsers,
      color: "pink.500"
    },
    {
      title: "Адаптивный дизайн",
      description: "Отличная работа на всех устройствах с оптимизированным мобильным интерфейсом",
      icon: FaMobile,
      color: "orange.500"
    }
  ];

  const features = [
    "🎯 Система совместимости проектов с пользователями",
    "💰 Информация о бюджетах и вознаграждениях",
    "🏆 Система рангов и достижений",
    "📊 Детальная аналитика и статистика",
    "🔍 Продвинутый поиск и фильтрация",
    "📱 Полная адаптивность для мобильных устройств",
    "🎨 Современный UI/UX дизайн",
    "⚡ Быстрая производительность",
    "🔒 Безопасность и приватность",
    "🌐 Поддержка множественных технологий"
  ];

  const categories = [
    { name: "Искусственный интеллект", icon: FaBrain, count: 23 },
    { name: "Веб-разработка", icon: FaCode, count: 18 },
    { name: "Мобильные приложения", icon: FaMobile, count: 15 },
    { name: "UI/UX дизайн", icon: FaPalette, count: 12 },
    { name: "Блокчейн", icon: FaGlobe, count: 8 },
    { name: "Кибербезопасность", icon: FaShieldAlt, count: 7 }
  ];

  return (
    <Box minH="100vh" bg={bgColor}>
      <Container maxW="container.xl" py={12}>
        <VStack spacing={12} align="stretch">
          {/* Hero Section */}
          <VStack spacing={6} textAlign="center">
            <Heading
              as="h1"
              size="2xl"
              bgGradient="linear(to-r, blue.400, purple.500, pink.500)"
              bgClip="text"
              fontWeight="bold"
            >
              Улучшенная платформа нетворкинга
            </Heading>
            <Text fontSize="xl" color={mutedColor} maxW="3xl">
              Полностью переработанная система для поиска проектов, создания команд и развития карьеры. 
              Современный дизайн, продвинутая функциональность и отличный пользовательский опыт.
            </Text>
            <HStack spacing={4}>
              <Button
                as={RouterLink}
                to="/networking-new"
                size="lg"
                colorScheme="blue"
                leftIcon={<FaRocket />}
              >
                Попробовать новую версию
              </Button>
              <Button
                as={RouterLink}
                to="/networking"
                size="lg"
                variant="outline"
                leftIcon={<FaEye />}
              >
                Посмотреть старую версию
              </Button>
            </HStack>
          </VStack>

          {/* Improvements Grid */}
          <Box>
            <Heading size="lg" mb={8} textAlign="center" color={textColor}>
              Ключевые улучшения
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
              {improvements.map((improvement, index) => (
                <Card key={index} bg={cardBg} shadow="md" _hover={{ shadow: "lg" }}>
                  <CardBody>
                    <VStack spacing={4} align="start">
                      <Icon as={improvement.icon} boxSize={8} color={improvement.color} />
                      <Heading size="md" color={textColor}>
                        {improvement.title}
                      </Heading>
                      <Text color={mutedColor} fontSize="sm">
                        {improvement.description}
                      </Text>
                    </VStack>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
          </Box>

          {/* Features List */}
          <Card bg={cardBg} shadow="md">
            <CardBody>
              <VStack spacing={6} align="stretch">
                <Heading size="lg" color={textColor} textAlign="center">
                  Новые возможности
                </Heading>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <List spacing={3}>
                    {features.slice(0, 5).map((feature, index) => (
                      <ListItem key={index} color={mutedColor}>
                        {feature}
                      </ListItem>
                    ))}
                  </List>
                  <List spacing={3}>
                    {features.slice(5).map((feature, index) => (
                      <ListItem key={index} color={mutedColor}>
                        {feature}
                      </ListItem>
                    ))}
                  </List>
                </SimpleGrid>
              </VStack>
            </CardBody>
          </Card>

          {/* Categories */}
          <Box>
            <Heading size="lg" mb={8} textAlign="center" color={textColor}>
              Популярные категории проектов
            </Heading>
            <SimpleGrid columns={{ base: 2, md: 3, lg: 6 }} spacing={4}>
              {categories.map((category, index) => (
                <Card key={index} bg={cardBg} shadow="sm" textAlign="center">
                  <CardBody>
                    <VStack spacing={2}>
                      <Icon as={category.icon} boxSize={6} color={accentColor} />
                      <Text fontSize="sm" fontWeight="medium" color={textColor}>
                        {category.name}
                      </Text>
                      <Badge colorScheme="blue" borderRadius="full">
                        {category.count}
                      </Badge>
                    </VStack>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
          </Box>

          {/* Stats */}
          <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6}>
            <Card bg={cardBg} shadow="md" textAlign="center">
              <CardBody>
                <VStack spacing={2}>
                  <Icon as={FaRocket} boxSize={8} color="blue.500" />
                  <Heading size="lg" color={textColor}>156</Heading>
                  <Text color={mutedColor}>Всего проектов</Text>
                </VStack>
              </CardBody>
            </Card>
            <Card bg={cardBg} shadow="md" textAlign="center">
              <CardBody>
                <VStack spacing={2}>
                  <Icon as={FaUsers} boxSize={8} color="green.500" />
                  <Heading size="lg" color={textColor}>1,247</Heading>
                  <Text color={mutedColor}>Участников</Text>
                </VStack>
              </CardBody>
            </Card>
            <Card bg={cardBg} shadow="md" textAlign="center">
              <CardBody>
                <VStack spacing={2}>
                  <Icon as={FaHandshake} boxSize={8} color="purple.500" />
                  <Heading size="lg" color={textColor}>89%</Heading>
                  <Text color={mutedColor}>Успешность</Text>
                </VStack>
              </CardBody>
            </Card>
            <Card bg={cardBg} shadow="md" textAlign="center">
              <CardBody>
                <VStack spacing={2}>
                  <Icon as={FaStar} boxSize={8} color="yellow.500" />
                  <Heading size="lg" color={textColor}>76%</Heading>
                  <Text color={mutedColor}>Среднее совпадение</Text>
                </VStack>
              </CardBody>
            </Card>
          </SimpleGrid>

          {/* Call to Action */}
          <Alert status="info" borderRadius="lg">
            <AlertIcon />
            <Box>
              <AlertTitle>Готовы попробовать?</AlertTitle>
              <AlertDescription>
                Новая платформа нетворкинга уже доступна! Переходите и откройте для себя улучшенный опыт поиска проектов и создания команд.
              </AlertDescription>
            </Box>
          </Alert>

          <HStack justify="center" spacing={4}>
            <Button
              as={RouterLink}
              to="/networking-new"
              size="lg"
              colorScheme="blue"
              leftIcon={<FaRocket />}
              rightIcon={<FaArrowRight />}
            >
              Перейти к новой версии
            </Button>
          </HStack>
        </VStack>
      </Container>
    </Box>
  );
};

export default NetworkingDemo; 