import React, { useState } from 'react';
import {
  Box,
  SimpleGrid,
  Heading,
  Text,
  Flex,
  Button,
  useColorModeValue,
  Spinner,
  VStack,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  HStack,
  Select,
  Icon,
  Tooltip
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../firebase';
import { FaSyncAlt, FaInfoCircle } from 'react-icons/fa';
import { useRecommendedProjects } from '../../hooks/useRecommendedProjects';
import ProjectCard from './ProjectCard';
import EmptyStateCard from './EmptyStateCard';

interface RecommendedProjectsTabProps {
  filters?: {
    tags?: string[];
    skills?: string[];
    mode?: 'remote' | 'onsite' | 'hybrid' | 'all';
  };
}

const RecommendedProjectsTab: React.FC<RecommendedProjectsTabProps> = ({ filters = {} }) => {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();
  const [sortCriteria, setSortCriteria] = useState<'score' | 'date' | 'teamSize'>('score');
  
  // Colors
  const textColor = useColorModeValue('gray.700', 'gray.200');
  const boxBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  // Fetch recommended projects with Connect-6 matching
  const {
    data: recommendedProjects,
    isLoading,
    isError,
    refetch,
    isRefreshing,
    refreshMatches
  } = useRecommendedProjects({
    userId: user?.uid || '',
    options: {
      limit: 50,
      filters
    }
  });
  
  // Sort projects based on criteria
  const sortedProjects = React.useMemo(() => {
    if (!recommendedProjects) return [];
    
    return [...recommendedProjects].sort((a, b) => {
      switch (sortCriteria) {
        case 'score':
          return b.score - a.score;
        case 'date':
          return new Date(b.matchedAt || 0).getTime() - new Date(a.matchedAt || 0).getTime();
        case 'teamSize':
          return (a.projectData?.teamSize || 0) - (b.projectData?.teamSize || 0);
        default:
          return b.score - a.score;
      }
    });
  }, [recommendedProjects, sortCriteria]);
  
  // Handle manual refresh of recommendations
  const handleRefresh = () => {
    refreshMatches();
  };
  
  // Navigate to project detail
  const handleViewProject = (projectId: string) => {
    navigate(`/project/${projectId}`);
  };
  
  // Apply to a project
  const handleApplyToProject = (projectId: string) => {
    navigate(`/project/${projectId}?apply=true`);
  };
  
  // Render loading state
  if (isLoading) {
    return (
      <Flex justify="center" align="center" minH="400px" direction="column">
        <Spinner
          thickness="4px"
          speed="0.65s"
          emptyColor="gray.200"
          color="black"
          size="xl"
          mb={4}
        />
        <Text color={textColor}>
          Поиск проектов, которые идеально вам подходят...
        </Text>
      </Flex>
    );
  }
  
  // Render error state
  if (isError) {
    return (
      <Alert
        status="error"
        variant="subtle"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        textAlign="center"
        height="400px"
        borderRadius="lg"
      >
        <AlertIcon boxSize="40px" mr={0} />
        <AlertTitle mt={4} mb={1} fontSize="lg">
          Ошибка загрузки рекомендаций
        </AlertTitle>
        <AlertDescription maxWidth="sm">
          Не удалось загрузить рекомендованные проекты. Пожалуйста, попробуйте позже или обновите страницу.
        </AlertDescription>
        <Button
          mt={4}
          colorScheme="gray"
          onClick={() => refetch()}
        >
          Попробовать снова
        </Button>
      </Alert>
    );
  }
  
  // Render empty state
  if (!recommendedProjects || recommendedProjects.length === 0) {
    return (
      <Box py={8}>
        <EmptyStateCard
          title="Рекомендаций пока нет"
          description="Для получения рекомендаций, пожалуйста, заполните свой профиль с навыками и интересами, или создайте свой первый проект."
          icon={FaInfoCircle}
          actionText="Обновить профиль"
          onAction={() => navigate('/profile')}
        />
      </Box>
    );
  }
  
  return (
    <Box w="100%">
      <Flex justify="space-between" align="center" mb={6} wrap="wrap" gap={3}>
        <Box>
          <Heading as="h2" size="md" color={textColor}>
            Рекомендованные проекты ({sortedProjects.length})
          </Heading>
          <Text color={useColorModeValue('gray.600', 'gray.400')} fontSize="sm">
            Проекты, которые идеально подходят вашим навыкам и интересам
          </Text>
        </Box>
        
        <HStack spacing={4}>
          <Tooltip label="Сортировать по">
            <Select
              size="sm"
              value={sortCriteria}
              onChange={(e) => setSortCriteria(e.target.value as any)}
              maxW="200px"
            >
              <option value="score">По релевантности</option>
              <option value="date">По новизне</option>
              <option value="teamSize">По размеру команды</option>
            </Select>
          </Tooltip>
          
          <Tooltip label="Обновить рекомендации">
            <Button
              size="sm"
              leftIcon={<Icon as={FaSyncAlt} />}
              onClick={handleRefresh}
              isLoading={isRefreshing}
              colorScheme="gray"
              variant="outline"
            >
              Обновить
            </Button>
          </Tooltip>
        </HStack>
      </Flex>
      
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
        {sortedProjects.map((project, index) => (
          <ProjectCard
            key={project.projectId}
            projectId={project.projectId}
            title={project.projectData?.title || 'Без названия'}
            description={project.projectData?.description || 'Нет описания'}
            tags={project.projectData?.tags || []}
            mode={project.projectData?.mode as any || 'remote'}
            ownerName={project.projectData?.ownerName || 'Неизвестный пользователь'}
            ownerAvatar={project.projectData?.ownerAvatar}
            teamSize={project.projectData?.teamSize || 1}
            onApply={handleApplyToProject}
            matchScore={project.score}
            factorScores={project.factorScores}
            reasonTags={project.reasonTags}
          />
        ))}
      </SimpleGrid>
    </Box>
  );
};

export default RecommendedProjectsTab; 