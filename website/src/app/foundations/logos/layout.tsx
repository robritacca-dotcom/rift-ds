import { pageMetadata } from "@/config/navigation";

export const metadata = pageMetadata(
  "/foundations/logos",
  "Brand logos and marks used across projects: SVG assets with light and dark mode variants."
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
