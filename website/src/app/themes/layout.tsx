import type { Metadata } from "next";
import { pageOpenGraph } from "@/config/navigation";

// /themes is a standalone top-level page (like /playground) — it lives in no
// sidebar array, so its metadata is a literal rather than pageMetadata().
const title = "Themes";
const description =
  "Every shipped theme in one gallery: apply a complete look to this site live, open it in the playground, or copy the one-attribute setup into your own app.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/themes" },
  openGraph: pageOpenGraph(title, description, "/themes"),
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
