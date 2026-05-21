import React, { useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Chip,
  Collapse,
  Grid,
  Paper,
  Stack,
  Switch,
  Typography,
} from '@mui/material';
import HeartBrokenRoundedIcon from '@mui/icons-material/HeartBrokenRounded';
import ChatBubbleRoundedIcon from '@mui/icons-material/ChatBubbleRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import MatchCard from '../components/MatchCard';
import ProfileEditorDialog from '../components/ProfileEditorDialog';
import connect from '../assets/connect.jpg';
import { useAppData } from '../state/AppDataContext';
import { useNavigate } from 'react-router-dom';

const Matches: React.FC = () => {
  const { mutualMatches, unmatch, updateUserProfile, user } = useAppData();
  const navigate = useNavigate();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [sharedArtists, setSharedArtists] = useState(true);
  const [nearbyListeners, setNearbyListeners] = useState(false);
  const matches = mutualMatches;
  const featured = matches[0];
  const resetMatches = () => navigate('/discover');

  return (
    <Box>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ justifyContent: 'space-between', mb: 2.5 }}>
        <Box>
          <Typography variant="h3">Matches</Typography>
          <Typography color="text.secondary">Swipe less, listen more. These profiles overlap with your current match playlist.</Typography>
        </Box>
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
          <Button size="small" variant="contained" startIcon={<PersonRoundedIcon />} onClick={() => setProfileOpen(true)}>Edit profile</Button>
          <Button size="small" variant="outlined" startIcon={<TuneRoundedIcon />} onClick={() => setSettingsOpen((value) => !value)}>Match settings</Button>
        </Stack>
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
          <Paper sx={{ p: 3, mb: 3, borderRadius: 1, border: 1, borderColor: 'divider' }}>
            <Stack spacing={2}>
              <Stack direction="row" sx={{ justifyContent: 'space-between', gap: 2, alignItems: 'flex-start' }}>
                <Stack direction="row" spacing={1.5} sx={{ minWidth: 0 }}>
                  <Avatar src={user?.image} sx={{ width: 56, height: 56, fontWeight: 900 }}>
                    {user?.displayName?.[0] || 'M'}
                  </Avatar>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 900 }}>Your profile</Typography>
                    <Typography variant="h5" noWrap>{user?.displayName || 'Mock Listener'}</Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>{user?.location || 'Add a location'}</Typography>
                  </Box>
                </Stack>
                <Button size="small" variant="outlined" startIcon={<EditRoundedIcon />} onClick={() => setProfileOpen(true)}>
                  Edit
                </Button>
              </Stack>
              <Typography variant="body2">
                {user?.bio || 'Add a short bio so matches understand the person behind the playlist.'}
              </Typography>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800 }}>Taste</Typography>
                <Typography variant="body2">{user?.taste || 'Add artists and genres you care about.'}</Typography>
              </Box>
              <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap', gap: 0.75 }}>
                {(user?.profileTags?.length ? user.profileTags : ['Edit profile', 'Add tags']).map((tag) => (
                  <Chip key={tag} size="small" label={tag} variant="outlined" />
                ))}
              </Stack>
            </Stack>
          </Paper>
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
                : 'No matches yet. Head to Discover to start liking profiles.'}
            </Typography>
            <Stack direction="row" spacing={1}>
              {featured ? (
                <>
                  <Button
                    variant="contained"
                    startIcon={<ChatBubbleRoundedIcon />}
                    onClick={() => navigate(`/chat?match=${featured.id}`)}
                  >
                    Open chat
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<HeartBrokenRoundedIcon />}
                    onClick={() => unmatch(featured.id)}
                    sx={{
                      color: '#fff',
                      borderColor: 'rgba(255,255,255,0.65)',
                      '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.08)' },
                    }}
                  >
                    Unmatch
                  </Button>
                </>
              ) : (
                <Button variant="contained" onClick={resetMatches}>
                  Open Discover
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
                  onChat={() => navigate(`/chat?match=${match.id}`)}
                  onOpenPlaylist={() => navigate(`/playlists?q=${encodeURIComponent(match.playlist)}`)}
                  onUnmatch={unmatch}
                />
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
      <ProfileEditorDialog
        open={profileOpen}
        user={user}
        onClose={() => setProfileOpen(false)}
        onSave={updateUserProfile}
      />
    </Box>
  );
};

export default Matches;
