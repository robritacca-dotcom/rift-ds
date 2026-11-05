import Link from "next/link";
import styles from "./TocCard.module.css";

interface TocCardProps {
  href: string;
  title: string;
  /**
   * Seat the preview on the shared stage. Section index pages (Foundations,
   * Docs) draw a small illustration and always pass it, so every card's mark
   * sits bare, at the same size and icon colour; the component grid shows a
   * live component instead and leaves it off.
   */
  disc?: boolean;
  children: React.ReactNode;
}

export default function TocCard({ href, title, disc = false, children }: TocCardProps) {
  return (
    <Link href={href} className={styles.tocCard}>
      <div className={styles.tocCardPreview}>
        {disc ? <div className={styles.tocCardDisc}>{children}</div> : children}
      </div>
      <h3 className={styles.tocCardTitle}>{title}</h3>
    </Link>
  );
}
