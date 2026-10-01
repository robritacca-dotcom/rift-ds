"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import StageToolbar from "@/components/StageToolbar/StageToolbar";
import { HiddenBackground } from "@/components/BlurBackground/BlurBackground";
import DotBackground from "@/components/DotBackground/DotBackground";
import StageControlBar, {
  StageControlBarEndSlot,
  StageControlBarSeparator,
} from "@/components/StageControlBar/StageControlBar";
import StageThemeFlip from "@/components/StageControlBar/StageThemeFlip";
import styles from "./page.module.css";
import { Button } from "rift-ds/components/Button/Button";
import { CodeBlock } from "rift-ds/components/CodeBlock/CodeBlock";
import { Dialog } from "rift-ds/components/Dialog/Dialog";
import { Drawer } from "rift-ds/components/Drawer/Drawer";
import {
  DEFAULT_ADVANCED,
  DEFAULT_BRAND,
  DEFAULT_NEUTRAL_SEED,
  FONT_OPTIONS,
  HEADING_FONT_OPTIONS,
  SHIPPED_ACCENTS,
  type AccentSextet,
  type AdvancedColorState,
  type Overrides,
  accentOverrides,
  actionColorPlan,
  advancedColorOverrides,
  buildCssSnippet,
  isAccentsPristine,
  googleFontHref,
  isAdvancedPristine,
  neutralOverrides,
  radiusOverrides,
  densityOverrides,
  typeScaleOverrides,
  motionScaleOverrides,
  elevationOverrides,
  type ElevationVariant,
} from "@/lib/theme/theme-overrides";
import { PICKER_FONT_PARAMS, THEME_PRESETS, type ThemePreset } from "@/lib/theme/presets";
import { useAppliedOverrides, useSiteTheme } from "@/lib/theme/use-theme-overrides";
import PlaygroundControls from "./PlaygroundControls";
import { ImageThemeCard, ImageThemeDropZone } from "./ImageThemeDrop";
import { themeFromFile, type ImageThemeSource } from "@/lib/theme/image-palette";
import AdvancedColorsDialog from "./AdvancedColorsDialog";
import ChatDirector, { STORY_CONTENT } from "./ChatDirector";
import InspectMode from "@/components/InspectMode/InspectMode";
import ChatView, {
  type StageSize,
  type TransportMode,
} from "./views/ChatView";
import MockNav from "./views/MockNav";
import TypeView from "./views/TypeView";
import DashboardView from "./views/DashboardView";
import { stageMobileCss } from "./stage-mobile-css";
import { createSimTransport } from "@/lib/chat-sim";
import { createFetchTransport } from "@/lib/chat-transport";
import { SiteChatProvider, useSiteChat } from "@/components/SiteChat/ChatContext";
import { SegmentedControl } from "rift-ds/components/SegmentedControl/SegmentedControl";
import { ShaderField } from "rift-ds/components/ShaderField/ShaderField";
import { InspectorInput } from "rift-ds/components/Inspector/InspectorInput";
import { InspectorSection } from "rift-ds/components/Inspector/InspectorSection";
import { InspectorSegmentedControl } from "rift-ds/components/Inspector/InspectorSegmentedControl";
import { InspectorSlider } from "rift-ds/components/Inspector/InspectorSlider";
import { InspectorToggleSwitch } from "rift-ds/components/Inspector/InspectorToggleSwitch";
import {
  SHADER_PARAM_CONTROLS,
  shaderBackground,
  type ShaderParams,
} from "@/data/shader-background";
import ActionsSection from "./sections/ActionsSection";
import MapsSection from "./sections/MapsSection";
import AiSection from "./sections/AiSection";
import FormsSection from "./sections/FormsSection";
import NavigationSection from "./sections/NavigationSection";
import DataDisplaySection from "./sections/DataDisplaySection";
import ChartsSection from "./sections/ChartsSection";
import OverlaysSection from "./sections/OverlaysSection";
import FeedbackSection from "./sections/FeedbackSection";

/* The tool's four lenses on the same theme state. One page, one set of
   levers — switching views never resets what you've styled. */
type View = "components" | "type" | "chat" | "dashboard";
const VIEWS = [
  { value: "components", label: "Components" },
  { value: "type", label: "Type" },
  { value: "chat", label: "Chat" },
  { value: "dashboard", label: "Dashboard" },
];

/* Below the tool's desktop breakpoint there is no room for the edge
   panel: the controls move into a bottom Drawer summoned by a fixed pill,
   and the workspace gets the whole screen. Must match the breakpoint in
   page.module.css. */
const COMPACT_QUERY = "(max-width: 1099px)";
const subscribeCompact = (callback: () => void) => {
  const media = window.matchMedia(COMPACT_QUERY);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
};

/**
 * Swapping transports used to remount the provider so a stream from the old
 * transport could not keep writing into the new transcript. The provider now
 * wraps the whole layout (the chat director and the compact Drawer read the
 * same conversation the stage renders), so the same guarantee comes from
 * reset(): it aborts the in-flight stream and bumps the generation counter
 * that makes any late event from it inert.
 */
