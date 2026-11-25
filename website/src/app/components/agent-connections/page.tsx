"use client";

import React from "react";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import { AgentConnections, type AgentConnection } from "rift-ds/components/AgentConnections/AgentConnections";
import { Widget } from "rift-ds/components/Widget/Widget";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";
import ComponentInstallStrip from "@/components/ComponentInstallStrip/ComponentInstallStrip";

const AGENTS: AgentConnection[] = [
  { id: "ledger", name: "Ledger", owner: "Sara Ito", scope: "Views balances, prepares payments", lastActive: "Active 2h ago" },
  { id: "tally", name: "Tally", owner: "Omar Haddad", scope: "Views statements", lastActive: "Active yesterday" },
  { id: "quill", name: "Quill", owner: "June Park", scope: "Manages cards", lastActive: "Active Mon" },
];

function Connections() {
  const [agents, setAgents] = React.useState(AGENTS);
  return (
    <Widget title="Connected agents" count={agents.filter((agent) => agent.status !== "disconnected").length}>
      <AgentConnections
        agents={agents}
        onDisconnect={(agent) =>
          setAgents((current) => current.map((entry) => (entry.id === agent.id ? { ...entry, status: "disconnected" } : entry)))
        }
      />
    </Widget>
  );
}

export default function AgentConnectionsPage() {
  return (
    <div className={styles.dsContent}>
      <PageBreadcrumb />
      <div className={`${styles.pageHeader} animate-in`}>
        <h1 className={styles.pageTitle}>Agent connections</h1>
        <PageLinks storybookPath="/?path=/docs/components-agentconnections--docs" />
      </div>

      <div className={`${styles.introSection} animate-in animate-delay-1`}>
        <p className={styles.subDisplay}>Every agent, who it acts for, and a way to cut it off</p>
        <p className={styles.introBody}>
          Agent connections lists the agents connected to an account. Each row names the person the agent acts for, what it may do and when it last acted, with a Disconnect named for that agent. Your code revokes the access, so it owns whether an agent is connected. A disconnected agent stays in the list as a record, so the list never forgets who had access. Focus moves to the row once its button has gone, and the change is announced.
        </p>
      </div>

      <section className={styles.section}>
        <SectionTitle title="Disconnect at once" />
        <div className={styles.demoSurface}>
          <Connections />
        </div>
      </section>

      <section className={styles.section}>
        <SectionTitle title="Read only" />
        <p className={styles.introBody}>Without a Disconnect handler the rows offer no control, for someone who can see the agents but not remove them.</p>
        <div className={styles.demoSurface}>
          <Widget title="Connected agents">
            <AgentConnections agents={[...AGENTS.slice(0, 2), { ...AGENTS[2], status: "disconnected" }]} />
          </Widget>
        </div>
      </section>

      <ComponentInstallStrip slug="agent-connections" />
    </div>
  );
}
