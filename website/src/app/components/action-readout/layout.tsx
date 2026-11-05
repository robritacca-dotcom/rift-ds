import { componentPageMetadata } from "@/config/navigation";

export const metadata = componentPageMetadata("action-readout");

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
