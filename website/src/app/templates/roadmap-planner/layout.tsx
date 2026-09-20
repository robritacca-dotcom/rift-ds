import { pageMetadata } from "@/config/navigation";

export const metadata = pageMetadata(
  "/templates/roadmap-planner",
  "A product roadmap tool built from the design system alone: the Gantt timeline holding the stage, with the selected initiative's owner, progress, and dependency chain on a rail beside it."
);

export default function RoadmapPlannerTemplateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
