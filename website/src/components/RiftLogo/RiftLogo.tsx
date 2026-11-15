import { useId } from "react";
import {
  RIFT_LOGO_DS,
  RIFT_LOGO_FRINGE,
  RIFT_LOGO_HOT,
  RIFT_LOGO_LETTERS,
  RIFT_LOGO_RIBBON,
  RIFT_LOGO_VIEW_BOX,
} from "./paths";
import styles from "./RiftLogo.module.css";

/**
 * The RIFT DS logo, inline, for the header: chrome lettering with the beam
 * running off the bar. It is the crisp cut, with no blur, so it holds at
 * header size. The lettering is filled with the brand mark tokens, the
 * same two the old mark's gradient read, so it takes each theme's logo
 * tone in light and dark alike; DS takes the text colour. The beam is the
 * brand's own light and keeps its colours under every theme. The paths
 * live beside this file in paths.ts.
 */
export default function RiftLogo({
  className,
  label = "Rift DS",
}: {
  className?: string;
  /** The accessible name of the logo. */
  label?: string;
}) {
  /* The logo renders in the header bar and again in the drawer, so every
     gradient id is per instance. */
  const id = useId();
  const chrome = `${id}-chrome`;
  const ribbon = `${id}-ribbon`;
  const fringe = `${id}-fringe`;
  const hot = `${id}-hot`;
  return (
    <svg
      viewBox={RIFT_LOGO_VIEW_BOX}
      xmlns="http://www.w3.org/2000/svg"
      className={[styles.logo, className].filter(Boolean).join(" ")}
      role="img"
      aria-label={label}
    >
      <defs>
        <linearGradient id={chrome} gradientUnits="userSpaceOnUse" x1="0" y1="-168" x2="0" y2="0">
          {/* The brand mark tokens, as BrandMark reads them: they alias the
              action fill unless a theme gives the logo a tone of its own,
              so the lettering wears whichever theme is on. */}
          <stop offset="0" style={{ stopColor: "var(--color-brand-mark)" }} />
          <stop offset="1" style={{ stopColor: "var(--color-brand-mark-end)" }} />
        </linearGradient>
        <linearGradient id={ribbon} gradientUnits="userSpaceOnUse" x1="552" y1="0" x2="1086" y2="0">
          <stop offset="0" stopColor="#19F3F5" />
          <stop offset="0.16" stopColor="#12FEF8" />
          <stop offset="0.66" stopColor="#16F4F6" />
          <stop offset="0.76" stopColor="#19C8E0" />
          <stop offset="0.87" stopColor="#2A7FD0" stopOpacity="0.45" />
          <stop offset="1" stopColor="#5B4FD0" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={fringe} gradientUnits="userSpaceOnUse" x1="622" y1="0" x2="962" y2="0">
          <stop offset="0" stopColor="#C7F089" stopOpacity="0" />
          <stop offset="0.08" stopColor="#F8DA2B" />
          <stop offset="0.33" stopColor="#F5C431" />
          <stop offset="0.42" stopColor="#F19D5F" />
          <stop offset="0.48" stopColor="#F96069" />
          <stop offset="0.56" stopColor="#FA5DA9" />
          <stop offset="0.68" stopColor="#F86FBD" />
          <stop offset="0.78" stopColor="#EE1E2D" />
          <stop offset="0.9" stopColor="#BE1029" />
          <stop offset="1" stopColor="#BE1029" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={hot} gradientUnits="userSpaceOnUse" x1="580" y1="0" x2="976" y2="0">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0" />
          <stop offset="0.14" stopColor="#FFFFFF" />
          <stop offset="0.8" stopColor="#FFFFFF" stopOpacity="0.95" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={RIFT_LOGO_LETTERS} fill={`url(#${chrome})`} fillRule="evenodd" />
      <path className={styles.ds} d={RIFT_LOGO_DS} fillRule="evenodd" />
      <path d={RIFT_LOGO_FRINGE} fill={`url(#${fringe})`} />
      <path d={RIFT_LOGO_RIBBON} fill={`url(#${ribbon})`} />
      <path className={styles.hot} d={RIFT_LOGO_HOT} fill={`url(#${hot})`} />
    </svg>
  );
}
