import { pageMetadata } from "@/config/navigation";

export const metadata = pageMetadata(
  "/foundations/colour-mode",
  "Semantic colour tokens that map roles to primitive values per mode, enabling light and dark themes without changing component logic."
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
