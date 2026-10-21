"use client";

import { Badge } from "rift-ds/components/Badge/Badge";
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

const COLUMNS = [
  { key: "lever", header: "Lever" },
  { key: "value", header: "Set to" },
  { key: "status", header: "Match" },
  { key: "note", header: "From" },
];

export function DesignMdCard({
  source,
  onReplace,
  onClear,
}: {
  source: DesignMdSource;
  /** Opens the file picker to load a different source. */
  onReplace: () => void;
  /** Drops the file. The levers it moved stay where they are. */
  onClear: () => void;
}) {
  const { theme } = source;
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
      onReplace={onReplace}
      onClear={onClear}
    >
      {/* Focusable so a keyboard can scroll it, which is also what makes
          the region reachable for a screen reader. */}
      <div className={styles.scroll} tabIndex={0} role="region" aria-label="How the file was matched">
        <h2 className={styles.title}>{theme.title || source.name}</h2>
        {theme.description && <p className={styles.description}>{theme.description}</p>}
        <p className={styles.note}>
          An approximation built from rift&apos;s own levers. The file stays in your browser.
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
