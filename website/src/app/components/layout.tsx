import { COMPONENT_COUNT } from "@robr0/design-system/components/registry";
import { sectionMetadata } from "@/config/navigation";
import { BRAND_NAME } from "@/config/brand.generated";

export const metadata = sectionMetadata(
  "Components",
  `${COMPONENT_COUNT} React components that make up ${BRAND_NAME}, the design system behind this site.`
);

export default function ComponentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
