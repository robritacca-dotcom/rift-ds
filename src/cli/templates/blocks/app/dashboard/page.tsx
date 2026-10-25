/**
 * The dashboard block: the app shell with a row of stats, two panels and a
 * table. The numbers are placeholders; swap each array for your data.
 */

import { Badge } from 'rift-ds/components/Badge/Badge';
import { Button } from 'rift-ds/components/Button/Button';
import { Panel } from 'rift-ds/components/Panel/Panel';
import { ProgressBar } from 'rift-ds/components/ProgressBar/ProgressBar';
import { Stat } from 'rift-ds/components/Stat/Stat';
import { Table, type TableColumn, type TableRow } from 'rift-ds/components/Table/Table';
import { AppShell } from '../../components/blocks/AppShell';
import styles from './page.module.css';

const STATS = [
  { label: 'Open tasks', value: '128', delta: '+12', trend: 'up' },
  { label: 'Due this week', value: '24', delta: '-3', trend: 'down' },
  { label: 'Completed', value: '342', delta: '+18%', trend: 'up' },
  { label: 'Avg. cycle time', value: '3.2d', delta: '-0.4d', trend: 'up' },
] as const;

const PROGRESS = [
  { name: 'Website refresh', done: 72 },
  { name: 'Mobile app', done: 45 },
  { name: 'Billing migration', done: 88 },
  { name: 'Onboarding emails', done: 20 },
];

const ACTIVITY = [
  { who: 'Priya', what: 'closed', item: 'Fix login redirect', when: '10 min ago' },
  { who: 'Sam', what: 'commented on', item: 'Pricing page copy', when: '1 hr ago' },
  { who: 'Jordan', what: 'created', item: 'Q4 roadmap review', when: '3 hr ago' },
  { who: 'Lee', what: 'moved', item: 'Invoice export to Review', when: 'Yesterday' },
];

const STATUS = {
  'On track': 'positive',
  'At risk': 'warning',
  'Off track': 'error',
  Planned: 'neutral',
} as const;

const COLUMNS: TableColumn[] = [
  { key: 'project', header: 'Project' },
  { key: 'owner', header: 'Owner' },
  { key: 'status', header: 'Status' },
  { key: 'due', header: 'Due', align: 'right' },
];

const PROJECTS: { project: string; owner: string; status: keyof typeof STATUS; due: string }[] = [
  { project: 'Website refresh', owner: 'Priya Shah', status: 'On track', due: 'Nov 14' },
  { project: 'Mobile app', owner: 'Sam Rivera', status: 'At risk', due: 'Dec 2' },
  { project: 'Billing migration', owner: 'Jordan Lee', status: 'On track', due: 'Nov 8' },
  { project: 'Onboarding emails', owner: 'Lee Chen', status: 'Off track', due: 'Oct 30' },
  { project: 'Partner portal', owner: 'Alex Morgan', status: 'Planned', due: 'Jan 15' },
];

const ROWS: TableRow[] = PROJECTS.map((p) => ({
  id: p.project,
  cells: {
    project: p.project,
    owner: p.owner,
    status: <Badge label={p.status} variant={STATUS[p.status]} />,
    due: p.due,
  },
}));

export default function DashboardPage() {
  return (
    <AppShell
      activeKey="dashboard"
      breadcrumb={[{ label: 'Workspace', href: '#' }, { label: 'Dashboard' }]}
      title="Dashboard"
      actions={
        <>
          <Button variant="secondary" size="compact" label="Export" iconLeft="download" />
          <Button variant="primary" size="compact" label="New task" iconLeft="add" />
        </>
      }
    >
      <div className={styles.stats}>
        {STATS.map((stat) => (
          <Panel key={stat.label}>
            <Stat
              label={stat.label}
              value={stat.value}
              delta={stat.delta}
              trend={stat.trend}
              deltaPlacement="inline"
            />
          </Panel>
        ))}
      </div>

      <div className={styles.panels}>
        <Panel>
          <h2 className={styles.panelTitle}>Progress by project</h2>
          <ul className={styles.list}>
            {PROGRESS.map((row) => (
              <li key={row.name} className={styles.progressRow}>
                <div className={styles.progressMeta}>
                  <span>{row.name}</span>
                  <span className={styles.muted}>{row.done}%</span>
                </div>
                <ProgressBar value={row.done} size="compact" ariaLabel={`${row.name} progress`} />
              </li>
            ))}
          </ul>
        </Panel>

        <Panel>
          <h2 className={styles.panelTitle}>Recent activity</h2>
          <ul className={styles.list}>
            {ACTIVITY.map((row) => (
              <li key={row.item} className={styles.activityRow}>
                <span>
                  <strong className={styles.strong}>{row.who}</strong> {row.what} {row.item}
                </span>
                <span className={styles.muted}>{row.when}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <Panel>
        <h2 className={styles.panelTitle}>Projects</h2>
        <div className={styles.tableScroll}>
          <Table columns={COLUMNS} rows={ROWS} caption="Projects" captionHidden />
        </div>
      </Panel>
    </AppShell>
  );
}
