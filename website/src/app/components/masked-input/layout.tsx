import ComponentPageLayout from "@/components/ComponentProps/ComponentPageLayout";
import { componentPageMetadata } from "@/config/navigation";

export const metadata = componentPageMetadata("masked-input");

export default function Layout({ children }: { children: React.ReactNode }) {
  return <ComponentPageLayout slug="masked-input">{children}</ComponentPageLayout>;
}
