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
 * overlay opens the template full screen. A frame is only mounted while its
 * slide is near the track's viewport (see LIVE_MARGIN): every preview is a
 * whole app document, and mounting them all at once ran a phone's tab out
 * of memory. A template flagged `mobileOnly`
 * is locked to the phone frame at every device size, and one flagged
 * `hideFromShowcase` gets no slide. The slide list derives from
 * templatesSidebarLinks, so the nav config stays the one authoritative
 * list of templates.
 */

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type React from "react";
import { Button } from "rift-ds/components/Button/Button";
import { CircularButton } from "rift-ds/components/CircularButton/CircularButton";
import { SegmentedControl } from "rift-ds/components/SegmentedControl/SegmentedControl";
import { templatesSidebarLinks } from "@/config/navigation";
import { APP_FRAME_ATTR } from "@/components/templates/AppFrame/AppFrame";
import styles from "./page.module.css";

/* The design viewports a template can be drawn at before scaling into
   its slide. Desktop is the 16:10 frame the covers use; tablet and
   mobile are common portrait devices, so the previews exercise the
   same breakpoints a real device would (the sidebar drawer included).
   The slide keeps the desktop frame's height at every size — narrower
   devices centre inside it like hardware on a stage. */
const DEVICES = {
  desktop: { label: "Desktop", icon: "desktop_windows", w: 1440, h: 900 },
  tablet: { label: "Tablet", icon: "tablet_mac", w: 834, h: 1112 },
  mobile: { label: "Mobile", icon: "smartphone", w: 390, h: 844 },
} as const;
type DeviceKey = keyof typeof DEVICES;

/** The templates themselves: every sidebar entry after "Contents", less the
    ones flagged out of the carousel. */
const TEMPLATES = templatesSidebarLinks
  .slice(1)
  .filter((template) => !template.hideFromShowcase);

const SLIDE_COUNT = TEMPLATES.length;

/* How far past the track's edges a slide counts as near enough to mount
   its frame: the visible slides plus the one about to arrive. */
const LIVE_MARGIN = "0px 25% 0px 25%";

