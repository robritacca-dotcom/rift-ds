"use client";

import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import Sidebar from "../../../components/Sidebar/Sidebar";
import PageLinks from "../../../components/PageLinks/PageLinks";
import { getSidebarLinks, foundationsSidebarLinks } from "@/config/navigation";
import styles from "./page.module.css";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import {
  MotionSwatch,
  type MotionSwatchDemo,
} from "@robr0/design-system/components/MotionSwatch/MotionSwatch";

const { sidebarLinks } = getSidebarLinks(foundationsSidebarLinks, "/foundations/motion");

/* ============================================
   MOTION TOKENS
   Values are mirrored from tokens-motion.css.
   ============================================ */

interface DurationToken {
  label: string;
  token: string;
  value: string;
  use: string;
  demo?: MotionSwatchDemo;
}

const coreDurations: DurationToken[] = [
  {
    label: "Fast",
    token: "--motion-duration-fast",
    value: "150ms",
    use: "Quick feedback: hovers, icons, tooltips, nav links",
  },
  {
    label: "Base",
    token: "--motion-duration-base",
    value: "200ms",
    use: "The default: colour, opacity, and border transitions",
  },
  {
    label: "Slow",
    token: "--motion-duration-slow",
    value: "300ms",
    use: "Structural change: accordion, sidebar width, toast enter",
  },
  {
    label: "Slower",
    token: "--motion-duration-slower",
    value: "600ms",
    use: "Deliberate page-entrance reveals",
  },
];

const extendedDurations: DurationToken[] = [
  {
    label: "Instant",
    token: "--motion-duration-instant",
    value: "75ms",
    use: "Below the threshold where a change reads as motion: the Composer growing a line",
  },
  {
    label: "Deliberate",
    token: "--motion-duration-deliberate",
    value: "400ms",
    use: "Carousel slide",
  },
  {
    label: "Loop spin",
    token: "--motion-duration-loop-spin",
    value: "1000ms",
    use: "Spinner rotation",
    demo: "spin",
  },
  {
    label: "Loop shimmer",
    token: "--motion-duration-loop-shimmer",
    value: "1800ms",
    use: "Skeleton shimmer, agent label sweep",
    demo: "shimmer",
  },
  {
    label: "Loop matrix",
    token: "--motion-duration-loop-matrix",
    value: "1400ms",
    use: "Agent dot-matrix cycle (twelve slots)",
  },
];

interface EasingToken {
  label: string;
  token: string;
  value: string;
  use: string;
}

const easings: EasingToken[] = [
  {
    label: "Standard",
    token: "--motion-ease-standard",
    value: "ease",
    use: "General default for colour and opacity transitions",
  },
  {
    label: "Emphasized",
    token: "--motion-ease-emphasized",
    value: "cubic-bezier(0.4, 0, 0.2, 1)",
    use: "Size and layout changes: sidebar width, accordion height",
  },
  {
    label: "Entrance",
    token: "--motion-ease-entrance",
    value: "cubic-bezier(0.16, 1, 0.3, 1)",
    use: "Expressive decelerate for enter animations: modals, dropdowns, toasts",
  },
  {
    label: "Linear",
    token: "--motion-ease-linear",
    value: "linear",
    use: "Continuous motion: spinner, progress bars",
  },
  {
    label: "Spring",
    token: "--motion-ease-spring",
    value: "cubic-bezier(0.34, 1.56, 0.64, 1)",
    use: "Playful overshoot: toggle switch thumb",
  },
];

/* ============================================
   PAGE
   ============================================ */

