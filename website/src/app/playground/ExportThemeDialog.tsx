"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import styles from "./page.module.css";
import { Button } from "rift-ds/components/Button/Button";
import { CodeBlock } from "rift-ds/components/CodeBlock/CodeBlock";
import { Dialog } from "rift-ds/components/Dialog/Dialog";
import { Tabs } from "rift-ds/components/Tabs/Tabs";
import { MOTION_FEEDBACK_RESET_MS } from "rift-ds/tokens/motion";

export type ExportTab = "css" | "theme" | "prompt";

interface ExportFile {
  value: ExportTab;
  label: string;
  filename: string;
  language: string;
  mime: string;
  note: React.ReactNode;
}

const FILES: ExportFile[] = [
  {
    value: "css",
    label: "Theme CSS",
    filename: "theme.css",
    language: "css",
    mime: "text/css",
    note: (
      <>
        Paste this after importing <code>rift-ds/tokens/tokens.css</code> and
        your app matches this page, both themes included. The install steps
        live on{" "}
        <Link href="/docs/get-started" className={styles.inlineLink}>
          Get started
        </Link>
        .
      </>
    ),
  },
  {
    value: "theme",
    label: "THEME.md",
    filename: "THEME.md",
    language: "markdown",
    mime: "text/markdown",
    note: (
      <>
        The same theme in words: what the look is, which tokens carry it, and
        the rules for keeping to it. Keep it beside the CSS so a coding agent
        reads it before it styles anything.
      </>
    ),
  },
  {
    value: "prompt",
    label: "Agent prompt",
    filename: "prompt.txt",
    language: "text",
    mime: "text/plain",
    note: (
      <>
        Give this to a coding agent with the CSS and THEME.md. It installs the
        system, loads the theme and restyles the screens already there.
      </>
    ),
  },
];

export interface ExportThemeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Which file the dialog opens on. */
  tab: ExportTab;
  onTabChange: (tab: ExportTab) => void;
  css: string;
  markdown: string;
  prompt: string;
  /** The prompt and both files as one paste. */
  bundle: string;
}

/** The theme as three files to take away, built in this tab and never uploaded. */
export default function ExportThemeDialog({
  open,
  onOpenChange,
  tab,
  onTabChange,
  css,
  markdown,
  prompt,
  bundle,
}: ExportThemeDialogProps) {
  const contents: Record<ExportTab, string> = { css, theme: markdown, prompt };
  const file = FILES.find((f) => f.value === tab) ?? FILES[0];

  const [copied, setCopied] = useState(false);
  const copiedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    return () => {
      if (copiedTimer.current) clearTimeout(copiedTimer.current);
    };
  }, []);

  const copyBundle = async () => {
    try {
      await navigator.clipboard.writeText(bundle);
      setCopied(true);
      if (copiedTimer.current) clearTimeout(copiedTimer.current);
      copiedTimer.current = setTimeout(() => setCopied(false), MOTION_FEEDBACK_RESET_MS);
    } catch {
      // Clipboard unavailable (permissions): each file's own copy button
      // and the download still work.
    }
  };

  const download = () => {
    const url = URL.createObjectURL(
      new Blob([contents[file.value]], { type: `${file.mime};charset=utf-8` })
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = file.filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Export your theme"
      description="The theme as files for you and your coding agent."
      size="lg"
      footer={
        <>
          <Button
            label={copied ? "Copied" : "Copy all for agents"}
            variant="neutral"
            iconLeft={copied ? "check" : "content_copy"}
            onClick={copyBundle}
          />
          <Button
            label={`Download ${file.filename}`}
            variant="primary"
            iconLeft="download"
            onClick={download}
          />
        </>
      }
    >
      <div className={styles.cssDialogBody}>
        <Tabs
          tabs={FILES.map(({ value, label }) => ({ value, label }))}
          activeTab={file.value}
          onTabChange={(value) => onTabChange(value as ExportTab)}
          size="compact"
          ariaLabel="Theme files"
        />
        <p className={styles.sectionNote}>{file.note}</p>
        <CodeBlock
          code={contents[file.value]}
          language={file.language}
          filename={file.filename}
          showCopy
          maxHeight="50vh"
        />
      </div>
    </Dialog>
  );
}
