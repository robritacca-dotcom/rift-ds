import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Button } from './Button';

const meta = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    priority: {
      control: 'select',
      options: ['primary', 'secondary', 'tertiary', 'destructive'],
    },
    state: {
      control: 'select',
      options: ['default', 'hover', 'active', 'disabled'],
    },
    size: {
      control: 'select',
      options: ['default', 'compact'],
    },
    label: {
      control: 'text',
    },
    text: {
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
    icon: {
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
    priority: 'primary',
    state: 'default',
    label: 'Button',
    text: true,
    iconRight: 'arrow_forward',
  },
};

export const PrimaryHover: Story = {
  args: {
    priority: 'primary',
    state: 'hover',
    label: 'Button',
    text: true,
    iconRight: 'arrow_forward',
  },
};

export const PrimaryActive: Story = {
  args: {
    priority: 'primary',
    state: 'active',
    label: 'Button',
    text: true,
    iconRight: 'arrow_forward',
  },
};

export const PrimaryDisabled: Story = {
  args: {
    priority: 'primary',
    state: 'disabled',
    label: 'Button',
    text: true,
    iconRight: 'arrow_forward',
  },
};

// ============================================
// Secondary Button States (Outlined)
// ============================================

export const SecondaryDefault: Story = {
  args: {
    priority: 'secondary',
    state: 'default',
    label: 'Button',
    text: true,
    iconRight: 'arrow_forward',
  },
};

export const SecondaryHover: Story = {
  args: {
    priority: 'secondary',
    state: 'hover',
    label: 'Button',
    text: true,
    iconRight: 'arrow_forward',
  },
};

export const SecondaryActive: Story = {
  args: {
    priority: 'secondary',
    state: 'active',
    label: 'Button',
    text: true,
    iconRight: 'arrow_forward',
  },
};

export const SecondaryDisabled: Story = {
  args: {
    priority: 'secondary',
    state: 'disabled',
    label: 'Button',
    text: true,
    iconRight: 'arrow_forward',
  },
};

// ============================================
// Tertiary Button States (Ghost / Passive)
// ============================================

export const TertiaryDefault: Story = {
  args: {
    priority: 'tertiary',
    state: 'default',
    label: 'Button',
    text: true,
    iconRight: 'arrow_forward',
  },
};

export const TertiaryHover: Story = {
  args: {
    priority: 'tertiary',
    state: 'hover',
    label: 'Button',
    text: true,
    iconRight: 'arrow_forward',
  },
};

export const TertiaryActive: Story = {
  args: {
    priority: 'tertiary',
    state: 'active',
    label: 'Button',
    text: true,
    iconRight: 'arrow_forward',
  },
};

export const TertiaryDisabled: Story = {
  args: {
    priority: 'tertiary',
    state: 'disabled',
    label: 'Button',
    text: true,
    iconRight: 'arrow_forward',
  },
};

// ============================================
// Neutral Button States (Solid Grey)
// ============================================

export const NeutralDefault: Story = {
  args: {
    variant: 'neutral',
    state: 'default',
    label: 'Button',
    text: true,
    iconRight: 'arrow_forward',
  },
};

export const NeutralHover: Story = {
  args: {
    variant: 'neutral',
    state: 'hover',
    label: 'Button',
    text: true,
    iconRight: 'arrow_forward',
  },
};

export const NeutralActive: Story = {
  args: {
    variant: 'neutral',
    state: 'active',
    label: 'Button',
    text: true,
    iconRight: 'arrow_forward',
  },
};

export const NeutralDisabled: Story = {
  args: {
    variant: 'neutral',
    state: 'disabled',
    label: 'Button',
    text: true,
    iconRight: 'arrow_forward',
  },
};

export const CompactNeutralDefault: Story = {
  args: {
    variant: 'neutral',
    state: 'default',
    size: 'compact',
    label: 'Button',
    text: true,
    iconRight: 'arrow_forward',
  },
};

// ============================================
// Loading
// ============================================

export const PrimaryLoading: Story = {
  args: {
    priority: 'primary',
    label: 'Saving…',
    loading: true,
  },
};

export const SecondaryLoading: Story = {
  args: {
    priority: 'secondary',
    label: 'Saving…',
    loading: true,
  },
};

export const TertiaryLoading: Story = {
  args: {
    priority: 'tertiary',
    label: 'Saving…',
    loading: true,
  },
};

export const NeutralLoading: Story = {
  args: {
    variant: 'neutral',
    label: 'Saving…',
    loading: true,
  },
};

export const DestructiveLoading: Story = {
  args: {
    priority: 'destructive',
    label: 'Deleting…',
    loading: true,
  },
};

export const CompactLoading: Story = {
  args: {
    priority: 'primary',
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
    priority: 'primary',
    state: 'default',
    label: 'Menu',
    text: true,
    iconLeft: 'menu',
    iconRight: undefined,
  },
};

export const SecondaryWithIconLeft: Story = {
  args: {
    priority: 'secondary',
    state: 'default',
    label: 'Edit',
    text: true,
    iconLeft: 'edit',
    iconRight: undefined,
  },
};

export const TertiaryWithIconLeft: Story = {
  args: {
    priority: 'tertiary',
    state: 'default',
    label: 'Home',
    text: true,
    iconLeft: 'home',
    iconRight: undefined,
  },
};

// With Both Icons
export const WithBothIcons: Story = {
  args: {
    priority: 'primary',
    state: 'default',
    label: 'Next Step',
    text: true,
    iconLeft: 'check',
    iconRight: 'arrow_forward',
  },
};

