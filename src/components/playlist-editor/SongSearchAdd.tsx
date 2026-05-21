import React from 'react';
import { Autocomplete, Box, Button, IconButton, Paper, Stack, TextField, Tooltip, Typography } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import LibraryMusicRoundedIcon from '@mui/icons-material/LibraryMusicRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import StopRoundedIcon from '@mui/icons-material/StopRounded';
import type { Song } from '../../data/demo';
import type { SongHit } from '../../services/musicApi';
import { previewKeyFor, type PreviewKey } from './preview';

type Props = {
  options: SongHit[];
  previewKey: PreviewKey | null;
  query: string;
  searching: boolean;
  selected: SongHit | null;
  onAddSong: (song: Song) => void;
  onPreview: (song: SongHit) => void;
  onQueryChange: (query: string) => void;
  onResetSearch: () => void;
  onSelectedChange: (song: SongHit | null) => void;
};

function songFromHit(hit: SongHit): Song {
  return {
    title: hit.title,
    artist: hit.artist,
    album: hit.album,
    year: hit.year,
    duration: hit.duration,
  };
}

const SongSearchAdd: React.FC<Props> = ({
  options,
  previewKey,
  query,
  searching,
  selected,
  onAddSong,
  onPreview,
  onQueryChange,
  onResetSearch,
  onSelectedChange,
}) => {
  const selectedIsPlaying = selected && previewKey === previewKeyFor(selected);

  const handleAddSelected = () => {
    if (!selected) return;
    onAddSong(songFromHit(selected));
    onResetSearch();
  };

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 1.5,
        borderRadius: 2,
        bgcolor: 'background.paper',
      }}
    >
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1.25 }}>
        <Box
          sx={{
            width: 34,
            height: 34,
            borderRadius: 1.25,
            display: 'grid',
            placeItems: 'center',
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
          }}
        >
          <LibraryMusicRoundedIcon fontSize="small" />
        </Box>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 900, lineHeight: 1.1 }}>Add a song</Typography>
          <Typography variant="caption" color="text.secondary">Search real tracks, preview, then add.</Typography>
        </Box>
      </Stack>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ alignItems: { sm: 'flex-start' } }}>
        <Autocomplete
          fullWidth
          value={selected}
          onChange={(_, value) => onSelectedChange(value)}
          inputValue={query}
          onInputChange={(_, value, reason) => {
            if (reason !== 'reset') onQueryChange(value);
          }}
          options={options}
          loading={searching}
          filterOptions={(x) => x}
          getOptionLabel={(option) => `${option.title} - ${option.artist}`}
          isOptionEqualToValue={(a, b) => a.key === b.key}
          noOptionsText={query.trim().length < 2 ? 'Type to search songs' : searching ? 'Searching...' : 'No songs found'}
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
        {selected && (
          <Tooltip title={selectedIsPlaying ? 'Stop preview' : 'Preview selection'}>
            <IconButton
              onClick={() => onPreview(selected)}
              sx={{
                alignSelf: 'center',
                bgcolor: selectedIsPlaying ? 'primary.main' : 'action.hover',
                color: selectedIsPlaying ? 'primary.contrastText' : undefined,
                '&:hover': { bgcolor: selectedIsPlaying ? 'primary.dark' : 'action.selected' },
              }}
              aria-label="Preview selection"
            >
              {selectedIsPlaying ? <StopRoundedIcon /> : <PlayArrowRoundedIcon />}
            </IconButton>
          </Tooltip>
        )}
        <Button
          variant="contained"
          startIcon={<AddRoundedIcon />}
          onClick={handleAddSelected}
          disabled={!selected}
          sx={{ alignSelf: { sm: 'flex-start' }, mt: { xs: 0, sm: 0.25 } }}
        >
          Add
        </Button>
      </Stack>
    </Paper>
  );
};

export default SongSearchAdd;
