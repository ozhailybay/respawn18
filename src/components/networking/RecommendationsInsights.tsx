import React from 'react';
import {
  Box, VStack, HStack, Text, Badge, Icon, useColorModeValue,
  Card, CardBody, Heading, Progress, Tooltip, Wrap, WrapItem,
  Button, Alert, AlertIcon, AlertTitle, AlertDescription
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import {
  FaLightbulb, FaChartLine, FaStar, FaRocket, FaBrain,
  FaCode, FaPalette, FaShieldAlt, FaServer, FaMobile,
  FaDatabase, FaCloud, FaGlobe, FaClock, FaUsers,
  FaArrowUp, FaArrowDown, FaMinus
} from 'react-icons/fa';
import { RecommendationScore } from '../../utils/recommendationAlgorithm';
import { NetworkingProfile } from '../../hooks/useNetworkingProfile';

// @ts-ignore - motion() works with Chakra UI components
const MotionCard = motion(Card);

interface RecommendationsInsightsProps {
  recommendations: RecommendationScore[];
  profile: NetworkingProfile | null;
  insights: string[];
}

export const RecommendationsInsights: React.FC<RecommendationsInsightsProps> = ({
  recommendations,
  profile,
  insights
}) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
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
      case 'мобильные приложения':
      case 'mobile':
        return FaMobile;
      case 'ui/ux дизайн':
      case 'design':
        return FaPalette;
      case 'блокчейн':
        return FaGlobe;
      case 'кибербезопасность':
      case 'security':
        return FaShieldAlt;
      case 'аналитика данных':
      case 'data':
        return FaDatabase;
      case 'облачные технологии':
      case 'cloud':
        return FaCloud;
      case 'devops':
        return FaServer;
      case 'iot':
        return FaGlobe;
      case 'игровая разработка':
      case 'game':
        return FaRocket;
      default:
        return FaRocket;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'green';
    if (score >= 0.6) return 'yellow';
    if (score >= 0.4) return 'orange';
    return 'red';
  };

  const getScoreText = (score: number) => {
    if (score >= 0.8) return 'Отлично';
    if (score >= 0.6) return 'Хорошо';
    if (score >= 0.4) return 'Удовлетворительно';
    return 'Плохо';
  };

  if (!profile) {
    return (
      <MotionCard
        bg={bgColor}
        border="1px solid"
        borderColor={borderColor}
        borderRadius="xl"
        p={6}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Alert status="info" borderRadius="lg">
          <AlertIcon />
          <Box>
            <AlertTitle>Создайте профиль</AlertTitle>
            <AlertDescription>
              Для получения персонализированных рекомендаций создайте свой профиль
            </AlertDescription>
          </Box>
        </Alert>
      </MotionCard>
    );
  }

  return (
    <VStack spacing={6} align="stretch">
      {/* Personal Insights */}
      <MotionCard
        bg={bgColor}
        border="1px solid"
        borderColor={borderColor}
        borderRadius="xl"
        p={6}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <VStack spacing={4} align="stretch">
          <HStack>
            <Icon as={FaLightbulb} color={accentColor} boxSize={5} />
            <Heading size="md" color={textColor}>
              Персональные инсайты
            </Heading>
          </HStack>

          <VStack spacing={3} align="stretch">
            {insights.map((insight, index) => (
              <Box
                key={index}
                p={3}
                bg={useColorModeValue('blue.50', 'blue.900')}
                borderRadius="lg"
                border="1px solid"
                borderColor={useColorModeValue('blue.200', 'blue.700')}
              >
                <Text color={textColor} fontSize="sm">
                  {insight}
                </Text>
              </Box>
            ))}
          </VStack>

          {/* Profile Stats */}
          <Box>
            <Text fontWeight="medium" color={textColor} mb={3}>
              Ваша статистика
            </Text>
            <HStack spacing={4} wrap="wrap">
              <VStack spacing={1} align="center">
                <Text fontSize="2xl" fontWeight="bold" color={accentColor}>
                  {profile.projectsCreated}
                </Text>
                <Text fontSize="xs" color={mutedColor}>
                  Создано проектов
                </Text>
              </VStack>
              <VStack spacing={1} align="center">
                <Text fontSize="2xl" fontWeight="bold" color={accentColor}>
                  {profile.projectsJoined}
                </Text>
                <Text fontSize="xs" color={mutedColor}>
                  Участий в проектах
                </Text>
              </VStack>
              <VStack spacing={1} align="center">
                <Text fontSize="2xl" fontWeight="bold" color={accentColor}>
                  {profile.applicationsAccepted}
                </Text>
                <Text fontSize="xs" color={mutedColor}>
                  Принятых заявок
                </Text>
              </VStack>
              <VStack spacing={1} align="center">
                <Text fontSize="2xl" fontWeight="bold" color={accentColor}>
                  {profile.matchScore}%
                </Text>
                <Text fontSize="xs" color={mutedColor}>
                  Средний матч
                </Text>
              </VStack>
            </HStack>
          </Box>
        </VStack>
      </MotionCard>

      {/* Top Recommendations */}
      <MotionCard
        bg={bgColor}
        border="1px solid"
        borderColor={borderColor}
        borderRadius="xl"
        p={6}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <VStack spacing={4} align="stretch">
          <HStack>
            <Icon as={FaStar} color={accentColor} boxSize={5} />
            <Heading size="md" color={textColor}>
              Топ рекомендации
            </Heading>
          </HStack>

          <VStack spacing={4} align="stretch">
            {recommendations.slice(0, 3).map((recommendation, index) => (
              <Box
                key={recommendation.project.id}
                p={4}
                border="1px solid"
                borderColor={borderColor}
                borderRadius="lg"
                bg={useColorModeValue('gray.50', 'gray.700')}
              >
                <VStack spacing={3} align="stretch">
                  <HStack justify="space-between">
                    <HStack>
                      <Icon 
                        as={getCategoryIcon(recommendation.project.category)} 
                        color={accentColor} 
                        boxSize={4} 
                      />
                      <Text fontWeight="medium" color={textColor}>
                        {recommendation.project.title}
                      </Text>
                    </HStack>
                    <Badge
                      colorScheme={getScoreColor(recommendation.score)}
                      borderRadius="full"
                      px={2}
                      py={1}
                    >
                      {Math.round(recommendation.score * 100)}%
                    </Badge>
                  </HStack>

                  <Text color={mutedColor} fontSize="sm" noOfLines={2}>
                    {recommendation.project.description}
                  </Text>

                  <Box>
                    <Text fontSize="xs" color={mutedColor} mb={1}>
                      Совпадение: {getScoreText(recommendation.score)}
                    </Text>
                    <Progress
                      value={recommendation.score * 100}
                      colorScheme={getScoreColor(recommendation.score)}
                      size="sm"
                      borderRadius="full"
                    />
                  </Box>

                  <Wrap spacing={2}>
                    {recommendation.explanation.slice(0, 2).map((explanation, idx) => (
                      <WrapItem key={idx}>
                        <Badge
                          colorScheme="blue"
                          variant="subtle"
                          borderRadius="full"
                          px={2}
                          py={1}
                          fontSize="xs"
                        >
                          {explanation}
                        </Badge>
                      </WrapItem>
                    ))}
                  </Wrap>

                  <HStack spacing={3} fontSize="xs" color={mutedColor}>
                    <HStack>
                      <Icon as={FaUsers} />
                      <Text>{recommendation.project.teamSize}</Text>
                    </HStack>
                    <HStack>
                      <Icon as={FaClock} />
                      <Text>{recommendation.project.duration}</Text>
                    </HStack>
                    <HStack>
                      <Icon as={FaGlobe} />
                      <Text>{recommendation.project.location}</Text>
                    </HStack>
                  </HStack>
                </VStack>
              </Box>
            ))}
          </VStack>
        </VStack>
      </MotionCard>

      {/* Match Factors Analysis */}
      <MotionCard
        bg={bgColor}
        border="1px solid"
        borderColor={borderColor}
        borderRadius="xl"
        p={6}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <VStack spacing={4} align="stretch">
          <HStack>
            <Icon as={FaChartLine} color={accentColor} boxSize={5} />
            <Heading size="md" color={textColor}>
              Анализ совпадений
            </Heading>
          </HStack>

          <VStack spacing={3} align="stretch">
            {recommendations.length > 0 && (
              <>
                <Box>
                  <Text fontSize="sm" color={mutedColor} mb={2}>
                    Навыки
                  </Text>
                  <Progress
                    value={recommendations[0].factors.skillMatch * 100}
                    colorScheme="green"
                    size="sm"
                    borderRadius="full"
                  />
                  <Text fontSize="xs" color={mutedColor} mt={1}>
                    {Math.round(recommendations[0].factors.skillMatch * 100)}% совпадение
                  </Text>
                </Box>

                <Box>
                  <Text fontSize="sm" color={mutedColor} mb={2}>
                    Интересы
                  </Text>
                  <Progress
                    value={recommendations[0].factors.interestMatch * 100}
                    colorScheme="blue"
                    size="sm"
                    borderRadius="full"
                  />
                  <Text fontSize="xs" color={mutedColor} mt={1}>
                    {Math.round(recommendations[0].factors.interestMatch * 100)}% совпадение
                  </Text>
                </Box>

                <Box>
                  <Text fontSize="sm" color={mutedColor} mb={2}>
                    Локация
                  </Text>
                  <Progress
                    value={recommendations[0].factors.locationMatch * 100}
                    colorScheme="purple"
                    size="sm"
                    borderRadius="full"
                  />
                  <Text fontSize="xs" color={mutedColor} mt={1}>
                    {Math.round(recommendations[0].factors.locationMatch * 100)}% совпадение
                  </Text>
                </Box>

                <Box>
                  <Text fontSize="sm" color={mutedColor} mb={2}>
                    Опыт
                  </Text>
                  <Progress
                    value={recommendations[0].factors.experienceMatch * 100}
                    colorScheme="orange"
                    size="sm"
                    borderRadius="full"
                  />
                  <Text fontSize="xs" color={mutedColor} mt={1}>
                    {Math.round(recommendations[0].factors.experienceMatch * 100)}% совпадение
                  </Text>
                </Box>
              </>
            )}
          </VStack>
        </VStack>
      </MotionCard>
    </VStack>
  );
}; 