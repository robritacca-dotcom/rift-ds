import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Robert Ritacca · Principal Product Designer",
    short_name: "Robert Ritacca",
    description:
      "Principal Product Designer in Toronto, crafting AI-native products and agentic experiences.",
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
