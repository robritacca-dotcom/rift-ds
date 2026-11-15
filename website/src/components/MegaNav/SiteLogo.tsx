"use client";

import Link from "next/link";
import RiftLogo from "@/components/RiftLogo/RiftLogo";
import { BRAND_NAME } from "@/config/brand.generated";
import styles from "./MegaNav.module.css";

/**
 * The logo as the home link, shared by the header bar and the mobile
 * drawer. The logo spells the name, so it carries it as its accessible
 * name and no text sits beside it.
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
      <RiftLogo label={BRAND_NAME} />
    </Link>
  );
}
