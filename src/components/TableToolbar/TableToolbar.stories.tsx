import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fireEvent, userEvent, waitFor, within } from 'storybook/test';
import { TableToolbar } from './TableToolbar';
import { DataTable, reconcileDataTableView, type DataTableColumn, type DataTableRow } from '../DataTable/DataTable';
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
  { key: 'status', header: 'Status', sortable: true, options: options(['Open', 'Blocked', 'Done']) },
  { key: 'points', header: 'Points', sortable: true, align: 'end' },
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
    await expect(canvas.getByRole('button', { name: 'Status · Open' })).toBeInTheDocument();

    await userEvent.click(canvas.getByRole('button', { name: 'Remove filter Status · Open' }));
    await waitFor(() => expect(names()).toHaveLength(4));

    await userEvent.type(canvas.getByRole('textbox', { name: 'Search' }), 'chart');
    await waitFor(() => expect(names()).toEqual(['Chart palette drifts']));
    await userEvent.clear(canvas.getByRole('textbox', { name: 'Search' }));

    await userEvent.click(canvas.getByRole('tab', { name: 'Compact' }));
    await waitFor(() => expect(canvasElement.querySelector('table')).toHaveClass('ds-table--compact'));
  },
};

/** The Columns panel hides and shows columns; the row header stays. */
export const ColumnsPanel: Story = {
  render: () => <DataTable columns={columns} rows={rows} caption="Issues" toolbar={<TableToolbar />} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Columns' }));
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

/** The Columns panel's columns move: Alt+Down on a column's grip moves it one place, and the table follows. */
export const ReorderColumns: Story = {
  render: () => <DataTable columns={columns} rows={rows} caption="Issues" toolbar={<TableToolbar />} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const headers = () =>
      [...canvasElement.querySelectorAll<HTMLElement>('thead th[data-col]')].map((cell) => cell.dataset.col);
    await expect(headers().slice(0, 2)).toEqual(['title', 'status']);
    await userEvent.click(canvas.getByRole('button', { name: 'Columns' }));
    const grip = await within(document.body).findByRole('button', { name: 'Move Status' });
    grip.focus();
    await userEvent.keyboard('{Alt>}{ArrowDown}{/Alt}');
    await waitFor(() => expect(headers().slice(0, 3)).toEqual(['title', 'points', 'status']));
    await userEvent.keyboard('{Escape}');
  },
};

/**
 * With row checkboxes, selecting a row turns the bar into the bulk bar at
 * the same height: Clear, the count, Select all N, then every action in
 * full while there is room, the destructive ones last, and a More menu for
 * what does not fit.
 */
