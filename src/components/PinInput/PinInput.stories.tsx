import type { Meta, StoryObj } from '@storybook/react-vite';
import { PinInput } from './PinInput';

const meta = {
  title: 'Components/PinInput',
  component: PinInput,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    length: { control: { type: 'number', min: 3, max: 8 } },
    format: {
      control: 'select',
      options: ['numeric', 'alphanumeric'],
    },
    mask: { control: 'boolean' },
    error: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  args: {
    label: 'Verification code',
  },
} satisfies Meta<typeof PinInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    helperText: 'Enter the 6-digit code we sent you',
  },
};

export const FourDigits: Story = {
  args: {
    label: 'PIN',
    length: 4,
  },
};

export const Masked: Story = {
  args: {
    label: 'PIN',
    length: 4,
    mask: true,
    defaultValue: '1234',
  },
};

export const Alphanumeric: Story = {
  args: {
    label: 'Invite code',
    format: 'alphanumeric',
    defaultValue: 'A7',
  },
};

export const ErrorState: Story = {
  args: {
    error: true,
    defaultValue: '135791',
    helperText: 'That code has expired. Request a new one.',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    defaultValue: '80',
  },
};
