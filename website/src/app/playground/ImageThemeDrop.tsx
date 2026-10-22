"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Button } from "rift-ds/components/Button/Button";
import { CircularButton } from "rift-ds/components/CircularButton/CircularButton";
import type { ImageThemeSource } from "@/lib/theme/image-palette";
import { isDesignMdFile } from "@/lib/theme/design-md";
import styles from "./ImageThemeDrop.module.css";
import { mediaBelow } from "rift-ds/tokens/breakpoints";
import { BREAKPOINT_STAGE_COMPACT_PX } from "@/config/breakpoints";

/**
 * Drag a picture or a DESIGN.md anywhere onto the playground and the levers
 * move to match it (a DESIGN.md's card is DesignMdCard, beside this file).
 * Two pieces, because they live in different places on the page:
 *
 *   ImageThemeDropZone — the document-level listeners and the full-screen
 *                        invitation that appears while a file is over the
 *                        window. Mounted once, renders nothing until a drag
 *                        starts.
 *   ImageThemeCard     — the picture itself, as a banner at the head of the
 *                        stage once an image has been read.
 *
 * The file never leaves the browser. It is read through an object URL and
 * sampled on a canvas; see lib/theme/image-palette.ts.
 */

/* The narrowest source card whose bar holds the swatches and the three
   labelled buttons on one row; below it the buttons are icons alone.
   Measured from the bar at its fullest (eight swatches), not a token. */
const SOURCE_BAR_LABELS_MIN_WIDTH = 640;

/* The bar's buttons, least to most committed, left to right: start over,
   try another file, take this look away. Export is the one primary action
   on the card, so it wears the imported theme's action colour: what the
   import is for is taking the look away. */
const SOURCE_ACTIONS = [
  { key: "reset", label: "Reset", icon: "restart_alt", variant: "tertiary", tone: "neutral" },
  { key: "replace", label: "Upload new", icon: "upload", variant: "primary", tone: "neutral" },
  { key: "export", label: "Export theme", icon: "ios_share", variant: "primary", tone: "default" },
] as const;

/** Whether a drag carries files, as opposed to text or a page element. */
const carriesFiles = (transfer: DataTransfer | null) =>
  Boolean(transfer && Array.from(transfer.types).includes("Files"));

export function ImageThemeDropZone({
  onFile,
  rejected,
}: {
  /** Called with the first image or DESIGN.md file dropped on the document. */
  onFile: (file: File) => void;
  /** Message to show in the overlay instead of the invitation, if the last
      attempt failed. */
  rejected?: string;
}) {
  const [dragging, setDragging] = useState(false);
  /* dragenter and dragleave fire for every element the pointer crosses, so
     the overlay has to count depth rather than trust a single leave. */
  const depth = useRef(0);
  /* The handler through a ref, so the listeners are bound once. The page
     rebuilds onFile on every render, and typing a product name would
     otherwise tear down and re-add four window listeners per keystroke. */
  const onFileRef = useRef(onFile);
  useEffect(() => {
    onFileRef.current = onFile;
  }, [onFile]);

  useEffect(() => {
    const onDragEnter = (event: DragEvent) => {
      if (!carriesFiles(event.dataTransfer)) return;
      depth.current += 1;
      setDragging(true);
    };

    const onDragOver = (event: DragEvent) => {
      if (!carriesFiles(event.dataTransfer)) return;
      // Without this the browser navigates to the file instead.
      event.preventDefault();
      if (event.dataTransfer) event.dataTransfer.dropEffect = "copy";
    };

    const onDragLeave = (event: DragEvent) => {
      if (!carriesFiles(event.dataTransfer)) return;
      depth.current = Math.max(0, depth.current - 1);
      if (depth.current === 0) setDragging(false);
    };

    const onDrop = (event: DragEvent) => {
      if (!carriesFiles(event.dataTransfer)) return;
      depth.current = 0;
      setDragging(false);
      /* A dropzone on the page (the stage's invitation) has already taken
         this file and routed it the same way; reading it again here would
         apply it twice. */
      if (event.defaultPrevented) return;
      event.preventDefault();
      /* The first file the tool can read, else the first file at all, so a
         PDF or a spreadsheet gets the refusal rather than silence. */
      const files = Array.from(event.dataTransfer?.files ?? []);
      const file =
        files.find((candidate) => candidate.type.startsWith("image/") || isDesignMdFile(candidate)) ??
        files[0];
      if (file) onFileRef.current(file);
    };

    window.addEventListener("dragenter", onDragEnter);
    window.addEventListener("dragover", onDragOver);
    window.addEventListener("dragleave", onDragLeave);
    window.addEventListener("drop", onDrop);
    return () => {
      window.removeEventListener("dragenter", onDragEnter);
      window.removeEventListener("dragover", onDragOver);
      window.removeEventListener("dragleave", onDragLeave);
      window.removeEventListener("drop", onDrop);
    };
  }, []);

  if (!dragging) return null;

  return (
    <div className={styles.overlay} aria-hidden="true">
      <div className={styles.overlayCard}>
        <span className={`material-symbols-rounded ${styles.overlayIcon}`}>
          palette
        </span>
        <p className={styles.overlayTitle}>Drop an image or a DESIGN.md to theme from it</p>
        <p className={styles.overlayNote}>
          {/* `||`, not `??`: the caller holds the failure as an empty string
              when there has been none. */}
          {rejected ||
            "It stays in your browser. Nothing is uploaded, nothing is saved."}
        </p>
      </div>
    </div>
  );
}

