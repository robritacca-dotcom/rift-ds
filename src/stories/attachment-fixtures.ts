/**
 * Preview images for the attachment stories. The pictures and the document
 * page are bundled files, so a story needs no network and its snapshot
 * never changes with a remote one. Storybook-only: nothing here ships in
 * the package.
 */

import documentPage from './assets/attachments/document-page.png';
import photo1 from './assets/attachments/photo-1.jpg';
import photo2 from './assets/attachments/photo-2.jpg';
import photo3 from './assets/attachments/photo-3.jpg';
import photo4 from './assets/attachments/photo-4.jpg';
import photo5 from './assets/attachments/photo-5.jpg';
import photo6 from './assets/attachments/photo-6.jpg';
import photo7 from './assets/attachments/photo-7.jpg';
import photoTall from './assets/attachments/photo-tall.jpg';
import photoWide from './assets/attachments/photo-wide.jpg';

/** Seven square pictures, for grids and galleries. */
export const PHOTOS = [photo1, photo2, photo3, photo4, photo5, photo6, photo7];

/** A wide picture, 768 by 480, for the aspect-ratio cases. */
export const PHOTO_LANDSCAPE = photoWide;

/** A tall picture, 549 by 768. */
export const PHOTO_PORTRAIT = photoTall;

/** A square picture. */
export const PHOTO_SQUARE = photo3;

/** The first page of a document, as a host would render it for a PDF: a letter page, 1200 by 1553. */
export const DOCUMENT_FIRST_PAGE = documentPage;
