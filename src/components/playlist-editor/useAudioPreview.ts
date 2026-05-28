import { useEffect, useRef, useState } from 'react';
import { lookupPreview, type SongHit } from '../../services/musicApi';
import { claimAudio, releaseAudio } from '../../services/audioBus';
import { previewKeyFor, type PreviewKey, type PreviewableSong } from './preview';

export function useAudioPreview(open: boolean) {
  const [previewKey, setPreviewKey] = useState<PreviewKey | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const stopRef = useRef<() => void>(() => {});

  const stopPreview = () => {
    audioRef.current?.pause();
    audioRef.current = null;
    setPreviewKey(null);
    setPreviewLoading(false);
    releaseAudio(stopRef.current);
  };
  stopRef.current = stopPreview;

  useEffect(() => {
    if (!open) stopPreview();
    return stopPreview;
  }, [open]);

  const playPreview = async (song: PreviewableSong) => {
    const key = previewKeyFor(song);
    if (previewKey === key) {
      stopPreview();
      return;
    }

    stopPreview();
    setPreviewLoading(true);
    setPreviewKey(key);

    try {
      const explicitUrl = (song as SongHit).previewUrl;
      const previewUrl = explicitUrl || (await lookupPreview(song.title, song.artist))?.previewUrl;
      if (!previewUrl) {
        setPreviewLoading(false);
        setPreviewKey(null);
        return;
      }

      const audio = new Audio(previewUrl);
      audioRef.current = audio;
      claimAudio(stopRef.current);
      audio.addEventListener('ended', () => {
        if (audioRef.current === audio) stopPreview();
      });
      await audio.play();
      setPreviewLoading(false);
    } catch {
      stopPreview();
    }
  };

  return {
    playPreview,
    previewKey,
    previewLoading,
    stopPreview,
  };
}
