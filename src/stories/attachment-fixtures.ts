/**
 * Preview images for the attachment stories. The pictures are bundled
 * files, so a story needs no network and its snapshot never changes with a
 * remote one; the document page is an inline SVG. Storybook-only: nothing
 * here ships in the package.
 */

import photo1 from './assets/attachments/photo-1.jpg';
import photo2 from './assets/attachments/photo-2.jpg';
import photo3 from './assets/attachments/photo-3.jpg';
import photo4 from './assets/attachments/photo-4.jpg';
import photo5 from './assets/attachments/photo-5.jpg';
import photo6 from './assets/attachments/photo-6.jpg';
import photo7 from './assets/attachments/photo-7.jpg';
import photoTall from './assets/attachments/photo-tall.jpg';
import photoWide from './assets/attachments/photo-wide.jpg';

const svg = (markup: string) => `data:image/svg+xml;utf8,${encodeURIComponent(markup)}`;

/** Seven square pictures, for grids and galleries. */
export const PHOTOS = [photo1, photo2, photo3, photo4, photo5, photo6, photo7];

/** A wide picture, 768 by 480, for the aspect-ratio cases. */
export const PHOTO_LANDSCAPE = photoWide;

/** A tall picture, 549 by 768. */
export const PHOTO_PORTRAIT = photoTall;

/** A square picture. */
export const PHOTO_SQUARE = photo3;

/** The first page of a document, as a host would render it for a PDF. */
export const DOCUMENT_FIRST_PAGE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
    <rect width="400" height="400" fill="#FFFFFF"/>
    <rect x="36" y="34" width="210" height="16" rx="3" fill="#2B2B2B"/>
    <rect x="36" y="64" width="328" height="3" fill="#2B2B2B"/>
    ${[92, 110, 128, 164, 182, 200, 218, 254, 272, 290, 326, 344]
      .map((y, i) => `<rect x="36" y="${y}" width="${[300, 328, 250, 320, 290, 328, 180, 310, 328, 220, 300, 260][i]}" height="7" rx="3" fill="#B9B9B9"/>`)
      .join('')}
  </svg>`,
);
