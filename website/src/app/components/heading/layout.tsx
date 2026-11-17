import ComponentPageLayout from "@/components/ComponentProps/ComponentPageLayout";
import { componentPageMetadata } from "@/config/navigation";

export const metadata = componentPageMetadata("heading");

export default function Layout({ children }: { children: React.ReactNode }) {
  return <ComponentPageLayout slug="heading">{children}</ComponentPageLayout>;
}