export const BulkBar: Story = {
  render: () => {
    const Demo = () => {
      const [ran, setRan] = useState('');
      return (
        <>
          <DataTable
            columns={columns}
            rows={rows}
            selectable
            pageSize={2}
            caption="Issues"
            toolbar={
              <TableToolbar
                bulkActions={[
                  {
                    id: 'archive',
                    label: 'Archive',
                    icon: 'archive',
                    onSelect: (selection) =>
                      setRan(`archive ${selection.ids.length}${selection.allMatching ? ' all' : ''}`),
                  },
                  { id: 'assign', label: 'Assign', icon: 'person_add', onSelect: () => setRan('assign') },
                  {
                    id: 'delete',
                    label: 'Delete',
                    icon: 'delete',
                    destructive: true,
                    onSelect: (selection) => setRan(`delete ${selection.ids.length}`),
                  },
                ]}
              />
            }
          />
          <output data-testid="ran">{ran}</output>
        </>
      );
    };
    return <Demo />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const bar = () => canvasElement.querySelector<HTMLElement>('.ds-table-toolbar')!;
    const height = bar().getBoundingClientRect().height;
    await userEvent.click(canvas.getByRole('checkbox', { name: 'Select Composer loses focus' }));
    const bulk = await canvas.findByRole('group', { name: '1 selected' });
    // The same height, so nothing below moves.
    await expect(bar().getBoundingClientRect().height).toBe(height);
    // The footer leaves the selection count to the bar.
    await expect(canvasElement.querySelector('.ds-data-table__count')).toHaveTextContent('4 results');
    const inBar = within(bulk);
    await expect(inBar.getByRole('button', { name: 'Archive' })).toBeInTheDocument();
    await expect(inBar.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
    // With room for every action, nothing folds.
    await expect(inBar.getByRole('button', { name: 'Assign' })).toBeInTheDocument();
    await expect(inBar.queryByRole('button', { name: 'More actions' })).not.toBeInTheDocument();

    // Select all N reaches past the page.
    await userEvent.click(inBar.getByRole('button', { name: 'Select all 4' }));
    await expect(await inBar.findByText('All 4 selected')).toBeInTheDocument();
    await userEvent.click(inBar.getByRole('button', { name: 'Archive' }));
    await expect(canvas.getByTestId('ran')).toHaveTextContent('archive 4 all');

    await userEvent.click(inBar.getByRole('button', { name: 'Assign' }));
    await expect(canvas.getByTestId('ran')).toHaveTextContent('assign');

    // Clear returns the bar, and focus to its search.
    await userEvent.click(inBar.getByRole('button', { name: 'Clear selection' }));
    await waitFor(() => expect(canvas.queryByRole('group', { name: /selected/ })).not.toBeInTheDocument());
    await waitFor(() => expect(canvas.getByRole('textbox', { name: 'Search' })).toHaveFocus());
  },
};

/** With `multiSort`, Shift-click adds a header to the sort, and the Sort panel orders, flips and removes the sorts. */
export const MultiSort: Story = {
  render: () => (
    <DataTable
      columns={columns}
      rows={rows}
      multiSort
      caption="Issues"
      defaultSorts={[{ key: 'status', direction: 'asc' }]}
      toolbar={<TableToolbar />}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const names = () => canvas.getAllByRole('rowheader').map((cell) => cell.textContent);
    // Status ascending, then the table's own order.
    await expect(names()).toEqual([
      'Chart palette drifts',
      'Toast stacks past inset',
      'Composer loses focus',
      'Badge miscounts drafts',
    ]);
    fireEvent.click(canvas.getByRole('button', { name: 'Points' }), { shiftKey: true });
    // The open issues now tie-break on points.
    await waitFor(() => expect(names().slice(2)).toEqual(['Badge miscounts drafts', 'Composer loses focus']));
    await expect(canvas.getByRole('button', { name: 'Points, sort 2, ascending' })).toBeInTheDocument();
    await expect(canvas.getByRole('columnheader', { name: /Status/ })).toHaveAttribute('aria-sort', 'ascending');

    await userEvent.click(canvas.getByRole('button', { name: 'Sort, 2 on' }));
    const body = within(document.body);
    const grip = await body.findByRole('button', { name: 'Move sort by Points' });
    grip.focus();
    await userEvent.keyboard('{Alt>}{ArrowUp}{/Alt}');
    // Points first: lowest points lead.
    await waitFor(() => expect(names()[0]).toBe('Badge miscounts drafts'));
    await userEvent.click(body.getByRole('button', { name: 'Clear sorts' }));
    await waitFor(() => expect(names()[0]).toBe('Composer loses focus'));
    await userEvent.keyboard('{Escape}');
  },
};

/** Saved views as tabs over the bar: picking one applies its setup, the active tab shows a dot once the table moves on, and its menu saves, saves as new, resets, renames and deletes. */
export const SavedViews: Story = {
  render: () => (
    <DataTable
      columns={columns}
      rows={rows}
      caption="Issues"
      toolbar={
        <TableToolbar
          defaultViews={[
            { id: 'all', label: 'All issues', view: { version: 1 } },
            {
              id: 'open',
              label: 'Open by points',
              view: {
                version: 1,
                filters: [{ id: 'status-1', column: 'status', operator: 'isAnyOf', value: ['Open'] }],
                sorts: [{ key: 'points', direction: 'desc' }],
              },
            },
          ]}
        />
      }
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const names = () => canvas.getAllByRole('rowheader').map((cell) => cell.textContent);
    await expect(names()).toHaveLength(4);
    await userEvent.click(canvas.getByRole('tab', { name: 'Open by points' }));
    await waitFor(() => expect(names()).toEqual(['Composer loses focus', 'Badge miscounts drafts']));
    await expect(canvas.getByRole('button', { name: 'Open by points options' })).toBeInTheDocument();
    // Moving on from the view marks it: a click takes the points sort off.
    await userEvent.click(canvas.getByRole('button', { name: 'Points' }));
    await expect(canvasElement.querySelector('.ds-table-toolbar__view-dot')).not.toBeNull();
    // Reset brings the saved setup back.
    await userEvent.click(await canvas.findByRole('button', { name: 'Open by points options, unsaved changes' }));
    await userEvent.click(await within(document.body).findByRole('menuitem', { name: 'Reset to saved' }));
    await waitFor(() => expect(canvasElement.querySelector('.ds-table-toolbar__view-dot')).toBeNull());
    // Save as new adds a tab and makes it active.
    await userEvent.click(canvas.getByRole('button', { name: 'New view' }));
    await expect(await canvas.findByRole('tab', { name: 'View 3' })).toHaveAttribute('aria-selected', 'true');
    // A stored view is repaired against the columns as they are now.
    const repaired = reconcileDataTableView(
      { version: 1, sorts: [{ key: 'gone', direction: 'asc' }], columnOrder: ['due', 'gone'] },
      columns,
    );
    await expect(repaired.sorts).toEqual([]);
    await expect(repaired.columnOrder).toEqual(['due', 'title', 'status', 'points']);
  },
};
