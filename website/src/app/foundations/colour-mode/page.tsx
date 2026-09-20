"use client";

import { useSyncExternalStore } from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import Sidebar from "../../../components/Sidebar/Sidebar";
import { ColourSwatch } from "@robr0/design-system/components/ColourSwatch/ColourSwatch";
import PageLinks from "../../../components/PageLinks/PageLinks";
import { getSidebarLinks, foundationsSidebarLinks } from "@/config/navigation";
import styles from "./page.module.css";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import { TOKEN_COUNTS } from "@robr0/design-system/tokens/registry";

const { sidebarLinks } = getSidebarLinks(foundationsSidebarLinks, "/foundations/colour-mode");

/* ============================================
   COLOUR DATA
   Each swatch defines its values per theme.
   Static swatches use the same values in both.
   ============================================ */

interface SwatchData {
  label: string;
  cssVar: string;
  dark: { primitive: string; hex: string; rgb: string };
  light: { primitive: string; hex: string; rgb: string };
}

interface StatusSwatchData {
  label: string;
  bgVar: string;
  borderVar: string;
  dark: { primitive: string; hex: string; rgb: string };
  light: { primitive: string; hex: string; rgb: string };
}

/* --- Primary UI --- */
const primaryUiColours: SwatchData[] = [
  {
    label: "Primary", cssVar: "--color-core-ui-primary",
    dark: { primitive: "--teal--05--", hex: "#3CA5C6", rgb: "60 / 165 / 198" },
    light: { primitive: "--teal--08--", hex: "#0E6E8F", rgb: "14 / 110 / 143" },
  },
  {
    label: "Secondary", cssVar: "--color-core-ui-secondary",
    dark: { primitive: "--teal--09--", hex: "#0A4E66", rgb: "10 / 78 / 102" },
    light: { primitive: "--teal--10--", hex: "#052F3E", rgb: "5 / 47 / 62" },
  },
];

/* --- Accent --- */
const accentColours: SwatchData[] = [
  {
    label: "Coral", cssVar: "--color-core-accent-coral",
    dark: { primitive: "--red--07--", hex: "#EF476F", rgb: "239 / 71 / 111" },
    light: { primitive: "--red--07--", hex: "#EF476F", rgb: "239 / 71 / 111" },
  },
  {
    label: "Amber", cssVar: "--color-core-accent-amber",
    dark: { primitive: "--orange--07--", hex: "#EF8247", rgb: "239 / 130 / 71" },
    light: { primitive: "--orange--07--", hex: "#EF8247", rgb: "239 / 130 / 71" },
  },
  {
    label: "Gold", cssVar: "--color-core-accent-gold",
    dark: { primitive: "--yellow--07--", hex: "#FFD166", rgb: "255 / 209 / 102" },
    light: { primitive: "--yellow--07--", hex: "#FFD166", rgb: "255 / 209 / 102" },
  },
  {
    label: "Violet", cssVar: "--color-core-accent-violet",
    dark: { primitive: "--purple--07--", hex: "#9E47EF", rgb: "158 / 71 / 239" },
    light: { primitive: "--purple--07--", hex: "#9E47EF", rgb: "158 / 71 / 239" },
  },
  {
    label: "Cobalt", cssVar: "--color-core-accent-cobalt",
    dark: { primitive: "--blue--07--", hex: "#1E47B0", rgb: "30 / 71 / 176" },
    light: { primitive: "--blue--07--", hex: "#1E47B0", rgb: "30 / 71 / 176" },
  },
  {
    label: "Mint", cssVar: "--color-core-accent-mint",
    dark: { primitive: "--green--07--", hex: "#06D6A0", rgb: "6 / 214 / 160" },
    light: { primitive: "--green--07--", hex: "#06D6A0", rgb: "6 / 214 / 160" },
  },
];

/* --- Page --- */
const pageColours: SwatchData[] = [
  {
    label: "Primary", cssVar: "--color-bg-page-primary",
    dark: { primitive: "--neutral--10--", hex: "#050505", rgb: "5 / 5 / 5" },
    light: { primitive: "--neutral--01--", hex: "#F1F1F1", rgb: "241 / 241 / 241" },
  },
  {
    label: "Inverse", cssVar: "--color-bg-page-inverse",
    dark: { primitive: "--neutral--01--", hex: "#F1F1F1", rgb: "241 / 241 / 241" },
    light: { primitive: "--neutral--10--", hex: "#050505", rgb: "5 / 5 / 5" },
  },
];

