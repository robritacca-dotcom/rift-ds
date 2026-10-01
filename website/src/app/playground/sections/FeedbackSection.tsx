"use client";

import { useState } from "react";
import styles from "../page.module.css";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import { Alert } from "rift-ds/components/Alert/Alert";
import { Badge } from "rift-ds/components/Badge/Badge";
import { Banner } from "rift-ds/components/Banner/Banner";
import { Meter } from "rift-ds/components/Meter/Meter";
import { StatusDot } from "rift-ds/components/StatusDot/StatusDot";
import { Button } from "rift-ds/components/Button/Button";
import { ProgressBar } from "rift-ds/components/ProgressBar/ProgressBar";
import { Skeleton } from "rift-ds/components/Skeleton/Skeleton";
import { Spinner } from "rift-ds/components/Spinner/Spinner";
import { ToastProvider, useToast } from "rift-ds/components/Toast/Toast";

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
  const [bannerOpen, setBannerOpen] = useState(true);

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

      {bannerOpen ? (
        <Banner
          variant="warning"
          title="Scheduled maintenance."
          action={<Button label="Details" variant="secondary" size="compact" />}
          dismissible
          onDismiss={() => setBannerOpen(false)}
        >
          The editor goes read-only on Sunday from 02:00 to 03:00 UTC.
        </Banner>
      ) : (
        <div className={styles.demoRow}>
          <Button
            label="Bring the banner back"
            variant="tertiary"
            size="compact"
            onClick={() => setBannerOpen(true)}
          />
        </div>
      )}

      <div className={styles.demoRow}>
        {BADGE_VARIANTS.map((variant) => (
          <Badge key={variant} label={variant} variant={variant} />
        ))}
      </div>

      <div className={styles.demoRow}>
        <StatusDot variant="positive" label="Operational" />
        <StatusDot variant="warning" label="Degraded" />
        <StatusDot variant="error" label="Recording" pulse />
        <StatusDot variant="neutral" label="Paused" />
      </div>

      <div className={styles.demoColumns}>
        <Meter label="Storage" value={72} showValue variant="info" />
        <Meter label="Monthly tokens" value={91} showValue variant="warning" />
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
