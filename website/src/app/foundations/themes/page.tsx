"use client";

import { useSyncExternalStore } from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import Sidebar from "../../../components/Sidebar/Sidebar";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import { getSidebarLinks, foundationsSidebarLinks } from "@/config/navigation";
import { Button } from "@robr0/design-system/components/Button/Button";
import { CodeBlock } from "@robr0/design-system/components/CodeBlock/CodeBlock";
import {
  THEME_PRESETS,
  themeSelectorTiles,
} from "@/lib/theme/presets";
import { SHIPPED_ACCENTS } from "@/lib/theme/theme-overrides";
import { useSiteTheme } from "@/lib/theme/use-theme-overrides";
import { applyBrand, readBrand, subscribeBrand } from "@/lib/theme/brand";
import styles from "./page.module.css";

/* Matches the SSR value of data-brand on <html> in the root layout. */
const getServerSnapshot = () => "mono";

const { sidebarLinks } = getSidebarLinks(foundationsSidebarLinks, "/foundations/themes");

const SETUP_SNIPPET = `// Every shipped theme, one generated stylesheet each, plus this aggregate.
import '@robr0/design-system/tokens/presets/presets.css';

<html data-brand="terminal">`;

/**
 * The theme gallery. Every card is drawn from the same tile builder the
 * header switcher and the playground picker read, and Apply goes through
 * the same shared brand helper — so this page, the switchers, and the
 * generated stylesheets can never disagree. The page itself is the
 * preview: applying a look rethemes everything you are looking at.
 */
export default function ThemesPage() {
  const theme = useSiteTheme();
  const active = useSyncExternalStore(subscribeBrand, readBrand, getServerSnapshot);
  const tiles = themeSelectorTiles(theme === "dark" ? "dark" : "light");

  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <Sidebar links={sidebarLinks} />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          {/* Page Header */}
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Themes</h1>
          </div>

          {/* Intro */}
          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              The same system, wearing {tiles.length} complete looks
            </p>
            <p className={styles.introBody}>
              Every theme here is the whole system under different primitives:
              both colour modes, a heading and body type pairing with
              self-hosted fonts, radius, density, motion, elevation, the
              ambient background, and the chart palette. Apply one and this
              page rethemes around you, which is the honest preview. The
              playground builds your own the same way and copies out the CSS.
            </p>
          </div>

          {/* Consumer setup */}
          <div className={`${styles.setupBlock} animate-in animate-delay-2`}>
            <CodeBlock code={SETUP_SNIPPET} language="tsx" showCopy />
          </div>

          {/* Gallery */}
          <div className={`${styles.grid} animate-in animate-delay-2`}>
            {tiles.map((tile) => {
              const preset = THEME_PRESETS[tile.value];
              const accents = preset?.accents ?? SHIPPED_ACCENTS;
              const isActive = active === tile.value;
              return (
                <article
                  key={tile.value}
                  className={`${styles.card} ${isActive ? styles.cardActive : ""}`}
                >
                  <div className={styles.cardSwatches}>
                    <span
                      className={styles.brandSwatch}
                      style={{
                        backgroundColor: tile.color,
                        borderRadius: tile.swatchRadius,
                      }}
                      aria-hidden="true"
                    />
                    <span className={styles.accentRow} aria-hidden="true">
                      {Object.values(accents).map((hex, i) => (
                        <span
                          key={i}
                          className={styles.accentDot}
                          style={{ backgroundColor: hex }}
                        />
                      ))}
                    </span>
                  </div>

                  <h2
                    className={styles.cardName}
                    style={{ fontFamily: tile.headingFont }}
                  >
                    {tile.label}
                  </h2>
                  <p
                    className={styles.cardPairing}
                    style={{ fontFamily: tile.bodyFont }}
                  >
                    {tile.description}
                  </p>

                  {preset && (
                    <p className={styles.cardLevers}>
                      radius {preset.radiusScale}% · density {preset.density}% ·
                      motion {preset.motionScale}% · {preset.elevation} elevation
                    </p>
                  )}
                  {!preset && (
                    <p className={styles.cardLevers}>
                      the raw token files, exactly as shipped
                    </p>
                  )}

                  <div className={styles.cardActions}>
                    <Button
                      label={isActive ? "Applied" : "Apply"}
                      variant="primary"
                      size="compact"
                      iconLeft={isActive ? "check" : "brush"}
                      state={isActive ? "disabled" : "default"}
                      onClick={() => applyBrand(tile.value)}
                    />
                    <Button
                      label="Open in playground"
                      variant="tertiary"
                      size="compact"
                      iconRight="arrow_forward"
                      href="/playground"
                    />
                  </div>
                </article>
              );
            })}
          </div>
        </main>
      </div>
    </>
  );
}
