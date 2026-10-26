/**
 * The dashboard block: the app shell with a row of stats, two panels and a
 * table. The numbers are placeholders; swap each array for your data.
 *
 * The table is a DataTable with typed columns, so it needs no render
 * functions: the status is a Badge in its option's role, the owner a
 * person, the due date a date, each sorting and filtering by its type.
 * Plain column objects can pass from this server page to the client
 * table, which a render function could not. TableToolbar is its control
 * bar: search, filters, sort and the column panel.
 */

import { Button } from 'rift-ds/components/Button/Button';
import { Panel } from 'rift-ds/components/Panel/Panel';
import { ProgressBar } from 'rift-ds/components/ProgressBar/ProgressBar';
import { Stat } from 'rift-ds/components/Stat/Stat';
import { DataTable, type DataTableColumn, type DataTableRow } from 'rift-ds/components/DataTable/DataTable';
import { TableToolbar } from 'rift-ds/components/TableToolbar/TableToolbar';
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

const STATUSES = [
  { value: 'Planned', label: 'Planned', status: 'neutral' },
  { value: 'On track', label: 'On track', status: 'positive' },
  { value: 'At risk', label: 'At risk', status: 'warning' },
  { value: 'Off track', label: 'Off track', status: 'error' },
] as const;

const COLUMNS: DataTableColumn[] = [
  { key: 'project', header: 'Project', rowHeader: true, sortable: true },
  { key: 'owner', header: 'Owner', type: 'person', sortable: true },
  { key: 'status', header: 'Status', type: 'status', sortable: true, options: [...STATUSES] },
  { key: 'due', header: 'Due', type: 'date', sortable: true },
];

const PROJECTS = [
  { project: 'Website refresh', owner: 'Priya Shah', status: 'On track', due: '2026-11-14' },
  { project: 'Mobile app', owner: 'Sam Rivera', status: 'At risk', due: '2026-12-02' },
  { project: 'Billing migration', owner: 'Jordan Lee', status: 'On track', due: '2026-11-08' },
  { project: 'Onboarding emails', owner: 'Lee Chen', status: 'Off track', due: '2026-10-30' },
  { project: 'Partner portal', owner: 'Alex Morgan', status: 'Planned', due: '2027-01-15' },
];

const ROWS: DataTableRow[] = PROJECTS.map((p) => ({ id: p.project, values: p }));

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

      {/* The table sits on the page, not in a Panel: it brings its own bordered frame. */}
      <section className={styles.tableSection} aria-labelledby="projects-title">
        <h2 id="projects-title" className={styles.panelTitle}>
          Projects
        </h2>
        <DataTable
          columns={COLUMNS}
          rows={ROWS}
          caption="Projects"
          defaultSort={{ key: 'due', direction: 'asc' }}
          phoneLayout="stack"
          toolbar={<TableToolbar />}
        />
      </section>
    </AppShell>
  );
}
