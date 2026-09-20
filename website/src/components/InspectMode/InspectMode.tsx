"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { tokenRegistry } from "@robr0/design-system/tokens/registry";
import { MOTION_SCROLL_SETTLE_MS } from "@robr0/design-system/tokens/motion";
import { ToggleSwitch } from "@robr0/design-system/components/ToggleSwitch/ToggleSwitch";
import { componentMetadata } from "@robr0/design-system/components/registry";
import {
  collectDeclaredTokens,
  primitiveOf,
  type DeclaredTokens,
} from "@/lib/token-source";
import styles from "./InspectMode.module.css";

/**
 * INSPECT MODE — turns the live page into its own spec, on the immersive
 * surfaces that carry a StageToolbar (the playground and the canvas board).
 * Switched on, it redlines every landmark section, and hovering any element
 * reverse-maps its computed styles onto the token layer: the popover names
 * the design-system component (or the local class), then lists which
 * semantic token each colour, radius, spacing and type value resolves from.
 *
 * Nothing here is annotated by hand. The token names come from the generated
 * token registry, their live values are read off the document at activation
 * (so the mapping follows the theme toggle and the playground's levers), and
 * component names come from the component registry via the `ds-*` class
 * convention. If a hovered value maps to no token, the popover says so —
 * inspect mode doubles as a live token audit. Each matched token also shows
 * the primitive it chains to (via the declared `var()` references in the
 * CSSOM — see lib/token-source), so a hover walks the full tier chain:
 * computed value, semantic token, primitive.
 *
 * The control is the system's ToggleSwitch, rendered in place for a
 * StageToolbar actions slot; only the inspection layers portal into <body>.
 * Click pins the popover so its token names can be selected and copied;
 * Escape unpins, then exits.
 */

/* One matched style property: the resolved value, the semantic tokens
   whose current value equals it (empty = off-token), and the primitive the
   lead token's declared var() chain lands on. */
type TokenRow = {
  property: string;
  value: string;
  tokens: string[];
  primitive?: string | null;
  swatch?: string;
};

type Inspection = {
  el: Element;
  name: string;
  kind: "component" | "element";
  tag: string;
  rows: TokenRow[];
};

type SectionInfo = { el: Element; label: string };

/* Live value → token-name lookup tables, rebuilt whenever the theme flips.
   Colours and shadows are normalised through a probe element so an authored
   hex and a computed rgb() compare equal; lengths compare as raw px strings. */
type TokenMaps = {
  color: Map<string, string[]>;
  length: Map<string, string[]>;
  fontSize: Map<string, string[]>;
  shadow: Map<string, string[]>;
  duration: Map<string, string[]>;
  /* Semantic token name → the primitive its declared var() chain resolves
     to, for every registry token whose value is a reference (colour and
     radius chain by build-enforced invariant; a literal-valued token is
     simply absent). */
  primitive: Map<string, string>;
};

function addTo(map: Map<string, string[]>, key: string, name: string) {
  const list = map.get(key);
  if (list) list.push(name);
  else map.set(key, [name]);
}

function toMs(value: string): string | null {
  const match = /^([\d.]+)(m?s)$/.exec(value.trim());
  if (!match) return null;
  const ms = parseFloat(match[1]) * (match[2] === "s" ? 1000 : 1);
  return `${Math.round(ms)}ms`;
}

function buildTokenMaps(): TokenMaps {
  const rootStyle = getComputedStyle(document.documentElement);
  const probe = document.createElement("span");
  probe.style.position = "fixed";
  probe.style.visibility = "hidden";
  document.body.appendChild(probe);

  const maps: TokenMaps = {
    color: new Map(),
    length: new Map(),
    fontSize: new Map(),
    shadow: new Map(),
    duration: new Map(),
    primitive: new Map(),
  };

  /* The declared var() references, per scope — collected alongside the
     computed values so both follow the same theme flip or lever change. */
  const declared: DeclaredTokens = collectDeclaredTokens();
  for (const names of Object.values(tokenRegistry)) {
    for (const name of names) {
      const target = primitiveOf(name, declared);
      if (target) maps.primitive.set(name, target);
    }
  }

  for (const name of tokenRegistry.colour) {
    const raw = rootStyle.getPropertyValue(name).trim();
    if (!raw) continue;
    probe.style.color = "";
    probe.style.color = raw;
    if (!probe.style.color) continue;
    addTo(maps.color, getComputedStyle(probe).color, name);
  }

  for (const category of ["radius", "spacing", "border", "icons"] as const) {
    for (const name of tokenRegistry[category]) {
      const raw = rootStyle.getPropertyValue(name).trim();
      if (/^[\d.]+px$/.test(raw)) addTo(maps.length, raw, name);
    }
  }

  for (const name of tokenRegistry.typography) {
    if (!name.endsWith("-size")) continue;
    const raw = rootStyle.getPropertyValue(name).trim();
    if (/^[\d.]+px$/.test(raw)) addTo(maps.fontSize, raw, name);
  }

  for (const name of tokenRegistry.shadow) {
    const raw = rootStyle.getPropertyValue(name).trim();
    if (!raw) continue;
    probe.style.boxShadow = "";
    probe.style.boxShadow = raw;
    if (!probe.style.boxShadow) continue;
    addTo(maps.shadow, getComputedStyle(probe).boxShadow, name);
  }

  for (const name of tokenRegistry.motion) {
    if (!name.startsWith("--motion-duration-")) continue;
    const ms = toMs(rootStyle.getPropertyValue(name).trim());
    if (ms) addTo(maps.duration, ms, name);
  }

  probe.remove();
  return maps;
}