export default function MotionPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <Sidebar links={sidebarLinks} />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          {/* Page Title */}
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Motion</h1>
            <PageLinks storybookPath="/?path=/docs/foundations-tokens--docs" />
          </div>

          {/* Intro */}
          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              Motion is quiet: a small scale, used sparingly
            </p>
            <p className={styles.introBody}>
              Animation in the interface is functional, not decorative: it confirms an
              interaction, reveals structure, or signals loading. The one thing that moves
              for its own sake is the background, which is scenery rather than interface
              and keeps its own timings. The whole CSS vocabulary is
              {" "}{coreDurations.length + extendedDurations.length} durations and{" "}
              {easings.length} easing curves, defined once as{" "}
              <code>--motion-*</code> tokens and shared by the component library and this
              site. Never write a literal <code>0.2s ease</code> in component CSS. Compose
              a duration token with an easing token instead. Click any tile to replay its
              animation.
            </p>
          </div>

          {/* Core durations */}
          <section className={`${styles.section} animate-in animate-delay-2`}>
            <SectionTitle title="Durations: core scale" />
            <p className={styles.sectionNote}>
              {coreDurations.length} steps cover day-to-day UI. Base is the workhorse: the standard for
              colour, opacity, and border transitions. Step down to fast for hover
              feedback, up to slow for structural change, and reserve slower for page
              entrances. Each tile animates at its token&apos;s actual speed.
            </p>
            <div className={styles.swatchRow}>
              {coreDurations.map((duration) => (
                <MotionSwatch
                  key={duration.token}
                  label={duration.label}
                  token={duration.token}
                  value={duration.value}
                  kind="duration"
                />
              ))}
            </div>
            <ul className={styles.useList}>
              {coreDurations.map((duration) => (
                <li key={duration.token} className={styles.useRow}>
                  <span className={styles.useTerm}>{duration.label}</span>
                  <span className={styles.useValue}>{duration.use}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Extended durations */}
          <section className={styles.section}>
            <SectionTitle title="Durations: extended" />
            <p className={styles.sectionNote}>
              Special-purpose timings that would otherwise live as magic numbers. They are
              named so they stay consistent, but they are not part of the day-to-day scale.
              Reach for the core scale first.
            </p>
            <div className={styles.swatchRow}>
              {extendedDurations.map((duration) => (
                <MotionSwatch
                  key={duration.token}
                  label={duration.label}
                  token={duration.token}
                  value={duration.value}
                  kind="duration"
                  demo={duration.demo}
                />
              ))}
            </div>
            <ul className={styles.useList}>
              {extendedDurations.map((duration) => (
                <li key={duration.token} className={styles.useRow}>
                  <span className={styles.useTerm}>{duration.label}</span>
                  <span className={styles.useValue}>{duration.use}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Easings */}
          <section className={styles.section}>
            <SectionTitle title="Easing curves" />
            <p className={styles.sectionNote}>
              {easings.length} named curves, each with a distinct job. Every tile animates over the same
              600ms so the shape of the curve is what you see: standard for everyday
              transitions, emphasized for layout, entrance for anything appearing on screen,
              linear for loops, spring for the one sanctioned overshoot.
            </p>
            <div className={styles.swatchRow}>
              {easings.map((easing) => (
                <MotionSwatch
                  key={easing.token}
                  label={easing.label}
                  token={easing.token}
                  value={easing.value}
                  kind="easing"
                />
              ))}
            </div>
            <ul className={styles.useList}>
              {easings.map((easing) => (
                <li key={easing.token} className={styles.useRow}>
                  <span className={styles.useTerm}>{easing.label}</span>
                  <span className={styles.useValue}>{easing.use}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Reduced motion */}
          <section className={styles.section}>
            <SectionTitle title="Reduced motion" />
            <p className={styles.sectionNote}>
              The token layer respects <code>prefers-reduced-motion</code> at the source:
              when the preference is set, every duration token collapses to 0.01ms and a
              universal guard flattens any remaining hardcoded transitions and animations.
              Components that use the tokens get accessibility for free: there is nothing
              to opt into, and no component-level media queries to write.
            </p>
            <p className={styles.sectionNote}>
              That guard is CSS, so it cannot reach animation driven from JavaScript. The
              background field runs on the GPU through a frame loop, which means it has to
              check the preference itself. It does: with reduced motion set, it draws a
              single still frame and never starts animating. The charts animate their
              marks in from JavaScript too, and delegate the same check to recharts,
              whose default animation setting honours the preference on its own.
            </p>
          </section>

          {/* JS timings */}
          <section className={styles.section}>
            <SectionTitle title="Timings in JavaScript" />
            <p className={styles.sectionNote}>
              Some timings live in JavaScript timers rather than CSS: hover show and hide
              delays, toast auto-dismiss, carousel autoplay, the streaming
              reveal&apos;s pacing, the summary panel&apos;s staging, and a few more. Those
              share one home too, the constants published
              as <code>@robr0/design-system/tokens/motion</code>, and the module itself
              is the full list. Components read them as
              defaults and still expose each one through props. Most are schedule timings
              that decide when something appears or is taken away, not animations, so the
              reduced-motion collapse deliberately leaves them alone: a toast that
              dismisses itself faster would help nobody. The ones that pace an animation
              check the preference in JavaScript instead, the same way the background
              field does.
            </p>
          </section>
        </main>
      </div>

    </>
  );
}
