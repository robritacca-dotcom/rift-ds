/**
 * template-thumbnails.mjs
 *
 * The one definition of the playground's template thumbnails, shared by the
 * capture script and the validator: which templates have one, and where
 * each mode's file lives. The playground's Templates rail
 * (website/src/app/playground/TemplatesRail.tsx) builds the same paths from
 * the same list, templatesSidebarLinks less the phone-only screens, which
 * have no desktop picture to show (the mobile dashboard rides the Mobile
 * stage as the marketing dashboard's phone counterpart instead), and less
 * the screens flagged hideFromPlayground.
 */
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readNavLinks } from './nav-links.mjs';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');

/** Where the thumbnails live on disk; served from /images/templates/. */
export const THUMBNAIL_DIR = join(repoRoot, 'website', 'public', 'images', 'templates');

/** Both colour modes, each shot in its own: the rail shows the visitor's. */
export const THUMBNAIL_MODES = ['light', 'dark'];

/** The templates the rail offers, from templatesSidebarLinks. */
export const thumbnailTemplates = () =>
  readNavLinks('templatesSidebarLinks')
    .filter((link) => !link.mobileOnly && !link.hideFromPlayground)
    .map((link) => ({ ...link, slug: link.href.split('/').pop() }));

/** One template's file name in one mode. */
export const thumbnailFile = (slug, mode) => `${slug}-${mode}.jpg`;
