import React from 'react';
import {
  Box,
  Button,
  IconButton,
  Slider,
  Tooltip,
  Typography,
  type Theme,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import MusicNoteRoundedIcon from '@mui/icons-material/MusicNoteRounded';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import SkipNextRoundedIcon from '@mui/icons-material/SkipNextRounded';
import SkipPreviousRoundedIcon from '@mui/icons-material/SkipPreviousRounded';
import type { NowPlaying } from '../../state/AppDataContext';

type Props = {
  nowPlaying: NowPlaying;
  theme: Theme;
  onNext: () => void;
  onPrevious: () => void;
  onSeek: (seconds: number) => void;
  onStop: () => void;
  onToggle: () => void;
};

function formatTime(seconds: number) {
  if (!isFinite(seconds) || seconds < 0) return '0:00';
  const total = Math.floor(seconds);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const NowPlayingBar: React.FC<Props> = ({ nowPlaying, theme, onNext, onPrevious, onSeek, onStop, onToggle }) => {
  const current = nowPlaying.songs[nowPlaying.index];
  const hasPrev = nowPlaying.index > 0;
  const hasNext = nowPlaying.index < nowPlaying.songs.length - 1;
  const duration = nowPlaying.duration || 0;
  const position = Math.min(nowPlaying.position, duration || nowPlaying.position);

  return (
    <Box
      data-testid="now-playing-bar"
      sx={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: theme.zIndex.appBar - 1,
        mx: 'auto',
        width: 'min(100%, 960px)',
        px: { xs: 1, sm: 2 },
        pt: { xs: 0.8, sm: 1.2 },
        pb: 'calc(env(safe-area-inset-bottom, 0px) + 8px)',
        display: 'flex',
        flexDirection: 'column',
        gap: 0.5,
        bgcolor: 'background.paper',
        border: `1px solid ${theme.palette.divider}`,
        borderBottom: 'none',
        borderRadius: '12px 12px 0 0',
        boxShadow: '0 -12px 32px rgba(0,0,0,0.18)',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.4, sm: 1.5 }, minWidth: 0 }}>
        <MusicNoteRoundedIcon color="primary" sx={{ display: { xs: 'none', sm: 'inline-flex' } }} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body2" sx={{ fontWeight: 900 }} noWrap>
            {nowPlaying.loading ? 'Loading preview...' : current ? `${current.title} - ${current.artist}` : ''}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {nowPlaying.playlistTitle} · Track {nowPlaying.index + 1} of {nowPlaying.songs.length}
          </Typography>
        </Box>
        <Tooltip title="Previous">
          <span>
            <IconButton onClick={onPrevious} disabled={!hasPrev && position < 3} size="small" sx={{ flexShrink: 0 }}>
              <SkipPreviousRoundedIcon />
            </IconButton>
          </span>
        </Tooltip>
        <Button
          variant="contained"
          onClick={onToggle}
          disabled={!nowPlaying.previewUrl || nowPlaying.loading}
          sx={{ minWidth: { xs: 40, sm: 48 }, px: { xs: 1, sm: 2 }, flexShrink: 0 }}
        >
          {nowPlaying.playing ? <PauseRoundedIcon /> : <PlayArrowRoundedIcon />}
        </Button>
        <Tooltip title="Next">
          <span>
            <IconButton onClick={onNext} disabled={!hasNext} size="small" sx={{ flexShrink: 0 }}>
              <SkipNextRoundedIcon />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Close player">
          <IconButton onClick={onStop} size="small" sx={{ flexShrink: 0 }}>
            <CloseRoundedIcon />
          </IconButton>
        </Tooltip>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.8, sm: 1.2 }, px: 0.5 }}>
        <Typography variant="caption" color="text.secondary" sx={{ minWidth: 32, textAlign: 'right' }}>
          {formatTime(position)}
        </Typography>
        <Slider
          size="small"
          value={position}
          min={0}
          max={duration > 0 ? duration : 30}
          step={0.1}
          disabled={!nowPlaying.previewUrl || nowPlaying.loading || duration === 0}
          onChange={(_, value) => onSeek(Array.isArray(value) ? value[0] : value)}
        />
        <Typography variant="caption" color="text.secondary" sx={{ minWidth: 32 }}>
          {formatTime(duration)}
        </Typography>
      </Box>
    </Box>
  );
};

export default NowPlayingBar;
