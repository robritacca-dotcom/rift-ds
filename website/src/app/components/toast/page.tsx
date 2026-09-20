"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { Toast, ToastProvider, useToast } from "@robr0/design-system/components/Toast/Toast";
import { Button } from "@robr0/design-system/components/Button/Button";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";

function ToastTriggers() {
  const { toast } = useToast();

  return (
    <div className={styles.variantRow}>
      <Button
        label="Info toast"
        variant="secondary"
        onClick={() =>
          toast({
            variant: "info",
            title: "Information",
            description: "This is an informational notification.",
          })
        }
      />
      <Button
        label="Success toast"
        variant="secondary"
        onClick={() =>
          toast({
            variant: "positive",
            title: "Saved",
            description: "Your changes have been saved.",
          })
        }
      />
      <Button
        label="Warning toast"
        variant="secondary"
        onClick={() =>
          toast({
            variant: "warning",
            title: "Warning",
            description: "This action may have consequences.",
          })
        }
      />
      <Button
        label="Error toast"
        variant="destructive"
        onClick={() =>
          toast({
            variant: "error",
            title: "Error",
            description: "Something went wrong. Please try again.",
          })
        }
      />
      <Button
        label="Neutral toast"
        variant="tertiary"
        onClick={() =>
          toast({
            variant: "neutral",
            title: "Note",
            description: "This is a neutral notification.",
          })
        }
      />
    </div>
  );
}

export default function ToastPage() {
  return (
    <ToastProvider position="bottom-right">
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Toast</h1>
            <PageLinks
              storybookPath="/?path=/docs/components-toast--docs"
            />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              Temporary feedback notifications
            </p>
            <p className={styles.introBody}>
              Non-intrusive notifications that appear briefly and dismiss automatically. Supports the same status variants as Alert, stacks multiple toasts, and pauses the auto-dismiss timer on hover.
            </p>
          </div>

          {/* Variants */}
          <section className={styles.section}>
            <SectionTitle title="Variants" />
            <div className={styles.variantStack}>
              <div className={styles.toastDemo}>
                <Toast variant="info" title="Information" description="This is an informational notification." />
              </div>
              <div className={styles.toastDemo}>
                <Toast variant="positive" title="Success" description="Your changes have been saved." />
              </div>
              <div className={styles.toastDemo}>
                <Toast variant="warning" title="Warning" description="This action may have consequences." />
              </div>
              <div className={styles.toastDemo}>
                <Toast variant="error" title="Error" description="Something went wrong." />
              </div>
              <div className={styles.toastDemo}>
                <Toast variant="neutral" title="Note" description="This is a neutral notification." />
              </div>
            </div>
          </section>

          {/* States */}
          <section className={styles.section}>
            <SectionTitle title="States" />
            <div className={styles.variantStack}>
              <div className={styles.toastDemo}>
                <Toast variant="positive" title="Title only" />
              </div>
              <div className={styles.toastDemo}>
                <Toast variant="warning" description="Description only: your session will expire soon." />
              </div>
              <div className={styles.toastDemo}>
                <Toast variant="info" title="Non-dismissible" description="Processing your request." dismissible={false} />
              </div>
            </div>
          </section>

          {/* Interactive */}
          <section className={styles.section}>
            <SectionTitle title="Interactive" />
            <ToastTriggers />
          </section>
        </main>
      </div>

    </ToastProvider>
  );
}
