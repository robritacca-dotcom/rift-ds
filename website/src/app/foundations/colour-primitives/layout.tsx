import { pageMetadata } from "@/config/navigation";

export const metadata = pageMetadata(
  "/foundations/colour-primitives",
  "The raw colour palette: teal, orange, neutral, red, green, purple, and blue primitives that feed into semantic tokens."
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
