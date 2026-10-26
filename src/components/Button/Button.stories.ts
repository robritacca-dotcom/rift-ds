import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, within } from 'storybook/test';
import { Button } from './Button';

const meta = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
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
    label: {
      control: 'text',
    },
    disabled: {
      control: 'boolean',
    },
    loading: {
      control: 'boolean',
    },
    iconLeft: {
      control: 'text',
    },
    iconRight: {
      control: 'text',
    },
  },
  args: {
    onClick: fn(),
    label: 'Button',
    size: 'default',
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================
// Primary Button States (Solid)
// ============================================

export const PrimaryDefault: Story = {
  args: {
    variant: 'primary',
    label: 'Button',
    iconRight: 'arrow_forward',
  },
};

export const PrimaryHover: Story = {
  args: {
    variant: 'primary',
    state: 'hover',
    label: 'Button',
    iconRight: 'arrow_forward',
  },
};

export const PrimaryActive: Story = {
  args: {
    variant: 'primary',
    state: 'active',
    label: 'Button',
    iconRight: 'arrow_forward',
  },
};

export const PrimaryDisabled: Story = {
  args: {
    variant: 'primary',
    disabled: true,
    label: 'Button',
    iconRight: 'arrow_forward',
  },
};

// ============================================
// Secondary Button States (Outlined)
// ============================================

export const SecondaryDefault: Story = {
  args: {
    variant: 'secondary',
    label: 'Button',
    iconRight: 'arrow_forward',
  },
};

export const SecondaryHover: Story = {
  args: {
    variant: 'secondary',
    state: 'hover',
    label: 'Button',
    iconRight: 'arrow_forward',
  },
};

export const SecondaryActive: Story = {
  args: {
    variant: 'secondary',
    state: 'active',
    label: 'Button',
    iconRight: 'arrow_forward',
  },
};

export const SecondaryDisabled: Story = {
  args: {
    variant: 'secondary',
    disabled: true,
    label: 'Button',
    iconRight: 'arrow_forward',
  },
};

// ============================================
// Tertiary Button States (Ghost / Passive)
// ============================================

export const TertiaryDefault: Story = {
  args: {
    variant: 'tertiary',
    label: 'Button',
    iconRight: 'arrow_forward',
  },
};

export const TertiaryHover: Story = {
  args: {
    variant: 'tertiary',
    state: 'hover',
    label: 'Button',
    iconRight: 'arrow_forward',
  },
};

export const TertiaryActive: Story = {
  args: {
    variant: 'tertiary',
    state: 'active',
    label: 'Button',
    iconRight: 'arrow_forward',
  },
};

export const TertiaryDisabled: Story = {
  args: {
    variant: 'tertiary',
    disabled: true,
    label: 'Button',
    iconRight: 'arrow_forward',
  },
};

// ============================================
// Neutral Tone, Primary Emphasis (Solid Grey)
// ============================================

export const NeutralDefault: Story = {
  args: {
    variant: 'primary',
    tone: 'neutral',
    label: 'Button',
    iconRight: 'arrow_forward',
  },
};

export const NeutralHover: Story = {
  args: {
    variant: 'primary',
    tone: 'neutral',
    state: 'hover',
    label: 'Button',
    iconRight: 'arrow_forward',
  },
};

export const NeutralActive: Story = {
  args: {
    variant: 'primary',
    tone: 'neutral',
    state: 'active',
    label: 'Button',
    iconRight: 'arrow_forward',
  },
};

export const NeutralDisabled: Story = {
  args: {
    variant: 'primary',
    tone: 'neutral',
    disabled: true,
    label: 'Button',
    iconRight: 'arrow_forward',
  },
};

export const CompactNeutralDefault: Story = {
  args: {
    variant: 'primary',
    tone: 'neutral',
    size: 'compact',
    label: 'Button',
    iconRight: 'arrow_forward',
  },
};

// ============================================
// Neutral Tone, Secondary Emphasis (Outlined Grey)
// ============================================

export const SecondaryNeutralDefault: Story = {
  args: {
    variant: 'secondary',
    tone: 'neutral',
    label: 'Button',
    iconRight: 'arrow_forward',
  },
};

export const SecondaryNeutralHover: Story = {
  args: {
    variant: 'secondary',
    tone: 'neutral',
    state: 'hover',
    label: 'Button',
    iconRight: 'arrow_forward',
  },
};

export const SecondaryNeutralActive: Story = {
  args: {
    variant: 'secondary',
    tone: 'neutral',
    state: 'active',
    label: 'Button',
    iconRight: 'arrow_forward',
  },
};

export const SecondaryNeutralDisabled: Story = {
  args: {
    variant: 'secondary',
    tone: 'neutral',
    disabled: true,
    label: 'Button',
    iconRight: 'arrow_forward',
  },
};

export const CompactSecondaryNeutralDefault: Story = {
  args: {
    variant: 'secondary',
    tone: 'neutral',
    size: 'compact',
    label: 'Button',
    iconRight: 'arrow_forward',
  },
};

// ============================================
// Destructive Tone, Primary Emphasis (Solid Danger)
// ============================================

export const PrimaryDestructiveDefault: Story = {
  args: { variant: 'primary', tone: 'destructive', label: 'Delete', iconLeft: 'delete' },
};

export const PrimaryDestructiveHover: Story = {
  args: { variant: 'primary', tone: 'destructive', state: 'hover', label: 'Delete', iconLeft: 'delete' },
};

export const PrimaryDestructiveActive: Story = {
  args: { variant: 'primary', tone: 'destructive', state: 'active', label: 'Delete', iconLeft: 'delete' },
};

export const PrimaryDestructiveDisabled: Story = {
  args: { variant: 'primary', tone: 'destructive', disabled: true, label: 'Delete', iconLeft: 'delete' },
};

// ============================================
// Loading
// ============================================

export const PrimaryLoading: Story = {
  args: {
    variant: 'primary',
    label: 'Saving…',
    loading: true,
  },
};

export const SecondaryLoading: Story = {
  args: {
    variant: 'secondary',
    label: 'Saving…',
    loading: true,
  },
};

export const TertiaryLoading: Story = {
  args: {
    variant: 'tertiary',
    label: 'Saving…',
    loading: true,
  },
};

export const NeutralLoading: Story = {
  args: {
    variant: 'primary',
    tone: 'neutral',
    label: 'Saving…',
    loading: true,
  },
};

export const DestructiveLoading: Story = {
  args: {
    variant: 'secondary',
    tone: 'destructive',
    label: 'Deleting…',
    loading: true,
  },
};

export const CompactLoading: Story = {
  args: {
    variant: 'primary',
    size: 'compact',
    label: 'Saving…',
    loading: true,
  },
};

// ============================================
// With Icon Left
// ============================================

export const PrimaryWithIconLeft: Story = {
  args: {
    variant: 'primary',
    label: 'Menu',
    iconLeft: 'menu',
    iconRight: undefined,
  },
};

export const SecondaryWithIconLeft: Story = {
  args: {
    variant: 'secondary',
    label: 'Edit',
    iconLeft: 'edit',
    iconRight: undefined,
  },
};

export const TertiaryWithIconLeft: Story = {
  args: {
    variant: 'tertiary',
    label: 'Home',
    iconLeft: 'home',
    iconRight: undefined,
  },
};

// With Both Icons
export const WithBothIcons: Story = {
  args: {
    variant: 'primary',
    label: 'Next Step',
    iconLeft: 'check',
    iconRight: 'arrow_forward',
  },
};

export const WithIconLeftAndRight: Story = {
  args: {
    variant: 'tertiary',
    label: 'Download',
    iconLeft: 'download',
    iconRight: 'chevron_right',
  },
};

// Icon Only
export const PrimaryIconOnly: Story = {
  args: {
    variant: 'primary',
    text: false,
    iconLeft: 'add',
    iconRight: undefined,
  },
};

export const SecondaryIconOnly: Story = {
  args: {
    variant: 'secondary',
    text: false,
    iconLeft: 'close',
    iconRight: undefined,
  },
};

export const TertiaryIconOnly: Story = {
  args: {
    variant: 'tertiary',
    text: false,
    iconLeft: 'close',
    iconRight: undefined,
  },
};

// Text Only (No Icons)
export const TextOnly: Story = {
  args: {
    variant: 'primary',
    label: 'Simple Button',
    iconLeft: undefined,
    iconRight: undefined,
  },
};

// ============================================
// Compact Button States
// ============================================

export const CompactPrimaryDefault: Story = {
  args: {
    variant: 'primary',
    size: 'compact',
    label: 'Button',
    iconRight: 'arrow_forward',
  },
};

export const CompactPrimaryHover: Story = {
  args: {
    variant: 'primary',
    state: 'hover',
    size: 'compact',
    label: 'Button',
    iconRight: 'arrow_forward',
  },
};

export const CompactPrimaryActive: Story = {
  args: {
    variant: 'primary',
    state: 'active',
    size: 'compact',
    label: 'Button',
    iconRight: 'arrow_forward',
  },
};

export const CompactPrimaryDisabled: Story = {
  args: {
    variant: 'primary',
    disabled: true,
    size: 'compact',
    label: 'Button',
    iconRight: 'arrow_forward',
  },
};

export const CompactSecondaryDefault: Story = {
  args: {
    variant: 'secondary',
    size: 'compact',
    label: 'Button',
    iconRight: 'arrow_forward',
  },
};

export const CompactSecondaryHover: Story = {
  args: {
    variant: 'secondary',
    state: 'hover',
    size: 'compact',
    label: 'Button',
    iconRight: 'arrow_forward',
  },
};

export const CompactSecondaryActive: Story = {
  args: {
    variant: 'secondary',
    state: 'active',
    size: 'compact',
    label: 'Button',
    iconRight: 'arrow_forward',
  },
};

export const CompactSecondaryDisabled: Story = {
  args: {
    variant: 'secondary',
    disabled: true,
    size: 'compact',
    label: 'Button',
    iconRight: 'arrow_forward',
  },
};

export const CompactTertiaryDefault: Story = {
  args: {
    variant: 'tertiary',
    size: 'compact',
    label: 'Button',
    iconRight: 'arrow_forward',
  },
};

export const CompactTertiaryHover: Story = {
  args: {
    variant: 'tertiary',
    state: 'hover',
    size: 'compact',
    label: 'Button',
    iconRight: 'arrow_forward',
  },
};

export const CompactTertiaryActive: Story = {
  args: {
    variant: 'tertiary',
    state: 'active',
    size: 'compact',
    label: 'Button',
    iconRight: 'arrow_forward',
  },
};

export const CompactTertiaryDisabled: Story = {
  args: {
    variant: 'tertiary',
    disabled: true,
    size: 'compact',
    label: 'Button',
    iconRight: 'arrow_forward',
  },
};

// ============================================
// Destructive Button States
// ============================================

export const DestructiveDefault: Story = {
  args: {
    variant: 'secondary',
    tone: 'destructive',
    label: 'Delete',
    iconLeft: 'delete',
  },
};

export const DestructiveHover: Story = {
  args: {
    variant: 'secondary',
    tone: 'destructive',
    state: 'hover',
    label: 'Delete',
    iconLeft: 'delete',
  },
};

export const DestructiveActive: Story = {
  args: {
    variant: 'secondary',
    tone: 'destructive',
    state: 'active',
    label: 'Delete',
    iconLeft: 'delete',
  },
};

export const DestructiveDisabled: Story = {
  args: {
    variant: 'secondary',
    tone: 'destructive',
    disabled: true,
    label: 'Delete',
    iconLeft: 'delete',
  },
};

// Compact Destructive States
export const CompactDestructiveDefault: Story = {
  args: {
    variant: 'secondary',
    tone: 'destructive',
    size: 'compact',
    label: 'Remove',
    iconLeft: 'close',
  },
};

export const CompactDestructiveHover: Story = {
  args: {
    variant: 'secondary',
    tone: 'destructive',
    state: 'hover',
    size: 'compact',
    label: 'Remove',
    iconLeft: 'close',
  },
};

export const CompactDestructiveActive: Story = {
  args: {
    variant: 'secondary',
    tone: 'destructive',
    state: 'active',
    size: 'compact',
    label: 'Remove',
    iconLeft: 'close',
  },
};

export const CompactDestructiveDisabled: Story = {
  args: {
    variant: 'secondary',
    tone: 'destructive',
    disabled: true,
    size: 'compact',
    label: 'Remove',
    iconLeft: 'close',
  },
};

// Destructive Icon Only
export const DestructiveIconOnly: Story = {
  args: {
    variant: 'secondary',
    tone: 'destructive',
    text: false,
    iconLeft: 'delete',
    iconRight: undefined,
  },
};

/** Plain-text children stand in for a missing `label`, so the habit other
    libraries teach still reads right. `label` stays the documented prop. */
export const TextChildren: Story = {
  args: {
    label: undefined,
    children: 'Save changes',
    variant: 'primary',
  },
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole('button');
    await expect(button).toHaveTextContent('Save changes');
  },
};
