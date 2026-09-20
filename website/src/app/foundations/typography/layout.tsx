import { pageMetadata } from "@/config/navigation";

export const metadata = pageMetadata(
  "/foundations/typography",
  "Type scale and font tokens, from mega display headings to small paragraph text, all referenced as CSS custom properties."
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
