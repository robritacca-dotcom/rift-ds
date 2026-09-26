"use client";

import Link from "next/link";
import BrandMark from "@/components/BrandMark/BrandMark";
import BrandWordmark from "@/components/BrandWordmark/BrandWordmark";
import { BRAND_NAME } from "@/config/brand.generated";
import styles from "./MegaNav.module.css";

/**
 * Experiment (2026-09-26, Rob): the RIFT wordmark in place of the
 * type-set brand name. Flip to false to go back to the text span.
 */
const USE_WORDMARK = true;

/**
 * Whether the abstract mark still rides beside the wordmark. The wordmark
 * already spells the brand, so the pair is belt and braces; false gives
 * the wordmark the slot on its own.
 */
const SHOW_MARK_BESIDE_WORDMARK = false;

/**
 * Cap height of the wordmark's letters, in px — the box drawn around them
 * is taller, because the slash clears them top and bottom. Sized against
 * the 24px mark and the 16px nav pills rather than against the text it
 * replaced: a wordmark carries more weight than a word.
 */
const WORDMARK_CAP_HEIGHT = 22;

/**
 * The mark-plus-wordmark home link, shared by both header bars and the
 * mobile drawer.
 */
export default function SiteLogo({
  tabIndex,
  onClick,
  className,
}: {
  /** Pass -1 while the bar holding this logo is hidden from the tab order. */
  tabIndex?: number;
  /** The drawer closes itself when its logo is used to navigate home. */
  onClick?: () => void;
  className?: string;
}) {
  const showMark = !USE_WORDMARK || SHOW_MARK_BESIDE_WORDMARK;
  return (
    <Link
      href="/"
      className={[styles.logo, className].filter(Boolean).join(" ")}
      tabIndex={tabIndex}
      onClick={onClick}
    >
      {showMark && <BrandMark className={styles.logoMark} />}
      {USE_WORDMARK ? (
        <BrandWordmark
          capHeight={WORDMARK_CAP_HEIGHT}
          className={styles.logoWordmark}
          title={BRAND_NAME}
        />
      ) : (
        <span className={styles.logoText}>{BRAND_NAME}</span>
      )}
    </Link>
  );
}