/* --- Container --- */
const containerColours: SwatchData[] = [
  {
    label: "Primary", cssVar: "--color-bg-container-primary",
    dark: { primitive: "--neutral--09-semi--", hex: "rgba(14,14,14,0.8)", rgb: "14 / 14 / 14" },
    light: { primitive: "--neutral--00--", hex: "#FFFFFF", rgb: "255 / 255 / 255" },
  },
  {
    label: "Secondary", cssVar: "--color-bg-container-secondary",
    dark: { primitive: "--neutral--07--", hex: "#303030", rgb: "48 / 48 / 48" },
    light: { primitive: "--neutral--01--", hex: "#F1F1F1", rgb: "241 / 241 / 241" },
  },
  {
    label: "Tertiary", cssVar: "--color-bg-container-tertiary",
    dark: { primitive: "--neutral--08--", hex: "#232323", rgb: "35 / 35 / 35" },
    light: { primitive: "--neutral--02--", hex: "#D6D6D6", rgb: "214 / 214 / 214" },
  },
  {
    label: "Inverse", cssVar: "--color-bg-container-inverse",
    dark: { primitive: "--neutral--01--", hex: "#F1F1F1", rgb: "241 / 241 / 241" },
    light: { primitive: "--neutral--09--", hex: "#0E0E0E", rgb: "14 / 14 / 14" },
  },
  {
    label: "Primary Semi", cssVar: "--color-bg-container-primary-semi",
    dark: { primitive: "--neutral--09-semi-transparent--", hex: "rgba(14,14,14,0.6)", rgb: "14 / 14 / 14" },
    light: { primitive: "--neutral--00-glass--", hex: "rgba(255,255,255,0.9)", rgb: "255 / 255 / 255" },
  },
  {
    label: "Primary Transparent", cssVar: "--color-bg-container-primary-transparent",
    dark: { primitive: "--neutral--09-transparent--", hex: "rgba(14,14,14,0.01)", rgb: "Transparent" },
    light: { primitive: "--neutral--00-transparent--", hex: "rgba(255,255,255,0.01)", rgb: "Transparent" },
  },
  {
    label: "Border", cssVar: "--color-bg-container-border",
    dark: { primitive: "--neutral--08--", hex: "#232323", rgb: "35 / 35 / 35" },
    light: { primitive: "--neutral--02--", hex: "#D6D6D6", rgb: "214 / 214 / 214" },
  },
  {
    label: "Glass", cssVar: "--color-bg-glass",
    dark: { primitive: "--neutral--09-glass--", hex: "rgba(14,14,14,0.66)", rgb: "14 / 14 / 14" },
    light: { primitive: "--neutral--00-glass--", hex: "rgba(255,255,255,0.9)", rgb: "255 / 255 / 255" },
  },
];

/* --- Trend --- */
const trendColours: SwatchData[] = [
  {
    label: "Up", cssVar: "--color-trend-up",
    dark: { primitive: "--green--07--", hex: "#06D6A0", rgb: "6 / 214 / 160" },
    light: { primitive: "--green--10--", hex: "#024336", rgb: "2 / 67 / 54" },
  },
  {
    label: "Down", cssVar: "--color-trend-down",
    dark: { primitive: "--red--07--", hex: "#EF476F", rgb: "239 / 71 / 111" },
    light: { primitive: "--red--10--", hex: "#571727", rgb: "87 / 23 / 39" },
  },
];

/* --- Chat surfaces --- */
const chatSurfaceColours: SwatchData[] = [
  {
    label: "Sent bg", cssVar: "--color-chat-bubble-sent-bg",
    dark: { primitive: "--neutral--07--", hex: "#303030", rgb: "48 / 48 / 48" },
    light: { primitive: "--neutral--01--", hex: "#F1F1F1", rgb: "241 / 241 / 241" },
  },
  {
    label: "Sent text", cssVar: "--color-chat-bubble-sent-text",
    dark: { primitive: "--neutral--01--", hex: "#F1F1F1", rgb: "241 / 241 / 241" },
    light: { primitive: "--neutral--10--", hex: "#050505", rgb: "5 / 5 / 5" },
  },
  {
    label: "Received bg", cssVar: "--color-chat-bubble-received-bg",
    dark: { primitive: "--neutral--07--", hex: "#303030", rgb: "48 / 48 / 48" },
    light: { primitive: "--neutral--01--", hex: "#F1F1F1", rgb: "241 / 241 / 241" },
  },
  {
    label: "Received text", cssVar: "--color-chat-bubble-received-text",
    dark: { primitive: "--neutral--01--", hex: "#F1F1F1", rgb: "241 / 241 / 241" },
    light: { primitive: "--neutral--10--", hex: "#050505", rgb: "5 / 5 / 5" },
  },
  {
    label: "Context bg", cssVar: "--color-chat-context-bg",
    dark: { primitive: "--neutral--09--", hex: "#0E0E0E", rgb: "14 / 14 / 14" },
    light: { primitive: "--neutral--01--", hex: "#F1F1F1", rgb: "241 / 241 / 241" },
  },
];

/* --- Calendar surfaces --- */
const calendarSurfaceColours: SwatchData[] = [
  {
    label: "Cell bg", cssVar: "--color-calendar-cell-bg",
    dark: { primitive: "--neutral--08-semi--", hex: "rgba(35,35,35,0.8)", rgb: "35 / 35 / 35" },
    light: { primitive: "--neutral--01--", hex: "#F1F1F1", rgb: "241 / 241 / 241" },
  },
  {
    label: "Cell bg hover", cssVar: "--color-calendar-cell-bg-hover",
    dark: { primitive: "--neutral--07-semi--", hex: "rgba(48,48,48,0.8)", rgb: "48 / 48 / 48" },
    light: { primitive: "--neutral--02-semi--", hex: "rgba(214,214,214,0.8)", rgb: "214 / 214 / 214" },
  },
  {
    label: "Event bg", cssVar: "--color-calendar-event-bg",
    dark: { primitive: "--neutral--09-semi--", hex: "rgba(14,14,14,0.8)", rgb: "14 / 14 / 14" },
    light: { primitive: "--neutral--00--", hex: "#FFFFFF", rgb: "255 / 255 / 255" },
  },
  {
    label: "Event bg hover", cssVar: "--color-calendar-event-bg-hover",
    dark: { primitive: "--neutral--08-semi--", hex: "rgba(35,35,35,0.8)", rgb: "35 / 35 / 35" },
    light: { primitive: "--neutral--01--", hex: "#F1F1F1", rgb: "241 / 241 / 241" },
  },
  {
    label: "Event border", cssVar: "--color-calendar-event-border",
    dark: { primitive: "--neutral--06--", hex: "#6D6D6D", rgb: "109 / 109 / 109" },
    light: { primitive: "--neutral--04--", hex: "#A2A2A2", rgb: "162 / 162 / 162" },
  },
];

