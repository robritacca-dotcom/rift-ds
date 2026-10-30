"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "rift-ds/components/Button/Button";
import { brandMarkFor, type BrandMark } from "@/lib/theme/brand-mark";
import { CHROMATIC_RAMPS } from "@/lib/theme/theme-overrides";
import styles from "./ThemeSourceInvite.module.css";

/** The fanned cards: a picture and a DESIGN.md either side of the palette
    they become. Each is painted from one of the colour lever's own ramps
    (the swatch row in the Colour section) rather than from a theme token:
    the playground opens on a monochrome preset, and an imported theme
    narrows the ambient slots to its own hue, so token colours would leave
    the invitation grey exactly where it most needs to catch the eye. The
    hues are the fixed palette a visitor picks from, so the art still says
    "this becomes your theme". */
const ART_CARDS = [
  { icon: "image", ramp: "red", slot: "1" },
  { icon: "palette", ramp: "yellow", slot: "3" },
  { icon: "markdown", ramp: "blue", slot: "5" },
] as const;

/** A ramp's vivid step, the one the swatch row shows. */
const rampHex = (name: string) =>
  CHROMATIC_RAMPS.find((ramp) => ramp.name === name)?.steps.find(([step]) => step === "07")?.[1];

/** The samples under "Try it", each a DESIGN.md served from /samples/<id>/,
    an analysis of a real product's published look. Each loads under the
    file name DESIGN-<id>.md, which the source card's brand-mark match also
    reads, and wears that brand's mark on its button. The files are
    third-party analyses, which is why they sit in public/ rather than
    app/: none of their text reaches the chat corpus. */
const EXAMPLES = [
  { id: "apple", label: "Apple" },
  { id: "spotify", label: "Spotify" },
  { id: "meta", label: "Meta" },
] as const;

/**
 * The dropzone that opens the DESIGN.md view while no theme source is
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

  /* The examples' marks, from the same lazily loaded set the source card
     reads, fetched once the card is up so the set stays out of the page's
     first load. Until they land, the buttons show their names alone. */
  const [marks, setMarks] = useState<Record<string, BrandMark | null>>({});
  useEffect(() => {
    let live = true;
    Promise.all(EXAMPLES.map(({ id, label }) => brandMarkFor(label, "").then((mark) => [id, mark] as const)))
      .then((pairs) => live && setMarks(Object.fromEntries(pairs)))
      .catch(() => {});
    return () => {
      live = false;
    };
  }, []);

  /* For a visitor with no file to hand: the sample, fetched from the site
     and read exactly like a drop. */
  const tryExample = async (id: string) => {
    try {
      const response = await fetch(`/samples/${id}/DESIGN.md`);
      if (!response.ok) return;
      onFile(new File([await response.text()], `DESIGN-${id}.md`, { type: "text/markdown" }));
    } catch {
      /* Offline or blocked: the button does nothing rather than throw. */
    }
  };

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
      {/* What the zone takes, drawn: a picture and a DESIGN.md either side
          of the palette they become, each card on an ambient colour,
          swaying while the card waits. Decoration only. */}
      <div className={styles.art} aria-hidden="true">
        {ART_CARDS.map(({ icon, ramp, slot }) => (
          <span
            key={icon}
            className={styles.artCard}
            data-slot={slot}
            /* A colour from the lever's palette, so it has to come from the
               data rather than a token (see ART_CARDS). */
            style={{ "--slot": rampHex(ramp) } as React.CSSProperties}
          >
            <span className="material-symbols-rounded">{icon}</span>
          </span>
        ))}
      </div>
      <h2 id="theme-source-title" className={styles.title}>
        Theme from a picture or a DESIGN.md
      </h2>
      <p className={`${styles.note} ${error ? styles.error : ""}`} role={error ? "alert" : undefined}>
        {error ||
          (busy
            ? "Reading the file"
            : "Drop it anywhere. Nothing is uploaded.")}
      </p>

      <div className={styles.actions}>
        <Button
          label="Choose file"
          variant="primary"
          iconLeft="upload"
          disabled={busy}
          onClick={() => input.current?.click()}
        />
      </div>

      {/* For a visitor with no file to hand: the examples, out in the open
          rather than behind a menu, each one press from a themed stage. */}
      <div className={styles.examples}>
        <p className={styles.examplesLabel}>
          <strong>Try it:</strong> see Rift DS as inspired by
        </p>
        <div className={styles.exampleRow}>
          {EXAMPLES.map(({ id, label }) => {
            const mark = marks[id];
            return (
              <Button
                key={id}
                label={`${label} DESIGN.md`}
                variant="secondary"
                tone="neutral"
                size="compact"
                iconLeft={
                  mark?.kind === "mark" ? (
                    <svg viewBox="0 0 24 24" className={styles.exampleMark} aria-hidden="true">
                      <path d={mark.path} />
                    </svg>
                  ) : undefined
                }
                disabled={busy}
                onClick={() => void tryExample(id)}
              />
            );
          })}
        </div>
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
