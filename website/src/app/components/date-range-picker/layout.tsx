import ComponentPageLayout from "@/components/ComponentProps/ComponentPageLayout";
import { componentPageMetadata } from "@/config/navigation";

export const metadata = componentPageMetadata("date-range-picker");

export default function Layout({ children }: { children: React.ReactNode }) {
  return <ComponentPageLayout slug="date-range-picker">{children}</ComponentPageLayout>;
}
