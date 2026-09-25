"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Button } from "@robr0/design-system/components/Button/Button";
import { CircularButton } from "@robr0/design-system/components/CircularButton/CircularButton";
import type { ImageThemeSource } from "@/lib/theme/image-palette";
import styles from "./ImageThemeDrop.module.css";

/**
 * Drag a picture anywhere onto the playground and the levers move to match
 * it. Two pieces, because they live in different places on the page:
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

/** Whether a drag carries files, as opposed to text or a page element. */
const carriesFiles = (transfer: DataTransfer | null) =>
  Boolean(transfer && Array.from(transfer.types).includes("Files"));

export function ImageThemeDropZone({
  onFile,
  rejected,
}: {
  /** Called with the first image file dropped on the document. */
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
      event.preventDefault();
      depth.current = 0;
      setDragging(false);
      const file = Array.from(event.dataTransfer?.files ?? []).find((candidate) =>
        candidate.type.startsWith("image/")
      );
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
        <p className={styles.overlayTitle}>Drop an image to theme from it</p>
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

export function ImageThemeCard({
  source,
  onReplace,
  onClear,
}: {
  source: ImageThemeSource;
  /** Opens the file picker to swap the source image. */
  onReplace: () => void;
  /** Drops the image and puts the levers back where they were. */
  onClear: () => void;
}) {
  return (
    <div className={styles.card}>
      {/* An object URL for a local file: next/image cannot optimize bytes
          that exist only in this tab, so the plain loader carries it. It
          covers the frame at any aspect ratio, like the shader banner
          under it. */}
      <Image
        src={source.url}
        alt={`Theme source: ${source.name}`}
        fill
        unoptimized
        sizes="(max-width: 1099px) 100vw, 960px"
        className={styles.image}
      />

      {/* The readout rides the foot of the picture on a fade into it, so the
          colours and the controls stay legible over any image. */}
      <div className={styles.bar}>
        <div className={styles.body}>
          <p className={styles.fileName} title={source.name}>
            {source.name}
          </p>
          <div className={styles.swatches}>
            {source.theme.swatches.map((swatch) => (
              <span
                key={swatch.hex}
                className={styles.chip}
                /* The sampled colour itself, so it has to come from the data
                   rather than a token. */
                style={{ background: swatch.hex }}
                title={swatch.hex}
              />
            ))}
          </div>
        </div>

        <div className={styles.actions}>
          <Button
            label="Replace"
            variant="neutral"
            size="compact"
            iconLeft="swap_horiz"
            onClick={onReplace}
          />
          <CircularButton
            icon="close"
            variant="neutral"
            size="compact"
            ariaLabel="Remove the theme source image"
            onClick={onClear}
          />
        </div>
      </div>
    </div>
  );
}
