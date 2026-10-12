import { buildOgImage, ogImageSize, ogImageContentType } from "@/lib/ogImage";
import { BRAND_NAME } from "@/config/brand.generated";

export const size = ogImageSize;
export const contentType = ogImageContentType;
export const alt = `${BRAND_NAME} · Chat`;

export default function Image() {
  return buildOgImage("Chat", BRAND_NAME);
}