/* --- Text --- */
const textColours: SwatchData[] = [
  {
    label: "Primary", cssVar: "--color-text-primary",
    dark: { primitive: "--neutral--01--", hex: "#F1F1F1", rgb: "241 / 241 / 241" },
    light: { primitive: "--neutral--10--", hex: "#050505", rgb: "5 / 5 / 5" },
  },
  {
    label: "Secondary", cssVar: "--color-text-secondary",
    dark: { primitive: "--neutral--03--", hex: "#BCBCBC", rgb: "188 / 188 / 188" },
    light: { primitive: "--neutral--07--", hex: "#303030", rgb: "48 / 48 / 48" },
  },
  {
    label: "Tertiary", cssVar: "--color-text-tertiary",
    dark: { primitive: "--neutral--04--", hex: "#A2A2A2", rgb: "162 / 162 / 162" },
    light: { primitive: "--neutral--06--", hex: "#6D6D6D", rgb: "109 / 109 / 109" },
  },
  {
    label: "Inverse", cssVar: "--color-text-inverse",
    dark: { primitive: "--neutral--07--", hex: "#303030", rgb: "48 / 48 / 48" },
    light: { primitive: "--neutral--04--", hex: "#A2A2A2", rgb: "162 / 162 / 162" },
  },
  {
    label: "On Inverse", cssVar: "--color-text-on-inverse",
    dark: { primitive: "--neutral--09--", hex: "#0E0E0E", rgb: "14 / 14 / 14" },
    light: { primitive: "--neutral--01--", hex: "#F1F1F1", rgb: "241 / 241 / 241" },
  },
];

/* --- Icon --- */
const iconColours: SwatchData[] = [
  {
    label: "Primary", cssVar: "--color-icon-primary",
    dark: { primitive: "--neutral--02--", hex: "#D6D6D6", rgb: "214 / 214 / 214" },
    light: { primitive: "--neutral--06--", hex: "#6D6D6D", rgb: "109 / 109 / 109" },
  },
  {
    label: "Secondary", cssVar: "--color-icon-secondary",
    dark: { primitive: "--neutral--04--", hex: "#A2A2A2", rgb: "162 / 162 / 162" },
    light: { primitive: "--neutral--04--", hex: "#A2A2A2", rgb: "162 / 162 / 162" },
  },
];

/* --- Overlay & Controls --- */
const overlayControlColours: SwatchData[] = [
  {
    label: "Scrim", cssVar: "--color-scrim",
    dark: { primitive: "--true-black-strong--", hex: "rgba(0,0,0,0.7)", rgb: "0 / 0 / 0" },
    light: { primitive: "--true-black-semi--", hex: "rgba(0,0,0,0.5)", rgb: "0 / 0 / 0" },
  },
  {
    label: "Control Thumb", cssVar: "--color-control-thumb",
    dark: { primitive: "--neutral--01--", hex: "#F1F1F1", rgb: "241 / 241 / 241" },
    light: { primitive: "--neutral--00--", hex: "#FFFFFF", rgb: "255 / 255 / 255" },
  },
  {
    label: "Divider", cssVar: "--color-divider",
    dark: { primitive: "--neutral--08-semi--", hex: "rgba(35,35,35,0.8)", rgb: "35 / 35 / 35" },
    light: { primitive: "--neutral--02-semi--", hex: "rgba(214,214,214,0.8)", rgb: "214 / 214 / 214" },
  },
];

