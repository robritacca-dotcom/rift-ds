"use client";

import { useRef, useState } from "react";
import { Button } from "rift-ds/components/Button/Button";
import styles from "./ThemeSourceInvite.module.css";

/**
 * The dropzone that opens the Components view while no theme source is
 * loaded: drag a picture or a DESIGN.md onto it, or use the upload button
 * under the heading. Either route lands where a drop anywhere on the tool
 * does (the window listener in ImageThemeDrop stands down for a drop this
 * zone already took). Once a file is read, the image or DESIGN.md card
 * takes this place.
 *
 * The zone itself is not focusable: the button is its keyboard and touch
 * route, and a focusable zone around it would nest controls.
 */
export function ThemeSourceInvite({
  onFile,
  busy = false,
  error,
}: {
  /** Called with the chosen or dropped file. */
  onFile: (file: File) => void;
  /** True while a file is being read. */
  busy?: boolean;
  /** Why the last file could not be used, if it could not. */
  error?: string;
}) {
  const [dragging, setDragging] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  const take = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // Cleared so choosing the same file twice still fires a change.
    event.target.value = "";
    if (file) onFile(file);
  };

  return (
    <section
      className={`${styles.zone} ${dragging ? styles.dragging : ""}`}
      aria-labelledby="theme-source-title"
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={(event) => {
        // Moving between children fires a leave too; only leaving the zone counts.
        if (!event.currentTarget.contains(event.relatedTarget as Node)) setDragging(false);
      }}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        const file = event.dataTransfer.files[0];
        if (file && !busy) onFile(file);
      }}
    >
      <span className={`material-symbols-rounded ${styles.icon}`} aria-hidden="true">
        upload_file
      </span>
      <h2 id="theme-source-title" className={styles.title}>
        Drag and drop an image or a DESIGN.md
      </h2>
      <p className={`${styles.note} ${error ? styles.error : ""}`} role={error ? "alert" : undefined}>
        {error ||
          (busy
            ? "Reading the file"
            : "Build your own theme from it. The file stays in your browser.")}
      </p>

      <div className={styles.actions}>
        <Button
          label="Upload from computer"
          variant="primary"
          iconLeft="upload"
          disabled={busy}
          onClick={() => input.current?.click()}
        />
      </div>

      <input
        ref={input}
        type="file"
        accept="image/*,.md,.markdown,.txt"
        className={styles.native}
        tabIndex={-1}
        aria-hidden="true"
        onChange={take}
      />
    </section>
  );
}
