import React from 'react';
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Button,
  Container,
  Divider,
  Drawer,
  IconButton,
  InputBase,
  List,
  ListItemButton,
  ListItemText,
  Popover,
  Snackbar,
  Toolbar,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import { NavLink, Outlet, Link as RouterLink } from 'react-router-dom';
import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded';
import ChatBubbleRoundedIcon from '@mui/icons-material/ChatBubbleRounded';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import QueueMusicRoundedIcon from '@mui/icons-material/QueueMusicRounded';
import StarsRoundedIcon from '@mui/icons-material/StarsRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import { useAppData } from '../state/AppDataContext';
import NotificationsList from './layout/NotificationsList';
import NowPlayingBar from './layout/NowPlayingBar';

const navItems = [
  { label: 'Home', to: '/', icon: <HomeRoundedIcon /> },
  { label: 'Discover', to: '/discover', icon: <SearchRoundedIcon /> },
  { label: 'Matches', to: '/matches', icon: <FavoriteRoundedIcon /> },
  { label: 'Chat', to: '/chat', icon: <ChatBubbleRoundedIcon /> },
  { label: 'Playlists', to: '/playlists', icon: <QueueMusicRoundedIcon /> },
];

const Layout: React.FC = () => {
  const {
    clearNotifications,
    dismissNotification,
    markNotificationsRead,
    notifications,
    nowPlaying,
    notice,
    clearNotice,
    signOut,
    themeMode,
    togglePlayback,
    nextTrack,
    previousTrack,
    seekTo,
    stopPlayback,
    toggleThemeMode,
    user,
  } = useAppData();
  const theme = useTheme();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [notificationAnchor, setNotificationAnchor] = React.useState<HTMLElement | null>(null);
  const [headerSearch, setHeaderSearch] = React.useState('');
  const accountLabel = user ? 'Logout' : 'Login';
  const unreadCount = React.useMemo(
    () => notifications.reduce((count, n) => (n.read ? count : count + 1), 0),
    [notifications],
  );
  const isDark = theme.palette.mode === 'dark';
  const surface = isDark ? 'rgba(33, 24, 33, 0.9)' : 'rgba(255, 253, 251, 0.9)';
  const softSurface = isDark ? 'rgba(255, 247, 251, 0.08)' : 'rgba(36, 25, 35, 0.05)';
  const pageBackground = isDark
    ? 'radial-gradient(circle at 12% 12%, rgba(236, 64, 122, 0.18), transparent 30%), radial-gradient(circle at 84% 8%, rgba(31, 138, 138, 0.16), transparent 28%), linear-gradient(180deg, #1a1118 0%, #120a10 100%)'
    : 'radial-gradient(circle at 12% 12%, rgba(236, 64, 122, 0.14), transparent 28%), radial-gradient(circle at 84% 8%, rgba(31, 138, 138, 0.12), transparent 25%), linear-gradient(180deg, #ffffff 0%, #fbf7f4 100%)';

  return (
    <Box
      className="app-shell"
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: pageBackground,
        color: 'text.primary',
        pb: nowPlaying ? { xs: 14, sm: 12 } : 0,
      }}
    >
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: surface,
          backdropFilter: 'blur(16px)',
          color: 'text.primary',
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Toolbar sx={{ gap: 2, minHeight: { xs: 68, md: 76 } }}>
          <Tooltip title="Menu">
            <IconButton onClick={() => setMenuOpen(true)} sx={{ display: { md: 'none' } }}>
              <MenuRoundedIcon />
            </IconButton>
          </Tooltip>

          <Box
            component={RouterLink}
            to="/"
            sx={{ display: 'flex', alignItems: 'center', gap: 1.2, color: 'inherit', textDecoration: 'none' }}
          >
            <Box
              component="img"
              src={logo}
              alt="Mixtape Matchmaker"
              sx={{
                width: 34,
                height: 48,
                objectFit: 'contain',
              }}
            />
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <Typography variant="h6" sx={{ lineHeight: 1 }}>
                Mixtape Matchmaker
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                Make more memories
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              gap: 0.5,
              ml: 2,
              p: 0.5,
              borderRadius: 2,
              bgcolor: softSurface,
            }}
          >
            {navItems.map((item) => (
              <Box
                key={item.to}
                component={NavLink}
                to={item.to}
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.7,
                  px: 1.4,
                  py: 0.8,
                  borderRadius: 1.5,
                  color: 'text.secondary',
                  fontWeight: 800,
                  fontSize: 14,
                  '& svg': { fontSize: 18 },
                  '&.active': {
                    bgcolor: 'background.paper',
                    color: 'primary.main',
                    boxShadow: 1,
                  },
                  '&:hover': { color: 'text.primary' },
                }}
              >
                {item.icon}
                {item.label}
              </Box>
            ))}
          </Box>

          <Box sx={{ flexGrow: 1 }} />


          <Box
            sx={{
              display: { xs: 'none', lg: 'flex' },
              alignItems: 'center',
              width: 360,
              px: 1.5,
              py: 0.8,
              borderRadius: 2,
              bgcolor: softSurface,
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <SearchRoundedIcon sx={{ color: 'text.secondary', mr: 1 }} />
            <InputBase
              fullWidth
              placeholder="Search playlists, songs, people"
              value={headerSearch}
              onChange={(event) => setHeaderSearch(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && headerSearch.trim()) {
                  navigate(`/playlists?q=${encodeURIComponent(headerSearch.trim())}`);
                }
              }}
            />
          </Box>

          <Tooltip title={themeMode === 'dark' ? 'Use light mode' : 'Use dark mode'}>
            <IconButton onClick={toggleThemeMode}>
              {themeMode === 'dark' ? <LightModeRoundedIcon /> : <DarkModeRoundedIcon />}
            </IconButton>
          </Tooltip>

          {user && (
            <Tooltip title="Notifications">
              <IconButton
                onClick={(event) => {
                  setNotificationAnchor(event.currentTarget);
                  markNotificationsRead();
                }}
              >
                <Badge color="primary" badgeContent={unreadCount}>
                  <NotificationsRoundedIcon />
                </Badge>
              </IconButton>
            </Tooltip>
          )}
          {!user ? (
            <Button component={RouterLink} to="/login" variant="contained" startIcon={<AccountCircleRoundedIcon />}>
              Login
            </Button>
          ) : (
            <Button variant="outlined" onClick={signOut} sx={{ gap: 1, px: 1, py: 0.4, minHeight: 38 }}>
              <Avatar src={user?.image} sx={{ width: 30, height: 30, bgcolor: 'primary.main', fontWeight: 900 }}>
                {user?.displayName?.[0] || 'M'}
              </Avatar>
              <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                Logout
              </Box>
            </Button>
          )}
        </Toolbar>
        <Box
          sx={{
            display: { xs: 'flex', md: 'none' },
            gap: 0.5,
            px: 1.5,
            pb: 1.2,
            overflowX: 'auto',
          }}
        >
          {[...navItems, { label: 'About', to: '/about', icon: <InfoRoundedIcon /> }, { label: 'Credits', to: '/credits', icon: <StarsRoundedIcon /> }, { label: accountLabel, to: '/login', icon: <AccountCircleRoundedIcon /> }].map((item) => (
            <Box
              key={item.to}
              component={NavLink}
              to={item.to}
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.6,
                px: 1.1,
                py: 0.7,
                borderRadius: 1.5,
                color: 'text.secondary',
                fontWeight: 800,
                fontSize: 13,
                whiteSpace: 'nowrap',
                '& svg': { fontSize: 17 },
                '&.active': {
                  bgcolor: 'background.paper',
                  color: 'primary.dark',
                },
              }}
            >
              {item.icon}
              {item.label}
            </Box>
          ))}
        </Box>
      </AppBar>
      <Drawer anchor="left" open={menuOpen} onClose={() => setMenuOpen(false)}>
        <Box sx={{ width: 280, p: 2 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>Mixtape Matchmaker</Typography>
          <Divider sx={{ mb: 1 }} />
          <List>
            {[...navItems, { label: 'About', to: '/about', icon: <InfoRoundedIcon /> }, { label: 'Credits', to: '/credits', icon: <StarsRoundedIcon /> }, { label: accountLabel, to: '/login', icon: <AccountCircleRoundedIcon /> }].map((item) => (
              <ListItemButton
                key={item.to}
                onClick={() => {
                  setMenuOpen(false);
                  navigate(item.to);
                }}
              >
                <Box sx={{ mr: 1, display: 'flex' }}>{item.icon}</Box>
                <ListItemText primary={item.label} />
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Drawer>
      <Popover
        open={Boolean(notificationAnchor)}
        anchorEl={notificationAnchor}
        onClose={() => setNotificationAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Box sx={{ width: 340, maxWidth: '90vw', p: 2 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>Notifications</Typography>
          <NotificationsList
            notifications={notifications}
            onClearAll={clearNotifications}
            onDismiss={dismissNotification}
            onOpen={(target) => {
              setNotificationAnchor(null);
              navigate(target);
            }}
          />
        </Box>
      </Popover>
      <Snackbar
        open={Boolean(notice)}
        autoHideDuration={3200}
        onClose={clearNotice}
        message={notice}
      />
      <Container component="main" maxWidth="xl" sx={{ py: { xs: 2, md: 3 }, flex: 1, width: '100%' }}>
        <Outlet />
      </Container>
      {nowPlaying && (
        <NowPlayingBar
          nowPlaying={nowPlaying}
          theme={theme}
          onNext={nextTrack}
          onPrevious={previousTrack}
          onSeek={seekTo}
          onStop={stopPlayback}
          onToggle={togglePlayback}
        />
      )}
      <Box
        component="footer"
        sx={{
          mt: 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          px: 3,
          py: 5,
          color: 'text.secondary',
          borderTop: `1px solid ${theme.palette.divider}`,
          bgcolor: isDark ? 'rgba(20, 14, 20, 0.8)' : 'rgba(255, 250, 246, 0.8)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <Box sx={{ display: 'flex', gap: 4, fontWeight: 700, fontSize: 15 }}>
          <Box
            component={RouterLink}
            to="/about"
            sx={{
              color: 'text.primary',
              textDecoration: 'none',
              '&:hover': { color: 'primary.main' },
              transition: 'color 150ms ease'
            }}
          >
            About
          </Box>
          <Box
            component={RouterLink}
            to="/credits"
            sx={{
              color: 'text.primary',
              textDecoration: 'none',
              '&:hover': { color: 'primary.main' },
              transition: 'color 150ms ease'
            }}
          >
            Credits
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
          <Box component="img" src={logo} alt="" sx={{ width: 24, height: 24, opacity: 0.5, objectFit: 'contain' }} />
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            © 2021 Mixtape Matchmaker. All rights reserved.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;
