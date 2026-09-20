import Link from "next/link";
import styles from "./SampleCaseStudyCard.module.css";

export default function SampleCaseStudyCard() {
  return (
    <aside className={styles.card} aria-label="Sample case study notice">
      <div className={styles.iconWrap} aria-hidden="true">
        <span className="material-symbols-rounded">lock</span>
      </div>

      <div className={styles.text}>
        <h3 className={styles.heading}>This is a sample</h3>
        <p className={styles.body}>
          What you&apos;ve just read is an abbreviated version of this case study.
          Some of the work (including details under NDA, full process, artefacts,
          and outcomes) isn&apos;t shown publicly. Get in touch to see the full story.
        </p>
      </div>

      <Link href="/contact" className={styles.cta}>
        <span>Get in touch</span>
        <span className="material-symbols-rounded" aria-hidden="true">
          arrow_forward
        </span>
      </Link>
    </aside>
  );
}
