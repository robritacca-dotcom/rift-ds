"use client";

import React, { useState } from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { AttachmentViewer } from "rift-ds/components/Attachment/AttachmentViewer";
import type { AttachmentItem } from "rift-ds/components/Attachment/fileTypes";
import { Button } from "rift-ds/components/Button/Button";
import {
  DOCUMENT_FIRST_PAGE,
  PHOTOS,
} from "@/lib/attachment-demo";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";
import ComponentInstallStrip from "@/components/ComponentInstallStrip/ComponentInstallStrip";

const GALLERY: AttachmentItem[] = PHOTOS.slice(0, 5).map(
  (previewSrc, index) => ({
    id: `photo-${index + 1}`,
    name: `receipt-04${11 + index}.jpg`,
    kind: "image",
    size: 2_100_000,
    status: "ready",
    previewSrc,
  })
);

const SHEET: AttachmentItem[] = [
  { id: "sheet", name: "Q4 roadmap.xlsx", kind: "spreadsheet", size: 88_000, status: "ready" },
];

const PDF: AttachmentItem[] = [
  { id: "pdf", name: "demo_schedule_sep28_oct4.pdf", kind: "pdf", size: 1_200_000, status: "ready" },
];

const EXPIRED: AttachmentItem[] = [{ ...PDF[0], status: "error" }];

/** One button that opens the viewer on a set of files. */
function ViewerDemo({
  label,
  items,
  pages = false,
  retry = false,
}: {
  label: string;
  items: AttachmentItem[];
  pages?: boolean;
  retry?: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="secondary" label={label} onClick={() => setOpen(true)} />
      <AttachmentViewer
        open={open}
        onOpenChange={setOpen}
        items={items}
        onDownload={() => {}}
        onRetry={retry ? () => {} : undefined}
        renderPreview={
          pages
            ? () => (
                <div className={styles.pages}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- an inline data URI, nothing for the optimizer to fetch */}
                  <img src={DOCUMENT_FIRST_PAGE} alt="Page 1" />
                  {/* eslint-disable-next-line @next/next/no-img-element -- an inline data URI, nothing for the optimizer to fetch */}
                  <img src={DOCUMENT_FIRST_PAGE} alt="Page 2" />
                </div>
              )
            : undefined
        }
      />
    </>
  );
}

export default function AttachmentViewerPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Attachment viewer</h1>
            <PageLinks storybookPath="/?path=/docs/components-attachmentviewer--docs" />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>Open a file without leaving the conversation</p>
            <p className={styles.introBody}>
              A dialog on a wide screen and a full-screen sheet on a narrow one. The header names the file, its size and its place in the set. The viewer shows pictures itself and lets the host draw anything else. When there is nothing to show, it says so plainly.
            </p>
          </div>

          <section className={styles.section}>
            <SectionTitle title="Pictures" />
            <p className={styles.demoText}>
              Several pictures share one viewer. The footer steps through them, the arrow keys do the same, and the header says where you are.
            </p>
            <ViewerDemo label="Open five pictures" items={GALLERY} />
          </section>

          <section className={styles.section}>
            <SectionTitle title="Drawn by the host" />
            <p className={styles.demoText}>
              The viewer carries no document renderer. Pass a function and the host draws what the viewer cannot, such as the pages of a PDF.
            </p>
            <ViewerDemo label="Open a PDF" items={PDF} pages />
          </section>

          <section className={styles.section}>
            <SectionTitle title="Nothing to show" />
            <p className={styles.demoText}>
              A format with no preview says so beside its mark, name and size, and offers the download.
            </p>
            <ViewerDemo label="Open a spreadsheet" items={SHEET} />
          </section>

          <section className={styles.section}>
            <SectionTitle title="A file that would not load" />
            <p className={styles.demoText}>
              When a file fails or its link has expired, the viewer explains and offers another try.
            </p>
            <ViewerDemo label="Open an expired file" items={EXPIRED} retry />
          </section>

          <ComponentInstallStrip slug="attachment-viewer" />
        </main>
      </div>
    </>
  );
}
