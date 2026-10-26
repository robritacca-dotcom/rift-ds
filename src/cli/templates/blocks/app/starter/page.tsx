/**
 * The app-shell block: the shell around an empty page, ready for its first
 * real content. Replace the empty state with yours; the shell keeps the
 * spacing.
 */

import { Button } from 'rift-ds/components/Button/Button';
import { EmptyState } from 'rift-ds/components/EmptyState/EmptyState';
import { Panel } from 'rift-ds/components/Panel/Panel';
import { AppShell } from '../../components/blocks/AppShell';
import styles from './page.module.css';

export default function StarterPage() {
  return (
    <AppShell
      activeKey="home"
      breadcrumb={[{ label: 'Workspace', href: '#' }, { label: 'Home' }]}
      title="Home"
      actions={<Button variant="primary" size="compact" label="New project" iconLeft="add" />}
    >
      <Panel className={styles.empty}>
        <EmptyState
          icon="dashboard_customize"
          title="Your page starts here"
          description="The shell holds the navigation, the top bar and the spacing. Put this page's content in this column."
          action={<Button variant="secondary" size="compact" label="Add a section" iconLeft="add" />}
        />
      </Panel>
    </AppShell>
  );
}
