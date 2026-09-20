"use client";

import { useState, useSyncExternalStore } from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import Sidebar from "../../../components/Sidebar/Sidebar";
import { ColourSwatch } from "@robr0/design-system/components/ColourSwatch/ColourSwatch";
import PageLinks from "../../../components/PageLinks/PageLinks";
import { getSidebarLinks, foundationsSidebarLinks } from "@/config/navigation";
import styles from "./page.module.css";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import { Tabs } from "@robr0/design-system/components/Tabs/Tabs";
import { Tooltip } from "@robr0/design-system/components/Tooltip/Tooltip";
import { FIGMA_FILE_URL } from "@/config/brand.generated";

const { sidebarLinks } = getSidebarLinks(foundationsSidebarLinks, "/foundations/colour-primitives");

/* ============================================
   PRIMITIVE COLOUR DATA
   No "primitive" field — these ARE the primitives.
   Only hex + RGB are shown.
   ============================================ */

interface PrimitiveSwatch {
  label: string;
  cssVar: string;
  hex: string;
  rgb: string;
  /** Compact label for the ramp view, where the row already carries the family name */
  short?: string;
}

/* --- Neutral Scale (00–11) --- */
const neutralColours: PrimitiveSwatch[] = [
  { label: "Neutral 00", cssVar: "--primitive-neutral-00", hex: "#FFFFFF", rgb: "255 / 255 / 255" },
  { label: "Neutral 01", cssVar: "--primitive-neutral-01", hex: "#F1F1F1", rgb: "241 / 241 / 241" },
  { label: "Neutral 02", cssVar: "--primitive-neutral-02", hex: "#D6D6D6", rgb: "214 / 214 / 214" },
  { label: "Neutral 03", cssVar: "--primitive-neutral-03", hex: "#BCBCBC", rgb: "188 / 188 / 188" },
  { label: "Neutral 04", cssVar: "--primitive-neutral-04", hex: "#A2A2A2", rgb: "162 / 162 / 162" },
  { label: "Neutral 05", cssVar: "--primitive-neutral-05", hex: "#888888", rgb: "136 / 136 / 136" },
  { label: "Neutral 06", cssVar: "--primitive-neutral-06", hex: "#6D6D6D", rgb: "109 / 109 / 109" },
  { label: "Neutral 07", cssVar: "--primitive-neutral-07", hex: "#303030", rgb: "48 / 48 / 48" },
  { label: "Neutral 08", cssVar: "--primitive-neutral-08", hex: "#232323", rgb: "35 / 35 / 35" },
  { label: "Neutral 09", cssVar: "--primitive-neutral-09", hex: "#0E0E0E", rgb: "14 / 14 / 14" },
  { label: "Neutral 10", cssVar: "--primitive-neutral-10", hex: "#050505", rgb: "5 / 5 / 5" },
  { label: "Neutral 11", cssVar: "--primitive-neutral-11", hex: "#000000", rgb: "0 / 0 / 0" },
];

/* --- Red Scale (00–11) --- */
const redColours: PrimitiveSwatch[] = [
  { label: "Red 00", cssVar: "--primitive-red-00", hex: "#FEF8FA", rgb: "254 / 248 / 250" },
  { label: "Red 01", cssVar: "--primitive-red-01", hex: "#FDEFF3", rgb: "253 / 239 / 243" },
  { label: "Red 02", cssVar: "--primitive-red-02", hex: "#FAD3DD", rgb: "250 / 211 / 221" },
  { label: "Red 03", cssVar: "--primitive-red-03", hex: "#F8B7C7", rgb: "248 / 183 / 199" },
  { label: "Red 04", cssVar: "--primitive-red-04", hex: "#F69BB1", rgb: "246 / 155 / 177" },
  { label: "Red 05", cssVar: "--primitive-red-05", hex: "#F37F9B", rgb: "243 / 127 / 155" },
  { label: "Red 06", cssVar: "--primitive-red-06", hex: "#F16385", rgb: "241 / 99 / 133" },
  { label: "Red 07", cssVar: "--primitive-red-07", hex: "#EF476F", rgb: "239 / 71 / 111" },
  { label: "Red 08", cssVar: "--primitive-red-08", hex: "#C93A5C", rgb: "201 / 58 / 92" },
  { label: "Red 09", cssVar: "--primitive-red-09", hex: "#8E2641", rgb: "142 / 38 / 65" },
  { label: "Red 10", cssVar: "--primitive-red-10", hex: "#571727", rgb: "87 / 23 / 39" },
  { label: "Red 11", cssVar: "--primitive-red-11", hex: "#45101D", rgb: "69 / 16 / 29" },
];

