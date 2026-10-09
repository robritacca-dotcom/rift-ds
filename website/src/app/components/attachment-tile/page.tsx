"use client";

import React, { useState } from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { AttachmentTile } from "rift-ds/components/Attachment/AttachmentTile";
import type { AttachmentStatus, FileKind } from "rift-ds/components/Attachment/fileTypes";
import { Button } from "rift-ds/components/Button/Button";
import { DOCUMENT_FIRST_PAGE, PHOTO_SQUARE } from "@/lib/attachment-demo";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";
import ComponentInstallStrip from "@/components/ComponentInstallStrip/ComponentInstallStrip";

const PASTED =
  "Paid time off policy (2026)\n\nFull-time employees accrue 1.5 days of PTO per month, credited on the first working day.";

type Row = {
  label: string;
  name: string;
  kind: FileKind;
  meta?: string;
  previewSrc?: string;
  excerpt?: string;
};

const ROWS: Row[] = [
  { label: "Image", name: "Screenshot 5 PM.png", kind: "image", previewSrc: PHOTO_SQUARE },
  { label: "PDF, first page", name: "Meeting notes.pdf", kind: "pdf", previewSrc: DOCUMENT_FIRST_PAGE },
  { label: "PDF", name: "demo_schedule_sep28_oct4.pdf", kind: "pdf", meta: "1.2 MB" },
  { label: "Spreadsheet", name: "Q4 roadmap.xlsx", kind: "spreadsheet", meta: "88 KB" },
  { label: "CSV", name: "hours_export.csv", kind: "spreadsheet", meta: "12 KB" },
  { label: "Document", name: "Weekly team notes.docx", kind: "document", meta: "54 KB" },
  { label: "Slides", name: "Q4 kickoff deck.pptx", kind: "presentation", meta: "5.6 MB" },
  { label: "Pasted text", name: "Pasted text", kind: "pasted", excerpt: PASTED },
  { label: "Any other type", name: "Q4 plan.key", kind: "generic", meta: "3.4 MB" },
];

const STATES: { label: string; status: AttachmentStatus }[] = [
  { label: "Ready", status: "ready" },
  { label: "Uploading", status: "uploading" },
  { label: "Failed", status: "error" },
  { label: "Unavailable", status: "unavailable" },
];

const QUEUE = [
  { name: "site-visit.png", kind: "image", previewSrc: PHOTO_SQUARE },
  { name: "launch-brief.pdf", kind: "pdf", meta: "1.2 MB" },
  { name: "costs-q3.xlsx", kind: "spreadsheet", meta: "88 KB" },
] as const;

/** Removable tiles backed by local state, with a reset once the list empties. */
function RemovableDemo() {
  const [files, setFiles] = useState<readonly (typeof QUEUE)[number][]>([...QUEUE]);

  if (files.length === 0) {
    return (
      <Button
        variant="secondary"
        size="compact"
        label="Restore files"
        onClick={() => setFiles([...QUEUE])}
      />
    );
  }

  return (
    <div className={styles.row}>
      {files.map((file) => (
        <AttachmentTile
          key={file.name}
          {...file}
          onClick={() => {}}
          onRemove={() => setFiles(files.filter((f) => f.name !== file.name))}
        />
      ))}
    </div>
  );
}

