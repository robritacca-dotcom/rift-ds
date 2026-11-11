"use client";

import { useLayoutEffect } from "react";
import { Button } from "rift-ds/components/Button/Button";
import { FigmaIcon } from "@/components/BrandIcons/BrandIcons";
import { BRAND_NAME } from "@/config/brand.generated";
import { installScopedThemes, THEME_SCOPE_ATTRIBUTE } from "@/lib/theme/scoped-theme";
import { THEME_PRESETS } from "@/lib/theme/presets";
import { figmaVariableName } from "./kit";
import s from "./KitWindow.module.css";

/**
 * A picture of the kit open in Figma, drawn from the library itself. The
 * canvas is the kit's Button page: live Buttons inside a selected
 * component set, worn in the theme the kit's pages are set to (a theme
 * scope, see scoped-theme.ts), following the site's light or dark mode as
 * the kit's Mode collection would. The layers panel lists the set's
 * variants and the Design panel shows its properties (the props), its
 * variable modes and the variables it reads. Figma's own interface is
 * drawn in Figma's colours, not the theme's. The whole picture is inert and
 * hidden from assistive tech; the page's figcaption says what it shows.
 */

/** The theme the kit's pages are set to. */
const KIT_PAGE_THEME = "contrast";
const KIT_PAGE_THEME_LABEL = THEME_PRESETS[KIT_PAGE_THEME]?.label ?? KIT_PAGE_THEME;

const VARIANTS = ["primary", "secondary", "tertiary"] as const;
const COLUMNS = [
  { key: "default", size: "default" as const, disabled: false },
  { key: "compact", size: "compact" as const, disabled: false },
  { key: "disabled", size: "default" as const, disabled: true },
];

const cap = (word: string) => word[0].toUpperCase() + word.slice(1);

/* An excerpt of the kit's page list, its divider pages included (the full
   order is in the new-figma-component skill's conventions). */
const PAGES = ["Cover", "---", "Colour", "Typography", "Themes", "------", "Button"];

const VARIANT_LAYERS = VARIANTS.flatMap((variant) =>
  ["Default", "Compact"].map((size) => `Variant=${cap(variant)}, Size=${size}`)
);

const SELECTION_COLOURS = [
  "--color-action-primary-bg",
  "--color-action-primary-text",
  "--color-action-neutral-text",
  "--color-action-neutral-bg",
];

const PROPERTIES = [
  { name: "Variant", value: "Primary" },
  { name: "Tone", value: "Default" },
  { name: "Size", value: "Default" },
];

const CURSORS = [
  { name: "Designer", className: s.cursorDesigner },
  { name: "Engineer", className: s.cursorEngineer },
  { name: "Agent", className: s.cursorAgent },
];

/* ---------- Figma's glyphs, drawn ---------- */

function ComponentGlyph() {
  return (
    <svg viewBox="0 0 16 16" className={s.glyph} aria-hidden="true">
      <path d="M8 1.8 10.1 3.9 8 6 5.9 3.9Z M3.9 5.9 6 8 3.9 10.1 1.8 8Z M12.1 5.9 14.2 8 12.1 10.1 10 8Z M8 10 10.1 12.1 8 14.2 5.9 12.1Z" />
    </svg>
  );
}

function InstanceGlyph() {
  return (
    <svg viewBox="0 0 16 16" className={s.glyph} aria-hidden="true">
      <path d="M8 2.5 13.5 8 8 13.5 2.5 8Z" />
    </svg>
  );
}

function FrameGlyph() {
  return (
    <svg viewBox="0 0 16 16" className={s.glyph} aria-hidden="true">
      <path d="M5.5 2v12M10.5 2v12M2 5.5h12M2 10.5h12" />
    </svg>
  );
}

function Chevron() {
  return (
    <svg viewBox="0 0 16 16" className={s.chevron} aria-hidden="true">
      <path d="M5 6.5 8 9.5 11 6.5" />
    </svg>
  );
}

function Plus() {
  return (
    <svg viewBox="0 0 16 16" className={s.glyph} aria-hidden="true">
      <path d="M8 3v10M3 8h10" />
    </svg>
  );
}

function Symbol({ name }: { name: string }) {
  return <span className={`material-symbols-rounded ${s.symbol}`}>{name}</span>;
}

function Section({ title, add, children }: { title: string; add?: boolean; children?: React.ReactNode }) {
  return (
    <div className={s.section}>
      <div className={children ? s.sectionHead : s.sectionHeadMuted}>
        <span>{title}</span>
        {add && <Plus />}
      </div>
      {children}
    </div>
  );
}

function ModeLabel() {
  return (
    <>
      <span className={s.whenLight}>Light</span>
      <span className={s.whenDark}>Dark</span>
    </>
  );
}

