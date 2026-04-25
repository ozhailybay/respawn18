import React from 'react';
import { Box, Heading, Text, Button, Flex, Icon, useColorModeValue } from '@chakra-ui/react';
import { motion } from 'framer-motion';

interface HeaderSectionProps {
  title: string;
  description?: string;
  buttonText?: string;
  buttonIcon?: React.ElementType;
  onButtonClick?: () => void;
  gradient?: 'primary' | 'accent' | 'info';
  align?: 'left' | 'center' | 'right';
}

// @ts-ignore - motion() works with Chakra UI components
const MotionBox = motion(Box);
// @ts-ignore - motion() works with Chakra UI components
const MotionHeading = motion(Heading);
// @ts-ignore - motion() works with Chakra UI components
const MotionText = motion(Text);

const HeaderSection: React.FC<HeaderSectionProps> = ({
  title,
  description,
  buttonText,
  buttonIcon,
  onButtonClick,
  gradient = 'primary',
  align = 'left',
}) => {
  const textColor = useColorModeValue('gray.700', 'gray.200');
  const headingColor = useColorModeValue('black', 'white');
  const accentColor = useColorModeValue('gray.600', 'gray.400');
  const borderColor = useColorModeValue('black', 'white');
  const textAlign = align;

  return (
    <MotionBox 
      mb={8}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Flex direction="column" align={align} textAlign={textAlign}>
        <MotionHeading
          fontSize="2xl"
          fontWeight="light"
          mb={2}
          color={headingColor}
          display="inline-block"
          position="relative"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          _after={{
            content: '""',
            position: 'absolute',
            bottom: '-4px',
            left: align === 'center' ? '35%' : align === 'right' ? '65%' : '0',
            width: '30%',
            height: '2px',
            bg: borderColor,
            borderRadius: 'full',
          }}
        >
          <Box as="span" fontWeight="thin">{title.split(' ')[0]}</Box>
          {title.split(' ').length > 1 && (
            <Box as="span" fontWeight="bold" ml={2}>
              {title.split(' ').slice(1).join(' ')}
            </Box>
          )}
        </MotionHeading>

        {description && (
          <MotionText 
            color={textColor} 
            fontSize="md" 
            maxW="600px" 
            mt={1}
            fontWeight="light"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {description}
          </MotionText>
        )}

        {buttonText && (
          <MotionBox
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Button
              variant="outline"
              size="md"
              rightIcon={buttonIcon && <Icon as={buttonIcon} />}
              onClick={onButtonClick}
              mt={4}
              borderColor={borderColor}
              color={headingColor}
              bg="transparent"
              _hover={{ 
                bg: useColorModeValue('black', 'white'),
                color: useColorModeValue('white', 'black'),
                transform: 'translateY(-2px)',
                boxShadow: 'lg'
              }}
              transition="all 0.2s"
              aria-label={buttonText}
              fontWeight="light"
            >
              {buttonText}
            </Button>
          </MotionBox>
        )}
      </Flex>
    </MotionBox>
  );
};

export default HeaderSection; 