export const WithIconLeftAndRight: Story = {
  args: {
    priority: 'tertiary',
    state: 'default',
    label: 'Download',
    text: true,
    iconLeft: 'download',
    iconRight: 'chevron_right',
  },
};

// Icon Only
export const PrimaryIconOnly: Story = {
  args: {
    priority: 'primary',
    state: 'default',
    text: false,
    iconLeft: 'add',
    iconRight: undefined,
  },
};

export const SecondaryIconOnly: Story = {
  args: {
    priority: 'secondary',
    state: 'default',
    text: false,
    iconLeft: 'close',
    iconRight: undefined,
  },
};

export const TertiaryIconOnly: Story = {
  args: {
    priority: 'tertiary',
    state: 'default',
    text: false,
    iconLeft: 'close',
    iconRight: undefined,
  },
};

// Text Only (No Icons)
export const TextOnly: Story = {
  args: {
    priority: 'primary',
    state: 'default',
    label: 'Simple Button',
    text: true,
    iconLeft: undefined,
    iconRight: undefined,
  },
};

// ============================================
// Compact Button States
// ============================================

export const CompactPrimaryDefault: Story = {
  args: {
    priority: 'primary',
    state: 'default',
    size: 'compact',
    label: 'Button',
    text: true,
    iconRight: 'arrow_forward',
  },
};

export const CompactPrimaryHover: Story = {
  args: {
    priority: 'primary',
    state: 'hover',
    size: 'compact',
    label: 'Button',
    text: true,
    iconRight: 'arrow_forward',
  },
};

export const CompactPrimaryActive: Story = {
  args: {
    priority: 'primary',
    state: 'active',
    size: 'compact',
    label: 'Button',
    text: true,
    iconRight: 'arrow_forward',
  },
};

export const CompactPrimaryDisabled: Story = {
  args: {
    priority: 'primary',
    state: 'disabled',
    size: 'compact',
    label: 'Button',
    text: true,
    iconRight: 'arrow_forward',
  },
};

export const CompactSecondaryDefault: Story = {
  args: {
    priority: 'secondary',
    state: 'default',
    size: 'compact',
    label: 'Button',
    text: true,
    iconRight: 'arrow_forward',
  },
};

export const CompactSecondaryHover: Story = {
  args: {
    priority: 'secondary',
    state: 'hover',
    size: 'compact',
    label: 'Button',
    text: true,
    iconRight: 'arrow_forward',
  },
};

export const CompactSecondaryActive: Story = {
  args: {
    priority: 'secondary',
    state: 'active',
    size: 'compact',
    label: 'Button',
    text: true,
    iconRight: 'arrow_forward',
  },
};

export const CompactSecondaryDisabled: Story = {
  args: {
    priority: 'secondary',
    state: 'disabled',
    size: 'compact',
    label: 'Button',
    text: true,
    iconRight: 'arrow_forward',
  },
};

export const CompactTertiaryDefault: Story = {
  args: {
    priority: 'tertiary',
    state: 'default',
    size: 'compact',
    label: 'Button',
    text: true,
    iconRight: 'arrow_forward',
  },
};

export const CompactTertiaryHover: Story = {
  args: {
    priority: 'tertiary',
    state: 'hover',
    size: 'compact',
    label: 'Button',
    text: true,
    iconRight: 'arrow_forward',
  },
};

export const CompactTertiaryActive: Story = {
  args: {
    priority: 'tertiary',
    state: 'active',
    size: 'compact',
    label: 'Button',
    text: true,
    iconRight: 'arrow_forward',
  },
};

export const CompactTertiaryDisabled: Story = {
  args: {
    priority: 'tertiary',
    state: 'disabled',
    size: 'compact',
    label: 'Button',
    text: true,
    iconRight: 'arrow_forward',
  },
};

// ============================================
// Destructive Button States
// ============================================

export const DestructiveDefault: Story = {
  args: {
    priority: 'destructive',
    state: 'default',
    label: 'Delete',
    text: true,
    iconLeft: 'delete',
  },
};

export const DestructiveHover: Story = {
  args: {
    priority: 'destructive',
    state: 'hover',
    label: 'Delete',
    text: true,
    iconLeft: 'delete',
  },
};

export const DestructiveActive: Story = {
  args: {
    priority: 'destructive',
    state: 'active',
    label: 'Delete',
    text: true,
    iconLeft: 'delete',
  },
};

export const DestructiveDisabled: Story = {
  args: {
    priority: 'destructive',
    state: 'disabled',
    label: 'Delete',
    text: true,
    iconLeft: 'delete',
  },
};

// Compact Destructive States
export const CompactDestructiveDefault: Story = {
  args: {
    priority: 'destructive',
    state: 'default',
    size: 'compact',
    label: 'Remove',
    text: true,
    iconLeft: 'close',
  },
};

export const CompactDestructiveHover: Story = {
  args: {
    priority: 'destructive',
    state: 'hover',
    size: 'compact',
    label: 'Remove',
    text: true,
    iconLeft: 'close',
  },
};

export const CompactDestructiveActive: Story = {
  args: {
    priority: 'destructive',
    state: 'active',
    size: 'compact',
    label: 'Remove',
    text: true,
    iconLeft: 'close',
  },
};

export const CompactDestructiveDisabled: Story = {
  args: {
    priority: 'destructive',
    state: 'disabled',
    size: 'compact',
    label: 'Remove',
    text: true,
    iconLeft: 'close',
  },
};

// Destructive Icon Only
export const DestructiveIconOnly: Story = {
  args: {
    priority: 'destructive',
    state: 'default',
    text: false,
    iconLeft: 'delete',
    iconRight: undefined,
  },
};
