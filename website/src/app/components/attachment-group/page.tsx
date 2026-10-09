"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { AttachmentGroup } from "rift-ds/components/Attachment/AttachmentGroup";
import type { AttachmentItem } from "rift-ds/components/Attachment/fileTypes";
import { ChatMessage } from "rift-ds/components/ChatMessage/ChatMessage";
import {
  DOCUMENT_FIRST_PAGE,
  PHOTO_LANDSCAPE,
  PHOTO_PORTRAIT,
  PHOTO_SQUARE,
  PHOTOS,
} from "@/lib/attachment-demo";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";
import ComponentInstallStrip from "@/components/ComponentInstallStrip/ComponentInstallStrip";

const EXTENSIONS = ["png", "jpg", "webp", "png", "png", "png", "jpg"];

const RECEIPTS: AttachmentItem[] = EXTENSIONS.map((extension, index) => ({
  id: `receipt-${index + 1}`,
  name: `receipt-04${10 + index}.${extension}`,
  kind: "image",
  size: 2_100_000 - index * 120_000,
  status: "ready",
  previewSrc: PHOTOS[index % PHOTOS.length],
}));

const MIXED: AttachmentItem[] = [
  { id: "a", name: "whiteboard.png", kind: "image", size: 830_000, status: "ready", previewSrc: PHOTO_SQUARE },
  { id: "b", name: "Q4 roadmap.xlsx", kind: "spreadsheet", size: 88_000, status: "ready" },
  { id: "c", name: "site-visit.jpg", kind: "image", size: 1_400_000, status: "ready", previewSrc: PHOTOS[0] },
  { id: "d", name: "demo_schedule_sep28_oct4.pdf", kind: "pdf", size: 1_200_000, status: "ready", previewSrc: DOCUMENT_FIRST_PAGE },
];

const WIDE: AttachmentItem[] = [
  { id: "w", name: "schedule.png", kind: "image", size: 640_000, status: "ready", previewSrc: PHOTO_LANDSCAPE, width: 768, height: 480 },
];

const TALL: AttachmentItem[] = [
  { id: "p", name: "receipt.jpg", kind: "image", size: 910_000, status: "ready", previewSrc: PHOTO_PORTRAIT, width: 549, height: 768 },
];

const GONE: AttachmentItem[] = [
  { id: "u1", name: "demo_schedule_oct4.pdf", kind: "pdf", size: 1_200_000, status: "unavailable" },
  { id: "u2", name: "Screenshot.png", kind: "image", size: 830_000, status: "unavailable" },
];

export default function AttachmentGroupPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Attachment group</h1>
            <PageLinks storybookPath="/?path=/docs/components-attachmentgroup--docs" />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>The files on a sent message</p>
            <p className={styles.introBody}>
              One picture keeps its own shape. Anything else becomes a grid of square tiles on the sender’s side, above the text. Past four files the grid folds the rest behind a count and opens in place. Pressing a file opens it in the viewer.
            </p>
          </div>

          <section className={styles.section}>
            <SectionTitle title="In a message" />
            <p className={styles.demoText}>
              Pass the group to a chat message and it sits outside the bubble, above the text. Pictures and files share one grid.
            </p>
            <div className={styles.thread}>
              <ChatMessage role="user" attachments={<AttachmentGroup align="end" items={MIXED} />}>
                Compare the roadmap with these.
              </ChatMessage>
            </div>
          </section>

          <section className={styles.section}>
            <SectionTitle title="A single picture" />
            <p className={styles.demoText}>
              One picture is not squared off. A wide screenshot stays wide, and a tall receipt is capped in height so it cannot take over the thread.
            </p>
            <div className={styles.thread}>
              <ChatMessage role="user" attachments={<AttachmentGroup align="end" items={WIDE} />}>
                Turn this into a schedule please.
              </ChatMessage>
              <ChatMessage role="user" attachments={<AttachmentGroup align="end" items={TALL} />}>
                Can you log this receipt?
              </ChatMessage>
            </div>
          </section>

          <section className={styles.section}>
            <SectionTitle title="More than four" />
            <p className={styles.demoText}>
              The last cell stands for the files behind it. Press it and the grid expands where it is, with a button underneath to fold it again.
            </p>
            <div className={styles.thread}>
              <ChatMessage role="user" attachments={<AttachmentGroup align="end" items={RECEIPTS} />}>
                All the receipts from this week.
              </ChatMessage>
            </div>
          </section>

          <section className={styles.section}>
            <SectionTitle title="Files that have gone" />
            <p className={styles.demoText}>
              A file that has expired stays on the message as a record of what was sent. It opens nothing.
            </p>
            <div className={styles.thread}>
              <ChatMessage role="user" attachments={<AttachmentGroup align="end" items={GONE} />}>
                From last month.
              </ChatMessage>
            </div>
          </section>

          <ComponentInstallStrip slug="attachment-group" />
        </main>
      </div>
    </>
  );
}
