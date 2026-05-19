import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { PaletteMode } from '@mui/material';
import type { ChatMessage, Match, Playlist, Song } from '../data/demo';
import { API_URL, detectServer, devOAuthLogin, fetchServerAccount } from '../services/api';
import {
  loadMockDb,
  safeGetItem,
  safeJsonParse,
  safeRemoveItem,
  safeSetItem,
  saveMockDb,
  type MockDb,
} from '../services/mockDb';
import { createLocalMatchReply } from '../services/localMatchLlm';
import { generateRandomMatch } from '../services/randomMatch';

const MAX_MATCHES = 12;

type AppMode = 'checking' | 'mock' | 'server';

type AppUser = {
  id: string;
  displayName: string;
  provider: 'mock' | 'server';
};

export type AppNotification = {
  id: string;
  message: string;
  time: string;
  read: boolean;
  createdAt: number;
  target?: string;
};

export type NowPlaying = {
  playlistId: string;
  playlistTitle: string;
  songs: Song[];
  index: number;
  previewUrl?: string;
  loading?: boolean;
  playing?: boolean;
  position: number;
  duration: number;
};

type AppDataContextValue = {
  mode: AppMode;
  apiUrl: string;
  user: AppUser | null;
  authenticated: boolean;
  playlists: Playlist[];
  matches: Match[];
  messages: ChatMessage[];
  notifications: AppNotification[];
  nowPlaying: NowPlaying | null;
  notice: string | null;
  themeMode: PaletteMode;
  typingMatchId: string | null;
  createPlaylist: () => void;
  clearNotice: () => void;
  clearNotifications: () => void;
  deletePlaylist: (playlistId: string) => void;
  dismissNotification: (notificationId: string) => void;
  editPlaylist: (playlistId: string, patch: { title?: string; description?: string }) => void;
  addSongToPlaylist: (playlistId: string, song: Song) => void;
  removeSongFromPlaylist: (playlistId: string, songIndex: number) => void;
  likePlaylist: (playlistId: string) => void;
  likePlaylistComment: (playlistId: string, commentId: string) => void;
  markNotificationsRead: () => void;
  playPlaylist: (playlist: Playlist, startIndex?: number) => Promise<void>;
  reactToMatch: (matchId: string, status: 'liked' | 'passed') => void;
  unmatch: (matchId: string) => void;
  sendMessage: (body: string, matchId?: string) => void;
  reactToMessage: (messageId: string, emoji: string) => void;
  signIn: (displayName?: string) => Promise<void>;
  signOut: () => void;
  togglePlayback: () => void;
  nextTrack: () => void;
  previousTrack: () => void;
  seekTo: (seconds: number) => void;
  stopPlayback: () => void;
  toggleThemeMode: () => void;
  resetMatches: () => void;
};

const AppDataContext = createContext<AppDataContextValue | null>(null);
const TOKEN_KEY = 'mixtape-matchmaker.server-token';
const THEME_KEY = 'mixtape-matchmaker.theme-mode';
const MOCK_SESSION_KEY = 'mixtape-matchmaker.mock-session';
const NOTIFICATION_KEY = 'mixtape-matchmaker.notifications';
const MAX_NOTIFICATIONS = 8;
const NOTIFICATION_TTL_MS = 60_000;

const starterSongs: Song[] = [
  { title: 'Maps', artist: 'Yeah Yeah Yeahs', album: 'Fever to Tell', year: 2003, duration: '3:39' },
  { title: 'Rebellion (Lies)', artist: 'Arcade Fire', album: 'Funeral', year: 2004, duration: '5:10' },
  { title: 'Such Great Heights', artist: 'The Postal Service', album: 'Give Up', year: 2003, duration: '4:26' },
  { title: 'Two Weeks', artist: 'Grizzly Bear', album: 'Veckatimest', year: 2009, duration: '4:03' },
];

const mockReplies = [
  'That track fits your playlist perfectly.',
  'I forgot how good that chorus is.',
  'Adding this to my reply mix.',
  'Your sequencing is better than mine.',
  'This is exactly the kind of song I was hoping to find here.',
];

