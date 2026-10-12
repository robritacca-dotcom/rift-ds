/**
 * Labs: the chat behaviour spec, rendered the way a blueprint would be. A
 * test page for judging whether evals/chat/SPEC.md is worth publishing: it
 * reads the file straight from the repo, so nothing is synced or copied.
 *
 * This route is noindex and excluded from the chat corpus (see
 * EXCLUDED_ROUTES in generate-site-corpus.mjs).
 */

import fs from "fs";
import path from "path";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import FloatingAnchorNav from "@/components/FloatingAnchorNav/FloatingAnchorNav";
import MegaNav from "@/components/MegaNav/MegaNav";
import Sidebar from "@/components/Sidebar/Sidebar";
import { createAnchoredH2, extractSections } from "../../blueprints/markdown-sections";
import { getSidebarLinks, docsSidebarLinks } from "@/config/navigation";
import styles from "../../blueprints/content-design/page.module.css";

const { sidebarLinks } = getSidebarLinks(docsSidebarLinks, "/labs/chat-spec");

export default function LabsChatSpecPage() {
  const filePath = path.join(process.cwd(), "..", "evals", "chat", "SPEC.md");
  const raw = fs.readFileSync(filePath, "utf-8");

  /* Split the file's own title and opening off the body, as the blueprint
     pages do with theirs: the page header carries them instead. */
  const content = raw.replace(/^#\s+.+\r?\n/, "");
  const sections = extractSections(content);

  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <Sidebar links={sidebarLinks} />

        <main className={styles.dsContent} id="main-content">
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Chat spec MD</h1>
          </div>

          <div className={`${styles.docLayout} animate-in animate-delay-1`}>
            <div className={styles.markdownBody}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h2: createAnchoredH2(),
                  table: ({ ...props }) => (
                    <div className={styles.tableWrapper}>
                      <table {...props} />
                    </div>
                  ),
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
          </div>

          <FloatingAnchorNav items={sections} />
        </main>
      </div>
    </>
  );
}
