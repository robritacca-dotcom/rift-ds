import type { Meta, StoryObj } from '@storybook/react-vite';
import { Kbd } from './Kbd';

const meta = {
  title: 'Components/Kbd',
  component: Kbd,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['default', 'compact'],
    },
    children: {
      control: 'text',
    },
  },
  args: {
    children: 'K',
    size: 'default',
  },
} satisfies Meta<typeof Kbd>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ModifierKey: Story = {
  args: { children: '⌘' },
};

export const NamedKey: Story = {
  args: { children: 'Esc' },
};

export const Compact: Story = {
  args: { children: 'K', size: 'compact' },
};

/** Compose several Kbds for a chord. */
export const Chord: Story = {
  render: () => (
    <span style={{ display: 'inline-flex', gap: 'var(--gap-xxs)' }}>
      <Kbd>⌘</Kbd>
      <Kbd>⇧</Kbd>
      <Kbd>P</Kbd>
    </span>
  ),
};

/** Keycaps sit inline with body text. */
export const InProse: Story = {
  render: () => (
    <p style={{ margin: 0 }}>
      Press <Kbd size="compact">⌘</Kbd> <Kbd size="compact">K</Kbd> to open the
      command palette.
    </p>
  ),
};