/* --- Orange Scale (00–11) --- */
const orangeColours: PrimitiveSwatch[] = [
  { label: "Orange 00", cssVar: "--primitive-orange-00", hex: "#FFFAF7", rgb: "255 / 250 / 247" },
  { label: "Orange 01", cssVar: "--primitive-orange-01", hex: "#FFF3EC", rgb: "255 / 243 / 236" },
  { label: "Orange 02", cssVar: "--primitive-orange-02", hex: "#FBD9C5", rgb: "251 / 217 / 197" },
  { label: "Orange 03", cssVar: "--primitive-orange-03", hex: "#F6B794", rgb: "246 / 183 / 148" },
  { label: "Orange 04", cssVar: "--primitive-orange-04", hex: "#F1996E", rgb: "241 / 153 / 110" },
  { label: "Orange 05", cssVar: "--primitive-orange-05", hex: "#F09263", rgb: "240 / 146 / 99" },
  { label: "Orange 06", cssVar: "--primitive-orange-06", hex: "#F08A56", rgb: "240 / 138 / 86" },
  { label: "Orange 07", cssVar: "--primitive-orange-07", hex: "#EF8247", rgb: "239 / 130 / 71" },
  { label: "Orange 08", cssVar: "--primitive-orange-08", hex: "#C65E33", rgb: "198 / 94 / 51" },
  { label: "Orange 09", cssVar: "--primitive-orange-09", hex: "#8F4324", rgb: "143 / 67 / 36" },
  { label: "Orange 10", cssVar: "--primitive-orange-10", hex: "#552716", rgb: "85 / 39 / 22" },
  { label: "Orange 11", cssVar: "--primitive-orange-11", hex: "#431D0F", rgb: "67 / 29 / 15" },
];

/* --- Yellow Scale (00–11) --- */
const yellowColours: PrimitiveSwatch[] = [
  { label: "Yellow 00", cssVar: "--primitive-yellow-00", hex: "#FFFCF6", rgb: "255 / 252 / 246" },
  { label: "Yellow 01", cssVar: "--primitive-yellow-01", hex: "#FFF9EA", rgb: "255 / 249 / 234" },
  { label: "Yellow 02", cssVar: "--primitive-yellow-02", hex: "#FFF0C9", rgb: "255 / 240 / 201" },
  { label: "Yellow 03", cssVar: "--primitive-yellow-03", hex: "#FFE5A3", rgb: "255 / 229 / 163" },
  { label: "Yellow 04", cssVar: "--primitive-yellow-04", hex: "#FFD97F", rgb: "255 / 217 / 127" },
  { label: "Yellow 05", cssVar: "--primitive-yellow-05", hex: "#FFD677", rgb: "255 / 214 / 119" },
  { label: "Yellow 06", cssVar: "--primitive-yellow-06", hex: "#FFD46F", rgb: "255 / 212 / 111" },
  { label: "Yellow 07", cssVar: "--primitive-yellow-07", hex: "#FFD166", rgb: "255 / 209 / 102" },
  { label: "Yellow 08", cssVar: "--primitive-yellow-08", hex: "#C49A3E", rgb: "196 / 154 / 62" },
  { label: "Yellow 09", cssVar: "--primitive-yellow-09", hex: "#8A6B2A", rgb: "138 / 107 / 42" },
  { label: "Yellow 10", cssVar: "--primitive-yellow-10", hex: "#544016", rgb: "84 / 64 / 22" },
  { label: "Yellow 11", cssVar: "--primitive-yellow-11", hex: "#42320F", rgb: "66 / 50 / 15" },
];

