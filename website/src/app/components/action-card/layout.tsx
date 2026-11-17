import ComponentPageLayout from "@/components/ComponentProps/ComponentPageLayout";
import { componentPageMetadata } from "@/config/navigation";

export const metadata = componentPageMetadata("action-card");

export default function Layout({ children }: { children: React.ReactNode }) {
  return <ComponentPageLayout slug="action-card">{children}</ComponentPageLayout>;
}
