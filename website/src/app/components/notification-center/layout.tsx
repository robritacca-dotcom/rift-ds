import { componentPageMetadata } from "@/config/navigation";

export const metadata = componentPageMetadata("notification-center");

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
