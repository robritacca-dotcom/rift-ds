"use client";

import { useEffect, useState, type ReactNode } from "react";
import layout from "./page.module.css";
import styles from "./ChatDirector.module.css";
import { AgentPlan, type AgentPlanStep } from "@robr0/design-system/components/AgentPlan/AgentPlan";
import { Button } from "@robr0/design-system/components/Button/Button";
import { ChatMarker } from "@robr0/design-system/components/ChatMarker/ChatMarker";
import { CodeBlock } from "@robr0/design-system/components/CodeBlock/CodeBlock";
import { CodeDiff } from "@robr0/design-system/components/CodeDiff/CodeDiff";
import { AreaChart } from "@robr0/design-system/components/Chart/AreaChart";
import { BarChart } from "@robr0/design-system/components/Chart/BarChart";
import { DocumentChip } from "@robr0/design-system/components/DocumentChip/DocumentChip";
import { InterruptCard } from "@robr0/design-system/components/InterruptCard/InterruptCard";
import { MessageCard } from "@robr0/design-system/components/MessageCard/MessageCard";
import { SourceChip } from "@robr0/design-system/components/SourceChip/SourceChip";
import { ToolCall } from "@robr0/design-system/components/ToolCall/ToolCall";
import { useSiteChat } from "@/components/SiteChat/ChatContext";

/* ============================================
   The chat director: the Chat view's own rail.

   Every event plays a scripted beat into the conversation the stage is
   rendering, built from the library's chat components — the same primitives
   the widget itself is made of. The rich-content beats send a story prompt
   through the sim transport (lib/chat-sim.ts), so one press plays as a
   real exchange: the visitor's bubble, the thinking choreography with its
   reasoning trace, the streamed answer, the rich element, and follow-up
   chips. Only the instant events (a reply, a day marker) still land in the
   transcript directly via injectTurn. Nothing here calls a model or a
   server: "Ask as the visitor" goes through whichever transport the lever
   picked.
   ============================================ */

/* Rotating scripts, so pressing an event twice stays varied. The stage
   shows a generic product (the Product name lever's Acme Corp), so the
   copy is a consumer product's, never the site's own assistant. */
/* Each one is a story key in lib/chat-sim.ts, so asking as the visitor
   always enters the branching script rather than the fallback rotation. */
const VISITOR_QUESTIONS = [
  "How do I get started?",
  "What do the plans include?",
  "Invite my team to a workspace",
];

/* Each instant reply is a whole agent message: trace points behind the
   "Thought for" disclosure, then the answer. Injected turns carry the same
   fields a streamed turn commits with, so the thread cannot tell them apart. */
const ASSISTANT_REPLIES = [
  {
    text:
      "Create a workspace from the dashboard, then invite your team from " +
      "Settings. Everyone you add sees the shared projects the moment they join.",
    trace: [
      "The question maps to the first-run flow.",
      "Lead with the workspace, then the invite step.",
    ],
    duration: 3,
  },
  {
    text:
      "Every plan includes unlimited projects. The Team plan adds shared " +
      "workspaces, guest seats, and a 90 day version history.",
    trace: [
      "Three plans differ on collaboration, not on limits.",
      "Name what the Team plan adds over the base.",
    ],
    duration: 4,
  },
];

/* Rotation cursors at module scope, the way useChat mints turn ids — they
   are not view state (nothing re-renders when they move), just which line
   of the script comes up next. */
let questionCursor = 0;
let replyCursor = 0;
const nextQuestion = () => VISITOR_QUESTIONS[questionCursor++ % VISITOR_QUESTIONS.length];
const nextReply = () => ASSISTANT_REPLIES[replyCursor++ % ASSISTANT_REPLIES.length];

const TOOL_ARGS = `{
  "workspace": "acme-design",
  "role": "editor",
  "emails": 3
}`;

const CONFIG_DIFF = `@@ -12,7 +12,7 @@
 export const workspace = {
   name: "acme-design",
-  seats: 5,
+  seats: 12,
   region: "eu-west",
 };`;

const PLAN_STEPS: AgentPlanStep[] = [
  { label: "Check the workspace quota", status: "completed" },
  {
    label: "Create the shared project",
    status: "completed",
    detail: "acme-design / launch",
  },
  { label: "Invite the three teammates", status: "active" },
  { label: "Post the welcome note", status: "pending" },
];

/* A schedule timing, not an animation: how long the staged retry "runs"
   before it lands. Local on purpose, like the sim transport's beats — it is
   this mock's pacing, not a timing any shipped surface shares. */
const RETRY_RUN_MS = 1400;

/* Chart data for the injected cards — a trial that is going well, and the
   budget read out of the dropped launch plan. */
const TRIAL_SIGNUPS = [
  { week: "W1", signups: 320 },
  { week: "W2", signups: 410 },
  { week: "W3", signups: 380 },
  { week: "W4", signups: 520 },
  { week: "W5", signups: 610 },
  { week: "W6", signups: 720 },
];

