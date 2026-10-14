import { componentPageMetadata } from "@/config/navigation";

export const metadata = componentPageMetadata("artifact-panel");

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
