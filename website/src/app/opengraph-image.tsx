import { buildOgImage, ogImageSize, ogImageContentType } from "@/lib/ogImage";

export const size = ogImageSize;
export const contentType = ogImageContentType;
export const alt = "Robert Ritacca · Principal Product Designer";

export default function Image() {
  return buildOgImage("Robert Ritacca", "Principal Product Designer");
}
