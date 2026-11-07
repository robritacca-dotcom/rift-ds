import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent } from 'storybook/test';
import { Widget, WidgetGrid, WidgetGroup, WidgetRow } from './Widget';
import { Button } from '../Button/Button';
import { Input } from '../Input/Input';
import { ToggleSwitch } from '../ToggleSwitch/ToggleSwitch';
import { DescriptionList } from '../DescriptionList/DescriptionList';
import { Table } from '../Table/Table';
import { PixelAvatar } from '../PixelAvatar/PixelAvatar';
import { Sparkline } from '../Sparkline/Sparkline';
import { Spinner } from '../Spinner/Spinner';
import { StatusDot } from '../StatusDot/StatusDot';

const meta = {
  title: 'Components/Widget',
  component: Widget,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    count: { control: 'number' },
    titleAs: {
      control: 'select',
      options: ['h2', 'h3', 'h4'],
    },
  },
  args: {
    title: 'Invoices',
    count: 3,
  },
  /* One tile reads best at a tile's width; the board story widens the frame
     through this parameter, since a story decorator nests inside this one
     and could only ever make it narrower. */
  decorators: [
    (Story, context) => (
      <div style={{ maxWidth: (context.parameters.frameWidth as string) ?? '420px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Widget>;

export default meta;
type Story = StoryObj<typeof meta>;

const invoices = (
  <>
    <WidgetRow title="Northwind Trading" description="Due Oct 14" meta="$12,400" />
    <WidgetRow title="Juniper Health" description="12 days late" meta="$8,950" />
    <WidgetRow title="Oakline Retail" description="Due Oct 28" meta="$21,700" />
  </>
);

export const Default: Story = {
  args: { children: invoices },
};

/** Rows become buttons or links only where there is somewhere to go. */
export const InteractiveRows: Story = {
  args: {
    title: 'Recent accounts',
    count: undefined,
    children: (
      <>
        <WidgetRow
          leading={<PixelAvatar name="Harbor & Vine" />}
          title="Harbor & Vine"
          description="Renewal call notes"
          meta="now"
          onClick={() => {}}
        />
        <WidgetRow
          leading={<PixelAvatar name="Juniper Health" />}
          title="Juniper Health"
          description="Payment reminder sent"
          meta="12m"
          onClick={() => {}}
        />
        <WidgetRow
          leading={<PixelAvatar name="Tidewater Supply" />}
          title="Tidewater Supply"
          description="Contract signed"
          meta="2h"
          href="#"
        />
      </>
    ),
  },
};

/** Groups split a tile's rows into labelled runs. */
export const Grouped: Story = {
  args: {
    title: 'Approvals',
    count: 4,
    children: (
      <>
        <WidgetGroup label="Waiting on you">
          <WidgetRow
            leading={<StatusDot variant="warning" size="sm" aria-hidden="true" />}
            title="Travel expenses, Q3 offsite"
            description="Dana Whitfield"
            meta="Due today"
          />
          <WidgetRow
            leading={<StatusDot variant="info" size="sm" aria-hidden="true" />}
            title="Renewal terms for Harbor & Vine"
            description="Leo Castellanos"
            meta="New"
          />
        </WidgetGroup>
        <WidgetGroup label="Sent by you">
          <WidgetRow
            leading={<StatusDot variant="positive" size="sm" aria-hidden="true" />}
            title="Laptops for the new hires"
            description="Purchase order"
            meta="Approved"
          />
          <WidgetRow
            leading={<StatusDot variant="error" size="sm" aria-hidden="true" />}
            title="Payment to Atlas Freight"
            description="Bank transfer"
            meta="Failed"
          />
        </WidgetGroup>
      </>
    ),
  },
};

/** The body takes anything: here a figure over its trend. */
export const WithAFigure: Story = {
  args: {
    title: 'Revenue',
    count: undefined,
    action: (
      <span style={{ font: 'var(--font-caption-weight) var(--font-caption-size) var(--font-caption-family)', color: 'var(--color-text-tertiary)' }}>
        Last 14 days
      </span>
    ),
    children: (
      <>
        <span
          style={{
            fontFamily: 'var(--font-heading-2-family)',
            fontSize: 'var(--font-heading-2-size)',
            fontWeight: 'var(--font-heading-2-weight)',
            lineHeight: 'var(--font-heading-2-line-height)',
            color: 'var(--color-text-primary)',
          }}
        >
          $189k
        </span>
        <Sparkline
          data={[11, 14, 12, 18, 16, 3, 2, 13, 21, 24, 19, 17, 4, 15]}
          variant="area"
          width={360}
          height={72}
          label="Revenue per day, trending up"
          style={{ width: '100%', height: 'auto' }}
        />
      </>
    ),
  },
};

/** A board: tiles of different heights pack into columns and fold as it narrows. */
export const Board: Story = {
  parameters: { frameWidth: '880px' },
  render: () => (
    <WidgetGrid>
      <Widget title="Working now" count={1}>
        <WidgetRow
          leading={<Spinner size="sm" />}
          title="Reconciling September’s books"
          description="212 of 340 transactions matched"
          meta="2m 13s"
        />
      </Widget>
      <Widget title="Invoices" count={3}>
        {invoices}
      </Widget>
      <Widget title="This month">
        <WidgetRow title="Revenue" meta="$412,300" />
        <WidgetRow title="Gross margin" meta="61%" />
        <WidgetRow title="New customers" meta="18" />
      </Widget>
      <Widget title="Automations" count={2}>
        <WidgetRow
          leading={<StatusDot variant="positive" size="sm" aria-hidden="true" />}
          title="Weekly revenue digest"
          description="Mondays, 8am"
          meta="On"
        />
        <WidgetRow
          leading={<StatusDot variant="neutral" size="sm" aria-hidden="true" />}
          title="Month-end close checklist"
          description="Last working day"
          meta="Paused"
        />
      </Widget>
    </WidgetGrid>
  ),
};

/** A form section: a description under the title, the fields, and the section's actions in the footer. */
export const FormSection: Story = {
  args: {
    title: 'Business details',
    count: undefined,
    description: 'Shown on invoices and receipts.',
    footer: (
      <>
        <Button variant="tertiary" size="compact" label="Cancel" />
        <Button variant="primary" size="compact" label="Save" />
      </>
    ),
    children: (
      <div style={{ display: 'grid', gap: 'var(--gap-300)' }}>
        <Input label="Legal name" defaultValue="Northwind Supply Ltd" />
        <Input label="Tax ID" defaultValue="GB 123 4567 89" />
      </div>
    ),
  },
};

/** A settings group at the compact inset, folded away by its title. */
export const SettingsGroup: Story = {
  args: {
    title: 'Notifications',
    count: undefined,
    padding: 'compact',
    collapsible: true,
    description: 'Choose what we email you about.',
    children: (
      <div style={{ display: 'grid', gap: 'var(--gap-200)' }}>
        <ToggleSwitch label="Payment received" defaultChecked />
        <ToggleSwitch label="Payout sent" defaultChecked />
        <ToggleSwitch label="Weekly summary" defaultChecked={false} />
      </div>
    ),
  },
  play: async ({ canvas }) => {
    const toggle = canvas.getByRole('button', { name: 'Notifications' });
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await userEvent.click(toggle);
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(canvas.queryByRole('switch', { name: 'Payment received' })).toBeNull();
    await userEvent.click(toggle);
    await expect(canvas.getByRole('switch', { name: 'Payment received' })).toBeVisible();
  },
};

/** A review summary: the facts as a description list, an Edit action, and the total in the footer. */
export const ReviewSummary: Story = {
  args: {
    title: 'Order summary',
    count: undefined,
    action: <Button variant="tertiary" size="compact" label="Edit" />,
    footer: <span>Total $1,284.00</span>,
    children: (
      <DescriptionList
        layout="inline"
        size="compact"
        termWidth="wide"
        align="end"
        items={[
          { term: 'Standing desk', details: '$899.00' },
          { term: 'Monitor arm', details: '$185.00' },
          { term: 'Delivery', details: '$200.00' },
        ]}
      />
    ),
  },
};

/** A body that runs edge to edge, a table here, while the header and footer keep the tile's inset. */
export const EdgeToEdge: Story = {
  args: {
    title: 'Recent payouts',
    count: undefined,
    padding: 'none',
    footer: <Button variant="tertiary" size="compact" label="View all" />,
    children: (
      <Table
        size="compact"
        caption="Recent payouts"
        captionHidden
        columns={[
          { key: 'date', header: 'Date' },
          { key: 'amount', header: 'Amount', align: 'end' },
        ]}
        rows={[
          { id: 'a', cells: { date: '4 Nov', amount: '$2,410.00' } },
          { id: 'b', cells: { date: '28 Oct', amount: '$1,982.50' } },
          { id: 'c', cells: { date: '21 Oct', amount: '$2,105.75' } },
        ]}
      />
    ),
  },
};

/** Starts folded: `defaultOpen` false. */
export const CollapsedByDefault: Story = {
  args: { collapsible: true, defaultOpen: false, children: invoices },
};
