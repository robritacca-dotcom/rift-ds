import type { Meta, StoryObj } from '@storybook/react-vite';
import { ContributionGraph, type ContributionDay } from './ContributionGraph';

/** Deterministic pseudo-random generator so stories render consistently */
const seededRandom = (seed: number) => () => {
  seed = (seed * 9301 + 49297) % 233280;
  return seed / 233280;
};

/** Generate a year of mock contribution data ending today */
const generateYear = (seed = 42): { days: ContributionDay[]; total: number } => {
  const random = seededRandom(seed);
  const days: ContributionDay[] = [];
  let total = 0;

  const end = new Date();
  const start = new Date(end);
  start.setFullYear(start.getFullYear() - 1);

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
    const active = random() < (isWeekend ? 0.25 : 0.6);
    const count = active ? Math.floor(random() * 12) + 1 : 0;
    const level = (count === 0 ? 0 : count < 3 ? 1 : count < 6 ? 2 : count < 9 ? 3 : 4) as ContributionDay['level'];
    total += count;

    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    days.push({ date: iso, count, level });
  }

  return { days, total };
};

const yearData = generateYear();

const meta = {
  title: 'Components/ContributionGraph',
  component: ContributionGraph,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    days: { control: false },
    caption: { control: 'text' },
    showMonthLabels: { control: 'boolean' },
    showLegend: { control: 'boolean' },
  },
  args: {
    days: yearData.days,
    caption: `${yearData.total} contributions in the last year`,
  },
} satisfies Meta<typeof ContributionGraph>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithHeader: Story = {
  args: {
    title: 'Contribution activity',
    subtitle: 'One cell per day, coloured by volume',
  },
};

export const Bare: Story = {
  args: {
    bare: true,
  },
};

export const WithoutLegend: Story = {
  args: {
    showLegend: false,
  },
};

export const WithoutMonthLabels: Story = {
  args: {
    showMonthLabels: false,
  },
};

export const GridOnly: Story = {
  args: {
    caption: undefined,
    showMonthLabels: false,
    showLegend: false,
  },
};

export const QuietYear: Story = {
  args: (() => {
    const { days } = generateYear(7);
    const quiet = days.map((day) => ({
      ...day,
      count: day.count > 2 ? 1 : 0,
      level: (day.count > 2 ? 1 : 0) as ContributionDay['level'],
    }));
    const total = quiet.reduce((sum, day) => sum + day.count, 0);
    return { days: quiet, caption: `${total} contributions in the last year` };
  })(),
};
