import React from 'react';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Chip,
  Avatar,
  Stack,
  Typography,
} from '@mui/material';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import QueueMusicRoundedIcon from '@mui/icons-material/QueueMusicRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import type { Playlist } from '../data/demo';

type PlaylistCardProps = {
  playlist: Playlist;
  editable?: boolean;
  onLike?: (playlistId: string) => void;
  onOpen?: (playlist: Playlist) => void;
  onPlay?: (playlist: Playlist) => void | Promise<void>;
  onDelete?: (playlistId: string) => void;
  onEdit?: (playlist: Playlist) => void;
  onLikeComment?: (playlistId: string, commentId: string) => void;
};

const PlaylistCard: React.FC<PlaylistCardProps> = ({ playlist, editable, onLike, onOpen, onPlay, onDelete, onEdit, onLikeComment }) => {
  const visibleSongs = playlist.songs.slice(0, 3);
  const visibleComments = playlist.comments.slice(0, 2);

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        '&:hover': { transform: 'translateY(-6px)', boxShadow: 6 },
      }}
    >
      <CardMedia
        image={playlist.image}
        title={playlist.title}
        sx={{ height: 148, backgroundPosition: 'center' }}
      />
      <CardContent sx={{ p: 2, flex: 1 }}>
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Chip size="small" label={playlist.tag} color="secondary" variant="outlined" />
          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', color: 'primary.main' }}>
            <FavoriteRoundedIcon sx={{ fontSize: 17 }} />
            <Typography variant="caption" sx={{ fontWeight: 800 }}>{playlist.likes}</Typography>
          </Stack>
        </Stack>
        <Typography variant="h6" sx={{ lineHeight: 1.08, mb: 1 }}>
          {playlist.title}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            minHeight: 60,
          }}
        >
          {playlist.description}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1.5, mt: 1.5, color: 'text.secondary' }}>
          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
            <QueueMusicRoundedIcon sx={{ fontSize: 18 }} />
            <Typography variant="caption">{playlist.songs.length} songs</Typography>
          </Stack>
          <Typography variant="caption">{playlist.duration}</Typography>
        </Box>
        <Stack spacing={0.6} sx={{ mt: 1.5 }}>
          {visibleSongs.map((song) => (
            <Box
              key={`${song.artist}-${song.title}`}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 1,
                borderTop: '1px solid',
                borderColor: 'divider',
                pt: 0.6,
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 800 }} noWrap>
                {song.title}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {song.artist}
              </Typography>
            </Box>
          ))}
        </Stack>
        <Stack spacing={0.8} sx={{ mt: 1.5 }}>
          {visibleComments.map((comment) => (
            <Box key={comment.id} sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
              <Avatar src={comment.avatar} sx={{ width: 26, height: 26, fontSize: 12 }}>
                {comment.user[0]}
              </Avatar>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 900 }}>
                  {comment.user}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }} noWrap>
                  {comment.body}
                </Typography>
              </Box>
              <Button size="small" onClick={() => onLikeComment?.(playlist.id, comment.id)}>
                {comment.likes}
              </Button>
            </Box>
          ))}
        </Stack>
      </CardContent>
      <CardActions sx={{ px: 2, pb: 2, pt: 0, flexWrap: 'wrap', gap: 0.5, '& > :not(style) + :not(style)': { ml: 0 } }}>
        <Button size="small" variant="contained" startIcon={<PlayArrowRoundedIcon />} onClick={() => onPlay?.(playlist)}>
          Play
        </Button>
        <Button size="small" onClick={() => onOpen?.(playlist)}>Open</Button>
        <Button size="small" onClick={() => onLike?.(playlist.id)}>Like</Button>
        {editable && (
          <Button size="small" startIcon={<EditRoundedIcon />} onClick={() => onEdit?.(playlist)}>
            Edit
          </Button>
        )}
        <Button size="small" color="error" startIcon={<DeleteRoundedIcon />} onClick={() => onDelete?.(playlist.id)}>
          Delete
        </Button>
      </CardActions>
    </Card>
  );
};

export default PlaylistCard;
