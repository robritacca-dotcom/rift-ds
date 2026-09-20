import type { Metadata } from "next";
import { pageOpenGraph } from "@/config/navigation";
import { BRAND_NAME } from "@/config/brand.generated";

const title = "Release log";
const description =
  `Every published version of ${BRAND_NAME}, one entry per npm release: what shipped, and what it means for a consumer.`;

export const metadata: Metadata = {
  alternates: { canonical: "/releases" },
  title,
  description,
  openGraph: pageOpenGraph(title, description, "/releases"),
};

export default function ReleasesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
