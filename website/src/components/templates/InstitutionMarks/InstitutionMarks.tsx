import React from "react";
import styles from "./InstitutionMarks.module.css";

/* Invented banks for the money templates: a plausible name and a corporate
   mark of one or two flat colours on a round tile, drawn so a screen can
   show a household's banks without naming or drawing a real one. The
   colours are each mark's own, not theme roles: a bank's mark is fixed art,
   an off-token exception like PublisherMarks' brand colours. Each glyph is
   drawn in a 40 by 40 box inside 10 to 30, and `fit` (measured once by eye
   and script, in the local lab that drew the set) scales and centres it so
   every mark reads at one optical size. */
export const INSTITUTION_MARKS = {
  // Navy tile, a gold shield split by a navy chevron.
  regal: {
    name: "Regal Bank of Canada",
    bg: "#0B3D91",
    fit: { scale: 0.953, cx: 19.97, cy: 18.94 },
    glyph: (
      <g>
        <path d="M11 10 H29 V20 C29 25 25 28.5 20 30 C15 28.5 11 25 11 20 Z" fill="#F2C230" />
        <path d="M11 18 L20 23.5 L29 18 V21.5 L20 27 L11 21.5 Z" fill="#0B3D91" />
      </g>
    ),
  },
  // Red tile, a solid white N.
  albion: {
    name: "Albionbank",
    bg: "#D7141A",
    fit: { scale: 0.861, cx: 19.98, cy: 19.98 },
    glyph: <path d="M11 30 V10 H15.5 L24.5 22.5 V10 H29 V30 H24.5 L15.5 17.5 V30 Z" fill="#FFFFFF" />,
  },
  // White tile, a black half-sun over a bar.
  wealthclear: {
    name: "Wealthclear",
    bg: "#FFFFFF",
    fit: { scale: 1.105, cx: 19.98, cy: 22.58 },
    glyph: (
      <g fill="#111111">
        <path d="M10 25 A10 10 0 0 1 30 25 Z" />
        <rect x="10" y="27.4" width="20" height="2.6" />
      </g>
    ),
  },
} satisfies Record<string, { name: string; bg: string; fit: { scale: number; cx: number; cy: number }; glyph: React.ReactNode }>;

export type InstitutionMarkId = keyof typeof INSTITUTION_MARKS;

/** An invented bank's mark on its round tile, named for assistive technology unless `decorative`. */
export function InstitutionMark({
  id,
  decorative = false,
  className,
}: {
  id: InstitutionMarkId;
  /** Hide the mark from assistive technology when its name is written beside it. */
  decorative?: boolean;
  className?: string;
}) {
  const mark = INSTITUTION_MARKS[id];
  const { scale, cx, cy } = mark.fit;
  return (
    <span
      className={[styles.mark, className].filter(Boolean).join(" ")}
      style={{ background: mark.bg }}
    >
      <svg
        viewBox="0 0 40 40"
        width="100%"
        height="100%"
        {...(decorative ? { "aria-hidden": true } : { role: "img", "aria-label": mark.name })}
      >
        <g transform={`translate(20 20) scale(${scale}) translate(${-cx} ${-cy})`}>{mark.glyph}</g>
      </svg>
    </span>
  );
}
