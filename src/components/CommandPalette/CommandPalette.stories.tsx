import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { CommandPalette } from './CommandPalette';
import type { CommandPaletteGroup } from './CommandPalette';
import { Badge } from '../Badge/Badge';
import { Button } from '../Button/Button';

const groups: CommandPaletteGroup[] = [
  {
    label: 'Navigation',
    commands: [
      { id: 'home', label: 'Go to Home', icon: 'home', shortcut: ['G', 'H'] },
      { id: 'components', label: 'Go to Components', icon: 'widgets', shortcut: ['G', 'C'] },
      {
        id: 'foundations',
        label: 'Go to Foundations',
        description: 'Tokens, colour, typography, spacing',
        icon: 'palette',
      },
      {
        id: 'journal',
        label: 'Go to Project Journal',
        icon: 'timeline',
        keywords: ['updates', 'changelog'],
      },
    ],
  },
  {
    label: 'Actions',
    commands: [
      { id: 'new', label: 'New component', icon: 'add', shortcut: ['⌘', 'N'] },
      { id: 'search', label: 'Search documentation', icon: 'search', shortcut: ['⌘', 'F'] },
      {
        id: 'theme',
        label: 'Toggle dark mode',
        description: 'Switch between the light and dark themes',
        icon: 'dark_mode',
        keywords: ['theme', 'light', 'appearance'],
      },
      { id: 'export', label: 'Export tokens', icon: 'download', disabled: true },
    ],
  },
  {
    label: 'Help',
    commands: [
      { id: 'docs', label: 'Read the docs', icon: 'menu_book' },
      { id: 'shortcuts', label: 'Keyboard shortcuts', icon: 'keyboard', shortcut: ['?'] },
    ],
  },
];

const meta = {
  title: 'Components/CommandPalette',
  component: CommandPalette,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    placeholder: { control: 'text' },
    emptyMessage: { control: 'text' },
    loading: { control: 'boolean' },
    hotkey: { control: 'boolean' },
    hideFooter: { control: 'boolean' },
  },
  args: {
    open: false,
    onOpenChange: () => {},
    groups,
  },
} satisfies Meta<typeof CommandPalette>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Trigger + palette wrapper so stories are openable */
const PaletteDemo = (
  props: Omit<React.ComponentProps<typeof CommandPalette>, 'open' | 'onOpenChange'>
) => {
  const [open, setOpen] = useState(false);
  const [lastRun, setLastRun] = useState<string | null>(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
      <Button label="Open palette (⌘K)" variant="secondary" onClick={() => setOpen(true)} />
      {lastRun && (
        <p style={{ margin: 0, fontSize: '14px', color: 'var(--color-text-tertiary)' }}>
          Last command: {lastRun}
        </p>
      )}
      <CommandPalette
        {...props}
        open={open}
        onOpenChange={setOpen}
        onSelect={(command) => setLastRun(command.label)}
      />
    </div>
  );
};

export const Default: Story = {
  render: (args) => <PaletteDemo {...args} />,
};

export const WithoutHotkey: Story = {
  render: (args) => <PaletteDemo {...args} hotkey={false} />,
};

export const WithoutFooter: Story = {
  render: (args) => <PaletteDemo {...args} hideFooter />,
};

export const Loading: Story = {
  render: (args) => <PaletteDemo {...args} loading />,
};

export const NoResults: Story = {
  render: (args) => (
    <PaletteDemo {...args} groups={[]} emptyMessage="Nothing matched — try a different term." />
  ),
};

export const SingleGroup: Story = {
  render: (args) => <PaletteDemo {...args} groups={[groups[1]]} placeholder="Search actions…" />,
};

/**
 * The trailing slot: an arbitrary non-interactive node at the row's right
 * edge, after any keycaps — a status badge here. Always open so the slot is
 * visible in docs and snapshots.
 */
export const WithTrailing: Story = {
  render: (args) => {
    const [open, setOpen] = useState(true);
    return (
      <div style={{ minHeight: '420px' }}>
        <CommandPalette
          {...args}
          open={open}
          onOpenChange={setOpen}
          hotkey={false}
          groups={[
            {
              label: 'Actions',
              commands: [
                {
                  id: 'summarize',
                  label: 'Summarize this page',
                  description: 'A model writes the TLDR',
                  icon: 'auto_awesome',
                  trailing: <Badge label="AI" variant="info" />,
                },
                {
                  id: 'export-figma',
                  label: 'Export to Figma',
                  icon: 'upload',
                  trailing: <Badge label="Beta" variant="warning" />,
                },
                { id: 'copy-link', label: 'Copy link', icon: 'link', shortcut: ['⌘', 'C'] },
              ],
            },
          ]}
        />
      </div>
    );
  },
};

/** Always-open variant so the panel is visible in docs and snapshots. */
export const AlwaysOpen: Story = {
  render: (args) => {
    const [open, setOpen] = useState(true);
    return (
      <div style={{ minHeight: '420px' }}>
        <CommandPalette {...args} open={open} onOpenChange={setOpen} hotkey={false} />
      </div>
    );
  },
};
