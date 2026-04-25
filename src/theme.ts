import { extendTheme, type ThemeConfig } from '@chakra-ui/react';

// Конфигурация темы
const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: false,
};

// Расширение темы с добавлением цветов
const theme = extendTheme({
  config,
  colors: {
    // Основные цвета бренда - теперь черно-белые
    brand: {
      50: '#f7fafc',
      100: '#edf2f7',
      200: '#e2e8f0',
      300: '#cbd5e0',
      400: '#a0aec0',
      500: '#718096',
      600: '#4a5568',
      700: '#2d3748',
      800: '#1a202c',
      900: '#171923',
    },
    violet: {
      50: '#f5f3ff',
      100: '#ede9fe',
      200: '#ddd6fe',
      300: '#c4b5fd',
      400: '#a78bfa',
      500: '#8b5cf6',
      600: '#7c3aed',
      700: '#6d28d9',
      800: '#5b21b6',
      900: '#4c1d95',
    },
    amber: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
    },
    cyan: {
      50: '#ecfeff',
      100: '#cffafe',
      200: '#a5f3fc',
      300: '#67e8f9',
      400: '#22d3ee',
      500: '#06b6d4',
      600: '#0891b2',
      700: '#0e7490',
      800: '#155e75',
      900: '#164e63',
    },
    sky: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
    },
    blue: {
      50: '#e6f1ff',
      100: '#c8dcff',
      200: '#a3c3ff',
      300: '#7eaaff',
      400: '#5992ff',
      500: '#3579ff',
      600: '#2a61cc',
      700: '#1f4999',
      800: '#153066',
      900: '#0a1833',
    },
    teal: {
      50: '#e6fffa',
      100: '#b2f5ea',
      200: '#81e6d9',
      300: '#4fd1c5',
      400: '#38b2ac',
      500: '#319795',
      600: '#2c7a7b',
      700: '#285e61',
      800: '#234e52',
      900: '#1d4044',
    },
    gray: {
      50: '#f7fafc',
      100: '#edf2f7',
      200: '#e2e8f0',
      300: '#cbd5e0',
      400: '#a0aec0',
      500: '#718096',
      600: '#4a5568',
      700: '#2d3748',
      800: '#1a202c',
      900: '#171923',
    },
    purple: {
      50: '#f5f3ff',
      100: '#ede9fe',
      200: '#ddd6fe',
      300: '#c4b5fd',
      400: '#a78bfa',
      500: '#8b5cf6',
      600: '#7c3aed',
      700: '#6d28d9',
      800: '#5b21b6',
      900: '#4c1d95',
    },
    green: {
      50: '#f0fff4',
      100: '#c6f6d5',
      200: '#9ae6b4',
      300: '#68d391',
      400: '#48bb78',
      500: '#38a169',
      600: '#2f855a',
      700: '#276749',
      800: '#22543d',
      900: '#1c4532',
    },
    yellow: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
    },
    orange: {
      50: '#fff7ed',
      100: '#ffedd5',
      200: '#fed7aa',
      300: '#fdba74',
      400: '#fb923c',
      500: '#f97316',
      600: '#ea580c',
      700: '#c2410c',
      800: '#9a3412',
      900: '#7c2d12',
    },
    red: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
    },
  },
  // Определение семантических цветов для бренда
  semanticTokens: {
    colors: {
      // Основные цвета бренда - черно-белые
      'brand.primary': {
        default: 'black',
        _dark: 'white',
      },
      'brand.secondary': {
        default: 'gray.700',
        _dark: 'gray.300',
      },
      'brand.accent': {
        default: 'black',
        _dark: 'white',
      },
      'brand.highlight': {
        default: 'gray.800',
        _dark: 'gray.200',
      },
      'brand.info': {
        default: 'gray.600',
        _dark: 'gray.400',
      },
      // Градиенты - черно-белые
      'gradient.primary': 'linear(to-r, black, gray.700)',
      'gradient.accent': 'linear(to-r, gray.800, black)',
      'gradient.info': 'linear(to-r, gray.600, gray.800)',
    },
    // Добавляем семантические токены для отступов
    space: {
      sectionPadding: '8',   // эквивалент Chakra's 32px (8 × 4)
      cardGap: '4',          // 16px между карточками
    },
    // Добавляем семантические токены для размеров шрифтов
    fontSizes: {
      heading: '2xl',
      subheading: 'lg',
      body: 'md',
    },
    // Добавляем компонентные токены
    components: {
      ProjectCard: {
        headerFontSize: 'heading',
        bodyFontSize: 'body',
        tagFontSize: 'sm',
      }
    }
  },
  styles: {
    global: (props: any) => ({
      body: {
        bg: props.colorMode === 'dark' ? 'gray.800' : 'white',
        color: props.colorMode === 'dark' ? 'white' : 'gray.800',
      },
    }),
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'semibold',
        borderRadius: 'md',
      },
      variants: {
        solid: (props: any) => ({
          bg: props.colorMode === 'dark' ? 'white' : 'black',
          color: props.colorMode === 'dark' ? 'black' : 'white',
          _hover: {
            bg: props.colorMode === 'dark' ? 'gray.200' : 'gray.800',
          },
        }),
        outline: (props: any) => ({
          borderColor: props.colorMode === 'dark' ? 'white' : 'black',
          color: props.colorMode === 'dark' ? 'white' : 'black',
          _hover: {
            bg: props.colorMode === 'dark' ? 'gray.800' : 'gray.50',
          },
        }),
        accent: (props: any) => ({
          bg: props.colorMode === 'dark' ? 'gray.700' : 'gray.800',
          color: 'white',
          _hover: {
            bg: props.colorMode === 'dark' ? 'gray.600' : 'gray.700',
          },
        }),
        info: (props: any) => ({
          bg: props.colorMode === 'dark' ? 'gray.600' : 'gray.700',
          color: 'white',
          _hover: {
            bg: props.colorMode === 'dark' ? 'gray.500' : 'gray.600',
          },
        }),
        gradient: {
          bgGradient: 'linear(to-r, black, gray.700)',
          color: 'white',
          _hover: {
            bgGradient: 'linear(to-r, gray.800, gray.600)',
          },
        },
        accentGradient: {
          bgGradient: 'linear(to-r, gray.800, black)',
          color: 'white',
          _hover: {
            bgGradient: 'linear(to-r, gray.700, gray.800)',
          },
        },
      },
    },
    Badge: {
      baseStyle: {
        borderRadius: 'full',
      },
      variants: {
        solid: (props: any) => ({
          bg: props.colorMode === 'dark' ? 'white' : 'black',
          color: props.colorMode === 'dark' ? 'black' : 'white',
        }),
        outline: (props: any) => ({
          borderColor: props.colorMode === 'dark' ? 'white' : 'black',
          color: props.colorMode === 'dark' ? 'white' : 'black',
        }),
        accent: (props: any) => ({
          bg: props.colorMode === 'dark' ? 'gray.700' : 'gray.800',
          color: 'white',
        }),
        info: (props: any) => ({
          bg: props.colorMode === 'dark' ? 'gray.600' : 'gray.700',
          color: 'white',
        }),
        subtle: (props: any) => ({
          bg: props.colorMode === 'dark' ? 'gray.800' : 'gray.100',
          color: props.colorMode === 'dark' ? 'gray.200' : 'gray.800',
        }),
        accentSubtle: (props: any) => ({
          bg: props.colorMode === 'dark' ? 'gray.700' : 'gray.200',
          color: props.colorMode === 'dark' ? 'gray.200' : 'gray.700',
        }),
        infoSubtle: (props: any) => ({
          bg: props.colorMode === 'dark' ? 'gray.600' : 'gray.300',
          color: props.colorMode === 'dark' ? 'gray.200' : 'gray.600',
        }),
      },
    },
    Card: {
      baseStyle: (props: any) => ({
        container: {
          bg: props.colorMode === 'dark' ? 'gray.800' : 'white',
          borderRadius: 'xl',
          overflow: 'hidden',
          boxShadow: 'md',
        },
      }),
      variants: {
        elevated: (props: any) => ({
          container: {
            boxShadow: 'lg',
            _hover: {
              boxShadow: 'xl',
            },
          },
        }),
        outline: (props: any) => ({
          container: {
            borderWidth: '1px',
            borderColor: props.colorMode === 'dark' ? 'gray.700' : 'gray.200',
          },
        }),
        filled: (props: any) => ({
          container: {
            bg: props.colorMode === 'dark' ? 'gray.700' : 'gray.100',
          },
        }),
        unstyled: {
          container: {
            bg: 'none',
            boxShadow: 'none',
          },
        },
      },
    },
    // Добавляем стили для других компонентов
    Tabs: {
      variants: {
        'soft-rounded': (props: any) => ({
          tab: {
            borderRadius: 'full',
            fontWeight: 'semibold',
            color: props.colorMode === 'dark' ? 'gray.400' : 'gray.600',
            _selected: {
              color: 'white',
              bg: props.colorMode === 'dark' ? 'gray.600' : 'black',
            },
          },
        }),
      },
    },
  },
  fonts: {
    heading: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif`,
    body: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif`,
  },
});

export default theme; 