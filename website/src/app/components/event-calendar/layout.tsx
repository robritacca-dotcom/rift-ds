import { componentPageMetadata } from "@/config/navigation";

export const metadata = componentPageMetadata("event-calendar");

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
