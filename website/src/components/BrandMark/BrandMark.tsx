import { useId } from "react";
import { BRAND_MARK_PATHS, BRAND_MARK_STROKE_WIDTH } from "@/config/brand-mark";

/**
 * The brand mark, inline — the one component every chrome surface renders
 * (header wordmark, footer, drawer). The favicon routes draw the same
 * paths from @/config/brand-mark, so the mark cannot fork. The gradient
 * reads the live action tokens, so the mark wears whichever theme is on:
 * gold under Volt in dark (ink in light, where Volt inverts the action
 * fill), ink under Smoke, teal in the shipped look. The favicons keep the frozen teals (browser chrome cannot read
 * CSS variables).
 */
export default function BrandMark({
  size = 24,
  className,
}: {
  size?: number;
  className?: string;
}) {
  /* The mark renders several times per document (both header bars, the
     drawer, the footer), so the gradient id must be per-instance. */
  const gradientId = useId();
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {BRAND_MARK_PATHS.map((d) => (
        <path
          key={d}
          d={d}
          stroke={`url(#${gradientId})`}
          strokeWidth={BRAND_MARK_STROKE_WIDTH}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
      <defs>
        <linearGradient
          id={gradientId}
          x1="12"
          y1="4"
          x2="12"
          y2="20"
          gradientUnits="userSpaceOnUse"
        >
          <stop style={{ stopColor: "var(--color-action-primary-bg)" }} />
          <stop offset="1" style={{ stopColor: "var(--color-action-primary-bg-active)" }} />
        </linearGradient>
      </defs>
    </svg>
  );
}
