import React from 'react';
import { Box, Container, useColorModeValue } from '@chakra-ui/react';
import { motion } from 'framer-motion';

interface PageWrapperProps {
  children: React.ReactNode;
  bgGradient?: string;
}

// @ts-ignore - motion() works with Chakra UI components
const MotionBox = motion(Box);

const PageWrapper: React.FC<PageWrapperProps> = ({ 
  children,
  bgGradient,
}) => {
  const bgColor = useColorModeValue('white', 'black');
  const overlayColor = useColorModeValue('black/3', 'white/3');

  return (
    <Box 
      bg={bgColor}
      minH="100vh" 
      py={{ base: 6, md: 10 }} 
      px={{ base: 4, md: 6, lg: 8 }}
      position="relative"
      overflow="hidden"
    >
      {/* Subtle animated background elements */}
      <MotionBox
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 8, repeat: Infinity }}
        position="absolute"
        top="20"
        left={{ base: "4", sm: "10" }}
        w={{ base: "32", sm: "48" }}
        h={{ base: "32", sm: "48" }}
        bg={overlayColor}
        borderRadius="full"
        filter="blur(60px)"
        pointerEvents="none"
      />
      <MotionBox
        animate={{ y: [0, 20, 0] }}
        transition={{ duration: 10, repeat: Infinity }}
        position="absolute"
        bottom="20"
        right={{ base: "4", sm: "10" }}
        w={{ base: "40", sm: "64" }}
        h={{ base: "40", sm: "64" }}
        bg={overlayColor}
        borderRadius="full"
        filter="blur(60px)"
        pointerEvents="none"
      />
      
      <Container maxW="1200px" position="relative" zIndex={1}>
        {children}
      </Container>
    </Box>
  );
};

export default PageWrapper; 