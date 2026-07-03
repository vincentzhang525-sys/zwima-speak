/** Deterministic seeded RNG — same seed always yields same conversation */

export function createConversationSeed(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function hashSeed(seed: string, salt: string): number {
  const s = `${seed}:${salt}`;
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function seededUnit(seed: string, salt: string): number {
  return hashSeed(seed, salt) / 4294967296;
}

export function pickOne<T>(seed: string, salt: string, items: readonly T[]): T {
  const idx = Math.floor(seededUnit(seed, salt) * items.length);
  return items[Math.min(idx, items.length - 1)];
}

export function pickRange(seed: string, salt: string, min: number, max: number): number {
  return min + seededUnit(seed, salt) * (max - min);
}

export function shufflePick<T>(seed: string, salt: string, items: readonly T[], count: number): T[] {
  const copy = [...items];
  const out: T[] = [];
  for (let i = 0; i < count && copy.length > 0; i++) {
    const idx = Math.floor(seededUnit(seed, `${salt}:${i}`) * copy.length);
    out.push(copy.splice(idx, 1)[0]);
  }
  return out;
}
