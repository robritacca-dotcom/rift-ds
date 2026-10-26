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
    <span style={{ display: 'inline-flex', gap: 'var(--gap-050)' }}>
      <Kbd>⌘</Kbd>
      <Kbd>⇧</Kbd>
      <Kbd>P</Kbd>
    </span>
  ),
};

/** Keycaps sit inline with body text. */
/** A whole shortcut from `keys`, drawn in the reader's platform legends: ⇧ ⌘ P on a Mac, Ctrl Shift P elsewhere. */
export const Shortcut: Story = {
  args: { keys: 'mod+shift+p' },
};

/** A sequence draws each step as its own group. */
export const Sequence: Story = {
  args: { keys: 'g i' },
};

/** `keyLabels` replaces a legend, here for a German keyboard. */
export const LocalisedLegends: Story = {
  args: { keys: 'ctrl+alt+delete', keyLabels: { ctrl: 'Strg', delete: 'Entf' } },
};

export const InProse: Story = {
  render: () => (
    <p style={{ margin: 0 }}>
      Press <Kbd size="compact">⌘</Kbd> <Kbd size="compact">K</Kbd> to open the
      command palette.
    </p>
  ),
};
