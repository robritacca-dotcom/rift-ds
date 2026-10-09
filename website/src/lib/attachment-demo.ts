/**
 * Preview images for the attachment demos. The pictures are files in
 * public/images/attachments; the document page is an inline SVG. The
 * showcase pages and the component previews draw from here, and the
 * library's stories keep their own copy of the same pictures.
 */

const svg = (markup: string) => `data:image/svg+xml;utf8,${encodeURIComponent(markup)}`;

const photo = (name: string) => `/images/attachments/photo-${name}.jpg`;

/** Seven square pictures, for grids and galleries. */
export const PHOTOS = ["1", "2", "3", "4", "5", "6", "7"].map(photo);

/** A wide picture, 768 by 480, for the aspect-ratio cases. */
export const PHOTO_LANDSCAPE = photo("wide");

/** A tall picture, 549 by 768. */
export const PHOTO_PORTRAIT = photo("tall");

/** A square picture. */
export const PHOTO_SQUARE = PHOTOS[2];

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
