import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { OrgChart, type OrgChartNode } from './OrgChart';

const team: OrgChartNode = {
  id: 'lead',
  name: 'Ada Lovelace',
  role: 'Head of product',
  href: '#ada',
  reports: [
    {
      id: 'design',
      name: 'Grace Hopper',
      role: 'Design lead',
      href: '#grace',
      reports: [
        { id: 'd1', name: 'Alan Turing', role: 'Product designer', href: '#alan' },
        { id: 'd2', name: 'Katherine Johnson', role: 'Researcher', href: '#katherine' },
      ],
    },
    {
      id: 'eng',
      name: 'Margaret Hamilton',
      role: 'Engineering lead',
      href: '#margaret',
      reports: [
        { id: 'e1', name: 'Dennis Ritchie', role: 'Engineer', href: '#dennis' },
        { id: 'e2', name: 'Barbara Liskov', role: 'Engineer', href: '#barbara' },
        { id: 'e3', name: 'Ken Thompson', role: 'Engineer', href: '#ken' },
      ],
    },
    { id: 'ops', name: 'Hedy Lamarr', role: 'Operations', href: '#hedy' },
  ],
};

const meta = {
  title: 'Components/OrgChart',
  component: OrgChart,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  args: { root: team, label: 'Product team' },
} satisfies Meta<typeof OrgChart>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Who reports to whom, top down, each name a link to the person's profile. */
export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('group', { name: 'Product team' })).toBeInTheDocument();
    // The hierarchy is nested lists: the lead's item holds the list of their reports.
    const lead = canvas.getByRole('link', { name: 'Ada Lovelace' }).closest('li')!;
    await expect(lead.querySelector(':scope > ul')?.children).toHaveLength(3);
  },
};

/** Without links: a chart to read, not to navigate from. */
export const ReadOnly: Story = {
  args: {
    root: {
      id: 'r',
      name: 'Grace Hopper',
      role: 'Design lead',
      reports: [
        { id: 'a', name: 'Alan Turing', role: 'Product designer' },
        { id: 'b', name: 'Katherine Johnson', role: 'Researcher' },
      ],
    },
  },
};

/** In a narrow column the chart scrolls sideways rather than squeezing its cards. */
export const Narrow: Story = {
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '360px' }}>
        <Story />
      </div>
    ),
  ],
};
