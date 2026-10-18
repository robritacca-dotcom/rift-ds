"use client";

import type { ReactNode } from "react";
import { CircularButton } from "rift-ds/components/CircularButton/CircularButton";
import styles from "./page.module.css";

/**
 * The shell both floating rails share: a header with the collapse toggle,
 * the rail's title and its reset, then the scrolling levers and an optional
 * pinned footer.
 *
 * Collapsing folds the glass card into its own toggle. The toggle sits in
 * the corner the card shrinks toward (top left for the theme rail, top
 * right for the chat director), so it never moves: the card closes around
 * it and what is left is a round glass button in the same place. The rail
 * stays mounted while folded, so open sections and scroll position survive
 * a round trip; `inert` takes the hidden levers out of the tab order.
 */
export function FloatingRail({
  side,
  label,
  title,
  collapsed,
  onCollapsedChange,
  onReset,
  resetLabel,
  resetDisabled = false,
  footer,
  children,
}: {
  side: "left" | "right";
  /** The landmark's accessible name, and the toggle's subject. */
  label: string;
  title: string;
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
  onReset: () => void;
  resetLabel: string;
  resetDisabled?: boolean;
  footer?: ReactNode;
  children: ReactNode;
}) {
  // The tooltip opens away from the edge the rail hugs.
  const inward = side === "left" ? "right" : "left";
  const glyph = (state: "open" | "close") => `${side}_panel_${state}`;

  const toggle = (
    <CircularButton
      className={styles.railToggle}
      /* Both glyphs stay mounted and crossfade, so the swap reads as the
         panel mark turning over rather than a hard cut. */
      icon={
        <span className={styles.railToggleGlyphs}>
          <span className="material-symbols-rounded" data-glyph="close">
            {glyph("close")}
          </span>
          <span className="material-symbols-rounded" data-glyph="open">
            {glyph("open")}
          </span>
        </span>
      }
      ariaLabel={collapsed ? `Show ${label.toLowerCase()}` : `Hide ${label.toLowerCase()}`}
      aria-expanded={!collapsed}
      variant="tertiary"
      size="compact"
      tooltipPosition={collapsed ? inward : "bottom"}
      onClick={() => onCollapsedChange(!collapsed)}
    />
  );

  const reset = (
    <CircularButton
      icon="restart_alt"
      ariaLabel={resetLabel}
      variant="tertiary"
      size="compact"
      /* Inward: the header clips, and this sits at its edge. */
      tooltipPosition="left"
      disabled={resetDisabled}
      onClick={onReset}
    />
  );

  return (
    <aside
      className={styles.floatingRail}
      data-side={side}
      data-collapsed={collapsed || undefined}
      aria-label={label}
    >
      {/* The toggle rides on the card itself, outside the clipped body, so
          its tooltip can open past the card's edge; the header keeps an
          empty slot where it sits. */}
      <span className={styles.railToggleSeat}>{toggle}</span>
      <div className={styles.railBody}>
        <div className={styles.railHead}>
          {side === "left" && <span className={styles.railToggleSlot} />}
          <strong className={`${styles.railTitle} ${styles.railFade}`}>{title}</strong>
          <span className={styles.railFade} inert={collapsed}>
            {reset}
          </span>
          {side === "right" && <span className={styles.railToggleSlot} />}
        </div>
        <div className={`${styles.railScroll} ${styles.railFade}`} inert={collapsed}>
          {children}
        </div>
        {footer && (
          <div className={`${styles.railFootWrap} ${styles.railFade}`} inert={collapsed}>
            {footer}
          </div>
        )}
      </div>
    </aside>
  );
}
