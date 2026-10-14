/**
 * Preview images for the attachment demos. The pictures and the document
 * page are files in public/images/attachments. The showcase pages and the
 * component previews draw from here, and the library's stories keep their
 * own copy of the same files.
 */

const photo = (name: string) => `/images/attachments/photo-${name}.jpg`;

/** Seven square pictures, for grids and galleries. */
export const PHOTOS = ["1", "2", "3", "4", "5", "6", "7"].map(photo);

/** A wide picture, 768 by 480, for the aspect-ratio cases. */
export const PHOTO_LANDSCAPE = photo("wide");

/** A tall picture, 549 by 768. */
export const PHOTO_PORTRAIT = photo("tall");

/** A square picture. */
export const PHOTO_SQUARE = PHOTOS[2];

/** The first page of a document, as a host would render it for a PDF: a letter page, 1200 by 1553. */
export const DOCUMENT_FIRST_PAGE = "/images/attachments/document-page.png";
