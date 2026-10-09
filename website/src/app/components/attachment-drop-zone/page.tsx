"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { AttachmentDropZone } from "rift-ds/components/Attachment/AttachmentDropZone";
import { AttachmentTile } from "rift-ds/components/Attachment/AttachmentTile";
import { formatBytes } from "rift-ds/components/Attachment/fileTypes";
import { useAttachments } from "rift-ds/components/Attachment/useAttachments";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";
import ComponentInstallStrip from "@/components/ComponentInstallStrip/ComponentInstallStrip";

/** A panel that lists what was dropped on it. Nothing leaves the browser.
    `useAttachments` owns the list, which is what gives a dropped picture
    its thumbnail: the hook builds the preview and releases it on removal. */
function DropDemo() {
  const queue = useAttachments();
  return (
    <AttachmentDropZone
      className={styles.dropSurface}
      hint="Any file · read in your browser, never uploaded"
      onFilesSelected={queue.add}
    >
      {queue.items.length === 0 ? (
        <p className={styles.dropEmpty}>Drag a file from your desktop onto this panel.</p>
      ) : (
        <div className={styles.row}>
          {queue.items.map((item) => (
            <AttachmentTile
              key={item.id}
              name={item.name}
              kind={item.kind}
              previewSrc={item.previewSrc}
              meta={item.size === undefined ? undefined : formatBytes(item.size)}
              onRemove={() => queue.remove(item.id)}
            />
          ))}
        </div>
      )}
    </AttachmentDropZone>
  );
}

export default function AttachmentDropZonePage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Attachment drop zone</h1>
            <PageLinks storybookPath="/?path=/docs/components-attachmentdropzone--docs" />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>Drop a file anywhere on the chat</p>
            <p className={styles.introBody}>
              Wrap a surface in the zone and a file dragged anywhere over it lands, so nobody has to aim for the composer. While files hover, an overlay covers the surface and says what letting go will do. Dropping is a pointer path, so pair it with an attach button for the keyboard.
            </p>
          </div>

          <section className={styles.section}>
            <SectionTitle title="Try it" />
            <p className={styles.demoText}>
              Drag one or more files over the panel. Its edge lights up and the surface frosts over, and the files appear as tiles when you let go. They are read in your browser and go nowhere.
            </p>
            <DropDemo />
          </section>

          <section className={styles.section}>
            <SectionTitle title="What it leaves alone" />
            <p className={styles.demoText}>
              The zone only reacts to a drag that carries files. Dragging selected text or a link across it does nothing, and it keeps a file drop to itself so a drop target around it never handles the same files twice.
            </p>
            <AttachmentDropZone className={styles.dropSurface} label="Drop files to attach">
              <p className={styles.dropEmpty}>Select this sentence and drag it. Nothing happens.</p>
            </AttachmentDropZone>
          </section>

          <ComponentInstallStrip slug="attachment-drop-zone" />
        </main>
      </div>
    </>
  );
}
