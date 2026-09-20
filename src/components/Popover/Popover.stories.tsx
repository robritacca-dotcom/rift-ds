import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Popover } from './Popover';

const meta = {
  title: 'Components/Popover',
  component: Popover,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    position: {
      control: 'select',
      options: ['top', 'bottom', 'left', 'right'],
    },
    trigger: {
      control: 'select',
      options: ['click', 'hover'],
    },
    size: {
      control: 'select',
      options: ['default', 'compact'],
    },
    open: { control: 'boolean' },
  },
  args: {
    onOpenChange: fn(),
    size: 'default',
  },
  decorators: [
    (Story) => (
      <div style={{ padding: '120px', display: 'flex', justifyContent: 'center' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    trigger: 'click',
    position: 'bottom',
    children: <button type="button" style={{ padding: '8px 16px', cursor: 'pointer' }}>Click me</button>,
    content: (
      <div>
        <p style={{ margin: 0, fontWeight: 600, marginBottom: '4px' }}>Popover title</p>
        <p style={{ margin: 0, color: 'var(--color-text-secondary)' }}>This is the popover content area.</p>
      </div>
    ),
  },
};

export const HoverTrigger: Story = {
  args: {
    trigger: 'hover',
    position: 'bottom',
    children: <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>Hover me</span>,
    content: (
      <div>
        <p style={{ margin: 0 }}>Tooltip-style popover content</p>
      </div>
    ),
  },
};

export const PositionTop: Story = {
  args: {
    trigger: 'click',
    position: 'top',
    children: <button type="button" style={{ padding: '8px 16px', cursor: 'pointer' }}>Open above</button>,
    content: <p style={{ margin: 0 }}>Content appears above the trigger.</p>,
  },
};

export const PositionRight: Story = {
  args: {
    trigger: 'click',
    position: 'right',
    children: <button type="button" style={{ padding: '8px 16px', cursor: 'pointer' }}>Open right</button>,
    content: <p style={{ margin: 0 }}>Content appears to the right.</p>,
  },
};

export const PositionLeft: Story = {
  args: {
    trigger: 'click',
    position: 'left',
    children: <button type="button" style={{ padding: '8px 16px', cursor: 'pointer' }}>Open left</button>,
    content: <p style={{ margin: 0 }}>Content appears to the left.</p>,
  },
};

export const OpenByDefault: Story = {
  args: {
    open: true,
    position: 'bottom',
    children: <button type="button" style={{ padding: '8px 16px', cursor: 'pointer' }}>Always open</button>,
    content: <p style={{ margin: 0 }}>This popover is controlled and always open.</p>,
  },
};

// Compact
export const CompactDefault: Story = {
  args: {
    size: 'compact',
    trigger: 'click',
    position: 'bottom',
    children: <button type="button" style={{ padding: '4px 12px', cursor: 'pointer', fontSize: '14px' }}>Compact</button>,
    content: <p style={{ margin: 0, fontSize: '14px' }}>Compact popover content.</p>,
  },
};

export const CompactHover: Story = {
  args: {
    size: 'compact',
    trigger: 'hover',
    position: 'right',
    children: <span style={{ textDecoration: 'underline', cursor: 'pointer', fontSize: '14px' }}>Hover</span>,
    content: <p style={{ margin: 0, fontSize: '14px' }}>Quick tooltip info.</p>,
  },
};
