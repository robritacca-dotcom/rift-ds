/**
 * The type mark the attachment family shares: what kind of file this is,
 * drawn once so a tile and the viewer's header can never disagree.
 *
 * Two forms. The icon form is one square glyph: a well-known format is a
 * file silhouette in its `--color-file-*` role with its label lettered
 * beneath in a text colour, and every other file is its extension on a
 * neutral badge. Either
 * way the mark fills the same square box as the spinner and the state
 * glyphs a tile swaps it for, so nothing moves when a file changes state.
 * The badge form is the label alone, for the corner of a preview where an
 * icon would be too small to read.
 *
 * Internal to the family and written with createElement rather than JSX so
 * it can stay a plain module: a second `.tsx` in the folder would join the
 * package barrel as a component of its own.
 */

import { createElement } from 'react';
import type { ReactElement } from 'react';
import { FILE_KINDS, getFileTypeLabel } from './fileTypes';
import type { FileKind } from './fileTypes';

const BASE = 'ds-attachment-mark';

/**
 * The lettered file glyph, drawn in one 32-unit square: a page with a
 * folded corner in the upper two thirds, as wide as the circle of a state glyph, the label across the foot. The
 * lettering is part of the drawing, sized in the glyph's own units like a
 * stroke width, so it scales with the mark instead of sitting on the type
 * scale.
 */
const glyph = (label: string): ReactElement =>
  createElement(
    'svg',
    { className: `${BASE}__glyph`, viewBox: '0 0 32 32', 'aria-hidden': true, focusable: false },
    createElement('path', {
      fill: 'currentColor',
      d: 'M8.5 1A2.5 2.5 0 0 0 6 3.5v14.5a2.5 2.5 0 0 0 2.5 2.5h15a2.5 2.5 0 0 0 2.5-2.5V8.6a1.5 1.5 0 0 0-.44-1.06l-6.1-6.1A1.5 1.5 0 0 0 18.4 1H8.5Z',
    }),
    createElement('path', {
      className: `${BASE}__fold`,
      d: 'M18.5 1.6v4.65c0 .97.78 1.75 1.75 1.75h4.65l-6.4-6.4Z',
    }),
    createElement(
      'text',
      {
        className: `${BASE}__letters`,
        x: 16,
        y: 31,
        textAnchor: 'middle',
        // A long override is squeezed to the glyph's width rather than spilling out of it
        ...(label.length > 3 ? { textLength: 30, lengthAdjust: 'spacingAndGlyphs' } : {}),
      },
      label,
    ),
  );

/**
 * Render the type mark for a file. `typeLabel` overrides the derived label.
 * The label is drawn, not announced: the mark is decoration beside a file
 * name that already carries the extension.
 */
export function renderTypeMark(
  name: string,
  kind: FileKind,
  options: { typeLabel?: string; form?: 'icon' | 'badge' } = {},
): ReactElement {
  const { typeLabel, form = 'icon' } = options;
  const label = typeLabel ?? getFileTypeLabel(name, kind);
  const colored = FILE_KINDS[kind].colored;
  const tone = colored ? `${BASE}--${kind}` : `${BASE}--neutral`;

  if (form === 'badge') {
    return createElement(
      'span',
      { className: `${BASE} ${BASE}--badge ${tone}`, 'aria-hidden': true },
      // A well-known format keeps its colour as a dot beside the label:
      // the label itself stays in a text colour, so it reads on any theme
      colored ? createElement('span', { className: `${BASE}__dot` }) : null,
      label,
    );
  }
  return createElement(
    'span',
    { className: `${BASE} ${BASE}--icon ${tone}`, 'aria-hidden': true },
    colored ? glyph(label) : createElement('span', { className: `${BASE}__chip` }, label),
  );
}
