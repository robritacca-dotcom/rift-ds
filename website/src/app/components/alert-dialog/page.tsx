"use client";

import React, { useState } from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { AlertDialog } from "@robr0/design-system/components/AlertDialog/AlertDialog";
import { Button } from "@robr0/design-system/components/Button/Button";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";

export default function AlertDialogPage() {
  const [defaultOpen, setDefaultOpen] = useState(false);
  const [destructiveOpen, setDestructiveOpen] = useState(false);
  const [customOpen, setCustomOpen] = useState(false);

  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Alert dialog</h1>
            <PageLinks
              storybookPath="/?path=/docs/components-alertdialog--docs"
            />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              Confirmations before critical actions
            </p>
            <p className={styles.introBody}>
              A modal overlay that interrupts the current workflow to request confirmation. Traps focus, dismisses with Escape or backdrop click, and returns focus to the trigger on close.
            </p>
          </div>

          {/* Default */}
          <section className={styles.section}>
            <SectionTitle title="Default" />
            <div className={styles.variantRow}>
              <Button label="Open dialog" variant="secondary" onClick={() => setDefaultOpen(true)} />
              <AlertDialog
                open={defaultOpen}
                onOpenChange={setDefaultOpen}
                title="Confirm action"
                description="Are you sure you want to proceed? This action can be undone later."
                onConfirm={() => setDefaultOpen(false)}
              />
            </div>
          </section>

          {/* Destructive */}
          <section className={styles.section}>
            <SectionTitle title="Destructive" />
            <div className={styles.variantRow}>
              <Button label="Delete item" variant="destructive" onClick={() => setDestructiveOpen(true)} />
              <AlertDialog
                open={destructiveOpen}
                onOpenChange={setDestructiveOpen}
                title="Delete item"
                description="This will permanently delete the item. This action cannot be undone."
                confirmLabel="Delete"
                variant="destructive"
                onConfirm={() => setDestructiveOpen(false)}
              />
            </div>
          </section>

          {/* Custom labels */}
          <section className={styles.section}>
            <SectionTitle title="Custom labels" />
            <div className={styles.variantRow}>
              <Button label="Publish" variant="secondary" onClick={() => setCustomOpen(true)} />
              <AlertDialog
                open={customOpen}
                onOpenChange={setCustomOpen}
                title="Publish article"
                description="Your article will be visible to all users once published."
                confirmLabel="Publish now"
                cancelLabel="Save as draft"
                onConfirm={() => setCustomOpen(false)}
              />
            </div>
          </section>
        </main>
      </div>

    </>
  );
}
