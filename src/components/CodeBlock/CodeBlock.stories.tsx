import type { Meta, StoryObj } from '@storybook/react-vite';
import { CodeBlock } from './CodeBlock';

const SAMPLE_TSX = `import { Chip } from '@robr0/design-system/components/Chip/Chip';

<Chip label="Filter" icon="check" selected onClick={toggle} />`;

const SAMPLE_CSS = `.ds-button {
  background-color: var(--color-action-primary-bg);
  border-radius: var(--radius-full);
  padding: var(--padding-sm) var(--padding-lg);
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
