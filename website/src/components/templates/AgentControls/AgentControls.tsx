"use client";

/**
 * The agent controls template: the Agents screen of Keel, a fictional
 * business bank, built from the design system alone. It is the reference for
 * design.md's "An agent never holds more than its person": every agent is
 * connected by a person and capped by them (AgentScope), every agent action
 * names both (AgentActivity, and the approvals queue's ActionCards through
 * `preparedBy`), and access can be cut at once and is remembered
 * (AgentConnections).
 *
 * The shell is the family's (TemplateShell's switchable rail and surface,
 * the slim top bar, the docked mock assistant). The page is two columns:
 * what waits on the reader and what agents did on the left, who is connected
 * and how far each may go on the right. The screen is one state, so the
 * columns talk: approving or declining a draft settles its activity entry,
 * moving a scope rewrites that agent's summary in the connections list, and
 * disconnecting an agent (behind an AlertDialog, since it takes something
 * away) withdraws the drafts it left waiting.
 *
 * All of it is fictional, so the route is excluded from the chat corpus (see
 * EXCLUDED_ROUTES in generate-site-corpus.mjs). Dates are pinned strings.
 */

import React from "react";
import { ActionCard, type ActionCardStatus } from "rift-ds/components/ActionCard/ActionCard";
import { AgentActivity, type AgentActivityEntry } from "rift-ds/components/AgentActivity/AgentActivity";
import { AgentConnections, type AgentConnection } from "rift-ds/components/AgentConnections/AgentConnections";
import {
  AgentScope,
  type AgentScopeLevel,
  type AgentScopePermission,
} from "rift-ds/components/AgentScope/AgentScope";
import { AiButton } from "rift-ds/components/AiButton/AiButton";
import { AlertDialog } from "rift-ds/components/AlertDialog/AlertDialog";
import type { AppSidebarSection } from "rift-ds/components/AppSidebar/AppSidebar";
import { Button } from "rift-ds/components/Button/Button";
import { EmptyState } from "rift-ds/components/EmptyState/EmptyState";
import { IconButton } from "rift-ds/components/IconButton/IconButton";
import { Input } from "rift-ds/components/Input/Input";
import { Kbd } from "rift-ds/components/Kbd/Kbd";
import { PageHeader } from "rift-ds/components/PageHeader/PageHeader";
import { SegmentedControl } from "rift-ds/components/SegmentedControl/SegmentedControl";
import { Widget, WidgetGroup } from "rift-ds/components/Widget/Widget";
import TemplateAssistant from "../TemplateAssistant/TemplateAssistant";
import { AppFrameTabBar, useAppFrame } from "../AppFrame/AppFrame";
import TemplateShell from "../TemplateShell/TemplateShell";
import StickyTopBar from "../TemplateShell/StickyTopBar";
import { ProductMark } from "../ProductMark/ProductMark";
import styles from "./AgentControls.module.css";

/* ---------------------------------------------------------------- data */

const NAV_SECTIONS: AppSidebarSection[] = [
  {
    items: [
      { key: "home", icon: "home", label: "Home" },
      {
        key: "payments",
        icon: "payments",
        label: "Payments",
        children: [
          { key: "payments-send", label: "Send" },
          { key: "payments-scheduled", label: "Scheduled" },
          { key: "payments-recipients", label: "Recipients" },
        ],
      },
      { key: "cards", icon: "credit_card", label: "Cards" },
      {
        key: "accounts",
        icon: "account_balance",
        label: "Accounts",
        children: [
          { key: "accounts-operating", label: "Operating" },
          { key: "accounts-reserve", label: "Reserve" },
          { key: "accounts-statements", label: "Statements" },
        ],
      },
      { key: "agents", icon: "smart_toy", label: "Agents" },
    ],
  },
  {
    items: [
      { key: "team", icon: "group", label: "Team" },
      { key: "settings", icon: "settings", label: "Settings" },
    ],
  },
];

/** The areas of the account an agent can be let into, before any person's ceiling. */
const AREAS: Omit<AgentScopePermission, "held">[] = [
  { id: "balances", label: "Balances", description: "Accounts and what is in them", icon: "account_balance", levels: ["none", "view"] },
  { id: "payments", label: "Payments", description: "Send and schedule payments", icon: "payments", approval: true },
  { id: "cards", label: "Cards", description: "Limits, freezes and new cards", icon: "credit_card" },
  { id: "statements", label: "Statements", description: "Monthly statements and exports", icon: "description", levels: ["none", "view"] },
  { id: "payroll", label: "Payroll", description: "Pay runs and payslips", icon: "badge" },
];

