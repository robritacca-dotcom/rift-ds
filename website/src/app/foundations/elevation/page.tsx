"use client";

import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import Sidebar from "../../../components/Sidebar/Sidebar";
import PageLinks from "../../../components/PageLinks/PageLinks";
import { getSidebarLinks, foundationsSidebarLinks } from "@/config/navigation";
import styles from "./page.module.css";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";

const { sidebarLinks } = getSidebarLinks(foundationsSidebarLinks, "/foundations/elevation");

/* ============================================
   SHADOW TOKENS
   The only two shadows in the system. Values are
   mirrored from tokens-light.css / tokens-dark.css.
   ============================================ */

interface ShadowToken {
  label: string;
  token: string;
  tileClass: string;
  light: string;
  dark: string;
  usedBy: string;
}

const shadowTokens: ShadowToken[] = [
  {
    label: "Floating",
    token: "--shadow-floating",
    tileClass: "elevationTileFloating",
    light: "0 4px 16px rgba(0, 0, 0, 0.12)",
    dark: "0 4px 16px rgba(0, 0, 0, 0.55)",
    usedBy: "Popover, Dropdown and DropdownMenu, Combobox, ContextMenu, ColorPicker, chart tooltips, Toast, chat surfaces, the floating App sidebar, the command palette",
  },
  {
    label: "Modal",
    token: "--shadow-modal",
    tileClass: "elevationTileModal",
    light: "0 8px 32px rgba(0, 0, 0, 0.2)",
    dark: "0 8px 32px rgba(0, 0, 0, 0.6)",
    usedBy: "Dialog and AlertDialog panels, Drawer, paired with the --color-scrim backdrop",
  },
];

/* ============================================
   DEPTH RAMP
   How depth is expressed without shadows.
   ============================================ */

interface DepthLevel {
  label: string;
  token: string;
  swatchClass: string;
  use: string;
}

const depthLevels: DepthLevel[] = [
  {
    label: "Page floor",
    token: "--color-bg-page-primary",
    swatchClass: "depthSwatchPage",
    use: "Body background, app root",
  },
  {
    label: "Container primary",
    token: "--color-bg-container-primary",
    swatchClass: "depthSwatchPrimary",
    use: "Sidebars, card fills, section bands",
  },
  {
    label: "Container secondary",
    token: "--color-bg-container-secondary",
    swatchClass: "depthSwatchSecondary",
    use: "Nested cards, inner panels",
  },
  {
    label: "Container tertiary",
    token: "--color-bg-container-tertiary",
    swatchClass: "depthSwatchTertiary",
    use: "Pressed and active states, deepest UI surfaces",
  },
];

/* ============================================
   PAGE
   ============================================ */

export default function ElevationPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <Sidebar links={sidebarLinks} />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          {/* Page Title */}
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Elevation</h1>
            <PageLinks storybookPath="/?path=/docs/foundations-tokens--docs" />
          </div>

          {/* Intro */}
          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              Colour carries depth; shadows are the exception
            </p>
            <p className={styles.introBody}>
              Standard containers never carry a shadow. Depth comes from stepping through the
              container colour ramp, which keeps surfaces flat, crisp, and legible against the
              page floor. Only surfaces that genuinely float above the page (anchored overlays,
              modals, and the floating App sidebar) earn a shadow, and the elevation tokens
              below are the only ones that exist for it. Never write a literal <code>box-shadow</code> value in component CSS.
            </p>
          </div>

          {/* Shadow tokens */}
          <section className={`${styles.section} animate-in animate-delay-2`}>
            <SectionTitle title="Shadow tokens" />
            <p className={styles.sectionNote}>
              Both tokens are defined per theme, with stronger opacity in dark mode so they still
              read against the #050505 floor.
            </p>
            <div className={styles.elevationGrid}>
              {shadowTokens.map((shadow) => (
                <div key={shadow.token} className={styles.elevationItem}>
                  <div className={`${styles.elevationTile} ${styles[shadow.tileClass]}`}>
                    <span className={styles.elevationLabel}>{shadow.label}</span>
                    <span className={styles.elevationValue}>{shadow.token}</span>
                  </div>
                  <dl className={styles.elevationMeta}>
                    <div className={styles.metaRow}>
                      <dt className={styles.metaTerm}>Light</dt>
                      <dd className={styles.metaValue}>{shadow.light}</dd>
                    </div>
                    <div className={styles.metaRow}>
                      <dt className={styles.metaTerm}>Dark</dt>
                      <dd className={styles.metaValue}>{shadow.dark}</dd>
                    </div>
                    <div className={styles.metaRow}>
                      <dt className={styles.metaTerm}>Used by</dt>
                      <dd className={styles.metaValue}>{shadow.usedBy}</dd>
                    </div>
                  </dl>
                </div>
              ))}
            </div>
          </section>

          {/* Depth without shadows */}
          <section className={styles.section}>
            <SectionTitle title="Depth without shadows" />
            <p className={styles.sectionNote}>
              Everything below the floating layer expresses hierarchy through background steps.
              Each level takes its own step on the neutral ramp, so a boundary reads from the
              contrast between adjacent surfaces, not from a lift. In light the containers are
              the bright side of that contrast, white against a soft grey floor; in dark they
              step up from a near-black one.
            </p>
            <div className={styles.depthList}>
              {depthLevels.map((level) => (
                <div key={level.token} className={styles.depthRow}>
                  <div className={`${styles.depthSwatch} ${styles[level.swatchClass]}`} />
                  <div className={styles.depthText}>
                    <span className={styles.depthLabel}>{level.label}</span>
                    <span className={styles.depthToken}>{level.token}</span>
                  </div>
                  <span className={styles.depthUse}>{level.use}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Exception */}
          <section className={styles.section}>
            <SectionTitle title="The one exception" />
            <p className={styles.sectionNote}>
              Interactive Card and EntityCard navigation tiles lift on hover. That shadow is a
              deliberate navigational affordance, a signal that the whole tile is clickable, not
              an elevation pattern to copy onto static containers.
            </p>
          </section>
        </main>
      </div>

    </>
  );
}
