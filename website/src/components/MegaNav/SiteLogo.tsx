"use client";

import Link from "next/link";
import BrandMark from "@/components/BrandMark/BrandMark";
import { BRAND_NAME } from "@/config/brand.generated";
import styles from "./MegaNav.module.css";

/**
 * The mark-plus-wordmark home link, shared by the header bar and the
 * mobile drawer.
 */
export default function SiteLogo({
  onClick,
  className,
}: {
  /** The drawer closes itself when its logo is used to navigate home. */
  onClick?: () => void;
  className?: string;
}) {
  return (
    <Link
      href="/"
      className={[styles.logo, className].filter(Boolean).join(" ")}
      onClick={onClick}
    >
      <BrandMark className={styles.logoMark} />
      <span className={styles.logoText}>{BRAND_NAME}</span>
    </Link>
  );
}
