import type { Meta, StoryObj } from '@storybook/react-vite';
import { Timeline, type TimelineCompany } from './Timeline';

/** Self-contained placeholder logo — a rounded tile with an initial, no external assets. */
const logo = (initial: string, color: string) => (
  <svg viewBox="0 0 32 32" width="32" height="32" role="img" aria-hidden="true">
    <rect width="32" height="32" rx="8" fill={color} />
    <text
      x="16"
      y="21"
      textAnchor="middle"
      fontFamily="Nunito Sans, sans-serif"
      fontSize="16"
      fontWeight="700"
      fill="#ffffff"
    >
      {initial}
    </text>
  </svg>
);

const COMPANY_ITEMS: TimelineCompany[] = [
  {
    name: 'Northlight',
    logo: logo('N', '#236CFF'),
    roles: [
      {
        title: 'Principal Product Designer',
        subtitle: 'Consumer AI',
        start: 'Jan 2026',
        present: true,
        bullets: [
          'Shipped embedded AI experiences in time for tax season.',
          'Designed the bidirectional filing checklist across chat and app.',
        ],
      },
      {
        title: 'Principal Product Designer',
        subtitle: 'Agent Platform',
        start: 'May 2024',
        end: 'Jan 2026',
        bullets: [
          'Led design of the end-to-end conversational AI platform.',
          'Onboarded 150+ teams, 58 in production.',
        ],
      },
    ],
  },
  {
    name: 'Fieldnote',
    logo: logo('F', '#C9A227'),
    roles: [
      {
        title: 'Principal Product Designer',
        start: 'Aug 2023',
        end: 'May 2024',
        description:
          'Led end-to-end UX for a 0→1 generative AI tool for constructible, code-compliant electrical raceway designs.',
        bullets: [
          'Cut time-to-value from 14 to 5 days.',
          'Reduced anomalies per output by 60%.',
        ],
      },
    ],
  },
];

const CAREER_ITEMS = [
  {
    meta: 'May 2024 — Present',
    title: 'Northlight — Staff Product Designer',
    description:
      'Led design of the conversational AI platform powering 3.8M monthly customer interactions.',
  },
  {
    meta: 'Aug 2023 — May 2024',
    title: 'Fieldnote — Lead Product Designer',
    description:
      'Redesigned AI generation workflows for electrical routing — successful generations up ~900%.',
  },
  {
    meta: '2021 — 2023',
    title: 'Acme — Product Designer',
    description: 'Career Profile and Offer Creation platforms for global recruiting.',
  },
];

const PROCESS_ITEMS = [
  { title: 'Pull analytics' },
  { title: 'One hypothesis' },
  { title: 'Rewrite on a branch' },
  { title: 'Approval' },
];

const meta = {
  title: 'Components/Timeline',
  component: Timeline,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    orientation: {
      control: 'select',
      options: ['vertical', 'horizontal'],
    },
    numbered: { control: 'boolean' },
  },
  args: {
    items: CAREER_ITEMS,
  },
} satisfies Meta<typeof Timeline>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    items: CAREER_ITEMS,
  },
};

export const Numbered: Story = {
  args: {
    items: PROCESS_ITEMS,
    numbered: true,
  },
};

export const WithIcons: Story = {
  args: {
    items: [
      { icon: 'monitoring', title: 'Pull analytics', description: 'Read GA4, filter bot noise.' },
      { icon: 'edit', title: 'Rewrite on a branch', description: 'One copy-shaped change.' },
      { icon: 'check_circle', title: 'Approval', description: 'A human approves every merge.' },
    ],
  },
};

export const HorizontalStepper: Story = {
  args: {
    items: PROCESS_ITEMS,
    orientation: 'horizontal',
    numbered: true,
  },
};

export const HorizontalDots: Story = {
  args: {
    items: PROCESS_ITEMS.map(({ title }) => ({ title })),
    orientation: 'horizontal',
  },
};

export const Company: Story = {
  args: {
    variant: 'company',
    items: COMPANY_ITEMS,
  },
};
