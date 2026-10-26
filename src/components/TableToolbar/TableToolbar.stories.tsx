import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { TableToolbar } from './TableToolbar';
import { DataTable, type DataTableColumn, type DataTableRow } from '../DataTable/DataTable';
import { Button } from '../Button/Button';

const meta = {
  title: 'Components/TableToolbar',
  component: TableToolbar,
  tags: ['autodocs'],
} satisfies Meta<typeof TableToolbar>;

export default meta;
type Story = StoryObj<typeof meta>;

const options = (values: string[]) => values.map((value) => ({ value, label: value }));

const columns: DataTableColumn[] = [
  { key: 'title', header: 'Issue', rowHeader: true, sortable: true },
  { key: 'status', header: 'Status', options: options(['Open', 'Blocked', 'Done']) },
  { key: 'points', header: 'Points', align: 'right' },
  { key: 'due', header: 'Due' },
];

const rows: DataTableRow[] = [
  { id: 'i1', values: { title: 'Composer loses focus', status: 'Open', points: 3, due: '2026-11-04' } },
  { id: 'i2', values: { title: 'Chart palette drifts', status: 'Blocked', points: 5, due: '2026-11-12' } },
  { id: 'i3', values: { title: 'Badge miscounts drafts', status: 'Open', points: 1, due: '2026-11-02' } },
  { id: 'i4', values: { title: 'Toast stacks past inset', status: 'Done', points: 2, due: '2026-10-28' } },
];

/** On its own, over some other table: the columns it knows about, and its state as props. */
export const Default: Story = {
  args: {
    columns: [
      { key: 'title', label: 'Issue' },
      { key: 'status', label: 'Status', options: options(['Open', 'Blocked', 'Done']) },
    ],
    defaultFilters: [{ id: 'status-1', column: 'status', operator: 'isAnyOf', value: ['Open'] }],
    count: { shown: 2, total: 4 },
    actions: <Button variant="secondary" size="compact" iconLeft="download" label="Export" />,
  },
};

/** The page's actions at the bar's end: secondaries as icon buttons named by their labels, then the one labelled primary. */
export const Actions: Story = {
  render: () => (
    <DataTable
      columns={columns}
      rows={rows}
      selectable
      caption="Issues"
      toolbar={
        <TableToolbar
          secondaryActions={[
            { id: 'import', label: 'Import', icon: 'upload', onSelect: () => {} },
            { id: 'export', label: 'Export', icon: 'download', onSelect: () => {} },
          ]}
          primaryAction={{ id: 'new', label: 'New issue', icon: 'add', onSelect: () => {} }}
        />
      }
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: 'Export' })).not.toHaveTextContent('Export');
    await expect(canvas.getByRole('button', { name: 'New issue' })).toHaveTextContent('New issue');
  },
};

/** Inside a DataTable it needs no props: search, chips, columns and density all drive the table. */
export const InDataTable: Story = {
  render: () => (
    <DataTable
      columns={columns}
      rows={rows}
      columnMenu
      pageSize={10}
      selectable
      caption="Issues"
      defaultFilters={[{ id: 'status-1', column: 'status', operator: 'isAnyOf', value: ['Open'] }]}
      toolbar={<TableToolbar />}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const names = () => canvas.getAllByRole('rowheader').map((cell) => cell.textContent);
    await expect(names()).toEqual(['Composer loses focus', 'Badge miscounts drafts']);
    // Inside a table the count is the footer's.
    await expect(canvasElement.querySelector('.ds-data-table__count')).toHaveTextContent('2 results');
    await expect(canvas.getByRole('button', { name: 'Edit' })).toBeDisabled();
    await expect(canvas.getByRole('button', { name: 'Status · Open' })).toBeInTheDocument();

    await userEvent.click(canvas.getByRole('button', { name: 'Remove filter Status · Open' }));
    await waitFor(() => expect(names()).toHaveLength(4));

    await userEvent.type(canvas.getByRole('textbox', { name: 'Search' }), 'chart');
    await waitFor(() => expect(names()).toEqual(['Chart palette drifts']));
    await userEvent.clear(canvas.getByRole('textbox', { name: 'Search' }));

    await userEvent.click(canvas.getByRole('button', { name: 'More' }));
    await userEvent.click(await within(document.body).findByRole('tab', { name: 'Compact' }));
    await waitFor(() => expect(canvasElement.querySelector('table')).toHaveClass('ds-table--compact'));
  },
};

/** The More panel's columns hide and show columns; the row header stays. */
export const ColumnsPanel: Story = {
  render: () => <DataTable columns={columns} rows={rows} caption="Issues" toolbar={<TableToolbar />} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'More' }));
    const body = within(document.body);
    await userEvent.click(await body.findByRole('switch', { name: 'Due' }));
    await waitFor(() => expect(canvas.queryByRole('columnheader', { name: 'Due' })).not.toBeInTheDocument());
    await userEvent.keyboard('{Escape}');
  },
};

/** A header's Filter… and the bar's chips are one list: a filter set from the header shows as a chip. */
export const HeaderFilters: Story = {
  render: () => (
    <DataTable
      columns={columns}
      rows={rows}
      columnMenu
      caption="Issues"
      defaultFilters={[{ id: 'points-1', column: 'points', operator: 'gt', value: 2 }]}
      toolbar={<TableToolbar />}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: 'Points · > · 2' })).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: 'Points is filtered' })).toBeInTheDocument();
    await expect(canvas.getAllByRole('rowheader').map((cell) => cell.textContent)).toEqual([
      'Composer loses focus',
      'Chart palette drifts',
    ]);
  },
};

/** The More panel's columns move: Alt+Down on a column's grip moves it one place, and the table follows. */
export const ReorderColumns: Story = {
  render: () => <DataTable columns={columns} rows={rows} caption="Issues" toolbar={<TableToolbar />} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const headers = () =>
      [...canvasElement.querySelectorAll<HTMLElement>('thead th[data-col]')].map((cell) => cell.dataset.col);
    await expect(headers().slice(0, 2)).toEqual(['title', 'status']);
    await userEvent.click(canvas.getByRole('button', { name: 'More' }));
    const grip = await within(document.body).findByRole('button', { name: 'Move Status' });
    grip.focus();
    await userEvent.keyboard('{Alt>}{ArrowDown}{/Alt}');
    await waitFor(() => expect(headers().slice(0, 3)).toEqual(['title', 'points', 'status']));
    await userEvent.keyboard('{Escape}');
  },
};

/** With row checkboxes, Edit leads the bar: disabled until a row is selected, then counting them. */
export const BulkEdit: Story = {
  render: () => (
    <DataTable
      columns={columns}
      rows={rows}
      selectable
      caption="Issues"
      toolbar={<TableToolbar bulkActions={[{ id: 'archive', label: 'Archive', icon: 'archive', onSelect: () => {} }]} />}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: 'Edit' })).toBeDisabled();
    await userEvent.click(canvas.getByRole('checkbox', { name: 'Select Composer loses focus' }));
    const bulk = await canvas.findByRole('button', { name: 'Edit (1)' });
    await expect(bulk).toBeEnabled();
    await userEvent.click(bulk);
    await expect(await within(document.body).findByRole('menuitem', { name: 'Archive' })).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
  },
};