function ResetOnTransportChange({ mode }: { mode: TransportMode }) {
  const { reset } = useSiteChat();
  const previous = useRef(mode);
  useEffect(() => {
    if (previous.current === mode) return;
    previous.current = mode;
    reset();
  }, [mode, reset]);
  return null;
}

/**
 * A preset's extras with anything that would repaint the action colour taken
 * out. An image supplies that colour, so an inherited pointer at a preset's
 * own fill has to go; the display-type weight and letter-spacing that ride in
 * the same object have nothing to do with colour and stay.
 */
const withoutActionColours = (extras?: Overrides): Overrides | undefined => {
  if (!extras) return extras;
  const kept = Object.fromEntries(
    Object.entries(extras).filter(([name]) => !name.startsWith("--color-action-"))
  );
  return Object.keys(kept).length > 0 ? kept : undefined;
};

export default function PlaygroundPage() {
  /* ---------- the active view ----------
     Local state (the levers must survive a switch), mirrored into ?view=
     so a specific view can be linked. Read once on mount rather than via
     useSearchParams, which would force a Suspense boundary on a fully
     client-rendered page. */
  const [view, setView] = useState<View>("components");
  useEffect(() => {
    // The setState here is intentional — a once-on-mount sync from the
    // URL, which the server prerender can't see (same pattern as
    // MegaNav's navigation effect).
    const q = new URLSearchParams(window.location.search).get("view");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (q === "chat" || q === "type" || q === "dashboard") setView(q);
  }, []);
  const pickView = (value: string) => {
    setView(value as View);
    const url = new URL(window.location.href);
    if (value === "components") url.searchParams.delete("view");
    else url.searchParams.set("view", value);
    window.history.replaceState(null, "", url);
  };

  /* Chat view's contextual levers, held here so they survive a view
     switch like everything else. Sim by default: reviewing choreography
     should cost nothing — Live is the deliberate opt-in (the chat cost
     policy on record). */
  const [transportMode, setTransportMode] = useState<TransportMode>("sim");
  const transport = useMemo(
    () =>
      transportMode === "live"
        ? createFetchTransport()
        : /* The sim gets the story's rich elements — the map is what lets a
             chip path end on a card, a chart, or an approval. */
          createSimTransport(STORY_CONTENT),
    [transportMode]
  );
  const [stageSize, setStageSize] = useState<StageSize>("desktop");
  /* The dragged widget size lives here so it survives a switch to the
     Components view and back; like every lever, it dies with the page. */
  const [chatManual, setChatManual] = useState<{ w?: number; h?: number }>({});
  const [chatPlaceholder, setChatPlaceholder] = useState("");
  const [showStarters, setShowStarters] = useState(true);
  /* The staged thread furniture, feature by feature. All off is the simple
     rail the live site ships, which is where the stage starts: the extras
     are things to add and look at, not the resting state. Simulated
     transport only, like the rail itself. */
  const [railProjects, setRailProjects] = useState(false);
  const [railPins, setRailPins] = useState(false);
  const [railDetails, setRailDetails] = useState(false);
  const [railTabs, setRailTabs] = useState(false);
  /* The agent rail, off with the rest of the staged furniture: the stage
     opens on the plain chat and every extra is something to switch on and
     look at. */
  const [agentRail, setAgentRail] = useState(false);

  /* The staged shader banner's levers (Components view). They tune the
     banner only, never the site background, and no theme preset owns them,
     so picking a preset leaves them where they are; their own reset puts
     them back on the site's config. */
  const [shaderParams, setShaderParams] = useState<ShaderParams>(
    shaderBackground.params
  );
  const shaderPristine = SHADER_PARAM_CONTROLS.every(
    (c) => shaderParams[c.key] === shaderBackground.params[c.key]
  );

  /* ---------- levers ---------- */
  const [preset, setPreset] = useState("default");
  const [brand, setBrand] = useState(DEFAULT_BRAND);
  const [tintOn, setTintOn] = useState(false);
  const [tintSeed, setTintSeed] = useState(DEFAULT_NEUTRAL_SEED);
  const [tintStrength, setTintStrength] = useState(6); // percent
  const [radiusScale, setRadiusScale] = useState(100); // percent
  const [pill, setPill] = useState(true);
  const [density, setDensity] = useState(100); // percent
  const [typeScale, setTypeScale] = useState(100); // percent
  const [motionScale, setMotionScale] = useState(100); // percent
  const [elevation, setElevation] = useState<ElevationVariant>("default");
  const [fontLabel, setFontLabel] = useState(FONT_OPTIONS[0].label);
  const [headingFontLabel, setHeadingFontLabel] = useState(
    HEADING_FONT_OPTIONS[0].label
  );
  const [productName, setProductName] = useState("");
  const compact = useSyncExternalStore(
    subscribeCompact,
    () => window.matchMedia(COMPACT_QUERY).matches,
    () => false
  );
  /* The Mobile stage: a phone-width column on a desktop viewport, where
     no viewport media query can fire. The `data-stage` marker plus the
     stylesheet derived in stage-mobile-css.ts swap in the phone
     variants — the token step-down, the `.ds-` small-screen blocks, the
     stage-aware grids — so Mobile shows what a phone actually renders.
     On a compact screen the real queries fire and the stage stands
     down; the Chat view reads the lever as its widget preset instead. */
  /* The Dashboard view reads the lever too, but as which template to stage
     (the phone version draws its own handset), not as a column width. */
  const stageMobile =
    view !== "chat" && view !== "dashboard" && stageSize === "mobile" && !compact;
  const stageCss = stageMobile ? stageMobileCss() : "";
  const [controlsOpen, setControlsOpen] = useState(false);
  const [advOpen, setAdvOpen] = useState(false);
  const [cssOpen, setCssOpen] = useState(false);
  const [advColors, setAdvColors] = useState<AdvancedColorState>(DEFAULT_ADVANCED);
  /* The ambient accent sextet — the six --color-core-accent-* roles,
     which colour the background blobs and chart series 2–7 together.
     Seeded by a preset, hand-picked in the Advanced colours dialog. */
  const [accents, setAccents] = useState<AccentSextet>(SHIPPED_ACCENTS);

  /* ---------- theming from an image ----------
     The dropped picture, its object URL and the swatches it was read from.
     Everything here lives in this tab: the file is decoded to an object URL
     and sampled on a canvas, never uploaded and never stored, and the URL is
     revoked the moment the card stops rendering it. */
  const [imageSource, setImageSource] = useState<ImageThemeSource | null>(null);
  const [imageError, setImageError] = useState("");
  const [imageBusy, setImageBusy] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  /* The live URL, so the revoke on unmount does not need imageSource in a
     dependency array that would re-run the cleanup on every swap. */
  const imageUrlRef = useRef<string | null>(null);

  const clearImage = () => {
    if (imageUrlRef.current) URL.revokeObjectURL(imageUrlRef.current);
    imageUrlRef.current = null;
    setImageSource(null);
    setImageError("");
  };

  useEffect(() => {
    return () => {
      if (imageUrlRef.current) URL.revokeObjectURL(imageUrlRef.current);
    };
  }, []);

  /** The last-chosen preset's non-lever state (coral's white label,
      mono's theme-dependent action colour). Kept separate from
      `preset` so Custom inherits it — touching one lever must only change
      that lever, never snap the rest of the look back to the shipped
      defaults. */
  const [presetExtras, setPresetExtras] = useState<
    Pick<ThemePreset, "brandDark" | "extraOverrides" | "extraOverridesDark">
  >({});

  const syncPresetParam = (value: string) => {
    const url = new URL(window.location.href);
    if (value === "custom") url.searchParams.delete("preset");
    else url.searchParams.set("preset", value);
    window.history.replaceState(null, "", url);
  };

  /** Touching any individual lever means the state is no longer the
      preset — and the share URL stops naming one, since a custom mix is
      not addressable by id. */
  const asCustom = <T,>(setter: (value: T) => void) => (value: T) => {
    setPreset("custom");
    syncPresetParam("custom");
    setter(value);
  };

  /** Explicitly picking an action colour also retires the inherited
      theme-dependent brand — the pick applies to both themes. The neutral
      swatches are the exception: they carry their own dark-mode value. */
  const pickBrand = (value: string, darkValue?: string) => {
    setPreset("custom");
    setPresetExtras((e) => ({ ...e, brandDark: darkValue }));
    setBrand(value);
  };

  /** Reads a local image and moves the colour levers to match it: the action
      colour, the neutral tint, and the six ambient accents. It is the same
      Custom state any hand-moved lever produces, so every other lever keeps
      its position and the copied CSS reproduces the result like any other
      theme. */
  const applyImageTheme = async (file: File) => {
    setImageBusy(true);
    setImageError("");
    const source = await themeFromFile(file);
    setImageBusy(false);
    if (!source) {
      setImageError("That file could not be read. Try a PNG, JPEG or WebP.");
      return;
    }

    if (imageUrlRef.current) URL.revokeObjectURL(imageUrlRef.current);
    imageUrlRef.current = source.url;
    setImageSource(source);

    setPreset("custom");
    syncPresetParam("custom");
    /* Everything that would repaint over the sample has to stand down first.
       A theme-dependent brand would override the action colour in dark mode;
       a preset's per-ramp rebases and its hue and saturation levers are
       applied last of all, so they would beat the sampled colour outright;
       and its action-colour extras layer over the derived pointers. The
       levers the image has no opinion about, from radius to typeface, keep
       their positions. */
    setPresetExtras((e) => ({
      brandDark: undefined,
      extraOverrides: withoutActionColours(e.extraOverrides),
      extraOverridesDark: withoutActionColours(e.extraOverridesDark),
    }));
    setAdvColors(DEFAULT_ADVANCED);
    setBrand(source.theme.brand);
    setTintOn(source.theme.tintOn);
    setTintSeed(source.theme.tintSeed);
    setTintStrength(source.theme.tintStrength);
    setAccents(source.theme.accents);

    /* The banner heads the components stage, so a drop from the Type or Chat
       view lands somewhere it can be seen. */
    pickView("components");
  };

  /* A deep link can seed the action-colour lever with ?brand=<hex> (no
     leading #). Nothing on the site emits one today — the design-system
     landing's accent switcher used to — but the URL contract stays for
     hand-typed and shared links. Once on mount, same pattern as the
     ?view= sync above. */
  useEffect(() => {
    const brandQ = new URLSearchParams(window.location.search).get("brand");
    if (brandQ && /^[0-9a-fA-F]{6}$/.test(brandQ)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPreset("custom");
      setBrand(`#${brandQ.toUpperCase()}`);
    }
  }, []);

  /** Advanced levers flip to Custom like any other lever; explicitly
      rebasing teal also retires an inherited theme-dependent brand, the
      same way picking an action colour does. */
  const changeAdvColors = (next: AdvancedColorState) => {
    setPreset("custom");
    if (next.bases.teal && !advColors.bases.teal) {
      setPresetExtras((e) => ({ ...e, brandDark: undefined }));
    }
    setAdvColors(next);
  };

  const applyPreset = (value: string) => {
    syncPresetParam(value);
    if (value === "default") {
      reset(); // the shipped look — put every lever back
      return;
    }
    setPreset(value);
    const p = THEME_PRESETS[value];
    if (!p) return; // "custom" — keep the current levers
    // A named preset replaces every colour the image supplied, so the card
    // would be claiming credit for a look it no longer owns.
    clearImage();
    setAdvColors(p.advanced ?? DEFAULT_ADVANCED); // harmonized ramp keys
    setAccents({ ...p.accents }); // the theme's ambient sextet
    setPresetExtras({
      brandDark: p.brandDark,
      extraOverrides: p.extraOverrides,
      extraOverridesDark: p.extraOverridesDark,
    });
    setBrand(p.brand);
    setTintOn(p.tintOn);
    setTintSeed(p.tintSeed);
    setTintStrength(p.tintStrength);
    setRadiusScale(p.radiusScale);
    setPill(p.pill);
    setDensity(p.density);
    setTypeScale(p.typeScale);
    setMotionScale(p.motionScale);
    setElevation(p.elevation);
    setFontLabel(p.fontLabel);
    setHeadingFontLabel(p.headingFontLabel ?? HEADING_FONT_OPTIONS[0].label);
  };

  const font = FONT_OPTIONS.find((f) => f.label === fontLabel) ?? FONT_OPTIONS[0];
  const headingFont =
    HEADING_FONT_OPTIONS.find((f) => f.label === headingFontLabel) ??
    HEADING_FONT_OPTIONS[0];

  /* The playground edits the RAW token layer: its levers write inline
     overrides against the shipped defaults. A site-wide data-brand theme
     (the landing's dot row) would sit underneath and bleed through every
     property a lever hasn't touched, so the attribute is suspended while
     the playground is mounted and restored on the way out — the visitor's
     stored pick is untouched. */
  const suspendedBrandRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    const root = document.documentElement;
    const suspended = root.dataset.brand;
    suspendedBrandRef.current = suspended;
    if (suspended !== undefined) delete root.dataset.brand;
    return () => {
      if (suspended !== undefined) root.dataset.brand = suspended;
    };
  }, []);

  const theme = useSiteTheme();

  /* A preset can carry a theme-dependent action colour (black & white:
     dark button on light, white button on dark). Read from presetExtras so
     it survives the flip to Custom. */
  const effectiveBrand =
    presetExtras.brandDark && theme === "dark" ? presetExtras.brandDark : brand;

  /* How the action colour applies, honestly: a hex that names a real
     primitive repoints the semantic action tokens at its ramp; a custom
     hex rebases its nearest ramp family (a warm orange reshapes the
     orange ramp, never teal) and points at that; a grey points at the
     shipped neutral scale. Null means the shipped default. */
  const actionPlan = useMemo(
    () => actionColorPlan(effectiveBrand, theme === "dark" ? "dark" : "light"),
    [effectiveBrand, theme]
  );

  const overrides = useMemo<Overrides>(() => {
    const merged: Overrides = {};
    if (actionPlan) {
      Object.assign(merged, actionPlan.primitives, actionPlan.semantics);
    }
    if (tintOn && tintStrength > 0) {
      Object.assign(merged, neutralOverrides(tintSeed, tintStrength / 100));
    }
    if (radiusScale !== 100 || !pill) {
      Object.assign(merged, radiusOverrides(radiusScale / 100, pill));
    }
    if (density !== 100) {
      Object.assign(merged, densityOverrides(density / 100));
    }
    if (typeScale !== 100) {
      Object.assign(merged, typeScaleOverrides(typeScale / 100));
    }
    if (motionScale !== 100) {
      Object.assign(merged, motionScaleOverrides(motionScale / 100));
    }
    Object.assign(merged, elevationOverrides(elevation, theme === "dark" ? "dark" : "light"));
    /* The ambient accents apply whenever any differs from the shipped
       keys — mirroring presetOverrides' placement just before the extras. */
    if (!isAccentsPristine(accents)) {
      Object.assign(merged, accentOverrides(accents));
    }
    if (presetExtras.extraOverrides) {
      Object.assign(merged, presetExtras.extraOverrides);
    }
    if (theme === "dark" && presetExtras.extraOverridesDark) {
      Object.assign(merged, presetExtras.extraOverridesDark);
    }
    if (!isAdvancedPristine(advColors)) {
      Object.assign(merged, advancedColorOverrides(advColors, merged));
    }
    return merged;
  }, [actionPlan, theme, tintOn, tintSeed, tintStrength, radiusScale, pill, density, typeScale, motionScale, elevation, accents, presetExtras, advColors]);

  /* ---------- apply to the whole page ----------
     The shared hook writes to :root (where the semantic layer is declared,
     so primitive overrides cascade) and removes everything on unmount.
     Bonus: the entire site chrome previews the theme live. */
  const applied = useMemo(() => {
    if (!font.family && !headingFont.family) return overrides;
    const merged = { ...overrides };
    /* The body lever writes the primary token, so an unsplit heading role
       follows it; the heading lever overrides the role alias alone. */
    if (font.family) merged["--font-family-primary"] = font.family;
    if (headingFont.family) merged["--font-family-heading"] = headingFont.family;
    return merged;
  }, [overrides, font, headingFont]);
  useAppliedOverrides(applied);

  /* Google Fonts stylesheets for every face the pickers preview, loaded
     once on mount — the rich picker cells render each option in its own
     font, so on-demand loading would show fallbacks mid-menu. The CSS is
     tiny; woff2s only download when a face actually renders. All are
     removed on unmount. */
  useEffect(() => {
    for (const param of PICKER_FONT_PARAMS) {
      const id = `playground-font-${param}`;
      if (!document.getElementById(id)) {
        const link = document.createElement("link");
        link.id = id;
        link.rel = "stylesheet";
        link.href = googleFontHref(param);
        document.head.appendChild(link);
      }
    }
  }, []);

  useEffect(() => {
    return () => {
      document
        .querySelectorAll('link[id^="playground-font-"]')
        .forEach((link) => link.remove());
    };
  }, []);

  const isPristine =
    Object.keys(overrides).length === 0 && !font.family && !headingFont.family;

  const reset = () => {
    clearImage();
    setPreset("default");
    setPresetExtras({});
    setAdvColors(DEFAULT_ADVANCED);
    setAccents(SHIPPED_ACCENTS);
    setBrand(DEFAULT_BRAND);
    setTintOn(false);
    setTintSeed(DEFAULT_NEUTRAL_SEED);
    setTintStrength(6);
    setRadiusScale(100);
    setPill(true);
    setDensity(100);
    setTypeScale(100);
    setMotionScale(100);
    setElevation("default");
    setFontLabel(FONT_OPTIONS[0].label);
    setHeadingFontLabel(HEADING_FONT_OPTIONS[0].label);
  };

  /* Launch from the linked or applied theme: a ?preset= param (the
     share URL — the themes gallery's Open-in-playground links carry it)
     wins; otherwise the pick the suspend effect recorded seeds the
     levers once, so the playground opens already showing the look the
     visitor arrived in rather than the shipped default. Read once on
     mount like ?view above. Sits after applyPreset/reset so the
     definitions exist when it runs. */
  useEffect(() => {
    const linked = new URLSearchParams(window.location.search).get("preset");
    if (linked && (linked === "default" || THEME_PRESETS[linked])) {
      // A once-on-mount sync from the URL, which the prerender can't
      // see — the same sanctioned pattern as the ?view read above.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      applyPreset(linked);
      return;
    }
    const suspended = suspendedBrandRef.current;
    if (suspended && THEME_PRESETS[suspended]) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      applyPreset(suspended);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* The copied CSS always puts the light-mode values in :root, whatever
     theme is being previewed. Any non-default action colour ships a
     [data-theme="dark"] block too, because the two themes point a few
     roles at different steps; a theme-dependent preset brand (black &
     white) swaps in its own dark plan there. Rebased primitives are
     theme-agnostic and stay in :root unless the dark brand differs. */
  const darkHex = presetExtras.brandDark ?? brand;
  const lightPlan = actionColorPlan(brand, "light");
  const darkPlan = actionColorPlan(darkHex, "dark");

  /* Dark-only extras belong in the dark block whether or not the action
     colour itself differs, or the copied CSS would not reproduce what is
     on screen. They layer last, over the derived dark pointers. */
  const darkExtras = presetExtras.extraOverridesDark;

  let snippetOverrides = overrides;
  let snippetDarkBlock: Overrides | undefined = darkExtras
    ? { ...darkExtras }
    : undefined;
  if (lightPlan || darkPlan) {
    /* Primitives first, then the applied overrides: a rebased ramp may
       have been further transformed by the all-ramps levers, and those
       final values are the accurate ones. Only the semantic pointers are
       forced back to the light-theme map. */
    snippetOverrides = {
      ...(lightPlan?.primitives ?? {}),
      ...overrides,
      ...(lightPlan?.semantics ?? {}),
    };
    snippetDarkBlock = darkPlan
      ? {
          ...(darkHex !== brand ? darkPlan.primitives : {}),
          ...darkPlan.semantics,
          ...darkExtras,
        }
      : snippetDarkBlock;
  }
  const cssSnippet = isPristine
    ? "/* Everything is at its shipped default. Move a lever to generate CSS. */"
    : buildCssSnippet(snippetOverrides, font, snippetDarkBlock, headingFont);

  /* The Chat view's levers — hosted by the chat director's rail on desktop,
     or slotted into the Drawer above the event list on compact screens, so
     the whole chat toolkit lives on one side of the stage. */
  const chatLevers = view === "chat" && (
    <InspectorSection title="Chat setup" defaultOpen>
      <div className={styles.controlGroup}>
        <InspectorSegmentedControl
          size="compact"
          label="Transport"
          value={transportMode}
          options={[
            { value: "sim", label: "Simulated" },
            { value: "live", label: "Live" },
          ]}
          onValueChange={(value) => setTransportMode(value as TransportMode)}
        />
      </div>

      <div className={styles.controlGroup}>
        <InspectorInput
          size="compact"
          label="Placeholder"
          placeholder="Ask anything"
          value={chatPlaceholder}
          onValueChange={setChatPlaceholder}
        />
        <InspectorToggleSwitch
          size="compact"
          label="Starter prompts"
          checked={showStarters}
          onCheckedChange={setShowStarters}
        />
      </div>

      {transportMode === "sim" && (
        <div className={styles.controlGroup}>
          <h4 className={styles.controlHeading}>Threads</h4>
          <InspectorToggleSwitch
            size="compact"
            label="Projects"
            checked={railProjects}
            onCheckedChange={setRailProjects}
          />
          <InspectorToggleSwitch
            size="compact"
            label="Pinned threads"
            checked={railPins}
            onCheckedChange={setRailPins}
          />
          <InspectorToggleSwitch
            size="compact"
            label="Thread details"
            checked={railDetails}
            onCheckedChange={setRailDetails}
          />
          <InspectorToggleSwitch
            size="compact"
            label="Session tabs"
            checked={railTabs}
            onCheckedChange={setRailTabs}
          />
        </div>
      )}

      {transportMode === "sim" && (
        <div className={styles.controlGroup}>
          <h4 className={styles.controlHeading}>Agent</h4>
          <InspectorToggleSwitch
            size="compact"
            label="Agent rail"
            checked={agentRail}
            onCheckedChange={setAgentRail}
          />
        </div>
      )}
    </InspectorSection>
  );

  /* The Components view's shader levers, slotted under the shared ones
     because the banner is the only thing on any stage they move. */
  const shaderLevers = view === "components" && (
    <InspectorSection title="Shader banner" defaultOpen>
      {SHADER_PARAM_CONTROLS.map((c) => (
        <InspectorSlider
          size="compact"
          key={c.key}
          label={c.label}
          value={shaderParams[c.key]}
          min={c.min}
          max={c.max}
          step={c.step}
          onValueChange={(value) =>
            setShaderParams((prev) => ({ ...prev, [c.key]: value }))
          }
        />
      ))}
      <Button
        label="Reset shader"
        size="compact"
        variant="neutral"
        iconLeft="restart_alt"
        state={shaderPristine ? "disabled" : "default"}
        onClick={() => setShaderParams(shaderBackground.params)}
      />
    </InspectorSection>
  );

  /* The full lever set, host-agnostic — mounted in the floating panel on
     desktop or handed to the Drawer on compact screens. */
  const controls = (
            <PlaygroundControls
              variant={compact ? "drawer" : "panel"}
              preset={preset}
              brand={effectiveBrand}
              theme={theme}
              tintOn={tintOn}
              tintSeed={tintSeed}
              tintStrength={tintStrength}
              radiusScale={radiusScale}
              pill={pill}
              density={density}
              typeScale={typeScale}
              motionScale={motionScale}
              elevation={elevation}
              fontLabel={fontLabel}
              headingFontLabel={headingFontLabel}
              productName={productName}
              isPristine={isPristine}
              cssSnippet={cssSnippet}
              onPreset={applyPreset}
              onBrand={pickBrand}
              onTintOn={asCustom(setTintOn)}
              onTintSeed={asCustom(setTintSeed)}
              onTintStrength={asCustom(setTintStrength)}
              onRadiusScale={asCustom(setRadiusScale)}
              onPill={asCustom(setPill)}
              onDensity={asCustom(setDensity)}
              onTypeScale={asCustom(setTypeScale)}
              onMotionScale={asCustom(setMotionScale)}
              onElevation={asCustom(setElevation)}
              onFontLabel={asCustom(setFontLabel)}
              onHeadingFontLabel={asCustom(setHeadingFontLabel)}
              onProductName={setProductName}
              imageName={imageSource?.name}
              imageBusy={imageBusy}
              imageError={imageError}
              onPickImage={() => imageInputRef.current?.click()}
              onClearImage={clearImage}
              /* Reset lands on Smoke, the served default — the raw token
                 files stay reachable as the Tide row in the picker. */
              onReset={() => applyPreset("mono")}
              onOpenAdvanced={() => setAdvOpen(true)}
              onViewCss={() => setCssOpen(true)}
              contextual={
                /* On compact screens the chat director has no rail of its
                   own — its levers and events ride in the Drawer with the
                   theme controls. On desktop the right rail owns them. */
                view === "chat" && compact ? (
                  <>
                    {chatLevers}
                    <ChatDirector variant="drawer" live={transportMode === "live"} />
                  </>
                ) : (
                  shaderLevers || undefined
                )
              }
            />
  );

  return (
    <>
      {/* The stage ground is the dotted working canvas, not the ambient
          field — the shader stands down here (and is staged as a banner in
          the components view instead). */}
      <HiddenBackground />
      <DotBackground />

      {/* Drag a picture onto any part of the tool and the colour levers move
          to match it. The file is read in this tab and nowhere else. */}
      <ImageThemeDropZone onFile={applyImageTheme} rejected={imageError} />
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className={styles.visuallyHidden}
        tabIndex={-1}
        aria-hidden="true"
        onChange={(event) => {
          const file = event.target.files?.[0];
          // Cleared so choosing the same file twice still fires a change.
          event.target.value = "";
          if (file) applyImageTheme(file);
        }}
      />

      {/* Not the site's full navigation — a full-screen view's floating
          toolbar pill: brand mark, breadcrumb trail, the view pills, and
          the X out. (Footer and the site chat still skip this route.) */}
      <StageToolbar
        tabs={VIEWS}
        activeTab={view}
        onTabChange={pickView}
        switchLabel="Switch the playground view"
      />

      {/* One provider around the whole layout: the theme drawer, the chat
          director's rail, and the stage all direct the same conversation,
          and the transcript survives a switch between views. */}
      <SiteChatProvider transport={transport}>
      <ResetOnTransportChange mode={transportMode} />
      <div
        className={[
          styles.dsLayout,
          view === "chat" && !compact ? styles.dsLayoutChat : "",
          view === "dashboard" ? styles.dsLayoutDashboard : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {/* Inside the layout so the bar reads the panel geometry the
            layout declares (--stage-bar-start/-end) and centres on the
            workspace between the floating panels. */}
        {/* The stage's own instruments, in the bottom control bar — the
            normalized set every immersive surface shares: the theme flip
            (the immersive format drops the header that carried it) and the
            desktop/mobile stage switch, then this stage's extras. */}
        <StageControlBar label="Stage controls">
          <StageThemeFlip />
          {/* Desktop rides the stage-size switch and inspect mode beside the
              flip (a phone IS the mobile preset, and inspection is a hover
              interaction); compact screens carry the Drawer summons instead,
              so the bar and the old floating pill can never collide. */}
          {compact ? (
            <>
              <StageControlBarSeparator />
              <Button
                label="Theme controls"
                variant="primary"
                size="compact"
                iconLeft="tune"
                onClick={() => setControlsOpen(true)}
              />
            </>
          ) : (
            <>
              <StageControlBarSeparator />
              <SegmentedControl
                segments={[
                  { value: "desktop", label: "Desktop", icon: "desktop_windows" },
                  { value: "mobile", label: "Mobile", icon: "smartphone" },
                ]}
                activeSegment={stageSize}
                onSegmentChange={(value) => {
                  /* A manual drag is a size of its own — switching the stage
                     size discards it rather than resizing around it. */
                  setStageSize(value as StageSize);
                  setChatManual({});
                }}
                size="compact"
                ariaLabel="Stage size"
              />
              <StageControlBarSeparator />
              {/* Inspect mode — hover any staged component to see which
                  tokens its computed styles resolve from, including the
                  levers' live overrides, re-read as they land. */}
              <StageControlBarEndSlot>
                <InspectMode desktopOnly />
              </StageControlBarEndSlot>
            </>
          )}
        </StageControlBar>

        {/* The control panel floats where the nav sidebar sits on doc pages */}
        {compact ? (
          <>
            {/* The workspace owns the phone screen; the levers are one tap
                away in the bottom control bar's summons. */}
            <Drawer
              open={controlsOpen}
              onOpenChange={setControlsOpen}
              title="Theme controls"
              side="bottom"
              size="lg"
            >
              {controls}
            </Drawer>
          </>
        ) : (
          controls
        )}

        <AdvancedColorsDialog
          open={advOpen}
          onOpenChange={setAdvOpen}
          state={advColors}
          accents={accents}
          overrides={overrides}
          onChange={changeAdvColors}
          onAccentsChange={asCustom(setAccents)}
          onResetColors={() => {
            setAdvColors(DEFAULT_ADVANCED);
            setAccents(SHIPPED_ACCENTS);
          }}
        />

        {/* The generated CSS, inspectable from any view — the rail's Copy
            button grabs it without opening this. */}
        <Dialog
          open={cssOpen}
          onOpenChange={setCssOpen}
          title="Your theme as CSS"
          size="lg"
        >
          <div className={styles.cssDialogBody}>
            <p className={styles.sectionNote}>
              Paste this after importing{" "}
              <code>rift-ds/tokens/tokens.css</code> and your app
              matches this page, both themes included. The install steps live on{" "}
              <Link href="/docs/get-started" className={styles.inlineLink}>
                Get started
              </Link>
              .
            </p>
            <CodeBlock
              code={cssSnippet}
              language="css"
              filename="theme-overrides.css"
              showCopy
            />
          </div>
        </Dialog>

        <main
          className={[
            styles.dsContent,
            styles.dsContentEnter,
            /* The stage switch narrows the components and type workspaces
               to a phone-width column — the same lever the Chat view reads
               as its widget preset, so the views agree on what the bar's
               Desktop/Mobile means. */
            stageMobile ? styles.dsContentMobile : "",
            view === "dashboard" ? styles.dsContentDashboard : "",
          ]
            .filter(Boolean)
            .join(" ")}
          data-stage={stageMobile ? "mobile" : undefined}
          id="main-content"
        >
          {/* The phone rules the narrowed column can't trigger, derived
              from the loaded stylesheets and scoped to the stage. */}
          {stageCss && <style>{stageCss}</style>}
          {view === "components" && (
            <>
              {/* A white-label site header opens the view, so the theme
                  reads the way it does on a real page — navigation first.
                  No animate-in on the sections: the class creates a
                  stacking context per section, which would let later
                  sections paint over an open Dropdown/Popover in an
                  earlier one. */}
              <div className={styles.navStage}>
                {/* The theme's source picture heads the stage, pushing the
                    nav and everything under it down, all of it re-themed. */}
                {imageSource && (
                  <ImageThemeCard
                    source={imageSource}
                    onReplace={() => imageInputRef.current?.click()}
                    onClear={clearImage}
                  />
                )}
                <MockNav brandName={productName.trim() || "Acme Corp"} />
              </div>
              {/* The ambient shader, demoted from stage backdrop to staged
                  component: a banner that opens on the site's own field
                  config, re-theming live with the levers like everything
                  else, and tuned by its own shader levers in the rail. */}
              <div className={styles.shaderBanner} aria-hidden="true">
                <ShaderField
                  params={shaderParams}
                  blobs={shaderBackground.blobs}
                />
              </div>
              <ActionsSection />
              <MapsSection />
              <AiSection />
              <FormsSection />
              <NavigationSection />
              <DataDisplaySection />
              <ChartsSection brand={effectiveBrand} />
              <OverlaysSection />
              <FeedbackSection />
            </>
          )}

          {/* The Type view: the full ramp as a live specimen sheet, with
              the heading and body family roles resolved per step. The
              stage flag re-reads the labels when the phone step-down
              lands, since no root mutation or resize announces it. */}
          {view === "type" && <TypeView stageMobile={stageMobile} />}

          {/* The Dashboard view: the marketing dashboard template, live in
              a frame that mirrors the levers, on the Chat view's stage.
              Desktop/Mobile picks the app or its phone version in the
              bezel; a phone always gets the phone version, bare. */}
          {view === "dashboard" && (
            <DashboardView
              template={compact ? "mobile" : stageSize}
              device={!compact && stageSize === "mobile"}
              productName={productName.trim() || "Acme Corp"}
            />
          )}

          {/* The Chat view: the widget on its stage, same levers, plus the
              chat director's rail on the right. */}
          {view === "chat" && (
            <ChatView
              title={productName.trim() || "Acme Corp"}
              /* A phone IS the mobile preset — the stage-size lever hides
                 on compact screens and the widget goes fluid via CSS. */
              size={compact ? "desktop" : stageSize}
              placeholder={chatPlaceholder}
              showStarters={showStarters}
              manual={chatManual}
              onManual={(next) => setChatManual((m) => ({ ...m, ...next }))}
              allowFullscreen={!compact}
              simControls={transportMode === "sim"}
              railProjects={railProjects}
              railPins={railPins}
              railDetails={railDetails}
              railTabs={railTabs}
              agentRail={agentRail}
            />
          )}
        </main>

        {/* The chat director: the Chat view's own floating panel, mirroring
            the theme panel on the right — chat levers above, the event list
            below. Compact screens get the same content through the Drawer
            instead. */}
        {view === "chat" && !compact && (
          <ChatDirector
            variant="panel"
            levers={chatLevers}
            live={transportMode === "live"}
          />
        )}
      </div>
      </SiteChatProvider>

    </>
  );
}