/** What each person holds themselves: their agents are never offered more. */
const HELD: Record<string, Record<string, AgentScopeLevel>> = {
  "Sara Ito": { balances: "view", payments: "act", cards: "act", statements: "view", payroll: "act" },
  "Omar Haddad": { balances: "view", payments: "prepare", cards: "view", statements: "view", payroll: "none" },
  "June Park": { balances: "view", payments: "act", cards: "act", statements: "none", payroll: "none" },
};

const AGENTS: AgentConnection[] = [
  { id: "ledger", name: "Ledger", owner: "Sara Ito", lastActive: "Active 10:42" },
  { id: "tally", name: "Tally", owner: "Omar Haddad", lastActive: "Active 09:15" },
  { id: "quill", name: "Quill", owner: "June Park", lastActive: "Active yesterday" },
];

const INITIAL_SCOPES: Record<string, Record<string, AgentScopeLevel>> = {
  ledger: { balances: "view", payments: "prepare", statements: "view" },
  tally: { balances: "view", statements: "view" },
  quill: { cards: "act", payments: "prepare" },
};

type Draft = {
  id: string;
  agentId: string;
  title: string;
  receipt: string;
  icon: string;
  facts: { label: string; value: string }[];
};

/** Changes agents drafted that wait on a person: each one's activity entry shares its id. */
const DRAFTS: Draft[] = [
  {
    id: "d1",
    agentId: "ledger",
    title: "Pay Hollis Supply: $4,200.00",
    receipt: "$4,200.00 to Hollis Supply approved",
    icon: "payments",
    facts: [
      { label: "From", value: "Operating" },
      { label: "Arrives", value: "Thu 27 Nov" },
      { label: "For", value: "Invoice HS-2291" },
    ],
  },
  {
    id: "d2",
    agentId: "quill",
    title: "Pay Arden Studio: $860.00",
    receipt: "$860.00 to Arden Studio approved",
    icon: "payments",
    facts: [
      { label: "From", value: "Design card ending 4417" },
      { label: "Arrives", value: "Today" },
      { label: "For", value: "November retainer" },
    ],
  },
  {
    id: "d3",
    agentId: "ledger",
    title: "Move $12,000.00 to Reserve",
    receipt: "$12,000.00 moved to Reserve",
    icon: "swap_horiz",
    facts: [
      { label: "From", value: "Operating, leaves $38,410.00" },
      { label: "Arrives", value: "Today" },
    ],
  },
];

const TODAY: AgentActivityEntry[] = [
  { id: "d1", agent: "Ledger", owner: "Sara Ito", action: "Prepared a payment of $4,200.00 to Hollis Supply", time: "10:42", outcome: "awaiting" },
  { id: "d3", agent: "Ledger", owner: "Sara Ito", action: "Prepared a transfer of $12,000.00 to Reserve", time: "10:40", outcome: "awaiting" },
  { id: "a1", agent: "Tally", owner: "Omar Haddad", action: "Read the October statement", time: "09:15" },
  { id: "a2", agent: "Tally", owner: "Omar Haddad", action: "Asked for the payroll balance", time: "09:12", outcome: "blocked", reason: "Omar doesn’t hold Payroll" },
];

const YESTERDAY: AgentActivityEntry[] = [
  { id: "d2", agent: "Quill", owner: "June Park", action: "Prepared a card payment of $860.00 to Arden Studio", time: "17:30", outcome: "awaiting" },
  { id: "a3", agent: "Quill", owner: "June Park", action: "Froze the card ending 2208", time: "16:05" },
  { id: "a4", agent: "Ledger", owner: "Sara Ito", action: "Matched 14 receipts to October payments", time: "11:20" },
];

const VERBS: Record<AgentScopeLevel, string> = { none: "", view: "Views", prepare: "Prepares", act: "Manages" };

/** "Views balances, prepares payments": the scope in a few words, from the levels it holds. */
function summarise(scope: Record<string, AgentScopeLevel>): string {
  const parts = AREAS.filter((area) => scope[area.id] && scope[area.id] !== "none").map(
    (area) => `${VERBS[scope[area.id]].toLowerCase()} ${area.label.toLowerCase()}`,
  );
  if (parts.length === 0) return "No access";
  const sentence = parts.join(", ");
  return sentence.charAt(0).toUpperCase() + sentence.slice(1);
}

/* The scope a person can grant: an area they hold at a lower level than an
   agent was given comes back down to theirs when shown. */