/* --- Green Scale (00–11) --- */
const greenColours: PrimitiveSwatch[] = [
  { label: "Green 00", cssVar: "--primitive-green-00", hex: "#F7FEFB", rgb: "247 / 254 / 251" },
  { label: "Green 01", cssVar: "--primitive-green-01", hex: "#ECFCF7", rgb: "236 / 252 / 247" },
  { label: "Green 02", cssVar: "--primitive-green-02", hex: "#CEF6E8", rgb: "206 / 246 / 232" },
  { label: "Green 03", cssVar: "--primitive-green-03", hex: "#9DEBD4", rgb: "157 / 235 / 212" },
  { label: "Green 04", cssVar: "--primitive-green-04", hex: "#6DE0C0", rgb: "109 / 224 / 192" },
  { label: "Green 05", cssVar: "--primitive-green-05", hex: "#5ADDB6", rgb: "90 / 221 / 182" },
  { label: "Green 06", cssVar: "--primitive-green-06", hex: "#41D9AC", rgb: "65 / 217 / 172" },
  { label: "Green 07", cssVar: "--primitive-green-07", hex: "#06D6A0", rgb: "6 / 214 / 160" },
  { label: "Green 08", cssVar: "--primitive-green-08", hex: "#05A67C", rgb: "5 / 166 / 124" },
  { label: "Green 09", cssVar: "--primitive-green-09", hex: "#03765A", rgb: "3 / 118 / 90" },
  { label: "Green 10", cssVar: "--primitive-green-10", hex: "#024336", rgb: "2 / 67 / 54" },
  { label: "Green 11", cssVar: "--primitive-green-11", hex: "#01342A", rgb: "1 / 52 / 42" },
];

/* --- Teal Scale (00–11) --- */
const tealColours: PrimitiveSwatch[] = [
  { label: "Teal 00", cssVar: "--primitive-teal-00", hex: "#F7FBFD", rgb: "247 / 251 / 253" },
  { label: "Teal 01", cssVar: "--primitive-teal-01", hex: "#ECF7FB", rgb: "236 / 247 / 251" },
  { label: "Teal 02", cssVar: "--primitive-teal-02", hex: "#CFEAF3", rgb: "207 / 234 / 243" },
  { label: "Teal 03", cssVar: "--primitive-teal-03", hex: "#9ED4E5", rgb: "158 / 212 / 229" },
  { label: "Teal 04", cssVar: "--primitive-teal-04", hex: "#6DBCD6", rgb: "109 / 188 / 214" },
  { label: "Teal 05", cssVar: "--primitive-teal-05", hex: "#3CA5C6", rgb: "60 / 165 / 198" },
  { label: "Teal 06", cssVar: "--primitive-teal-06", hex: "#2C9AB9", rgb: "44 / 154 / 185" },
  { label: "Teal 07", cssVar: "--primitive-teal-07", hex: "#118AB2", rgb: "17 / 138 / 178" },
  { label: "Teal 08", cssVar: "--primitive-teal-08", hex: "#0E6E8F", rgb: "14 / 110 / 143" },
  { label: "Teal 09", cssVar: "--primitive-teal-09", hex: "#0A4E66", rgb: "10 / 78 / 102" },
  { label: "Teal 10", cssVar: "--primitive-teal-10", hex: "#052F3E", rgb: "5 / 47 / 62" },
  { label: "Teal 11", cssVar: "--primitive-teal-11", hex: "#032430", rgb: "3 / 36 / 48" },
];

/* --- Blue Scale (00–11) --- */
const blueColours: PrimitiveSwatch[] = [
  { label: "Blue 00", cssVar: "--primitive-blue-00", hex: "#F8FAFE", rgb: "248 / 250 / 254" },
  { label: "Blue 01", cssVar: "--primitive-blue-01", hex: "#EEF3FD", rgb: "238 / 243 / 253" },
  { label: "Blue 02", cssVar: "--primitive-blue-02", hex: "#D3DDF8", rgb: "211 / 221 / 248" },
  { label: "Blue 03", cssVar: "--primitive-blue-03", hex: "#AABCEF", rgb: "170 / 188 / 239" },
  { label: "Blue 04", cssVar: "--primitive-blue-04", hex: "#7F99E3", rgb: "127 / 153 / 227" },
  { label: "Blue 05", cssVar: "--primitive-blue-05", hex: "#5475D4", rgb: "84 / 117 / 212" },
  { label: "Blue 06", cssVar: "--primitive-blue-06", hex: "#345AC4", rgb: "52 / 90 / 196" },
  { label: "Blue 07", cssVar: "--primitive-blue-07", hex: "#1E47B0", rgb: "30 / 71 / 176" },
  { label: "Blue 08", cssVar: "--primitive-blue-08", hex: "#163789", rgb: "22 / 55 / 137" },
  { label: "Blue 09", cssVar: "--primitive-blue-09", hex: "#0F265E", rgb: "15 / 38 / 94" },
  { label: "Blue 10", cssVar: "--primitive-blue-10", hex: "#081633", rgb: "8 / 22 / 51" },
  { label: "Blue 11", cssVar: "--primitive-blue-11", hex: "#050F27", rgb: "5 / 15 / 39" },
];

