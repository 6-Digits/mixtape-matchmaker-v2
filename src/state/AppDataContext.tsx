import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { PaletteMode } from '@mui/material';
import type { Song } from '../data/demo';
import { isMutualMatch, isInLikesInbox, isInDiscover, isWaitingOnThem } from '../data/demo';
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
import { createLocalMatchReply } from '../services/chatbot';
import {
  LIKE_QUOTA,
  LIKES_KEY,
  MOCK_SESSION_KEY,
  THEME_KEY,
  TOKEN_KEY,
  mockReplies,
  readLikeBudget,
  type LikeBudget,
} from './appDataConfig';
import { applyRandomMockEvent } from './mockEvents';
import {
  addSongToPlaylistInDb,
  commentOnPlaylistInDb,
  createPlaylistInDb,
  deletePlaylistInDb,
  editPlaylistInDb,
  likePlaylistCommentInDb,
  likePlaylistInDb,
  moveSongInPlaylistInDb,
  removeSongFromPlaylistInDb,
} from './playlistMutations';
import type {
  AppDataContextValue,
  AppMode,
  AppUser,
  CreatePlaylistInput,
  PlaylistDetailsPatch,
  UserProfilePatch,
} from './appDataTypes';
import { useAudioPlayer } from './useAudioPlayer';
import { useNotifications } from './useNotifications';

export type { AppNotification, NowPlaying } from './appDataTypes';

const AppDataContext = createContext<AppDataContextValue | null>(null);

