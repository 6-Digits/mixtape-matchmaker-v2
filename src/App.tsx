import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import Layout from './components/Layout';
import { useAppData } from './state/AppDataContext';

const Home = lazy(() => import('./pages/Home'));
const Playlists = lazy(() => import('./pages/Playlists'));
const Matches = lazy(() => import('./pages/Matches'));
const Chat = lazy(() => import('./pages/Chat'));
const Login = lazy(() => import('./pages/Login'));
const About = lazy(() => import('./pages/About'));
const Credits = lazy(() => import('./pages/Credits'));

const PUBLIC_PATHS = new Set(['/login', '/about', '/credits']);

const Fallback: React.FC = () => (
  <Box sx={{ minHeight: '40vh', display: 'grid', placeItems: 'center' }}>
    <CircularProgress />
  </Box>
);

const RouteGate: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { authenticated, mode } = useAppData();
  const location = useLocation();

  if (mode === 'checking') {
    return (
      <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!authenticated && !PUBLIC_PATHS.has(location.pathname)) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <RouteGate>
              <Layout />
            </RouteGate>
          }
        >
          <Route index element={<Suspense fallback={<Fallback />}><Home /></Suspense>} />
          <Route path="playlists" element={<Suspense fallback={<Fallback />}><Playlists /></Suspense>} />
          <Route path="matches" element={<Suspense fallback={<Fallback />}><Matches /></Suspense>} />
          <Route path="chat" element={<Suspense fallback={<Fallback />}><Chat /></Suspense>} />
          <Route path="login" element={<Suspense fallback={<Fallback />}><Login /></Suspense>} />
          <Route path="about" element={<Suspense fallback={<Fallback />}><About /></Suspense>} />
          <Route path="credits" element={<Suspense fallback={<Fallback />}><Credits /></Suspense>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
