import React, { useState, useEffect } from 'react';
import {
  Box,
  SimpleGrid,
  Text,
  VStack,
  useColorModeValue,
  HStack,
  Icon,
  Tooltip
} from '@chakra-ui/react';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { 
  FaCheck, 
  FaTimes, 
  FaInfoCircle,
  FaClipboard, 
  FaClock, 
  FaChartPie 
} from 'react-icons/fa';

// @ts-ignore - motion() works with Chakra UI components
const MotionBox = motion(Box);
// @ts-ignore - motion() works with Chakra UI components
const MotionText = motion(Text);

interface StatCardProps {
  icon: React.ElementType;
  title: string;
  value: string | number;
  color: string;
  description?: string;
  index: number;
}

const StatCard: React.FC<StatCardProps> = ({ 
  icon, 
  title, 
  value, 
  color, 
  description, 
  index 
}) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.700', 'gray.300');
  
  const controls = useAnimation();
  const { ref, inView } = useInView({
    threshold: 0.2,
    triggerOnce: true
  });
  
  useEffect(() => {
    if (inView) {
      controls.start({
        opacity: 1,
        y: 0,
        transition: { 
          duration: 0.5, 
          delay: index * 0.1
        }
      });
    }
  }, [controls, inView, index]);

  return (
    <MotionBox
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={controls}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="lg"
      bg={bgColor}
      p={4}
      boxShadow="sm"
      role="group"
      transition="all 0.3s"
      _hover={{ transform: 'translateY(-5px)', boxShadow: 'md' }}
      position="relative"
      overflow="hidden"
    >
      <Box
        position="absolute"
        top={0}
        left={0}
        height="4px"
        width="100%"
        bg={`${color}.500`}
      />
      
      <VStack align="flex-start" spacing={2}>
        <HStack spacing={2}>
          <Icon as={icon} color={`${color}.500`} />
          <Text fontSize="sm" fontWeight="medium" color={textColor}>
            {title}
          </Text>
          
          {description && (
            <Tooltip label={description} placement="top" hasArrow>
              <Box as="span">
                <Icon as={FaInfoCircle} color="gray.400" fontSize="xs" />
              </Box>
            </Tooltip>
          )}
        </HStack>
        
        <MotionText
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: index * 0.2 }}
          fontSize="2xl"
          fontWeight="bold"
          bgGradient={`linear(to-r, ${color}.500, ${color}.300)`}
          bgClip="text"
        >
          {value}
        </MotionText>
      </VStack>
    </MotionBox>
  );
};

interface ResumeStatsProps {
  stats: {
    matches?: number;
    missingKeywords?: number;
    readTime?: number;
    passRate?: number;
    atsScore?: number;
    optimizationPotential?: number;
  };
}

const ResumeStats: React.FC<ResumeStatsProps> = ({ stats }) => {
  const { matches = 0, missingKeywords = 0, readTime = 0, passRate = 0, atsScore = 0, optimizationPotential = 0 } = stats;
  
  const items = [
    {
      icon: FaCheck,
      title: 'Рейтинг ATS',
      value: `${atsScore}%`,
      color: 'green',
      description: 'Оценка соответствия резюме требованиям автоматических систем отбора'
    },
    {
      icon: FaClipboard,
      title: 'Релевантность',
      value: `${matches}`,
      color: 'blue',
      description: 'Количество релевантных ключевых слов в вашем резюме'
    },
    {
      icon: FaTimes,
      title: 'Отсутствующие ключевые слова',
      value: `${missingKeywords}`,
      color: 'red',
      description: 'Ключевые слова, которые рекомендуется добавить в резюме'
    },
    {
      icon: FaClock,
      title: 'Время прочтения',
      value: `${readTime} сек`,
      color: 'orange',
      description: 'Примерное время, которое рекрутер потратит на чтение резюме'
    },
    {
      icon: FaChartPie,
      title: 'Проходимость',
      value: `${passRate}%`,
      color: 'purple',
      description: 'Вероятность прохождения первичного отбора'
    },
    {
      icon: FaInfoCircle,
      title: 'Потенциал оптимизации',
      value: `${optimizationPotential}%`,
      color: 'teal',
      description: 'Процент, на который можно улучшить резюме'
    }
  ];
  
  return (
    <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={4} mb={8}>
      {items.map((item, index) => (
        <StatCard
          key={index}
          icon={item.icon}
          title={item.title}
          value={item.value}
          color={item.color}
          description={item.description}
          index={index}
        />
      ))}
    </SimpleGrid>
  );
};

export default ResumeStats; 