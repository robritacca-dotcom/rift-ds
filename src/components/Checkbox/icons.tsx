/* ============================================
   CONTROL GLYPHS
   The one check and the one minus the form
   controls draw: inline SVG, stroked in
   currentColor, so every control that shows a
   tick shows the same tick. Checkbox's box, the
   switch's thumb and every indicator built from
   them import these rather than a font glyph.
   ============================================ */

/** The check glyph. `className` sizes and colours it from the host's stylesheet. */
export const CheckIcon = ({ className = 'ds-checkbox__icon' }: { className?: string }) => (
  <svg
    className={className}
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M2 7.5L5.5 11L12 3"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/** The minus glyph, for an indeterminate checkbox. */
export const MinusIcon = ({ className = 'ds-checkbox__icon' }: { className?: string }) => (
  <svg
    className={className}
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
    aria-hidden="true"
  >
    <path d="M2 7H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);
