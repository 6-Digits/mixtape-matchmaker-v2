import React, { useMemo, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardMedia,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import ChatBubbleRoundedIcon from '@mui/icons-material/ChatBubbleRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import HeartBrokenRoundedIcon from '@mui/icons-material/HeartBrokenRounded';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import MusicNoteRoundedIcon from '@mui/icons-material/MusicNoteRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import QueueMusicRoundedIcon from '@mui/icons-material/QueueMusicRounded';
import { useNavigate } from 'react-router-dom';
import { useAppData } from '../state/AppDataContext';
import type { Match, Playlist } from '../data/demo';

const Discover: React.FC = () => {
  const {
    discoverMatches,
    likedYouMatches,
    waitingMatches,
    likePerson,
    passPerson,
    likesRemaining,
    likeQuota,
    playPlaylist,
    playlists,
  } = useAppData();
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const allVisibleProfiles = useMemo(
    () => [...likedYouMatches, ...discoverMatches, ...waitingMatches],
    [discoverMatches, likedYouMatches, waitingMatches],
  );
  const selectedProfile = selectedId ? allVisibleProfiles.find((person) => person.id === selectedId) ?? null : null;
  const selectedPlaylist = selectedProfile ? findProfilePlaylist(playlists, selectedProfile) : null;

  const playMatchPlaylist = (person: Match, index = 0) => {
    const playlist = findProfilePlaylist(playlists, person);
    if (playlist) void playPlaylist(playlist, index);
  };

  return (
    <Box>
      <Paper
        variant="outlined"
        sx={{
          p: { xs: 2.5, md: 3 },
          mb: 3,
          borderRadius: 2,
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1fr auto' },
          gap: 2,
          alignItems: 'center',
          bgcolor: 'background.paper',
        }}
      >
        <Box>
          <Typography variant="h3">Discover</Typography>
          <Typography color="text.secondary" sx={{ maxWidth: 760 }}>
            Match through the playlist first. Open a profile to hear their songs, read the vibe, then decide.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
          <Chip color="primary" variant="outlined" label={`${likesRemaining}/${likeQuota} likes today`} sx={{ fontWeight: 800 }} />
          <Chip icon={<QueueMusicRoundedIcon />} label={`${discoverMatches.length} profiles`} variant="outlined" />
        </Stack>
      </Paper>

      {likedYouMatches.length > 0 && (
        <ProfileSection
          title="Likes you"
          subtitle="They already liked your taste. Like back to unlock chat."
          profiles={likedYouMatches}
          playlists={playlists}
          highlight
          onLike={likePerson}
          onOpen={setSelectedId}
          onPass={passPerson}
          onPlay={playMatchPlaylist}
        />
      )}

      {waitingMatches.length > 0 && (
        <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 2 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1.5 }}>
            <ChatBubbleRoundedIcon color="secondary" />
            <Typography variant="h6">Sent likes</Typography>
            <Chip size="small" variant="outlined" label={waitingMatches.length} />
          </Stack>
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
            {waitingMatches.map((person) => (
              <Chip
                key={person.id}
                avatar={<Avatar src={person.image} />}
                label={`${person.name} · ${person.playlist}`}
                onClick={() => setSelectedId(person.id)}
                onDelete={() => passPerson(person.id)}
              />
            ))}
          </Stack>
        </Paper>
      )}

      {discoverMatches.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }} variant="outlined">
          <Typography variant="h6" sx={{ mb: 1 }}>You're caught up.</Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            New profiles will appear here as more listeners join.
          </Typography>
          <Button variant="outlined" onClick={() => navigate('/matches')}>See your matches</Button>
        </Paper>
      ) : (
        <ProfileSection
          title="For you"
          subtitle="These profiles are ranked by overlap between your taste and their featured playlist."
          profiles={discoverMatches}
          playlists={playlists}
          onLike={likePerson}
          onOpen={setSelectedId}
          onPass={passPerson}
          onPlay={playMatchPlaylist}
        />
      )}

      <ProfileDialog
        open={Boolean(selectedProfile)}
        person={selectedProfile}
        playlist={selectedPlaylist}
        onClose={() => setSelectedId(null)}
        onLike={likePerson}
        onPass={passPerson}
        onPlay={(index) => {
          if (selectedPlaylist) void playPlaylist(selectedPlaylist, index);
        }}
      />
    </Box>
  );
};

type ProfileSectionProps = {
  title: string;
  subtitle: string;
  profiles: Match[];
  playlists: Playlist[];
  highlight?: boolean;
  onLike: (id: string) => void;
  onOpen: (id: string) => void;
  onPass: (id: string) => void;
  onPlay: (person: Match, index?: number) => void;
};

