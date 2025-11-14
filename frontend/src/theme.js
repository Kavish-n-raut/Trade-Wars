import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
  styles: {
    global: {
      body: {
        bg: '#0a0e27',
        color: 'white',
      },
    },
  },
  colors: {
    brand: {
      50: '#e0f7ff',
      100: '#b3e7ff',
      200: '#80d6ff',
      300: '#4dc5ff',
      400: '#26b8ff',
      500: '#00d9ff', // Primary brand color
      600: '#00aad4',
      700: '#007ba3',
      800: '#004d72',
      900: '#001e42',
    },
    purple: {
      50: '#f5f0ff',
      100: '#e5d4ff',
      200: '#d4b8ff',
      300: '#c29cff',
      400: '#b080ff',
      500: '#7c3aed', // Secondary brand color
      600: '#6327d4',
      700: '#4a1ba3',
      800: '#310f72',
      900: '#180542',
    },
    success: {
      50: '#e0fff4',
      100: '#b3ffe5',
      200: '#80ffd6',
      300: '#4dffc7',
      400: '#26ffbc',
      500: '#00ffb3', // Success green
      600: '#00d494',
      700: '#00a375',
      800: '#007256',
      900: '#004237',
    },
    error: {
      50: '#ffe5e5',
      100: '#ffb3b3',
      200: '#ff8080',
      300: '#ff4d4d',
      400: '#ff2626',
      500: '#ff5252', // Error red
      600: '#d43f3f',
      700: '#a32e2e',
      800: '#721d1d',
      900: '#420c0c',
    },
  },
  fonts: {
    heading: `'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif`,
    body: `'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif`,
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'bold',
        borderRadius: '8px',
      },
      variants: {
        solid: {
          bg: 'linear-gradient(135deg, #00d9ff, #7c3aed)',
          color: 'white',
          _hover: {
            transform: 'scale(1.05)',
            boxShadow: '0 4px 12px rgba(0, 217, 255, 0.4)',
          },
          _active: {
            transform: 'scale(0.98)',
          },
        },
        outline: {
          borderColor: 'brand.500',
          color: 'brand.500',
          _hover: {
            bg: 'rgba(0, 217, 255, 0.1)',
          },
        },
      },
      defaultProps: {
        colorScheme: 'brand',
      },
    },
    Input: {
      variants: {
        filled: {
          field: {
            bg: 'rgba(0, 0, 0, 0.3)',
            borderColor: 'rgba(0, 217, 255, 0.3)',
            _hover: {
              bg: 'rgba(0, 0, 0, 0.4)',
            },
            _focus: {
              bg: 'rgba(0, 0, 0, 0.5)',
              borderColor: 'brand.500',
            },
          },
        },
      },
      defaultProps: {
        variant: 'filled',
      },
    },
    Card: {
      baseStyle: {
        container: {
          bg: 'rgba(26, 31, 46, 0.8)',
          borderRadius: '16px',
          border: '1px solid rgba(0, 217, 255, 0.2)',
          backdropFilter: 'blur(10px)',
        },
      },
    },
  },
});

export default theme;