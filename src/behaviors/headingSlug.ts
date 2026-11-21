/**
 * headingSlug: a URL fragment from a heading's text, lower case, words
 * joined by hyphens, accents and punctuation dropped. The one home of the
 * rule, so the ids Heading's and SectionTitle's `anchor` write and the ones
 * AnchorNav's `fromHeadings` gives an unnamed heading always agree.
 * Heading re-exports it for hosts that link to a section by its text.
 */
export const headingSlug = (text: string): string =>
  text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '');
