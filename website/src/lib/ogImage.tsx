import { ImageResponse } from "next/og";
import shaderBackground from "@/data/shader-background.json";

export const ogImageSize = { width: 1200, height: 630 };
export const ogImageContentType = "image/png";

const LOGO_MARK_PATH =
  "M18.0309 14.98C18.6612 14.8653 19.2184 14.6623 19.7208 14.3712C20.214 14.08 20.6343 13.7358 20.9814 13.3211C21.3285 12.9063 21.5934 12.4387 21.776 11.9269C21.9587 11.4062 22.05 10.8592 22.05 10.2856C22.05 9.22672 21.8034 8.35314 21.3011 7.67368C20.8078 6.99423 20.1775 6.45596 19.4103 6.05889C18.6429 5.6618 17.7935 5.37943 16.8618 5.22942C15.9301 5.07059 15.0258 5 14.158 5L0 5C0 5 1.7355 8.8561 6.49444 8.8561C11.2534 8.8561 14.5417 8.8561 14.5417 8.8561C15.3638 8.8561 16.0123 8.99729 16.4691 9.28849C16.9257 9.57968 17.1541 10.0121 17.1541 10.5856C17.1541 11.1062 16.8983 11.5122 16.3959 11.8033C15.8936 12.1033 15.2725 12.2445 14.5417 12.2445C14.5417 12.2445 7.84631 12.2445 4.28395 12.2445C0.876885 12.2445 1.18745 15.5535 1.18745 15.5535L1.18745 19.8244C1.18745 19.8244 5.93725 19.8068 5.93725 15.9065H13.2263C16.9714 21.2627 23 19.8244 23 19.8244L18.0309 14.98Z";

export type OgTheme = "light" | "dark";

/* The ambient background's blob colours, resolved per theme. The geometry
   (size/cx/cy) comes straight from shader-background.json — the same config
   BlurBackground renders — so a retuned background reaches the share card on
   the next build. The colours have to be resolved by hand because Satori has
   no CSS custom properties: each entry mirrors the blob's token through
   tokens-light/dark.css to its primitive hex. validate-token-references.mjs
   holds this map to the config's token list and to the tokens' per-theme
   values in both directions — the same guard the chart palette's SSR
   fallbacks and the playground's NEUTRALS mirror live under — so a new,
   dropped, or recoloured blob fails the build until this map agrees. */
const BLOB_HEX: Record<string, { light: string; dark: string }> = {
  "--color-core-accent-gold": { light: "#FFD166", dark: "#FFD166" },
  "--color-core-accent-mint": { light: "#06D6A0", dark: "#06D6A0" },
  "--color-core-accent-violet": { light: "#9E47EF", dark: "#9E47EF" },
  "--color-bg-container-secondary": { light: "#F1F1F1", dark: "#303030" },
  "--color-core-accent-cobalt": { light: "#1E47B0", dark: "#1E47B0" },
  "--color-core-accent-coral": { light: "#EF476F", dark: "#EF476F" },
  "--color-core-accent-amber": { light: "#EF8247", dark: "#EF8247" },
  "--color-core-ui-secondary": { light: "#052F3E", dark: "#0A4E66" },
};

/* One static frame of the blob field: each blob becomes a soft radial
   gradient, standing in for the site's `filter: blur(80px); opacity: 0.15`
   discs (Satori has no blur filter). Alpha ramps 26 → 0 over the disc, which
   reads close to the Gaussian falloff at thumbnail size. */
function blobFieldLayers(theme: OgTheme): string {
  const { width, height } = ogImageSize;
  return shaderBackground.blobs
    .map((blob) => {
      const hex = BLOB_HEX[blob.token]?.[theme];
      if (!hex) return null;
      const x = Math.round(blob.cx * width);
      const y = Math.round(blob.cy * height);
      const r = Math.round(blob.size * width * 0.55);
      return `radial-gradient(${r}px circle at ${x}px ${y}px, ${hex}26 0%, ${hex}14 45%, ${hex}00 72%)`;
    })
    .filter(Boolean)
    .join(", ");
}

// Deliberately off-token (Rob, 2026-09-01): the light ground and dark ink stay
// pure white rather than the page-floor/text tokens' #F1F1F1, for crispness at
// link-preview thumbnail size. The bylines and the two #050505 values do match
// their tokens; BLOB_HEX below is the mirror validate-token-references.mjs guards.
const THEME = {
  light: { ground: "#FFFFFF", ink: "#050505", byline: "#0E6E8F" },
  dark: { ground: "#050505", ink: "#FFFFFF", byline: "#3CA5C6" },
} as const;

/**
 * Renders a 1200x630 OG image: the ambient blob field (one static frame of
 * the site's shader background), the logo mark, a title, and a byline of
 * "Robert Ritacca — <kicker>". Used for every dynamic social card on the site.
 *
 * The light theme is the default the routes ship: unfurlers fetch one static
 * image per page (Open Graph has no notion of the viewer's colour scheme), and
 * the light card is the one that cannot be mistaken for a failed load in a
 * dark chat client — the old near-black card shrank to a solid black
 * rectangle in thumbnails. The type is sized to stay legible after that
 * shrink; the byline is each theme's action teal (teal-08 holds AA on white,
 * teal-06 on the dark floor).
 */
export function buildOgImage(
  title: string,
  kicker = "Portfolio",
  theme: OgTheme = "light"
) {
  const colors = THEME[theme];
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          backgroundColor: colors.ground,
          backgroundImage: blobFieldLayers(theme),
        }}
      >
        <svg width="88" height="88" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" clipRule="evenodd" d={LOGO_MARK_PATH} fill="url(#paint0_linear)" />
          <defs>
            <linearGradient id="paint0_linear" x1="3.83825" y1="15.8618" x2="13.4908" y2="5.78849" gradientUnits="userSpaceOnUse">
              <stop stopColor="#2980B9" />
              <stop offset="0.5484" stopColor="#2980B9" />
              <stop offset="1" stopColor="#34495E" />
            </linearGradient>
          </defs>
        </svg>

        <div
          style={{
            display: "flex",
            fontSize: title.length > 26 ? 88 : 112,
            fontWeight: 700,
            color: colors.ink,
            lineHeight: 1.05,
            maxWidth: 1056,
          }}
        >
          {title}
        </div>

        <div style={{ display: "flex", fontSize: 38, fontWeight: 600, color: colors.byline }}>
          Robert Ritacca · {kicker}
        </div>
      </div>
    ),
    { ...ogImageSize }
  );
}

/** Case-study OG image — the byline reads "Robert Ritacca — Case Study". */
export function buildCaseStudyOgImage(title: string) {
  return buildOgImage(title, "Case Study");
}
