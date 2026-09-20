import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Stepper } from './Stepper';

const checkoutSteps = [
  { label: 'Account' },
  { label: 'Delivery' },
  { label: 'Payment' },
  { label: 'Review' },
];

const describedSteps = [
  { label: 'Account', description: 'Sign in or continue as a guest' },
  { label: 'Delivery', description: 'Address and shipping speed' },
  { label: 'Payment', description: 'Card or saved method' },
  { label: 'Review', description: 'Confirm and place the order' },
];

const meta = {
  title: 'Components/Stepper',
  component: Stepper,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
    },
    activeStep: { control: 'number' },
  },
  args: {
    steps: checkoutSteps,
    activeStep: 1,
  },
} satisfies Meta<typeof Stepper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    activeStep: 1,
  },
  render: (args) => (
    <div style={{ width: '560px' }}>
      <Stepper {...args} />
    </div>
  ),
};

export const Vertical: Story = {
  args: {
    steps: describedSteps,
    activeStep: 2,
    orientation: 'vertical',
  },
  render: (args) => (
    <div style={{ width: '320px' }}>
      <Stepper {...args} />
    </div>
  ),
};

export const WithDescriptions: Story = {
  args: {
    steps: describedSteps,
    activeStep: 1,
  },
  render: (args) => (
    <div style={{ width: '720px' }}>
      <Stepper {...args} />
    </div>
  ),
};

const ClickableDemo = () => {
  const [active, setActive] = React.useState(2);
  return (
    <div style={{ width: '560px' }}>
      <Stepper steps={checkoutSteps} activeStep={active} onStepClick={setActive} />
    </div>
  );
};

export const Clickable: Story = {
  render: () => <ClickableDemo />,
};

export const FirstStep: Story = {
  args: {
    activeStep: 0,
  },
  render: (args) => (
    <div style={{ width: '560px' }}>
      <Stepper {...args} />
    </div>
  ),
};

export const AllComplete: Story = {
  args: {
    activeStep: 4,
  },
  render: (args) => (
    <div style={{ width: '560px' }}>
      <Stepper {...args} />
    </div>
  ),
};
