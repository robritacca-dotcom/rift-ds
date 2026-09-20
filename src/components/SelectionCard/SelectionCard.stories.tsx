import type { Meta, StoryObj } from '@storybook/react-vite';
import { SelectionCard } from './SelectionCard';

const meta: Meta<typeof SelectionCard> = {
  title: 'Components/SelectionCard',
  component: SelectionCard,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    mode: { control: 'radio', options: ['radio', 'checkbox', 'toggle'] },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '400px' }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof SelectionCard>;

/* ============================================
   RADIO (SINGLE SELECT)
   ============================================ */

export const Radio: Story = {
  args: {
    mode: 'radio',
    name: 'Compute Environment',
    value: 'kubernetes',
    options: [
      {
        value: 'kubernetes',
        label: 'Kubernetes',
        description: 'Run GPU workloads on a K8s configured cluster. This is the default.',
      },
      {
        value: 'vm',
        label: 'Virtual Machine',
        description: 'Access a VM configured cluster to run workloads.',
      },
    ],
  },
};

/* ============================================
   CHECKBOX (MULTI SELECT)
   ============================================ */

export const Checkbox: Story = {
  args: {
    mode: 'checkbox',
    name: 'Features',
    value: ['monitoring'],
    options: [
      {
        value: 'monitoring',
        label: 'Monitoring',
        description: 'Enable real-time monitoring and alerting for your cluster.',
      },
      {
        value: 'logging',
        label: 'Logging',
        description: 'Centralised log aggregation and search.',
      },
      {
        value: 'backups',
        label: 'Backups',
        description: 'Automated daily backups with point-in-time recovery.',
      },
    ],
  },
};

/* ============================================
   WITH DISABLED OPTION
   ============================================ */

export const WithDisabled: Story = {
  args: {
    mode: 'radio',
    name: 'Plan',
    value: 'pro',
    options: [
      {
        value: 'pro',
        label: 'Pro',
        description: 'For teams and growing businesses.',
      },
      {
        value: 'enterprise',
        label: 'Enterprise',
        description: 'Custom solutions for large organisations.',
        disabled: true,
      },
    ],
  },
};

/* ============================================
   NO DESCRIPTION
   ============================================ */

export const NoDescription: Story = {
  args: {
    mode: 'radio',
    name: 'Theme',
    value: 'dark',
    options: [
      { value: 'light', label: 'Light' },
      { value: 'dark', label: 'Dark' },
      { value: 'system', label: 'System' },
    ],
  },
};

/* ============================================
   MANY OPTIONS (CHECKBOX)
   ============================================ */

export const ManyOptions: Story = {
  args: {
    mode: 'checkbox',
    name: 'Notifications',
    value: ['email', 'push'],
    options: [
      { value: 'email', label: 'Email', description: 'Receive notifications via email.' },
      { value: 'push', label: 'Push', description: 'Receive push notifications on your device.' },
      { value: 'sms', label: 'SMS', description: 'Receive text message notifications.' },
      { value: 'slack', label: 'Slack', description: 'Receive notifications in Slack channels.' },
    ],
  },
};

/* ============================================
   TOGGLE (ON/OFF SWITCHES)
   ============================================ */

export const Toggle: Story = {
  args: {
    mode: 'toggle',
    name: 'Settings',
    value: ['notifications', 'analytics'],
    options: [
      {
        value: 'notifications',
        label: 'Notifications',
        description: 'Enable push notifications for important updates.',
      },
      {
        value: 'analytics',
        label: 'Analytics',
        description: 'Share anonymous usage data to help improve the product.',
      },
      {
        value: 'beta',
        label: 'Beta features',
        description: 'Get early access to experimental features.',
      },
    ],
  },
};