function permissionsFor(owner: string): AgentScopePermission[] {
  return AREAS.map((area) => ({ ...area, held: HELD[owner]?.[area.id] ?? "none" }));
}

const CHAT_SUGGESTIONS = [
  { id: "waiting", label: "What’s waiting on me?" },
  { id: "ledger", label: "What can Ledger do?" },
  { id: "blocked", label: "What got blocked today?" },
];

const CHAT_REPLIES: Record<string, string> = {
  waiting:
    "Three drafts wait on approval. Ledger prepared a $4,200.00 payment to Hollis Supply and a $12,000.00 move to Reserve for Sara, and Quill prepared an $860.00 card payment to Arden Studio for June. None of them moves until a person approves it.",
  ledger:
    "Ledger acts for Sara Ito. It can view balances and statements, and prepare payments, which Sara or another approver then approves. It can’t touch cards or payroll, and it can never send a payment on its own.",
  blocked:
    "One request was blocked. At 09:12 Tally asked for the payroll balance for Omar Haddad, and Omar doesn’t hold Payroll himself, so Tally got nothing back.",
};

const CHAT_FALLBACK =
  "This assistant is a mock, so only the suggested questions have real answers. In the live product this reply would come from the agents and the activity on this screen.";

/* ---------------------------------------------------------------- page */

