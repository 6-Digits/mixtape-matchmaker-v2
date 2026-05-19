import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import type { Playlist, Song } from '../data/demo';
import { searchSongs, type SongHit } from '../services/songSearch';

type Props = {
  open: boolean;
  playlist: Playlist | null;
  onClose: () => void;
  onSaveDetails: (patch: { title?: string; description?: string }) => void;
  onAddSong: (song: Song) => void;
  onRemoveSong: (index: number) => void;
};

const EditPlaylistDialog: React.FC<Props> = ({ open, playlist, onClose, onSaveDetails, onAddSong, onRemoveSong }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [query, setQuery] = useState('');
  const [options, setOptions] = useState<SongHit[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<SongHit | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (playlist) {
      setTitle(playlist.title);
      setDescription(playlist.description);
      setQuery('');
      setOptions([]);
      setSelected(null);
    }
  }, [playlist?.id, open]);

  useEffect(() => {
    if (!open) return;
    const trimmed = query.trim();
    if (trimmed.length < 2 || selected?.title?.toLowerCase() === trimmed.toLowerCase()) {
      setOptions([]);
      setSearching(false);
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setSearching(true);

    const handle = window.setTimeout(async () => {
      try {
        const hits = await searchSongs(trimmed, controller.signal);
        if (!controller.signal.aborted) {
          setOptions(hits);
          setSearching(false);
        }
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          setSearching(false);
        }
      }
    }, 250);

    return () => {
      window.clearTimeout(handle);
      controller.abort();
    };
  }, [query, open, selected]);

  const handleAddSelected = () => {
    if (!selected) return;
    onAddSong({
      title: selected.title,
      artist: selected.artist,
      album: selected.album,
      year: selected.year,
      duration: selected.duration,
    });
    setSelected(null);
    setQuery('');
    setOptions([]);
  };

  const detailsChanged = useMemo(() => {
    if (!playlist) return false;
    return title.trim() !== playlist.title || description.trim() !== playlist.description;
  }, [playlist, title, description]);

  if (!playlist) return null;

  const handleSave = () => {
    if (detailsChanged) {
      onSaveDetails({ title: title.trim() || playlist.title, description: description.trim() });
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit playlist</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <TextField
            label="Title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            fullWidth
          />
          <TextField
            label="Description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            fullWidth
            multiline
            minRows={2}
          />

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Songs ({playlist.songs.length})</Typography>
            <Stack spacing={0.5} sx={{ maxHeight: 220, overflowY: 'auto', pr: 1 }}>
              {playlist.songs.map((song, index) => (
                <Stack
                  key={`${song.title}-${song.artist}-${index}`}
                  direction="row"
                  spacing={1}
                  sx={{ alignItems: 'center', borderBottom: 1, borderColor: 'divider', py: 0.5 }}
                >
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>{song.title}</Typography>
                    <Typography variant="caption" color="text.secondary" noWrap>{song.artist} · {song.duration}</Typography>
                  </Box>
                  <IconButton size="small" color="error" onClick={() => onRemoveSong(index)} aria-label={`Remove ${song.title}`}>
                    <DeleteOutlineRoundedIcon fontSize="small" />
                  </IconButton>
                </Stack>
              ))}
              {playlist.songs.length === 0 && (
                <Typography variant="body2" color="text.secondary">No songs yet. Search below to add one.</Typography>
              )}
            </Stack>
          </Box>

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Add a song</Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
              <Autocomplete
                fullWidth
                value={selected}
                onChange={(_, value) => setSelected(value)}
                inputValue={query}
                onInputChange={(_, value, reason) => {
                  if (reason !== 'reset') setQuery(value);
                }}
                options={options}
                loading={searching}
                filterOptions={(x) => x}
                getOptionLabel={(option) => `${option.title} — ${option.artist}`}
                isOptionEqualToValue={(a, b) => a.key === b.key}
                noOptionsText={query.trim().length < 2 ? 'Type to search songs' : searching ? 'Searching…' : 'No songs found'}
                renderOption={(props, option) => (
                  <li {...props} key={option.key}>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>{option.title}</Typography>
                      <Typography variant="caption" color="text.secondary" noWrap>
                        {option.artist} · {option.album} · {option.duration}
                      </Typography>
                    </Box>
                  </li>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    size="small"
                    label="Search for a song or artist"
                    placeholder="e.g. Pink + White"
                  />
                )}
              />
              <Button
                variant="contained"
                startIcon={<AddRoundedIcon />}
                onClick={handleAddSelected}
                disabled={!selected}
              >
                Add
              </Button>
            </Stack>
            {selected && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                Selected: {selected.title} — {selected.artist} ({selected.year})
              </Typography>
            )}
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button onClick={handleSave} variant="contained" disabled={!detailsChanged}>Save details</Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditPlaylistDialog;
