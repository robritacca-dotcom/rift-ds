"use client";

/**
 * The home page's bento under the collage: three BentoTiles in one row,
 * the look, the agent and the install. Each tile opens into an overlay
 * with the detail: a lede and the pages that own the fact, a working
 * showcase beside a fact sheet, and three features. The content lives in
 * tiles.tsx, the scenes and showcases in scenes.tsx.
 */

import React from "react";
import { BentoTile } from "rift-ds/components/BentoTile/BentoTile";
import { Button } from "rift-ds/components/Button/Button";
import { HOME_TILES, type HomeTile } from "./tiles";
import styles from "./HomeBento.module.css";

export default function HomeBento() {
  return (
    <section className={styles.section} aria-labelledby="home-bento-title">
      {/* One statement, in two weights: the claim, then what it covers. */}
      <h2 id="home-bento-title" className={styles.statement}>
        Skip the blank page.{" "}
        <span>
          Change the whole look with one line, and let your coding agent
          build with the real API instead of guessing.
        </span>
      </h2>

      <div className={styles.grid}>
        {HOME_TILES.map((tile) => (
          <BentoTile
            key={tile.id}
            title={tile.title}
            description={tile.description}
            align={tile.align}
            expandedContent={<TileDetail tile={tile} />}
          >
            <tile.Scene />
          </BentoTile>
        ))}
      </div>
    </section>
  );
}

/** What an open tile shows under its title. */
function TileDetail({ tile }: { tile: HomeTile }) {
  const { Showcase, side } = tile;
  const Provider = tile.Provider ?? React.Fragment;
  return (
    <div className={styles.detail}>
      <div className={styles.detailHead}>
        <div>
          <p className={styles.detailLede}>{tile.lede}</p>
          <div className={styles.detailCtas}>
            <Button label={tile.primary.label} href={tile.primary.href} iconLeft={tile.primary.icon} />
            <Button
              label={tile.secondary.label}
              href={tile.secondary.href}
              variant="secondary"
              tone="neutral"
              iconRight={tile.secondary.external ? "open_in_new" : undefined}
              {...(tile.secondary.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            />
          </div>
        </div>
        <ul className={styles.checks}>
          {tile.points.map((p) => (
            <li key={p}>
              <span className={`material-symbols-rounded ${styles.check}`} aria-hidden="true">check</span>
              {p}
            </li>
          ))}
        </ul>
      </div>

      <Provider>
      <div className={styles.showcase}>
        <div className={styles.showMain}>
          <Showcase />
        </div>
        <div className={styles.showSide}>
          <h3 className={styles.sideTitle}>{side.title}</h3>
          {"Component" in side ? (
            <side.Component />
          ) : (
            <dl className={side.stacked ? styles.factsStacked : styles.facts}>
              {side.rows.map(([k, v]) => (
                <React.Fragment key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </React.Fragment>
              ))}
            </dl>
          )}
        </div>
      </div>
      </Provider>

      <div className={styles.features}>
        {tile.features.map((f) => (
          <div key={f.icon}>
            <span className={styles.featureIcon}>
              <span className="material-symbols-rounded" aria-hidden="true">{f.icon}</span>
            </span>
            <p>{f.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
