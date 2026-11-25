import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn } from 'storybook/test';
import { IconButton } from './IconButton';

const meta = {
  title: 'Components/IconButton',
  component: IconButton,
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
    // `state` survives only as the documentation affordance for drawing a
    // static hover or active look; disabled is the `disabled` prop.
    state: {
      control: 'select',
      options: ['hover', 'active'],
    },
    size: {
      control: 'select',
      options: ['default', 'compact'],
    },
    disabled: {
      control: 'boolean',
    },
    loading: {
      control: 'boolean',
    },
    label: { control: 'text' },
    tooltip: { control: 'text' },
    tooltipPosition: {
      control: 'select',
      options: ['top', 'bottom', 'left', 'right'],
    },
  },
  args: {
    onClick: fn(),
    icon: 'add',
    label: 'Add item',
    size: 'default',
  },
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

// Primary states (Solid)
export const PrimaryDefault: Story = {
  args: { variant: 'primary', icon: 'add', label: 'Add' },
};

export const PrimaryHover: Story = {
  args: { variant: 'primary', state: 'hover', icon: 'add', label: 'Add' },
};

export const PrimaryActive: Story = {
  args: { variant: 'primary', state: 'active', icon: 'add', label: 'Add' },
};

export const PrimaryDisabled: Story = {
  args: { variant: 'primary', disabled: true, icon: 'add', label: 'Add' },
};

// Secondary states (Outlined)
export const SecondaryDefault: Story = {
  args: { variant: 'secondary', icon: 'edit', label: 'Edit' },
};

export const SecondaryHover: Story = {
  args: { variant: 'secondary', state: 'hover', icon: 'edit', label: 'Edit' },
};

export const SecondaryActive: Story = {
  args: { variant: 'secondary', state: 'active', icon: 'edit', label: 'Edit' },
};

export const SecondaryDisabled: Story = {
  args: { variant: 'secondary', disabled: true, icon: 'edit', label: 'Edit' },
};

// Tertiary states (Ghost / Passive)
export const TertiaryDefault: Story = {
  args: { variant: 'tertiary', icon: 'close', label: 'Close' },
};

export const TertiaryHover: Story = {
  args: { variant: 'tertiary', state: 'hover', icon: 'close', label: 'Close' },
};

export const TertiaryActive: Story = {
  args: { variant: 'tertiary', state: 'active', icon: 'close', label: 'Close' },
};

export const TertiaryDisabled: Story = {
  args: { variant: 'tertiary', disabled: true, icon: 'close', label: 'Close' },
};

// Neutral tone, primary emphasis (Solid Grey)
export const NeutralDefault: Story = {
  args: { variant: 'primary', tone: 'neutral', icon: 'tune', label: 'Filters' },
};

export const NeutralHover: Story = {
  args: { variant: 'primary', tone: 'neutral', state: 'hover', icon: 'tune', label: 'Filters' },
};

export const NeutralActive: Story = {
  args: { variant: 'primary', tone: 'neutral', state: 'active', icon: 'tune', label: 'Filters' },
};

export const NeutralDisabled: Story = {
  args: { variant: 'primary', tone: 'neutral', disabled: true, icon: 'tune', label: 'Filters' },
};

// Neutral tone, secondary emphasis (Outlined Grey)
export const SecondaryNeutralDefault: Story = {
  args: { variant: 'secondary', tone: 'neutral', icon: 'tune', label: 'Filters' },
};

export const SecondaryNeutralHover: Story = {
  args: { variant: 'secondary', tone: 'neutral', state: 'hover', icon: 'tune', label: 'Filters' },
};

export const SecondaryNeutralActive: Story = {
  args: { variant: 'secondary', tone: 'neutral', state: 'active', icon: 'tune', label: 'Filters' },
};

export const SecondaryNeutralDisabled: Story = {
  args: { variant: 'secondary', tone: 'neutral', disabled: true, icon: 'tune', label: 'Filters' },
};

// Glass

/** `glass` frosts the ground behind an outlined button and gives it the glass fill at rest: the notification bell on a template's map. */
export const SecondaryNeutralGlass: Story = {
  args: { variant: 'secondary', tone: 'neutral', glass: true, icon: 'notifications', label: 'Notifications' },
};

/** A filled button keeps its colour and lets a little of the ground through. */
export const PrimaryGlass: Story = {
  args: { variant: 'primary', glass: true, icon: 'add', label: 'Add' },
};

