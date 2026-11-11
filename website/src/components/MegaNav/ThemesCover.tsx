"use client";

import { tokenValue } from "rift-ds/tokens/values";
import { themeSelectorTiles } from "@/lib/theme/presets";
import { useSiteTheme } from "@/lib/theme/use-theme-overrides";
import s from "./ThemesCover.module.css";

/* Four themes far apart on the wheel, so the card shows the range. Ids are
   keys of THEME_PRESETS; an id that stops existing simply drops out. */
const FEATURED = ["coral", "plum", "forest", "contrast"];

const ACCENTS = ["violet", "coral", "gold", "mint", "cobalt", "amber"];

/**
 * The Foundations showcase's cover: four themes as they really look,
 * whatever theme the site is wearing, the way the Themes page shows them.
 * Each tile is that theme's page surface with its name in its heading
 * face, one pill in its action colour and its accent dots, all read from
 * the published token values for the site's current light or dark mode.
 * Plain data, no WebGL. Decorative; the card's copy carries the meaning.
 */
export function ThemesCover() {
  const mode = useSiteTheme() === "light" ? "light" : "dark";
  const tiles = themeSelectorTiles(mode);
  const value = (token: string, id: string) => tokenValue(token, id, mode);

  return (
    <div className={s.cover} aria-hidden="true">
      {FEATURED.flatMap((id) => {
        const tile = tiles.find((t) => t.value === id);
        if (!tile) return [];
        return [
          <span
            key={id}
            className={s.tile}
            style={
              {
                "--tile-surface": value("--color-bg-page-primary", id),
                "--tile-border": value("--color-bg-container-border", id),
                "--tile-heading": value("--color-text-display", id),
                "--tile-text": value("--color-text-secondary", id),
                "--tile-action": value("--color-action-primary-bg", id),
                "--tile-action-text": value("--color-action-primary-text", id),
                "--tile-radius": value("--radius-400", id),
                "--tile-pill": value("--radius-pill", id),
              } as React.CSSProperties
            }
          >
            <span className={s.name} style={{ fontFamily: tile.headingFont }}>
              {tile.label}
            </span>
            <span className={s.pairing} style={{ fontFamily: tile.bodyFont }}>
              {tile.description}
            </span>
            <span className={s.foot}>
              <span className={s.pill} style={{ fontFamily: tile.bodyFont }}>
                Button
              </span>
              <span className={s.dots}>
                {ACCENTS.map((accent) => (
                  <span
                    key={accent}
                    className={s.dot}
                    style={{ background: value(`--color-core-accent-${accent}`, id) }}
                  />
                ))}
              </span>
            </span>
          </span>,
        ];
      })}
    </div>
  );
}
