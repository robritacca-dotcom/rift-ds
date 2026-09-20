import type { MetadataRoute } from "next";
import { BRAND_NAME, BRAND_SHORT } from "@/config/brand.generated";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${BRAND_NAME} · An open source, AI-ready React design system`,
    short_name: BRAND_SHORT,
    description:
      "A free, open source React design system for AI products: tokens, components, themes and templates.",
    start_url: "/",
    display: "standalone",
    background_color: "#050505",
    theme_color: "#118AB2",
    icons: [
      {
        src: "/icon",
        sizes: "32x32",
        type: "image/png",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
