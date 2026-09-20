import { buildOgImage, ogImageSize, ogImageContentType } from "@/lib/ogImage";

export const size = ogImageSize;
export const contentType = ogImageContentType;
export const alt = "robr0 DS design system";

export default function Image() {
  return buildOgImage("robr0 DS", "AI-ready design system");
}
