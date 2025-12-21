'use client';

import { createTheme, ThemeOptions, alpha } from '@mui/material/styles';

const getDesignTokens = (mode: 'light' | 'dark'): ThemeOptions => ({
  palette: {
    mode,
    primary: {
      main: '#FFC107', // Tungsten Sun
      contrastText: '#1B1C20',
    },
    secondary: {
      main: '#1A237E', // Adire Indigo
    },
    success: {
      main: '#004D40', // Circuit Teal
    },
    background: {
      default: '#1B1C20', // The Void
      paper: '#2D2421',   // The Matter (Baked Laterite)
    },
    text: {
      primary: '#FAF8F6', // Brownish White
      secondary: '#A69080',
    },
    divider: '#3D3D3D',
  },
  typography: {
    fontFamily: 'var(--font-inter), "Inter", sans-serif',
    h1: {
      fontFamily: 'var(--font-mono), monospace',
      fontSize: '3rem',
      fontWeight: 800,
      letterSpacing: '-0.03em',
    },
    h2: {
      fontFamily: 'var(--font-mono), monospace',
      fontSize: '2.25rem',
      fontWeight: 700,
    },
    h3: {
      fontFamily: 'var(--font-mono), monospace',
      fontSize: '1.75rem',
      fontWeight: 700,
    },
    h4: {
      fontFamily: 'var(--font-mono), monospace',
      fontSize: '1.25rem',
      fontWeight: 700,
    },
    h5: {
      fontFamily: 'var(--font-mono), monospace',
      fontSize: '1.1rem',
      fontWeight: 600,
    },
    h6: {
      fontFamily: 'var(--font-mono), monospace',
      fontSize: '0.9rem',
      fontWeight: 600,
    },
    button: {
      fontFamily: 'var(--font-mono), monospace',
      textTransform: 'uppercase',
      fontWeight: 700,
      letterSpacing: '0.05em',
    },
  },
  shape: {
    borderRadius: 4, // More industrial/angular
  },
  shadows: [
    'none',
    '8px 12px 20px rgba(26, 35, 126, 0.4)', // The Shadow (Indigo)
    '12px 18px 30px rgba(26, 35, 126, 0.5)',
    '16px 24px 40px rgba(26, 35, 126, 0.6)',
    // Fill the rest with similar patterns or multiples
    ...Array(22).fill('16px 24px 40px rgba(26, 35, 126, 0.6)'),
  ] as any,
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#1B1C20',
          scrollbarColor: '#FFC107 transparent',
          '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
            width: 8,
            height: 8,
          },
          '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
            borderRadius: 0,
            backgroundColor: 'rgba(255, 193, 7, 0.2)',
            '&:hover': {
              backgroundColor: 'rgba(255, 193, 7, 0.4)',
            },
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 2,
          padding: '12px 24px',
          fontWeight: 800,
          boxShadow: '4px 4px 0 rgba(26, 35, 126, 0.8)',
          '&:hover': {
            transform: 'translate(-2px, -2px)',
            boxShadow: '6px 6px 0 rgba(26, 35, 126, 0.9)',
          },
          '&:active': {
            transform: 'translate(2px, 2px)',
            boxShadow: 'none',
          },
        },
        containedPrimary: {
          backgroundColor: '#FFC107',
          color: '#1B1C20',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#2D2421',
          border: '1px solid #3D3D3D',
          boxShadow: '8px 12px 20px rgba(26, 35, 126, 0.4)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(27, 28, 32, 0.8)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid #3D3D3D',
          boxShadow: 'none',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#1B1C20',
          borderRight: '1px solid #3D3D3D',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          margin: '4px 8px',
          borderRadius: 4,
          '&.Mui-selected': {
            backgroundColor: 'rgba(255, 193, 7, 0.1)',
            borderLeft: '4px solid #FFC107',
            '&:hover': {
              backgroundColor: 'rgba(255, 193, 7, 0.15)',
            },
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          boxShadow: '0px 4px 14px rgba(0, 0, 0, 0.15)',
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          height: 6,
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          fontWeight: 600,
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          borderRadius: 8,
          fontSize: '0.75rem',
        },
      },
    },
  },
});

export const lightTheme = createTheme(getDesignTokens('light'));
export const darkTheme = createTheme(getDesignTokens('dark'));

export default lightTheme;
