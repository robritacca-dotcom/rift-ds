import { componentPageMetadata } from "@/config/navigation";

export const metadata = componentPageMetadata("deadline");

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