/* --- Purple Scale (00–11) --- */
const purpleColours: PrimitiveSwatch[] = [
  { label: "Purple 00", cssVar: "--primitive-purple-00", hex: "#FBF8FF", rgb: "251 / 248 / 255" },
  { label: "Purple 01", cssVar: "--primitive-purple-01", hex: "#F7F0FE", rgb: "247 / 240 / 254" },
  { label: "Purple 02", cssVar: "--primitive-purple-02", hex: "#E6D2FB", rgb: "230 / 210 / 251" },
  { label: "Purple 03", cssVar: "--primitive-purple-03", hex: "#CFABF7", rgb: "207 / 171 / 247" },
  { label: "Purple 04", cssVar: "--primitive-purple-04", hex: "#B785F0", rgb: "183 / 133 / 240" },
  { label: "Purple 05", cssVar: "--primitive-purple-05", hex: "#A86AE8", rgb: "168 / 106 / 232" },
  { label: "Purple 06", cssVar: "--primitive-purple-06", hex: "#9754DC", rgb: "151 / 84 / 220" },
  { label: "Purple 07", cssVar: "--primitive-purple-07", hex: "#9E47EF", rgb: "158 / 71 / 239" },
  { label: "Purple 08", cssVar: "--primitive-purple-08", hex: "#7434B3", rgb: "116 / 52 / 179" },
  { label: "Purple 09", cssVar: "--primitive-purple-09", hex: "#52247D", rgb: "82 / 36 / 125" },
  { label: "Purple 10", cssVar: "--primitive-purple-10", hex: "#31164A", rgb: "49 / 22 / 74" },
  { label: "Purple 11", cssVar: "--primitive-purple-11", hex: "#260F3A", rgb: "38 / 15 / 58" },
];

/* --- Neutral alpha: the translucent neutrals, named on the -aNN grammar
   (NN = alpha × 100, so -a80 is the step at 80% opacity). The compact
   label is the neutral step plus its alpha, since that is the only thing
   that separates two tokens built on the same step. */
const neutralAlphaColours: PrimitiveSwatch[] = [
  { label: "Neutral 00 a01", short: "00 · 1%", cssVar: "--primitive-neutral-00-a01", hex: "rgba(255,255,255,0.01)", rgb: "255 / 255 / 255" },
  { label: "Neutral 00 a60", short: "00 · 60%", cssVar: "--primitive-neutral-00-a60", hex: "rgba(255,255,255,0.6)", rgb: "255 / 255 / 255" },
  { label: "Neutral 00 a90", short: "00 · 90%", cssVar: "--primitive-neutral-00-a90", hex: "rgba(255,255,255,0.9)", rgb: "255 / 255 / 255" },
  { label: "Neutral 01 a01", short: "01 · 1%", cssVar: "--primitive-neutral-01-a01", hex: "rgba(241,241,241,0.01)", rgb: "241 / 241 / 241" },
  { label: "Neutral 01 a60", short: "01 · 60%", cssVar: "--primitive-neutral-01-a60", hex: "rgba(241,241,241,0.6)", rgb: "241 / 241 / 241" },
  { label: "Neutral 01 a82", short: "01 · 82%", cssVar: "--primitive-neutral-01-a82", hex: "rgba(241,241,241,0.82)", rgb: "241 / 241 / 241" },
  { label: "Neutral 09 a66", short: "09 · 66%", cssVar: "--primitive-neutral-09-a66", hex: "rgba(14,14,14,0.66)", rgb: "14 / 14 / 14" },
  { label: "Neutral 02 a80", short: "02 · 80%", cssVar: "--primitive-neutral-02-a80", hex: "rgba(214,214,214,0.8)", rgb: "214 / 214 / 214" },
  { label: "Neutral 03 a80", short: "03 · 80%", cssVar: "--primitive-neutral-03-a80", hex: "rgba(188,188,188,0.8)", rgb: "188 / 188 / 188" },
  { label: "Neutral 07 a80", short: "07 · 80%", cssVar: "--primitive-neutral-07-a80", hex: "rgba(48,48,48,0.8)", rgb: "48 / 48 / 48" },
  { label: "Neutral 08 a80", short: "08 · 80%", cssVar: "--primitive-neutral-08-a80", hex: "rgba(35,35,35,0.8)", rgb: "35 / 35 / 35" },
  { label: "Neutral 09 a01", short: "09 · 1%", cssVar: "--primitive-neutral-09-a01", hex: "rgba(14,14,14,0.01)", rgb: "14 / 14 / 14" },
  { label: "Neutral 09 a80", short: "09 · 80%", cssVar: "--primitive-neutral-09-a80", hex: "rgba(14,14,14,0.8)", rgb: "14 / 14 / 14" },
  { label: "Neutral 09 a60", short: "09 · 60%", cssVar: "--primitive-neutral-09-a60", hex: "rgba(14,14,14,0.6)", rgb: "14 / 14 / 14" },
  { label: "Neutral 10 a60", short: "10 · 60%", cssVar: "--primitive-neutral-10-a60", hex: "rgba(5,5,5,0.6)", rgb: "5 / 5 / 5" },
  { label: "Neutral 10 a01", short: "10 · 1%", cssVar: "--primitive-neutral-10-a01", hex: "rgba(5,5,5,0.01)", rgb: "5 / 5 / 5" },
];