const componentLabelBySlug = new Map(
  componentMetadata.map((meta) => [meta.slug, meta.label]),
);

function hasOwnText(el: Element): boolean {
  return Array.from(el.childNodes).some(
    (node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim(),
  );
}

/* The nearest ancestor carrying a `ds-<slug>` base class names the
   design-system component; otherwise the hovered element's CSS-module class
   yields its local name; otherwise the tag. */
function resolveName(el: Element): Pick<Inspection, "name" | "kind"> {
  for (let node: Element | null = el; node && node !== document.body; node = node.parentElement) {
    for (const cls of node.classList) {
      const match = /^ds-([a-z0-9]+(?:-[a-z0-9]+)*)$/.exec(cls);
      if (match && componentLabelBySlug.has(match[1])) {
        return { name: componentLabelBySlug.get(match[1])!, kind: "component" };
      }
    }
  }
  for (const cls of el.classList) {
    /* Turbopack dev: `page-module__hash__local`; webpack prod:
       `page_local__hash`. Either way the CSS-module local name is the
       readable handle the source uses. */
    const turbopack = /-module__[\w-]+__([a-zA-Z][a-zA-Z0-9]*)$/.exec(cls);
    if (turbopack) return { name: turbopack[1], kind: "element" };
    const webpack = /^[\w-]*?_([a-zA-Z][a-zA-Z0-9]*)__[\w-]+$/.exec(cls);
    if (webpack) return { name: webpack[1], kind: "element" };
  }
  return { name: el.tagName.toLowerCase(), kind: "element" };
}

function inspectElement(el: Element, maps: TokenMaps): Inspection {
  const cs = getComputedStyle(el);
  const rows: TokenRow[] = [];
  const textual = hasOwnText(el);

  /* A colour value usually satisfies several tokens (they share primitives);
     lead with the ones whose role matches the property being read. */
  const pushColor = (property: string, value: string, family: string) => {
    if (!value || value === "transparent" || value === "rgba(0, 0, 0, 0)") return;
    const rank = (name: string) =>
      name.startsWith(`--color-${family}`) ? 0 : name.includes(family) ? 1 : 2;
    const tokens = [...(maps.color.get(value) ?? [])].sort((a, b) => rank(a) - rank(b));
    rows.push({
      property,
      value,
      tokens,
      primitive: tokens.length ? maps.primitive.get(tokens[0]) : null,
      swatch: value,
    });
  };

  /* A length can legitimately match across families (a gap set from a padding
     token); prefer same-family names, fall back to whatever matched. */
  const pushLength = (property: string, value: string, prefix: string) => {
    const all = maps.length.get(value) ?? [];
    const family = all.filter((name) => name.startsWith(prefix));
    const tokens = family.length ? family : all;
    rows.push({
      property,
      value,
      tokens,
      primitive: tokens.length ? maps.primitive.get(tokens[0]) : null,
    });
  };

  pushColor("background", cs.backgroundColor, "bg");
  if (textual) pushColor("text", cs.color, "text");

  if (parseFloat(cs.borderTopWidth) > 0 && cs.borderTopStyle !== "none") {
    pushColor("border", cs.borderTopColor, "border");
    pushLength("border width", cs.borderTopWidth, "--border");
  }

  if (cs.borderTopLeftRadius !== "0px") {
    pushLength("radius", cs.borderTopLeftRadius, "--radius");
  }

  const paddings = new Set(
    [cs.paddingTop, cs.paddingRight, cs.paddingBottom, cs.paddingLeft].filter(
      (v) => v !== "0px",
    ),
  );
  for (const value of paddings) pushLength("padding", value, "--padding");

  if (cs.display.includes("flex") || cs.display.includes("grid")) {
    const gaps = new Set(
      [cs.rowGap, cs.columnGap].filter((v) => v && v !== "normal" && v !== "0px"),
    );
    for (const value of gaps) pushLength("gap", value, "--gap");
  }

  if (textual) {
    rows.push({
      property: "font",
      value: `${cs.fontSize} / ${cs.fontWeight}`,
      tokens: maps.fontSize.get(cs.fontSize) ?? [],
    });
  }

  if (cs.boxShadow && cs.boxShadow !== "none") {
    rows.push({
      property: "shadow",
      value: cs.boxShadow,
      tokens: maps.shadow.get(cs.boxShadow) ?? [],
    });
  }

  const duration = toMs(cs.transitionDuration.split(",")[0]);
  if (duration && duration !== "0ms") {
    rows.push({
      property: "transition",
      value: duration,
      tokens: maps.duration.get(duration) ?? [],
    });
  }

  return { el, rows, tag: el.tagName.toLowerCase(), ...resolveName(el) };
}

function sectionLabel(el: Element): string {
  const aria = el.getAttribute("aria-label");
  if (aria) return aria;
  const labelledBy = el.getAttribute("aria-labelledby");
  if (labelledBy) {
    const heading = document.getElementById(labelledBy);
    if (heading?.textContent) return heading.textContent.trim();
  }
  const heading = el.querySelector("h1, h2, h3");
  return heading?.textContent?.trim() ?? "Section";
}

function formatDims(rect: DOMRect): string {
  return `${Math.round(rect.width)} × ${Math.round(rect.height)}`;
}

type InspectModeProps = {
  /** Hide the switch below the desktop breakpoint — for pages whose
      compact layout has no room for it, and because inspection is a hover
      interaction to begin with. */
  desktopOnly?: boolean;
};

export default function InspectMode({ desktopOnly = false }: InspectModeProps) {
  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [sections, setSections] = useState<SectionInfo[]>([]);
  /* Bumped on scroll/resize so every fixed-position box re-reads its
     element's live rect; the elements themselves are stable. */
  const [, setTick] = useState(0);

  const mapsRef = useRef<TokenMaps | null>(null);
  const pinnedRef = useRef(false);

  useEffect(() => {
    pinnedRef.current = pinned;
  }, [pinned]);

  /* Portal target exists only client-side; render nothing until mounted —
     same pattern (and lint carve-out) as the background's URL read. */
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const deactivate = useCallback(() => {
    setActive(false);
    setPinned(false);
    setInspection(null);
  }, []);

  /* The section list is a DOM read, so it happens in the click handler
     rather than the activation effect. */
  const activate = useCallback(() => {
    setSections(
      Array.from(document.querySelectorAll("main section")).map((el) => ({
        el,
        label: sectionLabel(el),
      })),
    );
    setActive(true);
  }, []);

  useEffect(() => {
    if (!active) return;

    mapsRef.current = buildTokenMaps();

    const previousCursor = document.body.style.cursor;
    document.body.style.cursor = "crosshair";

    /* The token maps hold the current values; rebuild when the toggle
       flips data-theme, and on root style mutations — the playground's
       levers re-theme by writing overrides onto the root element's style
       attribute. The rebuild waits for the settle constant: colour
       transitions are still easing when the change lands, and an immediate
       read reports every mid-transition colour as off-token. */
    let settleTimer = 0;
    const themeObserver = new MutationObserver(() => {
      window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(() => {
        mapsRef.current = buildTokenMaps();
        setInspection((current) =>
          current && mapsRef.current
            ? inspectElement(current.el, mapsRef.current)
            : current,
        );
      }, MOTION_SCROLL_SETTLE_MS);
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme", "style"],
    });

    let frame = 0;
    const onMove = (event: MouseEvent) => {
      if (pinnedRef.current) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest("[data-inspect-mode-ui]")) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (mapsRef.current) setInspection(inspectElement(target, mapsRef.current));
      });
    };

    /* Capture-phase, so a click pins the popover instead of following the
       link underneath; the inspector's own chrome stays clickable. */
    const onClick = (event: MouseEvent) => {
      if (event.target instanceof Element && event.target.closest("[data-inspect-mode-ui]")) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      setPinned((current) => !current);
    };

    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (pinnedRef.current) setPinned(false);
      else deactivate();
    };

    const onReflow = () => setTick((t) => t + 1);

    window.addEventListener("mousemove", onMove, true);
    document.addEventListener("click", onClick, true);
    window.addEventListener("keydown", onKey);
    /* Capture-phase: scroll events do not bubble, and capture sees a scroll
       on any inner container as well as the window. */
    window.addEventListener("scroll", onReflow, { passive: true, capture: true });
    window.addEventListener("resize", onReflow);

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(settleTimer);
      themeObserver.disconnect();
      document.body.style.cursor = previousCursor;
      window.removeEventListener("mousemove", onMove, true);
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onReflow, { capture: true });
      window.removeEventListener("resize", onReflow);
    };
  }, [active, deactivate]);

  const hoverRect = inspection?.el.isConnected
    ? inspection.el.getBoundingClientRect()
    : null;

  /* The popover sits beside the hovered box, flipping to the left edge when
     the right side runs out of room, clamped to the viewport vertically. */
  let popoverStyle: React.CSSProperties | undefined;
  if (hoverRect) {
    const width = 320;
    const margin = 12;
    const left =
      hoverRect.right + margin + width <= window.innerWidth - margin
        ? hoverRect.right + margin
        : Math.max(margin, hoverRect.left - margin - width);
    const top = Math.min(
      Math.max(margin, hoverRect.top),
      Math.max(margin, window.innerHeight - margin - 300),
    );
    popoverStyle = { left, top };
  }

  /* The inspection layers, portalled to <body> whichever control hosts
     them — fixed positioning must not inherit a page stacking context. */
  const layers = (
    <div data-inspect-mode-ui>
      {active &&
        sections.map(({ el, label }, index) => {
          if (!el.isConnected) return null;
          const rect = el.getBoundingClientRect();
          if (rect.bottom < 0 || rect.top > window.innerHeight) return null;
          return (
            <div
              key={index}
              className={styles.sectionBox}
              style={{ left: rect.left, top: rect.top, width: rect.width, height: rect.height }}
            >
              <span
                className={`${styles.sectionLabel} ${rect.top < 24 ? styles.sectionLabelInside : ""}`}
              >
                {label}
                <span className={styles.sectionDims}>{formatDims(rect)}</span>
              </span>
            </div>
          );
        })}

      {active && hoverRect && (
        <div
          className={styles.hoverBox}
          style={{
            left: hoverRect.left,
            top: hoverRect.top,
            width: hoverRect.width,
            height: hoverRect.height,
          }}
        >
          <span className={styles.hoverDims}>{formatDims(hoverRect)}</span>
        </div>
      )}

      {active && inspection && popoverStyle && (
        <div
          className={`${styles.popover} ${pinned ? styles.popoverPinned : ""}`}
          style={popoverStyle}
          role="status"
        >
          <div className={styles.popoverHead}>
            <span className={styles.popoverName}>{inspection.name}</span>
            <span
              className={`${styles.popoverKind} ${
                inspection.kind === "component" ? styles.popoverKindComponent : ""
              }`}
            >
              {inspection.kind}
            </span>
          </div>
          <p className={styles.popoverTag}>
            {`<${inspection.tag}>`} {formatDims(hoverRect!)}px
          </p>
          <div className={styles.rowList}>
            {inspection.rows.map((row, index) => (
              <div key={`${row.property}-${index}`} className={styles.row}>
                <span className={styles.rowProp}>
                  {row.swatch && (
                    <span className={styles.swatch} style={{ background: row.swatch }} />
                  )}
                  {row.property}
                </span>
                <span className={styles.rowTokens}>
                  {row.tokens.length ? (
                    row.tokens.slice(0, 3).join(", ")
                  ) : (
                    <span className={styles.rowOffToken}>no token</span>
                  )}
                  {row.primitive && (
                    <span className={styles.rowPrimitive}>
                      {"↳"} {row.primitive}
                    </span>
                  )}
                  <span className={styles.rowValue}>{row.value}</span>
                </span>
              </div>
            ))}
          </div>
          <p className={styles.popoverHint}>
            {pinned ? "Pinned. Click to release." : "Click to pin"}
          </p>
        </div>
      )}
    </div>
  );

  /* The switch renders in place (a StageToolbar actions slot); only the
     layers portal. */
  return (
    <>
      <span
        data-inspect-mode-ui
        className={`${styles.switchHost} ${desktopOnly ? styles.desktopOnly : ""}`}
      >
        <ToggleSwitch
          checked={active}
          label="Inspect mode"
          showLabel
          onCheckedChange={(next) => (next ? activate() : deactivate())}
        />
      </span>
      {mounted && createPortal(layers, document.body)}
    </>
  );
}
