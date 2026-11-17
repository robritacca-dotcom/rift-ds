import ComponentPageLayout from "@/components/ComponentProps/ComponentPageLayout";
import { componentPageMetadata } from "@/config/navigation";

export const metadata = componentPageMetadata("mention");

export default function Layout({ children }: { children: React.ReactNode }) {
  return <ComponentPageLayout slug="mention">{children}</ComponentPageLayout>;
}
