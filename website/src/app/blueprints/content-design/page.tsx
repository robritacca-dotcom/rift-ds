import fs from "fs";
import path from "path";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import FloatingAnchorNav from "@/components/FloatingAnchorNav/FloatingAnchorNav";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import Sidebar from "../../../components/Sidebar/Sidebar";
import DownloadButton from "./DownloadButton";
import { createAnchoredH2, extractSections } from "../markdown-sections";
import { getSidebarLinks, docsSidebarLinks } from "@/config/navigation";
import styles from "./page.module.css";

const { sidebarLinks } = getSidebarLinks(docsSidebarLinks, "/blueprints/content-design");

export default function ContentDesignBlueprintPage() {
  const filePath = path.join(process.cwd(), "public", "content-design.md");
  const raw = fs.readFileSync(filePath, "utf-8");

  const content = raw.replace(/^#\s+.+\r?\n/, "");
  const sections = extractSections(content);

  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <Sidebar links={sidebarLinks} />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Content MD</h1>
            <DownloadButton />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              The writing rules in one file
            </p>
            <p className={styles.introBody}>
              Voice, register by surface, the words and patterns this project never ships, and the tests every piece of copy passes first. The source of truth for how the system reads, copied verbatim from the repo on every build.
            </p>
          </div>

          <div className={`${styles.docLayout} animate-in animate-delay-2`}>
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
