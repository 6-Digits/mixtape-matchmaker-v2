import React from 'react';
import { Box, Button, Grid, Paper, Stack, Typography } from '@mui/material';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import LibraryMusicRoundedIcon from '@mui/icons-material/LibraryMusicRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import { Link as RouterLink } from 'react-router-dom';
import rings from '../assets/rings.jpg';

const About: React.FC = () => {
  return (
    <Box>
      <Paper
        sx={{
          minHeight: 420,
          p: { xs: 3, md: 5 },
          display: 'flex',
          alignItems: 'flex-end',
          color: '#fff',
          borderRadius: 2,
          backgroundImage: `linear-gradient(90deg, rgba(22, 12, 20, 0.86), rgba(22, 12, 20, 0.35)), url(${rings})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <Box sx={{ maxWidth: 720 }}>
          <Typography variant="h2" sx={{ fontSize: { xs: 42, md: 64 }, lineHeight: 0.98, mb: 2 }}>
            Mixtape Matchmaker turns music taste into a better first impression.
          </Typography>
          <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.82)', mb: 3 }}>
            Build a match playlist, discover public mixes, and connect through songs before small talk.
          </Typography>
          <Button component={RouterLink} to="/login" variant="contained">
            Try it in mock mode
          </Button>
        </Box>
      </Paper>

      <Grid container spacing={2.5} sx={{ mt: 2.5 }}>
        {[
          {
            icon: <LibraryMusicRoundedIcon />,
            title: 'Listen',
            body: 'Playlists are treated as taste profiles, not just collections of tracks.',
          },
          {
            icon: <FavoriteRoundedIcon />,
            title: 'Match',
            body: 'People can like profiles and form matches around shared listening patterns.',
          },
          {
            icon: <PeopleRoundedIcon />,
            title: 'Connect',
            body: 'Chats stay close to the playlist that started the conversation.',
          },
        ].map((item) => (
          <Grid key={item.title} size={{ xs: 12, md: 4 }}>
            <Paper variant="outlined" sx={{ p: 3, height: '100%', borderColor: 'divider' }}>
              <Stack spacing={1.2}>
                <Box sx={{ color: 'primary.main', '& svg': { fontSize: 34 } }}>{item.icon}</Box>
                <Typography variant="h5">{item.title}</Typography>
                <Typography color="text.secondary">{item.body}</Typography>
              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>
      
      <Box sx={{ mt: 5, textAlign: 'center' }}>
        <Typography variant="h6" sx={{ mb: 1 }}>Original Developers</Typography>
        <Typography color="text.secondary">
          Mixtape Matchmaker was originally created by Farhan Ahmed, Jason Huang, and Darren Kong in 2021.
        </Typography>
      </Box>
    </Box>
  );
};

export default About;
