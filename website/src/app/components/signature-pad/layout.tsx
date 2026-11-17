import ComponentPageLayout from "@/components/ComponentProps/ComponentPageLayout";
import { componentPageMetadata } from "@/config/navigation";

export const metadata = componentPageMetadata("signature-pad");

export default function Layout({ children }: { children: React.ReactNode }) {
  return <ComponentPageLayout slug="signature-pad">{children}</ComponentPageLayout>;
}
