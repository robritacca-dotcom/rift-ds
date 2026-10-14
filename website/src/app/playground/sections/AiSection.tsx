"use client";

import { useState } from "react";
import styles from "../page.module.css";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import { AgentStatus } from "rift-ds/components/AgentStatus/AgentStatus";
import { AiButton } from "rift-ds/components/AiButton/AiButton";
import { ArtifactCard } from "rift-ds/components/ArtifactCard/ArtifactCard";
import { ArtifactPanel } from "rift-ds/components/ArtifactPanel/ArtifactPanel";
import { CodeBlock } from "rift-ds/components/CodeBlock/CodeBlock";
import { PromptSuggestions } from "rift-ds/components/PromptSuggestions/PromptSuggestions";
import { Reasoning } from "rift-ds/components/Reasoning/Reasoning";
import { SourceChip } from "rift-ds/components/SourceChip/SourceChip";
import { ToolCall } from "rift-ds/components/ToolCall/ToolCall";

const AGENT_STATES = ["thinking", "working", "waiting", "done", "error"] as const;

const SUGGESTIONS = [
  { id: "retheme", label: "How does re-theming work?", icon: "palette" },
  { id: "tokens", label: "Explain the token architecture", icon: "account_tree" },
  { id: "install", label: "How do I install the design system?", icon: "download" },
];

const TOOL_ARGS = `{
  "query": "action colour",
  "scope": "tokens",
  "limit": 5
}`;

const THEME_SOURCE = `:root {
  --radius-pill: 999px;
  --font-family-heading: "Inter Tight", sans-serif;
}`;

/* What the artifact holds: three of the levers' own facts, drawn from
   tokens so the panel's content re-themes with the rest of the stage. */
const ARTIFACT_ROWS = [
  ["Action colour", "Primary buttons and focus rings"],
  ["Corner radius", "Buttons, inputs and cards"],
  ["Typeface", "Headings over body"],
];

export default function AiSection() {
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [artifactOpen, setArtifactOpen] = useState(true);

  return (
    <section className={styles.demoSection} aria-label="AI">
      <SectionTitle title="AI" />
      <p className={styles.sectionNote}>
        The AI components keep their own signals on purpose: the gradient ring
        marks where a model answers, and the status colours keep their meaning,
        so the brand lever leaves both alone. Everything else about them moves
        with the controls, so typeface, corner radius, and the neutral tint
        re-theme these surfaces like any other.
      </p>

      <div className={styles.demoRow}>
        <AiButton label="Ask the model" />
        <AiButton label="Summarise" icon="summarize" size="compact" />
      </div>

      <div className={styles.demoRow}>
        {AGENT_STATES.map((state) => (
          <AgentStatus key={state} state={state} size="compact" />
        ))}
      </div>

      <Reasoning duration={4}>
        The playground overrides primitive tokens on the page root, and every
        semantic token chains to a primitive, so one override cascades through
        every component here. That is why a single colour pick moves buttons,
        focus rings, and chart series together.
      </Reasoning>

      <ToolCall
        name="search_tokens"
        summary="action colour"
        status="success"
        duration="0.4s"
      >
        <CodeBlock code={TOOL_ARGS} language="json" />
      </ToolCall>

      <ToolCall name="generate_theme_css" summary="current lever state" status="running" />

      <PromptSuggestions
        suggestions={SUGGESTIONS}
        onValueChange={setSuggestion}
        layout="wrap"
        aria-label="Example prompts"
      />
      {suggestion && (
        <p className={styles.sectionNote}>
          You picked <code>{suggestion}</code>. In a real chat this would become
          the next message.
        </p>
      )}

      {/* The artifact pair: the tile a reply leaves in the thread, and the
          panel it opens. One piece of state between them, as in the chat. */}
      <ArtifactCard
        title="Theme summary"
        meta="Document"
        icon="article"
        open={artifactOpen}
        onClick={() => setArtifactOpen((current) => !current)}
      />
      {artifactOpen && (
        <div className={styles.artifactFrame}>
          <ArtifactPanel
            title="Theme summary"
            meta="Document"
            icon="article"
            code={THEME_SOURCE}
            language="css"
            onClose={() => setArtifactOpen(false)}
          >
            <ul className={styles.artifactList}>
              {ARTIFACT_ROWS.map(([name, what]) => (
                <li key={name} className={styles.artifactRow}>
                  <span className={styles.artifactName}>{name}</span>
                  <span className={styles.artifactWhat}>{what}</span>
                </li>
              ))}
            </ul>
          </ArtifactPanel>
        </div>
      )}

      <div className={styles.demoRow}>
        <SourceChip title="Design tokens" index={1} />
        <SourceChip title="Component registry" index={2} />
        <SourceChip title="Get started" />
      </div>
    </section>
  );
}
