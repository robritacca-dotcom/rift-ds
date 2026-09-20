import type { Meta, StoryObj } from '@storybook/react-vite';
import { DataTable, type DataTableColumn, type DataTableRow } from './DataTable';
import { Badge } from '../Badge/Badge';

const statusVariant = {
  Shipped: 'positive',
  Waiting: 'warning',
  Failed: 'error',
} as const;

const columns: DataTableColumn[] = [
  { key: 'name', header: 'Customer', sortable: true },
  {
    key: 'status',
    header: 'Status',
    sortable: true,
    render: (row) => (
      <Badge
        variant={statusVariant[row.values.status as keyof typeof statusVariant] ?? 'neutral'}
        label={String(row.values.status)}
      />
    ),
  },
  { key: 'updated', header: 'Last updated', sortable: true },
  { key: 'price', header: 'Price', sortable: true, align: 'right' },
];

const rows: DataTableRow[] = [
  { id: 'r1', values: { name: 'John Clarkson', status: 'Waiting', updated: '2026-09-05', price: 3412 } },
  { id: 'r2', values: { name: 'Aspen Lubin', status: 'Failed', updated: '2026-03-25', price: 1899 } },
  { id: 'r3', values: { name: 'Michael Ekstrom', status: 'Shipped', updated: '2026-08-01', price: 2752 } },
  { id: 'r4', values: { name: 'Kianna Vaccaro', status: 'Shipped', updated: '2026-04-02', price: 145 } },
  { id: 'r5', values: { name: 'Livia Saris', status: 'Failed', updated: '2026-11-14', price: 708 } },
  { id: 'r6', values: { name: 'Jaydon Aminoff', status: 'Waiting', updated: '2026-07-17', price: 224 } },
  { id: 'r7', values: { name: 'Maria Lubin', status: 'Shipped', updated: '2026-11-15', price: 2959 } },
  { id: 'r8', values: { name: 'Ann Press', status: 'Waiting', updated: '2026-09-20', price: 2646 } },
  { id: 'r9', values: { name: 'Zaire Torff', status: 'Shipped', updated: '2026-02-04', price: 3770 } },
  { id: 'r10', values: { name: 'Omar Vetrovs', status: 'Failed', updated: '2026-07-10', price: 1747 } },
];

const meta = {
  title: 'Components/DataTable',
  component: DataTable,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['default', 'compact'],
    },
    striped: { control: 'boolean' },
    selectable: { control: 'boolean' },
    searchable: { control: 'boolean' },
  },
  args: {
    columns,
    rows,
    caption: 'Customers',
  },
} satisfies Meta<typeof DataTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const FullyWired: Story = {
  args: {
    searchable: true,
    selectable: true,
    pageSize: 5,
    defaultSort: { key: 'name', direction: 'asc' },
  },
};

export const Paginated: Story = {
  args: {
    pageSize: 4,
  },
};

export const Selectable: Story = {
  args: {
    selectable: true,
    defaultSelectedIds: ['r1', 'r3'],
  },
};

export const Searchable: Story = {
  args: {
    searchable: true,
  },
};

export const EmptyResult: Story = {
  args: {
    rows: [],
    searchable: true,
  },
};

export const Compact: Story = {
  args: {
    size: 'compact',
    striped: true,
    pageSize: 5,
  },
};
