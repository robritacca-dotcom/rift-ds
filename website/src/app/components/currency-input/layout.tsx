import ComponentPageLayout from "@/components/ComponentProps/ComponentPageLayout";
import { componentPageMetadata } from "@/config/navigation";

export const metadata = componentPageMetadata("currency-input");

export default function Layout({ children }: { children: React.ReactNode }) {
  return <ComponentPageLayout slug="currency-input">{children}</ComponentPageLayout>;
}
