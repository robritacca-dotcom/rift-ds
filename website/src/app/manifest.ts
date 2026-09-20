import type { MetadataRoute } from "next";
import { BRAND_NAME, BRAND_SHORT } from "@/config/brand.generated";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${BRAND_NAME} · An AI-ready React design system`,
    short_name: BRAND_SHORT,
    description:
      "An AI-ready React design system: tokens, components, templates, and the docs site they build.",
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
