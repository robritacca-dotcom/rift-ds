"use client";

/**
 * The templates index's browsing surface: a peek carousel of contained
 * template windows. The first slide lines up with the content column's left
 * edge, the next one peeks in from the right, and the track runs off the
 * viewport — a scroll-snap scroller rather than the library Carousel, whose
 * slides are locked to the full viewport width.
 *
 * Each built template renders live in a scaled same-origin iframe (the
 * canvas board's trick — BlurBackground detects the frame and drops its GL
 * context, and --layout-viewport-height is pinned so viewport-tall shells
 * get a fixed size) inside a bordered shell. The frame is inert; a link
 * overlay opens the template full screen. The slide list derives from
 * templatesSidebarLinks, so the nav config stays the one authoritative
 * list of templates.
 */

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@robr0/design-system/components/Button/Button";
import { CircularButton } from "@robr0/design-system/components/CircularButton/CircularButton";
import { templatesSidebarLinks } from "@/config/navigation";
import styles from "./page.module.css";

/* The design viewport a template is drawn at before scaling to its slide:
   a 16:10 desktop, matching the cover renders' frame. */
const DESIGN_WIDTH = 1440;
const DESIGN_HEIGHT = 900;

/** The templates themselves — every sidebar entry after "Contents". */
const TEMPLATES = templatesSidebarLinks.slice(1);

const SLIDE_COUNT = TEMPLATES.length;

function LiveFrame({ href, title }: { href: string; title: string }) {
  const shellRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);

  /* The page inside follows the site's theme, live: same-origin, so the
     board's applyTheme pattern reaches straight into the document. The
     preview is a snapshot, not a scroll container, so its own scrollbar is
     hidden too (the frame is inert either way). */
  const sync = useCallback(() => {
    const doc = frameRef.current?.contentDocument;
    if (!doc) return;
    const theme = document.documentElement.getAttribute("data-theme") ?? "dark";
    doc.documentElement.setAttribute("data-theme", theme);
    doc.documentElement.style.setProperty(
      "--layout-viewport-height",
      `${DESIGN_HEIGHT}px`
    );
    doc.documentElement.style.overflow = "hidden";
  }, []);

  useEffect(() => {
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, [sync]);

  /* The frame is drawn at the design size and scaled to the shell's width. */
  useEffect(() => {
    const shell = shellRef.current;
    if (!shell) return;
    const observer = new ResizeObserver(() => {
      shell.style.setProperty(
        "--frame-scale",
        `${shell.clientWidth / DESIGN_WIDTH}`
      );
    });
    observer.observe(shell);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={shellRef} className={styles.frameShell}>
      <div className={styles.frameViewport}>
        <iframe
          ref={frameRef}
          src={href}
          title={title}
          className={styles.frame}
          tabIndex={-1}
          onLoad={sync}
        />
      </div>
      <Link
        href={href}
        className={styles.frameLink}
        aria-label={`Open the ${title.toLowerCase()} template full screen`}
      />
    </div>
  );
}

export default function TemplateShowcase() {
  const bleedRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  /* Full bleed, measured: 100vw includes the scrollbar on platforms with a
     classic one, which puts a few pixels of horizontal scroll on the page.
     The real viewport width is the root element's clientWidth, so the bleed
     is sized from it (the CSS falls back to 100vw before hydration). */
  useEffect(() => {
    const bleed = bleedRef.current;
    if (!bleed) return;
    const set = () =>
      bleed.style.setProperty(
        "--bleed-width",
        `${document.documentElement.clientWidth}px`
      );
    set();
    const observer = new ResizeObserver(set);
    observer.observe(document.documentElement);
    return () => observer.disconnect();
  }, []);

  /* One snap step: the distance between the first two slides' left edges
     (slide width plus the track gap), measured rather than restated. */
  const slideStep = () => {
    const track = trackRef.current;
    if (!track || track.children.length < 2) return 1;
    const first = track.children[0] as HTMLElement;
    const second = track.children[1] as HTMLElement;
    return second.offsetLeft - first.offsetLeft || 1;
  };

  const onScroll = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const index = Math.round(track.scrollLeft / slideStep());
    setActive(Math.max(0, Math.min(SLIDE_COUNT - 1, index)));
  }, []);

  /* Programmatic moves ride the track's CSS scroll-behavior, so the
     reduced-motion override lives in one place (the stylesheet). */
  const scrollToSlide = useCallback((index: number) => {
    trackRef.current?.scrollTo({ left: index * slideStep() });
  }, []);

  return (
    <div ref={bleedRef} className={styles.showcaseBleed}>
      <div ref={trackRef} className={styles.track} onScroll={onScroll}>
        {TEMPLATES.map((template) => (
          <div key={template.href} className={styles.slide}>
            <LiveFrame href={template.href} title={template.label} />
            <div className={styles.slideCaption}>
              <div className={styles.slideText}>
                <h2 className={styles.slideTitle}>{template.label}</h2>
                {template.description && (
                  <p className={styles.slideDescription}>
                    {template.description}
                  </p>
                )}
              </div>
              <Button
                href={template.href}
                variant="secondary"
                label="Open template"
                iconRight="arrow_forward"
              />
            </div>
          </div>
        ))}
      </div>

      <div className={styles.controls}>
        <div className={styles.dots}>
          {Array.from({ length: SLIDE_COUNT }, (_, index) => (
            <button
              key={index}
              type="button"
              className={`${styles.dot} ${index === active ? styles.dotActive : ""}`}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={index === active || undefined}
              onClick={() => scrollToSlide(index)}
            />
          ))}
        </div>
        <div className={styles.arrows}>
          <CircularButton
            icon="chevron_left"
            variant="neutral"
            ariaLabel="Previous template"
            tooltip={false}
            disabled={active === 0}
            onClick={() => scrollToSlide(active - 1)}
          />
          <CircularButton
            icon="chevron_right"
            variant="neutral"
            ariaLabel="Next template"
            tooltip={false}
            disabled={active === SLIDE_COUNT - 1}
            onClick={() => scrollToSlide(active + 1)}
          />
        </div>
      </div>
    </div>
  );
}
