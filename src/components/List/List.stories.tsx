import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { List, ListItem } from './List';

const meta = {
  title: 'Components/List',
  component: List,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'inline-radio', options: ['unordered', 'ordered', 'plain'] },
    marker: { control: 'select', options: ['disc', 'number', 'check', 'none', 'star', 'bolt'] },
    spacing: { control: 'inline-radio', options: ['compact', 'default', 'relaxed'] },
    size: { control: 'inline-radio', options: ['default', 'compact'] },
  },
  args: {
    children: [
      <ListItem key="a">Unlimited invoices</ListItem>,
      <ListItem key="b">Card and bank payments</ListItem>,
      <ListItem key="c">Automatic reminders</ListItem>,
    ],
  },
} satisfies Meta<typeof List>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** A plan's features, ticked with the form controls' check. */
export const Features: Story = {
  args: { marker: 'check' },
};

/** Steps whose order matters, each with a line of detail. */
export const Steps: Story = {
  args: {
    variant: 'ordered',
    spacing: 'relaxed',
    children: [
      <ListItem key="a" description="Your legal name and the address on your bank statements.">
        Add your business details
      </ListItem>,
      <ListItem key="b" description="We send two small deposits to confirm the account.">
        Connect a bank account
      </ListItem>,
      <ListItem key="c" description="Most reviews finish within one business day.">
        Submit for review
      </ListItem>,
    ],
  },
  play: async ({ canvas }) => {
    const list = canvas.getByRole('list');
    await expect(list.tagName).toBe('OL');
    await expect(canvas.getAllByRole('listitem')).toHaveLength(3);
  },
};

/** What a plan includes: each item's own icon replaces the marker. The icons decorate; the text says everything. */
export const ItemIcons: Story = {
  args: {
    variant: 'plain',
    size: 'compact',
    spacing: 'compact',
    children: [
      <ListItem key="a" icon="lock">
        Two-step sign-in for every seat
      </ListItem>,
      <ListItem key="b" icon="schedule">
        Scheduled exports to your storage
      </ListItem>,
      <ListItem key="c" icon="support_agent">
        Priority support on weekdays
      </ListItem>,
    ],
  },
};

/** A named icon as every item's marker. */
export const IconMarker: Story = {
  args: { marker: 'bolt' },
};

/** An ordered list counting down from five. */
export const Countdown: Story = {
  args: {
    variant: 'ordered',
    start: 5,
    reversed: true,
    children: [
      <ListItem key="a">Fifth place</ListItem>,
      <ListItem key="b">Fourth place</ListItem>,
      <ListItem key="c">Third place</ListItem>,
    ],
  },
};

/** No markers and no indent: a stack of lines in the list's rhythm. */
export const Plain: Story = {
  args: { variant: 'plain' },
};
