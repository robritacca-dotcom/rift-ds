import { componentPageMetadata } from "@/config/navigation";

export const metadata = componentPageMetadata("thread-panel");

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