/* --- Action / Primary --- */
const actionPrimaryColours: SwatchData[] = [
  {
    label: "Background Default", cssVar: "--color-action-primary-bg",
    dark: { primitive: "--teal--05--", hex: "#3CA5C6", rgb: "60 / 165 / 198" },
    light: { primitive: "--teal--08--", hex: "#0E6E8F", rgb: "14 / 110 / 143" },
  },
  {
    label: "Background Hover", cssVar: "--color-action-primary-bg-hover",
    dark: { primitive: "--teal--04--", hex: "#6DBCD6", rgb: "109 / 188 / 214" },
    light: { primitive: "--teal--09--", hex: "#0A4E66", rgb: "10 / 78 / 102" },
  },
  {
    label: "Background Active", cssVar: "--color-action-primary-bg-active",
    dark: { primitive: "--teal--03--", hex: "#9ED4E5", rgb: "158 / 212 / 229" },
    light: { primitive: "--teal--10--", hex: "#052F3E", rgb: "5 / 47 / 62" },
  },
  {
    label: "Text Primary", cssVar: "--color-action-primary-text",
    dark: { primitive: "--teal--10--", hex: "#052F3E", rgb: "5 / 47 / 62" },
    light: { primitive: "--teal--02--", hex: "#CFEAF3", rgb: "207 / 234 / 243" },
  },
  {
    label: "Text Secondary", cssVar: "--color-action-primary-text-secondary",
    dark: { primitive: "--teal--10--", hex: "#052F3E", rgb: "5 / 47 / 62" },
    light: { primitive: "--teal--10--", hex: "#052F3E", rgb: "5 / 47 / 62" },
  },
  {
    label: "Text Tertiary", cssVar: "--color-action-primary-text-tertiary",
    dark: { primitive: "--teal--04--", hex: "#6DBCD6", rgb: "109 / 188 / 214" },
    light: { primitive: "--teal--09--", hex: "#0A4E66", rgb: "10 / 78 / 102" },
  },
  {
    label: "Text Active", cssVar: "--color-action-primary-text-active",
    dark: { primitive: "--teal--10--", hex: "#052F3E", rgb: "5 / 47 / 62" },
    light: { primitive: "--neutral--01--", hex: "#F1F1F1", rgb: "241 / 241 / 241" },
  },
  {
    label: "Border Primary", cssVar: "--color-action-primary-border",
    dark: { primitive: "--teal--05--", hex: "#3CA5C6", rgb: "60 / 165 / 198" },
    light: { primitive: "--teal--10--", hex: "#052F3E", rgb: "5 / 47 / 62" },
  },
  {
    label: "Border Secondary", cssVar: "--color-action-primary-border-secondary",
    dark: { primitive: "--teal--06--", hex: "#2C9AB9", rgb: "44 / 154 / 185" },
    light: { primitive: "--teal--08--", hex: "#0E6E8F", rgb: "14 / 110 / 143" },
  },
  {
    label: "Border Tertiary", cssVar: "--color-action-primary-border-tertiary",
    dark: { primitive: "--teal--04--", hex: "#6DBCD6", rgb: "109 / 188 / 214" },
    light: { primitive: "--teal--08--", hex: "#0E6E8F", rgb: "14 / 110 / 143" },
  },
  {
    label: "Icon Default", cssVar: "--color-action-icon-default",
    dark: { primitive: "--neutral--01--", hex: "#F1F1F1", rgb: "241 / 241 / 241" },
    light: { primitive: "--neutral--10--", hex: "#050505", rgb: "5 / 5 / 5" },
  },
  {
    label: "Icon Active", cssVar: "--color-action-icon-active",
    dark: { primitive: "--teal--10--", hex: "#052F3E", rgb: "5 / 47 / 62" },
    light: { primitive: "--teal--02--", hex: "#CFEAF3", rgb: "207 / 234 / 243" },
  },
];

/* --- Action / Passive --- */
const actionPassiveColours: SwatchData[] = [
  {
    label: "Background Default", cssVar: "--color-action-passive-bg",
    dark: { primitive: "--neutral--09-transparent--", hex: "rgba(14,14,14,0.01)", rgb: "Transparent" },
    light: { primitive: "--neutral--01-transparent--", hex: "rgba(241,241,241,0.01)", rgb: "Transparent" },
  },
  {
    label: "Background Hover", cssVar: "--color-action-passive-bg-hover",
    dark: { primitive: "--neutral--08-semi--", hex: "rgba(35,35,35,0.8)", rgb: "35 / 35 / 35" },
    light: { primitive: "--neutral--02-semi--", hex: "rgba(214,214,214,0.8)", rgb: "214 / 214 / 214" },
  },
  {
    label: "Background Active", cssVar: "--color-action-passive-bg-active",
    dark: { primitive: "--neutral--07-semi--", hex: "rgba(48,48,48,0.8)", rgb: "48 / 48 / 48" },
    light: { primitive: "--neutral--03-semi--", hex: "rgba(188,188,188,0.8)", rgb: "188 / 188 / 188" },
  },
  {
    label: "Text Primary", cssVar: "--color-action-passive-text",
    dark: { primitive: "--neutral--01--", hex: "#F1F1F1", rgb: "241 / 241 / 241" },
    light: { primitive: "--neutral--10--", hex: "#050505", rgb: "5 / 5 / 5" },
  },
];

/* --- Action / Neutral --- */
const actionNeutralColours: SwatchData[] = [
  {
    label: "Background Default", cssVar: "--color-action-neutral-bg",
    dark: { primitive: "--neutral--08--", hex: "#232323", rgb: "35 / 35 / 35" },
    light: { primitive: "--neutral--02--", hex: "#D6D6D6", rgb: "214 / 214 / 214" },
  },
  {
    label: "Background Hover", cssVar: "--color-action-neutral-bg-hover",
    dark: { primitive: "--neutral--07--", hex: "#303030", rgb: "48 / 48 / 48" },
    light: { primitive: "--neutral--03--", hex: "#BCBCBC", rgb: "188 / 188 / 188" },
  },
  {
    label: "Background Active", cssVar: "--color-action-neutral-bg-active",
    dark: { primitive: "--neutral--06--", hex: "#6D6D6D", rgb: "109 / 109 / 109" },
    light: { primitive: "--neutral--04--", hex: "#A2A2A2", rgb: "162 / 162 / 162" },
  },
  {
    label: "Text Primary", cssVar: "--color-action-neutral-text",
    dark: { primitive: "--neutral--01--", hex: "#F1F1F1", rgb: "241 / 241 / 241" },
    light: { primitive: "--neutral--10--", hex: "#050505", rgb: "5 / 5 / 5" },
  },
];

