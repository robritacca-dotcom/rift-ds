"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Alert } from "rift-ds/components/Alert/Alert";
import { Avatar } from "rift-ds/components/Avatar/Avatar";
import { Badge } from "rift-ds/components/Badge/Badge";
import { Button } from "rift-ds/components/Button/Button";
import { Checkbox } from "rift-ds/components/Checkbox/Checkbox";
import { Chip } from "rift-ds/components/Chip/Chip";
import { CircularButton } from "rift-ds/components/CircularButton/CircularButton";
import { CodeBlock } from "rift-ds/components/CodeBlock/CodeBlock";
import { Input } from "rift-ds/components/Input/Input";
import { ProgressBar } from "rift-ds/components/ProgressBar/ProgressBar";
import { RadioButton } from "rift-ds/components/RadioButton/RadioButton";
import { SegmentedControl } from "rift-ds/components/SegmentedControl/SegmentedControl";
import { Slider } from "rift-ds/components/Slider/Slider";
import { Tabs } from "rift-ds/components/Tabs/Tabs";
import { Textarea } from "rift-ds/components/Textarea/Textarea";
import { ToggleSwitch } from "rift-ds/components/ToggleSwitch/ToggleSwitch";
import Sidebar from "@/components/Sidebar/Sidebar";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import { getSidebarLinks, foundationsSidebarLinks } from "@/config/navigation";
import { installScopedThemes, THEME_SCOPE_ATTRIBUTE } from "@/lib/theme/scoped-theme";
import { useSiteTheme } from "@/lib/theme/use-theme-overrides";
import styles from "./specimen.module.css";

/* ---------- what the specimen draws ----------
   Token names only. Every value printed beside a swatch or a type row is
   read back from the rendered element, so the captions are whatever the
   theme resolves to in the current mode and can never disagree with it. */

const COLOURS: ReadonlyArray<[label: string, token: string]> = [
  ["Action", "--color-action-primary-bg"],
  ["Action hover", "--color-action-primary-bg-hover"],
  ["Action pressed", "--color-action-primary-bg-active"],
  ["On action", "--color-action-primary-text"],
  ["Page", "--color-bg-page-primary"],
  ["Surface", "--color-bg-container-primary"],
  ["Soft surface", "--color-bg-container-secondary"],
  ["Deep surface", "--color-bg-container-tertiary"],
  ["Ink", "--color-text-primary"],
  ["Secondary text", "--color-text-secondary"],
  ["Tertiary text", "--color-text-tertiary"],
  ["Border", "--color-bg-container-border"],
];

const STATUS = ["info", "positive", "warning", "error", "neutral"] as const;
const ACCENTS = ["cobalt", "mint", "gold", "coral", "violet", "amber"];
const SERIES = [1, 2, 3, 4, 5, 6];

const TYPE: ReadonlyArray<[style: string, sample: string]> = [
  ["display-1", "Every pixel, one token."],
  ["display-2", "Shape the system."],
  ["sub-display", "A theme is a set of decisions"],
  ["heading-1", "Ship the whole look"],
  ["heading-2", "Colour, type and shape"],
  ["heading-3", "Surfaces and depth"],
  ["title-body", "A title for a card or a row"],
  ["paragraph", "Body text carries the reading. It sits at one weight and lets the headings do the shouting."],
  ["paragraph-sm", "Smaller body text, for dense rows and secondary detail."],
  ["caption", "Caption text for metadata and timestamps"],
  ["overline", "Overline label"],
];

const RADII = ["--radius-050", "--radius-100", "--radius-200", "--radius-300", "--radius-400", "--radius-600", "--radius-1200", "--radius-pill"];
const GAPS = ["--gap-050", "--gap-100", "--gap-200", "--gap-300", "--gap-400", "--gap-500", "--gap-1000", "--gap-1500", "--gap-2000"];
const ICONS = ["home", "search", "favorite", "bolt", "settings", "palette", "chat", "auto_awesome"];

