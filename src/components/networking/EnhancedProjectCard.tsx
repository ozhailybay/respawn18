import React, { useState } from 'react';
import {
  Box, Heading, Text, Badge, Flex, Avatar, HStack, IconButton, 
  Tag, TagLabel, useColorModeValue, Button, Tooltip, VStack,
  Wrap, WrapItem, Icon, Progress, Popover, PopoverTrigger,
  PopoverContent, PopoverHeader, PopoverBody, PopoverArrow,
  PopoverCloseButton, Divider, Grid, GridItem, Stat, StatLabel,
  StatNumber, StatHelpText, useToast
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { 
  FaHandshake, FaBookmark, FaShare, FaUsers, FaClock, 
  FaMapMarkerAlt, FaStar, FaHeart, FaEye, FaComment,
  FaCheckCircle, FaTimesCircle, FaInfoCircle, FaRocket,
  FaCode, FaPalette, FaBrain, FaShieldAlt, FaGlobe,
  FaDollarSign, FaTrophy, FaMedal, FaCrown, FaGem
} from 'react-icons/fa';

const MotionBox = motion(Box);
const MotionButton = motion(Button);

interface EnhancedProjectCardProps {
  project: {
    id: number;
    title: string;
    description: string;
    category: string;
    status: string;
    author: string;
    authorRole?: string;
    authorAvatar?: string;
    tags: string[];
    teamSize: string;
    duration: string;
    location: string;
    matchScore?: number;
    budget?: string;
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    technologies?: string[];
    benefits?: string[];
  };
  onApply: (projectId: string) => void;
  onBookmark: (projectId: string) => void;
  onShare: (projectId: string) => void;
  onView: (projectId: string) => void;
  isBookmarked?: boolean;
  isLiked?: boolean;
}

const EnhancedProjectCard: React.FC<EnhancedProjectCardProps> = ({
  project,
  onApply,
  onBookmark,
  onShare,
  onView,
  isBookmarked = false,
  isLiked = false
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [liked, setLiked] = useState(isLiked);
  const toast = useToast();

  const cardBg = useColorModeValue('white', 'gray.800');
  const cardBorder = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'gray.100');
  const mutedColor = useColorModeValue('gray.600', 'gray.400');
  const accentColor = useColorModeValue('blue.500', 'blue.300');
  const hoverBg = useColorModeValue('gray.50', 'gray.750');

  const getMatchColor = (score: number) => {
    if (score >= 90) return 'green.500';
    if (score >= 70) return 'yellow.500';
    if (score >= 50) return 'orange.500';
    return 'red.500';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'green';
      case 'intermediate': return 'yellow';
      case 'advanced': return 'red';
      default: return 'gray';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'Начинающий';
      case 'intermediate': return 'Средний';
      case 'advanced': return 'Продвинутый';
      default: return 'Любой';
    }
  };

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
        return FaRocket;
      default:
        return FaCode;
    }
  };

  const handleLike = () => {
    setLiked(!liked);
    toast({
      title: liked ? 'Убрано из избранного' : 'Добавлено в избранное',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  const handleShare = () => {
    const shareText = `Посмотрите этот интересный проект: ${project.title}`;
    const shareUrl = `${window.location.origin}/project/${project.id}`;
    
    if (navigator.share) {
      navigator.share({
        title: project.title,
        text: shareText,
        url: shareUrl,
      });
    } else {
      navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      toast({
        title: 'Ссылка скопирована',
        description: 'Ссылка на проект скопирована в буфер обмена',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    }
    onShare(project.id.toString());
  };

  return (
    <MotionBox
      bg={cardBg}
      border="1px solid"
      borderColor={cardBorder}
      borderRadius="2xl"
      overflow="hidden"
      position="relative"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ 
        y: -8,
        boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
        scale: 1.02
      }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      cursor="pointer"
      onClick={() => onView(project.id.toString())}
    >
      {/* Gradient Overlay */}
      <MotionBox
        position="absolute"
        top={0}
        left={0}
        right={0}
        height="4px"
        bgGradient="linear(to-r, blue.400, purple.500, pink.500)"
        opacity={isHovered ? 1 : 0.7}
        transition="opacity 0.3s ease"
      />
      
      {/* Match Score Badge */}
      {project.matchScore && (
        <MotionBox
          position="absolute"
          top={4}
          right={4}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Popover placement="top" trigger="hover">
            <PopoverTrigger>
              <Badge
                bg={getMatchColor(project.matchScore)}
                color="white"
                borderRadius="full"
                px={3}
                py={1}
                fontSize="xs"
                fontWeight="bold"
                boxShadow="lg"
                cursor="pointer"
              >
                {project.matchScore}% совпадение
              </Badge>
            </PopoverTrigger>
            <PopoverContent>
              <PopoverArrow />
              <PopoverCloseButton />
              <PopoverHeader fontWeight="semibold">
                Совместимость: {project.matchScore}%
              </PopoverHeader>
              <PopoverBody>
                <VStack align="stretch" spacing={3}>
                  <Text fontSize="sm">
                    Этот проект отлично подходит вам по следующим критериям:
                  </Text>
                  <Grid templateColumns="repeat(2, 1fr)" gap={2}>
                    <GridItem>
                      <HStack spacing={1}>
                        <Icon as={FaCheckCircle} color="green.500" boxSize="12px" />
                        <Text fontSize="xs">Навыки</Text>
                      </HStack>
                    </GridItem>
                    <GridItem>
                      <HStack spacing={1}>
                        <Icon as={FaCheckCircle} color="green.500" boxSize="12px" />
                        <Text fontSize="xs">Интересы</Text>
                      </HStack>
                    </GridItem>
                    <GridItem>
                      <HStack spacing={1}>
                        <Icon as={FaCheckCircle} color="green.500" boxSize="12px" />
                        <Text fontSize="xs">Опыт</Text>
                      </HStack>
                    </GridItem>
                    <GridItem>
                      <HStack spacing={1}>
                        <Icon as={FaCheckCircle} color="green.500" boxSize="12px" />
                        <Text fontSize="xs">Доступность</Text>
                      </HStack>
                    </GridItem>
                  </Grid>
                </VStack>
              </PopoverBody>
            </PopoverContent>
          </Popover>
        </MotionBox>
      )}

      <Box p={6}>
        <VStack align="stretch" spacing={4}>
          {/* Header */}
          <Flex justify="space-between" align="start">
            <VStack align="start" spacing={2} flex={1}>
              <HStack spacing={2} align="center">
                <Icon 
                  as={getCategoryIcon(project.category)} 
                  color={accentColor} 
                  boxSize={5} 
                />
                <Heading 
                  size="md" 
                  color={textColor}
                  noOfLines={2} 
                  fontWeight="600"
                  lineHeight="1.3"
                >
                  {project.title}
                </Heading>
              </HStack>
              <HStack spacing={2}>
                <Badge 
                  colorScheme="blue" 
                  variant="subtle"
                  fontSize="xs"
                  px={2}
                  py={1}
                  borderRadius="full"
                >
                  {project.category}
                </Badge>
                <Badge 
                  colorScheme={project.status === 'active' ? 'green' : 'yellow'}
                  fontSize="xs"
                  px={2}
                  py={1}
                  borderRadius="full"
                >
                  {project.status === 'active' ? 'Активен' : 'Набор'}
                </Badge>
                {project.difficulty && (
                  <Badge 
                    colorScheme={getDifficultyColor(project.difficulty)}
                    fontSize="xs"
                    px={2}
                    py={1}
                    borderRadius="full"
                  >
                    {getDifficultyLabel(project.difficulty)}
                  </Badge>
                )}
              </HStack>
            </VStack>
          </Flex>

          {/* Description */}
          <Text 
            fontSize="sm" 
            color={mutedColor} 
            noOfLines={3}
            lineHeight="1.6"
          >
            {project.description}
          </Text>

          {/* Tags */}
          <Wrap spacing={2}>
            {project.tags?.slice(0, 4).map((tag: string, index: number) => (
              <WrapItem key={index}>
                <Tag
                  size="sm"
                  colorScheme="gray"
                  variant="subtle"
                  borderRadius="full"
                  px={3}
                  py={1}
                  fontSize="xs"
                  fontWeight="medium"
                >
                  {tag}
                </Tag>
              </WrapItem>
            ))}
            {project.tags?.length > 4 && (
              <Tag 
                size="sm"
                colorScheme="gray"
                variant="outline"
                borderRadius="full" 
                px={3} 
                py={1}
                fontSize="xs"
              >
                +{project.tags.length - 4}
              </Tag>
            )}
          </Wrap>

          {/* Stats */}
          <Grid templateColumns="repeat(3, 1fr)" gap={4}>
            <Stat textAlign="center">
              <StatNumber fontSize="lg" color={accentColor}>
                <HStack spacing={1} justify="center">
                  <Icon as={FaUsers} boxSize={4} />
                  <Text>{project.teamSize}</Text>
                </HStack>
              </StatNumber>
              <StatLabel fontSize="xs" color={mutedColor}>Команда</StatLabel>
            </Stat>
            <Stat textAlign="center">
              <StatNumber fontSize="lg" color={accentColor}>
                <HStack spacing={1} justify="center">
                  <Icon as={FaClock} boxSize={4} />
                  <Text>{project.duration}</Text>
                </HStack>
              </StatNumber>
              <StatLabel fontSize="xs" color={mutedColor}>Срок</StatLabel>
            </Stat>
            <Stat textAlign="center">
              <StatNumber fontSize="lg" color={accentColor}>
                <HStack spacing={1} justify="center">
                  <Icon as={FaMapMarkerAlt} boxSize={4} />
                  <Text>{project.location}</Text>
                </HStack>
              </StatNumber>
              <StatLabel fontSize="xs" color={mutedColor}>Локация</StatLabel>
            </Stat>
          </Grid>

          {/* Budget */}
          {project.budget && (
            <Box>
              <HStack spacing={2} align="center">
                <Icon as={FaDollarSign} color="green.500" boxSize={4} />
                <Text fontSize="sm" fontWeight="medium" color="green.500">
                  Бюджет: {project.budget}
                </Text>
              </HStack>
            </Box>
          )}

          {/* Benefits */}
          {project.benefits && project.benefits.length > 0 && (
            <Box>
              <Text fontSize="xs" fontWeight="medium" color={mutedColor} mb={2}>
                Преимущества участия:
              </Text>
              <Wrap spacing={1}>
                {project.benefits.slice(0, 3).map((benefit, index) => (
                  <WrapItem key={index}>
                    <Tag size="sm" colorScheme="green" variant="subtle" borderRadius="full">
                      <Icon as={FaGem} boxSize={3} mr={1} />
                      {benefit}
                    </Tag>
                  </WrapItem>
                ))}
              </Wrap>
            </Box>
          )}

          {/* Footer */}
          <Divider />
          <Flex justify="space-between" align="center">
            <HStack spacing={3}>
              <Avatar 
                size="sm" 
                name={project.author}
                src={project.authorAvatar}
                border="2px solid"
                borderColor={accentColor}
              />
              <VStack align="start" spacing={0}>
                <Text fontSize="sm" fontWeight="medium" color={textColor}>
                  {project.author}
                </Text>
                <Text fontSize="xs" color={mutedColor}>
                  {project.authorRole || 'Руководитель проекта'}
                </Text>
              </VStack>
            </HStack>
            
            <HStack spacing={2}>
              <IconButton
                aria-label="Поделиться"
                icon={<FaShare />}
                size="sm"
                variant="ghost"
                colorScheme="gray"
                onClick={(e) => {
                  e.stopPropagation();
                  handleShare();
                }}
              />
              <IconButton
                aria-label={isBookmarked ? "Убрать из закладок" : "Добавить в закладки"}
                icon={<FaBookmark />}
                size="sm"
                variant="ghost"
                colorScheme={isBookmarked ? "blue" : "gray"}
                onClick={(e) => {
                  e.stopPropagation();
                  onBookmark(project.id.toString());
                }}
              />
              <IconButton
                aria-label={liked ? "Убрать из избранного" : "Добавить в избранное"}
                icon={<FaHeart />}
                size="sm"
                variant="ghost"
                colorScheme={liked ? "red" : "gray"}
                onClick={(e) => {
                  e.stopPropagation();
                  handleLike();
                }}
              />
              <MotionButton
                size="sm"
                colorScheme="blue"
                borderRadius="full"
                onClick={(e) => {
                  e.stopPropagation();
                  onApply(project.id.toString());
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                leftIcon={<FaHandshake />}
              >
                Присоединиться
              </MotionButton>
            </HStack>
          </Flex>
        </VStack>
      </Box>
    </MotionBox>
  );
};

export default EnhancedProjectCard; 