import React from 'react';
import { Avatar, Box, keyframes } from '@mui/material';

const bounce = keyframes`
  0%, 80%, 100% { transform: translateY(0); opacity: 0.35; }
  40% { transform: translateY(-4px); opacity: 1; }
`;

type Props = {
  avatar?: string;
};

const Dot: React.FC<{ delay: number }> = ({ delay }) => (
  <Box
    component="span"
    sx={{
      width: 7,
      height: 7,
      borderRadius: '50%',
      bgcolor: 'text.secondary',
      display: 'inline-block',
      animation: `${bounce} 1.2s infinite ease-in-out`,
      animationDelay: `${delay}ms`,
    }}
  />
);

const TypingDots: React.FC<Props> = ({ avatar }) => (
  <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 0.75 }}>
    <Box sx={{ width: 32, height: 32, flexShrink: 0 }}>
      {avatar ? <Avatar src={avatar} sx={{ width: 32, height: 32 }} /> : null}
    </Box>
    <Box
      sx={{
        px: 1.5,
        py: 0.9,
        borderRadius: 4,
        bgcolor: 'background.paper',
        border: 1,
        borderColor: 'divider',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.6,
      }}
    >
      <Dot delay={0} />
      <Dot delay={150} />
      <Dot delay={300} />
    </Box>
  </Box>
);

export default TypingDots;
