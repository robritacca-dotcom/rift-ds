import { buildOgImage, ogImageSize, ogImageContentType } from "@/lib/ogImage";
import { BRAND_NAME } from "@/config/brand.generated";

export const size = ogImageSize;
export const contentType = ogImageContentType;
export const alt = `${BRAND_NAME} · An open source, AI-ready React design system`;

export default function Image() {
  return buildOgImage(BRAND_NAME, "An open source, AI-ready React design system");
}
