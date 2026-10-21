import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
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

/**
 * Completed and active steps are buttons. A completed step says so in its
 * name (the check mark is decorative), the active step carries
 * `aria-current="step"`, and upcoming steps are plain, unannounced text.
 */
export const Clickable: Story = {
  render: () => <ClickableDemo />,
  play: async ({ canvas, userEvent }) => {
    const items = canvas.getAllByRole('listitem');
    await expect(canvas.getByRole('button', { name: 'Account Completed' })).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: 'Delivery Completed' })).toBeInTheDocument();
    const payment = canvas.getByRole('button', { name: 'Payment' });
    await expect(items[2]).toHaveAttribute('aria-current', 'step');
    await expect(items[3]).not.toHaveTextContent('Completed');
    await expect(canvas.queryByRole('button', { name: /Review/ })).toBeNull();

    // Revisiting the first step turns the later ones back to upcoming.
    await userEvent.click(canvas.getByRole('button', { name: 'Account Completed' }));
    await expect(items[0]).toHaveAttribute('aria-current', 'step');
    await expect(canvas.getByRole('button', { name: 'Account' })).toBeInTheDocument();
    await expect(payment).not.toBeInTheDocument();
    await expect(canvas.queryByText('Completed')).toBeNull();
  },
};

/** `completeLabel` replaces the spoken status, for a localised flow. */
export const LocalisedStatus: Story = {
  args: {
    activeStep: 2,
    completeLabel: 'Terminé',
    'aria-label': 'Progression',
  },
  render: (args) => (
    <div style={{ width: '560px' }}>
      <Stepper {...args} />
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getAllByText('Terminé')).toHaveLength(2);
    await expect(canvas.queryByText('Completed')).toBeNull();
  },
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
