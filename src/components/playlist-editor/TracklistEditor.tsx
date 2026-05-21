import React from 'react';
import { Box, Chip, IconButton, Paper, Stack, Tooltip, Typography } from '@mui/material';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import KeyboardArrowUpRoundedIcon from '@mui/icons-material/KeyboardArrowUpRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import StopRoundedIcon from '@mui/icons-material/StopRounded';
import type { Song } from '../../data/demo';
import { previewKeyFor, type PreviewKey } from './preview';

type Props = {
  previewKey: PreviewKey | null;
  previewLoading: boolean;
  songs: Song[];
  onMoveSong: (fromIndex: number, toIndex: number) => void;
  onPreview: (song: Song) => void;
  onRemoveSong: (index: number) => void;
};

const TracklistEditor: React.FC<Props> = ({ previewKey, previewLoading, songs, onMoveSong, onPreview, onRemoveSong }) => (
  <>
    <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1.25 }}>
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 900, lineHeight: 1.1 }}>Tracklist</Typography>
        <Typography variant="body2" color="text.secondary">Preview, reorder, or remove songs.</Typography>
      </Box>
      <Chip size="small" label={`${songs.length} songs`} variant="outlined" />
    </Stack>
    <Paper
      variant="outlined"
      sx={{
        flex: 1,
        minHeight: 250,
        maxHeight: { xs: 340, md: 'calc(100vh - 430px)' },
        overflowY: 'auto',
        borderRadius: 2,
        mb: 2.5,
        bgcolor: 'background.paper',
      }}
    >
      {songs.map((song, index) => {
        const key = previewKeyFor(song);
        const isPlaying = previewKey === key;
        const isLoading = isPlaying && previewLoading;
        return (
          <Stack
            key={`${song.title}-${song.artist}-${index}`}
            direction="row"
            spacing={1}
            sx={{
              alignItems: 'center',
              px: { xs: 1, sm: 1.25 },
              py: 1,
              borderBottom: index < songs.length - 1 ? 1 : 0,
              borderColor: 'divider',
              bgcolor: isPlaying ? 'action.selected' : 'transparent',
              transition: 'background-color 120ms ease',
              '&:hover': { bgcolor: isPlaying ? 'action.selected' : 'action.hover' },
            }}
          >
            <Typography variant="caption" color="text.secondary" sx={{ width: 26, textAlign: 'center', fontWeight: 900 }}>
              {index + 1}
            </Typography>
            <Tooltip title={isPlaying ? 'Stop preview' : 'Preview'}>
              <IconButton
                size="small"
                color={isPlaying ? 'primary' : 'default'}
                onClick={() => onPreview(song)}
                aria-label={`Preview ${song.title}`}
                sx={{ bgcolor: isPlaying ? 'primary.main' : 'action.hover', color: isPlaying ? 'primary.contrastText' : undefined }}
              >
                {isPlaying ? <StopRoundedIcon fontSize="small" /> : <PlayArrowRoundedIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>
                {song.title}{isLoading ? ' · loading...' : ''}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {song.artist} · {song.duration}
              </Typography>
            </Box>
            <Stack direction="row" spacing={0.25} sx={{ alignItems: 'center' }}>
              <Tooltip title="Move up">
                <span>
                  <IconButton size="small" onClick={() => onMoveSong(index, index - 1)} disabled={index === 0} aria-label="Move up">
                    <KeyboardArrowUpRoundedIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title="Move down">
                <span>
                  <IconButton size="small" onClick={() => onMoveSong(index, index + 1)} disabled={index === songs.length - 1} aria-label="Move down">
                    <KeyboardArrowDownRoundedIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title="Remove">
                <IconButton size="small" color="error" onClick={() => onRemoveSong(index)} aria-label={`Remove ${song.title}`}>
                  <DeleteOutlineRoundedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>
        );
      })}
      {songs.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
          No songs yet. Search below to add one.
        </Typography>
      )}
    </Paper>
  </>
);

export default TracklistEditor;
