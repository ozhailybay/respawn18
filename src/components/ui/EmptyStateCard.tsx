import React from 'react';
import { Box, VStack, Icon, Text, Button, useColorModeValue } from '@chakra-ui/react';
import { IconType } from 'react-icons';
import { motion } from 'framer-motion';

// @ts-ignore - motion() works with Chakra UI components
const MotionBox = motion(Box);

interface EmptyStateCardProps {
  icon: IconType;
  title: string;
  description: string;
  buttonText?: string;
  buttonAction?: () => void;
  colorScheme?: string;
  hasAnimation?: boolean;
}

const EmptyStateCard: React.FC<EmptyStateCardProps> = ({
  icon,
  title,
  description,
  buttonText,
  buttonAction,
  colorScheme = 'blue',
  hasAnimation = false
}) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const color = useColorModeValue(`${colorScheme}.500`, `${colorScheme}.300`);
  
  return (
    <MotionBox
      initial={hasAnimation ? { opacity: 0, y: 20 } : {}}
      animate={hasAnimation ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
      p={8}
      borderRadius="xl"
      bg={bgColor}
      boxShadow="lg"
      borderWidth="1px"
      borderColor={useColorModeValue('gray.200', 'gray.700')}
      textAlign="center"
      position="relative"
      overflow="hidden"
    >
      {/* Декоративные элементы фона */}
      {hasAnimation && (
        <>
          <Box
            position="absolute"
            top="-60px"
            left="-60px"
            bg={useColorModeValue(`${colorScheme}.50`, `${colorScheme}.900`)}
            opacity="0.5"
            borderRadius="full"
            w="120px"
            h="120px"
            zIndex="0"
          />
          <Box
            position="absolute"
            bottom="-70px"
            right="-70px"
            bg={useColorModeValue(`${colorScheme}.50`, `${colorScheme}.900`)}
            opacity="0.5"
            borderRadius="full"
            w="140px"
            h="140px"
            zIndex="0"
          />
        </>
      )}
      
      <VStack spacing={4} zIndex="1" position="relative">
        <MotionBox
          animate={hasAnimation ? { 
            y: [0, -10, 0],
            scale: [1, 1.05, 1] 
          } : {}}
          transition={hasAnimation ? { 
            duration: 3,
            repeat: Infinity,
            repeatType: "reverse"
          } : {}}
          bg={useColorModeValue(`${colorScheme}.100`, `${colorScheme}.900`)}
          color={color}
          p={4}
          borderRadius="full"
          boxSize="80px"
          display="flex"
          alignItems="center"
          justifyContent="center"
          mb={3}
        >
          <Icon as={icon} boxSize={10} />
        </MotionBox>
        
        <Text fontWeight="bold" fontSize="2xl" mb={2}>
          {title}
        </Text>
        
        <Text color={useColorModeValue('gray.600', 'gray.400')} maxW="md">
          {description}
        </Text>
        
        {buttonText && buttonAction && (
          <MotionBox
            mt={6}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              colorScheme={colorScheme}
              onClick={buttonAction}
              size="lg"
              _hover={{ transform: 'translateY(-2px)', shadow: 'lg' }}
              transition="all 0.2s"
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