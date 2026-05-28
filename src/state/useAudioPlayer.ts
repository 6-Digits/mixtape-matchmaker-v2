import { useCallback, useRef, useState } from 'react';
import type { Playlist, Song } from '../data/demo';
import { lookupPreview } from '../services/musicApi';
import { claimAudio, releaseAudio } from '../services/audioBus';
import type { NowPlaying } from './appDataTypes';

export function useAudioPlayer(pushNotice: (message: string) => void) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [nowPlaying, setNowPlaying] = useState<NowPlaying | null>(null);

  const stopPlayback = useCallback(() => {
    audioRef.current?.pause();
    audioRef.current = null;
    setNowPlaying(null);
    releaseAudio(stopPlaybackRef.current);
  }, []);
  const stopPlaybackRef = useRef(stopPlayback);
  stopPlaybackRef.current = stopPlayback;

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
      const hit = await lookupPreview(song.title, song.artist);
      const previewUrl = hit?.previewUrl;
      if (!previewUrl) throw new Error('No preview found');

      audioRef.current?.pause();
      const audio = new Audio(previewUrl);
      audioRef.current = audio;
      claimAudio(stopPlaybackRef.current);

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
    if (!audio) return;

    if (audio.paused) {
      audio.play()
        .then(() => setNowPlaying((current) => (current ? { ...current, playing: true } : current)))
        .catch(() => setNowPlaying((current) => (current ? { ...current, playing: false } : current)));
    } else {
      audio.pause();
      setNowPlaying((current) => (current ? { ...current, playing: false } : current));
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
      setNowPlaying((current) => (current ? { ...current, position: 0 } : current));
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
    setNowPlaying((current) => (current ? { ...current, position: clamped } : current));
  };

  return {
    nextTrack,
    nowPlaying,
    playPlaylist,
    previousTrack,
    seekTo,
    stopPlayback,
    togglePlayback,
  };
}
