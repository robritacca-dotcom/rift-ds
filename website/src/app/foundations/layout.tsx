import { sectionMetadata } from "@/config/navigation";

export const metadata = sectionMetadata(
  "Foundations",
  "Colours, typography, spacing, icons, and logos: the tokens behind every component on this site."
);

export default function FoundationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
