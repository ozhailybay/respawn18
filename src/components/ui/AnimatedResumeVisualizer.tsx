import React, { useState, useEffect } from 'react';
import {
  Box,
  HStack,
  VStack,
  Text,
  useColorModeValue,
  Divider,
  Flex,
  Icon,
  Heading,
  Tag,
  Badge
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FaUser, FaBriefcase, FaGraduationCap, FaTools, FaMedal, FaEnvelope, FaPhone, FaGlobe } from 'react-icons/fa';

// @ts-ignore - motion() works with Chakra UI components
const MotionBox = motion(Box);
// @ts-ignore - motion() works with Chakra UI components
const MotionText = motion(Text);
// @ts-ignore - motion() works with Chakra UI components
const MotionDivider = motion(Divider);

interface AnimatedResumeVisualizerProps {
  resume?: {
    personalInfo?: {
      name?: string;
      email?: string;
      phone?: string;
      location?: string;
      website?: string;
    };
    summary?: string;
    experience?: Array<{
      title?: string;
      company?: string;
      location?: string;
      startDate?: string;
      endDate?: string;
      description?: string;
      achievements?: string[];
    }>;
    education?: Array<{
      degree?: string;
      institution?: string;
      location?: string;
      startDate?: string;
      endDate?: string;
      description?: string;
    }>;
    skills?: string[];
    certifications?: string[];
  };
  loading?: boolean;
}

