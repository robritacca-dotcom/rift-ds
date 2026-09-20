import { buildOgImage, ogImageSize, ogImageContentType } from "@/lib/ogImage";

export const size = ogImageSize;
export const contentType = ogImageContentType;
export const alt = "robr0 DS · Foundations";

export default function Image() {
  return buildOgImage("Foundations", "robr0 DS");
}
