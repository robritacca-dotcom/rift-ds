import { componentPageMetadata } from "@/config/navigation";

export const metadata = componentPageMetadata("masked-input");

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
