import { componentPageMetadata } from "@/config/navigation";

export const metadata = componentPageMetadata("description-list");

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
