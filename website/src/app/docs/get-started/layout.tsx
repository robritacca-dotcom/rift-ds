import { pageMetadata } from "@/config/navigation";

export const metadata = pageMetadata(
  "/docs/get-started",
  "Install @robr0/design-system, import the tokens, bring your own font, re-theme by overriding primitives, and wire the chat components to your own backend."
);

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
