"use client";

import { useState } from "react";
import styles from "../page.module.css";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import { AgentStatus } from "@robr0/design-system/components/AgentStatus/AgentStatus";
import { AiButton } from "@robr0/design-system/components/AiButton/AiButton";
import { CodeBlock } from "@robr0/design-system/components/CodeBlock/CodeBlock";
import { PromptSuggestions } from "@robr0/design-system/components/PromptSuggestions/PromptSuggestions";
import { Reasoning } from "@robr0/design-system/components/Reasoning/Reasoning";
import { SourceChip } from "@robr0/design-system/components/SourceChip/SourceChip";
import { ToolCall } from "@robr0/design-system/components/ToolCall/ToolCall";

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

export default function AiSection() {
  const [suggestion, setSuggestion] = useState<string | null>(null);

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

      <div className={styles.demoRow}>
        <SourceChip title="Design tokens" index={1} />
        <SourceChip title="Component registry" index={2} />
        <SourceChip title="Get started" icon="menu_book" />
      </div>
    </section>
  );
}
