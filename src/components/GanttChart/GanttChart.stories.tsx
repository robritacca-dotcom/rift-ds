import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn } from 'storybook/test';
import { GanttChart } from './GanttChart';
import type { GanttChartItem, GanttChartMilestone } from './GanttChart';

const quarterItems: GanttChartItem[] = [
  { id: 'charter', label: 'Project charter', start: '2026-02-02', end: '2026-02-13', color: 'cobalt' },
  { id: 'review', label: 'Plan review', start: '2026-02-16', end: '2026-02-27', color: 'cobalt' },
  { id: 'scope', label: 'Scope and goals', start: '2026-03-02', end: '2026-03-13', color: 'mint' },
  { id: 'budget', label: 'Budget', start: '2026-03-09', end: '2026-03-27', color: 'mint' },
  { id: 'comms', label: 'Communication plan', start: '2026-03-23', end: '2026-04-10', color: 'gold' },
];

const phasedItems: GanttChartItem[] = [
  { id: 'charter', label: 'Project charter', start: '2026-02-02', end: '2026-02-13', color: 'cobalt', group: 'Conception' },
  { id: 'review', label: 'Plan review', start: '2026-02-16', end: '2026-02-27', color: 'cobalt', group: 'Conception' },
  { id: 'scope', label: 'Scope and goals', start: '2026-03-02', end: '2026-03-13', color: 'mint', group: 'Planning' },
  { id: 'budget', label: 'Budget', start: '2026-03-09', end: '2026-03-27', color: 'mint', group: 'Planning' },
  { id: 'risk', label: 'Risk management', start: '2026-03-16', end: '2026-04-03', color: 'mint', group: 'Planning' },
  { id: 'tracking', label: 'Status and tracking', start: '2026-04-06', end: '2026-06-26', color: 'violet', group: 'Execution' },
  { id: 'quality', label: 'Quality', start: '2026-04-13', end: '2026-06-12', color: 'violet', group: 'Execution' },
];

const progressItems: GanttChartItem[] = [
  { id: 'foundation', label: 'Foundations', start: '2026-02-02', end: '2026-03-13', color: 'cobalt', progress: 100 },
  { id: 'build', label: 'Component build', start: '2026-03-02', end: '2026-04-24', color: 'mint', progress: 65 },
  { id: 'docs', label: 'Documentation', start: '2026-04-06', end: '2026-05-15', color: 'gold', progress: 20 },
  { id: 'launch-prep', label: 'Launch prep', start: '2026-05-04', end: '2026-05-29', color: 'coral', progress: 0 },
];

const milestones: GanttChartMilestone[] = [
  { id: 'kickoff', label: 'Kickoff', date: '2026-02-02', color: 'cobalt' },
  { id: 'beta', label: 'Beta release', date: '2026-04-17', color: 'violet' },
  { id: 'ga', label: 'General availability', date: '2026-05-29', color: 'coral' },
];

const meta = {
  title: 'Components/GanttChart',
  component: GanttChart,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    selectedId: { control: 'text' },
    showToday: { control: 'boolean' },
    showGrid: { control: 'boolean' },
    bare: { control: 'boolean' },
  },
  args: {
    items: quarterItems,
    title: 'Delivery plan',
    subtitle: 'February through April',
    showToday: false,
  },
} satisfies Meta<typeof GanttChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Phases: Story = {
  args: {
    items: phasedItems,
    title: 'Programme timeline',
    subtitle: 'Three phases from conception to execution',
  },
};

export const WithProgress: Story = {
  args: {
    items: progressItems,
    title: 'Release readiness',
    subtitle: 'Completion per workstream',
  },
};

export const WithMilestones: Story = {
  args: {
    items: progressItems,
    milestones,
    title: 'Release readiness',
    subtitle: 'Workstreams and the dates that anchor them',
  },
};

export const Projected: Story = {
  args: {
    items: [
      { id: 'shipped', label: 'Shipped work', start: '2026-02-02', end: '2026-03-27', color: 'cobalt', progress: 100 },
      { id: 'current', label: 'In flight', start: '2026-03-23', end: '2026-04-24', color: 'mint', progress: 40 },
      {
        id: 'planned',
        label: 'Planned work',
        start: '2026-05-04',
        end: '2026-06-26',
        color: 'violet',
        projected: true,
        detail: 'Target: late Q2',
      },
    ],
    title: 'Roadmap',
    subtitle: 'Dashed bars are targets, not commitments',
  },
};

export const Interactive: Story = {
  args: {
    items: quarterItems,
    selectedId: 'budget',
    onItemClick: fn(),
    title: 'Delivery plan',
    subtitle: 'Bars become buttons when a click callback is passed',
  },
  play: async ({ args, canvas, userEvent }) => {
    const bar = await canvas.findByRole('button', {
      name: /Budget, Mar 9, 2026 to Mar 27, 2026/,
    });
    await expect(bar).toHaveAttribute('aria-pressed', 'true');
    await userEvent.click(bar);
    await expect(args.onItemClick).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'budget' }),
    );
  },
};

export const YearSpan: Story = {
  args: {
    items: [
      { id: 'q1', label: 'Discovery', start: '2026-01-05', end: '2026-03-27', color: 'cobalt', group: 'Research' },
      { id: 'q2', label: 'Build', start: '2026-03-30', end: '2026-08-28', color: 'mint', group: 'Delivery' },
      { id: 'q3', label: 'Hardening', start: '2026-08-03', end: '2026-10-30', color: 'gold', group: 'Delivery' },
      { id: 'q4', label: 'Rollout', start: '2026-10-05', end: '2026-12-18', color: 'coral', group: 'Launch' },
    ],
    milestones: [{ id: 'ga', label: 'General availability', date: '2026-11-16', color: 'coral', group: 'Launch' }],
    showToday: true,
    title: 'Annual roadmap',
    subtitle: 'Scroll sideways on narrow screens; the labels stay pinned',
  },
};

export const Bare: Story = {
  args: {
    items: quarterItems,
    title: undefined,
    subtitle: undefined,
    bare: true,
  },
};
