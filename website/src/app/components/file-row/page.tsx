import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import { FileRow } from "rift-ds/components/Attachment/FileRow";
import { IconButton } from "rift-ds/components/IconButton/IconButton";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";
import ComponentInstallStrip from "@/components/ComponentInstallStrip/ComponentInstallStrip";

export default function FileRowPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>File row</h1>
            <PageLinks storybookPath="/?path=/docs/components-filerow--docs" />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>One file in a list</p>
            <p className={styles.introBody}>
              File row shows a file the way a document list needs it: the same type mark the attachment tile and viewer draw, its name, a line of detail and controls at the end. The name opens the file, as a link to it or a button that shows it in place, so a keyboard can walk a folder row by row.
            </p>
          </div>

          <section className={styles.section}>
            <SectionTitle title="A folder" />
            <div className={styles.demoSurface}>
              <div>
                {[["Quarterly report.pdf", "2.4 MB · Added 3 Oct"], ["Budget.xlsx", "88 KB · Added 28 Sep"], ["Proposal.docx", "412 KB · Added 21 Sep"], ["Notes.md", "3 KB · Added 2 Sep"]].map(([name, meta]) => (
                  <FileRow
                    key={name}
                    name={name}
                    meta={meta}
                    href="#"
                    actions={<IconButton icon="download" variant="tertiary" size="compact" label={`Download ${name}`} />}
                  />
                ))}
              </div>
            </div>
          </section>

          <ComponentInstallStrip slug="file-row" />
        </main>
      </div>
    </>
  );
}
