import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { ToggleSwitch } from './ToggleSwitch';

const meta = {
  title: 'Components/ToggleSwitch',
  component: ToggleSwitch,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    checked: {
      control: 'boolean',
    },
    label: {
      control: 'text',
    },
    showLabel: {
      control: 'boolean',
    },
    disabled: {
      control: 'boolean',
    },
  },
  args: {
    onChange: fn(),
  },
} satisfies Meta<typeof ToggleSwitch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const On: Story = {
  args: {
    checked: true,
    label: 'Dark Mode',
  },
};

export const Off: Story = {
  args: {
    checked: false,
    label: 'Light Mode',
  },
};

export const WithoutLabel: Story = {
  args: {
    checked: true,
    showLabel: false,
    ariaLabel: 'Toggle theme',
  },
};

export const Disabled: Story = {
  args: {
    checked: true,
    label: 'Disabled',
    disabled: true,
  },
};

export const DisabledOff: Story = {
  args: {
    checked: false,
    label: 'Disabled Off',
    disabled: true,
  },
};
