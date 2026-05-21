import type { Song } from '../data/demo';
import type { MockDb } from '../services/mockDb';
import type { CreatePlaylistInput, PlaylistDetailsPatch } from './appDataTypes';
import { starterSongs } from './appDataConfig';

export function createPlaylistInDb(current: MockDb, input?: CreatePlaylistInput): MockDb {
  return {
    ...current,
    playlists: [
      {
        id: `my-real-mix-${Date.now()}`,
        title: input?.title?.trim() || 'My Real Mix',
        description: input?.description?.trim() || 'A UI-only playlist seeded with real tracks you can edit later.',
        image: input?.image || current.playlists[0]?.image,
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
  };
}

export function likePlaylistInDb(current: MockDb, playlistId: string): MockDb {
  return {
    ...current,
    playlists: current.playlists.map((playlist) => (
      playlist.id === playlistId ? { ...playlist, likes: playlist.likes + 1 } : playlist
    )),
  };
}

export function commentOnPlaylistInDb(current: MockDb, playlistId: string, body: string): MockDb {
  const trimmed = body.trim();
  if (!trimmed) return current;

  return {
    ...current,
    playlists: current.playlists.map((playlist) => (
      playlist.id === playlistId
        ? {
            ...playlist,
            comments: [
              ...playlist.comments,
              {
                id: `c-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                user: current.user.displayName,
                avatar: '',
                body: trimmed,
                likes: 0,
              },
            ],
          }
        : playlist
    )),
  };
}

export function likePlaylistCommentInDb(current: MockDb, playlistId: string, commentId: string): MockDb {
  return {
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
  };
}

export function editPlaylistInDb(current: MockDb, playlistId: string, patch: PlaylistDetailsPatch): MockDb {
  return {
    ...current,
    playlists: current.playlists.map((playlist) => (
      playlist.id === playlistId
        ? {
            ...playlist,
            title: patch.title !== undefined ? patch.title : playlist.title,
            description: patch.description !== undefined ? patch.description : playlist.description,
            image: patch.image !== undefined ? patch.image : playlist.image,
          }
        : playlist
    )),
  };
}

export function addSongToPlaylistInDb(current: MockDb, playlistId: string, song: Song): MockDb {
  return {
    ...current,
    playlists: current.playlists.map((playlist) => (
      playlist.id === playlistId ? { ...playlist, songs: [...playlist.songs, song] } : playlist
    )),
  };
}

export function removeSongFromPlaylistInDb(current: MockDb, playlistId: string, songIndex: number): MockDb {
  return {
    ...current,
    playlists: current.playlists.map((playlist) => (
      playlist.id === playlistId
        ? { ...playlist, songs: playlist.songs.filter((_, index) => index !== songIndex) }
        : playlist
    )),
  };
}

export function moveSongInPlaylistInDb(current: MockDb, playlistId: string, fromIndex: number, toIndex: number): MockDb {
  if (fromIndex === toIndex) return current;

  return {
    ...current,
    playlists: current.playlists.map((playlist) => {
      if (playlist.id !== playlistId) return playlist;
      const songs = [...playlist.songs];
      const clampedFrom = Math.max(0, Math.min(fromIndex, songs.length - 1));
      const clampedTo = Math.max(0, Math.min(toIndex, songs.length - 1));
      if (clampedFrom === clampedTo) return playlist;
      const [moved] = songs.splice(clampedFrom, 1);
      songs.splice(clampedTo, 0, moved);
      return { ...playlist, songs };
    }),
  };
}

export function deletePlaylistInDb(current: MockDb, playlistId: string): MockDb {
  return {
    ...current,
    playlists: current.playlists.filter((item) => item.id !== playlistId),
  };
}
