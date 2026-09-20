"use client";

import React, { useState } from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { FileInput } from "@robr0/design-system/components/FileInput/FileInput";
import type { FileInputFile } from "@robr0/design-system/components/FileInput/FileInput";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";


export default function FileInputPage() {
  const [files, setFiles] = useState<FileInputFile[]>([]);

  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>File input</h1>
            <PageLinks storybookPath="/?path=/docs/components-fileinput--docs" />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>Drop a file, or browse for one</p>
            <p className={styles.introBody}>
              A dashed dropzone paired with a list of the chosen files. The list
              is fully controlled: you pass <code>files</code> and handle{" "}
              <code>onFilesSelected</code> and <code>onFileRemove</code>, so
              upload progress and per-file errors stay owned by your app. The
              real file input stays in the DOM for form semantics; the zone is
              just its label.
            </p>
          </div>

          {/* Interactive */}
          <section className={styles.section}>
            <SectionTitle title="Try it" />
            <p className={styles.demoCaption}>
              Drop files here or click to browse. This demo wires selection and
              removal to local state.
            </p>
            <div className={styles.demoBox}>
              <FileInput
                label="Attachments"
                multiple
                files={files}
                onFilesSelected={(selected) =>
                  setFiles((prev) => [
                    ...prev,
                    ...selected.map((file, i) => ({
                      id: `${file.name}-${Date.now()}-${i}`,
                      name: file.name,
                      size: file.size,
                    })),
                  ])
                }
                onFileRemove={(id) => setFiles((prev) => prev.filter((f) => f.id !== id))}
                helperText="Add as many files as you need."
              />
            </div>
          </section>

          {/* With an accept list */}
          <section className={styles.section}>
            <SectionTitle title="Accept list" />
            <p className={styles.demoCaption}>
              Passing <code>accept</code> both filters the picker and prints the
              allowed types under the instruction copy.
            </p>
            <div className={styles.demoBox}>
              <FileInput
                label="Brand assets"
                accept="image/png,image/jpeg,.pdf"
                multiple
                helperText="PNG, JPEG, or PDF up to 10 MB each."
              />
            </div>
          </section>

          {/* File list */}
          <section className={styles.section}>
            <SectionTitle title="File list" />
            <p className={styles.demoCaption}>
              Sizes are formatted from a raw byte count. The remove button only
              renders when you pass <code>onFileRemove</code>.
            </p>
            <div className={styles.demoBox}>
              <FileInput
                label="Attachments"
                multiple
                files={[
                  { id: "1", name: "brand-guidelines.pdf", size: 2_411_724 },
                  { id: "2", name: "logo-primary.svg", size: 18_432 },
                  { id: "3", name: "hero-photo.jpg", size: 845_120 },
                ]}
                onFileRemove={() => {}}
              />
            </div>
          </section>

          {/* Uploading */}
          <section className={styles.section}>
            <SectionTitle title="Upload progress" />
            <p className={styles.demoCaption}>
              Give a file a <code>progress</code> value between 0 and 100 to show
              a track under its name. Omit it for files that are already stored.
            </p>
            <div className={styles.demoBox}>
              <FileInput
                label="Attachments"
                multiple
                files={[
                  { id: "1", name: "annual-report.pdf", size: 8_388_608, progress: 72 },
                  { id: "2", name: "appendix.docx", size: 1_048_576, progress: 34 },
                  { id: "3", name: "cover.png", size: 204_800 },
                ]}
                onFileRemove={() => {}}
                helperText="Uploading 2 of 3 files…"
              />
            </div>
          </section>

          {/* Per-file errors */}
          <section className={styles.section}>
            <SectionTitle title="Per-file errors" />
            <p className={styles.demoCaption}>
              A file-level <code>error</code> swaps that row to the error tokens
              and replaces the size line. The rest of the list is unaffected.
            </p>
            <div className={styles.demoBox}>
              <FileInput
                label="Attachments"
                multiple
                files={[
                  { id: "1", name: "presentation.key", error: "Unsupported file type" },
                  {
                    id: "2",
                    name: "raw-footage.mov",
                    size: 524_288_000,
                    error: "Exceeds the 10 MB limit",
                  },
                  { id: "3", name: "notes.txt", size: 4_096 },
                ]}
                onFileRemove={() => {}}
              />
            </div>
          </section>

          {/* States */}
          <section className={styles.section}>
            <SectionTitle title="States" />
            <div className={styles.demoRow}>
              <div className={styles.demoBox}>
                <p className={styles.demoCaption}>Field-level error</p>
                <FileInput
                  label="Attachments"
                  required
                  error
                  helperText="At least one attachment is required."
                />
              </div>
              <div className={styles.demoBox}>
                <p className={styles.demoCaption}>Disabled</p>
                <FileInput
                  label="Attachments"
                  disabled
                  files={[{ id: "1", name: "contract-signed.pdf", size: 320_000 }]}
                  onFileRemove={() => {}}
                  helperText="Locked once the form is submitted."
                />
              </div>
            </div>
          </section>

          {/* Compact */}
          <section className={styles.section}>
            <SectionTitle title="Compact" />
            <div className={styles.demoBox}>
              <FileInput
                label="Receipt"
                size="compact"
                files={[{ id: "1", name: "receipt.pdf", size: 51_200 }]}
                onFileRemove={() => {}}
              />
            </div>
          </section>
        </main>
      </div>

    </>
  );
}
