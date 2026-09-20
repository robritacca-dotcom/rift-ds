import type { Meta, StoryObj } from '@storybook/react-vite';
import { AgentPlan } from './AgentPlan';

const meta = {
  title: 'Components/AgentPlan',
  component: AgentPlan,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    open: { control: 'boolean' },
    defaultOpen: { control: 'boolean' },
    title: { control: 'text' },
  },
} satisfies Meta<typeof AgentPlan>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    steps: [
      { label: 'Read project files', status: 'completed' },
      { label: 'Update light mode tokens', status: 'completed' },
      { label: 'Implement dark mode tokens', status: 'active' },
      { label: 'Add a reusable theme toggle' },
      { label: 'Run lint and a production build' },
    ],
  },
};

export const AllComplete: Story = {
  args: {
    steps: [
      { label: 'Read project files', status: 'completed' },
      { label: 'Update light mode tokens', status: 'completed' },
      { label: 'Implement dark mode tokens', status: 'completed' },
    ],
  },
};

export const WithFailedStep: Story = {
  args: {
    steps: [
      { label: 'Read project files', status: 'completed' },
      { label: 'Run the test suite', status: 'failed', detail: '2 stories throw on render' },
      { label: 'Open a pull request' },
    ],
  },
};

export const WithDetails: Story = {
  args: {
    steps: [
      {
        label: 'Survey the token files',
        status: 'completed',
        detail: 'tokens-light.css, tokens-dark.css',
      },
      {
        label: 'Rename the composer radius token',
        status: 'active',
        detail: 'Twelve call sites across four components',
      },
      { label: 'Regenerate the token registry' },
    ],
  },
};

export const CollapsedByDefault: Story = {
  args: {
    defaultOpen: false,
    steps: [
      { label: 'Read project files', status: 'completed' },
      { label: 'Implement dark mode tokens', status: 'active' },
      { label: 'Run lint and a production build' },
    ],
  },
};

export const CustomTitle: Story = {
  args: {
    title: 'Refactoring the theme layer',
    steps: [
      { label: 'Read project files', status: 'completed' },
      { label: 'Implement dark mode tokens', status: 'active' },
      { label: 'Run lint and a production build' },
    ],
  },
};