export default function AttachmentTilePage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Attachment tile</h1>
            <PageLinks storybookPath="/?path=/docs/components-attachmenttile--docs" />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>One file, drawn as a square</p>
            <p className={styles.introBody}>
              A picture fills the tile. A well-known document format wears a coloured mark, and every other file wears its extension as a neutral badge. Under the mark sit the name, cut in the middle so the extension survives, and one line for the size or the state. The same tile serves a composer’s queue and a sent message.
            </p>
          </div>

          <section className={styles.section}>
            <SectionTitle title="Every kind, every state" />
            <p className={styles.demoText}>
              Each row is a kind of file and each column is a state. The mark, the spinner and the state icons all fill the same square at the same seat, so a file changing state never moves anything.
            </p>
            <div className={styles.matrix} role="table" aria-label="Attachment tiles by kind and state">
              <div className={styles.matrixRow} role="row">
                <span role="columnheader" className={styles.matrixLabel}>Kind</span>
                {STATES.map((state) => (
                  <span key={state.label} role="columnheader" className={styles.matrixLabel}>
                    {state.label}
                  </span>
                ))}
              </div>
              {ROWS.map((row) => (
                <div key={row.label} className={styles.matrixRow} role="row">
                  <span role="rowheader" className={styles.matrixLabel}>{row.label}</span>
                  {STATES.map((state) => (
                    <span key={state.label} role="cell">
                      <AttachmentTile
                        name={row.name}
                        kind={row.kind}
                        meta={row.meta}
                        previewSrc={row.previewSrc}
                        excerpt={row.excerpt}
                        status={state.status}
                        errorLabel={row.kind === "pasted" ? "Paste failed" : undefined}
                      />
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </section>

          <section className={styles.section}>
            <SectionTitle title="Well-known formats" />
            <p className={styles.demoText}>
              PDFs, spreadsheets, documents and presentations each keep the colour they are known by, in every theme. The lettering under the mark is drawn in a text colour, so it stays readable whatever the format colour is.
            </p>
            <div className={styles.row}>
              <AttachmentTile name="Contract.pdf" kind="pdf" meta="1.2 MB" />
              <AttachmentTile name="Q4 roadmap.xlsx" kind="spreadsheet" meta="88 KB" />
              <AttachmentTile name="Weekly notes.docx" kind="document" meta="54 KB" />
              <AttachmentTile name="Kickoff deck.pptx" kind="presentation" meta="5.6 MB" />
            </div>
          </section>

          <section className={styles.section}>
            <SectionTitle title="Everything else" />
            <p className={styles.demoText}>
              Any other file wears its extension as a neutral badge. Colour stays a signal for the formats a reader recognises at a glance.
            </p>
            <div className={styles.row}>
              <AttachmentTile name="voice-note.mp3" kind="audio" meta="2.1 MB" />
              <AttachmentTile name="export.md" kind="text" meta="4 KB" />
              <AttachmentTile name="assets.zip" kind="archive" meta="18.4 MB" />
              <AttachmentTile name="Q4 plan.key" kind="generic" meta="3.4 MB" />
            </div>
          </section>

          <section className={styles.section}>
            <SectionTitle title="Previews" />
            <p className={styles.demoText}>
              A picture fills the tile. A document can do the same with a first page the host has rendered, and keeps its format as a badge over the corner. The library draws no documents itself: pass the image in.
            </p>
            <div className={styles.row}>
              <AttachmentTile name="Hills at dusk.png" kind="image" previewSrc={PHOTO_SQUARE} />
              <AttachmentTile name="Meeting notes.pdf" kind="pdf" previewSrc={DOCUMENT_FIRST_PAGE} />
              <AttachmentTile name="Pasted text" kind="pasted" excerpt={PASTED} />
            </div>
          </section>

          <section className={styles.section}>
            <SectionTitle title="Removable and clickable" />
            <p className={styles.demoText}>
              Click and remove are separate controls, so opening a file never fights with detaching it. The remove button appears on hover and on focus, and stays visible on a file that failed. Try removing these.
            </p>
            <RemovableDemo />
          </section>

          <section className={styles.section}>
            <SectionTitle title="Compact" />
            <p className={styles.demoText}>
              Compact shrinks the square and drops the second line of a ready file, for a dense thread.
            </p>
            <div className={styles.row}>
              <AttachmentTile size="compact" name="Contract.pdf" kind="pdf" />
              <AttachmentTile size="compact" name="Hills.png" kind="image" previewSrc={PHOTO_SQUARE} />
              <AttachmentTile size="compact" name="Q4 plan.key" kind="generic" />
              <AttachmentTile size="compact" name="Q4 roadmap.xlsx" kind="spreadsheet" status="uploading" />
            </div>
          </section>

          <ComponentInstallStrip slug="attachment-tile" />
        </main>
      </div>
    </>
  );
}
