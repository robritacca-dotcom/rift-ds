import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import { AgentActivity, type AgentActivityEntry } from "rift-ds/components/AgentActivity/AgentActivity";
import { Widget, WidgetGroup } from "rift-ds/components/Widget/Widget";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";
import ComponentInstallStrip from "@/components/ComponentInstallStrip/ComponentInstallStrip";

const TODAY: AgentActivityEntry[] = [
  { id: "1", agent: "Ledger", owner: "Sara Ito", action: "Prepared a payment of $4,200.00 to Hollis Supply", time: "10:42", outcome: "awaiting" },
  { id: "2", agent: "Tally", owner: "Omar Haddad", action: "Read the October statement", time: "09:15" },
  { id: "3", agent: "Ledger", owner: "Sara Ito", action: "Asked for the payroll balance", time: "08:58", outcome: "blocked", reason: "Sara doesn’t hold Payroll" },
];

const YESTERDAY: AgentActivityEntry[] = [
  { id: "4", agent: "Quill", owner: "June Park", action: "Froze the card ending 4417", time: "17:30" },
  { id: "5", agent: "Ledger", owner: "Sara Ito", action: "Prepared a transfer of $12,000.00 to Reserve", time: "14:05", outcome: "declined", reason: "Declined by Sara" },
];

export default function AgentActivityPage() {
  return (
    <div className={styles.dsContent}>
      <PageBreadcrumb />
      <div className={`${styles.pageHeader} animate-in`}>
        <h1 className={styles.pageTitle}>Agent activity</h1>
        <PageLinks storybookPath="/?path=/docs/components-agentactivity--docs" />
      </div>

      <div className={`${styles.introSection} animate-in animate-delay-1`}>
        <p className={styles.subDisplay}>Nothing an agent does happens out of sight</p>
        <p className={styles.introBody}>
          Agent activity is the record of what agents did on an account, newest first. Every entry names both the agent and the person it acted for, so no action reads as the agent’s alone. A change it drafted is marked as waiting on approval. A request outside the person’s own access is marked as blocked, with the reason. Each entry is a Widget row, so the log sits in a Widget and splits by day with Widget groups.
        </p>
      </div>

      <section className={styles.section}>
        <SectionTitle title="By day" />
        <div className={styles.demoSurface}>
          <Widget title="Agent activity">
            <WidgetGroup label="Today">
              <AgentActivity entries={TODAY} />
            </WidgetGroup>
            <WidgetGroup label="Yesterday">
              <AgentActivity entries={YESTERDAY} />
            </WidgetGroup>
          </Widget>
        </div>
      </section>

      <ComponentInstallStrip slug="agent-activity" />
    </div>
  );
}