/* --- Input --- */
const inputColours: SwatchData[] = [
  {
    label: "Background Default", cssVar: "--color-input-bg-primary",
    dark: { primitive: "--neutral--10--", hex: "#050505", rgb: "5 / 5 / 5" },
    light: { primitive: "--neutral--00--", hex: "#FFFFFF", rgb: "255 / 255 / 255" },
  },
  {
    label: "Background Disabled", cssVar: "--color-input-bg-disabled",
    dark: { primitive: "--neutral--09--", hex: "#0E0E0E", rgb: "14 / 14 / 14" },
    light: { primitive: "--neutral--02--", hex: "#D6D6D6", rgb: "214 / 214 / 214" },
  },
  {
    label: "Border Default", cssVar: "--color-input-border-primary",
    dark: { primitive: "--neutral--08--", hex: "#232323", rgb: "35 / 35 / 35" },
    light: { primitive: "--neutral--02--", hex: "#D6D6D6", rgb: "214 / 214 / 214" },
  },
  {
    label: "Border Hover", cssVar: "--color-input-border-hover",
    dark: { primitive: "--teal--07--", hex: "#118AB2", rgb: "17 / 138 / 178" },
    light: { primitive: "--teal--06--", hex: "#2C9AB9", rgb: "44 / 154 / 185" },
  },
  {
    label: "Border Selected", cssVar: "--color-input-border-selected",
    dark: { primitive: "--teal--06--", hex: "#2C9AB9", rgb: "44 / 154 / 185" },
    light: { primitive: "--teal--08--", hex: "#0E6E8F", rgb: "14 / 110 / 143" },
  },
  {
    label: "Border Disabled", cssVar: "--color-input-border-disabled",
    dark: { primitive: "--neutral--08--", hex: "#232323", rgb: "35 / 35 / 35" },
    light: { primitive: "--neutral--03--", hex: "#BCBCBC", rgb: "188 / 188 / 188" },
  },
  {
    label: "Text Primary", cssVar: "--color-input-text-primary",
    dark: { primitive: "--neutral--01--", hex: "#F1F1F1", rgb: "241 / 241 / 241" },
    light: { primitive: "--neutral--10--", hex: "#050505", rgb: "5 / 5 / 5" },
  },
  {
    label: "Text Placeholder", cssVar: "--color-input-text-placeholder",
    dark: { primitive: "--neutral--04--", hex: "#A2A2A2", rgb: "162 / 162 / 162" },
    light: { primitive: "--neutral--06--", hex: "#6D6D6D", rgb: "109 / 109 / 109" },
  },
  {
    label: "Text Disabled", cssVar: "--color-input-text-disabled",
    dark: { primitive: "--neutral--07--", hex: "#303030", rgb: "48 / 48 / 48" },
    light: { primitive: "--neutral--04--", hex: "#A2A2A2", rgb: "162 / 162 / 162" },
  },
  {
    label: "Text Inverse", cssVar: "--color-input-text-inverse",
    dark: { primitive: "--neutral--07--", hex: "#303030", rgb: "48 / 48 / 48" },
    light: { primitive: "--neutral--04--", hex: "#A2A2A2", rgb: "162 / 162 / 162" },
  },
];

/* --- Status --- */
const statusColours: StatusSwatchData[] = [
  {
    label: "Positive", bgVar: "--color-status-positive-bg", borderVar: "--color-status-positive-border",
    dark: { primitive: "--green--10--", hex: "#024336", rgb: "2 / 67 / 54" },
    light: { primitive: "--green--01--", hex: "#ECFCF7", rgb: "236 / 252 / 247" },
  },
  {
    label: "Warning", bgVar: "--color-status-warning-bg", borderVar: "--color-status-warning-border",
    dark: { primitive: "--orange--10--", hex: "#552716", rgb: "85 / 39 / 22" },
    light: { primitive: "--orange--01--", hex: "#FFF3EC", rgb: "255 / 243 / 236" },
  },
  {
    label: "Error", bgVar: "--color-status-error-bg", borderVar: "--color-status-error-border",
    dark: { primitive: "--red--10--", hex: "#571727", rgb: "87 / 23 / 39" },
    light: { primitive: "--red--01--", hex: "#FDEFF3", rgb: "253 / 239 / 243" },
  },
  {
    label: "Info", bgVar: "--color-status-info-bg", borderVar: "--color-status-info-border",
    dark: { primitive: "--blue--10--", hex: "#081633", rgb: "8 / 22 / 51" },
    light: { primitive: "--blue--01--", hex: "#EEF3FD", rgb: "238 / 243 / 253" },
  },
  {
    label: "Neutral", bgVar: "--color-status-neutral-bg", borderVar: "--color-status-neutral-border",
    dark: { primitive: "--neutral--08--", hex: "#232323", rgb: "35 / 35 / 35" },
    light: { primitive: "--neutral--02--", hex: "#D6D6D6", rgb: "214 / 214 / 214" },
  },
];

