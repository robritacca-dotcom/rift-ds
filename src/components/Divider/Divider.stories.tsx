import type { Meta, StoryObj } from '@storybook/react-vite';
import { Divider } from './Divider';

const meta = {
  title: 'Components/Divider',
  component: Divider,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
    },
    label: { control: 'text' },
    labelPosition: {
      control: 'select',
      options: ['start', 'center'],
    },
    spacing: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg'],
    },
  },
} satisfies Meta<typeof Divider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div style={{ width: '360px' }}>
      <p style={{ margin: 0 }}>Content above the divider.</p>
      <Divider {...args} />
      <p style={{ margin: 0 }}>Content below the divider.</p>
    </div>
  ),
};

export const WithLabel: Story = {
  args: {
    label: 'or',
  },
  render: (args) => (
    <div style={{ width: '360px' }}>
      <p style={{ margin: 0 }}>Sign in with your email.</p>
      <Divider {...args} />
      <p style={{ margin: 0 }}>Continue with a provider.</p>
    </div>
  ),
};

export const LabelStart: Story = {
  args: {
    label: 'Details',
    labelPosition: 'start',
  },
  render: (args) => (
    <div style={{ width: '360px' }}>
      <p style={{ margin: 0 }}>Summary section.</p>
      <Divider {...args} />
      <p style={{ margin: 0 }}>Detail section.</p>
    </div>
  ),
};

export const Vertical: Story = {
  args: {
    orientation: 'vertical',
  },
  render: (args) => (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <span>Edit</span>
      <Divider {...args} />
      <span>Duplicate</span>
      <Divider {...args} />
      <span>Delete</span>
    </div>
  ),
};

export const SpacingVariants: Story = {
  render: () => (
    <div style={{ width: '360px' }}>
      <p style={{ margin: 0 }}>none</p>
      <Divider spacing="none" />
      <p style={{ margin: 0 }}>sm</p>
      <Divider spacing="sm" />
      <p style={{ margin: 0 }}>md</p>
      <Divider spacing="md" />
      <p style={{ margin: 0 }}>lg</p>
      <Divider spacing="lg" />
      <p style={{ margin: 0 }}>end</p>
    </div>
  ),
};
