import styles from "./FadeDivider.module.css";

/**
 * FadeDivider — the 1px hairline that fades out at both ends. One home
 * for the line the home hero, the DS landing, and the footer all draw.
 */
export default function FadeDivider({ className }: { className?: string }) {
  return (
    <div
      className={className ? `${styles.rule} ${className}` : styles.rule}
      aria-hidden="true"
    />
  );
}