const trueBlackColours: PrimitiveSwatch[] = [
  { label: "True Black", short: "Solid", cssVar: "--primitive-true-black", hex: "#000000", rgb: "0 / 0 / 0" },
  { label: "True Black Semi", short: "50%", cssVar: "--primitive-true-black-semi", hex: "rgba(0,0,0,0.5)", rgb: "0 / 0 / 0" },
  { label: "True Black Strong", short: "70%", cssVar: "--primitive-true-black-strong", hex: "rgba(0,0,0,0.7)", rgb: "0 / 0 / 0" },
];

/* The stepped ramps, in display order. Every one of them runs the full
   00–11 column grid in the ramp view — the neutral scale and the seven
   chromatic ramps share the same twelve steps. */
const STEP_COLUMNS = ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11"];

const steppedRamps = [
  { title: "Neutral", swatches: neutralColours },
  { title: "Red", swatches: redColours },
  { title: "Orange", swatches: orangeColours },
  { title: "Yellow", swatches: yellowColours },
  { title: "Green", swatches: greenColours },
  { title: "Teal", swatches: tealColours },
  { title: "Blue", swatches: blueColours },
  { title: "Purple", swatches: purpleColours },
];

/* Ramps with no step numbering. They are alpha values, so the ramp view
   shows them over a light/dark split to make the transparency readable. */
const alphaRamps = [
  { title: "Neutral alpha", swatches: neutralAlphaColours },
  { title: "True black", swatches: trueBlackColours },
];

/* Every ramp in display order, for the swatch view */
const colourRamps = [...steppedRamps, ...alphaRamps];

/** The step number a stepped ramp's token ends in, e.g. "--primitive-red-07" → "07". */
const stepOf = (cssVar: string) => cssVar.slice(-2);

/** Tooltip body for a swatch: name, token, then the value both ways. */
const swatchTip = (s: PrimitiveSwatch) =>
  `${s.label}\n${s.cssVar}\n${s.hex} · ${s.rgb}`;

/* Tooltips centre on their cell, which would push them off the page at either
   end of a row, so the outermost columns anchor to an edge instead. */
const tipAlignment = (column: number, columns: number) => {
  if (column <= 2) return ` ${styles.rampTipStart}`;
  if (column >= columns - 1) return ` ${styles.rampTipEnd}`;
  return "";
};

/** Columns in the ramp grid, and in the alpha grid below it. */
const RAMP_COLUMNS = 12;
const ALPHA_COLUMNS = 6;

/* ============================================
   THEME HOOK
   ============================================ */

function subscribeToTheme(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}

function getTheme(): "dark" | "light" {
  return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
}

function useTheme() {
  return useSyncExternalStore<"dark" | "light">(subscribeToTheme, getTheme, () => "dark");
}

/* ============================================
   PAGE
   ============================================ */

