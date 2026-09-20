import type { Meta, StoryObj } from '@storybook/react-vite';
import { FilterBar } from './FilterBar';

const filters = [
  {
    id: 'status',
    label: 'Status',
    icon: 'flag',
    options: [
      { value: 'open', label: 'Open' },
      { value: 'in-progress', label: 'In progress' },
      { value: 'done', label: 'Done' },
    ],
  },
  {
    id: 'assignee',
    label: 'Assignee',
    icon: 'person',
    options: [
      { value: 'ada', label: 'Ada Lovelace' },
      { value: 'grace', label: 'Grace Hopper' },
      { value: 'alan', label: 'Alan Turing' },
    ],
  },
  {
    id: 'priority',
    label: 'Priority',
    icon: 'priority_high',
    multiple: false,
    options: [
      { value: 'low', label: 'Low' },
      { value: 'medium', label: 'Medium' },
      { value: 'high', label: 'High' },
    ],
  },
];

const meta = {
  title: 'Components/FilterBar',
  component: FilterBar,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['default', 'compact'],
    },
  },
  args: {
    filters,
  },
} satisfies Meta<typeof FilterBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithActiveFilters: Story = {
  args: {
    defaultValues: {
      status: ['open', 'in-progress'],
      priority: ['high'],
    },
  },
};

export const SingleSelectOnly: Story = {
  args: {
    filters: [filters[2]],
    defaultValues: { priority: ['medium'] },
  },
};

export const Compact: Story = {
  args: {
    size: 'compact',
    defaultValues: { assignee: ['ada'] },
  },
};

export const CustomClearLabel: Story = {
  args: {
    clearLabel: 'Reset filters',
    defaultValues: { status: ['done'] },
  },
};