/* ---------- reading the rendered values ---------- */

/* Button forwards unknown props to its anchor when it has an href, but its
   props type is the button element's, which has no `download`. */
const downloadAs = (name: string): Record<string, string> => ({ download: name });

const { sidebarLinks } = getSidebarLinks(foundationsSidebarLinks, "/foundations/themes");

const toHex = (rgb: string) => {
  const m = /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/.exec(rgb);
  if (!m) return rgb;
  const hex = `#${[m[1], m[2], m[3]].map((n) => Number(n).toString(16).padStart(2, "0")).join("")}`.toUpperCase();
  return m[4] !== undefined && Number(m[4]) < 1 ? `${hex} · ${Math.round(Number(m[4]) * 100)}%` : hex;
};

/** Re-reads `read` from the element after every render that could change
    it: mount, the site's light/dark flip, and a font finishing loading. */
function useComputed<T>(read: (el: HTMLElement) => T, mode: string) {
  const ref = useRef<HTMLElement | null>(null);
  const [value, setValue] = useState<T | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    /* After the scoped sheet lands: the next frame, not this one. */
    const frame = requestAnimationFrame(() => setValue(read(el)));
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);
  return [ref, value] as const;
}

function Swatch({ label, token, mode }: { label: string; token: string; mode: string }) {
  const [ref, value] = useComputed((el) => toHex(getComputedStyle(el).backgroundColor), mode);
  return (
    <figure className={styles.swatch}>
      <span
        ref={ref as React.RefObject<HTMLSpanElement>}
        className={styles.swatchChip}
        style={{ backgroundColor: `var(${token})` }}
      />
      <figcaption className={styles.swatchMeta}>
        <span className={styles.swatchName}>{label}</span>
        <span className={styles.swatchValue}>{value ?? " "}</span>
        <code className={styles.swatchToken}>{token}</code>
      </figcaption>
    </figure>
  );
}

function TypeRow({ style, sample, mode }: { style: string; sample: string; mode: string }) {
  const [ref, spec] = useComputed((el) => {
    const cs = getComputedStyle(el);
    const lh = cs.lineHeight === "normal" ? "normal" : cs.lineHeight;
    const tracking = cs.letterSpacing === "normal" ? "0" : cs.letterSpacing;
    return `${cs.fontSize} / ${cs.fontWeight} / lh ${lh} / tracking ${tracking}`;
  }, mode);
  const v = (prop: string) => `var(--font-${style}-${prop})`;
  return (
    <div className={styles.typeRow}>
      <div className={styles.typeMeta}>
        <span className={styles.typeName}>{style}</span>
        <span className={styles.typeSpec}>{spec ?? " "}</span>
      </div>
      <p
        ref={ref as React.RefObject<HTMLParagraphElement>}
        className={styles.typeSample}
        style={{
          fontFamily: v("family"),
          fontSize: v("size"),
          fontWeight: v("weight"),
          lineHeight: v("line-height"),
          letterSpacing: v("letter-spacing"),
          textTransform: style === "overline" ? "uppercase" : undefined,
        }}
      >
        {sample}
      </p>
    </div>
  );
}

function Measured({ token, mode, children }: { token: string; mode: string; children: (value: string | null, ref: React.Ref<HTMLSpanElement>) => React.ReactNode }) {
  const [ref, value] = useComputed((el) => getComputedStyle(el).getPropertyValue(token).trim(), mode);
  return <>{children(value, ref as React.Ref<HTMLSpanElement>)}</>;
}

function Section({ index, kicker, title, children }: { index: number; kicker: string; title: string; children: React.ReactNode }) {
  return (
    <section className={styles.section}>
      <header className={styles.sectionHeader}>
        <span className={styles.kicker}>
          {String(index).padStart(2, "0")} · {kicker}
        </span>
        <h2 className={styles.sectionTitle}>{title}</h2>
      </header>
      {children}
    </section>
  );
}

