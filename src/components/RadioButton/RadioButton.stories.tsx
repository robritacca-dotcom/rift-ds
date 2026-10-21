import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn } from 'storybook/test';
import { RadioButton, RadioGroup } from './RadioButton';

/* ============================================
   SINGLE RADIO BUTTON STORIES
   ============================================ */

const radioMeta = {
  title: 'Components/RadioButton',
  component: RadioButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
    value: { control: 'text' },
  },
  args: {
    onValueChange: fn(),
  },
} satisfies Meta<typeof RadioButton>;

export default radioMeta;
type Story = StoryObj<typeof radioMeta>;

export const Unselected: Story = {
  args: {
    label: 'Option A',
    checked: false,
    value: 'a',
  },
};

export const Selected: Story = {
  args: {
    label: 'Option A',
    checked: true,
    value: 'a',
  },
};

export const DisabledUnselected: Story = {
  args: {
    label: 'Disabled option',
    checked: false,
    disabled: true,
    value: 'disabled',
  },
};

export const DisabledSelected: Story = {
  args: {
    label: 'Disabled selected',
    checked: true,
    disabled: true,
    value: 'disabled',
  },
};

/* ============================================
   RADIO GROUP STORIES
   ============================================ */

export const GroupVertical: StoryObj<typeof RadioGroup> = {
  render: (args) => <RadioGroup {...args} />,
  args: {
    label: 'Select size',
    value: 'medium',
    options: [
      { label: 'Small', value: 'small' },
      { label: 'Medium', value: 'medium' },
      { label: 'Large', value: 'large' },
    ],
    direction: 'vertical',
    onValueChange: fn(),
  },
};

/** No `value`: the group keeps its own selection, starting from `defaultValue`. */
export const GroupUncontrolled: StoryObj<typeof RadioGroup> = {
  render: (args) => <RadioGroup {...args} />,
  args: {
    label: 'Delivery',
    defaultValue: 'standard',
    options: [
      { label: 'Standard', value: 'standard' },
      { label: 'Express', value: 'express' },
      { label: 'Overnight', value: 'overnight' },
    ],
    direction: 'vertical',
    onValueChange: fn(),
  },
  play: async ({ canvas, userEvent }) => {
    const express = canvas.getByRole('radio', { name: 'Express' });
    await userEvent.click(express);
    await expect(express).toHaveAttribute('aria-checked', 'true');
    await expect(canvas.getByRole('radio', { name: 'Standard' })).toHaveAttribute('aria-checked', 'false');
  },
};

export const GroupHorizontal: StoryObj<typeof RadioGroup> = {
  render: (args) => <RadioGroup {...args} />,
  args: {
    label: 'Select colour',
    value: 'teal',
    options: [
      { label: 'Red', value: 'red' },
      { label: 'Teal', value: 'teal' },
      { label: 'Purple', value: 'purple' },
    ],
    direction: 'horizontal',
    onValueChange: fn(),
  },
};

export const GroupWithDisabled: StoryObj<typeof RadioGroup> = {
  render: (args) => <RadioGroup {...args} />,
  args: {
    label: 'Plan',
    value: 'pro',
    options: [
      { label: 'Free', value: 'free' },
      { label: 'Pro', value: 'pro' },
      { label: 'Enterprise', value: 'enterprise', disabled: true },
    ],
    direction: 'vertical',
    onValueChange: fn(),
  },
};

export const GroupWithHelper: StoryObj<typeof RadioGroup> = {
  render: (args) => <RadioGroup {...args} />,
  args: {
    label: 'Billing cycle',
    helperText: 'Switch any time; the change applies next cycle.',
    required: true,
    value: 'monthly',
    options: [
      { label: 'Monthly', value: 'monthly' },
      { label: 'Yearly', value: 'yearly' },
    ],
    direction: 'vertical',
    onValueChange: fn(),
  },
};

export const GroupError: StoryObj<typeof RadioGroup> = {
  render: (args) => <RadioGroup {...args} />,
  args: {
    label: 'Billing cycle',
    helperText: 'Choose a billing cycle to continue.',
    required: true,
    error: true,
    options: [
      { label: 'Monthly', value: 'monthly' },
      { label: 'Yearly', value: 'yearly' },
    ],
    direction: 'vertical',
    onValueChange: fn(),
  },
};
