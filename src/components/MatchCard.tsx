import React from 'react';
import { Avatar, Box, Button, Card, LinearProgress, Stack, Typography } from '@mui/material';
import ChatBubbleRoundedIcon from '@mui/icons-material/ChatBubbleRounded';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import type { Match } from '../data/demo';

type MatchCardProps = {
  match: Match;
  onChat?: (match: Match) => void;
  onLike?: (matchId: string) => void;
  onOpenPlaylist?: (match: Match) => void;
  onUnmatch?: (matchId: string) => void;
};

const MatchCard: React.FC<MatchCardProps> = ({ match, onChat, onLike, onOpenPlaylist, onUnmatch }) => {
  return (
    <Card
      sx={{
        p: 2.5,
        '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 },
      }}
    >
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
        <Avatar src={match.image} variant="rounded" sx={{ width: 72, height: 72, borderRadius: 3 }} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" noWrap>{match.name}</Typography>
            <Stack direction="row" spacing={0.4} sx={{ alignItems: 'center', color: 'primary.main' }}>
              <FavoriteRoundedIcon sx={{ fontSize: 17 }} />
              <Typography variant="caption" sx={{ fontWeight: 900 }}>{match.score}%</Typography>
            </Stack>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={match.score}
            sx={{ height: 6, borderRadius: 99, my: 1 }}
          />
          <Typography variant="body2" color="text.secondary">{match.taste}</Typography>
        </Box>
      </Stack>
      <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        <Button size="small" sx={{ flex: '1 1 120px' }} variant="contained" startIcon={<ChatBubbleRoundedIcon />} onClick={() => onChat?.(match)}>Chat</Button>
        <Button size="small" sx={{ flex: '1 1 100px' }} variant="outlined" onClick={() => onOpenPlaylist?.(match)}>
          Playlist
        </Button>
        <Button size="small" variant={match.status === 'liked' ? 'contained' : 'outlined'} onClick={() => onLike?.(match.id)}>
          {match.status === 'liked' ? 'Liked' : 'Like'}
        </Button>
        <Button size="small" color="error" variant="outlined" onClick={() => onUnmatch?.(match.id)}>
          Unmatch
        </Button>
      </Box>
    </Card>
  );
};

export default MatchCard;
