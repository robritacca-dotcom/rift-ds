/**
 * Conversation starters: the welcome screen's first guess at why someone
 * opened the chat.
 *
 * A host holds a pool of pre-written questions per context (per page, per
 * screen) and a seeded pick draws a few of them. The seed lives in the chat
 * provider: rolled once per load and again on "New chat", so a refresh or a
 * fresh conversation shows a different mix while re-renders never reshuffle
 * under the visitor. Pre-written on purpose: the variety is theatre, not
 * tokens, and no model is asked for any of these.
 *
 * Every label has to fit on one chip (SUGGESTION_MAX_CHARS); the widget
 * drops one that does not rather than clipping it.
 */
import { fitsChip } from './suggestions';
import type { Starter } from './types';

export type { Starter };

/** How many chips the welcome screen shows, drawn from a pool. */
export const STARTER_COUNT = 3;

/** The named wording when it fits the chip, the unnamed one when it does not. */
export const namedStarter = (withName: string, without: string): string =>
  fitsChip(withName) ? withName : without;

/* FNV-1a over the key, so each context draws a different slice of the
   load's seed: two pages seen in one visit should not echo each other. */
export function hashString(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/* mulberry32, a tiny deterministic PRNG. Deterministic matters more than
   quality here: the same (seed, key) must pick the same chips on every
   render, or the set would churn as the visitor types. */
export function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Draw STARTER_COUNT starters from a pool, deterministically for a given
 * (seed, key) pair. A null seed returns the head of the pool unshuffled:
 * pools lead with their strongest questions, so callers without a seed (and
 * a server, if one ever renders this) get the curated order.
 */
export function pickStarters(pool: Starter[], seed: number | null, key: string): Starter[] {
  if (pool.length <= STARTER_COUNT) return pool;
  if (seed === null) return pool.slice(0, STARTER_COUNT);
  const rand = mulberry32(hashString(key) ^ Math.floor(seed * 0xffffffff));
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, STARTER_COUNT);
}