function LiveFrame({
  href,
  title,
  device,
  trackRef,
}: {
  href: string;
  title: string;
  device: DeviceKey;
  trackRef: React.RefObject<HTMLDivElement | null>;
}) {
  const { w: designW, h: designH } = DEVICES[device];
  /* The phone mockup's OS strips (54px status bar + 24px home bar),
     rendered inside the scaled device so the chrome shrinks with the
     screen. Geometry mirrors the playground chat stage's set dressing
     (ChatView.module.css owns the strip recipe). */
  const chromeH = device === "mobile" ? 78 : 0;
  const shellRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [live, setLive] = useState(false);

  /* Mount the frame as its slide nears the viewport. A touch-first device
     also releases it once the slide is far again, because that is where
     memory is tight; elsewhere a loaded preview stays, so scrolling back
     never shows it reloading. */
  useEffect(() => {
    const shell = shellRef.current;
    if (!shell) return;
    const release = window.matchMedia("(hover: none)").matches;
    const observer = new IntersectionObserver(
      ([entry]) =>
        setLive((was) => (entry.isIntersecting ? true : release ? false : was)),
      { root: trackRef.current, rootMargin: LIVE_MARGIN }
    );
    observer.observe(shell);
    return () => observer.disconnect();
  }, [trackRef]);

  /* The page inside follows the site's theme, live: same-origin, so the
     board's applyTheme pattern reaches straight into the document. The
     preview is a snapshot, not a scroll container, so its own scrollbar is
     hidden too (the frame is inert either way). */
  const sync = useCallback(() => {
    const doc = frameRef.current?.contentDocument;
    if (!doc) return;
    const theme = document.documentElement.getAttribute("data-theme") ?? "dark";
    doc.documentElement.setAttribute("data-theme", theme);
    /* The theme preset rides along the same way: mirror data-brand into the
       frame (and its absence — "default" is the attribute removed), so a
       pick from the header or the hero re-themes every live preview too. */
    const brand = document.documentElement.getAttribute("data-brand");
    if (brand) doc.documentElement.setAttribute("data-brand", brand);
    else doc.documentElement.removeAttribute("data-brand");
    doc.documentElement.style.setProperty(
      "--layout-viewport-height",
      `${designH}px`
    );
    doc.documentElement.style.overflow = "hidden";
    /* In the phone, the template previews as an app: its top app bar and
       tab bar in place of the web top bar and sidebar (AppFrame owns the
       dressing; the full template page never carries the flag). */
    if (device === "mobile") doc.documentElement.setAttribute(APP_FRAME_ATTR, "");
    else doc.documentElement.removeAttribute(APP_FRAME_ATTR);
    /* The preview is a picture, not a scroll surface: inner scroll
       areas (a DataTable's wrapper, the Gantt's track) keep working in
       the real page but their bars are noise at postage-stamp scale —
       hide every scrollbar inside the frame. */
    if (!doc.getElementById("preview-scrollbars")) {
      const style = doc.createElement("style");
      style.id = "preview-scrollbars";
      style.textContent =
        "*{scrollbar-width:none}*::-webkit-scrollbar{display:none}";
      doc.head.appendChild(style);
    }
  }, [designH, device]);

  useEffect(() => {
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme", "data-brand"],
    });
    return () => observer.disconnect();
  }, [sync]);

  /* The frame is drawn at the device size and scaled to fit the shell's
     height (the shell holds the desktop frame's aspect at every device,
     so the carousel's geometry never jumps). */
  useEffect(() => {
    const shell = shellRef.current;
    if (!shell) return;
    const observer = new ResizeObserver(() => {
      /* Device modes float on the dotted stage with safe padding all
         round; desktop fills the shell edge to edge as before. */
      const pad = device === "desktop" ? 0 : 24;
      shell.style.setProperty(
        "--frame-scale",
        `${(shell.clientHeight - pad * 2) / (designH + chromeH)}`
      );
    });
    observer.observe(shell);
    return () => observer.disconnect();
  }, [designH, chromeH, device]);

  return (
    <div
      ref={shellRef}
      className={`${styles.frameShell} ${device !== "desktop" ? styles.frameShellDevice : ""}`}
      style={{ "--design-w": `${designW}px`, "--design-h": `${designH}px` } as React.CSSProperties}
    >
      {device === "mobile" ? (
        /* The phone mockup: OS chrome above and below the app, the whole
           device scaled as one so the strips shrink with the screen. */
        <div className={styles.phoneMock}>
          <div className={styles.phoneMockInner}>
            <div className={styles.mockStatusBar} aria-hidden="true">
              <span className={styles.mockStatusTime}>9:41</span>
              <span className={styles.mockStatusIcons}>
                <span className="material-symbols-rounded">signal_cellular_alt</span>
                <span className="material-symbols-rounded">wifi</span>
                <span className="material-symbols-rounded">battery_full</span>
              </span>
            </div>
            <div className={styles.mockScreen}>
              {live && (
                <iframe
                  ref={frameRef}
                  src={href}
                  title={title}
                  className={styles.frame}
                  tabIndex={-1}
                  onLoad={sync}
                />
              )}
            </div>
            <div className={styles.mockHomeBar} aria-hidden="true">
              <span className={styles.mockHomeIndicator} />
            </div>
          </div>
        </div>
      ) : (
        <div className={styles.frameViewport}>
          {live && (
            <iframe
              ref={frameRef}
              src={href}
              title={title}
              className={styles.frame}
              tabIndex={-1}
              onLoad={sync}
            />
          )}
        </div>
      )}
      <Link
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.frameLink}
        aria-label={`Open the ${title.toLowerCase()} template in a new tab`}
      />
    </div>
  );
}

export default function TemplateShowcase() {
  const bleedRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [device, setDevice] = useState<DeviceKey>("desktop");

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
      {/* One toggle re-frames every preview: the same live template,
          rendered at a device's own viewport, breakpoints and all. */}
      <div className={styles.deviceToggle}>
        <SegmentedControl
          segments={Object.entries(DEVICES).map(([value, d]) => ({
            value,
            label: d.label,
            icon: d.icon,
          }))}
          activeSegment={device}
          onSegmentChange={(value) => setDevice(value as DeviceKey)}
          size="compact"
          ariaLabel="Preview device size"
        />
      </div>
      <div ref={trackRef} className={styles.track} onScroll={onScroll}>
        {TEMPLATES.map((template) => (
          <div key={template.href} className={styles.slide}>
            {/* A mobile-only screen has no tablet or desktop layout to
                show, so its slide stays in the phone frame whatever the
                toggle says. */}
            <LiveFrame
              href={template.href}
              title={template.label}
              device={template.mobileOnly ? "mobile" : device}
              trackRef={trackRef}
            />
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
                target="_blank"
                rel="noopener noreferrer"
                variant="secondary"
                label="Open template"
                iconRight="open_in_new"
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
