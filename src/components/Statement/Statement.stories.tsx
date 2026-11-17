import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { Statement } from './Statement';

const meta = {
  title: 'Components/Statement',
  component: Statement,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'inline-radio', options: ['default', 'compact'] },
  },
  args: {
    caption: 'Profit and loss',
    captionVisible: true,
    periods: ['Q1', 'Q2'],
    items: [
      {
        kind: 'section',
        id: 'revenue',
        title: 'Revenue',
        totalLabel: 'Total revenue',
        lines: [
          { id: 'subs', label: 'Subscriptions', amounts: ['84200.00', '91350.50'] },
          { id: 'services', label: 'Services', amounts: ['12400.00', '9800.00'] },
        ],
      },
      {
        kind: 'section',
        id: 'cogs',
        title: 'Cost of sales',
        totalLabel: 'Total cost of sales',
        sign: -1,
        lines: [
          { id: 'hosting', label: 'Hosting', amounts: ['8120.40', '8640.10'] },
          { id: 'support', label: 'Support', amounts: ['6300.00', '6300.00'] },
        ],
      },
      { kind: 'subtotal', id: 'gross', label: 'Gross profit' },
      {
        kind: 'section',
        id: 'opex',
        title: 'Operating expenses',
        totalLabel: 'Total operating expenses',
        sign: -1,
        lines: [
          { id: 'people', label: 'People', amounts: ['52000.00', '54000.00'] },
          { id: 'rent', label: 'Rent', amounts: ['7500.00', '7500.00'] },
          { id: 'software', label: 'Software', amounts: ['2210.25', '2340.75'] },
        ],
      },
      { kind: 'subtotal', id: 'net', label: 'Net profit' },
    ],
  },
} satisfies Meta<typeof Statement>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Sections with their totals, and the subtotals between them down to the bottom line, one column per period. */
export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('table', { name: 'Profit and loss' })).toBeInTheDocument();
    const gross = canvas.getByRole('rowheader', { name: 'Gross profit' }).closest('tr')!;
    // 96,600.00 of revenue less 14,420.40 of cost of sales, in decimal arithmetic.
    await expect(gross).toHaveTextContent('$82,179.60');
    const net = canvas.getByRole('rowheader', { name: 'Net profit' }).closest('tr')!;
    await expect(net).toHaveTextContent('$20,469.35');
  },
};

/** In another locale and currency: the amounts are written the way the reader writes them. */
export const Localised: Story = {
  args: { locale: 'de-DE', currency: 'EUR', periods: ['Q1', 'Q2'] },
};

/** Dense rows for a side panel. */
export const Compact: Story = {
  args: { size: 'compact' },
};
