import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { CircularButton } from './CircularButton';

const meta = {
  title: 'Components/CircularButton',
  component: CircularButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    icon: { control: 'text' },
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'tertiary'],
    },
    tone: {
      control: 'select',
      options: ['default', 'neutral', 'destructive'],
    },
    state: {
      control: 'select',
      options: ['default', 'hover', 'active', 'disabled'],
    },
    size: {
      control: 'select',
      options: ['default', 'compact'],
    },
    loading: {
      control: 'boolean',
    },
    ariaLabel: { control: 'text' },
    tooltip: { control: 'text' },
    tooltipPosition: {
      control: 'select',
      options: ['top', 'bottom', 'left', 'right'],
    },
  },
  args: {
    onClick: fn(),
    icon: 'add',
    ariaLabel: 'Add item',
    size: 'default',
  },
} satisfies Meta<typeof CircularButton>;

export default meta;
type Story = StoryObj<typeof meta>;

// Primary states (Solid)
export const PrimaryDefault: Story = {
  args: { variant: 'primary', state: 'default', icon: 'add', ariaLabel: 'Add' },
};

export const PrimaryHover: Story = {
  args: { variant: 'primary', state: 'hover', icon: 'add', ariaLabel: 'Add' },
};

export const PrimaryActive: Story = {
  args: { variant: 'primary', state: 'active', icon: 'add', ariaLabel: 'Add' },
};

export const PrimaryDisabled: Story = {
  args: { variant: 'primary', state: 'disabled', icon: 'add', ariaLabel: 'Add' },
};

// Secondary states (Outlined)
export const SecondaryDefault: Story = {
  args: { variant: 'secondary', state: 'default', icon: 'edit', ariaLabel: 'Edit' },
};

export const SecondaryHover: Story = {
  args: { variant: 'secondary', state: 'hover', icon: 'edit', ariaLabel: 'Edit' },
};

export const SecondaryActive: Story = {
  args: { variant: 'secondary', state: 'active', icon: 'edit', ariaLabel: 'Edit' },
};

export const SecondaryDisabled: Story = {
  args: { variant: 'secondary', state: 'disabled', icon: 'edit', ariaLabel: 'Edit' },
};

// Tertiary states (Ghost / Passive)
export const TertiaryDefault: Story = {
  args: { variant: 'tertiary', state: 'default', icon: 'close', ariaLabel: 'Close' },
};

export const TertiaryHover: Story = {
  args: { variant: 'tertiary', state: 'hover', icon: 'close', ariaLabel: 'Close' },
};

export const TertiaryActive: Story = {
  args: { variant: 'tertiary', state: 'active', icon: 'close', ariaLabel: 'Close' },
};

export const TertiaryDisabled: Story = {
  args: { variant: 'tertiary', state: 'disabled', icon: 'close', ariaLabel: 'Close' },
};

// Neutral tone, primary emphasis (Solid Grey)
export const NeutralDefault: Story = {
  args: { variant: 'primary', tone: 'neutral', state: 'default', icon: 'tune', ariaLabel: 'Filters' },
};

export const NeutralHover: Story = {
  args: { variant: 'primary', tone: 'neutral', state: 'hover', icon: 'tune', ariaLabel: 'Filters' },
};

export const NeutralActive: Story = {
  args: { variant: 'primary', tone: 'neutral', state: 'active', icon: 'tune', ariaLabel: 'Filters' },
};

export const NeutralDisabled: Story = {
  args: { variant: 'primary', tone: 'neutral', state: 'disabled', icon: 'tune', ariaLabel: 'Filters' },
};

// Neutral tone, secondary emphasis (Outlined Grey)
export const SecondaryNeutralDefault: Story = {
  args: { variant: 'secondary', tone: 'neutral', state: 'default', icon: 'tune', ariaLabel: 'Filters' },
};

export const SecondaryNeutralHover: Story = {
  args: { variant: 'secondary', tone: 'neutral', state: 'hover', icon: 'tune', ariaLabel: 'Filters' },
};

export const SecondaryNeutralActive: Story = {
  args: { variant: 'secondary', tone: 'neutral', state: 'active', icon: 'tune', ariaLabel: 'Filters' },
};

