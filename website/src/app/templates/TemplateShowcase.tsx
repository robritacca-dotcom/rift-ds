"use client";

/**
 * The templates index's browsing surface: a peek carousel of contained
 * template windows. The first slide lines up with the content column's left
 * edge, the next one peeks in from the right, and the track runs off the
 * viewport — a scroll-snap scroller rather than the library Carousel, whose
 * slides are locked to the full viewport width.
 *
 * Each built template renders live through TemplateFrame (the shared
 * scaled-iframe window, which owns the mount, theme and phone-dressing
 * rules), mounted against the track so only the slides near it load.
 * A template flagged `mobileOnly`
 * is locked to the phone frame at every device size, and one flagged
 * `hideFromShowcase` gets no slide. The slide list derives from
 * templatesSidebarLinks, so the nav config stays the one authoritative
 * list of templates.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "rift-ds/components/Button/Button";
import { CircularButton } from "rift-ds/components/CircularButton/CircularButton";
import { SegmentedControl } from "rift-ds/components/SegmentedControl/SegmentedControl";
import { templatesSidebarLinks } from "@/config/navigation";
import {
  DEVICES,
  TemplateFrame,
  type DeviceKey,
} from "@/components/TemplateFrame/TemplateFrame";
import styles from "./page.module.css";

/** The templates themselves: every sidebar entry after "Contents", less the
    ones flagged out of the carousel. */
const TEMPLATES = templatesSidebarLinks
  .slice(1)
  .filter((template) => !template.hideFromShowcase);

const SLIDE_COUNT = TEMPLATES.length;

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
            <TemplateFrame
              href={template.href}
              title={template.label}
              device={template.mobileOnly ? "mobile" : device}
              rootRef={trackRef}
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
            variant="primary"
            tone="neutral"
            ariaLabel="Previous template"
            tooltip={false}
            disabled={active === 0}
            onClick={() => scrollToSlide(active - 1)}
          />
          <CircularButton
            icon="chevron_right"
            variant="primary"
            tone="neutral"
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
