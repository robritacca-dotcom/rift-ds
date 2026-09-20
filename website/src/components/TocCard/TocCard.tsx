import Link from "next/link";
import styles from "./TocCard.module.css";

interface TocCardProps {
  href: string;
  title: string;
  children: React.ReactNode;
}

export default function TocCard({ href, title, children }: TocCardProps) {
  return (
    <Link href={href} className={styles.tocCard}>
      <div className={styles.tocCardPreview}>{children}</div>
      <h3 className={styles.tocCardTitle}>{title}</h3>
    </Link>
  );
}
