"use client";

/**
 * The bento grid and its overlay.
 *
 * Opening is a shared-element morph: the card and the overlay panel take
 * the same view-transition-name in turn, so the browser animates the card's
 * box into the panel's and crossfades the two snapshots. The expand button
 * and the close button share a name too, so the control travels with the
 * corner it sits in. Without the View Transitions API, or under reduced
 * motion, the overlay simply appears, with its own short fade.
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { createPortal } from "react-dom";
import { Button } from "rift-ds/components/Button/Button";
import { CircularButton } from "rift-ds/components/CircularButton/CircularButton";
import { useScrollLock } from "rift-ds/behaviors/useScrollLock";
import BrandSwitcher from "@/components/BrandSwitcher/BrandSwitcher";
import ThemeToggle from "@/components/ThemeToggle/ThemeToggle";
import { BANNERS, type Banner } from "./content";
import styles from "./Bento.module.css";

const PANEL = "bento-panel";

/* The morph's timing. View-transition pseudo-elements live on the document,
   outside any CSS module's reach, so they are written here. The panel's box
   travels on the entrance curve; its two snapshots keep their aspect and
   anchor at the top left, so text never stretches mid-flight, and the old
   one hands over early. */
const MORPH_CSS = `
::view-transition-group(bento-panel),
::view-transition-group(bento-toggle) {
  animation-duration: 560ms;
  animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
}
/* The travelling box wears the panel's own radius and shadow. The image
   pair has to clip (the natural-size snapshots overhang the box), and a
   clip also cuts away the shadow captured in the snapshot; restating the
   shadow on the group keeps it on through the flight, so it never pops in
   when the real panel takes over. The radius is the token, never a number,
   because every preset re-keys it. */
::view-transition-group(bento-panel) {
  border-radius: var(--radius-400);
  box-shadow: var(--shadow-modal);
}
::view-transition-image-pair(bento-panel) {
  overflow: clip;
  border-radius: inherit;
}
::view-transition-old(bento-panel),
::view-transition-new(bento-panel) {
  height: 100%;
  width: 100%;
  object-fit: none;
  object-position: top left;
}
::view-transition-old(bento-panel) { animation-duration: 220ms; }
::view-transition-new(bento-panel) { animation-duration: 360ms; }
/* The rest of the page never crossfades. The old root snapshot is a frozen
   frame of cards that keep animating (particles, shaders, cycling scenes),
   so blending it with the live new one ghosted every other card for the
   length of the morph. Only the live page shows; the panel morphs over it. */
::view-transition-group(root) { animation: none; }
::view-transition-old(root) { display: none; }
::view-transition-new(root) { animation: none; }
`;
const TOGGLE = "bento-toggle";

type ViewTransitionDoc = Document & {
  startViewTransition?: (cb: () => void) => { finished: Promise<void> };
};

/** Runs a state change inside a view transition when the browser and the visitor allow one. */
function morph(update: () => void): Promise<void> {
  const doc = document as ViewTransitionDoc;
  const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!doc.startViewTransition || still) {
    update();
    return Promise.resolve();
  }
  return doc.startViewTransition(() => flushSync(update)).finished.catch(() => {});
}

export default function Bento() {
  /** The banner wearing the shared names: the one opening, open, or closing. */
  const [linked, setLinked] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  /* The backdrop lives outside the morph, with a lifecycle of its own: it
     outlasts the overlay on close so it can fade out. See Backdrop below. */
  const [backdrop, setBackdrop] = useState<"in" | "out" | null>(null);
  /** The card under the pointer or holding focus: its control takes the primary variant. */
  const [hovered, setHovered] = useState<string | null>(null);
  const triggers = useRef(new Map<string, HTMLButtonElement>());

  const openBanner = useCallback((id: string) => {
    flushSync(() => setLinked(id));
    void morph(() => {
      setOpen(true);
      setBackdrop("in");
    });
  }, []);

  const closeBanner = useCallback(() => {
    const id = linked;
    void morph(() => {
      setOpen(false);
      setBackdrop("out");
    }).then(() => {
      setLinked(null);
      if (id) triggers.current.get(id)?.focus({ preventScroll: true });
    });
  }, [linked]);

  const active = BANNERS.find((b) => b.id === linked) ?? null;

  return (
    <main className={styles.page}>
      <style>{MORPH_CSS}</style>
      {/* The page is chromeless, so it carries its own theme controls: every
          texture and scene reads tokens, and this is how to see them re-theme. */}
      <div className={styles.themeBar}>
        <BrandSwitcher />
        <ThemeToggle />
      </div>

      <header className={styles.intro}>
        <h1 className={styles.headline}>
          A system that themes, talks and documents itself.{" "}
          <span>Tokens, components and an AI layer, built to work on their own or all together.</span>
        </h1>
      </header>

      <div className={styles.grid}>
        {BANNERS.map((b) => {
          const named = linked === b.id && !open;
          return (
            <article
              key={b.id}
              className={styles.card}
              data-span={b.span}
              data-linked={linked === b.id || undefined}
              onPointerEnter={() => setHovered(b.id)}
              onPointerLeave={() => setHovered(null)}
              style={{ viewTransitionName: named ? PANEL : undefined } as React.CSSProperties}
            >
              <h2 className={styles.cardTitle}>{b.title}</h2>
              <CircularButton
                ref={(el: HTMLButtonElement | null) => {
                  if (el) triggers.current.set(b.id, el);
                }}
                icon="open_in_full"
                variant={hovered === b.id ? "primary" : "secondary"}
                size="compact"
                ariaLabel={`Open: ${b.title}`}
                tooltip={false}
                aria-haspopup="dialog"
                className={styles.toggle}
                onClick={() => openBanner(b.id)}
                onFocus={() => setHovered(b.id)}
                onBlur={() => setHovered(null)}
                style={{ viewTransitionName: named ? TOGGLE : undefined } as React.CSSProperties}
              />
              <div className={styles.cardArt} inert>
                <b.Scene />
              </div>
              {/* The whole card opens the overlay; the button is the accessible handle. */}
              <span className={styles.cardHit} onClick={() => openBanner(b.id)} aria-hidden="true" />
            </article>
          );
        })}
      </div>

      {backdrop && (
        <Backdrop state={backdrop} onGone={() => setBackdrop(null)} />
      )}
      {open && active && <Overlay banner={active} onClose={closeBanner} />}
    </main>
  );
}

