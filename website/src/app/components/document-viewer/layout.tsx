import { componentPageMetadata } from "@/config/navigation";

export const metadata = componentPageMetadata("document-viewer");

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
