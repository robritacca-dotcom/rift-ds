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

/** A one-page statement as a PDF, generated for the stories, base64-encoded. */
export const STATEMENT_PDF = 'JVBERi0xLjQKMSAwIG9iago8PCAvVHlwZSAvQ2F0YWxvZyAvUGFnZXMgMiAwIFIgPj4KZW5kb2JqCjIgMCBvYmoKPDwgL1R5cGUgL1BhZ2VzIC9LaWRzIFszIDAgUl0gL0NvdW50IDEgPj4KZW5kb2JqCjMgMCBvYmoKPDwgL1R5cGUgL1BhZ2UgL1BhcmVudCAyIDAgUiAvTWVkaWFCb3ggWzAgMCA2MTIgNzkyXSAvQ29udGVudHMgNCAwIFIgL1Jlc291cmNlcyA8PCAvRm9udCA8PCAvRjEgNSAwIFIgPj4gPj4gPj4KZW5kb2JqCjQgMCBvYmoKPDwgL0xlbmd0aCAxMzMgPj4Kc3RyZWFtCkJUIC9GMSAyNCBUZiA3MiA3MjAgVGQgKFN0YXRlbWVudCwgT2N0b2JlciAyMDI2KSBUaiBFVApCVCAvRjEgMTIgVGYgNzIgNjkwIFRkIChOb3J0aHdpbmQgU3VwcGx5IEx0ZC4gQ2xvc2luZyBiYWxhbmNlIDEyLDk1MC43NSkgVGogRVQKZW5kc3RyZWFtCmVuZG9iago1IDAgb2JqCjw8IC9UeXBlIC9Gb250IC9TdWJ0eXBlIC9UeXBlMSAvQmFzZUZvbnQgL0hlbHZldGljYSA+PgplbmRvYmoKeHJlZgowIDYKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDA5IDAwMDAwIG4gCjAwMDAwMDAwNTggMDAwMDAgbiAKMDAwMDAwMDExNSAwMDAwMCBuIAowMDAwMDAwMjQxIDAwMDAwIG4gCjAwMDAwMDA0MjUgMDAwMDAgbiAKdHJhaWxlcgo8PCAvU2l6ZSA2IC9Sb290IDEgMCBSID4+CnN0YXJ0eHJlZgo0OTUKJSVFT0YK';

/** The statement as a blob address, which a browser embeds where it refuses a data address. Call it once per story. */
export function statementPdfUrl(): string {
  const bytes = Uint8Array.from(atob(STATEMENT_PDF), (c) => c.charCodeAt(0));
  return URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
}

/** A short contract as a text file, as a data address. */
export const CONTRACT_TXT = `data:text/plain;charset=utf-8,${encodeURIComponent(
  'SUPPLY AGREEMENT\n\n1. Parties. This agreement is between Northwind Supply Ltd and the buyer.\n\n2. Term. Twelve months from the start date, renewing for a further twelve unless either party gives sixty days notice.\n\n3. Payment. Invoices are due thirty days from issue.\n'.repeat(4),
)}`;