function Tile({ name, note, children, wide }: { name: string; note?: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className={`${styles.tile} ${wide ? styles.tileWide : ""}`}>
      <span className={styles.tileName}>{name}</span>
      <div className={styles.tileStage}>{children}</div>
      {note && <span className={styles.tileNote}>{note}</span>}
    </div>
  );
}

/* ---------- the page ---------- */

export interface ThemeSpecimenProps {
  id: string;
  label: string;
  designMd: string;
}

export function ThemeSpecimen({ id, label, designMd }: ThemeSpecimenProps) {
  const mode = useSiteTheme();
  const [view, setView] = useState("preview");
  const [billing, setBilling] = useState("yearly");
  const fileUrl = `/themes/${id}/DESIGN.md`;

  /* The specimen is a theme scope (see scoped-theme.ts): it wears this
     theme whatever theme the site around it is wearing. Before paint, so
     it never shows the site's look first. */
  useLayoutEffect(() => installScopedThemes(), []);

  return (
    <div className={styles.dsLayout}>
      <Sidebar links={sidebarLinks} />

      <main className={styles.dsContent} id="main-content">
        <PageBreadcrumb currentLabel={label} />

        <div className={`${styles.pageHeader} animate-in`}>
          <h1 className={styles.pageTitle}>{label}</h1>
          <div className={styles.headerActions}>
            <Button
              label="Download"
              variant="tertiary"
              size="compact"
              iconLeft="download"
              href={fileUrl}
              {...downloadAs(`${id}-DESIGN.md`)}
            />
            <Button
              label="Playground"
              variant="tertiary"
              size="compact"
              iconRight="arrow_forward"
              href={`/playground?preset=${id}`}
            />
          </div>
        </div>


        {/* The specimen is the card; the view switch sits in its corner. */}
        <div className={`${styles.scope} animate-in animate-delay-1`} {...{ [THEME_SCOPE_ATTRIBUTE]: id }}>
          <div className={styles.viewSwitch}>
            <SegmentedControl
              size="compact"
              segments={[
                { value: "preview", label: "Preview" },
                { value: "file", label: "DESIGN.md" },
              ]}
              value={view}
              onValueChange={setView}
              aria-label="View"
            />
          </div>

      {view === "file" ? (
          <CodeBlock code={designMd} language="markdown" filename="DESIGN.md" showCopy />
      ) : (
        <div className={styles.body}>
          {/* Hero */}
          <div className={styles.hero}>
            <span className={styles.kicker}>Theme · {id}</span>
            <p className={styles.heroTitle}>One set of tokens, restyled end to end.</p>
            <p className={styles.heroLede}>
              Colour, type, shape, surfaces and controls, all drawn live in {label}.
            </p>
          </div>

          {/* 01 Colour */}
          <Section index={1} kicker="Foundations" title="Colour">
            <div className={styles.swatchGrid}>
              {COLOURS.map(([name, token]) => (
                <Swatch key={token} label={name} token={token} mode={mode} />
              ))}
            </div>
            <div className={styles.subhead}>Status</div>
            <div className={`${styles.swatchGrid} ${styles.swatchGrid5}`}>
              {STATUS.map((s) => (
                <Swatch key={s} label={s[0].toUpperCase() + s.slice(1)} token={`--color-status-${s}-icon`} mode={mode} />
              ))}
            </div>
            <div className={styles.subhead}>Accents and chart series</div>
            <div className={`${styles.swatchGrid} ${styles.swatchGrid6}`}>
              {ACCENTS.map((a) => (
                <Swatch key={a} label={a[0].toUpperCase() + a.slice(1)} token={`--color-core-accent-${a}`} mode={mode} />
              ))}
            </div>
            <div className={styles.seriesBars} aria-hidden="true">
              {SERIES.map((n, i) => (
                <span key={n} className={styles.seriesBar} style={{ background: `var(--color-chart-series-${n})`, height: `${92 - i * 12}%` }} />
              ))}
            </div>
          </Section>

          {/* 02 Typography */}
          <Section index={2} kicker="Foundations" title="Typography">
            <div className={styles.typeLadder}>
              {TYPE.map(([style, sample]) => (
                <TypeRow key={style} style={style} sample={sample} mode={mode} />
              ))}
            </div>
          </Section>

          {/* 03 Buttons and badges */}
          <Section index={3} kicker="Components" title="Buttons and badges">
            <div className={styles.tileGrid}>
              <Tile name="primary" note="The one action colour.">
                <Button label="Join for free" variant="primary" />
              </Tile>
              <Tile name="secondary">
                <Button label="See our plans" variant="secondary" />
              </Tile>
              <Tile name="tertiary">
                <Button label="Explore" variant="tertiary" iconRight="arrow_outward" />
              </Tile>
              <Tile name="neutral">
                <Button label="Cancel" variant="primary" tone="neutral" />
              </Tile>
              <Tile name="destructive">
                <Button label="Delete" variant="secondary" tone="destructive" iconLeft="delete" />
              </Tile>
              <Tile name="compact and circular">
                <div className={styles.row}>
                  <Button label="Save" variant="primary" size="compact" />
                  <CircularButton icon="add" variant="primary" ariaLabel="Add" />
                  <CircularButton icon="more_horiz" variant="secondary" ariaLabel="More" />
                </div>
              </Tile>
              <Tile name="badges and chips" wide>
                <div className={styles.row}>
                  {STATUS.map((s) => (
                    <Badge key={s} label={s[0].toUpperCase() + s.slice(1)} variant={s} />
                  ))}
                  <Chip label="Design" />
                  <Chip label="Tokens" tone="neutral" />
                </div>
              </Tile>
            </div>
          </Section>

          {/* 04 Surfaces and depth */}
          <Section index={4} kicker="Foundations" title="Surfaces and depth">
            <div className={styles.surfaceGrid}>
              <div className={styles.surface} style={{ background: "var(--color-bg-container-primary)", border: "var(--border-025) solid var(--color-bg-container-border)" }}>
                <span className={styles.surfaceTitle}>Surface</span>
                <span className={styles.surfaceNote}>The default card.</span>
              </div>
              <div className={styles.surface} style={{ background: "var(--color-bg-container-secondary)" }}>
                <span className={styles.surfaceTitle}>Soft surface</span>
                <span className={styles.surfaceNote}>Emphasis by tint.</span>
              </div>
              <div className={styles.surface} style={{ background: "var(--color-bg-container-primary)", boxShadow: "var(--shadow-floating)" }}>
                <span className={styles.surfaceTitle}>Floating</span>
                <span className={styles.surfaceNote}>Menus and popovers.</span>
              </div>
              <div className={styles.surface} style={{ background: "var(--color-bg-container-primary)", boxShadow: "var(--shadow-modal)" }}>
                <span className={styles.surfaceTitle}>Modal</span>
                <span className={styles.surfaceNote}>Dialogs.</span>
              </div>
              <div className={`${styles.surface} ${styles.surfaceInverse}`}>
                <span className={styles.surfaceTitle}>Inverse</span>
                <span className={styles.surfaceNote}>The polarity flip.</span>
              </div>
            </div>
            <div className={styles.subhead}>Radius</div>
            <div className={styles.radiusRow}>
              {RADII.map((token) => (
                <Measured key={token} token={token} mode={mode}>
                  {(value, ref) => (
                    <div className={styles.radiusCell}>
                      <span ref={ref} className={styles.radiusShape} style={{ borderTopLeftRadius: `var(${token})` }} />
                      <code className={styles.swatchToken}>{token.replace("--radius-", "")}</code>
                      <span className={styles.swatchValue}>{value ?? " "}</span>
                    </div>
                  )}
                </Measured>
              ))}
            </div>
          </Section>

          {/* 05 Forms */}
          <Section index={5} kicker="Components" title="Form elements">
            <div className={styles.tileGrid}>
              <Tile name="input">
                <Input placeholder="Enter email address" aria-label="Email address" />
              </Tile>
              <Tile name="input with icon">
                <Input placeholder="Search" iconLeft="search" aria-label="Search" />
              </Tile>
              <Tile name="textarea">
                <Textarea placeholder="Message" aria-label="Message" />
              </Tile>
              <Tile name="segmented control">
                <SegmentedControl
                  segments={[
                    { value: "yearly", label: "Yearly" },
                    { value: "quarterly", label: "Quarterly" },
                  ]}
                  value={billing}
                  onValueChange={setBilling}
                  aria-label="Billing"
                />
              </Tile>
              <Tile name="selection" wide>
                <div className={styles.row}>
                  <Checkbox label="Checked" defaultChecked />
                  <Checkbox label="Unchecked" />
                  <RadioButton label="Selected" checked value="a" />
                  <ToggleSwitch label="On" defaultChecked showLabel />
                </div>
              </Tile>
              <Tile name="range" wide>
                <div className={styles.stack}>
                  <Slider defaultValue={64} aria-label="Volume" />
                  <ProgressBar value={42} ariaLabel="Progress" />
                </div>
              </Tile>
            </div>
          </Section>

          {/* 06 Signature */}
          <Section index={6} kicker="Components" title="Signature pieces">
            <div className={styles.tileGrid}>
              <Tile name="nav pill" wide>
                <div className={styles.navPill}>
                  <span className={styles.navBrand}>{label}</span>
                  <span className={styles.navLinks}>
                    <span>Pricing</span>
                    <span>Docs</span>
                    <span>Log in</span>
                  </span>
                  <Button label="Join for free" variant="primary" size="compact" />
                </div>
              </Tile>
              <Tile name="alerts" wide>
                <div className={styles.stack}>
                  <Alert variant="positive" title="Theme applied" size="compact" />
                  <Alert variant="warning" title="Two tokens left at their base" size="compact" />
                </div>
              </Tile>
              <Tile name="people">
                <div className={styles.row}>
                  <Avatar name="Ada Lovelace" size="lg" />
                  <Avatar name="Grace Hopper" size="md" status="online" />
                  <Avatar name="Alan Kay" size="sm" />
                </div>
              </Tile>
              <Tile name="icons">
                <div className={styles.row}>
                  {ICONS.map((icon) => (
                    <span key={icon} className={`material-symbols-rounded ${styles.icon}`} aria-hidden="true">
                      {icon}
                    </span>
                  ))}
                </div>
              </Tile>
              <Tile name="tabs" wide>
                <Tabs
                  tabs={[
                    { value: "overview", label: "Overview" },
                    { value: "activity", label: "Activity" },
                    { value: "settings", label: "Settings" },
                  ]}
                  defaultValue="overview"
                  aria-label="Specimen tabs"
                />
              </Tile>
            </div>
          </Section>

          {/* 07 Space */}
          <Section index={7} kicker="Foundations" title="Space">
            <div className={styles.gapLadder}>
              {GAPS.map((token) => (
                <Measured key={token} token={token} mode={mode}>
                  {(value, ref) => (
                    <div className={styles.gapRow}>
                      <code className={styles.swatchToken}>{token}</code>
                      <span ref={ref} className={styles.gapBar} style={{ width: `var(${token})` }} />
                      <span className={styles.swatchValue}>{value ?? " "}</span>
                    </div>
                  )}
                </Measured>
              ))}
            </div>
          </Section>

          {/* The end-stop, carrying the file. */}
          <footer className={styles.endBand}>
            <span className={styles.endTitle}>Take {label} with you</span>
            <div className={styles.row}>
              <Button label="Download DESIGN.md" variant="primary" iconLeft="download" href={fileUrl} {...downloadAs(`${id}-DESIGN.md`)} />
<Button label="Playground" variant="tertiary" iconRight="arrow_forward" href={`/playground?preset=${id}`} />
            </div>
          </footer>
        </div>
      )}
        </div>
      </main>
    </div>
  );
}
