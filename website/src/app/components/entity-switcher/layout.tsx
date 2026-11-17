import ComponentPageLayout from "@/components/ComponentProps/ComponentPageLayout";
import { componentPageMetadata } from "@/config/navigation";

export const metadata = componentPageMetadata("entity-switcher");

export default function Layout({ children }: { children: React.ReactNode }) {
  return <ComponentPageLayout slug="entity-switcher">{children}</ComponentPageLayout>;
}