export const AppDataProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [mode, setMode] = useState<AppMode>('checking');
  const [mockDb, setMockDb] = useState<MockDb>(() => loadMockDb());
  const mockDbRef = useRef<MockDb>(mockDb);
  useEffect(() => { mockDbRef.current = mockDb; }, [mockDb]);
  const [user, setUser] = useState<AppUser | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    return safeJsonParse<AppNotification[]>(safeGetItem(NOTIFICATION_KEY), []);
  });
  const [nowPlaying, setNowPlaying] = useState<NowPlaying | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [typingMatchId, setTypingMatchId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [themeMode, setThemeMode] = useState<PaletteMode>(() => {
    const saved = safeGetItem(THEME_KEY);
    return saved === 'dark' ? 'dark' : 'light';
  });

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      const hasServer = await detectServer();
      if (cancelled) return;

      if (!hasServer) {
        const db = loadMockDb();
        setMockDb(db);
        const mockSession = safeJsonParse<AppUser | null>(safeGetItem(MOCK_SESSION_KEY), null);
        setUser(mockSession);
        setMode('mock');
        return;
      }

      setMode('server');
      const token = safeGetItem(TOKEN_KEY);
      if (!token) {
        return;
      }

      try {
        const account = await fetchServerAccount(token);
        if (!cancelled) {
          setUser({ id: account.id, displayName: account.email || 'Server user', provider: 'server' });
        }
      } catch {
        safeRemoveItem(TOKEN_KEY);
      }
    }

    boot();
    return () => {
      cancelled = true;
    };
  }, []);

  const pushNotice = (message: string) => {
    if (!user) return;
    setNotice(message);
  };

  const pushNotification = (message: string, target?: string) => {
    if (!user) return;
    const notification = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      message,
      time: new Intl.DateTimeFormat([], { hour: 'numeric', minute: '2-digit' }).format(new Date()),
      read: false,
      createdAt: Date.now(),
      target,
    };

    setNotifications((current) => {
      const next = [notification, ...current].slice(0, MAX_NOTIFICATIONS);
      safeSetItem(NOTIFICATION_KEY, JSON.stringify(next));
      return next;
    });
    setNotice((current) => current ?? message);
  };

  useEffect(() => {
    const interval = window.setInterval(() => {
      setNotifications((current) => {
        const cutoff = Date.now() - NOTIFICATION_TTL_MS;
        const next = current.filter((notification) => !notification.read || notification.createdAt > cutoff);
        if (next.length !== current.length) {
          safeSetItem(NOTIFICATION_KEY, JSON.stringify(next));
        }
        return next;
      });
    }, 10_000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (mode !== 'mock' || !user) return;

    const interval = window.setInterval(() => {
      if (Math.random() < 0.6) return;
      setMockDb((current) => {
        const action = Math.random();
        const playlistIndex = Math.floor(Math.random() * current.playlists.length);
        const matchIndex = Math.floor(Math.random() * current.matches.length);
        const playlist = current.playlists[playlistIndex];
        const match = current.matches[matchIndex];
        if (!playlist || !match) return current;

        let next = current;
        if (action < 0.1 && current.matches.length < MAX_MATCHES) {
          const newMatch = generateRandomMatch(current.matches, current.playlists);
          if (newMatch) {
            next = { ...current, matches: [newMatch, ...current.matches] };
            pushNotification(`New match: ${newMatch.name} (${newMatch.score}% overlap).`, '/matches');
          }
        } else if (action < 0.45) {
          next = {
            ...current,
            playlists: current.playlists.map((item, index) => (
              index === playlistIndex ? { ...item, likes: item.likes + 1 } : item
            )),
          };
          // passive like — no notification needed
        } else if (action < 0.75) {
          const song = playlist.songs[Math.floor(Math.random() * playlist.songs.length)];
          next = {
            ...current,
            messages: [
              ...current.messages,
              {
                from: match.name,
                id: `m-${Date.now()}`,
                matchId: match.id,
                body: `I just listened to “${song.title}” by ${song.artist}. Great pick.`,
                time: new Intl.DateTimeFormat([], { hour: 'numeric', minute: '2-digit' }).format(new Date()),
              },
            ],
          };
          pushNotification(`${match.name} sent a new chat message.`, `/chat?match=${match.id}`);
        } else {
          next = {
            ...current,
            matches: current.matches.map((item, index) => (
              index === matchIndex && item.status !== 'passed' ? { ...item, score: Math.min(99, item.score + 1) } : item
            )),
          };
          // silent score nudge — no notification needed
        }

        saveMockDb(next);
        return next;
      });
    }, 45_000);

    return () => window.clearInterval(interval);
  }, [mode, user]);

  const signIn = async (displayName?: string) => {
    if (mode === 'mock') {
      const mockUser = {
        ...mockDb.user,
        displayName: displayName?.trim() || mockDb.user.displayName,
      };
      const nextDb = { ...mockDb, user: mockUser };
      saveMockDb(nextDb);
      safeSetItem(MOCK_SESSION_KEY, JSON.stringify(mockUser));
      setMockDb(nextDb);
      setUser(mockUser);
      pushNotice(`Welcome back, ${mockUser.displayName}.`);
      return;
    }

    const session = await devOAuthLogin();
    safeSetItem(TOKEN_KEY, session.token);
    setUser({ id: session.id, displayName: 'Mixtape Listener', provider: 'server' });
    pushNotice('Signed in.');
  };

  const signOut = () => {
    if (mode === 'server') {
      safeRemoveItem(TOKEN_KEY);
    } else {
      safeRemoveItem(MOCK_SESSION_KEY);
    }
    setUser(null);
    setNotifications([]);
    safeSetItem(NOTIFICATION_KEY, JSON.stringify([]));
    setNotice(null);
  };

  const updateMockDb = (updater: (current: MockDb) => MockDb) => {
    setMockDb((current) => {
      const next = updater(current);
      saveMockDb(next);
      return next;
    });
  };

  const createPlaylist = () => {
    updateMockDb((current) => ({
      ...current,
      playlists: [
        {
          id: `my-real-mix-${Date.now()}`,
          title: 'My Real Mix',
          description: 'A UI-only playlist seeded with real tracks you can edit later.',
          image: current.playlists[0]?.image,
          songs: starterSongs,
          duration: '17m',
          likes: 0,
          tag: 'Mine',
          owner: current.user.displayName,
          comments: [
            {
              id: `c-${Date.now()}`,
              user: current.user.displayName,
              avatar: '',
              body: 'New local mix. The comments work here too.',
              likes: 0,
            },
          ],
        },
        ...current.playlists,
      ],
    }));
  };

  const likePlaylist = (playlistId: string) => {
    updateMockDb((current) => ({
      ...current,
      playlists: current.playlists.map((playlist) => (
        playlist.id === playlistId ? { ...playlist, likes: playlist.likes + 1 } : playlist
      )),
    }));
  };

  const likePlaylistComment = (playlistId: string, commentId: string) => {
    updateMockDb((current) => ({
      ...current,
      playlists: current.playlists.map((playlist) => (
        playlist.id === playlistId
          ? {
              ...playlist,
              comments: playlist.comments.map((comment) => (
                comment.id === commentId ? { ...comment, likes: comment.likes + 1 } : comment
              )),
            }
          : playlist
      )),
    }));
  };

  const editPlaylist = (playlistId: string, patch: { title?: string; description?: string }) => {
    updateMockDb((current) => ({
      ...current,
      playlists: current.playlists.map((playlist) => (
        playlist.id === playlistId
          ? {
              ...playlist,
              title: patch.title !== undefined ? patch.title : playlist.title,
              description: patch.description !== undefined ? patch.description : playlist.description,
            }
          : playlist
      )),
    }));
  };

  const addSongToPlaylist = (playlistId: string, song: Song) => {
    updateMockDb((current) => ({
      ...current,
      playlists: current.playlists.map((playlist) => (
        playlist.id === playlistId
          ? { ...playlist, songs: [...playlist.songs, song] }
          : playlist
      )),
    }));
  };

  const removeSongFromPlaylist = (playlistId: string, songIndex: number) => {
    updateMockDb((current) => ({
      ...current,
      playlists: current.playlists.map((playlist) => (
        playlist.id === playlistId
          ? { ...playlist, songs: playlist.songs.filter((_, index) => index !== songIndex) }
          : playlist
      )),
    }));
  };

  const deletePlaylist = (playlistId: string) => {
    const playlist = mockDb.playlists.find((item) => item.id === playlistId);
    updateMockDb((current) => ({
      ...current,
      playlists: current.playlists.filter((item) => item.id !== playlistId),
    }));
    pushNotice(`Deleted ${playlist?.title || 'playlist'}.`);
  };

  const reactToMatch = (matchId: string, status: 'liked' | 'passed') => {
    const existing = mockDb.matches.find((item) => item.id === matchId);
    const toggleOff = status === 'liked' && existing?.status === 'liked';
    const nextStatus: 'liked' | 'passed' | 'new' = toggleOff ? 'new' : status;
    updateMockDb((current) => ({
      ...current,
      matches: current.matches.map((match) => (
        match.id === matchId ? { ...match, status: nextStatus } : match
      )),
    }));
  };

  const unmatch = (matchId: string) => {
    const match = mockDb.matches.find((item) => item.id === matchId);
    updateMockDb((current) => ({
      ...current,
      matches: current.matches.filter((item) => item.id !== matchId),
      messages: current.messages.filter((message) => message.matchId !== matchId),
    }));
    pushNotice(`Unmatched ${match?.name || 'listener'}.`);
  };

  const resetMatches = () => {
    updateMockDb((current) => ({
      ...current,
      matches: current.matches.map((match) => ({ ...match, status: 'new' })),
    }));
    pushNotice('Matches refreshed.');
  };

  const reactToMessage = (messageId: string, emoji: string) => {
    updateMockDb((current) => ({
      ...current,
      messages: current.messages.map((message) => (
        message.id === messageId
          ? { ...message, reaction: message.reaction === emoji ? undefined : emoji }
          : message
      )),
    }));
  };

  const sendMessage = (body: string, matchId?: string) => {
    const trimmed = body.trim();
    if (!trimmed) return;

    updateMockDb((current) => ({
      ...current,
      messages: [
        ...current.messages,
        {
          id: `m-${Date.now()}`,
          matchId: matchId || mockDb.matches[0]?.id || 'jason',
          from: 'You',
          body: trimmed,
          time: new Intl.DateTimeFormat([], { hour: 'numeric', minute: '2-digit' }).format(new Date()),
        },
      ],
    }));

    const appendReply = (replyText: string) => {
      setMockDb((current) => {
        const match = current.matches.find((item) => item.id === matchId)
          || current.matches.find((item) => item.status !== 'passed')
          || current.matches[0];
        const next = {
          ...current,
          messages: [
            ...current.messages,
            {
              from: match?.name || 'Jason',
              id: `m-${Date.now()}-reply`,
              matchId: match?.id || 'jason',
              body: replyText,
              time: new Intl.DateTimeFormat([], { hour: 'numeric', minute: '2-digit' }).format(new Date()),
            },
          ],
        };
        saveMockDb(next);
        pushNotification(`${match?.name || 'Jason'} replied in chat.`, `/chat?match=${match?.id || 'jason'}`);
        return next;
      });
    };

    const buildAndAppend = () => {
      const snapshot = mockDbRef.current;
      const replyMatch = snapshot.matches.find((item) => item.id === matchId)
        || snapshot.matches.find((item) => item.status !== 'passed')
        || snapshot.matches[0];
      const replyMatchId = replyMatch?.id || 'jason';
      const history = snapshot.messages.filter((m) => m.matchId === replyMatchId);

      const reply = createLocalMatchReply({
        message: trimmed,
        match: replyMatch,
        playlists: snapshot.playlists,
        history,
        fallbackReplies: mockReplies,
      });
      appendReply(reply);
      setTypingMatchId((current) => (current === replyMatchId ? null : current));
    };

    const replyMatch = mockDbRef.current.matches.find((item) => item.id === matchId)
      || mockDbRef.current.matches.find((item) => item.status !== 'passed')
      || mockDbRef.current.matches[0];
    setTypingMatchId(replyMatch?.id || 'jason');

    const delay = 600 + Math.floor(Math.random() * 700);
    window.setTimeout(buildAndAppend, delay);
  };

  const loadTrack = async (playlistId: string, playlistTitle: string, songs: Song[], index: number) => {
    const song = songs[index];
    if (!song) return;

    setNowPlaying({
      playlistId,
      playlistTitle,
      songs,
      index,
      loading: true,
      playing: false,
      position: 0,
      duration: 0,
    });

    try {
      const query = encodeURIComponent(`${song.title} ${song.artist}`);
      const response = await fetch(`https://itunes.apple.com/search?term=${query}&entity=song&limit=1`);
      const data = await response.json();
      const previewUrl = data.results?.[0]?.previewUrl;

      if (!previewUrl) throw new Error('No preview found');

      audioRef.current?.pause();
      const audio = new Audio(previewUrl);
      audioRef.current = audio;

      audio.addEventListener('loadedmetadata', () => {
        setNowPlaying((current) => current && current.playlistId === playlistId && current.index === index
          ? { ...current, duration: audio.duration || 0 }
          : current);
      });
      audio.addEventListener('timeupdate', () => {
        setNowPlaying((current) => current && current.playlistId === playlistId && current.index === index
          ? { ...current, position: audio.currentTime || 0 }
          : current);
      });
      audio.addEventListener('ended', () => {
        setNowPlaying((current) => {
          if (!current || current.playlistId !== playlistId || current.index !== index) return current;
          const nextIndex = current.index + 1;
          if (nextIndex < current.songs.length) {
            void loadTrack(current.playlistId, current.playlistTitle, current.songs, nextIndex);
            return current;
          }
          return { ...current, playing: false, position: 0 };
        });
      });

      await audio.play();
      setNowPlaying({
        playlistId,
        playlistTitle,
        songs,
        index,
        previewUrl,
        loading: false,
        playing: true,
        position: 0,
        duration: audio.duration || 0,
      });
    } catch {
      setNowPlaying({
        playlistId,
        playlistTitle,
        songs,
        index,
        loading: false,
        playing: false,
        position: 0,
        duration: 0,
      });
      pushNotice(`Could not load a preview for ${song.title}.`);
    }
  };

  const playPlaylist = async (playlist: Playlist, startIndex = 0) => {
    if (playlist.songs.length === 0) return;
    await loadTrack(playlist.id, playlist.title, playlist.songs, Math.max(0, Math.min(startIndex, playlist.songs.length - 1)));
  };

  const togglePlayback = () => {
    const audio = audioRef.current;
    if (!audio || !nowPlaying?.previewUrl) return;

    if (audio.paused) {
      audio.play();
      setNowPlaying({ ...nowPlaying, playing: true });
    } else {
      audio.pause();
      setNowPlaying({ ...nowPlaying, playing: false });
    }
  };

  const nextTrack = () => {
    if (!nowPlaying) return;
    const next = nowPlaying.index + 1;
    if (next >= nowPlaying.songs.length) return;
    void loadTrack(nowPlaying.playlistId, nowPlaying.playlistTitle, nowPlaying.songs, next);
  };

  const previousTrack = () => {
    if (!nowPlaying) return;
    const audio = audioRef.current;
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      setNowPlaying({ ...nowPlaying, position: 0 });
      return;
    }
    const prev = nowPlaying.index - 1;
    if (prev < 0) return;
    void loadTrack(nowPlaying.playlistId, nowPlaying.playlistTitle, nowPlaying.songs, prev);
  };

  const seekTo = (seconds: number) => {
    const audio = audioRef.current;
    if (!audio || !nowPlaying) return;
    const clamped = Math.max(0, Math.min(seconds, audio.duration || seconds));
    audio.currentTime = clamped;
    setNowPlaying({ ...nowPlaying, position: clamped });
  };

  const stopPlayback = () => {
    audioRef.current?.pause();
    audioRef.current = null;
    setNowPlaying(null);
  };

  const markNotificationsRead = () => {
    setNotifications((current) => {
      const next = current.map((notification) => ({ ...notification, read: true }));
      safeSetItem(NOTIFICATION_KEY, JSON.stringify(next));
      return next;
    });
  };

  const dismissNotification = (notificationId: string) => {
    setNotifications((current) => {
      const next = current.filter((notification) => notification.id !== notificationId);
      safeSetItem(NOTIFICATION_KEY, JSON.stringify(next));
      return next;
    });
  };

  const clearNotifications = () => {
    setNotifications([]);
    safeSetItem(NOTIFICATION_KEY, JSON.stringify([]));
  };

  const clearNotice = () => setNotice(null);

  const toggleThemeMode = () => {
    setThemeMode((current) => {
      const next = current === 'dark' ? 'light' : 'dark';
      safeSetItem(THEME_KEY, next);
      return next;
    });
  };

  const value = useMemo<AppDataContextValue>(() => ({
    mode,
    apiUrl: API_URL,
    user,
    authenticated: Boolean(user),
    playlists: mockDb.playlists,
    matches: mockDb.matches,
    messages: mockDb.messages,
    notifications,
    nowPlaying,
    notice,
    themeMode,
    typingMatchId,
    createPlaylist,
    clearNotice,
    clearNotifications,
    deletePlaylist,
    dismissNotification,
    editPlaylist,
    addSongToPlaylist,
    removeSongFromPlaylist,
    likePlaylist,
    likePlaylistComment,
    markNotificationsRead,
    playPlaylist,
    reactToMatch,
    sendMessage,
    reactToMessage,
    signIn,
    signOut,
    togglePlayback,
    nextTrack,
    previousTrack,
    seekTo,
    stopPlayback,
    toggleThemeMode,
    unmatch,
    resetMatches,
  }), [mode, mockDb, notifications, notice, nowPlaying, themeMode, typingMatchId, user]);

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
};

export function useAppData() {
  const value = useContext(AppDataContext);
  if (!value) {
    throw new Error('useAppData must be used inside AppDataProvider');
  }
  return value;
}
