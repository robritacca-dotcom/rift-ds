import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
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
    onChange: fn(),
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
    name: 'size',
    value: 'medium',
    options: [
      { label: 'Small', value: 'small' },
      { label: 'Medium', value: 'medium' },
      { label: 'Large', value: 'large' },
    ],
    direction: 'vertical',
    onChange: fn(),
  },
};

export const GroupHorizontal: StoryObj<typeof RadioGroup> = {
  render: (args) => <RadioGroup {...args} />,
  args: {
    label: 'Select colour',
    name: 'colour',
    value: 'teal',
    options: [
      { label: 'Red', value: 'red' },
      { label: 'Teal', value: 'teal' },
      { label: 'Purple', value: 'purple' },
    ],
    direction: 'horizontal',
    onChange: fn(),
  },
};

export const GroupWithDisabled: StoryObj<typeof RadioGroup> = {
  render: (args) => <RadioGroup {...args} />,
  args: {
    label: 'Plan',
    name: 'plan',
    value: 'pro',
    options: [
      { label: 'Free', value: 'free' },
      { label: 'Pro', value: 'pro' },
      { label: 'Enterprise', value: 'enterprise', disabled: true },
    ],
    direction: 'vertical',
    onChange: fn(),
  },
};
