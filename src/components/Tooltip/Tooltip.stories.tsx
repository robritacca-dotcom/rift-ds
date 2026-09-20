import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tooltip } from './Tooltip';
import { Button } from '../Button/Button';
import { CircularButton } from '../CircularButton/CircularButton';

const meta = {
  title: 'Components/Tooltip',
  component: Tooltip,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    content: { control: 'text' },
    position: {
      control: 'select',
      options: ['top', 'bottom', 'left', 'right'],
    },
    showDelay: { control: 'number' },
    hideDelay: { control: 'number' },
  },
  args: {
    content: 'Tooltip text',
    showDelay: 300,
    hideDelay: 150,
  },
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Top: Story = {
  args: {
    content: 'This is a tooltip',
    position: 'top',
    children: undefined,
  },
  render: (args) => (
    <Tooltip {...args}>
      <Button label="Hover me" variant="secondary" />
    </Tooltip>
  ),
};

export const Bottom: Story = {
  args: {
    content: 'Below the trigger',
    position: 'bottom',
  },
  render: (args) => (
    <Tooltip {...args}>
      <Button label="Hover me" variant="secondary" />
    </Tooltip>
  ),
};

export const Left: Story = {
  args: {
    content: 'To the left',
    position: 'left',
  },
  render: (args) => (
    <Tooltip {...args}>
      <Button label="Hover me" variant="secondary" />
    </Tooltip>
  ),
};

export const Right: Story = {
  args: {
    content: 'To the right',
    position: 'right',
  },
  render: (args) => (
    <Tooltip {...args}>
      <Button label="Hover me" variant="secondary" />
    </Tooltip>
  ),
};

export const OnIconButton: Story = {
  args: {
    content: 'Settings',
    position: 'bottom',
  },
  render: (args) => (
    <Tooltip {...args}>
      <CircularButton icon="settings" ariaLabel="Settings" variant="tertiary" />
    </Tooltip>
  ),
};

export const LongText: Story = {
  args: {
    content: 'This tooltip has a longer description that provides more context',
    position: 'top',
  },
  render: (args) => (
    <Tooltip {...args}>
      <Button label="Hover for details" variant="secondary" />
    </Tooltip>
  ),
};

export const NoDelay: Story = {
  args: {
    content: 'Instant tooltip',
    position: 'top',
    showDelay: 0,
    hideDelay: 0,
  },
  render: (args) => (
    <Tooltip {...args}>
      <Button label="Instant" variant="tertiary" />
    </Tooltip>
  ),
};

export const AllPositions: Story = {
  args: {
    content: 'Tooltip',
  },
  render: () => (
    <div style={{ display: 'flex', gap: '40px', padding: '60px' }}>
      <Tooltip content="Top" position="top">
        <Button label="Top" variant="secondary" />
      </Tooltip>
      <Tooltip content="Bottom" position="bottom">
        <Button label="Bottom" variant="secondary" />
      </Tooltip>
      <Tooltip content="Left" position="left">
        <Button label="Left" variant="secondary" />
      </Tooltip>
      <Tooltip content="Right" position="right">
        <Button label="Right" variant="secondary" />
      </Tooltip>
    </div>
  ),
};
