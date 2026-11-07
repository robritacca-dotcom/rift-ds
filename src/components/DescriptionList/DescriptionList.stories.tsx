import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent } from 'storybook/test';
import { DescriptionList, DescriptionListItem } from './DescriptionList';
import { Button } from '../Button/Button';

const meta = {
  title: 'Components/DescriptionList',
  component: DescriptionList,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  argTypes: {
    layout: { control: 'inline-radio', options: ['stacked', 'inline', 'grid'] },
    columns: { control: 'inline-radio', options: [1, 2, 3, 4] },
    size: { control: 'inline-radio', options: ['default', 'compact'] },
    termWidth: { control: 'inline-radio', options: ['narrow', 'default', 'wide'] },
    align: { control: 'inline-radio', options: ['start', 'end'] },
  },
  args: {
    items: [
      { term: 'Account holder', details: 'Northwind Supply Ltd' },
      { term: 'Sort code', details: '04-00-04' },
      { term: 'Account number', details: '1234 5678', copyable: '12345678' },
      { term: 'Reference', details: null },
    ],
  },
} satisfies Meta<typeof DescriptionList>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Account details: term above value, a copy button on the number, and an empty value said in words. */
export const Default: Story = {};

/** A review screen before submit: two columns with dividers, and an Edit action per answer. */
export const ReviewBeforeSubmit: Story = {
  args: {
    layout: 'inline',
    dividers: true,
    items: [
      { term: 'Full name', details: 'Sam Okafor', action: <Button variant="tertiary" size="compact" label="Edit" /> },
      { term: 'Date of birth', details: '14 Mar 1990', action: <Button variant="tertiary" size="compact" label="Edit" /> },
      {
        term: 'Address',
        details: '4 Harbour Road, Portside, PT1 2AB',
        action: <Button variant="tertiary" size="compact" label="Edit" />,
      },
    ],
  },
};

/** A receipt: compact, narrow terms, amounts against the far edge. */
export const Receipt: Story = {
  args: {
    layout: 'inline',
    size: 'compact',
    termWidth: 'wide',
    align: 'end',
    dividers: true,
    items: [
      { term: 'Subtotal', details: '$1,084.00' },
      { term: 'Delivery', details: '$200.00' },
      { term: 'Tax', details: '$0.00' },
      { term: 'Total paid', details: <strong>$1,284.00</strong> },
    ],
  },
};

/** A record inspector: stacked entries in a grid of three. */
export const RecordGrid: Story = {
  args: {
    layout: 'grid',
    columns: 3,
    items: [
      { term: 'Status', details: 'Open' },
      { term: 'Priority', details: 'High' },
      { term: 'Assignee', details: 'Priya Shah' },
      { term: 'Created', details: '2 Nov 2026' },
      { term: 'Due', details: '9 Nov 2026' },
      { term: 'Ticket', details: 'SUP-4410', copyable: true },
    ],
  },
};

/** Written out by hand with DescriptionListItem, the value as children. */
export const Composed: Story = {
  args: { items: undefined, layout: 'inline' },
  render: (args) => (
    <DescriptionList {...args}>
      <DescriptionListItem term="Plan">Business, billed yearly</DescriptionListItem>
      <DescriptionListItem term="Seats">12 of 15</DescriptionListItem>
      <DescriptionListItem term="Renews">1 Feb 2027</DescriptionListItem>
    </DescriptionList>
  ),
};

/** The copy button names its term and confirms the copy. */
export const Copy: Story = {
  args: { items: [{ term: 'API key', details: 'sk_test_51H8', copyable: true }] },
  play: async ({ canvas }) => {
    const button = canvas.getByRole('button', { name: 'Copy API key' });
    await userEvent.click(button);
    await expect(canvas.getByRole('button', { name: 'Copied' })).toBeInTheDocument();
  },
};
