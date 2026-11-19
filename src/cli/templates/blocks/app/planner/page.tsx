/**
 * The planner block: the app shell with a plan laid out across weeks, one
 * editable column per week, a total for each row, a subtotal for each team
 * and a sum for each week, beside a queue of requests waiting on a yes or a
 * no. The figures are placeholders; read and write your own (PlannerGrid.tsx
 * and Requests.tsx beside this page hold them).
 */

import { Button } from 'rift-ds/components/Button/Button';
import { Widget } from 'rift-ds/components/Widget/Widget';
import { AppShell } from '../../components/blocks/AppShell';
import { PlannerGrid } from './PlannerGrid';
import { Requests } from './Requests';
import styles from './page.module.css';

export default function PlannerPage() {
  return (
    <AppShell
      activeKey="projects"
      breadcrumb={[{ label: 'Acme', href: '#' }, { label: 'Planner' }]}
      title="Planner"
      actions={<Button label="Add a row" variant="secondary" iconLeft="add" />}
    >
      <div className={styles.layout}>
        <Widget title="Days planned by week" padding="none" className={styles.plan}>
          <PlannerGrid />
        </Widget>
        <Requests className={styles.queue} />
      </div>
    </AppShell>
  );
}
