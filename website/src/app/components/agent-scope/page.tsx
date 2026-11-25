"use client";

import React from "react";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import { AgentScope, type AgentScopeLevel, type AgentScopePermission } from "rift-ds/components/AgentScope/AgentScope";
import { Widget } from "rift-ds/components/Widget/Widget";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";
import ComponentInstallStrip from "@/components/ComponentInstallStrip/ComponentInstallStrip";

const PERMISSIONS: AgentScopePermission[] = [
  { id: "balances", label: "Balances", description: "Accounts and what is in them", icon: "account_balance", held: "act", levels: ["none", "view"] },
  { id: "payments", label: "Payments", description: "Send and schedule payments", icon: "payments", held: "act", approval: true },
  { id: "cards", label: "Cards", description: "Card limits and freezes", icon: "credit_card", held: "act" },
  { id: "statements", label: "Statements", description: "Monthly statements and exports", icon: "description", held: "view", levels: ["none", "view"] },
  { id: "payroll", label: "Payroll", description: "Pay runs and payslips", icon: "badge", held: "none" },
];

function Scope({ permissions }: { permissions: AgentScopePermission[] }) {
  const [value, setValue] = React.useState<Record<string, AgentScopeLevel>>({ balances: "view", payments: "prepare" });
  return (
    <Widget title="What Ledger can do" description="Never more than you can do yourself">
      <AgentScope permissions={permissions} value={value} onValueChange={setValue} />
    </Widget>
  );
}

export default function AgentScopePage() {
  return (
    <div className={styles.dsContent}>
      <PageBreadcrumb />
      <div className={`${styles.pageHeader} animate-in`}>
        <h1 className={styles.pageTitle}>Agent scope</h1>
        <PageLinks storybookPath="/?path=/docs/components-agentscope--docs" />
      </div>

      <div className={`${styles.introSection} animate-in animate-delay-1`}>
        <p className={styles.subDisplay}>Never more than the person behind it</p>
        <p className={styles.introBody}>
          Agent scope sets how far an agent may go in each area of an account: off, view, prepare a change for a person to approve, or act on its own. Each area offers levels only up to what the person connecting the agent holds themselves. Anything past that is left out rather than shown disabled, and an area they don’t hold at all isn’t listed, with a closing line counting what was left out. An area that moves money never offers Act, so its drafts always wait on a person. An agent starts with nothing.
        </p>
      </div>

      <section className={styles.section}>
        <SectionTitle title="An admin connecting an agent" />
        <div className={styles.demoSurface}>
          <Scope permissions={PERMISSIONS} />
        </div>
      </section>

      <section className={styles.section}>
        <SectionTitle title="A person with less access" />
        <p className={styles.introBody}>
          The same areas for someone who can only view cards: the agent’s ceiling falls with theirs.
        </p>
        <div className={styles.demoSurface}>
          <Scope permissions={PERMISSIONS.map((permission) => (permission.id === "cards" ? { ...permission, held: "view" as const } : permission))} />
        </div>
      </section>

      <ComponentInstallStrip slug="agent-scope" />
    </div>
  );
}
