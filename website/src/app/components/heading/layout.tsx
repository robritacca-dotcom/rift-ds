import { componentPageMetadata } from "@/config/navigation";

export const metadata = componentPageMetadata("heading");

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
