import { componentPageMetadata } from "@/config/navigation";

export const metadata = componentPageMetadata("text");

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
