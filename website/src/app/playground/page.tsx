"use client";

/**
 * The playground: the immersive re-theming tool. Four views (Components,
 * Type, Chat, Templates) over one set of levers, chromeless, its rails
 * built from the library's Inspector family. The theme rail sits on the
 * left and every view seats a panel of its own on the right, so each stage
 * centres under the toolbar's view switch: the Components view's section
 * switches and surface, the Type view's specimen text and tier switches
 * (viewing choices that never reach the theme or its export), the chat
 * director (views/ChatView.tsx, ChatDirector.tsx) and the templates rail
 * (views/TemplatesView.tsx, TemplatesRail.tsx).
 *
 * A theme leaves through the Export theme button (lib/theme/theme-export.ts
 * owns what it writes); one comes in by dropping a picture
 * (lib/theme/image-palette.ts) or a DESIGN.md or other text file
 * (lib/theme/design-md.ts), read in this tab and never uploaded. Any drag
 * on the stages writes to the DOM per frame and commits React state once
 * on release; the resize block in views/ChatView.tsx owns the reason. The
 * old /robr0-gpt chat bench redirects here (next.config.ts).
 */

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import StageToolbar from "@/components/StageToolbar/StageToolbar";
import { HiddenBackground } from "@/components/BlurBackground/BlurBackground";
import DotBackground from "@/components/DotBackground/DotBackground";
import StageControlBar, {
  StageControlBarActionSlot,
  StageControlBarEndSlot,
  StageControlBarSeparator,
} from "@/components/StageControlBar/StageControlBar";
import StageThemeFlip from "@/components/StageControlBar/StageThemeFlip";
import styles from "./page.module.css";
import { mediaBelow } from "rift-ds/tokens/breakpoints";
import { BREAKPOINT_STAGE_COMPACT_PX } from "@/config/breakpoints";
import { Button } from "rift-ds/components/Button/Button";
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
  aiGradientFadeOverrides,
  ambientFadeOverrides,
  aiGradientTonalOverrides,
  advancedColorOverrides,
  tierToneOverrides,
  nearestRampFor,
  shippedNeutralHex,
  CHROMATIC_RAMPS,
  type ToneRole,
  isAccentsPristine,
  googleFontHref,
  isAdvancedPristine,
  neutralOverrides,
  radiusOverrides,
  densityOverrides,
  typeScaleOverrides,
  motionScaleOverrides,
  elevationOverrides,
  weightOverrides,
  trackingOverrides,
  iconOverrides,
  SHIPPED_DISPLAY_WEIGHT,
  SHIPPED_HEADING_WEIGHT,
  SHIPPED_BODY_WEIGHT,
  SHIPPED_ICON_WEIGHT,
  addSessionFont,
  type ElevationVariant,
  type LogoEndTone,
  type LogoTone,
  type TextTone,
  type FontOption,
} from "@/lib/theme/theme-overrides";
import { PICKER_FONT_PARAMS, THEME_PRESETS, type ThemePreset } from "@/lib/theme/presets";

import { BASE_THEME_ID, isBaseTheme, SERVED_THEME_ID } from "@/lib/theme/brand";
import { useAppliedOverrides, useSiteTheme } from "@/lib/theme/use-theme-overrides";
import {
  buildAgentPrompt,
  buildThemeMarkdown,
  buildThemedAgentsMd,
  buildThemeCss,
  themeFromLevers,
} from "@/lib/theme/theme-export";
import { MCP_ENDPOINT } from "@/lib/mcp-clients";
import { BIN_NAME, MCP_SERVER_NAME, PACKAGE_NAME, SITE_URL } from "@/config/brand.generated";
import PlaygroundControls from "./PlaygroundControls";
import { ImageThemeCard, ImageThemeDropZone } from "./ImageThemeDrop";
import { themeFromFile, type ImageThemeSource } from "@/lib/theme/image-palette";
import { DesignMdCard } from "./DesignMdCard";
import { ThemeSourceInvite } from "./ThemeSourceInvite";
import {
  DESIGN_MD_MAX_BYTES,
  isDesignMdFile,
  themeFromDesignMd,
  type DesignMdRejection,
  type DesignMdSource,
} from "@/lib/theme/design-md";
import AdvancedColorsDialog from "./AdvancedColorsDialog";
import ExportThemeDialog from "./ExportThemeDialog";
import { AGENT_STARTER } from "@/data/agent-starter.generated";
import ChatDirector, { ChatAutoplay } from "./ChatDirector";
import { EMBED_THEME_MESSAGE } from "@/components/HomeChatFrame/embed-theme";
import InspectMode from "@/components/InspectMode/InspectMode";
import ChatView, {
  defaultChatPlaceholder,
  type StageSize,
  type TransportMode,
} from "./views/ChatView";
import {
  DEMO_PROJECTS,
  DEMO_ARTIFACT_RENDERERS,
  DEMO_RENDERERS,
  DEMO_THREADS,
  DEMO_WELCOME_OPTIONS as CHAT_WELCOME_OPTIONS,
  createDemoTransport,
  type DemoWelcomeVariant as ChatWelcomeVariant,
} from "rift-ds/chat/demo";
import MockNav from "./views/MockNav";
import TypeView from "./views/TypeView";
import TemplatesView from "./views/TemplatesView";
import TemplatesRail, { DEFAULT_TEMPLATE_HREF, STAGE_TEMPLATES } from "./TemplatesRail";
import ComponentsRail, {
  COMPONENT_SECTIONS,
  sectionAnchor,
  type ComponentSectionId,
  type ComponentsRailState,
} from "./ComponentsRail";
import TypeRail, { DEFAULT_TYPE_SAMPLE, type TypeRailState } from "./TypeRail";
import { stageMobileCss } from "./stage-mobile-css";
import { createFetchTransport, useChatWidget } from "rift-ds/chat";
import { SiteChatProvider } from "@/components/SiteChat/SiteChatProvider";
import { SegmentedControl } from "rift-ds/components/SegmentedControl/SegmentedControl";
import { ShaderField } from "rift-ds/components/ShaderField/ShaderField";
import { InspectorDropdown } from "rift-ds/components/Inspector/InspectorDropdown";
import { InspectorInput } from "rift-ds/components/Inspector/InspectorInput";
import { InspectorSection } from "rift-ds/components/Inspector/InspectorSection";
import { InspectorSegmentedControl } from "rift-ds/components/Inspector/InspectorSegmentedControl";
import { InspectorSlider } from "rift-ds/components/Inspector/InspectorSlider";
import { InspectorToggleSwitch } from "rift-ds/components/Inspector/InspectorToggleSwitch";
import { ToggleSwitch } from "rift-ds/components/ToggleSwitch/ToggleSwitch";
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
import SurfacesSection from "./sections/SurfacesSection";
import ChartsSection from "./sections/ChartsSection";
import OverlaysSection from "./sections/OverlaysSection";
import FeedbackSection from "./sections/FeedbackSection";

