import { sectionMetadata } from "@/config/navigation";

export const metadata = sectionMetadata(
  "Templates",
  "Complete screens built from the design system's components and tokens alone."
);

export default function TemplatesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
