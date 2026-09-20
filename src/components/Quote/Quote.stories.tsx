import type { Meta, StoryObj } from '@storybook/react-vite';
import { Quote } from './Quote';

const meta = {
  title: 'Components/Quote',
  component: Quote,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    children: { control: 'text' },
    attribution: { control: 'text' },
    detail: { control: 'text' },
    variant: {
      control: 'select',
      options: ['default', 'pull'],
    },
  },
  args: {
    children:
      'Large-scale systems are not primarily UI problems. They are coordination problems.',
  },
} satisfies Meta<typeof Quote>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children:
      'Large-scale systems are not primarily UI problems. They are coordination problems.',
  },
};

export const WithAttribution: Story = {
  args: {
    children:
      'The challenge is creating frameworks that allow hundreds of people and teams to build coherently over time.',
    attribution: 'Jordan Reyes',
    detail: 'Career Profile case study',
  },
};

export const Pull: Story = {
  args: {
    variant: 'pull',
    children:
      'Tokens flow from Figma to production without a handoff meeting.',
  },
};

export const PullWithAttribution: Story = {
  args: {
    variant: 'pull',
    children: 'Design still derisks development.',
    attribution: 'Jordan Reyes',
    detail: 'Writing, 2026',
  },
};
