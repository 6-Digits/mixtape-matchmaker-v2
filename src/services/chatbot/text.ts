export function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function containsAny(haystack: string, words: string[]) {
  return words.some((word) => {
    if (word.includes(' ') || word.includes("'")) return haystack.includes(word);
    return new RegExp(`\\b${escapeRegExp(word)}\\b`, 'i').test(haystack);
  });
}

export function hash(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i += 1) {
    h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return h;
}

export function pick<T>(items: T[], seed: string, avoid?: string): T {
  const filtered = avoid ? items.filter((item) => String(item) !== avoid) : items;
  const pool = filtered.length > 0 ? filtered : items;
  return pool[hash(seed) % pool.length];
}
