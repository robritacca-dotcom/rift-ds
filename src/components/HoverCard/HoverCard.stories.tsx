import type { Meta, StoryObj } from '@storybook/react-vite';
import { HoverCard } from './HoverCard';
import { Avatar } from '../Avatar/Avatar';
import { Button } from '../Button/Button';

const profileContent = (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <Avatar size="sm" name="Jane Doe" />
      <div>
        <div style={{ fontWeight: 600 }}>Jane Doe</div>
        <div style={{ color: 'var(--color-text-tertiary)' }}>Product designer</div>
      </div>
    </div>
    <p style={{ margin: 0 }}>Designs the flows, then argues with the copy until it fits.</p>
  </div>
);

const meta = {
  title: 'Components/HoverCard',
  component: HoverCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    position: {
      control: 'select',
      options: ['top', 'bottom', 'left', 'right'],
    },
  },
  args: {
    content: profileContent,
    children: <Button variant="tertiary" label="@janedoe" />,
  },
} satisfies Meta<typeof HoverCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Top: Story = {
  args: {
    position: 'top',
  },
};

export const Right: Story = {
  args: {
    position: 'right',
    children: <Button variant="secondary" label="Hover me" />,
  },
};

export const TextTrigger: Story = {
  render: (args) => (
    <p style={{ maxWidth: '360px' }}>
      The component library ships to npm as{' '}
      <HoverCard {...args}>
        <a href="#package" style={{ color: 'var(--color-action-primary-text-tertiary)' }}>
          @robr0/design-system
        </a>
      </HoverCard>{' '}
      and the website consumes it like any other package.
    </p>
  ),
  args: {
    // Phrasing-level markup only: the card sits inside a <p>, where any
    // block element would end the paragraph mid-parse.
    content: (
      <span style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <span style={{ fontWeight: 600 }}>@robr0/design-system</span>
        <span>
          React component library with semantic tokens, light and dark themes, and a chat set.
        </span>
      </span>
    ),
  },
};

export const InstantOpen: Story = {
  args: {
    showDelay: 0,
    children: <Button variant="secondary" label="No delay" />,
  },
};