const ProfileSection: React.FC<ProfileSectionProps> = ({ title, subtitle, profiles, playlists, highlight, onLike, onOpen, onPass, onPlay }) => (
  <Box sx={{ mb: 3 }}>
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ alignItems: { sm: 'end' }, justifyContent: 'space-between', mb: 1.5 }}>
      <Box>
        <Typography variant="h5">{title}</Typography>
        <Typography variant="body2" color="text.secondary">{subtitle}</Typography>
      </Box>
      <Chip size="small" variant="outlined" label={`${profiles.length} profiles`} />
    </Stack>
    <Grid container spacing={2}>
      {profiles.map((person) => (
        <Grid key={person.id} size={{ xs: 12, sm: 6, lg: 4, xl: 3 }}>
          <ProfileCard
            person={person}
            playlist={findProfilePlaylist(playlists, person)}
            highlight={highlight}
            onLike={onLike}
            onOpen={onOpen}
            onPass={onPass}
            onPlay={onPlay}
          />
        </Grid>
      ))}
    </Grid>
  </Box>
);

type ProfileCardProps = {
  person: Match;
  playlist: Playlist | null;
  highlight?: boolean;
  onLike: (id: string) => void;
  onOpen: (id: string) => void;
  onPass: (id: string) => void;
  onPlay: (person: Match, index?: number) => void;
};

