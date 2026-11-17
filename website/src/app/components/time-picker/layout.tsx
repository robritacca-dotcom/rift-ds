import ComponentPageLayout from "@/components/ComponentProps/ComponentPageLayout";
import { componentPageMetadata } from "@/config/navigation";

export const metadata = componentPageMetadata("time-picker");

export default function Layout({ children }: { children: React.ReactNode }) {
  return <ComponentPageLayout slug="time-picker">{children}</ComponentPageLayout>;
}
