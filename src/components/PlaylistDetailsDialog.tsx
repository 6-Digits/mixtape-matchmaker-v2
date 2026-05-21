import React, { useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputBase,
  Stack,
  Typography,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import QueueMusicRoundedIcon from '@mui/icons-material/QueueMusicRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import type { Playlist } from '../data/demo';

type Props = {
  open: boolean;
  playlist: Playlist | null;
  onClose: () => void;
  onPlaySong: (playlist: Playlist, index: number) => void | Promise<void>;
  onLike?: (playlistId: string) => void;
  onLikeComment?: (playlistId: string, commentId: string) => void;
  onComment?: (playlistId: string, body: string) => void;
};

const PlaylistDetailsDialog: React.FC<Props> = ({ open, playlist, onClose, onPlaySong, onLike, onLikeComment, onComment }) => {
  const [draft, setDraft] = useState('');
  if (!playlist) return null;

  const submitComment = () => {
    const body = draft.trim();
    if (!body || !onComment) return;
    onComment(playlist.id, body);
    setDraft('');
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pr: 1 }}>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography variant="h5" component="span" noWrap>{playlist.title}</Typography>
          <Typography variant="body2" color="text.secondary" noWrap>
            {playlist.owner} · {playlist.songs.length} songs · {playlist.duration}
          </Typography>
        </Box>
        <IconButton onClick={onClose} aria-label="Close playlist">
          <CloseRoundedIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2.5}>
          <Box sx={{ width: { xs: '100%', md: 280 }, flexShrink: 0 }}>
            <Box
              sx={{
                aspectRatio: '1 / 1',
                borderRadius: 2,
                backgroundImage: `url(${playlist.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                border: 1,
                borderColor: 'divider',
              }}
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
              {playlist.description}
            </Typography>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FavoriteRoundedIcon />}
              onClick={() => onLike?.(playlist.id)}
              sx={{ mt: 1.5 }}
            >
              Like · {playlist.likes}
            </Button>
          </Box>

          <Stack spacing={2} sx={{ flex: 1, minWidth: 0 }}>
            <Box>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
                <QueueMusicRoundedIcon color="primary" />
                <Typography variant="h6">Songs</Typography>
              </Stack>
              <Stack spacing={0.75}>
                {playlist.songs.map((song, index) => (
                  <Box
                    key={`${song.artist}-${song.title}-${index}`}
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: 'auto minmax(0, 1fr) auto',
                      alignItems: 'center',
                      gap: 1,
                      p: 1,
                      borderRadius: 1.5,
                      bgcolor: 'action.hover',
                    }}
                  >
                    <Typography variant="body2" color="text.secondary" sx={{ width: 24, textAlign: 'right' }}>
                      {index + 1}
                    </Typography>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="body2" sx={{ fontWeight: 900 }} noWrap>{song.title}</Typography>
                      <Typography variant="caption" color="text.secondary" noWrap>
                        {song.artist} · {song.album} · {song.duration}
                      </Typography>
                    </Box>
                    <IconButton color="primary" onClick={() => void onPlaySong(playlist, index)} aria-label={`Play ${song.title}`}>
                      <PlayArrowRoundedIcon />
                    </IconButton>
                  </Box>
                ))}
              </Stack>
            </Box>

            <Box>
              <Typography variant="h6" sx={{ mb: 1 }}>Comments</Typography>
              <Stack spacing={1}>
                {playlist.comments.map((comment) => (
                  <Box key={comment.id} sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                    <Avatar src={comment.avatar} sx={{ width: 32, height: 32 }}>{comment.user[0]}</Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" sx={{ fontWeight: 900 }}>{comment.user}</Typography>
                      <Typography variant="body2" color="text.secondary">{comment.body}</Typography>
                    </Box>
                    <Button size="small" onClick={() => onLikeComment?.(playlist.id, comment.id)}>
                      {comment.likes}
                    </Button>
                  </Box>
                ))}
                {onComment && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, px: 1, py: 0.5, borderRadius: 99, bgcolor: 'action.hover' }}>
                    <InputBase
                      fullWidth
                      placeholder="Add a comment"
                      value={draft}
                      onChange={(event) => setDraft(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.preventDefault();
                          submitComment();
                        }
                      }}
                    />
                    <IconButton size="small" onClick={submitComment} disabled={!draft.trim()} aria-label="Post comment">
                      <SendRoundedIcon fontSize="small" />
                    </IconButton>
                  </Box>
                )}
              </Stack>
            </Box>
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => void onPlaySong(playlist, 0)} startIcon={<PlayArrowRoundedIcon />} variant="contained">
          Play from start
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PlaylistDetailsDialog;
