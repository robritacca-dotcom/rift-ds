"use client";

import { useLayoutEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import MegaNav from "../../../components/MegaNav/MegaNav";
import Sidebar from "../../../components/Sidebar/Sidebar";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import { EXAMPLES, ShowcaseMosaic } from "@/components/ThemeShowcase/ThemeShowcase";
import { getSidebarLinks, foundationsSidebarLinks } from "@/config/navigation";
import { Button } from "rift-ds/components/Button/Button";
import { CircularButton } from "rift-ds/components/CircularButton/CircularButton";
import { CodeBlock } from "rift-ds/components/CodeBlock/CodeBlock";
import { SegmentedControl } from "rift-ds/components/SegmentedControl/SegmentedControl";
import { THEME_PRESETS, themeSelectorTiles } from "@/lib/theme/presets";
import { motionSpeedPercent } from "@/lib/theme/theme-overrides";
import { installScopedThemes, THEME_SCOPE_ATTRIBUTE } from "@/lib/theme/scoped-theme";
import { useSiteTheme } from "@/lib/theme/use-theme-overrides";
import { applyBrand, readBrand, SERVED_THEME_ID, subscribeBrand } from "@/lib/theme/brand";
import styles from "./page.module.css";
import { ThemeBanner } from "./ThemeBanner";

/* Matches the SSR value of data-brand on <html> in the root layout. */
const getServerSnapshot = () => SERVED_THEME_ID;

const { sidebarLinks } = getSidebarLinks(foundationsSidebarLinks, "/foundations/themes");

const SETUP_SNIPPET = `// Every shipped theme, one generated stylesheet each, plus this aggregate.
import 'rift-ds/tokens/presets/presets.css';

<html data-brand="terminal">`;

const EXAMPLE_ICONS: Record<string, string> = {
  listening: "music_note",
  workspace: "work",
  travel: "luggage",
  studio: "photo_camera",
};

/**
 * The theme gallery, led by what a theme does rather than its swatches: a
 * stage of real example screens (from components/ThemeShowcase) wearing
 * the staged theme, with a row of every shipped theme above it to swap
 * through. The stage is a theme scope, so a swap re-themes only the stage
 * and the page stays put; Apply to site then puts the staged theme on the
 * whole site through the shared brand helper.
 *
 * The swap row is drawn from the same tile builder the header switcher and
 * the playground picker read, so this page, the switchers and the
 * generated stylesheets can never disagree. Each chip wears its theme's
 * own heading face and swatch shape.
 */
export default function ThemesPage() {
  const theme = useSiteTheme();
  const active = useSyncExternalStore(subscribeBrand, readBrand, getServerSnapshot);
  const tiles = themeSelectorTiles(theme === "dark" ? "dark" : "light");

  /* The stage opens on the theme the site is wearing, and follows a swap. */
  const [picked, setPicked] = useState<string | null>(null);
  const staged = picked ?? active;
  const stagedTile = tiles.find((tile) => tile.value === staged) ?? tiles[0];
  const stagedPreset = THEME_PRESETS[stagedTile.value];

  const [exampleId, setExampleId] = useState(EXAMPLES[0].id);
  const example = EXAMPLES.find((item) => item.id === exampleId) ?? EXAMPLES[0];

  /* The stage is a theme scope, so it keeps its own look whatever the page
     wears. Before paint, so it never shows the page's theme first. */
  useLayoutEffect(() => installScopedThemes(), []);

  const isApplied = active === stagedTile.value;

  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <Sidebar links={sidebarLinks} />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Themes</h1>
          </div>

          <section
            className={`${styles.showcase} animate-in animate-delay-1`}
            aria-label="Theme showcase"
          >
            <div className={styles.toolbar}>
              <SegmentedControl
                aria-label="Example screen"
                collapse
                size="compact"
                tone="neutral"
                value={exampleId}
                onValueChange={setExampleId}
                segments={EXAMPLES.map((item) => ({
                  value: item.id,
                  label: item.label,
                  icon: EXAMPLE_ICONS[item.id],
                }))}
              />

              <div className={styles.swap} role="group" aria-label="Theme">
                {tiles.map((tile) => (
                  <button
                    key={tile.value}
                    type="button"
                    className={styles.swapChip}
                    aria-pressed={tile.value === stagedTile.value}
                    onClick={() => setPicked(tile.value)}
                  >
                    <span
                      className={styles.swapSwatch}
                      style={{ backgroundColor: tile.color, borderRadius: tile.swatchRadius }}
                      aria-hidden="true"
                    />
                    <span style={{ fontFamily: tile.headingFont }}>{tile.label}</span>
                    {tile.value === active && (
                      <span className={styles.swapOn} title="On this site now">
                        <span className="material-symbols-rounded" aria-hidden="true">
                          check
                        </span>
                        <span className="ds-visually-hidden">, on this site now</span>
                      </span>
                    )}
                  </button>
                ))}
                {/* The row ends where a new theme would begin, like the
                    header switcher's menu: a dashed slot for the look that
                    doesn't exist yet. */}
                <Link href="/playground" className={`${styles.swapChip} ${styles.swapCreate}`}>
                  <span className="material-symbols-rounded" aria-hidden="true">
                    add
                  </span>
                  Make your own
                </Link>
              </div>
            </div>

            <div
              className={styles.stage}
              {...{ [THEME_SCOPE_ATTRIBUTE]: stagedTile.value }}
            >
              <ThemeBanner className={styles.stageBanner} />
              <div className={styles.stageBar}>
                <div className={styles.stageName}>
                  <span className={styles.stageTitle}>{stagedTile.label}</span>
                  <span className={styles.stageLevers}>
                    {stagedTile.description}
                    {stagedPreset
                      ? `, radius ${stagedPreset.radiusScale}%, density ${stagedPreset.density}%, motion ${motionSpeedPercent(stagedPreset.motionScale)}%, ${stagedPreset.elevation} elevation`
                      : ", the raw token files exactly as shipped"}
                  </span>
                </div>
                <div className={styles.stageActions}>
                  <Button
                    label={isApplied ? "On this site" : "Apply to site"}
                    size="compact"
                    iconLeft={isApplied ? "check" : "brush"}
                    disabled={isApplied}
                    onClick={() => applyBrand(stagedTile.value)}
                  />
                  <CircularButton
                    icon="description"
                    variant="secondary"
                    tone="neutral"
                    size="compact"
                    ariaLabel={`${stagedTile.label} DESIGN.md`}
                    tooltip="DESIGN.md"
                    href={`/foundations/themes/${stagedTile.value}`}
                  />
                  <CircularButton
                    icon="tune"
                    variant="secondary"
                    tone="neutral"
                    size="compact"
                    ariaLabel={`Open ${stagedTile.label} in the playground`}
                    tooltip="Playground"
                    href={`/playground?preset=${stagedTile.value}`}
                  />
                </div>
              </div>
              <ShowcaseMosaic key={example.id} example={example} className={styles.stageMosaic} />
            </div>
          </section>

          <div className={`${styles.introSection} animate-in animate-delay-2`}>
            <p className={styles.subDisplay}>
              {tiles.length} examples of how far the tokens can move
            </p>
            <p className={styles.introBody}>
              These themes are demonstrations, not a menu: each one is the
              whole system restyled through its tokens alone, to show the
              range one set of primitives covers. A look means both colour
              modes, a typeface or a heading and body pairing, with self-hosted fonts,
              type weight and tracking, the colour of the logo and of each type
              tier, icon weight, radius, density, motion, elevation, the ambient
              background, and the chart palette. Apply one and this whole site
              rethemes around you, which is the honest preview. Your own brand
              takes the same path: the playground builds it live and copies out
              paste-ready CSS.
            </p>
          </div>

          {/* Consumer setup, once a reader has seen what they would be setting up. */}
          <div className={`${styles.setupBlock} animate-in animate-delay-2`}>
            <CodeBlock code={SETUP_SNIPPET} language="tsx" showCopy />
          </div>
        </main>
      </div>
    </>
  );
}
