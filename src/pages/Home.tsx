import React from 'react';
import {
  Box,
  Button,
  Chip,
  Grid,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import ShareRoundedIcon from '@mui/icons-material/ShareRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import PlaylistCard from '../components/PlaylistCard';
import EditPlaylistDialog from '../components/EditPlaylistDialog';
import MatchCard from '../components/MatchCard';
import headphones from '../assets/headphones.jpg';
import { useAppData } from '../state/AppDataContext';
import { useNavigate, Link as RouterLink } from 'react-router-dom';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const {
    addSongToPlaylist,
    authenticated,
    createPlaylist,
    deletePlaylist,
    editPlaylist,
    likePlaylist,
    likePlaylistComment,
    matches,
    playPlaylist,
    playlists,
    reactToMatch,
    removeSongFromPlaylist,
    signIn,
    unmatch,
    user,
  } = useAppData();
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const editingPlaylist = editingId ? playlists.find((p) => p.id === editingId) ?? null : null;

  return (
    <Box>
      <Paper
        sx={{
          minHeight: { xs: 430, md: 470 },
          position: 'relative',
          overflow: 'hidden',
          p: { xs: 3, md: 5 },
          display: 'flex',
          alignItems: 'flex-end',
          color: '#fff',
          borderRadius: 2,
          backgroundImage: `linear-gradient(90deg, rgba(20, 12, 19, 0.82), rgba(20, 12, 19, 0.46), rgba(20, 12, 19, 0.1)), url(${headphones})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 42%',
        }}
      >
        <Box sx={{ maxWidth: 720, position: 'relative', zIndex: 1 }}>
          <Chip
            label="Listen. Share. Connect."
            sx={{ mb: 2, bgcolor: 'rgba(255,255,255,0.18)', color: '#fff', fontWeight: 900 }}
          />
          <Typography variant="h2" sx={{ fontSize: { xs: 42, md: 72 }, lineHeight: 0.95, mb: 2 }}>
            Find your next favorite person through a playlist.
          </Typography>
          <Typography variant="h6" sx={{ maxWidth: 610, color: 'rgba(255,255,255,0.84)', fontWeight: 600, mb: 3 }}>
            {authenticated
              ? `Welcome back, ${user?.displayName || 'Mixtape Listener'}. Pick up where the music left off.`
              : 'Sign in to start matching with listeners who share your taste.'}
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <Button
              variant="contained"
              size="large"
              startIcon={<PlayArrowRoundedIcon />}
              onClick={authenticated ? () => navigate('/playlists') : () => signIn()}
            >
              {authenticated ? 'Start listening' : 'Continue with Mixtape'}
            </Button>
            <Button
              component={RouterLink}
              to="/matches"
              variant="outlined"
              size="large"
              startIcon={<TuneRoundedIcon />}
              sx={{
                color: '#fff',
                borderColor: 'rgba(255,255,255,0.7)',
                '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.08)' },
              }}
            >
              Tune matches
            </Button>
          </Stack>
        </Box>
      </Paper>

      <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mt: 3, mb: 1.5 }}>
            <Box>
              <Typography variant="h4">Popular Playlists</Typography>
              <Typography color="text.secondary">Fresh mixes from people nearby and listeners with overlap.</Typography>
            </Box>
            <Button startIcon={<ShareRoundedIcon />} onClick={createPlaylist}>Create local mix</Button>
          </Stack>
          <Grid container spacing={2}>
            {playlists.map((playlist) => (
              <Grid key={playlist.id} size={{ xs: 12, sm: 6, lg: 3 }}>
                <PlaylistCard
                  playlist={playlist}
                  editable
                  onLike={likePlaylist}
                  onOpen={() => navigate(`/playlists?q=${encodeURIComponent(playlist.title)}`)}
                  onPlay={playPlaylist}
                  onDelete={deletePlaylist}
                  onEdit={() => setEditingId(playlist.id)}
                  onLikeComment={likePlaylistComment}
                />
              </Grid>
            ))}
          </Grid>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Paper
            sx={{
              mt: 3,
              p: 2.5,
              borderRadius: 3,
            }}
          >
            <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box>
                <Typography variant="h5">High-signal matches</Typography>
                <Typography variant="body2" color="text.secondary">Based on your match playlist.</Typography>
              </Box>
              <FavoriteRoundedIcon color="primary" />
            </Stack>
            <Stack spacing={1.5}>
              {matches.slice(0, 3).map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  onLike={(matchId) => reactToMatch(matchId, 'liked')}
                  onChat={() => navigate('/chat')}
                  onOpenPlaylist={() => navigate(`/playlists?q=${encodeURIComponent(match.playlist)}`)}
                  onUnmatch={unmatch}
                />
              ))}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
      <EditPlaylistDialog
        open={Boolean(editingPlaylist)}
        playlist={editingPlaylist}
        onClose={() => setEditingId(null)}
        onSaveDetails={(patch) => editingPlaylist && editPlaylist(editingPlaylist.id, patch)}
        onAddSong={(song) => editingPlaylist && addSongToPlaylist(editingPlaylist.id, song)}
        onRemoveSong={(index) => editingPlaylist && removeSongFromPlaylist(editingPlaylist.id, index)}
      />
    </Box>
  );
};

export default Home;