export default function PrimitiveColoursPage() {
  const theme = useTheme();
  const [view, setView] = useState<"ramps" | "swatches">("ramps");

  return (
    <>

      <MegaNav />

      <div className={styles.dsLayout}>
        <Sidebar links={sidebarLinks} />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          {/* Page Title */}
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Primitive colours</h1>
            <PageLinks
              figmaUrl={`${FIGMA_FILE_URL}?node-id=155-6434`}
              storybookPath="/?path=/docs/foundations-tokens--docs"
            />
          </div>

          {/* Intro */}
          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              Colour ramps: the raw layer every theme re-points
            </p>
            <p className={styles.introBody}>
              These raw values never get used directly in components. Instead, they feed into the semantic layer where each value gets assigned a role like &quot;page background&quot; or &quot;primary text&quot;. Keeping them separate means the palette can evolve without touching any component styles, and it is what makes re-theming cheap: the shipped theme presets rebase these ramps, and overriding a primitive cascades through everything built on it.
            </p>
          </div>

          {/* View switch */}
          <div className={`${styles.viewSwitch} animate-in animate-delay-2`}>
            <Tabs
              tabs={[
                { value: "ramps", label: "Ramps", icon: "view_week" },
                { value: "swatches", label: "Swatches", icon: "grid_view" },
              ]}
              activeTab={view}
              onTabChange={(v) => setView(v as "ramps" | "swatches")}
              ariaLabel="Primitive colour view"
            />
          </div>

          {view === "ramps" ? (
            <div role="tabpanel" aria-label="Ramps" className={styles.rampView}>
              {/* Stepped ramps on a shared column grid */}
              <div className={styles.rampTable}>
                <div className={styles.rampHeaderRow} aria-hidden="true">
                  <span className={styles.rampLabel} />
                  <div className={styles.rampCells}>
                    {STEP_COLUMNS.map((step) => (
                      <span key={step} className={styles.rampStep}>
                        {step}
                      </span>
                    ))}
                  </div>
                </div>

                {steppedRamps.map((ramp) => {
                  /* Every stepped ramp runs the full 00–11 grid; the offset
                     guard stays so a ramp that starts later still lands in
                     the column its step number names. */
                  const offset = STEP_COLUMNS.indexOf(stepOf(ramp.swatches[0].cssVar));
                  return (
                    <div className={styles.rampRow} key={ramp.title}>
                      <span className={styles.rampLabel}>{ramp.title}</span>
                      <div className={styles.rampCells}>
                        {offset > 0 && <span className={styles.rampSpacer} aria-hidden="true" />}
                        {ramp.swatches.map((s, i) => {
                          const isKey = stepOf(s.cssVar) === "07" && ramp.title !== "Neutral";
                          return (
                            <Tooltip
                              key={s.cssVar}
                              content={swatchTip(s)}
                              className={`${styles.rampTip}${tipAlignment(offset + i + 1, RAMP_COLUMNS)}`}
                            >
                              <span
                                className={`${styles.rampCell}${isKey ? ` ${styles.rampCellKey}` : ""}`}
                                style={{ background: `var(${s.cssVar})` }}
                                role="img"
                                aria-label={`${s.label}, ${s.hex}`}
                              />
                            </Tooltip>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              <p className={styles.rampNote}>
                Step 07 is each chromatic ramp&apos;s key colour, outlined above. It is the
                value the ramp is built around, and the one the playground rebases when you
                re-theme. Hover any step for its token name and value.
              </p>

              {/* Alpha ramps: no step numbering, shown over a light/dark split */}
              {alphaRamps.map((ramp) => (
                <div className={styles.alphaGroup} key={ramp.title}>
                  <span className={styles.rampLabel}>{ramp.title}</span>
                  <div className={styles.alphaCells}>
                    {ramp.swatches.map((s, i) => (
                      <div className={styles.alphaCell} key={s.cssVar}>
                        <Tooltip
                          content={swatchTip(s)}
                          className={`${styles.rampTip}${tipAlignment(
                            (i % ALPHA_COLUMNS) + 1,
                            ALPHA_COLUMNS
                          )}`}
                        >
                          <span
                            className={styles.alphaSwatch}
                            role="img"
                            aria-label={`${s.label}, ${s.hex}`}
                          >
                            <span
                              className={styles.alphaChip}
                              style={{ background: `var(${s.cssVar})` }}
                            />
                          </span>
                        </Tooltip>
                        <span className={styles.alphaLabel}>{s.short}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <p className={styles.rampNote}>
                These carry an alpha channel, so each one sits over a light and dark half to
                show what it does to whatever is behind it.
              </p>
            </div>
          ) : (
            <div role="tabpanel" aria-label="Swatches" className={styles.swatchView}>
              {colourRamps.map((ramp) => (
                <section key={ramp.title} className={styles.colourGroup}>
                  <SectionTitle title={ramp.title} />
                  <div className={styles.colourSwatches}>
                    {ramp.swatches.map((s) => (
                      <ColourSwatch
                        key={s.cssVar}
                        label={s.label}
                        cssVar={s.cssVar}
                        dark={{ hex: s.hex, rgb: s.rgb }}
                        theme={theme}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </main>
      </div>

    </>
  );
}