/* The tool's four lenses on the same theme state. One page, one set of
   levers — switching views never resets what you've styled. */
type View = "components" | "type" | "chat" | "templates";
const VIEWS = [
  { value: "components", label: "Components" },
  { value: "type", label: "Typography" },
  { value: "chat", label: "AI Chat" },
  { value: "templates", label: "Templates" },
];

/* Below the tool's desktop breakpoint there is no room for the edge
   panel: the controls move into a bottom Drawer summoned by a fixed pill,
   and the workspace gets the whole screen. Must match the breakpoint in
   page.module.css. */
const COMPACT_QUERY = mediaBelow(BREAKPOINT_STAGE_COMPACT_PX);
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
  const { reset } = useChatWidget();
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

/**
 * Extras with the ambient blob colours removed. A preset may tune its
 * background field apart from its accents; once the accents are picked by
 * hand or sampled from an image, the blobs go back to following them, or
 * the accent lever would stop moving the background it is shown beside.
 */
const withoutAmbient = (extras?: Overrides): Overrides | undefined => {
  if (!extras) return extras;
  const kept = Object.fromEntries(
    Object.entries(extras).filter(([name]) => !name.startsWith("--color-ambient-"))
  );
  return Object.keys(kept).length > 0 ? kept : undefined;
};

/** Where the playground remembers whether the dot grid is showing. */
const DOT_GRID_KEY = "playground-dot-grid";

/** What the source card says when a DESIGN.md cannot be read. A text file
    with nothing recognisable is not one of these: it reads as the base
    theme, with every lever reported kept. */
const DESIGN_MD_REJECTIONS: Record<DesignMdRejection, string> = {
  type: "That kind of file is not read here. Drop a .md or .txt file, or an image.",
  size: `That file is over ${DESIGN_MD_MAX_BYTES / 1024}KB, which is far longer than a DESIGN.md runs.`,
  binary: "That file is not plain text, so it was not read.",
};

/** Extras with every override under the given prefixes removed: how a
    hand-moved lever takes its tokens back from an imported DESIGN.md. */