export function KitWindow() {
  /* Before paint, so the canvas never shows the site's theme first. */
  useLayoutEffect(() => installScopedThemes(), []);

  return (
    <div className={s.app} aria-hidden="true" inert>
      {/* ---------- left: file, pages, layers ---------- */}
      <div className={`${s.panel} ${s.panelStart}`}>
        <div className={s.fileBar}>
          <span className={s.fileMenu}>
            <FigmaIcon />
            <Chevron />
          </span>
          <Symbol name="dock_to_right" />
        </div>
        <div className={s.fileTitle}>
          <span className={s.fileName}>
            {BRAND_NAME}
            <Chevron />
          </span>
          <span className={s.fileProject}>Drafts</span>
        </div>
        <div className={s.tabs}>
          <span className={s.tabOn}>File</span>
          <span className={s.tab}>Assets</span>
        </div>

        <div className={s.tree}>
          <div className={s.treeHead}>
            <span className={s.treeTitle}>
              <Chevron />
              Pages
            </span>
            <Plus />
          </div>
          {PAGES.map((page, i) => (
            <div key={`${page}-${i}`} className={page === "Button" ? s.rowOn : s.row}>
              {page}
            </div>
          ))}
        </div>

        <div className={s.tree}>
          <div className={s.treeHead}>
            <span className={s.treeTitle}>
              <Chevron />
              Layers
            </span>
          </div>
          <div className={s.selectedLayers}>
            <div className={`${s.layer} ${s.layerComponent}`}>
              <ComponentGlyph />
              Button
            </div>
            {VARIANT_LAYERS.map((layer) => (
              <div key={layer} className={`${s.layer} ${s.layerComponent} ${s.layerChild}`}>
                <InstanceGlyph />
                {layer}
              </div>
            ))}
          </div>
          <div className={s.layer}>
            <FrameGlyph />
            Sticker sheet
          </div>
          <div className={s.layer}>
            <FrameGlyph />
            Header
          </div>
        </div>
      </div>

      {/* ---------- canvas: the kit's Button page ---------- */}
      <div className={s.canvas}>
        <div className={s.stage} {...{ [THEME_SCOPE_ATTRIBUTE]: KIT_PAGE_THEME }}>
          <span className={s.frameName}>Main component</span>
          <div className={s.kitPanel}>
            <div className={s.selection}>
              <span className={s.selectionName}>
                <ComponentGlyph />
                Button
              </span>
              <div className={s.set}>
                {VARIANTS.map((variant) =>
                  COLUMNS.map((col) => (
                    <Button
                      key={`${variant}-${col.key}`}
                      label="Button"
                      variant={variant}
                      size={col.size}
                      disabled={col.disabled}
                      tabIndex={-1}
                    />
                  ))
                )}
              </div>
              <span className={`${s.handle} ${s.handleTl}`} />
              <span className={`${s.handle} ${s.handleTr}`} />
              <span className={`${s.handle} ${s.handleBl}`} />
              <span className={`${s.handle} ${s.handleBr}`} />
              <span className={s.sizeTag}>Hug × Hug</span>
            </div>
          </div>
        </div>

        <div className={s.toolbar}>
          <span className={s.toolOn}>
            <Symbol name="arrow_selector_tool" />
          </span>
          <Chevron />
          <span className={s.tool}>
            <FrameGlyph />
          </span>
          <Chevron />
          <span className={s.tool}>
            <Symbol name="check_box_outline_blank" />
          </span>
          <Chevron />
          <span className={s.tool}>
            <Symbol name="ink_pen" />
          </span>
          <Chevron />
          <span className={s.tool}>
            <Symbol name="title" />
          </span>
          <span className={s.tool}>
            <Symbol name="add_comment" />
          </span>
          <span className={s.tool}>
            <Symbol name="auto_awesome" />
          </span>
          <span className={s.toolRule} />
          <span className={s.devToggle}>
            <span className={s.devKnob}>
              <Symbol name="code" />
            </span>
          </span>
        </div>

        {CURSORS.map((cursor) => (
          <span key={cursor.name} className={`${s.cursor} ${cursor.className}`}>
            <svg viewBox="0 0 16 16" className={s.cursorArrow}>
              <path d="M2 1.5v12.2l3.3-3.1 2.4 4.6 2-1-2.4-4.5 4.6-.3Z" />
            </svg>
            <span className={s.cursorName}>{cursor.name}</span>
          </span>
        ))}
      </div>

      {/* ---------- right: the Design panel ---------- */}
      <div className={`${s.panel} ${s.panelEnd}`}>
        <div className={s.shareBar}>
          <span className={s.people}>
            {CURSORS.map((cursor) => (
              <span key={cursor.name} className={`${s.avatar} ${cursor.className}`}>
                {cursor.name[0]}
              </span>
            ))}
            <Chevron />
          </span>
          <span className={s.present}>
            <Symbol name="play_arrow" />
            <Chevron />
          </span>
          <span className={s.share}>Share</span>
        </div>
        <div className={s.tabs}>
          <span className={s.tabOn}>Design</span>
          <span className={s.tab}>Prototype</span>
          <span className={s.zoom}>
            100%
            <Chevron />
          </span>
        </div>

        <div className={s.section}>
          <div className={s.setTitle}>
            <span className={s.setName}>
              <ComponentGlyph />
              Button
              <Chevron />
            </span>
            <Symbol name="more_horiz" />
          </div>
        </div>

        <Section title="Properties" add>
          {PROPERTIES.map((prop) => (
            <div key={prop.name} className={s.prop}>
              <span className={s.propName}>{prop.name}</span>
              <span className={s.select}>
                {prop.value}
                <Chevron />
              </span>
            </div>
          ))}
        </Section>

        <Section title="Layer">
          <div className={s.prop}>
            <span className={s.propName}>Mode</span>
            <span className={s.select}>
              <span>
                Auto (<ModeLabel />)
              </span>
              <Chevron />
            </span>
          </div>
          <div className={s.prop}>
            <span className={s.propName}>Theme</span>
            <span className={s.select}>
              Auto ({KIT_PAGE_THEME_LABEL})
              <Chevron />
            </span>
          </div>
        </Section>

        <Section title="Selection colors">
          <div {...{ [THEME_SCOPE_ATTRIBUTE]: KIT_PAGE_THEME }} className={s.colours}>
            {SELECTION_COLOURS.map((token) => (
              <div key={token} className={s.colour}>
                <span className={s.swatch} style={{ background: `var(${token})` }} />
                <span className={s.colourName}>{figmaVariableName(token)}</span>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Stroke" add />
        <Section title="Effects" add />
        <Section title="Export" add />
      </div>
    </div>
  );
}
