import { pageMetadata } from "@/config/navigation";

export const metadata = pageMetadata(
  "/templates/agent-workbench",
  "An agentic coding interface from the design system alone: the agent's conversation, plan and tool calls beside the staged diff, with a checkpoint to approve."
);

export default function AgentWorkbenchTemplateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
