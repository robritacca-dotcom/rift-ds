import { componentPageMetadata } from "@/config/navigation";

export const metadata = componentPageMetadata("artifact-card");

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
