import { pageMetadata } from "@/config/navigation";

export const metadata = pageMetadata(
  "/templates/agent-workbench",
  "An agentic coding interface built from the design system alone: the agent's conversation, plan, and tool calls beside the staged diff, with a checkpoint waiting on your decision."
);

export default function AgentWorkbenchTemplateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
