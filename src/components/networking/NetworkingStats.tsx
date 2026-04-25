import React from 'react';
import {
  Box, SimpleGrid, Stat, StatLabel, StatNumber, StatHelpText,
  StatArrow, Progress, Text, VStack, HStack, Icon, useColorModeValue,
  Card, CardBody, Heading, Badge, Flex, Divider, List, ListItem,
  ListIcon, Grid, GridItem, Tooltip, CircularProgress,
  CircularProgressLabel, Alert, AlertIcon, AlertTitle, AlertDescription,
  Wrap, WrapItem
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { 
  FaUsers, FaRocket, FaStar, FaTrophy, FaMedal, FaCrown,
  FaChartLine, FaArrowUp, FaArrowDown, FaCheckCircle,
  FaClock, FaHandshake, FaCode, FaPalette, FaBrain, FaShieldAlt,
  FaGlobe, FaMobile, FaServer, FaDatabase, FaCloud, FaLock,
  FaEye, FaHeart, FaBookmark, FaShare, FaComment, FaAward,
  FaFire, FaBolt, FaMagic, FaInfinity
} from 'react-icons/fa';

// @ts-ignore - motion() works with Chakra UI components
const MotionBox = motion(Box);
// @ts-ignore - motion() works with Chakra UI components
const MotionCard = motion(Card);

interface NetworkingStatsProps {
  stats: {
    totalProjects: number;
    activeProjects: number;
    totalUsers: number;
    activeUsers: number;
    successRate: number;
    averageMatchScore: number;
    totalApplications: number;
    acceptedApplications: number;
    categories: Array<{ name: string; count: number; percentage: number }>;
    topTechnologies: Array<{ name: string; count: number; trend: 'up' | 'down' | 'stable' }>;
    recentActivity: Array<{ type: string; description: string; time: string }>;
    userStats?: {
      projectsCreated: number;
      projectsJoined: number;
      applicationsSubmitted: number;
      applicationsAccepted: number;
      matchScore: number;
      rank: string;
      achievements: string[];
    };
  };
}

const NetworkingStats: React.FC<NetworkingStatsProps> = ({ stats }) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const cardBorder = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'gray.100');
  const mutedColor = useColorModeValue('gray.600', 'gray.400');
  const accentColor = useColorModeValue('blue.500', 'blue.300');

  const getCategoryIcon = (category: string) => {
    if (!category) return FaCode;
    switch (category.toLowerCase()) {
      case 'искусственный интеллект':
      case 'ai':
        return FaBrain;
      case 'веб-разработка':
      case 'web':
        return FaCode;
      case 'ui/ux дизайн':
      case 'дизайн':
        return FaPalette;
      case 'кибербезопасность':
      case 'security':
        return FaShieldAlt;
      case 'блокчейн':
        return FaGlobe;
      case 'мобильные приложения':
      case 'mobile':
        return FaMobile;
      case 'devops':
        return FaServer;
      case 'аналитика данных':
      case 'data':
        return FaDatabase;
      case 'облачные технологии':
      case 'cloud':
        return FaCloud;
      default:
        return FaCode;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return FaArrowUp;
      case 'down':
        return FaArrowDown;
      default:
        return FaChartLine;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'green.500';
      case 'down':
        return 'red.500';
      default:
        return 'gray.500';
    }
  };

  const getRankIcon = (rank: string) => {
    if (!rank) return FaUsers;
    switch (rank.toLowerCase()) {
      case 'новичок':
        return FaStar;
      case 'участник':
        return FaMedal;
      case 'эксперт':
        return FaTrophy;
      case 'мастер':
        return FaCrown;
      case 'легенда':
        return FaStar;
      default:
        return FaStar;
    }
  };

  const getRankColor = (rank: string) => {
    switch (rank.toLowerCase()) {
      case 'новичок':
        return 'gray';
      case 'участник':
        return 'blue';
      case 'эксперт':
        return 'purple';
      case 'мастер':
        return 'orange';
      case 'легенда':
        return 'red';
      default:
        return 'gray';
    }
  };

  return (
    <VStack spacing={8} align="stretch">
      {/* Main Stats */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
        <MotionCard
          bg={cardBg}
          border="1px solid"
          borderColor={cardBorder}
          borderRadius="xl"
          whileHover={{ y: -4, boxShadow: "lg" }}
          transition={{ duration: 0.3 }}
        >
          <CardBody>
            <Stat>
              <StatLabel color={mutedColor} fontSize="sm" fontWeight="medium">
                <HStack spacing={2}>
                  <Icon as={FaRocket} color={accentColor} />
                  <Text>Всего проектов</Text>
                </HStack>
              </StatLabel>
              <StatNumber color={textColor} fontSize="3xl" fontWeight="bold">
                {stats.totalProjects}
              </StatNumber>
              <StatHelpText color="green.500" fontSize="sm">
                <StatArrow type="increase" />
                +12% с прошлого месяца
              </StatHelpText>
            </Stat>
          </CardBody>
        </MotionCard>

        <MotionCard
          bg={cardBg}
          border="1px solid"
          borderColor={cardBorder}
          borderRadius="xl"
          whileHover={{ y: -4, boxShadow: "lg" }}
          transition={{ duration: 0.3 }}
        >
          <CardBody>
            <Stat>
              <StatLabel color={mutedColor} fontSize="sm" fontWeight="medium">
                <HStack spacing={2}>
                  <Icon as={FaUsers} color="green.500" />
                  <Text>Активных участников</Text>
                </HStack>
              </StatLabel>
              <StatNumber color={textColor} fontSize="3xl" fontWeight="bold">
                {stats.activeUsers}
              </StatNumber>
              <StatHelpText color="green.500" fontSize="sm">
                <StatArrow type="increase" />
                +8% с прошлого месяца
              </StatHelpText>
            </Stat>
          </CardBody>
        </MotionCard>

        <MotionCard
          bg={cardBg}
          border="1px solid"
          borderColor={cardBorder}
          borderRadius="xl"
          whileHover={{ y: -4, boxShadow: "lg" }}
          transition={{ duration: 0.3 }}
        >
          <CardBody>
            <Stat>
              <StatLabel color={mutedColor} fontSize="sm" fontWeight="medium">
                <HStack spacing={2}>
                  <Icon as={FaHandshake} color="purple.500" />
                  <Text>Успешность</Text>
                </HStack>
              </StatLabel>
              <StatNumber color={textColor} fontSize="3xl" fontWeight="bold">
                {stats.successRate}%
              </StatNumber>
              <StatHelpText color="green.500" fontSize="sm">
                <StatArrow type="increase" />
                +5% с прошлого месяца
              </StatHelpText>
            </Stat>
          </CardBody>
        </MotionCard>

        <MotionCard
          bg={cardBg}
          border="1px solid"
          borderColor={cardBorder}
          borderRadius="xl"
          whileHover={{ y: -4, boxShadow: "lg" }}
          transition={{ duration: 0.3 }}
        >
          <CardBody>
            <Stat>
              <StatLabel color={mutedColor} fontSize="sm" fontWeight="medium">
                <HStack spacing={2}>
                  <Icon as={FaStar} color="yellow.500" />
                  <Text>Среднее совпадение</Text>
                </HStack>
              </StatLabel>
              <StatNumber color={textColor} fontSize="3xl" fontWeight="bold">
                {stats.averageMatchScore}%
              </StatNumber>
              <StatHelpText color="green.500" fontSize="sm">
                <StatArrow type="increase" />
                +3% с прошлого месяца
              </StatHelpText>
            </Stat>
          </CardBody>
        </MotionCard>
      </SimpleGrid>

      {/* Categories Distribution */}
      <MotionCard
        bg={cardBg}
        border="1px solid"
        borderColor={cardBorder}
        borderRadius="xl"
        whileHover={{ y: -2, boxShadow: "md" }}
        transition={{ duration: 0.3 }}
      >
        <CardBody>
          <Heading size="md" mb={6} color={textColor}>
            Распределение по категориям
          </Heading>
          <VStack spacing={4} align="stretch">
            {stats.categories.map((category, index) => (
              <Box key={index}>
                <Flex justify="space-between" align="center" mb={2}>
                  <HStack spacing={3}>
                    <Icon as={getCategoryIcon(category.name)} color={accentColor} boxSize={5} />
                    <Text fontWeight="medium" color={textColor}>
                      {category.name}
                    </Text>
                  </HStack>
                  <HStack spacing={2}>
                    <Text fontSize="sm" color={mutedColor}>
                      {category.count} проектов
                    </Text>
                    <Badge colorScheme="blue" borderRadius="full" px={2}>
                      {category.percentage}%
                    </Badge>
                  </HStack>
                </Flex>
                <Progress
                  value={category.percentage}
                  colorScheme="blue"
                  borderRadius="full"
                  size="sm"
                />
              </Box>
            ))}
          </VStack>
        </CardBody>
      </MotionCard>

      {/* Top Technologies */}
      <MotionCard
        bg={cardBg}
        border="1px solid"
        borderColor={cardBorder}
        borderRadius="xl"
        whileHover={{ y: -2, boxShadow: "md" }}
        transition={{ duration: 0.3 }}
      >
        <CardBody>
          <Heading size="md" mb={6} color={textColor}>
            Популярные технологии
          </Heading>
          <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4}>
            {stats.topTechnologies.map((tech, index) => (
              <GridItem key={index}>
                <Flex justify="space-between" align="center" p={3} borderRadius="lg" bg={useColorModeValue('gray.50', 'gray.700')}>
                  <HStack spacing={3}>
                    <Icon as={FaCode} color={accentColor} boxSize={4} />
                    <Text fontWeight="medium" color={textColor}>
                      {tech.name}
                    </Text>
                  </HStack>
                  <HStack spacing={2}>
                    <Text fontSize="sm" color={mutedColor}>
                      {tech.count}
                    </Text>
                    <Icon 
                      as={getTrendIcon(tech.trend)} 
                      color={getTrendColor(tech.trend)} 
                      boxSize={4} 
                    />
                  </HStack>
                </Flex>
              </GridItem>
            ))}
          </Grid>
        </CardBody>
      </MotionCard>

      {/* User Stats */}
      {stats.userStats && (
        <MotionCard
          bg={cardBg}
          border="1px solid"
          borderColor={cardBorder}
          borderRadius="xl"
          whileHover={{ y: -2, boxShadow: "md" }}
          transition={{ duration: 0.3 }}
        >
          <CardBody>
            <Heading size="md" mb={6} color={textColor}>
              Ваша статистика
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
              <Stat textAlign="center">
                <StatNumber color="blue.500" fontSize="2xl" fontWeight="bold">
                  {stats.userStats.projectsCreated}
                </StatNumber>
                <StatLabel color={mutedColor} fontSize="sm">
                  Созданных проектов
                </StatLabel>
              </Stat>
              <Stat textAlign="center">
                <StatNumber color="green.500" fontSize="2xl" fontWeight="bold">
                  {stats.userStats.projectsJoined}
                </StatNumber>
                <StatLabel color={mutedColor} fontSize="sm">
                  Участий в проектах
                </StatLabel>
              </Stat>
              <Stat textAlign="center">
                <StatNumber color="purple.500" fontSize="2xl" fontWeight="bold">
                  {stats.userStats.applicationsAccepted}
                </StatNumber>
                <StatLabel color={mutedColor} fontSize="sm">
                  Принятых заявок
                </StatLabel>
              </Stat>
              <Stat textAlign="center">
                <CircularProgress 
                  value={stats.userStats.matchScore} 
                  color="orange.500" 
                  size="60px"
                  thickness="8px"
                >
                  <CircularProgressLabel fontSize="lg" fontWeight="bold">
                    {stats.userStats.matchScore}%
                  </CircularProgressLabel>
                </CircularProgress>
                <StatLabel color={mutedColor} fontSize="sm" mt={2}>
                  Совпадение
                </StatLabel>
              </Stat>
            </SimpleGrid>

            {/* Rank and Achievements */}
            <Divider my={6} />
            <VStack spacing={4} align="stretch">
              <HStack justify="space-between" align="center">
                <HStack spacing={3}>
                  <Icon 
                    as={getRankIcon(stats.userStats.rank)} 
                    color={`${getRankColor(stats.userStats.rank)}.500`} 
                    boxSize={6} 
                  />
                  <Text fontWeight="semibold" color={textColor}>
                    Ваш ранг: {stats.userStats.rank}
                  </Text>
                </HStack>
                <Badge 
                  colorScheme={getRankColor(stats.userStats.rank)}
                  borderRadius="full"
                  px={3}
                  py={1}
                  fontSize="sm"
                >
                  {stats.userStats.rank}
                </Badge>
              </HStack>

              {stats.userStats.achievements.length > 0 && (
                <Box>
                  <Text fontWeight="medium" color={textColor} mb={3}>
                    Достижения:
                  </Text>
                  <Wrap spacing={2}>
                    {stats.userStats.achievements.map((achievement, index) => (
                      <WrapItem key={index}>
                        <Badge 
                          colorScheme="green" 
                          variant="subtle" 
                          borderRadius="full"
                          px={3}
                          py={1}
                          fontSize="sm"
                        >
                          <HStack spacing={1}>
                            <Icon as={FaAward} boxSize={3} />
                            <Text>{achievement}</Text>
                          </HStack>
                        </Badge>
                      </WrapItem>
                    ))}
                  </Wrap>
                </Box>
              )}
            </VStack>
          </CardBody>
        </MotionCard>
      )}

      {/* Recent Activity */}
      <MotionCard
        bg={cardBg}
        border="1px solid"
        borderColor={cardBorder}
        borderRadius="xl"
        whileHover={{ y: -2, boxShadow: "md" }}
        transition={{ duration: 0.3 }}
      >
        <CardBody>
          <Heading size="md" mb={6} color={textColor}>
            Последняя активность
          </Heading>
          <List spacing={3}>
            {stats.recentActivity.map((activity, index) => (
              <ListItem key={index}>
                <HStack spacing={3} align="start">
                  <Icon as={FaClock} color={mutedColor} boxSize={4} mt={1} />
                  <Box flex={1}>
                    <Text fontSize="sm" color={textColor} fontWeight="medium">
                      {activity.description}
                    </Text>
                    <Text fontSize="xs" color={mutedColor}>
                      {activity.time}
                    </Text>
                  </Box>
                </HStack>
              </ListItem>
            ))}
          </List>
        </CardBody>
      </MotionCard>

      {/* Success Rate Alert */}
      <Alert status="success" borderRadius="lg">
        <AlertIcon />
        <Box>
          <AlertTitle>Отличные результаты!</AlertTitle>
          <AlertDescription>
            Платформа показывает высокую эффективность с {stats.successRate}% успешных проектов. 
            Продолжайте развиваться и создавать качественные проекты!
          </AlertDescription>
        </Box>
      </Alert>
    </VStack>
  );
};

export default NetworkingStats; 