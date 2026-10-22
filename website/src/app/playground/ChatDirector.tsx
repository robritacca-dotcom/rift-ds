"use client";

import type { ReactNode } from "react";
import layout from "./page.module.css";
import styles from "./ChatDirector.module.css";
import { FloatingRail } from "./FloatingRail";
import { Button } from "rift-ds/components/Button/Button";
import { ChatMarker } from "rift-ds/components/ChatMarker/ChatMarker";
import { InspectorSection } from "rift-ds/components/Inspector/InspectorSection";
import { useChatWidget } from "rift-ds/chat";

/* ============================================
   The chat director: the Chat view's own rail.

   Every event plays a scripted beat into the conversation the stage is
   rendering. The rich-content beats send a story prompt through the demo
   transport (rift-ds/chat/demo), so one press plays as a real exchange: the
   visitor's bubble, the thinking choreography with its reasoning trace, the
   streamed answer, the card, and follow-up chips or the agent's questions. Only the instant events
   (a reply, a day marker) land in the transcript directly via injectTurn,
   the widget's public staging API. Nothing here calls a model or a server:
   "Ask as the visitor" goes through whichever transport the lever picked.
   ============================================ */

/* Rotating scripts, so pressing an event twice stays varied. The stage
   shows a generic product (the Product name lever's Acme Corp), so the copy
   is a consumer product's, never the site's own assistant. Each one is a
   prompt in the demo script, so asking as the visitor always enters the
   branching story rather than the fallback rotation. */
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

/* Rotation cursors at module scope: they are not view state (nothing
   re-renders when they move), just which line of the script comes up next. */
let questionCursor = 0;
let replyCursor = 0;
const nextQuestion = () => VISITOR_QUESTIONS[questionCursor++ % VISITOR_QUESTIONS.length];
const nextReply = () => ASSISTANT_REPLIES[replyCursor++ % ASSISTANT_REPLIES.length];

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
  /** The Artifact panel lever is on. Off, the events that make an artifact
      leave the list: there is no panel for what they would make. */
  artifacts?: boolean;
  /** Puts the chat setup levers back on their defaults (the director also
      starts a fresh conversation). */
  onResetSetup?: () => void;
  /** The floating panel is folded into its toggle (panel variant only). */
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

/** The Chat view's right-hand rail: the chat levers, then the event list. */
export default function ChatDirector({
  variant = "panel",
  levers,
  live = false,
  artifacts = false,
  onResetSetup = () => {},
  collapsed = false,
  onCollapsedChange = () => {},
}: ChatDirectorProps) {
  const { injectTurn, send, reset, setDraft, streaming } = useChatWidget();

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
          /* The one event that spends tokens on Live, deliberately: it IS
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
        ...(artifacts
          ? [
              {
                id: "artifact-dashboard",
                label: "Build a dashboard artifact",
                icon: "space_dashboard",
                disabled: streaming,
                run: () => send("Build me a launch dashboard"),
              },
              {
                id: "artifact-page",
                label: "Draft a web page artifact",
                icon: "web",
                disabled: streaming,
                run: () => send("Draft the launch page"),
              },
            ]
          : []),
        {
          id: "attachment",
          label: "Drop a doc for analysis",
          icon: "attach_file",
          disabled: streaming,
          /* The visitor's words ride with the file, the way a real
             attachment lands: the tile above the bubble, text below. The
             text is the story key, so the script answers with the read and
             the budget chart. */
          run: () =>
            send("Here is the launch plan we are working from.", {
              attachments: [
                {
                  id: "launch-plan",
                  name: "Q3 launch plan.pdf",
                  kind: "pdf",
                  size: 1_258_291,
                  status: "ready",
                },
              ],
            }),
        },
      ],
    },
    {
      /* The four ways a reply can end: chips the visitor might send, then
         the agent asking with answers to pick. Each is a prompt in the demo
         script, whose answer branches play out whichever option is picked. */
      heading: "Quick replies",
      events: [
        {
          id: "followups",
          label: "Offer follow-up chips",
          icon: "chat_bubble",
          disabled: streaming,
          run: () => send("What do the plans include?"),
        },
        {
          id: "ask-one",
          label: "Ask one question",
          icon: "radio_button_checked",
          disabled: streaming,
          run: () => send("Help me pick a plan"),
        },
        {
          id: "ask-several",
          label: "Ask for several answers",
          icon: "checklist_rtl",
          disabled: streaming,
          run: () => send("Set up notifications for me"),
        },
        {
          id: "ask-set",
          label: "Ask a set of questions",
          icon: "quiz",
          disabled: streaming,
          run: () => send("Plan our launch kickoff"),
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
        <InspectorSection key={group.heading} title={group.heading} defaultOpen>
          <div className={styles.eventList}>
            {group.events.map((event) => (
              <Button
                key={event.id}
                label={event.label}
                variant="primary"
                tone="neutral"
                size="compact"
                iconLeft={event.icon}
                disabled={event.disabled || (live && !event.liveSafe)}
                onClick={event.run}
              />
            ))}
          </div>
        </InspectorSection>
      ))}
    </>
  );

  if (variant === "drawer") {
    return <div className={layout.drawerControls}>{content}</div>;
  }

  return (
    /* The mirror of the theme rail: fixed to the right edge, everything
       scrolling inside. */
    <FloatingRail
      side="right"
      label="Chat controls"
      title="AI Chat"
      collapsed={collapsed}
      onCollapsedChange={onCollapsedChange}
      onReset={() => {
        onResetSetup();
        reset();
        setDraft("");
      }}
      resetLabel="Reset the chat"
    >
      {content}
    </FloatingRail>
  );
}