/**
 * The frame every theme source sits in, picture or DESIGN.md: the same
 * 16:9 card, and the same bar along its foot with the file name, the key
 * colours, the reset, upload and export buttons, so swapping one kind
 * of source for the other moves nothing the visitor has learned to find.
 * The source's own content fills the frame behind the bar.
 */
export function ThemeSourceFrame({
  name,
  swatches,
  onExport,
  onReplace,
  onReset,
  children,
}: {
  /** The source file's name. */
  name: string;
  /** The key colours read from the file, as hex. */
  swatches: string[];
  /** Opens the theme export, the files the imported look leaves as. */
  onExport: () => void;
  /** Opens the file picker to load a different source. */
  onReplace: () => void;
  /** Drops the source and puts every lever back to the starting theme. */
  onReset: () => void;
  /** What fills the frame behind the bar. */
  children: React.ReactNode;
}) {
  /* The bar's buttons drop their labels when the card is too narrow for
     the swatches and three labelled buttons on one row. Read from the card
     rather than the viewport, so the Mobile stage's narrow column on a
     desktop screen gets the same bar a phone does. */
  const cardRef = useRef<HTMLDivElement>(null);
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const card = cardRef.current;
    if (!card || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(([entry]) => {
      setNarrow(entry.contentRect.width < SOURCE_BAR_LABELS_MIN_WIDTH);
    });
    observer.observe(card);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={cardRef} className={styles.card} data-narrow={narrow || undefined}>
      {children}

      {/* The readout rides the foot of the frame on a fade into it, so the
          colours and the controls stay legible over any content. */}
      <div className={styles.bar}>
        <div className={styles.body}>
          <p className={styles.fileName} title={name}>
            {name}
          </p>
          <div className={styles.swatches}>
            {swatches.map((hex) => (
              <span
                key={hex}
                className={styles.chip}
                /* A colour read from the file itself, so it has to come
                   from the data rather than a token. */
                style={{ background: hex }}
                title={hex}
              />
            ))}
          </div>
        </div>

        <div className={styles.actions}>
          {/* Narrow, each is its icon alone: CircularButton, which names
              itself with a tooltip carrying the same words. */}
          {SOURCE_ACTIONS.map(({ key, label, icon, variant, tone }) => {
            const onClick = { reset: onReset, replace: onReplace, export: onExport }[key];
            return narrow ? (
              <CircularButton
                key={key}
                ariaLabel={label}
                icon={icon}
                variant={variant}
                tone={tone}
                size="compact"
                tooltipPosition="top"
                onClick={onClick}
              />
            ) : (
              <Button
                key={key}
                label={label}
                iconLeft={icon}
                variant={variant}
                tone={tone}
                size="compact"
                onClick={onClick}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function ImageThemeCard({
  source,
  onExport,
  onReplace,
  onReset,
}: {
  source: ImageThemeSource;
  /** Opens the theme export. */
  onExport: () => void;
  /** Opens the file picker to load a different source. */
  onReplace: () => void;
  /** Drops the image and puts every lever back to the starting theme. */
  onReset: () => void;
}) {
  return (
    <ThemeSourceFrame
      name={source.name}
      swatches={source.theme.swatches.map((swatch) => swatch.hex)}
      onExport={onExport}
      onReplace={onReplace}
      onReset={onReset}
    >
      {/* An object URL for a local file: next/image cannot optimize bytes
          that exist only in this tab, so the plain loader carries it. It
          covers the frame at any aspect ratio, like the shader banner
          under it. */}
      <Image
        src={source.url}
        alt={`Theme source: ${source.name}`}
        fill
        unoptimized
        sizes={`${mediaBelow(BREAKPOINT_STAGE_COMPACT_PX)} 100vw, 960px`}
        className={styles.image}
      />
    </ThemeSourceFrame>
  );
}
