import React from 'react';
import { HStack, Button, useColorModeValue, Icon, Box } from '@chakra-ui/react';
import { NetworkingTab } from '../../hooks/useNetworkingTabs';
import { FaStar, FaUserAlt, FaPlusCircle, FaClipboardList } from 'react-icons/fa';

interface NetworkingTabsProps {
  tabs: { id: NetworkingTab; label: string }[];
  currentTab: NetworkingTab;
  onTabChange: (tab: NetworkingTab) => void;
}

const NetworkingTabs: React.FC<NetworkingTabsProps> = ({ 
  tabs, 
  currentTab, 
  onTabChange 
}) => {
  // Get appropriate icon for each tab
  const getTabIcon = (tabId: NetworkingTab) => {
    switch (tabId) {
      case 'recommended':
        return <Icon as={FaStar} />;
      case 'profile':
        return <Icon as={FaUserAlt} />;
      case 'create-project':
        return <Icon as={FaPlusCircle} />;
      case 'projects':
        return <Icon as={FaClipboardList} />;
      default:
        return null;
    }
  };

  // Colors for the tabs
  const activeColor = useColorModeValue('black', 'white');
  const inactiveColor = useColorModeValue('gray.600', 'gray.400');
  const scrollbarTrackColor = useColorModeValue('rgba(0,0,0,0.05)', 'rgba(255,255,255,0.05)');
  const scrollbarThumbColor = useColorModeValue('rgba(0,0,0,0.2)', 'rgba(255,255,255,0.2)');
  const scrollbarThumbHoverColor = useColorModeValue('rgba(0,0,0,0.3)', 'rgba(255,255,255,0.3)');
  const buttonHoverBg = useColorModeValue('gray.100', 'gray.700');
  const buttonActiveBg = useColorModeValue('gray.50', 'gray.800');

  return (
    <Box
      overflowX="auto"
      py={2}
      mb={8}
      sx={{
        // Enhanced scrollbar styling for dark mode
        '&::-webkit-scrollbar': {
          height: '8px',
          borderRadius: '4px',
        },
        '&::-webkit-scrollbar-track': {
          background: scrollbarTrackColor,
          borderRadius: '4px',
        },
        '&::-webkit-scrollbar-thumb': {
          background: scrollbarThumbColor,
          borderRadius: '4px',
        },
        '&::-webkit-scrollbar-thumb:hover': {
          background: scrollbarThumbHoverColor,
        }
      }}
    >
      <HStack spacing={4} pb={1}>
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <Button
              key={tab.id}
              size="md"
              colorScheme={isActive ? 'orange' : 'gray'}
              variant={isActive ? 'solid' : 'outline'}
              leftIcon={getTabIcon(tab.id)}
              onClick={() => onTabChange(tab.id)}
              flexShrink={0}
              borderRadius="full"
              _hover={{
                transform: 'translateY(-2px)',
                shadow: 'md',
                bg: isActive ? undefined : buttonHoverBg
              }}
              _active={{
                transform: 'translateY(0)',
                bg: buttonActiveBg
              }}
              transition="all 0.2s"
              fontWeight={isActive ? 'semibold' : 'medium'}
            >
              {tab.label}
            </Button>
          );
        })}
      </HStack>
    </Box>
  );
};

export default NetworkingTabs; 