/**
 * The fill an initials Avatar takes, apart from the component so a
 * server-rendered AvatarGroup can spread its fills without importing a
 * client module. Internal: the public name is AvatarFill, re-exported from
 * Avatar.
 */

import { hashName } from '../PixelAvatar/pixelInks';

/** One of the six avatar fills, by token number (`--color-avatar-bg-*`). */
export type AvatarFill = 1 | 2 | 3 | 4 | 5 | 6;

/* The fill a name picks for itself. FNV-1a alone leaves its low bits
   clumped on short names (four of six sample names landed on one fill),
   so the hash is run through a 32-bit finaliser before the remainder. */
export const avatarFill = (name: string): AvatarFill => {
  let hash = hashName(name);
  hash ^= hash >>> 16;
  hash = Math.imul(hash, 0x7feb352d);
  hash ^= hash >>> 15;
  hash = Math.imul(hash, 0x846ca68b);
  hash ^= hash >>> 16;
  return (((hash >>> 0) % 6) + 1) as AvatarFill;
};
