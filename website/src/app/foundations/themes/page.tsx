"use client";

import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import Sidebar from "../../../components/Sidebar/Sidebar";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import { getSidebarLinks, foundationsSidebarLinks } from "@/config/navigation";
import { Button } from "rift-ds/components/Button/Button";
import { CodeBlock } from "rift-ds/components/CodeBlock/CodeBlock";
import {
  ShaderField,
  type ShaderParams,
} from "rift-ds/components/ShaderField/ShaderField";
import { shaderBackground } from "@/data/shader-background";
import {
  THEME_PRESETS,
  themeSelectorTiles,
} from "@/lib/theme/presets";
import { SHIPPED_ACCENTS, motionSpeedPercent } from "@/lib/theme/theme-overrides";
import { installScopedThemes, THEME_SCOPE_ATTRIBUTE } from "@/lib/theme/scoped-theme";
import { useSiteTheme } from "@/lib/theme/use-theme-overrides";
import { applyBrand, readBrand, SERVED_THEME_ID, subscribeBrand } from "@/lib/theme/brand";
import styles from "./page.module.css";

/* Matches the SSR value of data-brand on <html> in the root layout. */
const getServerSnapshot = () => SERVED_THEME_ID;

const { sidebarLinks } = getSidebarLinks(foundationsSidebarLinks, "/foundations/themes");

const SETUP_SNIPPET = `// Every shipped theme, one generated stylesheet each, plus this aggregate.
import 'rift-ds/tokens/presets/presets.css';

<html data-brand="terminal">`;

/* The site field's look, refitted for a card-sized strip: the whole
   composition fitted to the banner (crop 0, the small-tile setting) and
   lifted in intensity, since a strip this short has to read at a glance. */
const BANNER_PARAMS: Partial<ShaderParams> = {
  ...shaderBackground.params,
  intensity: 0.85,
  crop: 0,
};

/**
 * A card's shader banner: the site's ambient field in that card's own theme.
 * The card is a theme scope (see scoped-theme.ts), and ShaderField reads its
 * colours from the canvas's computed style, so every banner paints its own
 * theme's accents and surfaces whichever theme the page is wearing.
 *
 * The field mounts only while the card is on screen. Browsers cap live WebGL
 * contexts, the site background already holds one, and ShaderField releases
 * its context on unmount, so a gallery of any length stays under the cap.
 * A gradient of the same accents sits underneath as the resting state.
 */
function ThemeBanner() {
  const frameRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin: "120px" }
    );
    observer.observe(frame);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={frameRef}
      className={styles.banner}
      aria-hidden="true"
    >
      <div className={styles.bannerFallback} />
      {visible && (
        <ShaderField params={BANNER_PARAMS} blobs={shaderBackground.blobs} />
      )}
    </div>
  );
}

/**
 * The theme gallery. Every card is drawn from the same tile builder the
 * header switcher and the playground picker read, and Apply goes through
 * the same shared brand helper — so this page, the switchers, and the
 * generated stylesheets can never disagree. Each card wears its own
 * theme, held there by a theme scope, so the gallery stays a stable
 * side-by-side while Apply rethemes the page around it.
 */
export default function ThemesPage() {
  const theme = useSiteTheme();
  const active = useSyncExternalStore(subscribeBrand, readBrand, getServerSnapshot);
  const tiles = themeSelectorTiles(theme === "dark" ? "dark" : "light");

  /* Every card is a theme scope, so each one keeps its own look while the
     page around it rethemes. Before paint, so the cards never show the
     applied theme first. */
  useLayoutEffect(() => installScopedThemes(), []);

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
              {tiles.length} examples of how far the tokens can move
            </p>
            <p className={styles.introBody}>
              These themes are demonstrations, not a menu: each one is the
              whole system restyled through its tokens alone, to show the
              range one set of primitives covers. A look means both colour
              modes, a typeface or a heading and body pairing, with self-hosted fonts,
              radius, density, motion, elevation, the ambient background, and
              the chart palette. Apply one and this page rethemes around you,
              which is the honest preview. Your own brand takes the same
              path: the playground builds it live and copies out paste-ready
              CSS.
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
                  {...{ [THEME_SCOPE_ATTRIBUTE]: tile.value }}
                >
                  <ThemeBanner />
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
                      motion {motionSpeedPercent(preset.motionScale)}% · {preset.elevation} elevation
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
                      href={`/playground?preset=${tile.value}`}
                    />
                  </div>
                </article>
              );
            })}

            {/* The grid ends where a new theme would begin, like the hero
                dot row and the switcher menu: a dashed slot for the look
                that doesn't exist yet. */}
            <article className={`${styles.card} ${styles.cardCreate}`}>
              <div className={styles.cardSwatches}>
                <span className={styles.createSwatch} aria-hidden="true">
                  <span className="material-symbols-rounded">add</span>
                </span>
              </div>

              <h2 className={styles.cardName}>Create your own</h2>
              <p className={styles.cardPairing}>
                Any colour, pairing, and shape over the same tokens
              </p>
              <p className={styles.cardLevers}>
                every lever live, copied out as paste-ready CSS
              </p>

              <div className={styles.cardActions}>
                <Button
                  label="Open the playground"
                  variant="primary"
                  size="compact"
                  iconRight="arrow_forward"
                  href="/playground"
                />
              </div>
            </article>
          </div>
        </main>
      </div>
    </>
  );
}
