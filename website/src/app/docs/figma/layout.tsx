import { pageMetadata } from "@/config/navigation";

export const metadata = pageMetadata(
  "/docs/figma",
  "The free Figma kit: a page for every component, variables named after the code's tokens, and themes and light and dark as variable modes."
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
