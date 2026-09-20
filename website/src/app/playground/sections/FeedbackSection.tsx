"use client";

import { useState } from "react";
import styles from "../page.module.css";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import { Alert } from "@robr0/design-system/components/Alert/Alert";
import { Badge } from "@robr0/design-system/components/Badge/Badge";
import { Button } from "@robr0/design-system/components/Button/Button";
import { ProgressBar } from "@robr0/design-system/components/ProgressBar/ProgressBar";
import { Skeleton } from "@robr0/design-system/components/Skeleton/Skeleton";
import { Spinner } from "@robr0/design-system/components/Spinner/Spinner";
import { ToastProvider, useToast } from "@robr0/design-system/components/Toast/Toast";

const BADGE_VARIANTS = ["info", "positive", "warning", "error", "neutral"] as const;

function ToastDemo() {
  const { toast } = useToast();
  return (
    <Button
      label="Show toast"
      variant="secondary"
      iconLeft="notifications"
      onClick={() =>
        toast({
          title: "Saved",
          description: "Status colours stay put; that's the point.",
          variant: "positive",
        })
      }
    />
  );
}

export default function FeedbackSection() {
  const [progress, setProgress] = useState(64);

  return (
    <section className={styles.demoSection} aria-label="Feedback and status">
      <SectionTitle title="Feedback & status" />
      <p className={styles.sectionNote}>
        These are the one deliberate exception: status colours are a separate token
        set that keeps its meaning regardless of branding, so the brand lever
        doesn&apos;t move them. Info stays blue, errors stay red, while radius,
        tint, and typeface changes still apply.
      </p>

      <Alert
        title="Status colours are stable by design"
        description="Re-brand all you like: warnings stay orange so users always recognise them."
        variant="info"
      />

      <div className={styles.demoRow}>
        {BADGE_VARIANTS.map((variant) => (
          <Badge key={variant} label={variant} variant={variant} />
        ))}
      </div>

      <div className={styles.sliderRow}>
        <ProgressBar value={progress} showLabel ariaLabel="Demo progress" />
        <Button
          label="Advance"
          variant="tertiary"
          size="compact"
          onClick={() => setProgress((p) => (p >= 100 ? 8 : p + 12))}
        />
      </div>

      <div className={styles.demoRow}>
        <Spinner size="sm" label="Loading small" />
        <Spinner size="md" label="Loading medium" />
        <ToastProvider position="bottom-right">
          <ToastDemo />
        </ToastProvider>
      </div>

      <Skeleton variant="text" lines={3} />
    </section>
  );
}