export default function AgentControls() {
  const [chatOpen, setChatOpen] = React.useState(false);
  const appFrame = useAppFrame();
  const [agents, setAgents] = React.useState(AGENTS);
  const [scopes, setScopes] = React.useState(INITIAL_SCOPES);
  const [statuses, setStatuses] = React.useState<Record<string, ActionCardStatus>>({});
  const [withdrawn, setWithdrawn] = React.useState<Record<string, boolean>>({});
  const [editing, setEditing] = React.useState("ledger");
  const [disconnecting, setDisconnecting] = React.useState<AgentConnection | null>(null);

  const agentById = (id: string) => agents.find((agent) => agent.id === id)!;
  const connected = agents.filter((agent) => agent.status !== "disconnected");
  const waiting = DRAFTS.filter((draft) => (statuses[draft.id] ?? "proposed") === "proposed").length;
  const editingAgent = connected.find((agent) => agent.id === editing) ?? connected[0];

  /* The connections list says each agent's scope in a few words, rewritten
     as its levels move. */
  const listed = agents.map((agent) => ({ ...agent, scope: summarise(scopes[agent.id] ?? {}) }));

  /* An activity entry settles with its draft. */
  const settle = (entry: AgentActivityEntry): AgentActivityEntry => {
    const status = statuses[entry.id];
    if (status === "confirmed") return { ...entry, outcome: "done" };
    if (status === "dismissed") {
      return withdrawn[entry.id]
        ? { ...entry, outcome: "declined", reason: `Withdrawn: ${entry.agent} was disconnected` }
        : { ...entry, outcome: "declined", reason: `Declined by ${entry.owner.split(" ")[0]}` };
    }
    return entry;
  };

  const disconnect = (agent: AgentConnection) => {
    setAgents((current) => current.map((entry) => (entry.id === agent.id ? { ...entry, status: "disconnected" } : entry)));
    /* Its drafts waiting on approval are withdrawn with it. */
    const open = DRAFTS.filter((draft) => draft.agentId === agent.id && (statuses[draft.id] ?? "proposed") === "proposed");
    setStatuses((current) => ({ ...current, ...Object.fromEntries(open.map((draft) => [draft.id, "dismissed" as const])) }));
    setWithdrawn((current) => ({ ...current, ...Object.fromEntries(open.map((draft) => [draft.id, true])) }));
  };

  return (
    <TemplateShell
      sidebar={{
        sections: NAV_SECTIONS,
        profile: { name: "Sara Ito", email: "sara@keel.example" },
        activeKey: "agents",
        logo: <ProductMark />,
        logoText: "Keel",
      }}
      chatOpen={chatOpen}
      frame={{ title: "Agents", subtitle: "Keel" }}
      contentClassName={styles.content}
      tabBar={
        <AppFrameTabBar
          sections={NAV_SECTIONS}
          activeKey="agents"
          productName="Keel"
          onAsk={() => setChatOpen(true)}
        />
      }
      assistant={
        <TemplateAssistant
          open={chatOpen}
          onClose={() => setChatOpen(false)}
          title="Keel AI"
          askLine="Ask about your agents, what they did, or what waits on you"
          suggestions={CHAT_SUGGESTIONS}
          replies={CHAT_REPLIES}
          fallback={CHAT_FALLBACK}
          disclaimer="A mock assistant with canned answers over this screen's agents."
        />
      }
    >
      {!appFrame && (
        <StickyTopBar>
          <div className={styles.topBar}>
            <div className={styles.search}>
              <Input placeholder="Search Keel" iconLeft="search" aria-label="Search Keel" />
              <span className={styles.searchKbd} aria-hidden="true">
                <Kbd size="compact">⌘</Kbd>
                <Kbd size="compact">K</Kbd>
              </span>
            </div>
            <div className={styles.topBarActions}>
              <IconButton
                icon="search"
                variant="secondary"
                tone="neutral"
                label="Search Keel"
                className={styles.searchIconMobile}
              />
              <AiButton label="Ask AI" onClick={() => setChatOpen(true)} />
              <IconButton icon="notifications" variant="secondary" tone="neutral" label="Notifications" />
            </div>
          </div>
        </StickyTopBar>
      )}

      {!appFrame && (
        <PageHeader
          title="Agents"
          description="The agents your team has connected to Keel. An agent never holds more than the person who connected it, and no payment moves without a person’s approval."
          actions={<Button variant="secondary" label="Connect an agent" iconLeft="add" />}
        />
      )}

      <div className={styles.board}>
        <div className={styles.column}>
          <Widget title="Waiting on you" count={waiting} description="Changes agents drafted. Nothing moves until a person approves it.">
              <div className={styles.queue}>
                {DRAFTS.map((draft) => {
                  const agent = agentById(draft.agentId);
                  return (
                    <ActionCard
                      key={draft.id}
                      preparedBy={`Prepared by ${agent.name} for ${agent.owner}`}
                      title={draft.title}
                      icon={draft.icon}
                      facts={draft.facts}
                      receipt={draft.receipt}
                      status={statuses[draft.id] ?? "proposed"}
                      confirmLabel="Approve"
                      dismissLabel="Decline"
                      confirmedLabel="Approved"
                      dismissedLabel={withdrawn[draft.id] ? "Withdrawn" : "Declined"}
                      onConfirm={() => setStatuses((current) => ({ ...current, [draft.id]: "confirmed" }))}
                      onDismiss={() => setStatuses((current) => ({ ...current, [draft.id]: "dismissed" }))}
                    />
                  );
                })}
              </div>
          </Widget>

          <Widget title="Activity" description="Everything agents did on this account, naming the agent and the person it acted for.">
            <WidgetGroup label="Today">
              <AgentActivity entries={TODAY.map(settle)} />
            </WidgetGroup>
            <WidgetGroup label="Yesterday">
              <AgentActivity entries={YESTERDAY.map(settle)} />
            </WidgetGroup>
          </Widget>
        </div>

        <div className={styles.column}>
          <Widget title="Connected agents" count={connected.length}>
            <AgentConnections agents={listed} onDisconnect={setDisconnecting} />
          </Widget>

          {editingAgent ? (
            <Widget
              title={`What ${editingAgent.name} can do`}
              description={`Up to what ${editingAgent.owner} can do themselves.`}
              action={
                connected.length > 1 ? (
                  <SegmentedControl
                    size="compact"
                    tone="neutral"
                    aria-label="Agent"
                    segments={connected.map((agent) => ({ value: agent.id, label: agent.name }))}
                    value={editingAgent.id}
                    onValueChange={setEditing}
                  />
                ) : undefined
              }
            >
              <AgentScope
                key={editingAgent.id}
                permissions={permissionsFor(editingAgent.owner)}
                value={scopes[editingAgent.id] ?? {}}
                onValueChange={(value) => setScopes((current) => ({ ...current, [editingAgent.id]: value }))}
              />
            </Widget>
          ) : (
            <Widget title="Scope">
              <EmptyState title="No agents connected" description="Connect an agent to choose what it can do." />
            </Widget>
          )}
        </div>
      </div>

      <AlertDialog
        open={disconnecting !== null}
        onOpenChange={(open) => !open && setDisconnecting(null)}
        title={disconnecting ? `Disconnect ${disconnecting.name}?` : "Disconnect agent?"}
        description={
          disconnecting
            ? `${disconnecting.name} loses access to Keel right away, and any drafts it left waiting on approval are withdrawn. ${disconnecting.owner} can connect it again later.`
            : undefined
        }
        confirmLabel="Disconnect"
        cancelLabel="Keep connected"
        tone="destructive"
        onConfirm={() => {
          if (disconnecting) disconnect(disconnecting);
          setDisconnecting(null);
        }}
      />
    </TemplateShell>
  );
}
