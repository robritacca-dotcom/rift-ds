import { SECTION_LANDINGS, sectionMetadata } from "@/config/navigation";

const { label, description } = SECTION_LANDINGS["/components"];

export const metadata = sectionMetadata(label, description);

export default function ComponentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
