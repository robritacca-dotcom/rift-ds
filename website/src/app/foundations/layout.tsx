import { SECTION_LANDINGS, sectionMetadata } from "@/config/navigation";

const { label, description } = SECTION_LANDINGS["/foundations"];

export const metadata = sectionMetadata(label, description);

export default function FoundationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
