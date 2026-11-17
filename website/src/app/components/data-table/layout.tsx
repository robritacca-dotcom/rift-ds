import ComponentPageLayout from "@/components/ComponentProps/ComponentPageLayout";
import { componentPageMetadata } from "@/config/navigation";

export const metadata = componentPageMetadata("data-table");

export default function Layout({ children }: { children: React.ReactNode }) {
  return <ComponentPageLayout slug="data-table">{children}</ComponentPageLayout>;
}