// Destructive tone, primary emphasis (Solid Danger)
export const PrimaryDestructiveDefault: Story = {
  args: { variant: 'primary', tone: 'destructive', icon: 'delete', label: 'Delete' },
};

export const PrimaryDestructiveHover: Story = {
  args: { variant: 'primary', tone: 'destructive', state: 'hover', icon: 'delete', label: 'Delete' },
};

// Destructive tone (Outlined Danger)
export const DestructiveDefault: Story = {
  args: { variant: 'secondary', tone: 'destructive', icon: 'delete', label: 'Delete' },
};

export const DestructiveHover: Story = {
  args: { variant: 'secondary', tone: 'destructive', state: 'hover', icon: 'delete', label: 'Delete' },
};

export const DestructiveActive: Story = {
  args: { variant: 'secondary', tone: 'destructive', state: 'active', icon: 'delete', label: 'Delete' },
};

export const DestructiveDisabled: Story = {
  args: { variant: 'secondary', tone: 'destructive', disabled: true, icon: 'delete', label: 'Delete' },
};

// Compact
export const CompactPrimaryDefault: Story = {
  args: { variant: 'primary', size: 'compact', icon: 'add', label: 'Add' },
};

export const CompactPrimaryHover: Story = {
  args: { variant: 'primary', state: 'hover', size: 'compact', icon: 'add', label: 'Add' },
};

export const CompactSecondaryDefault: Story = {
  args: { variant: 'secondary', size: 'compact', icon: 'edit', label: 'Edit' },
};

export const CompactSecondaryHover: Story = {
  args: { variant: 'secondary', state: 'hover', size: 'compact', icon: 'edit', label: 'Edit' },
};

export const CompactTertiaryDefault: Story = {
  args: { variant: 'tertiary', size: 'compact', icon: 'more_vert', label: 'More options' },
};

export const CompactTertiaryHover: Story = {
  args: { variant: 'tertiary', state: 'hover', size: 'compact', icon: 'more_vert', label: 'More options' },
};

export const CompactNeutralDefault: Story = {
  args: { variant: 'primary', tone: 'neutral', size: 'compact', icon: 'tune', label: 'Filters' },
};

// Loading
export const PrimaryLoading: Story = {
  args: { variant: 'primary', icon: 'add', loading: true, label: 'Saving' },
};

export const SecondaryLoading: Story = {
  args: { variant: 'secondary', icon: 'edit', loading: true, label: 'Saving' },
};

export const TertiaryLoading: Story = {
  args: { variant: 'tertiary', icon: 'refresh', loading: true, label: 'Refreshing' },
};

export const CompactLoading: Story = {
  args: { variant: 'primary', size: 'compact', icon: 'add', loading: true, label: 'Saving' },
};

// Self-labelling tooltip: every button above already shows its label on
// hover and focus; these cover the overrides.
export const CustomTooltip: Story = {
  args: { variant: 'secondary', icon: 'download', label: 'Download', tooltip: 'Download the report' },
};

export const TooltipBelow: Story = {
  args: { variant: 'tertiary', icon: 'settings', label: 'Settings', tooltipPosition: 'bottom' },
};

export const NoTooltip: Story = {
  args: { variant: 'tertiary', icon: 'close', label: 'Close', tooltip: false },
};

// Common icon examples
export const Search: Story = {
  args: { variant: 'tertiary', icon: 'search', label: 'Search' },
};

export const Settings: Story = {
  args: { variant: 'tertiary', icon: 'settings', label: 'Settings' },
};

export const Delete: Story = {
  args: { variant: 'primary', icon: 'delete', label: 'Delete' },
};

export const Refresh: Story = {
  args: { variant: 'tertiary', icon: 'refresh', label: 'Refresh' },
};

/** A count or a dot on the corner, such as a notification bell's unread. The count joins the accessible name; the tooltip keeps the label alone. */
export const WithBadge: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
      <IconButton {...args} icon="notifications" variant="tertiary" label="Notifications" badge={3} />
      <IconButton {...args} icon="notifications" variant="tertiary" label="Messages" badge={240} />
      <IconButton {...args} icon="notifications" variant="tertiary" label="Updates" badge />
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button', { name: 'Notifications, 3 new' })).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: 'Messages, 240 new' })).toHaveTextContent('99+');
    await expect(canvas.getByRole('button', { name: 'Updates, new' })).toBeInTheDocument();
  },
};
