import { componentPageMetadata } from "@/config/navigation";

export const metadata = componentPageMetadata("agent-plan");

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
