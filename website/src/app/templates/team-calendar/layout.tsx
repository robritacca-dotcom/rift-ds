import { pageMetadata } from "@/config/navigation";

export const metadata = pageMetadata(
  "/templates/team-calendar",
  "A team planning screen built from the design system alone: the month calendar holding the stage, with the sprint's to-dos and the selected day's schedule on a rail beside it."
);

export default function TeamCalendarTemplateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
