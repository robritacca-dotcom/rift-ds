import { ImageResponse } from "next/og";
import {
  BRAND_MARK_PATHS,
  BRAND_MARK_STROKE_WIDTH,
  BRAND_MARK_COLOR_TOP,
  BRAND_MARK_COLOR_BOTTOM,
} from "@/config/brand-mark";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#FFFFFF",
        }}
      >
        <svg width="108" height="108" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          {BRAND_MARK_PATHS.map((d) => (
            <path
              key={d}
              d={d}
              stroke="url(#mark_gradient)"
              strokeWidth={BRAND_MARK_STROKE_WIDTH}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
          <defs>
            <linearGradient id="mark_gradient" x1="12" y1="4" x2="12" y2="20" gradientUnits="userSpaceOnUse">
              <stop stopColor={BRAND_MARK_COLOR_TOP} />
              <stop offset="1" stopColor={BRAND_MARK_COLOR_BOTTOM} />
            </linearGradient>
          </defs>
        </svg>
      </div>
    ),
    { ...size }
  );
}
