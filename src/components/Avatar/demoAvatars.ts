/**
 * Self-contained demo avatar portraits for docs and stories.
 *
 * The Avatar showcase (website page + Storybook stories) needs sample photos to
 * demonstrate the image state. Pointing at a third-party host (e.g. pravatar.cc)
 * made the docs depend on an external service — when it was rate-limited or
 * blocked, every avatar rendered as a broken image with alt text bleeding
 * through the circle. These inline SVG data URIs render the same everywhere with
 * no network request, so the docs stay self-contained.
 *
 * The pigments are deliberately theme-frozen — the same face must read as the
 * same person in light and dark — so they are literals, not tokens. The first
 * portrait's background snapshots the brand teal primitive.
 */

const portrait = (bg: string, accent: string): string => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">
    <rect width="96" height="96" fill="${bg}"/>
    <circle cx="48" cy="38" r="17" fill="${accent}"/>
    <path d="M18 84c0-16.6 13.4-30 30-30s30 13.4 30 30z" fill="${accent}"/>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

/** Distinct demo portraits so multiple avatars in a row read as different people. */
export const demoAvatar1 = portrait('#0E6E8F', '#8FD3E8');
export const demoAvatar2 = portrait('#C05B8B', '#F3C6DC');
export const demoAvatar3 = portrait('#4E7A3A', '#C7E6B2');
