import { pageMetadata } from "@/config/navigation";

export const metadata = pageMetadata(
  "/docs/shaders",
  "Paint a WebGL scene behind a page: pick one the library ships or write your own in GLSL, in your theme's colours, with the same passes and fallbacks."
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
