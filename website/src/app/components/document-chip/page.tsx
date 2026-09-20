"use client";

import React, { useState } from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { DocumentChip } from "@robr0/design-system/components/DocumentChip/DocumentChip";
import { Button } from "@robr0/design-system/components/Button/Button";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";


const FILE_TYPES = [
  { fileType: "pdf", name: "quarterly-report.pdf", meta: "1.2 MB" },
  { fileType: "doc", name: "launch-brief.docx", meta: "12 pages" },
  { fileType: "sheet", name: "budget-2026.xlsx", meta: "86 KB" },
  { fileType: "slide", name: "all-hands.key", meta: "34 slides" },
  { fileType: "image", name: "hero-banner.png", meta: "2.4 MB" },
  { fileType: "code", name: "tokens.css", meta: "9 KB" },
  { fileType: "archive", name: "assets.zip", meta: "18 MB" },
  { fileType: "generic", name: "notes.txt", meta: "3 KB" },
] as const;

const ATTACHMENTS = [
  { fileType: "pdf", name: "quarterly-report.pdf", meta: "1.2 MB" },
  { fileType: "sheet", name: "budget-2026.xlsx", meta: "86 KB" },
  { fileType: "image", name: "hero-banner.png", meta: "2.4 MB" },
] as const;

/** Removable chips backed by local state, with a reset once the list empties. */
function RemovableDemo() {
  const [files, setFiles] = useState<readonly (typeof ATTACHMENTS)[number][]>([
    ...ATTACHMENTS,
  ]);

  if (files.length === 0) {
    return (
      <Button
        variant="secondary"
        size="compact"
        label="Restore files"
        onClick={() => setFiles([...ATTACHMENTS])}
      />
    );
  }

  return (
    <div className={styles.row}>
      {files.map((file) => (
        <DocumentChip
          key={file.name}
          {...file}
          onClick={() => {}}
          onRemove={() => setFiles(files.filter((f) => f.name !== file.name))}
          removeLabel={`Remove ${file.name}`}
        />
      ))}
    </div>
  );
}

export default function DocumentChipPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Document chip</h1>
            <PageLinks storybookPath="/?path=/docs/components-documentchip--docs" />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              The file reference a conversation can point at
            </p>
            <p className={styles.introBody}>
              A two-line tile with a type icon, name, and metadata line, for
              documents attached to chat messages or queued above a composer.
              Chip stays the one-line pill for attributes; FileInput stays the
              form control that owns selection. DocumentChip only references a
              file the host already holds.
            </p>
          </div>

          {/* File types */}
          <section className={styles.section}>
            <SectionTitle title="File types" />
            <p className={styles.demoText}>
              Eight document types pick the leading icon. The metadata line is
              free text, so size, page count, or anything else the host wants
              to say fits without a format contract.
            </p>
            <div className={styles.row}>
              {FILE_TYPES.map((file) => (
                <DocumentChip key={file.fileType} {...file} />
              ))}
            </div>
          </section>

          {/* States */}
          <section className={styles.section}>
            <SectionTitle title="States" />
            <p className={styles.demoText}>
              While a file uploads, a progress bar replaces the metadata line.
              An error replaces it too, and colours the border and icon with
              the error pair.
            </p>
            <div className={styles.stack}>
              <DocumentChip name="quarterly-report.pdf" fileType="pdf" meta="1.2 MB" />
              <DocumentChip name="assets.zip" fileType="archive" progress={40} />
              <DocumentChip name="assets.zip" fileType="archive" error="Upload failed" />
            </div>
          </section>

          {/* Removable and clickable */}
          <section className={styles.section}>
            <SectionTitle title="Removable and clickable" />
            <p className={styles.demoText}>
              Click and remove coexist: the body becomes a button next to the
              close button, so opening a preview never fights with detaching
              the file. Try removing these.
            </p>
            <RemovableDemo />
          </section>

          {/* Compact */}
          <section className={styles.section}>
            <SectionTitle title="Compact" />
            <p className={styles.demoText}>
              Compact drops to a single line, name only, for dense rows of
              attachments above a composer.
            </p>
            <div className={styles.composer}>
              <div className={styles.composerChips}>
                <DocumentChip
                  name="quarterly-report.pdf"
                  fileType="pdf"
                  size="compact"
                  onRemove={() => {}}
                  removeLabel="Remove quarterly-report.pdf"
                />
                <DocumentChip
                  name="budget-2026.xlsx"
                  fileType="sheet"
                  size="compact"
                  onRemove={() => {}}
                  removeLabel="Remove budget-2026.xlsx"
                />
                <DocumentChip
                  name="hero-banner.png"
                  fileType="image"
                  size="compact"
                  onRemove={() => {}}
                  removeLabel="Remove hero-banner.png"
                />
              </div>
            </div>
          </section>
        </main>
      </div>

    </>
  );
}
