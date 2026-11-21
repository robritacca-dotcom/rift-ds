/**
 * The docs block: one documentation page in the docs shell, showing every
 * piece a docs page needs. Keep the shell, replace this article with
 * yours, and give each page its own `currentHref` and breadcrumb.
 *
 * Code here is monochrome. To colour it, install shiki and pass
 * `lines={await highlight(code, 'tsx')}` (from `rift-ds/code/highlight`)
 * to each CodeBlock, in a Server Component such as this page, so the page
 * ships no highlighter.
 */

import { Alert } from 'rift-ds/components/Alert/Alert';
import { ArtifactPanel } from 'rift-ds/components/ArtifactPanel/ArtifactPanel';
import { Button } from 'rift-ds/components/Button/Button';
import { CodeBlock } from 'rift-ds/components/CodeBlock/CodeBlock';
import { Figure } from 'rift-ds/components/Figure/Figure';
import { Heading } from 'rift-ds/components/Heading/Heading';
import { Instructions } from 'rift-ds/components/Instructions/Instructions';
import { Link } from 'rift-ds/components/Link/Link';
import { Pagination } from 'rift-ds/components/Pagination/Pagination';
import { Prose } from 'rift-ds/components/Prose/Prose';
import { Table } from 'rift-ds/components/Table/Table';
import { TreeView } from 'rift-ds/components/TreeView/TreeView';
import { packageManagerTabs } from 'rift-ds/code';
import { DocsShell } from '../../components/blocks/DocsShell';
import { PageFeedback } from './PageFeedback';
import styles from './page.module.css';

const USAGE = `import { Button } from 'rift-ds/components/Button/Button';

export function SaveBar() {
  return <Button variant="primary">Save changes</Button>;
}`;

export default function GuidePage() {
  return (
    <DocsShell currentHref="#installation" breadcrumb={[{ label: 'Docs', href: '#docs' }, { label: 'Installation' }]}>
      <header className={styles.intro}>
        <Heading level={1} tier="display-2">
          Installation
        </Heading>
        <p className={styles.lead}>
          Add Acme to a React app, set up its theme, and render your first component.
        </p>
      </header>

      <section className={styles.section}>
        <Heading level={2} anchor>
          Install the package
        </Heading>
        <Prose>
          <p>Install it with the package manager your app uses. Your pick is remembered on every page.</p>
        </Prose>
        <CodeBlock tabs={packageManagerTabs({ install: 'acme-ui' })} syncKey="package-manager" />
        <Alert
          variant="info"
          title="React 19 or later"
          description="Acme relies on React 19's ref as a prop. Upgrade React first if your app is on 18."
        />
      </section>

      <section className={styles.section}>
        <Heading level={2} anchor>
          Set up the theme
        </Heading>
        <Instructions
          steps={[
            { label: 'Import the stylesheet', description: 'Once, in your root layout, before your own CSS.' },
            { label: 'Load the font', description: 'Through your framework’s font loader, or a link in the head.' },
            { label: 'Set the colour mode', description: 'Render the colour mode script in the head so the first paint is right.' },
          ]}
        />
        <CodeBlock
          tabs={packageManagerTabs({ run: 'acme-ui init' })}
          syncKey="package-manager"
        />
      </section>

      <section className={styles.section}>
        <Heading level={2} anchor>
          Your first component
        </Heading>
        <ArtifactPanel layout="inline" viewLabel="Button example" code={USAGE} language="tsx">
          <Button variant="primary">Save changes</Button>
        </ArtifactPanel>
        <Heading level={3} anchor>
          Props
        </Heading>
        <Table
          bordered
          size="compact"
          caption="Button props"
          captionHidden
          columns={[
            { key: 'prop', header: 'Prop', mono: true, width: '24%', rowHeader: true },
            { key: 'type', header: 'Type', mono: true, width: '36%' },
            { key: 'description', header: 'Description' },
          ]}
          rows={[
            { id: 'variant', cells: { prop: 'variant', type: "'primary' | 'secondary' | 'tertiary'", description: 'How much the button stands out.' } },
            { id: 'size', cells: { prop: 'size', type: "'default' | 'compact'", description: 'The control height.' } },
            { id: 'disabled', cells: { prop: 'disabled', type: 'boolean', description: 'Holds the button still.' } },
          ]}
        />
      </section>

      <section className={styles.section}>
        <Heading level={2} anchor>
          Writing labels
        </Heading>
        <div className={styles.pair}>
          <Figure variant="positive" caption="Say what happens when it is pressed.">
            <div className={styles.specimen}>
              <Button variant="primary">Save changes</Button>
            </div>
          </Figure>
          <Figure variant="error" caption="Leave the reader guessing what the button does.">
            <div className={styles.specimen}>
              <Button variant="primary">Click here</Button>
            </div>
          </Figure>
        </div>
      </section>

      <section className={styles.section}>
        <Heading level={2} anchor>
          Project structure
        </Heading>
        <TreeView
          aria-label="Project files"
          defaultExpandedIds={['app', 'components']}
          nodes={[
            {
              id: 'app',
              label: 'app',
              icon: 'folder',
              children: [
                { id: 'layout', label: 'layout.tsx', icon: 'description' },
                { id: 'page', label: 'page.tsx', icon: 'description' },
              ],
            },
            {
              id: 'components',
              label: 'components',
              icon: 'folder',
              children: [{ id: 'save-bar', label: 'SaveBar.tsx', icon: 'description' }],
            },
          ]}
        />
      </section>

      <footer className={styles.pageFooter}>
        <div className={styles.meta}>
          <Link variant="standalone" size="compact" href="#edit" iconLeft="edit">
            Edit this page
          </Link>
          <span className={styles.updated}>Last updated 12 Nov 2026</span>
        </div>
        <PageFeedback />
        <Pagination
          variant="adjacent"
          previous={{ href: '#introduction', label: 'Introduction' }}
          next={{ href: '#theming', label: 'Theming' }}
        />
      </footer>
    </DocsShell>
  );
}