export const SecondaryNeutralDisabled: Story = {
  args: { variant: 'secondary', tone: 'neutral', state: 'disabled', icon: 'tune', ariaLabel: 'Filters' },
};

// Destructive tone, primary emphasis (Solid Danger)
export const PrimaryDestructiveDefault: Story = {
  args: { variant: 'primary', tone: 'destructive', state: 'default', icon: 'delete', ariaLabel: 'Delete' },
};

export const PrimaryDestructiveHover: Story = {
  args: { variant: 'primary', tone: 'destructive', state: 'hover', icon: 'delete', ariaLabel: 'Delete' },
};

// Destructive tone (Outlined Danger)
export const DestructiveDefault: Story = {
  args: { variant: 'secondary', tone: 'destructive', state: 'default', icon: 'delete', ariaLabel: 'Delete' },
};

export const DestructiveHover: Story = {
  args: { variant: 'secondary', tone: 'destructive', state: 'hover', icon: 'delete', ariaLabel: 'Delete' },
};

export const DestructiveActive: Story = {
  args: { variant: 'secondary', tone: 'destructive', state: 'active', icon: 'delete', ariaLabel: 'Delete' },
};

export const DestructiveDisabled: Story = {
  args: { variant: 'secondary', tone: 'destructive', state: 'disabled', icon: 'delete', ariaLabel: 'Delete' },
};

// Compact
export const CompactPrimaryDefault: Story = {
  args: { variant: 'primary', state: 'default', size: 'compact', icon: 'add', ariaLabel: 'Add' },
};

export const CompactPrimaryHover: Story = {
  args: { variant: 'primary', state: 'hover', size: 'compact', icon: 'add', ariaLabel: 'Add' },
};

export const CompactSecondaryDefault: Story = {
  args: { variant: 'secondary', state: 'default', size: 'compact', icon: 'edit', ariaLabel: 'Edit' },
};

export const CompactSecondaryHover: Story = {
  args: { variant: 'secondary', state: 'hover', size: 'compact', icon: 'edit', ariaLabel: 'Edit' },
};

export const CompactTertiaryDefault: Story = {
  args: { variant: 'tertiary', state: 'default', size: 'compact', icon: 'more_vert', ariaLabel: 'More options' },
};

export const CompactTertiaryHover: Story = {
  args: { variant: 'tertiary', state: 'hover', size: 'compact', icon: 'more_vert', ariaLabel: 'More options' },
};

export const CompactNeutralDefault: Story = {
  args: { variant: 'primary', tone: 'neutral', state: 'default', size: 'compact', icon: 'tune', ariaLabel: 'Filters' },
};

// Loading
export const PrimaryLoading: Story = {
  args: { variant: 'primary', icon: 'add', loading: true, ariaLabel: 'Saving' },
};

export const SecondaryLoading: Story = {
  args: { variant: 'secondary', icon: 'edit', loading: true, ariaLabel: 'Saving' },
};

export const TertiaryLoading: Story = {
  args: { variant: 'tertiary', icon: 'refresh', loading: true, ariaLabel: 'Refreshing' },
};

export const CompactLoading: Story = {
  args: { variant: 'primary', size: 'compact', icon: 'add', loading: true, ariaLabel: 'Saving' },
};

// Self-labelling tooltip: every button above already shows its ariaLabel on
// hover and focus; these cover the overrides.
export const CustomTooltip: Story = {
  args: { variant: 'secondary', icon: 'download', ariaLabel: 'Download', tooltip: 'Download the report' },
};

export const TooltipBelow: Story = {
  args: { variant: 'tertiary', icon: 'settings', ariaLabel: 'Settings', tooltipPosition: 'bottom' },
};

export const NoTooltip: Story = {
  args: { variant: 'tertiary', icon: 'close', ariaLabel: 'Close', tooltip: false },
};

// Common icon examples
export const Search: Story = {
  args: { variant: 'tertiary', icon: 'search', ariaLabel: 'Search' },
};

export const Settings: Story = {
  args: { variant: 'tertiary', icon: 'settings', ariaLabel: 'Settings' },
};

export const Delete: Story = {
  args: { variant: 'primary', icon: 'delete', ariaLabel: 'Delete' },
};

export const Refresh: Story = {
  args: { variant: 'tertiary', icon: 'refresh', ariaLabel: 'Refresh' },
};
