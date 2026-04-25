import React from 'react';
import { Box, VStack, Heading, Text, Button, Icon, useColorModeValue } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { IconType } from 'react-icons';

// @ts-ignore - motion() works with Chakra UI components
const MotionBox = motion(Box);

interface EmptyStateCardProps {
  icon: IconType;
  title: string;
  description: string;
  buttonText?: string;
  onButtonClick?: () => void;
  colorScheme?: string;
}

const EmptyStateCard: React.FC<EmptyStateCardProps> = ({
  icon,
  title,
  description,
  buttonText,
  onButtonClick,
  colorScheme = 'indigo'
}) => {
  // Unified black and white color scheme
  const bgColor = useColorModeValue('white', 'black');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const iconBg = useColorModeValue('gray.50', 'gray.800');
  const iconColor = useColorModeValue('black', 'white');
  const textColor = useColorModeValue('gray.700', 'gray.200');
  const headingColor = useColorModeValue('black', 'white');
  const buttonBg = useColorModeValue('black', 'white');
  const buttonColor = useColorModeValue('white', 'black');
  const buttonHoverBg = useColorModeValue('gray.800', 'gray.200');
  
  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      p={8}
      borderRadius="xl"
      bg={bgColor}
      borderWidth="1px"
      borderColor={borderColor}
      boxShadow="sm"
      w="full"
      textAlign="center"
      position="relative"
      overflow="hidden"
      _hover={{
        borderColor: useColorModeValue('black', 'white'),
        boxShadow: 'lg',
      }}
    >
      {/* Decorative top border */}
      <Box
        position="absolute"
        top="0"
        left="0"
        right="0"
        height="3px"
        bg={useColorModeValue('black', 'white')}
      />
      
      {/* Subtle background animation */}
      <MotionBox
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 4, repeat: Infinity }}
        position="absolute"
        top="20"
        right="20"
        w="16"
        h="16"
        bg={useColorModeValue('black/5', 'white/5')}
        borderRadius="full"
        filter="blur(10px)"
        pointerEvents="none"
      />
      
      <VStack spacing={6}>
        <MotionBox
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          p={4}
          borderRadius="xl"
          bg={iconBg}
          border="2px solid"
          borderColor={borderColor}
          _hover={{
            borderColor: useColorModeValue('black', 'white'),
          }}
        >
          <Icon as={icon} boxSize={8} color={iconColor} />
        </MotionBox>
        
        <MotionBox
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Heading size="md" color={headingColor} fontWeight="light" mb={2}>
            <Box as="span" fontWeight="thin">{title.split(' ')[0]}</Box>
            {title.split(' ').length > 1 && (
              <Box as="span" fontWeight="bold" ml={1}>
                {title.split(' ').slice(1).join(' ')}
              </Box>
            )}
          </Heading>
          <Text color={textColor} maxW="400px" mx="auto" fontSize="sm">
            {description}
          </Text>
        </MotionBox>
        
        {buttonText && (
          <MotionBox
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Button
              bg={buttonBg}
              color={buttonColor}
              _hover={{ 
                bg: buttonHoverBg,
                transform: 'translateY(-2px)',
                boxShadow: 'lg'
              }}
              _active={{
                transform: 'translateY(0)',
              }}
              onClick={onButtonClick}
              size="md"
              fontWeight="medium"
              borderRadius="lg"
              px={6}
              transition="all 0.2s"
              aria-label={buttonText}
            >
              {buttonText}
            </Button>
          </MotionBox>
        )}
      </VStack>
    </MotionBox>
  );
};

export default EmptyStateCard;