const AnimatedResumeVisualizer: React.FC<AnimatedResumeVisualizerProps> = ({
  resume,
  loading = false
}) => {
  const [isVisualizing, setIsVisualizing] = useState<boolean>(false);
  
  // Цветовые схемы
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.700', 'gray.300');
  const headerColor = useColorModeValue('gray.800', 'white');
  const sectionBg = useColorModeValue('gray.50', 'gray.700');
  const tagBg = useColorModeValue('gray.50', 'gray.800');
  
  // Имитация задержки загрузки для анимации
  useEffect(() => {
    setIsVisualizing(true);
    const timer = setTimeout(() => {
      setIsVisualizing(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [resume]);
  
  // Анимированный placeholder для загрузки
  const LoadingPlaceholder = () => (
    <Box 
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="lg"
      overflow="hidden"
      boxShadow="sm"
      p={6}
      width="100%"
      height="500px"
      position="relative"
    >
      <Flex direction="column" align="center" justify="center" h="100%">
        <MotionBox
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.8, 0.2]
          }}
          transition={{ 
            duration: 1.5, 
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut"
          }}
          width="100px"
          height="100px"
          borderRadius="md"
          bg={useColorModeValue('black', 'white')}
          mb={6}
          boxShadow="lg"
        />
        
        <MotionBox
          width="80%"
          height="20px"
          bg={useColorModeValue('gray.200', 'gray.600')}
          borderRadius="md"
          mb={4}
          animate={{ 
            opacity: [0.3, 0.7, 0.3]
          }}
          transition={{ 
            duration: 1, 
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
            delay: 0.2
          }}
        />
        
        <MotionBox
          width="60%"
          height="20px"
          bg={useColorModeValue('gray.200', 'gray.600')}
          borderRadius="md"
          animate={{ 
            opacity: [0.3, 0.7, 0.3]
          }}
          transition={{ 
            duration: 1, 
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
            delay: 0.5
          }}
        />
      </Flex>
    </Box>
  );
  
  if (loading || isVisualizing) {
    return <LoadingPlaceholder />;
  }
  
  // Если нет данных резюме
  if (!resume) {
    return (
      <Box 
        borderWidth="1px"
        borderColor={borderColor}
        borderRadius="lg"
        overflow="hidden"
        boxShadow="sm"
        p={6}
        bg={bgColor}
      >
        <Flex direction="column" align="center" justify="center" p={10}>
          <Icon as={FaBriefcase} boxSize={10} color="gray.400" mb={4} />
          <Text fontSize="lg" color={textColor}>
            Данные резюме не загружены или отсутствуют
          </Text>
        </Flex>
      </Box>
    );
  }

  return (
    <MotionBox
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="lg"
      overflow="hidden"
      boxShadow="sm"
      bg={bgColor}
    >
      {/* Заголовок/Персональная информация */}
      <MotionBox
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        p={6}
        bg={sectionBg}
        borderBottom="1px solid"
        borderColor={borderColor}
      >
        <Heading as="h2" size="lg" mb={2} color={headerColor}>
          {resume.personalInfo?.name || 'Имя не указано'}
        </Heading>
        
        <HStack spacing={4} mt={3} flexWrap="wrap">
          {resume.personalInfo?.email && (
            <HStack spacing={1}>
              <Icon as={FaEnvelope} color="gray.500" boxSize={3} />
              <Text fontSize="sm" color={textColor}>
                {resume.personalInfo.email}
              </Text>
            </HStack>
          )}
          
          {resume.personalInfo?.phone && (
            <HStack spacing={1}>
              <Icon as={FaPhone} color="gray.500" boxSize={3} />
              <Text fontSize="sm" color={textColor}>
                {resume.personalInfo.phone}
              </Text>
            </HStack>
          )}
          
          {resume.personalInfo?.location && (
            <HStack spacing={1}>
              <Icon as={FaGlobe} color="gray.500" boxSize={3} />
              <Text fontSize="sm" color={textColor}>
                {resume.personalInfo.location}
              </Text>
            </HStack>
          )}
        </HStack>
      </MotionBox>
      
      {/* Сводка/Краткая информация */}
      {resume.summary && (
        <MotionBox
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          p={6}
          borderBottom="1px solid"
          borderColor={borderColor}
        >
          <HStack spacing={2} mb={2} align="center">
            <Icon as={FaUser} color={useColorModeValue('black', 'white')} />
            <Heading as="h3" size="md" color={headerColor}>
              Профессиональная сводка
            </Heading>
          </HStack>
          
          <Text color={textColor}>{resume.summary}</Text>
        </MotionBox>
      )}
      
      {/* Опыт работы */}
      {resume.experience && resume.experience.length > 0 && (
        <MotionBox
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          p={6}
          borderBottom="1px solid"
          borderColor={borderColor}
        >
          <HStack spacing={2} mb={4} align="center">
            <Icon as={FaBriefcase} color={useColorModeValue('black', 'white')} />
            <Heading as="h3" size="md" color={headerColor}>
              Опыт работы
            </Heading>
          </HStack>
          
          <VStack spacing={4} align="stretch">
            {resume.experience.map((exp, index) => (
              <MotionBox
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.1 * index }}
              >
                <Flex 
                  justify="space-between" 
                  align={{ base: "flex-start", md: "center" }}
                  direction={{ base: "column", md: "row" }}
                >
                  <Heading as="h4" size="sm" color={headerColor}>
                    {exp.title} {exp.company && `в ${exp.company}`}
                  </Heading>
                  
                  <Badge colorScheme="gray" mt={{ base: 1, md: 0 }}>
                    {exp.startDate} - {exp.endDate || 'По настоящее время'}
                  </Badge>
                </Flex>
                
                {exp.location && (
                  <Text fontSize="sm" color="gray.500" mb={2}>
                    {exp.location}
                  </Text>
                )}
                
                <Text color={textColor} mt={2}>
                  {exp.description}
                </Text>
                
                {exp.achievements && exp.achievements.length > 0 && (
                  <Box mt={3}>
                    <Text fontWeight="medium" fontSize="sm">Достижения:</Text>
                    <VStack align="flex-start" spacing={1} mt={1}>
                      {exp.achievements.map((achievement, idx) => (
                        <HStack key={idx} align="flex-start" spacing={2}>
                          <Box 
                            w="2px" 
                            h="2px" 
                            borderRadius="full" 
                            bg="blue.500" 
                            mt={2}
                          />
                          <Text fontSize="sm" color={textColor}>{achievement}</Text>
                        </HStack>
                      ))}
                    </VStack>
                  </Box>
                )}
              </MotionBox>
            ))}
          </VStack>
        </MotionBox>
      )}
      
      {/* Образование */}
      {resume.education && resume.education.length > 0 && (
        <MotionBox
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          p={6}
          borderBottom="1px solid"
          borderColor={borderColor}
        >
          <HStack spacing={2} mb={4} align="center">
            <Icon as={FaGraduationCap} color={useColorModeValue('black', 'white')} />
            <Heading as="h3" size="md" color={headerColor}>
              Образование
            </Heading>
          </HStack>
          
          <VStack spacing={4} align="stretch">
            {resume.education.map((edu, index) => (
              <MotionBox
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.1 * index }}
              >
                <Flex 
                  justify="space-between" 
                  align={{ base: "flex-start", md: "center" }}
                  direction={{ base: "column", md: "row" }}
                >
                  <Heading as="h4" size="sm" color={headerColor}>
                    {edu.degree} {edu.institution && `в ${edu.institution}`}
                  </Heading>
                  
                  <Badge colorScheme="gray" mt={{ base: 1, md: 0 }}>
                    {edu.startDate} - {edu.endDate || 'По настоящее время'}
                  </Badge>
                </Flex>
                
                {edu.location && (
                  <Text fontSize="sm" color="gray.500" mb={2}>
                    {edu.location}
                  </Text>
                )}
                
                {edu.description && (
                  <Text color={textColor} mt={2}>
                    {edu.description}
                  </Text>
                )}
              </MotionBox>
            ))}
          </VStack>
        </MotionBox>
      )}
      
      {/* Навыки */}
      {resume.skills && resume.skills.length > 0 && (
        <MotionBox
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          p={6}
          borderBottom="1px solid"
          borderColor={borderColor}
        >
          <HStack spacing={2} mb={4} align="center">
            <Icon as={FaTools} color="green.500" />
            <Heading as="h3" size="md" color={headerColor}>
              Навыки
            </Heading>
          </HStack>
          
          <Flex wrap="wrap" gap={2}>
            {resume.skills.map((skill, index) => (
              <MotionBox
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.1 * index }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Tag 
                  size="md" 
                  borderRadius="full" 
                  variant="solid" 
                  bg={tagBg} 
                  color="teal.600"
                  px={3}
                  py={1}
                  fontWeight="medium"
                >
                  {skill}
                </Tag>
              </MotionBox>
            ))}
          </Flex>
        </MotionBox>
      )}
      
      {/* Сертификаты */}
      {resume.certifications && resume.certifications.length > 0 && (
        <MotionBox
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          p={6}
        >
          <HStack spacing={2} mb={4} align="center">
            <Icon as={FaMedal} color="gray.700" />
            <Heading as="h3" size="md" color={headerColor}>
              Сертификаты
            </Heading>
          </HStack>
          
          <VStack align="stretch" spacing={2}>
            {resume.certifications.map((cert, index) => (
              <MotionBox
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.1 * index }}
              >
                <Text color={textColor}>• {cert}</Text>
              </MotionBox>
            ))}
          </VStack>
        </MotionBox>
      )}
    </MotionBox>
  );
};

export default AnimatedResumeVisualizer; 