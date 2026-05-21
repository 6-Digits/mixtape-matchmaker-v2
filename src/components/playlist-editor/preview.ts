import type { Song } from '../../data/demo';
import type { SongHit } from '../../services/musicApi';

export type PreviewableSong = Song | SongHit;
export type PreviewKey = string;

export function previewKeyFor(song: PreviewableSong) {
  return `${song.title}::${song.artist}`;
}