/* ----------------------------------------------------------- backdrop */

/**
 * The frosted layer behind the panel. Deliberately not a named part of the
 * view transition: a named element is captured as a flat snapshot, and a
 * snapshot cannot sample what lies behind it, so a backdrop-filter blur
 * renders as plain tint for the whole morph and then snaps to blurred when
 * the live element takes over, flashing everything around the tile, on
 * open and again on close. Left in the root, it renders live (the root's
 * new image is live and never crossfades), so the blur is real throughout
 * and it fades with CSS of its own. On close it stays mounted for its fade
 * out, then reports gone.
 */
function Backdrop({ state, onGone }: { state: "in" | "out"; onGone: () => void }) {
  return createPortal(
    <div
      className={styles.backdrop}
      data-state={state}
      aria-hidden="true"
      onAnimationEnd={(e) => {
        if (state === "out" && e.target === e.currentTarget) onGone();
      }}
    />,
    document.body,
  );
}

/* ------------------------------------------------------------ overlay */

function Overlay({ banner, onClose }: { banner: Banner; onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  /* cancel-events, not the default pin: pinning hides the page scrollbar,
     and on a classic-scrollbar platform the centred grid then jumps sideways
     by half its width under the morph, on open and again on close. This
     keeps the rail rendered and lets scroll input reach the overlay alone
     (CommandPalette's reasoning, in useScrollLock's doc block). */
  useScrollLock(true, { strategy: "cancel-events", allowWithin: scrollerRef });

  useEffect(() => {
    closeRef.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
      // A small trap: Tab cycles inside the panel.
      if (e.key === "Tab" && panelRef.current) {
        const f = panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        );
        if (!f.length) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const titleId = `bento-${banner.id}-title`;
  const { Scene } = banner;

  return createPortal(
    <div className={styles.overlay}>
      <div ref={scrollerRef} className={styles.scroller} onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div
          ref={panelRef}
          className={styles.panel}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          style={{ viewTransitionName: PANEL } as React.CSSProperties}
        >
          <CircularButton
            ref={closeRef}
            icon="close_fullscreen"
            variant="secondary"
            size="compact"
            ariaLabel="Close"
            tooltip={false}
            className={`${styles.toggle} ${styles.close}`}
            onClick={onClose}
            style={{ viewTransitionName: TOGGLE } as React.CSSProperties}
          />

          <div className={styles.panelHead}>
            <div className={styles.rise} style={{ "--i": 0 } as React.CSSProperties}>
              <h2 id={titleId} className={styles.panelTitle}>{banner.title}</h2>
              <p className={styles.panelLede}>{banner.lede}</p>
              <div className={styles.panelCtas}>
                <Button label={banner.primary.label} href={banner.primary.href} iconRight="chevron_right" />
                <Button label={banner.secondary.label} href={banner.secondary.href} variant="secondary" />
              </div>
            </div>
            <ul className={`${styles.checks} ${styles.rise}`} style={{ "--i": 1 } as React.CSSProperties}>
              {banner.points.map((p) => (
                <li key={p}>
                  <span className={`material-symbols-rounded ${styles.check}`} aria-hidden="true">check</span>
                  {p}
                </li>
              ))}
            </ul>
          </div>

          <div className={`${styles.showcase} ${styles.rise}`} style={{ "--i": 2 } as React.CSSProperties}>
            <div className={styles.showMain} inert><Scene /></div>
            <div className={styles.showSide}>
              <p className={styles.sideTitle}>{banner.factsTitle}</p>
              <dl className={styles.facts}>
                {banner.facts.map(([k, v]) => (
                  <React.Fragment key={k}>
                    <dt>{k}</dt>
                    <dd>{v}</dd>
                  </React.Fragment>
                ))}
              </dl>
            </div>
          </div>

          <div className={styles.features}>
            {banner.features.map((f, i) => (
              <div key={f.icon} className={styles.rise} style={{ "--i": 3 + i } as React.CSSProperties}>
                <span className={styles.featureIcon}>
                  <span className={`material-symbols-rounded ${styles.icon}`} aria-hidden="true">{f.icon}</span>
                </span>
                <p>{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