/* --- Status text --- */
const statusTextColours: SwatchData[] = [
  {
    label: "Positive text", cssVar: "--color-status-positive-text",
    dark: { primitive: "--green--01--", hex: "#ECFCF7", rgb: "236 / 252 / 247" },
    light: { primitive: "--green--10--", hex: "#024336", rgb: "2 / 67 / 54" },
  },
  {
    label: "Warning text", cssVar: "--color-status-warning-text",
    dark: { primitive: "--orange--01--", hex: "#FFF3EC", rgb: "255 / 243 / 236" },
    light: { primitive: "--orange--10--", hex: "#552716", rgb: "85 / 39 / 22" },
  },
  {
    label: "Error text", cssVar: "--color-status-error-text",
    dark: { primitive: "--red--01--", hex: "#FDEFF3", rgb: "253 / 239 / 243" },
    light: { primitive: "--red--10--", hex: "#571727", rgb: "87 / 23 / 39" },
  },
  {
    label: "Info text", cssVar: "--color-status-info-text",
    dark: { primitive: "--blue--01--", hex: "#EEF3FD", rgb: "238 / 243 / 253" },
    light: { primitive: "--blue--10--", hex: "#081633", rgb: "8 / 22 / 51" },
  },
  {
    label: "Neutral text", cssVar: "--color-status-neutral-text",
    dark: { primitive: "--neutral--01--", hex: "#F1F1F1", rgb: "241 / 241 / 241" },
    light: { primitive: "--neutral--08--", hex: "#232323", rgb: "35 / 35 / 35" },
  },
];

/* --- Status icons --- */
const statusIconColours: SwatchData[] = [
  {
    label: "Positive icon", cssVar: "--color-status-positive-icon",
    dark: { primitive: "--green--07--", hex: "#06D6A0", rgb: "6 / 214 / 160" },
    light: { primitive: "--green--08--", hex: "#05A67C", rgb: "5 / 166 / 124" },
  },
  {
    label: "Warning icon", cssVar: "--color-status-warning-icon",
    dark: { primitive: "--orange--07--", hex: "#EF8247", rgb: "239 / 130 / 71" },
    light: { primitive: "--orange--08--", hex: "#C65E33", rgb: "198 / 94 / 51" },
  },
  {
    label: "Error icon", cssVar: "--color-status-error-icon",
    dark: { primitive: "--red--06--", hex: "#F16385", rgb: "241 / 99 / 133" },
    light: { primitive: "--red--08--", hex: "#C93A5C", rgb: "201 / 58 / 92" },
  },
  {
    label: "Info icon", cssVar: "--color-status-info-icon",
    dark: { primitive: "--blue--05--", hex: "#5475D4", rgb: "84 / 117 / 212" },
    light: { primitive: "--blue--06--", hex: "#345AC4", rgb: "52 / 90 / 196" },
  },
  {
    label: "Neutral icon", cssVar: "--color-status-neutral-icon",
    dark: { primitive: "--neutral--04--", hex: "#A2A2A2", rgb: "162 / 162 / 162" },
    light: { primitive: "--neutral--06--", hex: "#6D6D6D", rgb: "109 / 109 / 109" },
  },
];

/* --- AI --- */
const aiColours: SwatchData[] = [
  {
    label: "Gradient start", cssVar: "--color-ai-gradient-start",
    dark: { primitive: "--red--05--", hex: "#F37F9B", rgb: "243 / 127 / 155" },
    light: { primitive: "--red--05--", hex: "#F37F9B", rgb: "243 / 127 / 155" },
  },
  {
    label: "Gradient mid", cssVar: "--color-ai-gradient-mid",
    dark: { primitive: "--blue--05--", hex: "#5475D4", rgb: "84 / 117 / 212" },
    light: { primitive: "--blue--05--", hex: "#5475D4", rgb: "84 / 117 / 212" },
  },
  {
    label: "Gradient end", cssVar: "--color-ai-gradient-end",
    dark: { primitive: "--teal--07--", hex: "#118AB2", rgb: "17 / 138 / 178" },
    light: { primitive: "--teal--07--", hex: "#118AB2", rgb: "17 / 138 / 178" },
  },
  {
    label: "Button field", cssVar: "--color-ai-button-bg",
    dark: { primitive: "--true-black--", hex: "#000000", rgb: "0 / 0 / 0" },
    light: { primitive: "--neutral--00--", hex: "#FFFFFF", rgb: "255 / 255 / 255" },
  },
];

/* --- Chart / Contribution --- */
const chartContributionColours: SwatchData[] = [
  {
    label: "Level 0", cssVar: "--color-chart-contribution-0",
    dark: { primitive: "--neutral--08--", hex: "#232323", rgb: "35 / 35 / 35" },
    light: { primitive: "--neutral--00--", hex: "#FFFFFF", rgb: "255 / 255 / 255" },
  },
  {
    label: "Level 1", cssVar: "--color-chart-contribution-1",
    dark: { primitive: "--green--10--", hex: "#024336", rgb: "2 / 67 / 54" },
    light: { primitive: "--green--02--", hex: "#CEF6E8", rgb: "206 / 246 / 232" },
  },
  {
    label: "Level 2", cssVar: "--color-chart-contribution-2",
    dark: { primitive: "--green--09--", hex: "#03765A", rgb: "3 / 118 / 90" },
    light: { primitive: "--green--04--", hex: "#6DE0C0", rgb: "109 / 224 / 192" },
  },
  {
    label: "Level 3", cssVar: "--color-chart-contribution-3",
    dark: { primitive: "--green--08--", hex: "#05A67C", rgb: "5 / 166 / 124" },
    light: { primitive: "--green--07--", hex: "#06D6A0", rgb: "6 / 214 / 160" },
  },
  {
    label: "Level 4", cssVar: "--color-chart-contribution-4",
    dark: { primitive: "--green--07--", hex: "#06D6A0", rgb: "6 / 214 / 160" },
    light: { primitive: "--green--09--", hex: "#03765A", rgb: "3 / 118 / 90" },
  },
];

