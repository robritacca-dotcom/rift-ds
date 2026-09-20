import MegaNav from "../../components/MegaNav/MegaNav";
import styles from "./page.module.css";

export default function PrivacyPage() {
  return (
    <>
      <MegaNav />

      <main className={styles.privacyContainer} id="main-content">
        <div className={`${styles.heading} animate-in`}>
          <h1 className={styles.title}>Privacy</h1>
          <p className={styles.subtitle}>What this site collects, and what it does not.</p>
        </div>

        <div className={`${styles.section} animate-in animate-delay-1`}>
          <h2 className={styles.sectionTitle}>Analytics</h2>
          <p className={styles.body}>
            Analytics is off right now: no measurement runs and no analytics
            cookie is set. If Google Analytics is enabled later, it will count
            visits and pages read under a random identifier, not your name,
            and this page will say so. To opt out then, block cookies in your
            browser or install Google&apos;s opt-out add-on.
          </p>
        </div>

        <div className={`${styles.section} animate-in animate-delay-2`}>
          <h2 className={styles.sectionTitle}>The site chat</h2>
          <p className={styles.body}>
            The chat answers questions about this design system and its site.
            When it is live, messages go to Anthropic, whose model writes the
            replies. For each
            exchange the site keeps the question, the answer, the page it was
            asked from, which model answered, timing and token counts, and a
            thumbs verdict if you leave one. Each entry carries a scrambled,
            one-way stand-in for your network address so abuse can be
            spotted; it is not your name, and it cannot be turned back into
            an address. Everything is deleted after
            30 days. Do not type anything private into it.
          </p>
        </div>

        <div className={`${styles.section} animate-in animate-delay-3`}>
          <h2 className={styles.sectionTitle}>What this site does not do</h2>
          <p className={styles.body}>
            No accounts. No advertising. Nothing is sold or shared for
            marketing. The only data collected is the analytics and chat logs
            above, and both are used only to run and improve the site. The
            machine-readable endpoint at /api/mcp stores nothing: it reads
            published data and answers.
          </p>
        </div>

        <div className={`${styles.section} animate-in animate-delay-3`}>
          <h2 className={styles.sectionTitle}>Questions</h2>
          <p className={styles.body}>
            Open an issue on the project&apos;s GitHub repository.
          </p>
        </div>
      </main>
    </>
  );
}
