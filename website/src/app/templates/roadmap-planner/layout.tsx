import { pageMetadata } from "@/config/navigation";

export const metadata = pageMetadata(
  "/templates/roadmap-planner",
  "A product roadmap tool from the design system alone: a Gantt timeline, with the selected initiative's owner, progress and dependencies on a rail beside it."
);

export default function RoadmapPlannerTemplateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
