import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { CodeBlock, type CodeLine } from './CodeBlock';
import { packageManagerTabs } from '../../code';

const SAMPLE_TSX = `import { Chip } from 'rift-ds/components/Chip/Chip';

<Chip label="Filter" icon="check" selected onClick={toggle} />`;

const SAMPLE_CSS = `.ds-button {
  background-color: var(--color-action-primary-bg);
  border-radius: var(--radius-pill);
  padding: var(--padding-200) var(--padding-500);
}`;

const meta = {
  title: 'Components/CodeBlock',
  component: CodeBlock,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    code: { control: 'text' },
    language: { control: 'text' },
    filename: { control: 'text' },
    showCopy: { control: 'boolean' },
    maxHeight: {
      control: 'number',
    },
    collapsible: {
      control: 'boolean',
    },
    defaultCollapsed: {
      control: 'boolean',
    },
  },
  args: {
    code: SAMPLE_TSX,
  },
} satisfies Meta<typeof CodeBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    code: SAMPLE_TSX,
    language: 'tsx',
  },
};

export const WithFilename: Story = {
  args: {
    code: SAMPLE_CSS,
    filename: 'Button.css',
    language: 'css',
  },
};

export const NoHeader: Story = {
  args: {
    code: 'npm run storybook',
    showCopy: false,
  },
};

const SAMPLE_LONG_CSS = `:root {
  --color-action-primary-bg: var(--primitive-teal-08);
  --color-action-primary-bg-hover: var(--primitive-teal-09);
  --color-action-passive-bg: var(--primitive-neutral-02);
  --color-action-passive-bg-hover: var(--primitive-neutral-03);
  --color-bg-page: var(--primitive-white);
  --color-bg-container-primary: var(--primitive-neutral-01);
  --color-bg-container-secondary: var(--primitive-neutral-02);
  --color-bg-container-tertiary: var(--primitive-neutral-03);
  --color-bg-container-border: var(--primitive-neutral-03);
  --color-text-primary: var(--primitive-neutral-09);
  --color-text-secondary: var(--primitive-neutral-07);
  --color-text-tertiary: var(--primitive-neutral-05);
  --color-status-info: var(--primitive-blue-07);
  --color-status-positive: var(--primitive-green-07);
  --color-status-warning: var(--primitive-orange-07);
  --color-status-error: var(--primitive-red-07);
  --color-status-neutral: var(--primitive-neutral-06);
}`;

export const MaxHeight: Story = {
  args: {
    code: SAMPLE_LONG_CSS,
    filename: 'tokens-light.css',
    language: 'css',
    maxHeight: 200,
  },
};

export const Collapsible: Story = {
  args: {
    code: SAMPLE_CSS,
    filename: 'Button.css',
    language: 'css',
    collapsible: true,
  },
};

export const CollapsedByDefault: Story = {
  args: {
    code: SAMPLE_CSS,
    filename: 'Button.css',
    language: 'css',
    collapsible: true,
    defaultCollapsed: true,
  },
};

export const LongLines: Story = {
  args: {
    code: `--color-action-primary-bg: var(--primitive-teal-08); /* #0E6E8F — primary CTA fill, focus rings, active input borders. Never decorative. */`,
    filename: 'tokens-light.css',
    language: 'css',
  },
};

/** What `highlight(SAMPLE_TSX, 'tsx')` from `rift-ds/code/highlight` returns, written out so the story needs no highlighter. */
const HIGHLIGHTED_TSX: CodeLine[] = [
  [
    { content: 'import', role: 'keyword' },
    { content: ' { Chip } ' },
    { content: 'from', role: 'keyword' },
    { content: ' ' },
    { content: "'rift-ds/components/Chip/Chip'", role: 'string' },
    { content: ';' },
  ],
  [],
  [{ content: '// A filter that is on', role: 'comment' }],
  [
    { content: '<' },
    { content: 'Chip', role: 'constant' },
    { content: ' ' },
    { content: 'label', role: 'function' },
    { content: '=', role: 'keyword' },
    { content: '"Filter"', role: 'string' },
    { content: ' ' },
    { content: 'icon', role: 'function' },
    { content: '=', role: 'keyword' },
    { content: '"check"', role: 'string' },
    { content: ' ' },
    { content: 'selected', role: 'function' },
    { content: ' />' },
  ],
];

/** Highlighted lines: each run coloured by its syntax role. */
export const Highlighted: Story = {
  args: {
    code: undefined,
    lines: HIGHLIGHTED_TSX,
    filename: 'FilterChip.tsx',
  },
};

/** Line numbers, with the lines a step changed marked. */
export const LineNumbers: Story = {
  args: {
    code: undefined,
    lines: HIGHLIGHTED_TSX,
    filename: 'FilterChip.tsx',
    showLineNumbers: true,
    highlightLines: [4],
  },
};

/** One command per package manager; the pick is shared with every block on the page that names the same `syncKey`. */
export const PackageManagerTabs: Story = {
  args: {
    code: undefined,
    tabs: packageManagerTabs({ install: 'rift-ds' }),
    syncKey: 'storybook-package-manager',
  },
  render: (args) => (
    <div style={{ display: 'grid', gap: 'var(--gap-400)' }}>
      <CodeBlock {...args} />
      <CodeBlock {...args} tabs={packageManagerTabs({ run: 'rift-ds init' })} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const [first] = canvas.getAllByRole('tablist');
    await userEvent.click(within(first).getByRole('tab', { name: 'pnpm' }));
    // Both blocks follow the pick.
    const panels = canvas.getAllByRole('tabpanel');
    await expect(panels[0]).toHaveTextContent('pnpm add rift-ds');
    await expect(panels[1]).toHaveTextContent('pnpm dlx rift-ds init');
    // Rest on npm so the next run starts where this one did.
    await userEvent.click(within(first).getByRole('tab', { name: 'npm' }));
  },
};
