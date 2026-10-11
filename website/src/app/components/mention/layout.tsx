import { componentPageMetadata } from "@/config/navigation";

export const metadata = componentPageMetadata("mention");

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
