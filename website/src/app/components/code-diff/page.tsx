"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { CodeDiff } from "@robr0/design-system/components/CodeDiff/CodeDiff";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";

const TS_DIFF = `@@ -12,7 +12,8 @@ export function normalizeLabel(input: string) {
 export function normalizeLabel(input: string) {
   const trimmed = input.trim();
-  if (!trimmed) return '';
-  return trimmed.toUpperCase();
+  if (!trimmed) return DEFAULT_LABEL;
+  const upper = trimmed.toLocaleUpperCase();
+  return truncate(upper, MAX_LABEL_LENGTH);
 }

 export function truncate(value: string, max: number) {`;

const FILE_DIFF = `--- a/src/lib/normalize.ts
+++ b/src/lib/normalize.ts
${TS_DIFF}`;

const ADDITIONS_DIFF = `+import { Badge } from '@robr0/design-system';
+
+export const shippedBadge = (
+  <Badge label="Shipped" status="positive" />
+);`;

export default function CodeDiffPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Code diff</h1>
            <PageLinks
              storybookPath="/?path=/docs/components-codediff--docs"
            />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              Code changes, line by line
            </p>
            <p className={styles.introBody}>
              A unified diff rendered as added, removed, and context lines. Added
              lines tint green and removed lines tint red, two gutters track the
              old and new line numbers, and hunk headers keep their own row. Pass
              the diff body as a plain string; parsing is built in, and long lines
              scroll horizontally inside the block.
            </p>
          </div>

          {/* Default */}
          <section className={styles.section}>
            <SectionTitle title="Default" />
            <p className={styles.introBody}>
              The <code>@@</code> hunk header sets the starting line numbers for
              both gutters. Everything the parser does not recognise as an
              addition, removal, or header renders as context.
            </p>
            <CodeDiff diff={TS_DIFF} />
          </section>

          {/* With filename */}
          <section className={styles.section}>
            <SectionTitle title="With filename" />
            <p className={styles.introBody}>
              With <code>filename</code>, a header bar carries the file path and a
              summary of additions and deletions. File header lines in the diff
              itself (<code>+++</code> and <code>---</code>) are ignored.
            </p>
            <CodeDiff diff={FILE_DIFF} filename="src/lib/normalize.ts" />
          </section>

          {/* Without line numbers */}
          <section className={styles.section}>
            <SectionTitle title="Without line numbers" />
            <p className={styles.introBody}>
              Set <code>showLineNumbers</code> to false to drop both gutters and
              keep only the marker column, for tight spaces like chat threads.
            </p>
            <CodeDiff
              diff={TS_DIFF}
              filename="src/lib/normalize.ts"
              showLineNumbers={false}
            />
          </section>

          {/* Additions only */}
          <section className={styles.section}>
            <SectionTitle title="Additions only" />
            <p className={styles.introBody}>
              A diff with no hunk headers, like a block of freshly generated code,
              is treated as one hunk starting at line 1.
            </p>
            <CodeDiff diff={ADDITIONS_DIFF} filename="src/components/shippedBadge.tsx" />
          </section>
        </main>
      </div>
    </>
  );
}
