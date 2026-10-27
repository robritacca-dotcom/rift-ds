import { SECTION_LANDINGS, sectionMetadata } from "@/config/navigation";

const { label, description } = SECTION_LANDINGS["/templates"];

export const metadata = sectionMetadata(label, description);

export default function TemplatesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
