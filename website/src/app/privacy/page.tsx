import MegaNav from "../../components/MegaNav/MegaNav";
import styles from "./page.module.css";
import { AUTHOR_NAME, AUTHOR_URL } from "@/config/brand.generated";

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
            This site uses Google Analytics. It counts visits, pages read,
            a few interactions such as scrolling, outbound link clicks and
            file downloads, and four actions of the site&apos;s own: copying
            an install snippet, copying the agent starter, copying a
            component&apos;s markdown, and opening the chat. All of it sits
            under a random identifier, not your name. It sets cookies to
            tell one visit from the next. To opt out, install
            Google&apos;s opt-out add-on. Blocking cookies in your browser
            stops your visits being linked together, though each page view
            is still counted.
          </p>
        </div>

        <div className={`${styles.section} animate-in animate-delay-2`}>
          <h2 className={styles.sectionTitle}>The site chat</h2>
          <p className={styles.body}>
            The chat answers questions about this design system and its site.
            Messages go to Anthropic, whose model writes the replies. For each
            exchange the site keeps the question, the answer, the page it was
            asked from, which model answered, timing and token counts, and a
            thumbs verdict if you leave one. Each entry carries a scrambled,
            one-way stand-in for your network address so abuse can be
            spotted; it is not your name, and it cannot be turned back into
            an address. Everything is deleted after
            30 days. Do not type anything private into it.
          </p>
          <p className={styles.body}>
            The table command on the merchant sales template and the labs bench works the same way, with less
            kept: what you type and the table&apos;s current setup go to
            Anthropic, whose model picks the new setup. Its rate limit and
            budget share the chat&apos;s, and the commands themselves are not
            stored.
          </p>
        </div>

        <div className={`${styles.section} animate-in animate-delay-3`}>
          <h2 className={styles.sectionTitle}>Registry downloads</h2>
          <p className={styles.body}>
            When a tool fetches a component from the shadcn registry, the
            site adds one to that day&apos;s tally for that component, along
            with the kind of client that asked: the shadcn CLI, another
            script, a browser, or a crawler. Nothing else is recorded. No
            network address, no identifier and no cookie is kept with the
            count, so it cannot be traced to you, and it is kept without an
            end date.
          </p>
        </div>

        <div className={`${styles.section} animate-in animate-delay-3`}>
          <h2 className={styles.sectionTitle}>What this site does not do</h2>
          <p className={styles.body}>
            No accounts. No advertising. Nothing is sold or shared for
            marketing. The only data collected is the analytics, the chat logs
            and the registry tally above, and all three are used only to run
            and improve the site. The
            machine-readable endpoint at /api/mcp stores nothing: it reads
            published data and answers. An image or a DESIGN.md you drop on
            the playground never leaves your browser: it is read there to
            sample its colours or read its tokens, and nothing about it is
            uploaded or kept. The same
            goes for files you attach in a scripted chat, on the
            playground, the chat home template or the chat widget&apos;s own
            page: they are read in your browser to draw their previews, and
            are never uploaded or kept. The site’s own chat takes text
            only.
          </p>
        </div>

        <div className={`${styles.section} animate-in animate-delay-3`}>
          <h2 className={styles.sectionTitle}>Questions</h2>
          <p className={styles.body}>
            {/* Who runs the site; AUTHOR_NAME/AUTHOR_URL own the values. */}
            This site is designed, built and run by{" "}
            <a href={AUTHOR_URL} target="_blank" rel="noopener noreferrer">{AUTHOR_NAME}</a>.
            Open an issue on the project&apos;s GitHub repository.
          </p>
        </div>
      </main>
    </>
  );
}
