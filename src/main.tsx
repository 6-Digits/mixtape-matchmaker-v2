import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useMemo } from 'react';
import App from './App.tsx';
import createAppTheme from './theme/theme.ts';
import { AppDataProvider, useAppData } from './state/AppDataContext.tsx';

const ThemedApp = () => {
  const { themeMode } = useAppData();
  const theme = useMemo(() => createAppTheme(themeMode), [themeMode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppDataProvider>
      <ThemedApp />
    </AppDataProvider>
  </StrictMode>,
);
