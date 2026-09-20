import { componentPageMetadata } from "@/config/navigation";

// Title and description come from src/components/registry.json — the single
// place a component's one-line summary lives.
export const metadata = componentPageMetadata("date-picker");

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