export const AppDataProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [mode, setMode] = useState<AppMode>('checking');
  const [mockDb, setMockDb] = useState<MockDb>(() => loadMockDb());
  const mockDbRef = useRef<MockDb>(mockDb);
  useEffect(() => { mockDbRef.current = mockDb; }, [mockDb]);
  const [user, setUser] = useState<AppUser | null>(null);
  const [typingMatchId, setTypingMatchId] = useState<string | null>(null);
  const [likeBudget, setLikeBudget] = useState<LikeBudget>(() => readLikeBudget());
  const {
    clearNotice,
    clearNotifications,
    dismissNotification,
    markNotificationsRead,
    notice,
    notifications,
    pushNotice,
    pushNotification,
  } = useNotifications(user);
  const {
    nextTrack,
    nowPlaying,
    playPlaylist,
    previousTrack,
    seekTo,
    stopPlayback,
    togglePlayback,
  } = useAudioPlayer(pushNotice);

  const persistLikeBudget = (next: LikeBudget) => {
    setLikeBudget(next);
    safeSetItem(LIKES_KEY, JSON.stringify(next));
  };
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
        setUser(mockSession ? {
          ...db.user,
          ...mockSession,
          provider: 'mock',
          profileTags: mockSession.profileTags || db.user.profileTags,
        } : null);
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

  useEffect(() => {
    if (mode !== 'mock' || !user) return;

    const interval = window.setInterval(() => {
      const { db, notice } = applyRandomMockEvent(mockDbRef.current);
      saveMockDb(db);
      setMockDb(db);
      if (notice) {
        pushNotification(notice.message, notice.target);
      }
    }, 10_000);

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

  const updateUserProfile = (patch: UserProfilePatch) => {
    const cleanTags = patch.profileTags
      ?.map((tag) => tag.trim())
      .filter(Boolean)
      .slice(0, 5);
    const cleanPatch: UserProfilePatch = {
      ...patch,
      displayName: patch.displayName?.trim(),
      bio: patch.bio?.trim(),
      location: patch.location?.trim(),
      lookingFor: patch.lookingFor?.trim(),
      favoriteTrack: patch.favoriteTrack?.trim(),
      image: patch.image,
      favoritePlaylist: patch.favoritePlaylist?.trim(),
      taste: patch.taste?.trim(),
      profileTags: cleanTags,
    };

    if (mode === 'mock') {
      const updatedUser: AppUser & { provider: 'mock' } = {
        ...mockDbRef.current.user,
        ...cleanPatch,
        displayName: cleanPatch.displayName || mockDbRef.current.user.displayName,
        provider: 'mock',
      };
      updateMockDb((current) => ({ ...current, user: updatedUser }));
      setUser(updatedUser);
      safeSetItem(MOCK_SESSION_KEY, JSON.stringify(updatedUser));
    } else {
      setUser((current) => (
        current ? { ...current, ...cleanPatch, displayName: cleanPatch.displayName || current.displayName } : current
      ));
    }

    pushNotice('Profile updated.');
  };

  const signOut = () => {
    if (mode === 'server') {
      safeRemoveItem(TOKEN_KEY);
    } else {
      safeRemoveItem(MOCK_SESSION_KEY);
    }
    setUser(null);
    clearNotifications();
    clearNotice();
  };

  const updateMockDb = (updater: (current: MockDb) => MockDb) => {
    setMockDb((current) => {
      const next = updater(current);
      saveMockDb(next);
      return next;
    });
  };

  const createPlaylist = (input?: CreatePlaylistInput) => {
    updateMockDb((current) => createPlaylistInDb(current, input));
  };

  const likePlaylist = (playlistId: string) => {
    updateMockDb((current) => likePlaylistInDb(current, playlistId));
  };

  const commentOnPlaylist = (playlistId: string, body: string) => {
    updateMockDb((current) => commentOnPlaylistInDb(current, playlistId, body));
  };

  const likePlaylistComment = (playlistId: string, commentId: string) => {
    updateMockDb((current) => likePlaylistCommentInDb(current, playlistId, commentId));
  };

  const editPlaylist = (playlistId: string, patch: PlaylistDetailsPatch) => {
    updateMockDb((current) => editPlaylistInDb(current, playlistId, patch));
  };

  const addSongToPlaylist = (playlistId: string, song: Song) => {
    updateMockDb((current) => addSongToPlaylistInDb(current, playlistId, song));
  };

  const removeSongFromPlaylist = (playlistId: string, songIndex: number) => {
    updateMockDb((current) => removeSongFromPlaylistInDb(current, playlistId, songIndex));
  };

  const moveSongInPlaylist = (playlistId: string, fromIndex: number, toIndex: number) => {
    updateMockDb((current) => moveSongInPlaylistInDb(current, playlistId, fromIndex, toIndex));
  };

  const deletePlaylist = (playlistId: string) => {
    const playlist = mockDb.playlists.find((item) => item.id === playlistId);
    updateMockDb((current) => deletePlaylistInDb(current, playlistId));
    pushNotice(`Deleted ${playlist?.title || 'playlist'}.`);
  };

  const likePerson = (matchId: string) => {
    // Read latest state via ref to avoid double-charging the quota when two
    // rapid clicks happen before a re-render.
    const existing = mockDbRef.current.matches.find((item) => item.id === matchId);
    if (!existing || existing.passed) return;
    if (existing.youLiked) return; // already liked

    const fresh = readLikeBudget();
    if (fresh.used >= LIKE_QUOTA) {
      const minutes = Math.max(1, Math.ceil((fresh.resetAt - Date.now()) / 60_000));
      pushNotice(`Out of likes — refills in ${minutes < 60 ? `${minutes}m` : `${Math.ceil(minutes / 60)}h`}.`);
      setLikeBudget(fresh);
      return;
    }
    persistLikeBudget({ used: fresh.used + 1, resetAt: fresh.resetAt });

    const becomesMutual = Boolean(existing.theyLikedYou);
    updateMockDb((current) => ({
      ...current,
      matches: current.matches.map((match) => (
        match.id === matchId ? { ...match, youLiked: true, passed: false } : match
      )),
    }));

    if (becomesMutual) {
      pushNotification(`It's a match with ${existing.name}! Say hi.`, `/chat?match=${matchId}`);
    } else {
      pushNotice(`Liked ${existing.name}. They'll see it next time they're on.`);
    }
  };

  const passPerson = (matchId: string) => {
    const existing = mockDb.matches.find((item) => item.id === matchId);
    if (!existing) return;
    updateMockDb((current) => ({
      ...current,
      matches: current.matches.map((match) => (
        match.id === matchId ? { ...match, passed: true, youLiked: false } : match
      )),
    }));
  };

  // Legacy bridge for any remaining callers.
  const reactToMatch = (matchId: string, status: 'liked' | 'passed') => {
    if (status === 'liked') likePerson(matchId);
    else passPerson(matchId);
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
      matches: current.matches.map((match) => ({ ...match, passed: false })),
    }));
    pushNotice('Discover refreshed.');
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

    const initialTarget = mockDbRef.current.matches.find((item) => item.id === matchId)
      || mockDbRef.current.matches.find((item) => !item.passed)
      || mockDbRef.current.matches[0];
    const sendTargetId = matchId || initialTarget?.id || 'jason';

    updateMockDb((current) => ({
      ...current,
      messages: [
        ...current.messages,
        {
          id: `m-${Date.now()}`,
          matchId: sendTargetId,
          from: 'You',
          body: trimmed,
          time: new Intl.DateTimeFormat([], { hour: 'numeric', minute: '2-digit' }).format(new Date()),
        },
      ],
    }));

    const buildAndAppend = () => {
      const snapshot = mockDbRef.current;
      const replyMatch = snapshot.matches.find((item) => item.id === sendTargetId);
      if (!replyMatch || replyMatch.passed) {
        setTypingMatchId((current) => (current === sendTargetId ? null : current));
        return;
      }
      const replyMatchId = replyMatch.id;
      const history = snapshot.messages.filter((m) => m.matchId === replyMatchId);

      const reply = createLocalMatchReply({
        message: trimmed,
        match: replyMatch,
        playlists: snapshot.playlists,
        history,
        fallbackReplies: mockReplies,
      });

      updateMockDb((current) => ({
        ...current,
        messages: [
          ...current.messages,
          {
            from: replyMatch?.name || 'Jason',
            id: `m-${Date.now()}-reply`,
            matchId: replyMatchId,
            body: reply,
            time: new Intl.DateTimeFormat([], { hour: 'numeric', minute: '2-digit' }).format(new Date()),
          },
        ],
      }));

      // Fire side effects AFTER state update — never inside the reducer.
      pushNotification(
        `${replyMatch?.name || 'Jason'}: ${reply.slice(0, 60)}${reply.length > 60 ? '…' : ''}`,
        `/chat?match=${replyMatchId}`,
      );
      setTypingMatchId((current) => (current === replyMatchId ? null : current));
    };

    setTypingMatchId(initialTarget?.id || 'jason');

    const wordCount = trimmed.split(/\s+/).filter(Boolean).length;
    const delay = Math.min(3200, 700 + wordCount * 90 + Math.floor(Math.random() * 900));
    window.setTimeout(buildAndAppend, delay);
  };

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
    discoverMatches: mockDb.matches.filter(isInDiscover),
    likedYouMatches: mockDb.matches.filter(isInLikesInbox),
    mutualMatches: mockDb.matches.filter(isMutualMatch),
    waitingMatches: mockDb.matches.filter(isWaitingOnThem),
    messages: mockDb.messages,
    notifications,
    nowPlaying,
    notice,
    themeMode,
    typingMatchId,
    likesRemaining: Math.max(0, LIKE_QUOTA - likeBudget.used),
    likeQuota: LIKE_QUOTA,
    createPlaylist,
    clearNotice,
    clearNotifications,
    deletePlaylist,
    dismissNotification,
    editPlaylist,
    addSongToPlaylist,
    removeSongFromPlaylist,
    moveSongInPlaylist,
    likePlaylist,
    likePlaylistComment,
    commentOnPlaylist,
    markNotificationsRead,
    playPlaylist,
    reactToMatch,
    likePerson,
    passPerson,
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
    updateUserProfile,
  }), [mode, mockDb, notifications, notice, nowPlaying, themeMode, typingMatchId, likeBudget, user]);

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
};

export function useAppData() {
  const value = useContext(AppDataContext);
  if (!value) {
    throw new Error('useAppData must be used inside AppDataProvider');
  }
  return value;
}
