import { buildOgImage, ogImageSize, ogImageContentType } from "@/lib/ogImage";

export const size = ogImageSize;
export const contentType = ogImageContentType;
export const alt = "robr0 DS · Components";

export default function Image() {
  return buildOgImage("Components", "robr0 DS");
}
