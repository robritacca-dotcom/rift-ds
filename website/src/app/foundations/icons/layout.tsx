import { pageMetadata } from "@/config/navigation";

export const metadata = pageMetadata(
  "/foundations/icons",
  "The Material Symbols Rounded icon set: one style at a single weight, sized on the four-step icon token scale."
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
