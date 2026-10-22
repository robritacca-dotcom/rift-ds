"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import styles from "./page.module.css";
import { Button } from "rift-ds/components/Button/Button";
import { CodeBlock } from "rift-ds/components/CodeBlock/CodeBlock";
import { Dialog } from "rift-ds/components/Dialog/Dialog";
import { Tabs } from "rift-ds/components/Tabs/Tabs";
import { MOTION_FEEDBACK_RESET_MS } from "rift-ds/tokens/motion";

export type ExportTab = "agents" | "css" | "theme" | "prompt";

interface ExportFile {
  value: ExportTab;
  label: string;
  filename: string;
  language: string;
  mime: string;
  note: React.ReactNode;
}

/** The files the export offers, the one-file AGENTS.md first: it is what
    the Export theme button downloads, and the rest are its parts. */
export const EXPORT_FILES: ExportFile[] = [
  {
    value: "agents",
    label: "AGENTS.md",
    filename: "AGENTS.md",
    language: "markdown",
    mime: "text/markdown",
    note: (
      <>
        Everything a coding agent needs in one file: how to install and set up
        rift-ds, this theme in words, and its CSS. Save it at your project
        root, or add its sections to the AGENTS.md you already have.
      </>
    ),
  },
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

/** Saves text as a local file through an object URL: built in this tab,
    never uploaded. */
export function downloadTextFile(text: string, filename: string, mime: string) {
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
  /** Which file the dialog opens on. */
  tab: ExportTab;
  onTabChange: (tab: ExportTab) => void;
  /** The themed AGENTS.md: the agent starter with this theme set in. */
  agents: string;
  css: string;
  markdown: string;
  prompt: string;
}

/** The theme as files to take away, built in this tab and never uploaded. */
export default function ExportThemeDialog({
  open,
  onOpenChange,
  tab,
  onTabChange,
  agents,
  css,
  markdown,
  prompt,
}: ExportThemeDialogProps) {
  const contents: Record<ExportTab, string> = { agents, css, theme: markdown, prompt };
  const file = EXPORT_FILES.find((f) => f.value === tab) ?? EXPORT_FILES[0];

  const [copied, setCopied] = useState(false);
  const copiedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    return () => {
      if (copiedTimer.current) clearTimeout(copiedTimer.current);
    };
  }, []);

  const copyFile = async () => {
    try {
      await navigator.clipboard.writeText(contents[file.value]);
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
      description="One file for your coding agent, or the theme as separate files."
      size="lg"
      footer={
        <>
          <Button
            label={copied ? "Copied" : `Copy ${file.filename}`}
            variant="primary"
            tone="neutral"
            iconLeft={copied ? "check" : "content_copy"}
            onClick={copyFile}
          />
          <Button
            label={`Download ${file.filename}`}
            variant="primary"
            iconLeft="download"
            onClick={() => downloadTextFile(contents[file.value], file.filename, file.mime)}
          />
        </>
      }
    >
      <div className={styles.cssDialogBody}>
        <Tabs
          tabs={EXPORT_FILES.map(({ value, label }) => ({ value, label }))}
          value={file.value}
          onValueChange={(value) => onTabChange(value as ExportTab)}
          size="compact"
          aria-label="Theme files"
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
