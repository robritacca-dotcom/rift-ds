/**
 * The ink side of PixelAvatar, kept apart from the component so a host that
 * lays out a list can compute its inks without rendering anything. The
 * component re-exports everything here; this module has no subpath of its
 * own.
 */

/** One of the six pixel inks, by token number. */
export type PixelInk = 1 | 2 | 3 | 4 | 5 | 6;

/* How many pixel inks there are. The `--color-pixel-ink-*` tokens are the
   authority for the colours; the stylesheet has one rule per ink, and the
   counts must match. */
const INKS = 6;

/** FNV-1a, 32-bit: a small stable hash of a name. */
export function hashName(name: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < name.length; i += 1) {
    hash ^= name.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/** The ink a name picks for itself: stable, and one of six. */
export function pixelAvatarInk(name: string): PixelInk {
  return ((hashName(`${name}:colour`) % INKS) + 1) as PixelInk;
}

/**
 * Inks for a list of names shown together, in order, so neighbours are told
 * apart by colour as well as by shape. Each name keeps the ink it picks for
 * itself when that ink is still among the least used in the list so far and
 * sits clear of the row before it; otherwise it takes the next ink round the
 * set that does. "Clear" means at least two steps away on the hue ring the
 * inks are numbered round (red, orange, yellow, green, blue, purple), so a
 * row never follows its own colour or the hue beside it: a muted theme
 * draws neighbouring hues close together, and two warm tans in a row read
 * as the same mark. The first six names therefore all differ, and a longer
 * list repeats as evenly as it can. Deterministic
 * for a given list, so server and client agree; a name's ink can change when
 * the list around it does, which is the price of the guarantee.
 */
export function distinctPixelInks(names: readonly string[]): PixelInk[] {
  const used = new Array<number>(INKS).fill(0);
  const inks: PixelInk[] = [];
  names.forEach((name) => {
    const own = pixelAvatarInk(name) - 1;
    const fewest = Math.min(...used);
    const previous = inks.length > 0 ? inks[inks.length - 1] - 1 : -1;
    /* Three tiers, best first: clear of the row before by two hue steps,
       merely different from it, or (when the least-used inks leave no
       choice) whatever is least used. */
    let clear = -1;
    let different = -1;
    let any = -1;
    for (let step = 0; step < INKS; step += 1) {
      const candidate = (own + step) % INKS;
      if (used[candidate] !== fewest) continue;
      if (any === -1) any = candidate;
      if (candidate === previous) continue;
      if (different === -1) different = candidate;
      const apart = Math.abs(candidate - previous);
      if (previous === -1 || Math.min(apart, INKS - apart) >= 2) {
        clear = candidate;
        break;
      }
    }
    const chosen = clear !== -1 ? clear : different !== -1 ? different : any;
    used[chosen] += 1;
    inks.push((chosen + 1) as PixelInk);
  });
  return inks;
}
