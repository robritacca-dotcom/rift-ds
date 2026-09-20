import type { Meta, StoryObj } from '@storybook/react-vite';
import { ButtonGroup } from './ButtonGroup';
import '../Button/Button.css';
import './ButtonGroup.css';
import '../../tokens/tokens.css';
import '../../fonts/material-symbols.css';

const meta = {
  title: 'Components/ButtonGroup',
  component: ButtonGroup,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
ButtonGroup is a container component for grouping multiple buttons together.
It supports both horizontal and vertical orientations and is designed for use in navigation bars.

## Usage

\`\`\`tsx
import { ButtonGroup } from './components/ButtonGroup/ButtonGroup';

// Horizontal navigation
<ButtonGroup
  orientation="horizontal"
  buttons={[
    { label: 'Home' },
    { label: 'About' },
    { label: 'Contact' }
  ]}
/>

// Vertical subnav
<ButtonGroup
  orientation="vertical"
  buttons={[
    { label: 'Dashboard' },
    { label: 'Settings' },
    { label: 'Profile' }
  ]}
/>
\`\`\`

## Design Tokens

- **Horizontal gap**: \`--gap-lg\` (20px)
- **Vertical gap**: \`--radius-xxs\` (2px)
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
    },
    buttons: {
      control: 'object',
    },
  },
} satisfies Meta<typeof ButtonGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

// Sample navigation items
const navButtons = [
  { label: 'Home' },
  { label: 'About' },
  { label: 'Services' },
  { label: 'Portfolio' },
  { label: 'Team' },
  { label: 'Blog' },
  { label: 'Careers' },
  { label: 'Contact' },
];

const subnavButtons = [
  { label: 'Dashboard' },
  { label: 'Analytics' },
  { label: 'Reports' },
  { label: 'Settings' },
  { label: 'Users' },
  { label: 'Billing' },
  { label: 'Support' },
  { label: 'Documentation' },
  { label: 'API' },
];

// Horizontal ButtonGroup (Top Nav)
export const Horizontal: Story = {
  args: {
    orientation: 'horizontal',
    buttons: navButtons,
  },
  parameters: {
    docs: {
      description: {
        story: 'Horizontal button group for top navigation bars. Buttons are spaced with 20px gap.',
      },
    },
  },
};

// Vertical ButtonGroup (Subnav)
export const Vertical: Story = {
  args: {
    orientation: 'vertical',
    buttons: subnavButtons,
  },
  parameters: {
    docs: {
      description: {
        story: 'Vertical button group for subnavigation or mobile menus. Buttons are tightly spaced with 2px gap and stretch to full width.',
      },
    },
  },
};

// Horizontal with Icons
export const HorizontalWithIcons: Story = {
  args: {
    orientation: 'horizontal',
    buttons: [
      { label: 'Home', icon: 'home' },
      { label: 'Search', icon: 'search' },
      { label: 'Settings', icon: 'settings' },
      { label: 'Profile', icon: 'person' },
      { label: 'Notifications', icon: 'notifications' },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Horizontal navigation with Material Symbols icons.',
      },
    },
  },
};

// Vertical with Icons
export const VerticalWithIcons: Story = {
  args: {
    orientation: 'vertical',
    buttons: [
      { label: 'Dashboard', icon: 'dashboard' },
      { label: 'Analytics', icon: 'analytics' },
      { label: 'Reports', icon: 'assessment' },
      { label: 'Settings', icon: 'settings' },
      { label: 'Users', icon: 'group' },
      { label: 'Billing', icon: 'receipt' },
      { label: 'Support', icon: 'support_agent' },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Vertical subnav with icons for enhanced visual clarity.',
      },
    },
  },
};

// With Active State
export const WithActiveState: Story = {
  args: {
    orientation: 'horizontal',
    buttons: [
      { label: 'Home', state: 'default' },
      { label: 'About', state: 'active' },
      { label: 'Services', state: 'default' },
      { label: 'Contact', state: 'default' },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Button group with one button in active state to indicate current page.',
      },
    },
  },
};

// Mobile Menu (Vertical)
export const MobileMenu: Story = {
  args: {
    orientation: 'vertical',
    buttons: [
      { label: 'Home', icon: 'home' },
      { label: 'Products', icon: 'inventory_2' },
      { label: 'About', icon: 'info' },
      { label: 'Contact', icon: 'mail' },
      { label: 'Account', icon: 'account_circle' },
      { label: 'Settings', icon: 'settings' },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Vertical button group designed for mobile navigation menus.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '320px' }}>
        <Story />
      </div>
    ),
  ],
};

// Compact Horizontal
export const CompactHorizontal: Story = {
  args: {
    orientation: 'horizontal',
    buttons: [
      { label: 'All' },
      { label: 'Active' },
      { label: 'Completed' },
      { label: 'Archived' },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Compact horizontal group for filters or tabs.',
      },
    },
  },
};

// Side-by-side Comparison
export const Comparison: Story = {
  args: { buttons: [] },
  render: () => (
    <div style={{ display: 'flex', gap: '80px', flexWrap: 'wrap' }}>
      {/* Vertical */}
      <div>
        <h3
          style={{
            fontSize: '18px',
            fontWeight: 600,
            marginBottom: '16px',
            color: 'var(--color-text-primary)',
          }}
        >
          Vertical (Subnav)
        </h3>
        <ButtonGroup
          orientation="vertical"
          buttons={[
            { label: 'Dashboard' },
            { label: 'Analytics' },
            { label: 'Reports' },
            { label: 'Settings', state: 'active' },
            { label: 'Users' },
            { label: 'Billing' },
            { label: 'Support' },
          ]}
        />
      </div>

      {/* Horizontal */}
      <div>
        <h3
          style={{
            fontSize: '18px',
            fontWeight: 600,
            marginBottom: '16px',
            color: 'var(--color-text-primary)',
          }}
        >
          Horizontal (Top Nav)
        </h3>
        <ButtonGroup
          orientation="horizontal"
          buttons={[
            { label: 'Home' },
            { label: 'About', state: 'active' },
            { label: 'Services' },
            { label: 'Portfolio' },
            { label: 'Contact' },
          ]}
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Side-by-side comparison of vertical and horizontal button groups.',
      },
    },
  },
};
