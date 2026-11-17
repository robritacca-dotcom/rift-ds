import ComponentPageLayout from "@/components/ComponentProps/ComponentPageLayout";
import { componentPageMetadata } from "@/config/navigation";

export const metadata = componentPageMetadata("gantt-chart");

export default function Layout({ children }: { children: React.ReactNode }) {
  return <ComponentPageLayout slug="gantt-chart">{children}</ComponentPageLayout>;
}
