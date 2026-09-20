import { componentPageMetadata } from "@/config/navigation";

export const metadata = componentPageMetadata("model-picker");

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
