import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import LoginRoundedIcon from '@mui/icons-material/LoginRounded';
import StorageRoundedIcon from '@mui/icons-material/StorageRounded';
import { useNavigate } from 'react-router-dom';
import { useAppData } from '../state/AppDataContext';
import logo from '../assets/logo.png';

const Login: React.FC = () => {
  const { authenticated, mode, signIn, signOut, user } = useAppData();
  const navigate = useNavigate();
  const isMock = mode !== 'server';
  const [displayName, setDisplayName] = useState(user?.displayName || 'Mock Listener');
  const [email, setEmail] = useState('mock@mixtape.local');

  const handleContinue = async () => {
    await signIn(isMock ? displayName : undefined);
    navigate('/');
  };

  const handleLogout = () => {
    signOut();
  };

  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 124px)',
        display: 'grid',
        placeItems: 'center',
      }}
    >
      <Paper
        variant="outlined"
        sx={{
          width: 'min(100%, 920px)',
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '0.9fr 1.1fr' },
          overflow: 'hidden',
          borderColor: 'divider',
          boxShadow: 6,
        }}
      >
        <Box
          sx={{
            p: { xs: 3, md: 5 },
            bgcolor: 'primary.main',
            color: '#fff',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: 420,
          }}
        >
          <Box component="img" src={logo} alt="Mixtape Matchmaker" sx={{ width: 94, height: 136, objectFit: 'contain' }} />
          <Box>
            <Typography variant="h3" sx={{ lineHeight: 0.98, mb: 1.5 }}>
              Your mixtapes are the account.
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.82)' }}>
              Sign in to save matches, edit your mixes, and pick up where you left off.
            </Typography>
          </Box>
        </Box>

        <Stack spacing={2.2} sx={{ p: { xs: 3, md: 5 }, justifyContent: 'center' }}>
          <Box>
            <Typography variant="h4">Sign in</Typography>
            <Typography color="text.secondary">
              {isMock ? 'Continue with a display name to start matching.' : 'Continue with your Mixtape account.'}
            </Typography>
          </Box>

          <Alert severity="info" icon={<StorageRoundedIcon />}>
            Your session lives only on this device.
          </Alert>

          <Stack spacing={1.5}>
            <TextField
              label="Display name"
              value={isMock ? displayName : 'Mixtape Listener'}
              onChange={(event) => setDisplayName(event.target.value)}
              disabled={!isMock}
              fullWidth
            />
            <TextField
              label="Email"
              value={isMock ? email : 'you@mixtape.app'}
              onChange={(event) => setEmail(event.target.value)}
              disabled={!isMock}
              fullWidth
            />
          </Stack>

          <Button size="large" variant="contained" startIcon={<LoginRoundedIcon />} onClick={handleContinue}>
            {isMock ? 'Continue' : 'Continue with Mixtape'}
          </Button>

          {authenticated && (
            <>
              <Divider />
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">
                  Current session: {user?.displayName || 'Mixtape Listener'}
                </Typography>
                <Button variant="outlined" color="primary" onClick={handleLogout}>
                  Logout
                </Button>
              </Stack>
            </>
          )}
        </Stack>
      </Paper>
    </Box>
  );
};

export default Login;