const ProfileCard: React.FC<ProfileCardProps> = ({ person, playlist, highlight, onLike, onOpen, onPass, onPlay }) => {
  const topSongs = playlist?.songs.slice(0, 3) ?? [];

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        border: highlight ? 2 : 1,
        borderColor: highlight ? 'primary.main' : 'divider',
        '&:hover': { transform: 'translateY(-4px)', boxShadow: 5 },
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <CardMedia image={playlist?.image || person.image} title={person.playlist} sx={{ height: 132 }} />
        <Avatar
          src={person.image}
          sx={{
            position: 'absolute',
            left: 16,
            bottom: -28,
            width: 72,
            height: 72,
            border: 3,
            borderColor: 'background.paper',
            borderRadius: 3,
          }}
          variant="rounded"
        />
      </Box>
      <Stack spacing={1.25} sx={{ p: 2, pt: 4.5, flex: 1 }}>
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'start', gap: 1 }}>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h6" noWrap>{person.name}</Typography>
            <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', color: 'text.secondary' }}>
              <LocationOnRoundedIcon sx={{ fontSize: 15 }} />
              <Typography variant="caption" noWrap>{person.location || 'Nearby'}</Typography>
            </Stack>
          </Box>
          <Chip size="small" color="primary" label={`${person.score}%`} sx={{ fontWeight: 900 }} />
        </Stack>
        <LinearProgress variant="determinate" value={person.score} sx={{ height: 5, borderRadius: 99 }} />
        <Typography variant="body2" color="text.secondary" sx={{ minHeight: 42 }}>
          {person.bio || person.taste}
        </Typography>
        <Box>
          <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', mb: 0.75 }}>
            <MusicNoteRoundedIcon color="primary" sx={{ fontSize: 18 }} />
            <Typography variant="subtitle2" noWrap>{person.playlist}</Typography>
          </Stack>
          <Stack spacing={0.5}>
            {topSongs.map((song, index) => (
              <Stack key={`${person.id}-${song.title}`} direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <IconButton size="small" onClick={() => onPlay(person, index)} aria-label={`Play ${song.title}`}>
                  <PlayArrowRoundedIcon fontSize="small" />
                </IconButton>
                <Typography variant="caption" noWrap sx={{ flex: 1 }}>
                  {song.title} · {song.artist}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Box>
        <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap', gap: 0.75 }}>
          {(person.profileTags || person.taste.split(', ')).slice(0, 3).map((tag) => (
            <Chip key={`${person.id}-${tag}`} size="small" label={tag} variant="outlined" />
          ))}
        </Stack>
      </Stack>
      <Stack direction="row" spacing={1} sx={{ p: 2, pt: 0 }}>
        <Button fullWidth variant="outlined" onClick={() => onOpen(person.id)}>Profile</Button>
        <Button variant="outlined" color="error" onClick={() => onPass(person.id)} aria-label={`Pass ${person.name}`}>
          <HeartBrokenRoundedIcon />
        </Button>
        <Button variant="contained" onClick={() => onLike(person.id)} aria-label={`Like ${person.name}`}>
          <FavoriteRoundedIcon />
        </Button>
      </Stack>
    </Card>
  );
};

type ProfileDialogProps = {
  open: boolean;
  person: Match | null;
  playlist: Playlist | null;
  onClose: () => void;
  onLike: (id: string) => void;
  onPass: (id: string) => void;
  onPlay: (index: number) => void;
};

const ProfileDialog: React.FC<ProfileDialogProps> = ({ open, person, playlist, onClose, onLike, onPass, onPlay }) => {
  if (!person) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth slotProps={{ paper: { sx: { borderRadius: 2, overflow: 'hidden' } } }}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h5" noWrap>{person.name}</Typography>
          <Typography variant="body2" color="text.secondary" noWrap>
            {person.location || 'Nearby'} · {person.score}% playlist match
          </Typography>
        </Box>
        <IconButton onClick={onClose} aria-label="Close profile">
          <CloseRoundedIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 0 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={0}>
          <Box sx={{ width: { xs: '100%', md: 300 }, p: 2.5, bgcolor: 'background.paper', borderRight: { md: 1 }, borderColor: 'divider' }}>
            <Box
              sx={{
                aspectRatio: '1 / 1',
                borderRadius: 2,
                backgroundImage: `url(${person.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                mb: 2,
              }}
            />
            <Typography variant="body1" sx={{ fontWeight: 800, mb: 0.75 }}>{person.favoriteTrack || playlist?.songs[0]?.title || person.playlist}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{person.bio || person.taste}</Typography>
            <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap', gap: 0.75 }}>
              {(person.profileTags || person.taste.split(', ')).map((tag) => (
                <Chip key={`dialog-${person.id}-${tag}`} size="small" label={tag} variant="outlined" />
              ))}
            </Stack>
          </Box>
          <Box sx={{ p: 2.5, flex: 1, minWidth: 0 }}>
            <Typography variant="h6" sx={{ mb: 0.5 }}>Matched by playlist</Typography>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              {person.lookingFor || 'Open to trading songs and seeing where the conversation goes.'}
            </Typography>
            {playlist ? (
              <Paper variant="outlined" sx={{ overflow: 'hidden', borderRadius: 2 }}>
                <Box sx={{ p: 1.5, display: 'flex', gap: 1.5, alignItems: 'center', borderBottom: 1, borderColor: 'divider' }}>
                  <Avatar src={playlist.image} variant="rounded" sx={{ width: 54, height: 54, borderRadius: 1.5 }} />
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 900 }} noWrap>{playlist.title}</Typography>
                    <Typography variant="caption" color="text.secondary" noWrap>{playlist.description}</Typography>
                  </Box>
                  <Button variant="contained" startIcon={<PlayArrowRoundedIcon />} onClick={() => onPlay(0)}>
                    Play
                  </Button>
                </Box>
                <Stack>
                  {playlist.songs.slice(0, 8).map((song, index) => (
                    <Stack
                      key={`${person.id}-dialog-${song.title}-${index}`}
                      direction="row"
                      spacing={1}
                      sx={{ alignItems: 'center', px: 1.5, py: 1, borderBottom: index < Math.min(playlist.songs.length, 8) - 1 ? 1 : 0, borderColor: 'divider' }}
                    >
                      <Typography variant="caption" color="text.secondary" sx={{ width: 22, textAlign: 'center', fontWeight: 900 }}>
                        {index + 1}
                      </Typography>
                      <IconButton size="small" onClick={() => onPlay(index)} aria-label={`Play ${song.title}`}>
                        <PlayArrowRoundedIcon fontSize="small" />
                      </IconButton>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 800 }} noWrap>{song.title}</Typography>
                        <Typography variant="caption" color="text.secondary" noWrap>{song.artist} · {song.album}</Typography>
                      </Box>
                    </Stack>
                  ))}
                </Stack>
              </Paper>
            ) : (
              <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                <Typography color="text.secondary">Their playlist is not available locally yet.</Typography>
              </Paper>
            )}
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 2.5, py: 1.5 }}>
        <Button color="error" startIcon={<HeartBrokenRoundedIcon />} onClick={() => onPass(person.id)}>Pass</Button>
        <Button variant="contained" startIcon={<FavoriteRoundedIcon />} onClick={() => onLike(person.id)}>
          {person.theyLikedYou && !person.youLiked ? 'Like back' : 'Like'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

function findProfilePlaylist(playlists: Playlist[], person: Match) {
  return playlists.find((playlist) => playlist.title === person.playlist)
    || playlists.find((playlist) => playlist.owner === person.name)
    || null;
}

export default Discover;
