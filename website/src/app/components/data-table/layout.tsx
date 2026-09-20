import { componentPageMetadata } from "@/config/navigation";

export const metadata = componentPageMetadata("data-table");

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
