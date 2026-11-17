import ComponentPageLayout from "@/components/ComponentProps/ComponentPageLayout";
import { componentPageMetadata } from "@/config/navigation";

export const metadata = componentPageMetadata("error-summary");

export default function Layout({ children }: { children: React.ReactNode }) {
  return <ComponentPageLayout slug="error-summary">{children}</ComponentPageLayout>;
}