/* --- Chart / Series --- */
const chartSeriesColours: SwatchData[] = [
  {
    label: "Series 1", cssVar: "--color-chart-series-1",
    dark: { primitive: "--teal--05--", hex: "#3CA5C6", rgb: "60 / 165 / 198" },
    light: { primitive: "--teal--08--", hex: "#0E6E8F", rgb: "14 / 110 / 143" },
  },
  {
    label: "Series 2", cssVar: "--color-chart-series-2",
    dark: { primitive: "--green--07--", hex: "#06D6A0", rgb: "6 / 214 / 160" },
    light: { primitive: "--green--07--", hex: "#06D6A0", rgb: "6 / 214 / 160" },
  },
  {
    label: "Series 3", cssVar: "--color-chart-series-3",
    dark: { primitive: "--yellow--07--", hex: "#FFD166", rgb: "255 / 209 / 102" },
    light: { primitive: "--yellow--07--", hex: "#FFD166", rgb: "255 / 209 / 102" },
  },
  {
    label: "Series 4", cssVar: "--color-chart-series-4",
    dark: { primitive: "--red--07--", hex: "#EF476F", rgb: "239 / 71 / 111" },
    light: { primitive: "--red--07--", hex: "#EF476F", rgb: "239 / 71 / 111" },
  },
  {
    label: "Series 5", cssVar: "--color-chart-series-5",
    dark: { primitive: "--purple--07--", hex: "#9E47EF", rgb: "158 / 71 / 239" },
    light: { primitive: "--purple--07--", hex: "#9E47EF", rgb: "158 / 71 / 239" },
  },
  {
    label: "Series 6", cssVar: "--color-chart-series-6",
    dark: { primitive: "--orange--07--", hex: "#EF8247", rgb: "239 / 130 / 71" },
    light: { primitive: "--orange--07--", hex: "#EF8247", rgb: "239 / 130 / 71" },
  },
  {
    label: "Series 7", cssVar: "--color-chart-series-7",
    dark: { primitive: "--blue--07--", hex: "#1E47B0", rgb: "30 / 71 / 176" },
    light: { primitive: "--blue--07--", hex: "#1E47B0", rgb: "30 / 71 / 176" },
  },
];

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

