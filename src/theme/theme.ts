import { createTheme, alpha } from '@mui/material/styles';
import type { PaletteMode } from '@mui/material';

export const createAppTheme = (mode: PaletteMode) => createTheme({
  palette: {
    mode,
    primary: {
      main: '#ec407a',
      dark: '#a91f54',
    },
    secondary: {
      main: '#1f8a8a',
    },
    text: {
      primary: mode === 'dark' ? '#fff7fb' : '#241923',
      secondary: mode === 'dark' ? '#d7c7d2' : '#6c5f6b',
    },
    background: {
      default: mode === 'dark' ? '#140c13' : '#fcf9f6',
      paper: mode === 'dark' ? '#1c131b' : '#ffffff',
    },
    divider: mode === 'dark' ? alpha('#ffffff', 0.08) : alpha('#000000', 0.08),
  },
  shape: {
    borderRadius: 16,
  },
  typography: {
    fontFamily: '"Inter", "Avenir Next", "Helvetica Neue", Arial, sans-serif',
    h1: { fontWeight: 800, letterSpacing: '-0.02em' },
    h2: { fontWeight: 800, letterSpacing: '-0.015em' },
    h3: { fontWeight: 800, letterSpacing: '-0.01em' },
    h4: { fontWeight: 800, letterSpacing: '-0.005em' },
    h5: { fontWeight: 800, letterSpacing: 0 },
    h6: { fontWeight: 800, letterSpacing: 0 },
    button: { fontWeight: 700, textTransform: 'none', letterSpacing: '0.01em' },
    subtitle1: { fontWeight: 600 },
    subtitle2: { fontWeight: 600 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          minHeight: 36,
          padding: '6px 14px',
          boxShadow: 'none',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: mode === 'dark' ? '0 4px 12px rgba(0,0,0,0.4)' : '0 4px 12px rgba(0,0,0,0.1)',
          },
        },
        sizeSmall: {
          minHeight: 30,
          padding: '4px 10px',
        },
        sizeLarge: {
          minHeight: 44,
          padding: '8px 18px',
        },
        contained: {
          fontWeight: 800,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          borderRadius: 20,
          boxShadow: mode === 'dark' 
            ? '0 8px 24px rgba(0,0,0,0.4)' 
            : '0 8px 24px rgba(0,0,0,0.06)',
          border: `1px solid ${mode === 'dark' ? alpha('#ffffff', 0.05) : alpha('#000000', 0.05)}`,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 700,
        },
      },
    },
  },
});

export default createAppTheme;
