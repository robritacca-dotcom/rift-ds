"use client";

import { useEffect, useRef, useState } from "react";
import { Badge } from "rift-ds/components/Badge/Badge";
import { brandMarkFor, type BrandMark } from "@/lib/theme/brand-mark";
import { contrastRatio, rgbToHex } from "@/lib/theme/theme-overrides";
import { useSiteTheme } from "@/lib/theme/use-theme-overrides";
import { Table } from "rift-ds/components/Table/Table";
import type { DesignMdSource, MatchStatus } from "@/lib/theme/design-md";
import { ThemeSourceFrame } from "./ImageThemeDrop";
import styles from "./DesignMdCard.module.css";

/**
 * The DESIGN.md a theme was read from, in the same frame a picture gets
 * (ThemeSourceFrame): the bar along the foot carries the file name, the
 * stated colours and the controls in the same places, and where a picture
 * fills the frame, the file's match report scrolls inside it. The report
 * is the point: the levers can only approximate a look described in
 * another system's terms, so every position says whether the file stated
 * it, rift fitted the nearest position it has, or the file was silent and
 * rift kept its own. See lib/theme/design-md.ts.
 */

const STATUS: Record<MatchStatus, { label: string; variant: "positive" | "info" | "neutral" }> = {
  matched: { label: "Matched", variant: "positive" },
  approximated: { label: "Closest fit", variant: "info" },
  kept: { label: "Rift default", variant: "neutral" },
};

/** The contrast a mark needs against the card to keep the brand's colour,
    the WCAG floor for a graphic. */
const MARK_MIN_CONTRAST = 3;

const COLUMNS = [
  { key: "lever", header: "Lever" },
  { key: "value", header: "Set to" },
  { key: "status", header: "Match" },
  { key: "note", header: "From" },
];

export function DesignMdCard({
  source,
  onExport,
  onReplace,
  onReset,
}: {
  source: DesignMdSource;
  /** Opens the theme export. */
  onExport: () => void;
  /** Opens the file picker to load a different source. */
  onReplace: () => void;
  /** Drops the file and puts every lever back to the starting theme. */
  onReset: () => void;
}) {
  const { theme } = source;

  /* The brand the file describes, looked up once per file (the mark set
     loads on demand; see lib/theme/brand-mark.ts). */
  const [mark, setMark] = useState<BrandMark | null>(null);
  useEffect(() => {
    let live = true;
    brandMarkFor(theme.title, source.name)
      .then((found) => live && setMark(found))
      .catch(() => live && setMark(null));
    return () => {
      live = false;
    };
  }, [theme.title, source.name]);

  /* Whether the brand's colour holds 3:1 against the card in the current
     mode, read from the card itself so it follows every theme. */
  const siteTheme = useSiteTheme();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [markInBrandColour, setMarkInBrandColour] = useState(false);
  useEffect(() => {
    if (mark?.kind !== "mark" || !scrollRef.current) return;
    const rgb = getComputedStyle(scrollRef.current).backgroundColor.match(/\d+(\.\d+)?/g)?.map(Number);
    const surface = rgb ? rgbToHex([rgb[0], rgb[1], rgb[2]]) : null;
    // A measured property of the rendered card, read after it paints.
    setMarkInBrandColour(surface !== null && contrastRatio(mark.hex, surface) >= MARK_MIN_CONTRAST);
  }, [mark, siteTheme]);

  const rows = theme.report.map((row) => ({
    id: row.lever,
    cells: {
      lever: row.lever,
      value: row.value,
      status: <Badge label={STATUS[row.status].label} variant={STATUS[row.status].variant} />,
      note: row.note,
    },
  }));

  return (
    <ThemeSourceFrame
      name={source.name}
      swatches={theme.swatches}
      onExport={onExport}
      onReplace={onReplace}
      onReset={onReset}
    >
      {/* Focusable so a keyboard can scroll it, which is also what makes
          the region reachable for a screen reader. */}
      <div
        ref={scrollRef}
        className={styles.scroll}
        tabIndex={0}
        role="region"
        aria-label="How the file was matched"
      >
        <div className={styles.heading}>
          {mark?.kind === "mark" && (
            <svg
              className={styles.mark}
              viewBox="0 0 24 24"
              role="img"
              aria-label={`${mark.title} logo`}
              /* The brand's own colour, read from the mark set, when it
                 holds against the card; the text colour otherwise. */
              style={{ fill: markInBrandColour ? mark.hex : undefined }}
            >
              <path d={mark.path} />
            </svg>
          )}
          {mark?.kind === "monogram" && (
            <span className={styles.monogram} aria-hidden="true">
              {mark.letter}
            </span>
          )}
          <h2 className={styles.title}>{theme.title || source.name}</h2>
        </div>
        {theme.description && <p className={styles.description}>{theme.description}</p>}
        <p className={styles.note}>
          The colours the file states, on rift&apos;s ramps, and its levers for the rest. The file stays in your browser.
        </p>
        <Table
          columns={COLUMNS}
          rows={rows}
          size="compact"
          bordered
          caption="How each lever was matched to the file"
          captionHidden
        />
      </div>
    </ThemeSourceFrame>
  );
}