export default function SemanticColoursPage() {
  const theme = useTheme();

  return (
    <>

      <MegaNav />

      <div className={styles.dsLayout}>
        <Sidebar links={sidebarLinks} />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          {/* Page Title */}
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Semantic colours</h1>
            <PageLinks
              figmaUrl="https://www.figma.com/design/8NzqDS8iRsBTFPbNGj3Woj/robr0-ds26?node-id=113-4831"
              storybookPath="/?path=/docs/foundations-tokens--docs"
            />
          </div>

          {/* Intro */}
          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              Semantic roles that map to primitives per mode
            </p>
            <p className={styles.introBody}>
              Each colour here has a role, like &quot;page background&quot; or &quot;error border&quot;, and maps to a different primitive value depending on whether the UI is in light or dark mode. Components only reference these roles, so switching themes is just swapping which primitives each role points to. Toggle the mode above to see the values change. All {TOKEN_COUNTS.colour} colour tokens are below, grouped by the role they play.
            </p>
          </div>

          {/* Primary UI Colours */}
          <section className={`${styles.colourGroup} animate-in animate-delay-2`}>
            <SectionTitle title="Primary UI colours" />
            <div className={styles.colourSwatches}>
              {primaryUiColours.map((s) => (
                <ColourSwatch key={s.label} label={s.label} cssVar={s.cssVar} dark={s.dark} light={s.light} theme={theme} />
              ))}
            </div>
          </section>

          {/* Accent Colours */}
          <section className={styles.colourGroup}>
            <SectionTitle title="Accent colours" />
            <div className={styles.colourSwatches}>
              {accentColours.map((s) => (
                <ColourSwatch key={s.label} label={s.label} cssVar={s.cssVar} dark={s.dark} light={s.light} theme={theme} />
              ))}
            </div>
          </section>

          {/* Page */}
          <section className={styles.colourGroup}>
            <SectionTitle title="Page" />
            <div className={styles.colourSwatches}>
              {pageColours.map((s) => (
                <ColourSwatch key={s.label} label={s.label} cssVar={s.cssVar} dark={s.dark} light={s.light} theme={theme} />
              ))}
            </div>
          </section>

          {/* Container */}
          <section className={styles.colourGroup}>
            <SectionTitle title="Container" />
            <div className={styles.colourSwatches}>
              {containerColours.map((s) => (
                <ColourSwatch key={s.label} label={s.label} cssVar={s.cssVar} dark={s.dark} light={s.light} theme={theme} />
              ))}
            </div>
          </section>

          {/* Chat surfaces */}
          <section className={styles.colourGroup}>
            <SectionTitle title="Chat surfaces" />
            <div className={styles.colourSwatches}>
              {chatSurfaceColours.map((s) => (
                <ColourSwatch key={s.label} label={s.label} cssVar={s.cssVar} dark={s.dark} light={s.light} theme={theme} />
              ))}
            </div>
          </section>

          {/* Calendar surfaces */}
          <section className={styles.colourGroup}>
            <SectionTitle title="Calendar surfaces" />
            <div className={styles.colourSwatches}>
              {calendarSurfaceColours.map((s) => (
                <ColourSwatch key={s.label} label={s.label} cssVar={s.cssVar} dark={s.dark} light={s.light} theme={theme} />
              ))}
            </div>
          </section>

          {/* Text */}
          <section className={styles.colourGroup}>
            <SectionTitle title="Text" />
            <div className={styles.colourSwatches}>
              {textColours.map((s) => (
                <ColourSwatch key={s.label} label={s.label} cssVar={s.cssVar} dark={s.dark} light={s.light} theme={theme} />
              ))}
            </div>
          </section>

          {/* Icon */}
          <section className={styles.colourGroup}>
            <SectionTitle title="Icon" />
            <div className={styles.colourSwatches}>
              {iconColours.map((s) => (
                <ColourSwatch key={s.label} label={s.label} cssVar={s.cssVar} dark={s.dark} light={s.light} theme={theme} />
              ))}
            </div>
          </section>

          {/* Action / Primary */}
          <section className={styles.colourGroup}>
            <SectionTitle title="Action / primary" />
            <div className={styles.colourSwatches}>
              {actionPrimaryColours.map((s) => (
                <ColourSwatch key={s.label} label={s.label} cssVar={s.cssVar} dark={s.dark} light={s.light} theme={theme} />
              ))}
            </div>
          </section>

          {/* Action / Passive */}
          <section className={styles.colourGroup}>
            <SectionTitle title="Action / passive" />
            <div className={styles.colourSwatches}>
              {actionPassiveColours.map((s) => (
                <ColourSwatch key={s.label} label={s.label} cssVar={s.cssVar} dark={s.dark} light={s.light} theme={theme} />
              ))}
            </div>
          </section>

          {/* Action / Neutral */}
          <section className={styles.colourGroup}>
            <SectionTitle title="Action / neutral" />
            <div className={styles.colourSwatches}>
              {actionNeutralColours.map((s) => (
                <ColourSwatch key={s.label} label={s.label} cssVar={s.cssVar} dark={s.dark} light={s.light} theme={theme} />
              ))}
            </div>
          </section>

          {/* Input */}
          <section className={styles.colourGroup}>
            <SectionTitle title="Input" />
            <div className={styles.colourSwatches}>
              {inputColours.map((s) => (
                <ColourSwatch key={s.label} label={s.label} cssVar={s.cssVar} dark={s.dark} light={s.light} theme={theme} />
              ))}
            </div>
          </section>

          {/* Overlay & Controls */}
          <section className={styles.colourGroup}>
            <SectionTitle title="Overlay & controls" />
            <div className={styles.colourSwatches}>
              {overlayControlColours.map((s) => (
                <ColourSwatch key={s.label} label={s.label} cssVar={s.cssVar} dark={s.dark} light={s.light} theme={theme} />
              ))}
            </div>
          </section>

          {/* Status */}
          <section className={styles.colourGroup}>
            <SectionTitle title="Status" />
            <div className={styles.colourSwatches}>
              {statusColours.map((s) => (
                <ColourSwatch key={s.label} label={s.label} cssVar={s.bgVar} dark={s.dark} light={s.light} theme={theme} status borderVar={s.borderVar} />
              ))}
              {statusTextColours.map((s) => (
                <ColourSwatch key={s.label} label={s.label} cssVar={s.cssVar} dark={s.dark} light={s.light} theme={theme} />
              ))}
              {statusIconColours.map((s) => (
                <ColourSwatch key={s.label} label={s.label} cssVar={s.cssVar} dark={s.dark} light={s.light} theme={theme} />
              ))}
            </div>
          </section>

          {/* Trend */}
          <section className={styles.colourGroup}>
            <SectionTitle title="Trend" />
            <div className={styles.colourSwatches}>
              {trendColours.map((s) => (
                <ColourSwatch key={s.label} label={s.label} cssVar={s.cssVar} dark={s.dark} light={s.light} theme={theme} />
              ))}
            </div>
          </section>

          {/* AI */}
          <section className={styles.colourGroup}>
            <SectionTitle title="AI" />
            <div className={styles.colourSwatches}>
              {aiColours.map((s) => (
                <ColourSwatch key={s.label} label={s.label} cssVar={s.cssVar} dark={s.dark} light={s.light} theme={theme} />
              ))}
            </div>
          </section>

          {/* Chart / Contribution */}
          <section className={styles.colourGroup}>
            <SectionTitle title="Chart / contribution" />
            <div className={styles.colourSwatches}>
              {chartContributionColours.map((s) => (
                <ColourSwatch key={s.label} label={s.label} cssVar={s.cssVar} dark={s.dark} light={s.light} theme={theme} />
              ))}
            </div>
          </section>

          {/* Chart / Series */}
          <section className={styles.colourGroup}>
            <SectionTitle title="Chart / series" />
            <div className={styles.colourSwatches}>
              {chartSeriesColours.map((s) => (
                <ColourSwatch key={s.label} label={s.label} cssVar={s.cssVar} dark={s.dark} light={s.light} theme={theme} />
              ))}
            </div>
          </section>
        </main>
      </div>

    </>
  );
}
