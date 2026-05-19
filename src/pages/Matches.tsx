import React, { useState } from 'react';
import {
  Box,
  Button,
  Collapse,
  Grid,
  Paper,
  Stack,
  Switch,
  Typography,
} from '@mui/material';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import HeartBrokenRoundedIcon from '@mui/icons-material/HeartBrokenRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import MatchCard from '../components/MatchCard';
import connect from '../assets/connect.jpg';
import { useAppData } from '../state/AppDataContext';
import { useNavigate } from 'react-router-dom';

const Matches: React.FC = () => {
  const { matches, reactToMatch, unmatch, resetMatches } = useAppData();
  const navigate = useNavigate();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sharedArtists, setSharedArtists] = useState(true);
  const [nearbyListeners, setNearbyListeners] = useState(false);
  const featured = matches.find((match) => match.status !== 'passed');

  return (
    <Box>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ justifyContent: 'space-between', mb: 2.5 }}>
        <Box>
          <Typography variant="h3">Matches</Typography>
          <Typography color="text.secondary">Swipe less, listen more. These profiles overlap with your current match playlist.</Typography>
        </Box>
        <Button variant="outlined" startIcon={<TuneRoundedIcon />} onClick={() => setSettingsOpen((value) => !value)}>Match settings</Button>
      </Stack>

      <Collapse in={settingsOpen}>
        <Paper sx={{ p: 3, mb: 3, borderRadius: 3, boxShadow: 2 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h6">Match preferences</Typography>
              <Typography variant="body2" color="text.secondary">
                Adjust these settings to find better music matches.
              </Typography>
            </Box>
            <Stack direction="row" spacing={3}>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>Shared artists</Typography>
                <Switch checked={sharedArtists} onChange={(event) => setSharedArtists(event.target.checked)} color="primary" />
              </Stack>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>Nearby</Typography>
                <Switch checked={nearbyListeners} onChange={(event) => setNearbyListeners(event.target.checked)} color="secondary" />
              </Stack>
            </Stack>
          </Stack>
        </Paper>
      </Collapse>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper
            sx={{
              minHeight: 520,
              p: 4,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              color: '#fff',
              borderRadius: 4,
              boxShadow: 4,
              backgroundImage: `linear-gradient(180deg, rgba(19,13,18,0.1) 0%, rgba(19,13,18,0.6) 50%, rgba(19,13,18,0.95) 100%), url(${connect})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <Typography variant="overline" sx={{ fontWeight: 900, color: 'rgba(255,255,255,0.78)', letterSpacing: 1 }}>
              Featured match
            </Typography>
            <Typography variant="h3" sx={{ mb: 1 }}>
              {featured ? `${featured.name}, ${featured.score}%` : 'No more matches'}
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.86)', mb: 2 }}>
              {featured
                ? `You both lean on ${featured.taste.split(',').slice(0, 2).join(' and ') || 'similar artists'}.`
                : 'You have gone through all your current matches.'}
            </Typography>
            <Stack direction="row" spacing={1}>
              {featured ? (
                <>
                  <Button
                    variant="contained"
                    startIcon={<FavoriteRoundedIcon />}
                    onClick={() => reactToMatch(featured.id, 'liked')}
                  >
                    Like
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<HeartBrokenRoundedIcon />}
                    onClick={() => reactToMatch(featured.id, 'passed')}
                    sx={{
                      color: '#fff',
                      borderColor: 'rgba(255,255,255,0.65)',
                      '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.08)' },
                    }}
                  >
                    Pass
                  </Button>
                </>
              ) : (
                <Button variant="contained" onClick={resetMatches}>
                  Refresh Matches
                </Button>
              )}
            </Stack>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 7 }}>
          <Grid container spacing={2}>
            {matches.map((match) => (
              <Grid key={match.id} size={{ xs: 12, lg: 6 }}>
                <MatchCard
                  match={match}
                  onLike={(matchId) => reactToMatch(matchId, 'liked')}
                  onChat={() => navigate('/chat')}
                  onOpenPlaylist={() => navigate(`/playlists?q=${encodeURIComponent(match.playlist)}`)}
                  onUnmatch={unmatch}
                />
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Matches;