const withoutPrefixes = (
  extras: Overrides | undefined,
  prefixes: string[]
): Overrides | undefined => {
  if (!extras) return extras;
  const kept = Object.fromEntries(
    Object.entries(extras).filter(([name]) => !prefixes.some((p) => name.startsWith(p)))
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
  const [autoplay, setAutoplay] = useState(false);
  useEffect(() => {
    // The setState here is intentional — a once-on-mount sync from the
    // URL, which the server prerender can't see (same pattern as
    // MegaNav's navigation effect).
    const params = new URLSearchParams(window.location.search);
    const q = params.get("view");
    /* ?autoplay=1 is the home page's embed: the Chat view plays its
       scripted reel on a loop (ChatAutoplay). */
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAutoplay(params.get("autoplay") === "1");
    if (q === "chat" || q === "type" || q === "templates") setView(q);
    /* The Templates view was the Dashboard view, and links to it remain. */
    else if (q === "dashboard") setView("templates");
  }, []);
  /* Flipped on every view switch: the layout swaps between two copies of
     the entrance keyframes, so the panels and the stage arrive again
     without remounting (see data-enter in the CSS). */
  const [enterAlt, setEnterAlt] = useState(false);
  const pickView = (value: string) => {
    if (value !== view) setEnterAlt((alt) => !alt);
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
        : /* The demo script, whose replies carry the cards the provider's
             renderers draw (a plan, a chart, a diff, a tool call) and end
             in follow-up chips or a question to answer. */
          createDemoTransport(),
    [transportMode]
  );
  const [stageSize, setStageSize] = useState<StageSize>("desktop");
  /* The dragged widget size lives here so it survives a switch to the
     Components view and back; like every lever, it dies with the page. */
  const [chatManual, setChatManual] = useState<{ w?: number; h?: number }>({});
  const [chatPlaceholder, setChatPlaceholder] = useState("");
  const [welcome, setWelcome] = useState<ChatWelcomeVariant>("dashboard");
  /* Which way the conversation reads: the widget's top-down default, or the
     classic bottom-up thread. */
  const [chatFlow, setChatFlow] = useState<"top-down" | "bottom-up">("top-down");
  /* The staged thread furniture, feature by feature. The stage opens with
     every extra on and the dashboard welcome, the fullest version of the
     widget; switching them off walks back to the simple rail the live site
     ships. Simulated transport only, like the rail itself. */
  const [railProjects, setRailProjects] = useState(true);
  const [railPins, setRailPins] = useState(true);
  const [railDetails, setRailDetails] = useState(true);
  const [railTabs, setRailTabs] = useState(true);
  /* The agent rail, on with the rest of the staged furniture. */
  const [agentRail, setAgentRail] = useState(true);
  /* The artifact panel, an extra like the rest: on, a reply that makes
     something leaves a tile and the header gains its button; off, none of
     it exists and the director's artifact events stand down with it. */
  const [artifactPanel, setArtifactPanel] = useState(true);
  /* The chat director's reset: every chat setup lever back where the stage
     opens (the director clears the conversation itself). */
  const resetChatSetup = () => {
    setTransportMode("sim");
    setChatPlaceholder("");
    setWelcome("dashboard");
    setChatFlow("top-down");
    setRailProjects(true);
    setRailPins(true);
    setRailDetails(true);
    setRailTabs(true);
    setAgentRail(true);
    setArtifactPanel(true);
  };
  /* The floating rails can each fold into their toggle; the layout reads
     the flags to hand the freed room to the workspace. */
  const [themeRailCollapsed, setThemeRailCollapsed] = useState(false);
  /* The right rail's fold, shared by the two views that seat one (the chat
     director and the templates rail), since they hold the same seat. */
  const [rightRailCollapsed, setRightRailCollapsed] = useState(false);
  /* The template the Templates view stages, kept across view switches and
     mirrored into ?template=<slug> (the route's last segment) the way the
     view is, so a staged template can be linked. A slug the stage cannot
     run is ignored, leaving the default. A link that names a template but
     no view opens on the Templates view, since that is the only place a
     template shows. */
  const [templateHref, setTemplateHref] = useState(DEFAULT_TEMPLATE_HREF);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get("template");
    const linked = slug && STAGE_TEMPLATES.find((t) => t.href === `/templates/${slug}`);
    if (!linked) return;
    // Once-on-mount sync from the URL, the view effect's pattern above.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTemplateHref(linked.href);
    if (!params.get("view")) {
      setView("templates");
      const url = new URL(window.location.href);
      url.searchParams.set("view", "templates");
      window.history.replaceState(null, "", url);
    }
  }, []);
  const pickTemplate = (href: string) => {
    setTemplateHref(href);
    const url = new URL(window.location.href);
    if (href === DEFAULT_TEMPLATE_HREF) url.searchParams.delete("template");
    else url.searchParams.set("template", href.split("/").pop() ?? "");
    window.history.replaceState(null, "", url);
  };
  /* The Components and Type views' own rails: viewing choices, kept
     across view switches like the levers, never part of the theme. */
  const [componentsView, setComponentsView] = useState<ComponentsRailState>({
    hidden: new Set(),
    surface: "page",
  });
  const [typeView, setTypeView] = useState<TypeRailState>({
    sample: DEFAULT_TYPE_SAMPLE.value,
    heading: DEFAULT_TYPE_SAMPLE.heading,
    body: DEFAULT_TYPE_SAMPLE.body,
    hiddenTiers: new Set(),
  });

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
  const [preset, setPreset] = useState(BASE_THEME_ID);
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
  const [displayWeight, setDisplayWeight] = useState(SHIPPED_DISPLAY_WEIGHT);
  const [headingWeight, setHeadingWeight] = useState(SHIPPED_HEADING_WEIGHT);
  const [bodyWeight, setBodyWeight] = useState(SHIPPED_BODY_WEIGHT);
  const [tracking, setTracking] = useState(0); // percent of an em
  const [iconWeight, setIconWeight] = useState(SHIPPED_ICON_WEIGHT);
  const [iconFill, setIconFill] = useState(false);
  const [displayTone, setDisplayTone] = useState<TextTone>("ink");
  const [headingTone, setHeadingTone] = useState<TextTone>("ink");
  const [logoTone, setLogoTone] = useState<LogoTone>("action");
  const [logoEndTone, setLogoEndTone] = useState<LogoEndTone>("matched");
  const [textTone, setTextTone] = useState<TextTone>("ink");
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
  /* The Templates view reads the lever too, but as which version of the
     template to stage (the phone version draws its own handset), not as a
     column width. */
  const stageMobile =
    view !== "chat" && view !== "templates" && stageSize === "mobile" && !compact;
  const stageCss = stageMobile ? stageMobileCss() : "";
  /* The dotted ground, on by default. Remembered per browser as a viewing
     preference: storage can be blocked, so a read or write that throws
     just leaves the dots on. */
  const [showDots, setShowDots] = useState(true);
  useEffect(() => {
    try {
      // A once-on-mount read of a stored preference the prerender can't see.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (window.localStorage.getItem(DOT_GRID_KEY) === "off") setShowDots(false);
    } catch {}
  }, []);
  const changeShowDots = (next: boolean) => {
    setShowDots(next);
    try {
      window.localStorage.setItem(DOT_GRID_KEY, next ? "on" : "off");
    } catch {}
  };
  const [controlsOpen, setControlsOpen] = useState(false);
  const [advOpen, setAdvOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [advColors, setAdvColors] = useState<AdvancedColorState>(DEFAULT_ADVANCED);
  /* The ambient accent sextet — the six --color-core-accent-* roles,
     which colour chart series 2–7 and, through the --color-ambient-*
     tokens that follow them by default, the background blobs. Seeded by a
     preset, hand-picked in the Advanced colours dialog. */
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
  /* A DESIGN.md is the other kind of theme source: the same drop, the same
     button, read as text in this tab (lib/theme/design-md.ts). One source
     at a time, so each clears the other. */
  const [designSource, setDesignSource] = useState<DesignMdSource | null>(null);

  /** Drops the theme source, picture or DESIGN.md. The levers stay put. */
  const clearImage = () => {
    if (imageUrlRef.current) URL.revokeObjectURL(imageUrlRef.current);
    imageUrlRef.current = null;
    setImageSource(null);
    setDesignSource(null);
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
    Pick<ThemePreset, "brandDark" | "aiGradient" | "ambient" | "ambientField" | "extraOverrides" | "extraOverridesDark">
  >({});

  const syncPresetParam = (value: string) => {
    const url = new URL(window.location.href);
    if (value === "custom") url.searchParams.delete("preset");
    else url.searchParams.set("preset", isBaseTheme(value) ? BASE_THEME_ID : value);
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

  /** Hand the background blobs back to the accents (see withoutAmbient). */
  const releaseAmbient = () =>
    setPresetExtras((e) => ({
      ...e,
      ambient: undefined,
      ambientField: undefined,
      extraOverrides: withoutAmbient(e.extraOverrides),
      extraOverridesDark: withoutAmbient(e.extraOverridesDark),
    }));

  /** Explicitly picking an action colour also retires the inherited
      theme-dependent brand — the pick applies to both themes. The neutral
      swatches are the exception: they carry their own dark-mode value. */
  const pickBrand = (value: string, darkValue?: string) => {
    setPreset("custom");
    /* An imported DESIGN.md may have rebuilt the old action ramp through
       its stated shades and pinned its states; those described the old
       colour, so they go with it. */
    const ramp = actionColorPlan(brand, "light")?.ramp;
    setPresetExtras((e) => ({
      ...e,
      brandDark: darkValue,
      ...(designSource && {
        extraOverrides: withoutPrefixes(e.extraOverrides, [
          "--color-action-",
          ...(ramp && ramp !== "neutral" ? [`--primitive-${ramp}-`] : []),
        ]),
        extraOverridesDark: withoutPrefixes(e.extraOverridesDark, ["--color-action-"]),
      }),
    }));
    setBrand(value);
  };

  /** A hand-moved tint lever takes the neutral scale back from an
      imported DESIGN.md's rebuilt greys, which would otherwise sit over
      the tint and hide every move. */
  const tintLever =
    <T,>(set: (value: T) => void) =>
    (value: T) => {
      if (designSource) {
        setPresetExtras((e) => ({
          ...e,
          extraOverrides: withoutPrefixes(e.extraOverrides, ["--primitive-neutral-"]),
        }));
      }
      asCustom(set)(value);
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
    setDesignSource(null);

    setPreset("custom");
    syncPresetParam("custom");
    /* Everything that would repaint over the sample has to stand down first.
       A theme-dependent brand would override the action colour in dark mode;
       a preset's per-ramp rebases and its hue and saturation levers are
       applied last of all, so they would beat the sampled colour outright;
       and its action-colour extras layer over the derived pointers. The
       AI gradient fades from the sampled colour, since a photo states no
       gradient of its own. The levers the image has no opinion about, from
       radius to typeface, keep their positions. */
    setPresetExtras((e) => ({
      brandDark: undefined,
      aiGradient: "fade",
      extraOverrides: withoutAmbient(withoutActionColours(e.extraOverrides)),
      extraOverridesDark: withoutAmbient(withoutActionColours(e.extraOverridesDark)),
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

  /** A matched face's picker entry, loaded and selectable. A face outside
      the roster joins both pickers for the session, and its stylesheet is
      requested the way the roster's are (removed with them on unmount). */
  const loadMatchedFont = (option: FontOption) => {
    addSessionFont(option);
    const param = option.googleParam;
    if (param && !document.getElementById(`playground-font-${param}`)) {
      const link = document.createElement("link");
      link.id = `playground-font-${param}`;
      link.rel = "stylesheet";
      link.href = googleFontHref(param);
      document.head.appendChild(link);
    }
    return option.label;
  };

  /** Reads a local DESIGN.md and fits every lever it has an opinion about:
      colour, tint, shape, density, type and depth. Unlike a picture, the
      file describes a whole look, so the levers it says nothing about go
      back to the base theme's positions rather than keeping whatever was
      there: the result is the file's look and rift's defaults, nothing
      left over from the last preset. The card's report says which is which. */
  const applyDesignMd = async (file: File) => {
    setImageBusy(true);
    setImageError("");
    const source = await themeFromDesignMd(file);
    setImageBusy(false);
    if ("rejected" in source) {
      setImageError(DESIGN_MD_REJECTIONS[source.rejected]);
      return;
    }

    clearImage();
    setDesignSource(source);
    const t = source.theme;
    setPreset("custom");
    syncPresetParam("custom");
    /* The colours the file states outright ride the extras (the rebuilt
       grey scale, the action ramp and its pinned states) and the status
       families ride the Advanced colours lever, so the export carries
       them like any preset's. The tint stays off: the file's own greys,
       or rift's, never a wash the file did not ask for. */
    setPresetExtras({
      brandDark: t.brandDark,
      aiGradient: t.aiGradient,
      ambientField: t.ambientField,
      extraOverrides: t.extraOverrides,
      extraOverridesDark: t.extraOverridesDark,
    });
    setAdvColors(t.advanced ?? DEFAULT_ADVANCED);
    setBrand(t.brand ?? DEFAULT_BRAND);
    setTintOn(false);
    setTintSeed(DEFAULT_NEUTRAL_SEED);
    setTintStrength(6);
    setAccents(t.accents ?? SHIPPED_ACCENTS);
    setRadiusScale(t.radiusScale ?? 100);
    setPill(t.pill ?? true);
    setDensity(t.density ?? 100);
    setTypeScale(t.typeScale ?? 100);
    setMotionScale(100);
    setElevation(t.elevation ?? "default");
    setDisplayWeight(t.displayWeight ?? SHIPPED_DISPLAY_WEIGHT);
    setHeadingWeight(t.headingWeight ?? SHIPPED_HEADING_WEIGHT);
    setBodyWeight(t.bodyWeight ?? SHIPPED_BODY_WEIGHT);
    setTracking(t.tracking ?? 0);
    setIconWeight(SHIPPED_ICON_WEIGHT);
    setIconFill(false);
    setDisplayTone(t.displayTone ?? "ink");
    setHeadingTone(t.headingTone ?? "ink");
    setLogoTone(t.logoTone ?? "action");
    setLogoEndTone(t.logoEndTone ?? "matched");
    setTextTone("ink");
    setFontLabel(t.bodyFont ? loadMatchedFont(t.bodyFont.option) : FONT_OPTIONS[0].label);
    setHeadingFontLabel(
      t.headingFont ? loadMatchedFont(t.headingFont.option) : HEADING_FONT_OPTIONS[0].label
    );
    /* The Product name stays as the visitor left it: a file is the look to
       be inspired by, not the product being built, so its brand never
       becomes the app's name. Typing it in is the visitor's call. */
    pickView("components");
  };

  /** The one entry point for a dropped or chosen file: a DESIGN.md (.md,
      .markdown or .txt) is read as tokens, a picture as pixels, and
      anything else (a PDF, a document, a spreadsheet) is refused unread. */
  const applySourceFile = (file: File) => {
    if (isDesignMdFile(file)) return applyDesignMd(file);
    if (file.type.startsWith("image/")) return applyImageTheme(file);
    setImageError(DESIGN_MD_REJECTIONS.type);
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
    if (isBaseTheme(value)) {
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
      aiGradient: p.aiGradient,
      ambientField: p.ambientField,
      ambient: p.ambient,
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
    setDisplayWeight(p.displayWeight);
    setHeadingWeight(p.headingWeight);
    setBodyWeight(p.bodyWeight);
    setTracking(p.tracking);
    setIconWeight(p.iconWeight);
    setIconFill(p.iconFill);
    setDisplayTone(p.displayTone);
    setHeadingTone(p.headingTone);
    setLogoTone(p.logoTone);
    setLogoEndTone(p.logoEndTone);
    setTextTone(p.textTone);
    setFontLabel(p.fontLabel);
    setHeadingFontLabel(p.headingFontLabel ?? HEADING_FONT_OPTIONS[0].label);
  };

  /** Reset lands on Smoke, the served default (the raw token files stay
      reachable as the Tide row in the picker), and drops any theme source:
      the rail's reset and the source card's share it. */
  const resetTheme = () => applyPreset(SERVED_THEME_ID);

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

  /* A custom colour for one tone role re-keys the family nearest it (the
     same ramp keys the All colour ramps dialog edits), so the role wears
     that colour wherever it holds contrast; a grey takes the ink. The
     action's own family stays the action lever's, so a pick near it only
     takes the family. */
  const actionRamp = actionPlan?.ramp ?? "teal";
  const pickToneHex = (role: ToneRole | "logoEnd", hex: string) => {
    const ramp = nearestRampFor(hex);
    const tone: TextTone = ramp === "neutral" ? "ink" : (ramp as TextTone);
    if (ramp !== "neutral" && ramp !== actionRamp) {
      setAdvColors((a) => ({ ...a, bases: { ...a.bases, [ramp]: hex.toUpperCase() } }));
    }
    if (role === "logo") setLogoTone(tone);
    else if (role === "logoEnd") setLogoEndTone(tone);
    else if (role === "display") setDisplayTone(tone);
    else if (role === "heading") setHeadingTone(tone);
    else setTextTone(tone);
  };
  /* What each role's custom field shows: a family's key as it stands, the
     ink of the mode in view, or the action colour for the logo's defaults. */
  const toneCustomOf = (tone: LogoTone | LogoEndTone) => {
    if (tone === "action" || tone === "matched") return { hex: effectiveBrand, active: false };
    if (tone === "ink") return { hex: shippedNeutralHex(theme === "dark" ? "01" : "10") ?? "#000000", active: false };
    const base = advColors.bases[tone];
    const key = CHROMATIC_RAMPS.find((ramp) => ramp.name === tone)!.steps.find(([step]) => step === "07")![1];
    return { hex: base ?? key, active: Boolean(base) && tone !== actionRamp };
  };
  const toneCustom = {
    logo: toneCustomOf(logoTone),
    logoEnd: toneCustomOf(logoEndTone),
    display: toneCustomOf(displayTone),
    heading: toneCustomOf(headingTone),
    text: toneCustomOf(textTone),
  };

  const overrides = useMemo<Overrides>(() => {
    const merged: Overrides = {};
    if (actionPlan) {
      Object.assign(merged, actionPlan.primitives, actionPlan.semantics);
    }
    if (presetExtras.aiGradient === "tonal") {
      Object.assign(merged, aiGradientTonalOverrides(actionPlan));
    }
    if (tintOn && tintStrength > 0) {
      Object.assign(merged, neutralOverrides(tintSeed, tintStrength / 100, theme === "dark" ? "dark" : "light"));
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
    Object.assign(merged, weightOverrides(displayWeight, headingWeight, bodyWeight));
    Object.assign(merged, trackingOverrides(tracking));
    Object.assign(merged, iconOverrides(iconWeight, iconFill));
    /* The ambient accents apply whenever any differs from the shipped
       keys — mirroring presetOverrides' placement just before the extras. */
    if (!isAccentsPristine(accents)) {
      Object.assign(merged, accentOverrides(accents));
    }
    presetExtras.ambient?.forEach((hex, i) => {
      merged[`--color-ambient-${i + 1}`] = hex;
    });
    if (presetExtras.extraOverrides) {
      Object.assign(merged, presetExtras.extraOverrides);
    }
    if (theme === "dark" && presetExtras.extraOverridesDark) {
      Object.assign(merged, presetExtras.extraOverridesDark);
    }
    /* The fade reads the fill as the extras leave it, as the composer does. */
    if (presetExtras.aiGradient === "fade") {
      Object.assign(
        merged,
        aiGradientFadeOverrides(merged["--color-action-primary-bg"], theme === "dark" ? "dark" : "light")
      );
    }
    if (presetExtras.ambientField === "fade") {
      Object.assign(
        merged,
        ambientFadeOverrides(merged["--color-action-primary-bg"], theme === "dark" ? "dark" : "light")
      );
    }
    if (!isAdvancedPristine(advColors)) {
      Object.assign(merged, advancedColorOverrides(advColors, merged));
    }
    /* Last, as in the composer: the tones read the ramps as they stand. */
    Object.assign(
      merged,
      tierToneOverrides(
        { logo: logoTone, logoEnd: logoEndTone, display: displayTone, heading: headingTone, text: textTone },
        merged,
        theme === "dark" ? "dark" : "light"
      )
    );
    return merged;
  }, [actionPlan, theme, tintOn, tintSeed, tintStrength, radiusScale, pill, density, typeScale, motionScale, elevation, displayWeight, headingWeight, bodyWeight, tracking, iconWeight, iconFill, logoTone, logoEndTone, displayTone, headingTone, textTone, accents, presetExtras, advColors]);

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
    setPreset(BASE_THEME_ID);
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
    setDisplayWeight(SHIPPED_DISPLAY_WEIGHT);
    setHeadingWeight(SHIPPED_HEADING_WEIGHT);
    setBodyWeight(SHIPPED_BODY_WEIGHT);
    setTracking(0);
    setIconWeight(SHIPPED_ICON_WEIGHT);
    setIconFill(false);
    setDisplayTone("ink");
    setHeadingTone("ink");
    setLogoTone("action");
    setLogoEndTone("matched");
    setTextTone("ink");
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
    if (linked && (isBaseTheme(linked) || THEME_PRESETS[linked])) {
      // A once-on-mount sync from the URL, which the prerender can't
      // see — the same sanctioned pattern as the ?view read above.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      applyPreset(linked);
      return;
    }
    const suspended = suspendedBrandRef.current;
    if (suspended && THEME_PRESETS[suspended]) {
       
      applyPreset(suspended);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* The home page's embed (?autoplay=1) follows the page around it: the
     frame posts the visitor's theme pick and colour mode on every change
     (HomeChatFrame), and the levers take the pick the way the picker
     would. Same origin only; a ref keeps the listener on the latest
     applyPreset without re-subscribing every render. */
  const applyPresetRef = useRef(applyPreset);
  useEffect(() => {
    applyPresetRef.current = applyPreset;
  });
  useEffect(() => {
    if (!autoplay) return;
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      const data = event.data as { type?: string; brand?: string; mode?: string; setting?: string };
      if (data?.type !== EMBED_THEME_MESSAGE) return;
      const root = document.documentElement;
      if (data.mode) root.setAttribute("data-theme", data.mode);
      if (data.setting) root.setAttribute("data-theme-setting", data.setting);
      if (data.brand && (isBaseTheme(data.brand) || THEME_PRESETS[data.brand])) {
        applyPresetRef.current(data.brand);
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [autoplay]);

  /* What leaves the playground: the levers as one complete theme, and the
     three files built from it. The CSS comes from the composer the shipped
     preset stylesheets are written from, once per theme, so :root always
     states the light values and the dark block what differs, whichever
     theme is being previewed (theme-export.ts owns the details). */
  const exported = useMemo(() => {
    const theme = themeFromLevers({
      preset,
      brand,
      brandDark: presetExtras.brandDark,
      tintOn,
      tintSeed,
      tintStrength,
      radiusScale,
      pill,
      density,
      typeScale,
      motionScale,
      elevation,
      displayWeight,
      headingWeight,
      bodyWeight,
      tracking,
      iconWeight,
      iconFill,
      logoTone,
      logoEndTone,
      displayTone,
      headingTone,
      textTone,
      fontLabel,
      headingFontLabel,
      accents,
      advanced: advColors,
      aiGradient: presetExtras.aiGradient,
      ambientField: presetExtras.ambientField,
      ambient: presetExtras.ambient,
      extraOverrides: presetExtras.extraOverrides,
      extraOverridesDark: presetExtras.extraOverridesDark,
    });
    /* A theme read from a DESIGN.md carries its source into the export:
       the file's name, how each lever was matched, and the traits rift
       does not take from it. A preset pick clears the source. */
    const context = {
      productName,
      packageName: PACKAGE_NAME,
      binName: BIN_NAME,
      siteUrl: SITE_URL,
      mcpEndpoint: MCP_ENDPOINT,
      mcpServerName: MCP_SERVER_NAME,
      source: designSource
        ? { name: designSource.name, report: designSource.theme.report, traits: designSource.theme.traits }
        : undefined,
    };
    return {
      css: buildThemeCss(theme),
      agents: buildThemedAgentsMd(theme, context, AGENT_STARTER),
      markdown: buildThemeMarkdown(theme, context),
      prompt: buildAgentPrompt(theme, context),
    };
  }, [preset, brand, presetExtras, tintOn, tintSeed, tintStrength, radiusScale, pill, density, typeScale, motionScale, elevation, displayWeight, headingWeight, bodyWeight, tracking, iconWeight, iconFill, logoTone, logoEndTone, displayTone, headingTone, textTone, fontLabel, headingFontLabel, accents, advColors, productName, designSource]);

  /** Export, from the rail or a source card: opens the dialog on the
      themed AGENTS.md, the one file a coding agent needs. */
  const openExport = () => setExportOpen(true);

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
        <InspectorSegmentedControl
          size="compact"
          label="Flow"
          value={chatFlow}
          options={[
            { value: "top-down", label: "Top down" },
            { value: "bottom-up", label: "Bottom up" },
          ]}
          onValueChange={(value) => setChatFlow(value as "top-down" | "bottom-up")}
        />
      </div>

      <div className={styles.controlGroup}>
        <InspectorInput
          size="compact"
          label="Placeholder"
          placeholder={defaultChatPlaceholder(transportMode === "sim")}
          value={chatPlaceholder}
          onValueChange={setChatPlaceholder}
        />
        <InspectorDropdown
          size="compact"
          label="Welcome"
          value={welcome}
          options={CHAT_WELCOME_OPTIONS}
          onValueChange={(value) => setWelcome(value as ChatWelcomeVariant)}
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
          <h4 className={styles.controlHeading}>Panels</h4>
          <InspectorToggleSwitch
            size="compact"
            label="Agent rail"
            checked={agentRail}
            onCheckedChange={setAgentRail}
          />
          <InspectorToggleSwitch
            size="compact"
            label="Artifact panel"
            checked={artifactPanel}
            onCheckedChange={setArtifactPanel}
          />
        </div>
      )}
    </InspectorSection>
  );

  /* The Components view's shader levers, slotted under the shared ones
     because the banner is the only thing on any stage they move. */
  const shaderLevers = view === "components" && (
    <InspectorSection title="Shader banner">
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
        variant="primary"
        tone="neutral"
        iconLeft="restart_alt"
        disabled={shaderPristine}
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
              displayWeight={displayWeight}
              headingWeight={headingWeight}
              bodyWeight={bodyWeight}
              tracking={tracking}
              iconWeight={iconWeight}
              iconFill={iconFill}
              logoTone={logoTone}
              logoEndTone={logoEndTone}
              displayTone={displayTone}
              headingTone={headingTone}
              textTone={textTone}
              fontLabel={fontLabel}
              headingFontLabel={headingFontLabel}
              productName={productName}
              isPristine={isPristine}
              cssSnippet={exported.css}
              agentsMd={exported.agents}
              themeMd={exported.markdown}
              agentPrompt={exported.prompt}
              onPreset={applyPreset}
              onBrand={pickBrand}
              onTintOn={tintLever(setTintOn)}
              onTintSeed={tintLever(setTintSeed)}
              onTintStrength={tintLever(setTintStrength)}
              onRadiusScale={asCustom(setRadiusScale)}
              onPill={asCustom(setPill)}
              onDensity={asCustom(setDensity)}
              onTypeScale={asCustom(setTypeScale)}
              onMotionScale={asCustom(setMotionScale)}
              onElevation={asCustom(setElevation)}
              onDisplayWeight={asCustom(setDisplayWeight)}
              onHeadingWeight={asCustom(setHeadingWeight)}
              onBodyWeight={asCustom(setBodyWeight)}
              onTracking={asCustom(setTracking)}
              onIconWeight={asCustom(setIconWeight)}
              onIconFill={asCustom(setIconFill)}
              onLogoTone={asCustom(setLogoTone)}
              onLogoEndTone={asCustom(setLogoEndTone)}
              onDisplayTone={asCustom(setDisplayTone)}
              onHeadingTone={asCustom(setHeadingTone)}
              onTextTone={asCustom(setTextTone)}
              toneCustom={toneCustom}
              onToneCustom={(role, hex) => asCustom(() => pickToneHex(role, hex))(undefined)}
              onFontLabel={asCustom(setFontLabel)}
              onHeadingFontLabel={asCustom(setHeadingFontLabel)}
              onProductName={setProductName}
              imageName={designSource?.name ?? imageSource?.name}
              imageBusy={imageBusy}
              imageError={imageError}
              onPickImage={() => imageInputRef.current?.click()}
              onClearImage={clearImage}
              onReset={resetTheme}
              onOpenAdvanced={() => setAdvOpen(true)}
              onExport={openExport}
              collapsed={themeRailCollapsed}
              onCollapsedChange={setThemeRailCollapsed}
              contextual={
                /* On compact screens the chat director has no rail of its
                   own — its levers and events ride in the Drawer with the
                   theme controls. On desktop the right rail owns them. */
                view === "chat" && compact ? (
                  <>
                    {chatLevers}
                    <ChatDirector
                      variant="drawer"
                      live={transportMode === "live"}
                      artifacts={artifactPanel}
                    />
                  </>
                ) : view === "templates" && compact ? (
                  /* The templates rail's picker, the same way. */
                  <TemplatesRail
                    variant="drawer"
                    value={templateHref}
                    onValueChange={pickTemplate}
                  />
                ) : view === "type" && compact ? (
                  /* And the type rail's specimen and tiers. */
                  <TypeRail variant="drawer" state={typeView} onChange={setTypeView} />
                ) : view === "components" && compact ? (
                  /* And the components rail's, after the shader's levers. */
                  <>
                    {shaderLevers}
                    <ComponentsRail
                      variant="drawer"
                      state={componentsView}
                      onChange={setComponentsView}
                    />
                  </>
                ) : (
                  shaderLevers || undefined
                )
              }
            />
  );

  /* The showcase's sections by the components rail's ids. */
  const componentSection = (id: ComponentSectionId) => {
    switch (id) {
      case "charts":
        return <ChartsSection brand={effectiveBrand} />;
      case "maps":
        return <MapsSection />;
      case "data-display":
        return <DataDisplaySection />;
      case "surfaces":
        return <SurfacesSection />;
      case "product-header":
        return <MockNav brandName={productName.trim() || "Acme Corp"} />;
      case "actions":
        return <ActionsSection />;
      case "ai":
        return <AiSection />;
      case "forms":
        return <FormsSection />;
      case "navigation":
        /* A phone-width stage (a real phone or the Mobile preset) gets the
           compact pagination, whose numbered row would overflow it. */
        return <NavigationSection narrow={compact || stageMobile} />;
      case "overlays":
        return <OverlaysSection />;
      case "feedback":
        return <FeedbackSection />;
    }
  };

  return (
    <>
      {/* The stage ground is the dotted working canvas, not the ambient
          field — the shader stands down here (and is staged as a banner in
          the components view instead). */}
      <HiddenBackground />
      <DotBackground dots={showDots} />
      {/* The stage has no visible title; this names the page for screen
          readers and search, one h1 like every other page. */}
      <h1 className={styles.visuallyHidden}>Playground</h1>

      {/* Drag a picture or a DESIGN.md onto any part of the tool and the
          levers move to match it. The file is read in this tab and nowhere
          else. */}
      <ImageThemeDropZone onFile={applySourceFile} rejected={imageError} />
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*,.md,.markdown,.txt"
        className={styles.visuallyHidden}
        tabIndex={-1}
        aria-hidden="true"
        onChange={(event) => {
          const file = event.target.files?.[0];
          // Cleared so choosing the same file twice still fires a change.
          event.target.value = "";
          if (file) applySourceFile(file);
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
      {/* The stage card is the floating seat: free of both edges, sized by
          its grips. The header's Chat position menu docks it from there. */}
      <SiteChatProvider
        transport={transport}
        defaultPlacement="floating"
        renderers={DEMO_RENDERERS}
        artifactRenderers={DEMO_ARTIFACT_RENDERERS}
        /* The staged history behind the rail and the tabs, shaped by the rail
           levers: pins off folds the pinned group away, details off strips
           the rows to titles, projects off hides the section. */
        threads={{
          ...DEMO_THREADS,
          projects: railProjects ? DEMO_PROJECTS : [],
          pins: railPins,
          details: railDetails,
        }}
      >
      <ResetOnTransportChange mode={transportMode} />
      <div
        className={[
          styles.dsLayout,
          view === "chat" && !compact ? styles.dsLayoutChat : "",
          view === "templates" ? styles.dsLayoutTemplates : "",
        ]
          .filter(Boolean)
          .join(" ")}
        data-enter={enterAlt ? "alt" : undefined}
        data-left-rail={themeRailCollapsed ? "collapsed" : undefined}
        data-right-rail={rightRailCollapsed ? "collapsed" : undefined}
      >
        {/* Inside the layout so the bar reads the panel geometry the
            layout declares (--stage-bar-start/-end) and centres on the
            workspace between the floating panels. */}
        {/* The stage's own instruments, in the bottom control bar — the
            normalized set every immersive surface shares: the theme control
            (System, Light, Dark, the header's own setting; the immersive
            format drops the header that carried it) and the desktop/mobile
            stage switch, then this stage's extras. */}
        <StageControlBar label="Stage controls">
          {({ labels }) => (
          <>
          {/* Icons alone on a compact stage, so the bar fits a phone, and
              wherever the labelled bar would run under the side panels. */}
          <StageThemeFlip showLabels={labels && !compact} />
          {/* Desktop rides the stage-size switch and inspect mode beside the
              flip (a phone IS the mobile preset, and inspection is a hover
              interaction); compact screens carry the Drawer summons instead,
              so the bar and the old floating pill can never collide. */}
          {compact ? (
            <>
              <StageControlBarSeparator />
              <StageControlBarActionSlot>
                <Button
                  label="Theme controls"
                  variant="primary"
                  size="compact"
                  iconLeft="tune"
                  onClick={() => setControlsOpen(true)}
                />
              </StageControlBarActionSlot>
            </>
          ) : (
            <>
              <StageControlBarSeparator />
              <SegmentedControl
                segments={[
                  { value: "desktop", label: "Desktop", icon: "desktop_windows" },
                  { value: "mobile", label: "Mobile", icon: "smartphone" },
                ]}
                value={stageSize}
                onValueChange={(value) => {
                  /* A manual drag is a size of its own — switching the stage
                     size discards it rather than resizing around it. */
                  setStageSize(value as StageSize);
                  setChatManual({});
                }}
                size="compact"
                showLabels={labels}
                aria-label="Stage size"
              />
              <StageControlBarSeparator />
              {/* The dotted ground on or off, for judging a theme against
                  its plain page colour. */}
              <span className={styles.barSwitch}>
                <ToggleSwitch
                  checked={showDots}
                  label="Dot grid"
                  showLabel
                  onCheckedChange={changeShowDots}
                />
              </span>
              <StageControlBarSeparator />
              {/* Inspect mode — hover any staged component to see which
                  tokens its computed styles resolve from, including the
                  levers' live overrides, re-read as they land. */}
              <StageControlBarEndSlot>
                <InspectMode desktopOnly />
              </StageControlBarEndSlot>
            </>
          )}
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
          onAccentsChange={asCustom((next: AccentSextet) => {
            releaseAmbient();
            setAccents(next);
          })}
          onResetColors={() => {
            releaseAmbient();
            setAdvColors(DEFAULT_ADVANCED);
            setAccents(SHIPPED_ACCENTS);
          }}
        />

        {/* The theme to take away, from any view: one AGENTS.md, the agent
            starter with this theme and its CSS set in. The rail's copy
            button grabs the CSS alone, or the AGENTS.md, without opening
            this, and its menu the theme's separate pieces too (THEME.md and
            the setup prompt). */}
        <ExportThemeDialog
          open={exportOpen}
          onOpenChange={setExportOpen}
          agents={exported.agents}
        />

        <main
          className={[
            styles.dsContent,
            styles.dsContentEnter,
            /* The stage switch narrows the components and type workspaces
               to a phone-width column — the same lever the Chat view reads
               as its widget preset, so the views agree on what the bar's
               Desktop/Mobile means. */
            stageMobile ? styles.dsContentMobile : "",
            view === "templates" ? styles.dsContentTemplates : "",
          ]
            .filter(Boolean)
            .join(" ")}
          data-stage={stageMobile ? "mobile" : undefined}
          data-surface={view === "components" ? componentsView.surface : undefined}
          id="main-content"
        >
          {/* The phone rules the narrowed column can't trigger, derived
              from the loaded stylesheets and scoped to the stage. */}
          {stageCss && <style>{stageCss}</style>}
          {view === "components" && (
            <>
              {/* No animate-in on the sections: the class creates a
                  stacking context per section, which would let later
                  sections paint over an open Dropdown/Popover in an
                  earlier one. */}
              {/* The ambient shader, demoted from stage backdrop to staged
                  component: the stage's opening banner, on the site's own field
                  config, re-theming live with the levers like everything
                  else, and tuned by its own shader levers in the rail. */}
              <div className={styles.shaderBanner} aria-hidden="true">
                <ShaderField
                  params={shaderParams}
                  blobs={shaderBackground.blobs}
                />
                {/* The product's name over the field in the display style,
                    so the display face, weight and colour levers show at
                    the size they are made for. Decorative here: the mock
                    nav below names the product to assistive tech. */}
                <span className={styles.shaderBannerName}>{productName.trim() || "Acme Corp"}</span>
              </div>
              <div className={styles.navStage}>
                {/* The theme's source sits under the banner, pushing
                    everything below it down, all of it re-themed. */}
                {imageSource && (
                  <ImageThemeCard
                    source={imageSource}
                    onExport={openExport}
                    onReplace={() => imageInputRef.current?.click()}
                    onReset={resetTheme}
                  />
                )}
                {/* With no source yet, the stage opens on the invitation to
                    bring one, with a working dropzone. */}
                {!imageSource && !designSource && (
                  <ThemeSourceInvite
                    onFile={applySourceFile}
                    busy={imageBusy}
                    error={imageError}
                  />
                )}
                {designSource && (
                  <DesignMdCard
                    source={designSource}
                    onExport={openExport}
                    onReplace={() => imageInputRef.current?.click()}
                    onReset={resetTheme}
                  />
                )}
              </div>
              {/* The sections with no buttons come first, so the source
                  card's own buttons (Reset, Upload new, Export theme) are
                  the only ones in view as the stage opens and nothing
                  near them competes for the click. The white-label header
                  and the action showcase follow. */}
              {/* In the components rail's order, less the sections it has
                  switched off. Each sits in a wrapper the rail can scroll
                  to. */}
              {COMPONENT_SECTIONS.filter(({ id }) => !componentsView.hidden.has(id)).map(({ id }) => (
                <div key={id} id={sectionAnchor(id)} className={styles.sectionAnchor}>
                  {componentSection(id)}
                </div>
              ))}
            </>
          )}

          {/* The Type view: the full ramp as a live specimen sheet, with
              the heading and body family roles resolved per step. The
              stage flag re-reads the labels when the phone step-down
              lands, since no root mutation or resize announces it. */}
          {view === "type" && (
            <TypeView
              stageMobile={stageMobile}
              headingSample={typeView.heading}
              bodySample={typeView.body}
              hiddenTiers={typeView.hiddenTiers}
            />
          )}

          {/* The Templates view: the picked template, live in a frame that
              mirrors the levers, on the Chat view's stage. Desktop/Mobile
              picks the app or its phone version in the bezel; a phone
              always gets the phone version, bare. */}
          {view === "templates" && (
            <TemplatesView
              template={templateHref}
              size={compact ? "mobile" : stageSize}
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
              welcome={welcome}
              flow={chatFlow}
              manual={chatManual}
              onManual={(next) => setChatManual((m) => ({ ...m, ...next }))}
              allowFullscreen={!compact}
              simControls={transportMode === "sim"}
              railTabs={railTabs}
              agentRail={agentRail}
              artifactPanel={artifactPanel}
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
            artifacts={artifactPanel}
            onResetSetup={resetChatSetup}
            collapsed={rightRailCollapsed}
            onCollapsedChange={setRightRailCollapsed}
          />
        )}

        {/* The components and type rails: each view's own panel, in the
            same right seat. Compact screens get them in the Drawer. */}
        {view === "components" && !compact && (
          <ComponentsRail
            variant="panel"
            state={componentsView}
            onChange={setComponentsView}
            collapsed={rightRailCollapsed}
            onCollapsedChange={setRightRailCollapsed}
          />
        )}
        {view === "type" && !compact && (
          <TypeRail
            variant="panel"
            state={typeView}
            onChange={setTypeView}
            collapsed={rightRailCollapsed}
            onCollapsedChange={setRightRailCollapsed}
          />
        )}

        {/* The templates rail: the Templates view's own panel, in the chat
            director's seat. Compact screens get the picker in the Drawer. */}
        {view === "templates" && !compact && (
          <TemplatesRail
            variant="panel"
            value={templateHref}
            onValueChange={pickTemplate}
            collapsed={rightRailCollapsed}
            onCollapsedChange={setRightRailCollapsed}
          />
        )}
      </div>
      {view === "chat" && autoplay && <ChatAutoplay />}
      </SiteChatProvider>

    </>
  );
}
