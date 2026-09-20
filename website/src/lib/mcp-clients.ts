import { SITE_URL } from "@/lib/structuredData";

/**
 * The connect snippets for the /api/mcp endpoint, one per MCP client. The
 * get-started page and the endpoint's browser landing page both render from
 * here, so the command a visitor copies has one home and the two surfaces
 * cannot state different server names or transports.
 */
export interface McpClient {
  id: string;
  label: string;
  /** CodeBlock language for the snippet. */
  language: string;
  /** File the snippet belongs in, when it is config rather than a command. */
  filename?: string;
  snippet: string;
}

export const MCP_ENDPOINT = `${SITE_URL}/api/mcp`;

export const MCP_CLIENTS: McpClient[] = [
  {
    id: "claude-code",
    label: "Claude Code",
    language: "bash",
    snippet: `claude mcp add --transport http robr0-ds ${MCP_ENDPOINT}`,
  },
  {
    id: "cursor",
    label: "Cursor",
    language: "json",
    filename: ".cursor/mcp.json",
    snippet: `{
  "mcpServers": {
    "robr0-ds": { "url": "${MCP_ENDPOINT}" }
  }
}`,
  },
  {
    id: "vs-code",
    label: "VS Code",
    language: "json",
    filename: ".vscode/mcp.json",
    snippet: `{
  "servers": {
    "robr0-ds": { "type": "http", "url": "${MCP_ENDPOINT}" }
  }
}`,
  },
];
