import BrandMark from "@/components/BrandMark/BrandMark";
import MegaNav from "../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import Sidebar from "../../components/Sidebar/Sidebar";
import TocCard from "../../components/TocCard/TocCard";
import PageLinks from "../../components/PageLinks/PageLinks";
import { foundationsSidebarLinks, getSidebarLinks, sectionLandingMetadata } from "@/config/navigation";
import styles from "./page.module.css";

const { sidebarLinks } = getSidebarLinks(foundationsSidebarLinks, "/foundations");

/* The Primitive colours card draws the live ramps, so a preset that re-keys
   a family re-colours its column. */
const PRIMITIVE_FAMILIES = ["neutral", "teal", "blue", "purple", "red", "orange", "yellow", "green"] as const;
const PRIMITIVE_STEPS = ["03", "05", "07", "09"] as const;

/* The Semantic colours card draws the status roles, not the hues behind them. */
const STATUS_ROLES = ["info", "positive", "warning", "error", "neutral"] as const;

// Page-level, so it never cascades to the sub-pages (see sectionLandingMetadata).
export const metadata = sectionLandingMetadata("/foundations");

export default function FoundationsPage() {
  return (
    <>

      <MegaNav />

      <div className={styles.dsLayout}>
        <Sidebar links={sidebarLinks} />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          {/* Page Title */}
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Foundations</h1>
            <PageLinks storybookPath="/?path=/docs/foundations-tokens--docs" />
          </div>

          {/* Intro */}
          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              The shared values behind every component
            </p>
            <p className={styles.introBody}>
              Foundations are the colours, spacing, type styles, motion, layout and stacking values that all components are built on. Every value here is a CSS token in the repo, and the Figma kit&apos;s variables are named after the same tokens, and components reference tokens rather than hard-coded values. That means updating a colour or spacing value in one place updates it everywhere it is used.
            </p>
          </div>

          <div className={`${styles.tocGrid} animate-in animate-delay-2`}>
            {/* Elevation */}
            <TocCard disc href="/foundations/elevation" title="Elevation">
              <div className={styles.elevationScene}>
                <div className={styles.elevationWindow}>
                  <div className={styles.elevationBarWide} />
                  <div className={styles.elevationBar} />
                  <div className={styles.elevationBarShort} />
                </div>
                <div className={styles.elevationPopover}>
                  <div className={styles.elevationPopoverBar} />
                  <div className={styles.elevationPopoverBar} />
                </div>
              </div>
            </TocCard>

            {/* Icons */}
            <TocCard disc href="/foundations/icons" title="Icons">
              {/* The icon-size scale: one glyph at three --icon-size steps, each on its keyline tile */}
              <div className={styles.iconScale} aria-hidden="true">
                {(["600", "800", "1200"] as const).map((step) => (
                  <span key={step} className={styles.iconTile}>
                    <span
                      className="material-symbols-rounded"
                      style={{ "--icon-size": `var(--icon-size-${step})` } as React.CSSProperties}
                    >
                      star
                    </span>
                  </span>
                ))}
              </div>
            </TocCard>

            {/* Layout */}
            <TocCard disc href="/foundations/layout" title="Layout">
              <div className={styles.layoutFrames}>
                <span className={styles.layoutPhone} />
                <span className={styles.layoutTablet} />
                <span className={styles.layoutDesktop} />
              </div>
            </TocCard>

            {/* Logos */}
            <TocCard disc href="/foundations/logos" title="Logos">
              <div className={styles.logoMarks}>
                <BrandMark size={32} />
                <BrandMark size={56} />
              </div>
            </TocCard>

            {/* Motion */}
            <TocCard disc href="/foundations/motion" title="Motion">
              <div className={styles.motionTrack}>
                <div className={styles.motionDot} />
              </div>
            </TocCard>

            {/* Primitive colours: the theme's own ramps, one column per family */}
            <TocCard disc href="/foundations/colour-primitives" title="Primitive colours">
              <div className={styles.primitiveGrid} aria-hidden="true">
                {PRIMITIVE_STEPS.map((step) =>
                  PRIMITIVE_FAMILIES.map((family) => (
                    <span
                      key={`${family}-${step}`}
                      className={styles.primitiveCell}
                      style={{ background: `var(--primitive-${family}-${step})` }}
                    />
                  )),
                )}
              </div>
            </TocCard>

            {/* Semantic colours: roles, not hues (the action colour and the status set) */}
            <TocCard disc href="/foundations/colour-mode" title="Semantic colours">
              <div className={styles.semanticPreview} aria-hidden="true">
                <span className={styles.semanticAction} />
                <div className={styles.semanticStatuses}>
                  {STATUS_ROLES.map((role) => (
                    <span
                      key={role}
                      className={styles.semanticStatus}
                      style={{
                        background: `var(--color-status-${role}-bg)`,
                        borderColor: `var(--color-status-${role}-border)`,
                      }}
                    />
                  ))}
                </div>
              </div>
            </TocCard>

            {/* Semantic Spacing */}
            <TocCard disc href="/foundations/spatial" title="Semantic spacing">
              {/* Two blocks held apart by a real gap token, the gap itself marked */}
              <div className={styles.spatialPreview} aria-hidden="true">
                <span className={styles.spatialBlock} />
                <span className={styles.spatialGap} />
                <span className={styles.spatialBlock} />
              </div>
            </TocCard>

            {/* Themes */}
            <TocCard disc href="/foundations/themes" title="Themes">
              <div className={styles.themesDots}>
                <span className={styles.themesDot} style={{ background: "var(--color-core-accent-coral)" }} />
                <span className={styles.themesDot} style={{ background: "var(--color-core-accent-gold)" }} />
                <span className={styles.themesDot} style={{ background: "var(--color-core-accent-mint)" }} />
                <span className={styles.themesDot} style={{ background: "var(--color-core-accent-cobalt)" }} />
              </div>
            </TocCard>

            {/* Typography */}
            <TocCard disc href="/foundations/typography" title="Typography">
              <div className={styles.typographyPreview} aria-hidden="true">
                <span className={styles.typographyLightA}>A</span>
                <span className={styles.typographyBoldA}>A</span>
              </div>
            </TocCard>
          </div>
        </main>
      </div>

    </>
  );
}
