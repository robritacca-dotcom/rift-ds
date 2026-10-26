import { Nunito_Sans } from 'next/font/google';

/**
 * The base theme's typeface, Nunito Sans, self-hosted by Next at build time.
 * Put `riftFont.variable` on <html> in your root layout and import
 * ./font.css after the tokens: together they point the library's
 * --font-family-primary at this face. To use your own face, swap the import
 * here and keep the variable name.
 */
export const riftFont = Nunito_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '600', '700'],
  variable: '--font-rift-primary',
});
