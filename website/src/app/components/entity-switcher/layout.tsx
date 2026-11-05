import { componentPageMetadata } from "@/config/navigation";

export const metadata = componentPageMetadata("entity-switcher");

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
