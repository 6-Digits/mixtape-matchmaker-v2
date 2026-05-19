import React from 'react';
import { Avatar, Box, Chip, Grid, Link, Paper, Stack, Typography } from '@mui/material';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import ImageRoundedIcon from '@mui/icons-material/ImageRounded';
import MusicNoteRoundedIcon from '@mui/icons-material/MusicNoteRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import logo from '../assets/logo.png';
import jasonCredits from '../assets/jason_credits.jpg';
import farhanProfile from '../assets/farhan_profile.jpg';
import darrenProfile from '../assets/darren_profile.png';
import techReact from '../assets/tech_react.png';
import techNode from '../assets/tech_node.png';
import techMysql from '../assets/tech_mysql.jpg';
import techJs from '../assets/tech_js.png';

const credits = [
  {
    title: 'Project owner',
    body: 'Created and directed by Jason, who defined the Mixtape Matchmaker concept, product direction, and v2 goals.',
    icon: <PersonRoundedIcon />,
  },
  {
    title: 'Original concept',
    body: 'Mixtape Matchmaker client and server provided the product direction, routes, and legacy visual language.',
    icon: <MusicNoteRoundedIcon />,
  },
  {
    title: 'Visual assets',
    body: 'Logo, playlist imagery, hearts, and profile placeholders carried over from the original Mixtape Matchmaker.',
    icon: <ImageRoundedIcon />,
  },
  {
    title: 'v2 rebuild',
    body: 'Modern React stack with a refreshed UI, smoother interactions, and richer playlist tooling.',
    icon: <CodeRoundedIcon />,
  },
];

const techStack = [
  { label: 'React', src: techReact },
  { label: 'TypeScript / JS', src: techJs },
  { label: 'Node / Express', src: techNode },
  { label: 'MySQL', src: techMysql },
];

const Credits: React.FC = () => {
  return (
    <Box>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ alignItems: { md: 'center' }, mb: 3 }}>
        <Avatar src={logo} variant="rounded" sx={{ width: 82, height: 118, bgcolor: 'transparent' }} />
        <Box>
          <Typography variant="h3">Credits</Typography>
          <Typography color="text.secondary" sx={{ maxWidth: 720 }}>
            This v2 keeps the spirit of the original app while modernizing the frontend and replacing the old backend with a cleaner SQL-backed server path.
          </Typography>
        </Box>
      </Stack>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, borderRadius: 4, boxShadow: 2, height: '100%' }}>
            <Stack direction="column" spacing={2} sx={{ alignItems: 'center', textAlign: 'center' }}>
              <Avatar src={jasonCredits} sx={{ width: 120, height: 120, mb: 1 }} />
              <Box>
                <Typography variant="h5">Jason Huang</Typography>
                <Typography color="text.secondary" sx={{ mb: 1 }}>
                  v2 lead & original developer
                </Typography>
                <Link href="https://jasonhuang.web.app/" target="_blank" rel="noreferrer" sx={{ fontWeight: 700, textDecoration: 'none' }}>
                  jasonhuang.web.app
                </Link>
              </Box>
            </Stack>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, borderRadius: 4, boxShadow: 2, height: '100%' }}>
            <Stack direction="column" spacing={2} sx={{ alignItems: 'center', textAlign: 'center' }}>
              <Avatar src={farhanProfile} sx={{ width: 120, height: 120, mb: 1 }} />
              <Box>
                <Typography variant="h5">Farhan Ahmed</Typography>
                <Typography color="text.secondary" sx={{ mb: 1 }}>
                  Original backend developer
                </Typography>
                <Link href="https://f4str.github.io/" target="_blank" rel="noreferrer" sx={{ fontWeight: 700, textDecoration: 'none' }}>
                  f4str.github.io
                </Link>
              </Box>
            </Stack>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, borderRadius: 4, boxShadow: 2, height: '100%' }}>
            <Stack direction="column" spacing={2} sx={{ alignItems: 'center', textAlign: 'center' }}>
              <Avatar src={darrenProfile} sx={{ width: 120, height: 120, mb: 1 }} />
              <Box>
                <Typography variant="h5">Darren Kong</Typography>
                <Typography color="text.secondary" sx={{ mb: 1 }}>
                  Original backend developer
                </Typography>
                <Link href="https://github.com/kong0716" target="_blank" rel="noreferrer" sx={{ fontWeight: 700, textDecoration: 'none' }}>
                  github.com/kong0716
                </Link>
              </Box>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={2.5}>
        {credits.map((credit) => (
          <Grid key={credit.title} size={{ xs: 12, md: 3 }}>
            <Paper sx={{ p: 3, height: '100%', borderRadius: 3, boxShadow: 1 }}>
              <Stack spacing={1.5}>
                <Box sx={{ color: 'primary.main', '& svg': { fontSize: 34 } }}>{credit.icon}</Box>
                <Typography variant="h5">{credit.title}</Typography>
                <Typography color="text.secondary">{credit.body}</Typography>
              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ p: 3, mt: 3, borderRadius: 3, boxShadow: 1 }}>
        <Typography variant="h5" sx={{ mb: 1.5 }}>Tech stack</Typography>
        <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap', gap: 1.5 }}>
          {techStack.map((tech) => (
            <Chip
              key={tech.label}
              avatar={<Avatar src={tech.src} sx={{ bgcolor: 'transparent' }} />}
              label={tech.label}
              variant="outlined"
              sx={{ height: 40, px: 0.5, borderRadius: 2 }}
            />
          ))}
        </Stack>
      </Paper>

      <Paper sx={{ p: 3, mt: 3, borderRadius: 3, boxShadow: 1 }}>
        <Typography variant="h5" sx={{ mb: 1 }}>Project notes</Typography>
        <Typography color="text.secondary">
          A reimagining of Mixtape Matchmaker with a refreshed look, real audio previews, smarter chat, and ongoing playlist tooling.
        </Typography>
      </Paper>
    </Box>
  );
};

export default Credits;
