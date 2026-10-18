"use client";

/**
 * The bento grid. Every banner is a library BentoTile: the tile owns the
 * background (solid, shader or transparent), the safe area and the fade, the
 * hover glow, and the morph into its overlay. This page owns only the grid,
 * the scenes inside the tiles, and the layout of what each overlay shows.
 */

import React, { useState } from "react";
import { BentoTile } from "rift-ds/components/BentoTile/BentoTile";
import { Button } from "rift-ds/components/Button/Button";
import BrandSwitcher from "@/components/BrandSwitcher/BrandSwitcher";
import ThemeToggle from "@/components/ThemeToggle/ThemeToggle";
import { BANNERS, type Banner } from "./content";
import { ART_PATTERNS, Controls, initialSettings, type GridSettings, type TileSettings } from "./Controls";
import styles from "./Bento.module.css";

const initialAll = () => Object.fromEntries(BANNERS.map((b) => [b.id, initialSettings(b)]));
const INITIAL_GRID: GridSettings = { rowHeight: 620, rowsGrow: true };

export default function Bento() {
  const [settings, setSettings] = useState<Record<string, TileSettings>>(initialAll);
  const [grid, setGrid] = useState<GridSettings>(INITIAL_GRID);

  return (
    <main
      className={styles.page}
      data-rows={grid.rowsGrow ? "grow" : "fixed"}
      style={{ "--bento-row": `${grid.rowHeight}px` } as React.CSSProperties}
    >
      {/* The page is chromeless, so it carries its own theme controls: every
          texture and scene reads tokens, and this is how to see them re-theme. */}
      <div className={styles.themeBar}>
        <BrandSwitcher />
        <ThemeToggle />
      </div>

      <Controls
        banners={BANNERS}
        settings={settings}
        onSettingsChange={setSettings}
        grid={grid}
        onGridChange={setGrid}
        onReset={() => {
          setSettings(initialAll());
          setGrid(INITIAL_GRID);
        }}
      />

      <header className={styles.intro}>
        <h1 className={styles.headline}>
          A system that themes, talks and documents itself.{" "}
          <span>Tokens, components and an AI layer, built to work on their own or all together.</span>
        </h1>
      </header>

      <div className={styles.grid}>
        {BANNERS.map((b) => {
          const t = settings[b.id];
          return (
            <BentoTile
              key={b.id}
              title={b.title}
              headingLevel={2}
              data-span={b.span}
              className={styles.tile}
              background={t.background}
              highlight={t.highlight === "auto" ? undefined : t.highlight}
              align={t.align}
              expandedContent={t.expandable ? <BannerDetail banner={b} /> : undefined}
              style={
                {
                  "--ds-bento-tile-shader-opacity": t.shaderOpacity,
                  "--ds-bento-tile-inset": `${t.inset}px`,
                  "--ds-bento-tile-fade": `${t.fade}px`,
                } as React.CSSProperties
              }
            >
              <b.Scene />
            </BentoTile>
          );
        })}
      </div>

      {/* The six pairs laid out whole: each tile pins its pair, so the set
          reads in order whatever the grid around it. */}
      <section className={styles.gallery} aria-labelledby="bento-pairs">
        <h2 id="bento-pairs" className={styles.galleryTitle}>The shader pairs</h2>
        <p className={styles.galleryLede}>
          A shader background comes as a pair: a wash of light in the bottom-left corner with a line texture over it.
          Pair N is ambient colour N with texture N. Tiles rotate through the six by position, and highlight pins one.
        </p>
        <div className={styles.galleryGrid}>
          {ART_PATTERNS.map((p, i) => (
            <BentoTile
              key={p}
              title={`Pair ${i + 1}`}
              description={`Ambient ${i + 1} with ${p}`}
              headingLevel={3}
              background="shader"
              highlight={(i + 1) as 1 | 2 | 3 | 4 | 5 | 6}
            />
          ))}
        </div>
      </section>
    </main>
  );
}

/** What an open banner shows under its title. */
function BannerDetail({ banner }: { banner: Banner }) {
  const { Scene } = banner;
  return (
    <>
      <div className={styles.panelHead}>
        <div>
          <p className={styles.panelLede}>{banner.lede}</p>
          <div className={styles.panelCtas}>
            <Button label={banner.primary.label} href={banner.primary.href} iconRight="chevron_right" />
            <Button label={banner.secondary.label} href={banner.secondary.href} variant="secondary" />
          </div>
        </div>
        <ul className={styles.checks}>
          {banner.points.map((p) => (
            <li key={p}>
              <span className={`material-symbols-rounded ${styles.check}`} aria-hidden="true">check</span>
              {p}
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.showcase}>
        <div className={styles.showMain} inert>
          <Scene />
        </div>
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
        {banner.features.map((f) => (
          <div key={f.icon}>
            <span className={styles.featureIcon}>
              <span className={`material-symbols-rounded ${styles.icon}`} aria-hidden="true">{f.icon}</span>
            </span>
            <p>{f.text}</p>
          </div>
        ))}
      </div>
    </>
  );
}