const LAUNCH_BUDGET = [
  { phase: "Beta", spend: 12 },
  { phase: "Launch week", spend: 34 },
  { phase: "Follow-up", spend: 18 },
];

/**
 * A tool call that failed and can be retried in place — the retry is part
 * of the injected content, so the staged failure resolves the way a real
 * one would: run again, then land as a success.
 */
function FlakyToolCall() {
  const [status, setStatus] = useState<"error" | "running" | "success">("error");

  useEffect(() => {
    if (status !== "running") return;
    const timer = setTimeout(() => setStatus("success"), RETRY_RUN_MS);
    return () => clearTimeout(timer);
  }, [status]);

  return (
    <ToolCall
      name="sync_calendar"
      summary="team@acme.com"
      status={status}
      duration={status === "success" ? "1.4s" : status === "error" ? "2.1s" : undefined}
      actions={
        status === "error" ? (
          <Button
            label="Retry"
            variant="secondary"
            size="compact"
            onClick={() => setStatus("running")}
          />
        ) : undefined
      }
    />
  );
}

/**
 * A human-in-the-loop checkpoint that actually answers: choosing an option
 * flips the card to its answered state, the way a live agent run would.
 */
function ApprovalMock() {
  const [value, setValue] = useState<string | undefined>(undefined);
  return (
    <InterruptCard
      title="Connect the shared calendar?"
      description="The assistant wants read access to the team calendar to suggest meeting times."
      options={[
        { value: "allow", label: "Allow once", variant: "primary" },
        { value: "always", label: "Always allow", variant: "secondary" },
        { value: "deny", label: "Not now", variant: "secondary" },
      ]}
      value={value}
      onValueChange={setValue}
    />
  );
}

/* ============================================
   The story's rich elements, defined once: the sim transport's branching
   story (lib/chat-sim.ts) names them by key, and the director's events
   reuse the same nodes — so a chip path and a rail press land the exact
   same furniture in the thread.
   ============================================ */

const TEAM_PLAN_CARD = (
  <MessageCard
    media={<div className={styles.cardMedia} aria-hidden="true" />}
    title="Team plan"
    description="Shared workspaces, guest seats, and version history for the whole team."
    meta="Billed monthly, cancel any time"
    actions={
      <>
        <Button label="Choose plan" variant="secondary" size="compact" />
        <Button label="Compare plans" variant="tertiary" size="compact" />
      </>
    }
  />
);

const TRIAL_CHART_CARD = (
  <MessageCard
    media={
      <AreaChart
        data={TRIAL_SIGNUPS}
        xKey="week"
        series={[{ dataKey: "signups", label: "Signups" }]}
        height={150}
      />
    }
    title="Trial signups"
    meta="Last six weeks"
  />
);

const SOURCE_CHIPS = (
  <div className={styles.sourceRow}>
    <SourceChip title="Pricing guide" index={1} />
    <SourceChip title="Workspace docs" index={2} />
    <SourceChip title="Fair use policy" icon="menu_book" />
  </div>
);

const INVITE_TOOL_CALL = (
  <ToolCall name="invite_teammates" summary="3 editors to acme-design" status="success" duration="0.6s">
    <CodeBlock code={TOOL_ARGS} language="json" />
  </ToolCall>
);

const SEAT_DIFF = <CodeDiff diff={CONFIG_DIFF} filename="workspace.config.ts" />;

const SETUP_PLAN = <AgentPlan steps={PLAN_STEPS} />;

/* The doc drop's answer: the read shows its work, then the chart reads the
   budget out of the plan — two elements landing as one turn's stack. */
const LAUNCH_ANALYSIS = (
  <div className={styles.contentStack}>
    <ToolCall
      name="read_document"
      summary="Q3 launch plan.pdf"
      status="success"
      duration="1.8s"
    />
    <MessageCard
      media={
        <BarChart
          data={LAUNCH_BUDGET}
          xKey="phase"
          yKey="spend"
          dataLabel="Spend ($k)"
          height={150}
        />
      }
      title="Budget by phase"
      meta="From Q3 launch plan.pdf"
    />
  </div>
);

/**
 * The rich elements the sim story attaches to its answers, keyed by the
 * `contentKey` values in lib/chat-sim.ts. The page hands this map to
 * `createSimTransport`, keeping the JSX here where components can live.
 */
export const STORY_CONTENT: Record<string, ReactNode> = {
  "team-plan-card": TEAM_PLAN_CARD,
  "trial-chart": TRIAL_CHART_CARD,
  sources: SOURCE_CHIPS,
  "invite-tool": INVITE_TOOL_CALL,
  "seat-diff": SEAT_DIFF,
  "setup-plan": SETUP_PLAN,
  "calendar-approval": <ApprovalMock />,
  "launch-analysis": LAUNCH_ANALYSIS,
  "flaky-tool": <FlakyToolCall />,
};

interface DirectorEvent {
  id: string;
  label: string;
  icon: string;
  disabled?: boolean;
  /** The event works against the real backend too. Everything else stages
      content the live model cannot actually produce, and pauses on Live. */
  liveSafe?: boolean;
  run: () => void;
}

