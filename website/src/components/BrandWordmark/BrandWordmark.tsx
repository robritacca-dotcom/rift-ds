import {
  BRAND_WORDMARK_ASPECT,
  BRAND_WORDMARK_CAP_RATIO,
  BRAND_WORDMARK_PATH,
  BRAND_WORDMARK_VIEWBOX,
} from "@/config/brand-wordmark";

/**
 * The RIFT wordmark, inline — the same arrangement as BrandMark, and for
 * the same reason: rendered as markup rather than loaded from a file, the
 * fill resolves against the live CSS variables, so the wordmark re-themes
 * with every data-brand swap instead of staying whatever colour the file
 * was saved at.
 *
 * It fills with currentColor, which means it inherits whichever token the
 * surface around it sets rather than naming one itself. In the header that
 * is the logo link's --color-text-primary, so the wordmark is ink in light
 * and white in dark, exactly as the text it replaced.
 *
 * Sized by CAP HEIGHT, not by the box. The slash clears the letters top
 * and bottom, so a wordmark set to 24px tall would draw 11.5px letters
 * next to 24px of everything else. Pass the cap height you want the
 * letters to match and the overhang takes care of itself.
 */
export default function BrandWordmark({
  capHeight = 16,
  className,
  title = "Rift",
  decorative = false,
}: {
  /** Height of the letters themselves, in px. The box drawn is taller. */
  capHeight?: number;
  className?: string;
  /** Accessible name. Ignored when `decorative` is set. */
  title?: string;
  /** Set when adjacent text already names the link, so this is not announced twice. */
  decorative?: boolean;
}) {
  const boxHeight = capHeight / BRAND_WORDMARK_CAP_RATIO;
  const boxWidth = boxHeight * BRAND_WORDMARK_ASPECT;
  return (
    <svg
      width={boxWidth}
      height={boxHeight}
      viewBox={BRAND_WORDMARK_VIEWBOX}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      {...(decorative
        ? { "aria-hidden": true as const }
        : { role: "img", "aria-label": title })}
    >
      <path fill="currentColor" fillRule="evenodd" d={BRAND_WORDMARK_PATH} />
    </svg>
  );
}
