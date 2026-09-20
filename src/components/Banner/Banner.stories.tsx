import type { Meta, StoryObj } from '@storybook/react-vite';
import { Banner } from './Banner';
import { Button } from '../Button/Button';

const meta = {
  title: 'Components/Banner',
  component: Banner,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['info', 'positive', 'warning', 'error', 'neutral'],
    },
    align: {
      control: 'select',
      options: ['start', 'center'],
    },
    icon: { control: 'text' },
  },
} satisfies Meta<typeof Banner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    variant: 'info',
    title: 'Scheduled maintenance.',
    children: 'The dashboard will be read-only on Saturday between 02:00 and 04:00 UTC.',
  },
};

export const Positive: Story = {
  args: {
    variant: 'positive',
    title: 'Version 2.0 is live.',
    children: 'Every workspace has been upgraded automatically.',
  },
};

export const Warning: Story = {
  args: {
    variant: 'warning',
    title: 'Trial ending.',
    children: 'Your workspace moves to the free plan in 3 days.',
  },
};

export const Error: Story = {
  args: {
    variant: 'error',
    title: 'Sync paused.',
    children: 'We could not reach the server. Changes are saved locally.',
  },
};

export const Neutral: Story = {
  args: {
    variant: 'neutral',
    children: 'You are viewing the staging environment.',
    align: 'center',
  },
};

export const WithAction: Story = {
  args: {
    variant: 'warning',
    title: 'Trial ending.',
    children: 'Your workspace moves to the free plan in 3 days.',
    action: <Button variant="secondary" size="compact" label="Upgrade" />,
  },
};

export const Dismissible: Story = {
  args: {
    variant: 'info',
    title: 'New in this release.',
    children: 'The reporting page now exports to CSV.',
    dismissible: true,
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <Banner variant="info" title="Info.">Informational announcement.</Banner>
      <Banner variant="positive" title="Success.">Everything went through.</Banner>
      <Banner variant="warning" title="Warning.">Something needs attention.</Banner>
      <Banner variant="error" title="Error.">Something went wrong.</Banner>
      <Banner variant="neutral">Neutral notice.</Banner>
    </div>
  ),
};
