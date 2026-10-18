import fs from "fs";
import path from "path";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import { Table } from "rift-ds/components/Table/Table";
import { BREAKPOINT_MOBILE_PX, mediaBelow } from "rift-ds/tokens/breakpoints";
import TypographyView from "./TypographyView";
import styles from "./page.module.css";

/* ============================================
   TYPE SCALE LADDERS
   The raw size and line-height steps every style bundle resolves
   through. They can't be drawn usefully on their own (the swatches above
   already show them in use), so they close the page as a table, read
   from tokens-typography.css at build time rather than typed here: the
   stylesheet is the one home of the values, and a new step joins the
   table by existing.
   ============================================ */

type Step = { name: string; value: string; usedBy: string[]; mobileUsedBy: string[] };

/** "--font-mega-1-size" → "Mega 1". */
const styleLabel = (slug: string) =>
  slug
    .split("-")
    .map((w, i) => (i === 0 ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(" ");

function readScale(): Step[] {
  const css = fs
    .readFileSync(path.join(process.cwd(), "../src/tokens/tokens-typography.css"), "utf-8")
    .replace(/\r\n/g, "\n")
    .replace(/\/\*[\s\S]*?\*\//g, "");
  const mobileAt = css.indexOf(`@media ${mediaBelow(BREAKPOINT_MOBILE_PX)}`);
  if (mobileAt < 0) throw new Error("/foundations/typography: no mobile block in tokens-typography.css");
  const base = css.slice(0, mobileAt);
  const mobile = css.slice(mobileAt);

  const steps: Step[] = [...base.matchAll(/(--font-(?:size|line-height)-\d+)\s*:\s*([^;]+);/g)].map((m) => ({
    name: m[1],
    value: m[2].trim(),
    usedBy: [],
    mobileUsedBy: [],
  }));
  const byName = new Map(steps.map((s) => [s.name, s]));
  const collect = (block: string, key: "usedBy" | "mobileUsedBy") => {
    for (const m of block.matchAll(/--font-([\w-]+?)-(?:size|line-height)\s*:\s*var\((--font-(?:size|line-height)-\d+)\)/g)) {
      const step = byName.get(m[2]);
      const label = styleLabel(m[1]);
      if (step && !step[key].includes(label)) step[key].push(label);
    }
  };
  collect(base, "usedBy");
  collect(mobile, "mobileUsedBy");
  if (!steps.length) throw new Error("/foundations/typography: found no --font-size-* or --font-line-height-* steps");
  return steps;
}

export default function TypographyPage() {
  const steps = readScale();
  const rows = steps.map((s) => ({
    id: s.name,
    cells: {
      name: <code className={styles.scaleCode}>{s.name}</code>,
      value: <code className={styles.scaleCode}>{s.value}</code>,
      usedBy: [
        s.usedBy.join(", "),
        s.mobileUsedBy.length ? `${s.mobileUsedBy.join(", ")} below ${BREAKPOINT_MOBILE_PX}px` : "",
      ]
        .filter(Boolean)
        .join("; ") || "No style at the moment",
    },
  }));

  return (
    <TypographyView
      scaleTable={
        <section className={styles.scaleSection}>
          <SectionTitle title="Scale ladders" />
          <p className={styles.scaleNote}>
            The raw sizes and line heights every style above resolves through. Retune a step and every style that reads it follows. The display tiers set their leading as a ratio of the size, so they never read a line-height step.
          </p>
          <Table
            columns={[
              { key: "name", header: "Token" },
              { key: "value", header: "Value" },
              { key: "usedBy", header: "Used by" },
            ]}
            rows={rows}
            bordered
          />
        </section>
      }
    />
  );
}
