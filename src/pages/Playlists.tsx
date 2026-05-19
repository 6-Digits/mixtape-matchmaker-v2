import React, { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Grid,
  InputBase,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import PlaylistCard from '../components/PlaylistCard';
import EditPlaylistDialog from '../components/EditPlaylistDialog';
import { useAppData } from '../state/AppDataContext';
import { useSearchParams } from 'react-router-dom';

const Playlists: React.FC = () => {
  const {
    addSongToPlaylist,
    createPlaylist,
    deletePlaylist,
    editPlaylist,
    likePlaylist,
    likePlaylistComment,
    playPlaylist,
    playlists,
    removeSongFromPlaylist,
  } = useAppData();
  const [editingId, setEditingId] = useState<string | null>(null);
  const editingPlaylist = editingId ? playlists.find((p) => p.id === editingId) ?? null : null;
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [popularFirst, setPopularFirst] = useState(false);

  const visiblePlaylists = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const filtered = playlists.filter((playlist) => {
      if (!normalizedQuery) return true;
      return [
        playlist.title,
        playlist.description,
        playlist.owner,
        ...playlist.songs.flatMap((song) => [song.title, song.artist, song.album]),
      ].some((value) => value.toLowerCase().includes(normalizedQuery));
    });

    return popularFirst ? [...filtered].sort((a, b) => b.likes - a.likes) : filtered;
  }, [playlists, popularFirst, query]);

  return (
    <Box>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ justifyContent: 'space-between', mb: 2.5 }}>
        <Box>
          <Typography variant="h3">Playlists</Typography>
          <Typography color="text.secondary">Manage your mixtapes and browse public mixes worth saving.</Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant={popularFirst ? 'contained' : 'outlined'} startIcon={<FilterListRoundedIcon />} onClick={() => setPopularFirst((value) => !value)}>
            Popular first
          </Button>
          <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={createPlaylist}>New playlist</Button>
        </Stack>
      </Stack>

      <Paper
        variant="outlined"
        sx={{
          p: 1,
          mb: 2.5,
          display: 'flex',
          alignItems: 'center',
          borderColor: 'divider',
        }}
      >
        <Box sx={{ display: 'flex', px: 1 }}>
          <SearchRoundedIcon />
        </Box>
        <InputBase
          fullWidth
          placeholder="Search by playlist, song, artist, album, or owner"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setSearchParams(event.target.value ? { q: event.target.value } : {});
          }}
        />
      </Paper>

      <Grid container spacing={2}>
        {visiblePlaylists.map((playlist) => (
          <Grid key={playlist.id} size={{ xs: 12, sm: 6, md: 4, xl: 3 }}>
            <PlaylistCard
              playlist={playlist}
              editable
              onLike={likePlaylist}
              onOpen={() => setQuery(playlist.title)}
              onPlay={playPlaylist}
              onDelete={deletePlaylist}
              onEdit={() => setEditingId(playlist.id)}
              onLikeComment={likePlaylistComment}
            />
          </Grid>
        ))}
      </Grid>
      {visiblePlaylists.length === 0 && (
        <Paper variant="outlined" sx={{ p: 3, mt: 2, textAlign: 'center' }}>
          <Typography>No playlists match your search.</Typography>
        </Paper>
      )}
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

export default Playlists;