export interface ChatDirectorProps {
  /** How the director is hosted: the desktop floating panel (default), or bare
      content for the compact Drawer, which brings its own shell and title. */
  variant?: "panel" | "drawer";
  /** The Chat view's levers (stage size, transport, composer copy), slotted
      above the events so the whole chat toolkit lives on one side. */
  levers?: ReactNode;
  /** The Live transport is selected. The staging events pause: the live
      backend answers in text alone, so a staged tool call or card under a
      real conversation would misrepresent what it can do. */
  live?: boolean;
}

/** The Chat view's right-hand rail: the chat levers, then the event list. */
export default function ChatDirector({
  variant = "panel",
  levers,
  live = false,
}: ChatDirectorProps) {
  const { injectTurn, send, reset, setDraft, streaming } = useSiteChat();

  const groups: { heading: string; events: DirectorEvent[] }[] = [
    {
      heading: "Conversation",
      events: [
        {
          id: "new",
          label: "Start a new conversation",
          icon: "edit_square",
          liveSafe: true,
          run: () => {
            reset();
            setDraft("");
          },
        },
        {
          id: "ask",
          label: "Ask as the visitor",
          icon: "person",
          /* The one event that spends tokens on Live — deliberately, it IS
             the live exchange. send() would refuse mid-stream anyway; the
             disabled state says so. */
          liveSafe: true,
          disabled: streaming,
          run: () => {
            send(nextQuestion());
          },
        },
        {
          id: "reply",
          label: "Inject an instant reply",
          icon: "reply",
          run: () => {
            const reply = nextReply();
            injectTurn({
              role: "assistant",
              text: reply.text,
              tracePoints: reply.trace,
              durationSeconds: reply.duration,
            });
          },
        },
        {
          id: "marker",
          label: "Insert a day marker",
          icon: "calendar_today",
          run: () =>
            injectTurn({
              role: "assistant",
              text: "",
              bare: true,
              content: <ChatMarker>Today</ChatMarker>,
            }),
        },
      ],
    },
    {
      heading: "Rich content",
      events: [
        {
          id: "card",
          label: "Play out a plan pitch",
          icon: "add_card",
          disabled: streaming,
          run: () => send("Which plan fits a team of five?"),
        },
        {
          id: "chart",
          label: "Chart the trial numbers",
          icon: "monitoring",
          disabled: streaming,
          run: () => send("How is the trial going?"),
        },
        {
          id: "sources",
          label: "Cite three sources",
          icon: "link",
          disabled: streaming,
          run: () => send("Where is that written down?"),
        },
        {
          id: "diff",
          label: "Bump the seat count",
          icon: "difference",
          disabled: streaming,
          run: () => send("Take us up to twelve seats"),
        },
        {
          id: "attachment",
          label: "Drop a doc for analysis",
          icon: "attach_file",
          disabled: streaming,
          /* The visitor's words ride with the file, the way a real
             attachment lands: the chip above the bubble, text below. The
             text is the story key, so the sim answers with the read and
             the budget chart. */
          run: () =>
            send("Here is the launch plan we are working from.", {
              content: (
                <DocumentChip name="Q3 launch plan.pdf" fileType="pdf" meta="1.2 MB" />
              ),
            }),
        },
      ],
    },
    {
      heading: "Agent activity",
      events: [
        {
          id: "tool",
          label: "Run a tool call",
          icon: "construction",
          disabled: streaming,
          run: () => send("Go ahead and invite the other three"),
        },
        {
          id: "flaky",
          label: "Fail a tool call",
          icon: "error",
          disabled: streaming,
          run: () => send("Sync the shared calendar"),
        },
        {
          id: "plan",
          label: "Show an agent plan",
          icon: "checklist",
          disabled: streaming,
          run: () => send("Set it all up for me"),
        },
        {
          id: "approval",
          label: "Ask for permission",
          icon: "rule",
          disabled: streaming,
          run: () => send("Find a time we can all meet"),
        },
      ],
    },
  ];

  const content = (
    <>
      {levers}

      {groups.map((group) => (
        <div key={group.heading} className={layout.controlGroup}>
          <h4 className={layout.controlHeading}>{group.heading}</h4>
          <div className={styles.eventList}>
            {group.events.map((event) => (
              <Button
                key={event.id}
                label={event.label}
                variant="neutral"
                iconLeft={event.icon}
                disabled={event.disabled || (live && !event.liveSafe)}
                onClick={event.run}
              />
            ))}
          </div>
        </div>
      ))}
    </>
  );

  if (variant === "drawer") {
    return <div className={layout.drawerControls}>{content}</div>;
  }

  return (
    /* The mirror of the theme rail: fixed to the right edge, everything
       scrolling inside. */
    <aside className={layout.eventRail} aria-label="Chat controls">
      <div className={layout.railScroll}>{content}</div>
    </aside>
  );
}
