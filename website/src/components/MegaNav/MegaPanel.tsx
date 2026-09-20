"use client";

import Link from "next/link";
import PipelineWireframe from "@/components/PipelineWireframe/PipelineWireframe";
import type { MegaGroup, MegaItem, MegaShowcase } from "@/config/navigation";
import styles from "./MegaNav.module.css";

/* The primitive ramps the showcase field draws, key step outward — the same
   ramps tokens-primitives.css declares, referenced live so the field
   re-themes with any retune. Order picks the display sequence only. */
const SHOWCASE_RAMPS = ["teal", "blue", "purple", "red", "orange", "yellow", "green"];
const SHOWCASE_STEPS = ["02", "03", "04", "05", "06", "07", "08"];

/**
 * A live specimen of the primitive colour ramps: one row per ramp, one cell
 * per step, every cell reading its ramp token directly — this card IS the
 * raw layer, so referencing primitives here is the point, not a violation.
 */
function PrimitiveRampField({ className }: { className?: string }) {
  return (
    <div
      className={className}
      aria-hidden="true"
      style={{
        display: "grid",
        gridTemplateRows: `repeat(${SHOWCASE_RAMPS.length}, 1fr)`,
        gap: "var(--primitive-gap-100)",
        padding: "var(--primitive-padding-400)",
      }}
    >
      {SHOWCASE_RAMPS.map((ramp) => (
        <div
          key={ramp}
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${SHOWCASE_STEPS.length}, 1fr)`,
            gap: "var(--primitive-gap-100)",
          }}
        >
          {SHOWCASE_STEPS.map((step) => (
            <span
              key={step}
              style={{
                borderRadius: "var(--radius-xs)",
                background: `var(--primitive-${ramp}-${step})`,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

/** One index-page row: icon tile, then label over description. */
function MegaItemRow({
  item,
  pathname,
  tabbable,
}: {
  item: MegaItem;
  pathname: string;
  tabbable: boolean;
}) {
  const active = pathname === item.href || pathname.startsWith(item.href + "/");
  return (
    <Link
      href={item.href}
      className={`${styles.megaItem} ${active ? styles.megaItemActive : ""}`}
      tabIndex={tabbable ? 0 : -1}
      aria-current={active ? "page" : undefined}
    >
      <div className={styles.megaIcon}>
        <span className="material-symbols-rounded" aria-hidden="true">
          {item.icon}
        </span>
      </div>
      <div className={styles.megaItemText}>
        <div className={styles.megaLabel}>{item.label}</div>
        <div className={styles.megaDescription}>{item.description}</div>
      </div>
    </Link>
  );
}

/**
 * The featured-page card in the right column — one link that IS the card.
 * The pipeline vector fills the whole frame and absorbs whatever height the
 * link grid runs to, and the copy sits inside it over a gradient rising from
 * the bottom edge. No separate call to action: the title carries the arrow
 * and the card is the button.
 */
function MegaShowcaseCard({
  showcase,
  tabbable,
}: {
  showcase: MegaShowcase;
  tabbable: boolean;
}) {
  return (
    <div className={styles.megaShowcaseColumn}>
      <Link
        href={showcase.href}
        className={styles.megaShowcase}
        tabIndex={tabbable ? 0 : -1}
      >
        {/* The card's own title and description carry the meaning, so the
            drawing stays decorative — a token-drawn vector per graphic key. */}
        {showcase.graphic === "primitives" ? (
          <PrimitiveRampField className={styles.megaShowcaseCover} />
        ) : (
          <PipelineWireframe className={styles.megaShowcaseCover} />
        )}
        <div className={styles.megaShowcaseText}>
          <div className={styles.megaGroupLabel}>{showcase.overline}</div>
          <div className={`${styles.megaLabel} ${styles.megaShowcaseTitle}`}>
            {showcase.label}
            <span
              className={`material-symbols-rounded ${styles.megaShowcaseTitleIcon}`}
              aria-hidden="true"
            >
              arrow_forward
            </span>
          </div>
          <div className={styles.megaDescription}>
            {showcase.description}
          </div>
        </div>
      </Link>
    </div>
  );
}

/**
 * One section's panel content — the link grid, capped at four rows and
 * wrapping into further columns, plus the showcase card on the right when
 * the section declares one. Group titles deliberately don't render: the
 * trigger already names the section, and the items say the rest. Shared by
 * the in-flow and sticky panels, which differ only in when their links are
 * tabbable.
 */
export default function MegaPanel({
  groups,
  showcase,
  pathname,
  tabbable,
}: {
  groups: MegaGroup[];
  showcase?: MegaShowcase;
  pathname: string;
  tabbable: boolean;
}) {
  const items = groups.flatMap((group) => group.items);
  return (
    <div className={styles.megaInner}>
      <div
        className={`${styles.megaLayout} ${showcase ? "" : styles.megaLayoutFull}`}
      >
        <div className={styles.megaGroups}>
          {items.map((item) => (
            <MegaItemRow
              key={item.href}
              item={item}
              pathname={pathname}
              tabbable={tabbable}
            />
          ))}
        </div>
        {showcase && <MegaShowcaseCard showcase={showcase} tabbable={tabbable} />}
      </div>
    </div>
  );
}
