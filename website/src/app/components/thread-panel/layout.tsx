import ComponentPageLayout from "@/components/ComponentProps/ComponentPageLayout";
import { componentPageMetadata } from "@/config/navigation";

export const metadata = componentPageMetadata("thread-panel");

export default function Layout({ children }: { children: React.ReactNode }) {
  return <ComponentPageLayout slug="thread-panel">{children}</ComponentPageLayout>;
}
