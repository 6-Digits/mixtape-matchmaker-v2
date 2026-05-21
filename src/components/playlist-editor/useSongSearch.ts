import { useEffect, useRef, useState } from 'react';
import { searchSongs, type SongHit } from '../../services/musicApi';

export function useSongSearch(open: boolean) {
  const [query, setQuery] = useState('');
  const [options, setOptions] = useState<SongHit[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<SongHit | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const resetSearch = () => {
    abortRef.current?.abort();
    setQuery('');
    setOptions([]);
    setSearching(false);
    setSelected(null);
  };

  useEffect(() => {
    if (!open) return;
    const trimmed = query.trim();
    if (trimmed.length < 2 || selected?.title?.toLowerCase() === trimmed.toLowerCase()) {
      setOptions([]);
      setSearching(false);
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setSearching(true);

    const handle = window.setTimeout(async () => {
      try {
        const hits = await searchSongs(trimmed, controller.signal);
        if (!controller.signal.aborted) {
          setOptions(hits);
          setSearching(false);
        }
      } catch (error) {
        if ((error as Error).name !== 'AbortError') setSearching(false);
      }
    }, 250);

    return () => {
      window.clearTimeout(handle);
      controller.abort();
    };
  }, [query, open, selected]);

  return {
    options,
    query,
    resetSearch,
    searching,
    selected,
    setQuery,
    setSelected,
  };
}
