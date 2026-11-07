import { componentPageMetadata } from "@/config/navigation";

export const metadata = componentPageMetadata("link");

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
