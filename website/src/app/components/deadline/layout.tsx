import ComponentPageLayout from "@/components/ComponentProps/ComponentPageLayout";
import { componentPageMetadata } from "@/config/navigation";

export const metadata = componentPageMetadata("deadline");

export default function Layout({ children }: { children: React.ReactNode }) {
  return <ComponentPageLayout slug="deadline">{children}</ComponentPageLayout>;
}
