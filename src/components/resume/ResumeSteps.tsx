import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Icon,
  useColorModeValue,
  Heading
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { 
  FaUpload,
  FaRobot, 
  FaChartLine, 
  FaFileDownload 
} from 'react-icons/fa';

// @ts-ignore - motion() works with Chakra UI components
const MotionBox = motion(Box);

interface StepProps {
  icon: React.ElementType;
  title: string;
  description: string;
  active?: boolean;
  completed?: boolean;
  index: number;
}

const Step: React.FC<StepProps> = ({
  icon,
  title,
  description,
  active = false,
  completed = false,
  index
}) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const activeColor = useColorModeValue('black', 'white');
  const completedColor = useColorModeValue('gray.700', 'gray.300');
  const inactiveColor = useColorModeValue('gray.400', 'gray.600');
  const textColor = useColorModeValue('gray.700', 'gray.300');
  
  const iconColor = completed ? completedColor : active ? activeColor : inactiveColor;
  
  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      mb={4}
    >
      <HStack spacing={4} align="flex-start">
        <Box
          borderRadius="full"
          bg={completed ? useColorModeValue('gray.100', 'gray.700') : active ? useColorModeValue('gray.100', 'gray.700') : 'gray.100'}
          color={iconColor}
          p={3}
          boxShadow={active ? 'md' : 'none'}
          position="relative"
          borderWidth={active ? "2px" : "1px"}
          borderColor={active ? activeColor : useColorModeValue('gray.200', 'gray.600')}
        >
          {active && (
            <Box
              position="absolute"
              top="-4px"
              right="-4px"
              bottom="-4px"
              left="-4px"
              borderRadius="full"
              border="2px solid"
              borderColor={activeColor}
              opacity={0.5}
              animation={active ? "pulse 2s infinite" : "none"}
              sx={{
                '@keyframes pulse': {
                  '0%': { transform: 'scale(0.95)', opacity: 0.7 },
                  '50%': { transform: 'scale(1.05)', opacity: 0.3 },
                  '100%': { transform: 'scale(0.95)', opacity: 0.7 }
                }
              }}
            />
          )}
          <Icon as={icon} boxSize={5} />
        </Box>
        
        <VStack align="flex-start" spacing={0}>
          <Text
            fontWeight="bold"
            color={completed ? completedColor : active ? activeColor : textColor}
          >
            {title}
          </Text>
          <Text fontSize="sm" color={textColor}>
            {description}
          </Text>
        </VStack>
      </HStack>
    </MotionBox>
  );
};

const ResumeSteps: React.FC<{ currentStep: number }> = ({ currentStep }) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  const steps = [
    {
      icon: FaUpload,
      title: "Загрузка резюме",
      description: "Загрузите PDF, DOCX или TXT файл вашего резюме"
    },
    {
      icon: FaRobot,
      title: "ИИ Анализ",
      description: "Наш искусственный интеллект анализирует содержание и структуру"
    },
    {
      icon: FaChartLine,
      title: "Результаты оценки",
      description: "Получите развернутую оценку с рекомендациями"
    },
    {
      icon: FaFileDownload,
      title: "Улучшенное резюме",
      description: "Скачайте улучшенную версию вашего резюме"
    }
  ];
  
  return (
    <Box
      bg={bgColor}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="xl"
      p={6}
      boxShadow="sm"
      mb={6}
    >
      <Heading size="md" mb={5}>Процесс проверки резюме</Heading>
      
      <VStack align="stretch" spacing={4}>
        {steps.map((step, index) => (
          <Step
            key={index}
            icon={step.icon}
            title={step.title}
            description={step.description}
            active={currentStep === index}
            completed={currentStep > index}
            index={index}
          />
        ))}
      </VStack>
    </Box>
  );
};

export default ResumeSteps; 