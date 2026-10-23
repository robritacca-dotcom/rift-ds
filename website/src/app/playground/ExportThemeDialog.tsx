"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./page.module.css";
import { Button } from "rift-ds/components/Button/Button";
import { CodeBlock } from "rift-ds/components/CodeBlock/CodeBlock";
import { Dialog } from "rift-ds/components/Dialog/Dialog";
import { MOTION_FEEDBACK_RESET_MS } from "rift-ds/tokens/motion";
import { SITE_EVENTS, trackEvent } from "@/lib/analytics";

/** The one file the export hands over. */
const FILENAME = "AGENTS.md";

/** Saves text as a local file through an object URL: built in this tab,
    never uploaded. */
function downloadTextFile(text: string, filename: string, mime: string) {
  const url = URL.createObjectURL(new Blob([text], { type: `${mime};charset=utf-8` }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export interface ExportThemeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The themed AGENTS.md: the agent starter with this theme and its CSS
      set in. */
  agents: string;
}

/**
 * The theme as one file to take away: the themed AGENTS.md, which carries
 * the setup, the theme in words and its CSS, so a coding agent needs
 * nothing else. Built in this tab and never uploaded. The CSS alone stays
 * one click away on the rail's Copy CSS button.
 */
/* The themed starter leaving the playground, by copy or by download. */
const countExport = (delivery: string) =>
  trackEvent(SITE_EVENTS.copyAgentStarter, { surface: "playground_export", delivery });

export default function ExportThemeDialog({ open, onOpenChange, agents }: ExportThemeDialogProps) {
  const [copied, setCopied] = useState(false);
  const copiedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    return () => {
      if (copiedTimer.current) clearTimeout(copiedTimer.current);
    };
  }, []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(agents);
      countExport("copy");
      setCopied(true);
      if (copiedTimer.current) clearTimeout(copiedTimer.current);
      copiedTimer.current = setTimeout(() => setCopied(false), MOTION_FEEDBACK_RESET_MS);
    } catch {
      // Clipboard unavailable (permissions): the code block's own copy
      // button and the download still work.
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Export your theme"
      description="One file for your coding agent: how to set up rift-ds, this theme in words, and its CSS. Save it at your project root, or add its sections to the AGENTS.md you already have."
      size="lg"
      footer={
        <>
          <Button
            label={copied ? "Copied" : `Copy ${FILENAME}`}
            variant="primary"
            tone="neutral"
            iconLeft={copied ? "check" : "content_copy"}
            onClick={copy}
          />
          <Button
            label={`Download ${FILENAME}`}
            variant="primary"
            iconLeft="download"
            onClick={() => {
              downloadTextFile(agents, FILENAME, "text/markdown");
              countExport("download");
            }}
          />
        </>
      }
    >
      <div className={styles.cssDialogBody}>
        <CodeBlock
          code={agents}
          language="markdown"
          filename={FILENAME}
          showCopy
          maxHeight="50vh"
          onCopied={() => countExport("copy")}
        />
      </div>
    </Dialog>
  );
}
