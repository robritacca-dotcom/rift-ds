import { buildOgImage, ogImageSize, ogImageContentType } from "@/lib/ogImage";
import { BRAND_NAME } from "@/config/brand.generated";

export const size = ogImageSize;
export const contentType = ogImageContentType;
export const alt = `${BRAND_NAME} design system`;

export default function Image() {
  return buildOgImage(BRAND_NAME, "AI-ready design system");
}
