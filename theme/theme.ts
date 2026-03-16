'use client';

import { createTheme, ThemeOptions } from '@mui/material/styles';

const getDesignTokens = (): ThemeOptions => ({
  palette: {
    mode: 'dark',
    primary: {
      main: '#6366F1', // Electric Teal
      contrastText: '#000000',
    },
    secondary: {
      main: '#10B981', // Atomic Emerald
    },
    background: {
      default: '#0A0908', // Deep Void Ash
      paper: '#161412',   // Elevated Surface
    },
    text: {
      primary: '#F2F2F2',   // Titanium
      secondary: '#94A3B8', // Muted Slate
      disabled: '#404040',  // Carbon
    },
    divider: 'rgba(255, 255, 255, 0.08)', // Subtle Border
  },
  typography: {
    fontFamily: 'var(--font-satoshi), "Satoshi", sans-serif',
    h1: {
      fontFamily: 'var(--font-clash), "Clash Display", sans-serif',
      fontSize: '3.5rem',
      fontWeight: 900,
      letterSpacing: '-0.04em',
      color: '#F2F2F2',
    },
    h2: {
      fontFamily: 'var(--font-clash), "Clash Display", sans-serif',
      fontSize: '2.5rem',
      fontWeight: 900,
      letterSpacing: '-0.03em',
    },
    h3: {
      fontFamily: 'var(--font-clash), "Clash Display", sans-serif',
      fontSize: '2rem',
      fontWeight: 900,
      letterSpacing: '-0.02em',
    },
    h4: {
      fontFamily: 'var(--font-clash), "Clash Display", sans-serif',
      fontSize: '1.5rem',
      fontWeight: 900,
    },
    subtitle1: {
      fontSize: '1.1rem',
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      color: '#A1A1AA',
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      fontWeight: 400,
    },
    caption: {
      fontSize: '0.75rem',
      fontWeight: 500,
      color: '#A1A1AA',
    },
    button: {
      fontFamily: 'var(--font-clash), "Clash Display", sans-serif',
      textTransform: 'none',
      fontWeight: 700,
      letterSpacing: '0.02em',
    },
  },
  shape: {
    borderRadius: 16,
  },
  shadows: [
    'none',
    '0px 2px 4px rgba(0,0,0,0.4)',
    '0px 4px 8px rgba(0,0,0,0.4)',
    '0px 8px 16px rgba(0,0,0,0.5)',
    '0px 12px 24px rgba(0,0,0,0.5)',
    '0px 16px 32px rgba(0,0,0,0.6)',
    '0px 20px 40px rgba(0,0,0,0.6)',
    '0px 24px 48px rgba(0,0,0,0.7)',
    '0px 28px 56px rgba(0,0,0,0.7)',
    '0px 32px 64px rgba(0,0,0,0.8)',
    ...Array(15).fill('0px 32px 64px rgba(0,0,0,0.8)')
  ] as any,
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#0A0908',
          backgroundImage: `radial-gradient(circle at 50% -20%, ${alpha('#6366F1', 0.12)} 0%, transparent 70%), 
                           linear-gradient(180deg, ${alpha('#161412', 0.4)} 0%, transparent 100%)`,
          backgroundAttachment: 'fixed',
          color: '#F2F2F2',
          fontFamily: 'var(--font-satoshi), "Satoshi", sans-serif',
          scrollbarColor: '#222222 transparent',
          '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
            width: 6,
            height: 6,
          },
          '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
            borderRadius: 12,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
            },
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          padding: '8px 20px',
          fontSize: '0.875rem',
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          textTransform: 'none',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 12px 24px -10px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
          },
          '&:active': {
            transform: 'scale(0.98)',
          },
        },
        contained: {
          border: '1px solid rgba(255, 255, 255, 0.1)',
          '&:hover': {
            border: '1px solid rgba(255, 255, 255, 0.3)',
          }
        },
        containedPrimary: {
          backgroundColor: '#6366F1',
          color: '#FFFFFF',
          border: 'none',
          backgroundImage: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
          boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
          '&:hover': {
            backgroundColor: '#00D1DB',
            boxShadow: '0 20px 40px rgba(99, 102, 241, 0.4), inset 0 1px 0 rgba(255,255,255,0.3)',
          },
        },
        outlined: {
          borderColor: 'rgba(255, 255, 255, 0.1)',
          color: '#F2F2F2',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderColor: 'rgba(255, 255, 255, 0.3)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          fontWeight: 600,
          fontSize: '0.75rem',
        },
        filled: {
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          }
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '12px',
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            transition: 'all 0.2s',
            '& fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.1)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.2)',
            },
            '&.Mui-focused fieldset': {
              borderColor: 'rgba(99, 102, 241, 0.5)',
              borderWidth: '1px',
            },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(22, 20, 18, 0.98)',
          backgroundImage: 'none',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.03)',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 32,
          backgroundColor: 'rgba(22, 20, 18, 0.99)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 48px 96px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255,255,255,0.05)',
        },
      },
    },
  },
});

export const darkTheme = createTheme(getDesignTokens());
export const lightTheme = darkTheme; // No light mode

export default darkTheme;

