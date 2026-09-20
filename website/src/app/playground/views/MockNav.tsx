"use client";

import ThemeToggle from "@/components/ThemeToggle/ThemeToggle";
import styles from "./MockNav.module.css";

/**
 * A white-label site header at the top of the Components view — brand mark
 * and name on the left, a link row with one active trigger, the real theme
 * toggle on the right — so a theme change reads the way it does on a full
 * page: navigation first. The links are decorative; the toggle is live and
 * writes the same root attribute as the rail's Theme control, so the two
 * can never disagree. The brand follows the Product name lever.
 */
export default function MockNav({ brandName }: { brandName: string }) {
  return (
    <div className={styles.nav} aria-label="Example navigation preview">
      <span className={styles.brand}>
        <span className={styles.mark} />
        {brandName}
      </span>

      <span className={styles.links} aria-hidden="true">
        <span className={styles.link}>Home</span>
        <span className={`${styles.link} ${styles.linkActive}`}>
          Platform
          <span className={`material-symbols-rounded ${styles.caret}`}>
            keyboard_arrow_down
          </span>
        </span>
        <span className={styles.link}>Pricing</span>
        <span className={styles.link}>About</span>
        <span className={styles.link}>Contact</span>
      </span>

      <span className={styles.actions}>
        <ThemeToggle />
      </span>
    </div>
  );
}
