"use client";

import { useSyncExternalStore } from "react";
import { Table } from "rift-ds/components/Table/Table";
import { tokenValue, type ThemeMode } from "rift-ds/tokens/values";
import { readBrand, subscribeBrand, SERVED_THEME_ID } from "@/lib/theme/brand";
import { themeSelectorTiles } from "@/lib/theme/presets";
import { useSiteTheme } from "@/lib/theme/use-theme-overrides";
import { PANEL_VARIABLES, figmaVariableName } from "./kit";
import s from "./page.module.css";

const isColour = (value: string) => value.startsWith("#") || value.startsWith("rgb");

/**
 * The kit's variables as the site is wearing them: the theme and mode the
 * visitor has picked in the header, read from the resolved token values, so
 * switching either re-draws the table. A theme that is not a mode of the
 * kit's Theme collection says so under the table.
 */
export function VariablesPanel({ themeIds }: { themeIds: readonly string[] }) {
  const brand = useSyncExternalStore(subscribeBrand, readBrand, () => SERVED_THEME_ID);
  const mode: ThemeMode = useSiteTheme() === "light" ? "light" : "dark";
  const label = themeSelectorTiles(mode).find((t) => t.value === brand)?.label ?? brand;
  const modeLabel = mode === "light" ? "Light" : "Dark";
  const inKit = themeIds.includes(brand);
  const value = (token: string) => tokenValue(token, brand, mode) ?? "";

  return (
    <figure className={s.variables}>
      <Table
        bordered
        size="compact"
        caption={`Variables in the ${label} theme, ${mode} mode`}
        captionHidden
        columns={[
          { key: "figma", header: "In Figma", rowHeader: true },
          { key: "collection", header: "Collection" },
          { key: "code", header: "In code" },
          { key: "value", header: `${label}, ${modeLabel}` },
        ]}
        rows={PANEL_VARIABLES.map(({ token, collection }) => {
          const v = value(token);
          return {
            id: token,
            cells: {
              figma: <code className={s.defKey}>{figmaVariableName(token)}</code>,
              collection,
              code: <code className={s.defKey}>{token}</code>,
              value: (
                <span className={s.variableValue}>
                  {isColour(v) && (
                    <span
                      className={s.variableSwatch}
                      style={{ "--swatch": v } as React.CSSProperties}
                      aria-hidden="true"
                    />
                  )}
                  <code className={s.defKey}>{v}</code>
                </span>
              ),
            },
          };
        })}
      />
      <figcaption className={s.figureCaption}>
        {inKit
          ? `The values follow the theme and mode this site is in, ${label} ${modeLabel}. Switch either in the header and the table follows, as the kit's variables do when a page's modes change.`
          : `The values follow the theme and mode this site is in, ${label} ${modeLabel}. ${label} is not a mode in the kit, so in Figma it comes in through its token files.`}
      </figcaption>
    </figure>
  );
}
