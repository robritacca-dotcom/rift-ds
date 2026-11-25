import { pageMetadata } from "@/config/navigation";

export const metadata = pageMetadata(
  "/templates/agent-controls",
  "A bank’s Agents screen from the design system alone: drafts waiting on approval, every agent action on the record, the connected agents and how far each may go."
);

export default function AgentControlsTemplateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
