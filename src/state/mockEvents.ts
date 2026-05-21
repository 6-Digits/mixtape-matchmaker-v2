import { isMutualMatch } from '../data/demo';
import { generateIncomingMessage } from '../services/chatbot';
import type { MockDb } from '../services/mockDb';
import { generateRandomMatch } from '../services/randomMatch';

const MAX_MATCHES = 12;

export type MockEventNotice = { message: string; target?: string };
export type MockEventResult = { db: MockDb; notice: MockEventNotice | null };

function formatTime() {
  return new Intl.DateTimeFormat([], { hour: 'numeric', minute: '2-digit' }).format(new Date());
}

export function applyRandomMockEvent(current: MockDb): MockEventResult {
  const action = Math.random();
  const playlistIndex = Math.floor(Math.random() * current.playlists.length);
  const matchIndex = Math.floor(Math.random() * current.matches.length);
  const playlist = current.playlists[playlistIndex];
  const match = current.matches[matchIndex];
  if (!playlist || !match) return { db: current, notice: null };

  if (action < 0.1 && current.matches.length < MAX_MATCHES) {
    const newMatch = generateRandomMatch(current.matches, current.playlists);
    if (!newMatch) return { db: current, notice: null };

    return {
      db: { ...current, matches: [{ ...newMatch, theyLikedYou: false, youLiked: false }, ...current.matches] },
      notice: { message: `Someone new in your discover stack: ${newMatch.name}.`, target: '/discover' },
    };
  }

  if (action < 0.22) {
    const candidates = current.matches.filter((m) => !m.theyLikedYou && !m.youLiked && !m.passed);
    if (candidates.length === 0) return { db: current, notice: null };

    const liker = candidates[Math.floor(Math.random() * candidates.length)];
    return {
      db: {
        ...current,
        matches: current.matches.map((m) => (m.id === liker.id ? { ...m, theyLikedYou: true } : m)),
      },
      notice: { message: `${liker.name} liked your taste.`, target: '/discover' },
    };
  }

  if (action < 0.32) {
    const candidates = current.matches.filter((m) => m.youLiked && !m.theyLikedYou && !m.passed);
    if (candidates.length === 0) return { db: current, notice: null };

    const liker = candidates[Math.floor(Math.random() * candidates.length)];
    return {
      db: {
        ...current,
        matches: current.matches.map((m) => (m.id === liker.id ? { ...m, theyLikedYou: true } : m)),
      },
      notice: { message: `It's a match with ${liker.name}!`, target: `/chat?match=${liker.id}` },
    };
  }

  if (action < 0.45) {
    return {
      db: {
        ...current,
        playlists: current.playlists.map((item, index) => (
          index === playlistIndex ? { ...item, likes: item.likes + 1 } : item
        )),
      },
      notice: null,
    };
  }

  if (action < 0.75) {
    const mutuals = current.matches.filter(isMutualMatch);
    const chatter = mutuals.length > 0 ? mutuals[Math.floor(Math.random() * mutuals.length)] : null;
    if (!chatter) return { db: current, notice: null };

    const matchPlaylist = current.playlists.find((p) => p.title === chatter.playlist) ?? playlist;
    const body = generateIncomingMessage(chatter, matchPlaylist);
    return {
      db: {
        ...current,
        messages: [
          ...current.messages,
          {
            from: chatter.name,
            id: `m-${Date.now()}`,
            matchId: chatter.id,
            body,
            time: formatTime(),
          },
        ],
      },
      notice: {
        message: `${chatter.name}: ${body.slice(0, 60)}${body.length > 60 ? '...' : ''}`,
        target: `/chat?match=${chatter.id}`,
      },
    };
  }

  return {
    db: {
      ...current,
      matches: current.matches.map((item, index) => (
        index === matchIndex && !item.passed ? { ...item, score: Math.min(99, item.score + 1) } : item
      )),
    },
    notice: null,
  };
}
