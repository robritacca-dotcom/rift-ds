import { componentPageMetadata } from "@/config/navigation";

export const metadata = componentPageMetadata("chat-header");

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
