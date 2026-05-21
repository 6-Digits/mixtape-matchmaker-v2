import type { PaletteMode } from '@mui/material';
import type { ChatMessage, Match, Playlist, Song } from '../data/demo';

export type AppMode = 'checking' | 'mock' | 'server';

export type AppUser = {
  id: string;
  displayName: string;
  provider: 'mock' | 'server';
  image?: string;
  bio?: string;
  location?: string;
  lookingFor?: string;
  favoriteTrack?: string;
  favoritePlaylist?: string;
  taste?: string;
  profileTags?: string[];
};

export type UserProfilePatch = Partial<Pick<
  AppUser,
  'bio' | 'displayName' | 'favoritePlaylist' | 'favoriteTrack' | 'image' | 'location' | 'lookingFor' | 'profileTags' | 'taste'
>>;

export type PlaylistDetailsPatch = {
  title?: string;
  description?: string;
  image?: string;
};

export type CreatePlaylistInput = {
  title?: string;
  description?: string;
  image?: string;
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

export type AppDataContextValue = {
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
  likesRemaining: number;
  likeQuota: number;
  createPlaylist: (input?: CreatePlaylistInput) => void;
  clearNotice: () => void;
  clearNotifications: () => void;
  deletePlaylist: (playlistId: string) => void;
  dismissNotification: (notificationId: string) => void;
  editPlaylist: (playlistId: string, patch: PlaylistDetailsPatch) => void;
  addSongToPlaylist: (playlistId: string, song: Song) => void;
  removeSongFromPlaylist: (playlistId: string, songIndex: number) => void;
  moveSongInPlaylist: (playlistId: string, fromIndex: number, toIndex: number) => void;
  likePlaylist: (playlistId: string) => void;
  likePlaylistComment: (playlistId: string, commentId: string) => void;
  commentOnPlaylist: (playlistId: string, body: string) => void;
  markNotificationsRead: () => void;
  playPlaylist: (playlist: Playlist, startIndex?: number) => Promise<void>;
  reactToMatch: (matchId: string, status: 'liked' | 'passed') => void;
  likePerson: (matchId: string) => void;
  passPerson: (matchId: string) => void;
  discoverMatches: Match[];
  likedYouMatches: Match[];
  mutualMatches: Match[];
  waitingMatches: Match[];
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
  updateUserProfile: (patch: UserProfilePatch) => void;
};
