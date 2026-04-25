import React from 'react';
import { Box, Heading, Text, Button, Flex, useColorModeValue, Icon } from '@chakra-ui/react';
import { IconType } from 'react-icons';

interface HeaderSectionProps {
  title: string;
  description?: string;
  buttonText?: string;
  buttonIcon?: IconType;
  onButtonClick?: () => void;
  gradient?: 'primary' | 'accent' | 'info';
  align?: 'left' | 'center' | 'right';
}

const HeaderSection: React.FC<HeaderSectionProps> = ({
  title,
  description,
  buttonText,
  buttonIcon,
  onButtonClick,
  gradient = 'primary',
  align = 'left'
}) => {
  // Unified black and white color scheme
  const titleColor = useColorModeValue('black', 'white');
  const textColor = useColorModeValue('gray.700', 'gray.200');
  const buttonBg = useColorModeValue('black', 'white');
  const buttonColor = useColorModeValue('white', 'black');
  const buttonHoverBg = useColorModeValue('gray.800', 'gray.200');
  const accentColor = useColorModeValue('black', 'white');
  
  // Определяем выравнивание
  const textAlign = align;
  
  return (
    <Box mb="sectionPadding">
      <Flex 
        direction="column" 
        align={align} 
        textAlign={textAlign}
      >
        <Heading 
          fontSize="fontSizes.heading"
          fontWeight="bold"
          mb={3}
          color={titleColor}
          display="inline-block"
          position="relative"
          _after={{
            content: '""',
            position: 'absolute',
            bottom: '-6px',
            left: align === 'center' ? '30%' : align === 'right' ? '60%' : '0',
            width: '40%',
            height: '3px',
            bg: accentColor,
            borderRadius: 'full'
          }}
        >
          <Text as="span" fontWeight="thin">
            {title.split(' ').slice(0, -1).join(' ')}
          </Text>
          {title.split(' ').length > 1 && (
            <Text as="span" fontWeight="bold" ml={2}>
              {title.split(' ').slice(-1)[0]}
            </Text>
          )}
        </Heading>
        
        {description && (
          <Text 
            color={textColor} 
            fontSize="fontSizes.body"
            maxW="600px"
            alignSelf={align === 'center' ? 'center' : undefined}
            mt={2}
            fontWeight="light"
          >
            {description}
          </Text>
        )}
        
        {buttonText && (
          <Button
            bg={buttonBg}
            color={buttonColor}
            size="md"
            rightIcon={buttonIcon && <Icon as={buttonIcon} />}
            onClick={onButtonClick}
            mt={4}
            _hover={{ 
              bg: buttonHoverBg,
              transform: 'translateY(-2px)', 
              boxShadow: 'lg' 
            }}
            transition="all 0.2s"
            alignSelf={align === 'center' ? 'center' : undefined}
            aria-label={buttonText}
            borderRadius="md"
            fontWeight="medium"
          >
            {buttonText}
          </Button>
        )}
      </Flex>
    </Box>
  );
};

export default HeaderSection; 