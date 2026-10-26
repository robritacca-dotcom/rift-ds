import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { DataTable, type DataTableColumn, type DataTableProps, type DataTableRow } from './DataTable';
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('No matching rows')).toBeInTheDocument();
    await expect(canvas.getByText('Adjust the search or filters and try again.')).toBeInTheDocument();
  },
};

export const Compact: Story = {
  args: {
    size: 'compact',
    striped: true,
    pageSize: 5,
  },
};

/** The built-in pager at its English defaults: numbered pages at the default size. */
export const DefaultCopy: Story = {
  args: {
    pageSize: 4,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const pager = canvas.getByRole('navigation', { name: 'Pagination' });
    await expect(within(pager).getByRole('button', { name: 'Previous page' })).toBeDisabled();
    await expect(within(pager).getByRole('button', { name: 'Next page' })).toBeEnabled();
    await expect(within(pager).getByRole('button', { name: 'Page 1' })).toHaveAttribute('aria-current', 'page');
  },
};

/** A compact table takes the compact pager, whose readout replaces the numbers. */
export const CompactCopy: Story = {
  args: {
    pageSize: 4,
    size: 'compact',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const pager = canvas.getByRole('navigation', { name: 'Pagination' });
    await expect(within(pager).getByText('Page 1 of 3')).toBeInTheDocument();
  },
};

/** The pager localised through `paginationLabels`: here in Spanish. */
export const LocalisedCopy: Story = {
  args: {
    pageSize: 4,
    paginationLabels: {
      'aria-label': 'Paginación',
      previousLabel: 'Página anterior',
      nextLabel: 'Página siguiente',
      pageLabel: (page: number) => `Página ${page}`,
      readoutLabel: (page: number, pageCount: number) => `Página ${page} de ${pageCount}`,
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const pager = canvas.getByRole('navigation', { name: 'Paginación' });
    await expect(within(pager).getByRole('button', { name: 'Página anterior' })).toBeDisabled();
    await expect(within(pager).getByRole('button', { name: 'Página siguiente' })).toBeEnabled();
    await expect(within(pager).getByRole('button', { name: 'Página 1' })).toHaveAttribute('aria-current', 'page');
  },
};

/** The empty state's words localised through `emptyStateLabels`; EmptyResult checks the English defaults. */
export const LocalisedEmptyResult: Story = {
  args: {
    rows: [],
    searchable: true,
    emptyStateLabels: {
      title: 'Ninguna fila coincide',
      description: 'Ajusta la búsqueda o los filtros y vuelve a intentarlo.',
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Ninguna fila coincide')).toBeInTheDocument();
    await expect(canvas.getByText('Ajusta la búsqueda o los filtros y vuelve a intentarlo.')).toBeInTheDocument();
  },
};

/**
 * What a screen reader hears: the sorted header carries `aria-sort` and its
 * button is named by the header alone, the row header names each row and
 * its checkbox, and a sort, a page change and select-all are announced
 * through one polite region.
 */
export const Announcements: Story = {
  args: {
    columns: columns.map((col) => (col.key === 'name' ? { ...col, rowHeader: true } : col)),
    pageSize: 4,
    selectable: true,
    caption: 'Orders',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const live = canvasElement.querySelector('[aria-live="polite"]') as HTMLElement;
    await expect(live).toBeEmptyDOMElement();

    const sortButton = canvas.getByRole('button', { name: 'Customer' });
    await userEvent.click(sortButton);
    await expect(sortButton.closest('th')).toHaveAttribute('aria-sort', 'ascending');
    await expect(live).toHaveTextContent('Sorted by Customer, ascending');
    await expect(sortButton).toHaveFocus();
    await userEvent.click(sortButton);
    await userEvent.click(sortButton);
    await expect(sortButton.closest('th')).not.toHaveAttribute('aria-sort');
    await expect(live).toHaveTextContent('Sort cleared');

    // Each row is named by its row header, and so is its checkbox.
    await expect(canvas.getByRole('rowheader', { name: 'John Clarkson' })).toBeInTheDocument();
    await expect(canvas.getByRole('checkbox', { name: 'Select John Clarkson' })).toBeInTheDocument();

    await userEvent.click(canvas.getByRole('checkbox', { name: 'Select all rows on this page' }));
    await expect(live).toHaveTextContent('4 selected');

    await userEvent.click(canvas.getByRole('button', { name: 'Next page' }));
    await waitFor(() => expect(live).toHaveTextContent('Page 2 of 3, rows 5 to 8 of 10'));
  },
};

/**
 * The order and the matches the table has always produced, pinned so the
 * engine underneath can change without them moving: numbers sort
 * numerically, empty values sort first ascending and last descending, text
 * sorts naturally, and search reads every raw value on a row, displayed or
 * not.
 */
export const SortAndSearchParity: Story = {
  args: {
    columns: [
      { key: 'name', header: 'Customer', sortable: true, rowHeader: true },
      { key: 'price', header: 'Price', sortable: true, align: 'right' },
    ],
    rows: [
      { id: 'p1', values: { name: 'Item 10', price: 30, region: 'North' } },
      { id: 'p2', values: { name: 'Item 2', price: null, region: 'South' } },
      { id: 'p3', values: { name: 'Item 1', price: 4, region: 'North' } },
      { id: 'p4', values: { name: 'item 3', price: 200, region: 'East' } },
    ],
    searchable: true,
    caption: 'Parity',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const names = () => canvas.getAllByRole('rowheader').map((cell) => cell.textContent);
    await expect(names()).toEqual(['Item 10', 'Item 2', 'Item 1', 'item 3']);

    const price = canvas.getByRole('button', { name: 'Price' });
    await userEvent.click(price);
    await expect(names()).toEqual(['Item 2', 'Item 1', 'Item 10', 'item 3']);
    await userEvent.click(price);
    await expect(names()).toEqual(['item 3', 'Item 10', 'Item 1', 'Item 2']);
    await userEvent.click(price);
    await expect(names()).toEqual(['Item 10', 'Item 2', 'Item 1', 'item 3']);

    await userEvent.click(canvas.getByRole('button', { name: 'Customer' }));
    await expect(names()).toEqual(['Item 1', 'Item 2', 'item 3', 'Item 10']);

    // "north" matches the region, which no column shows.
    await userEvent.type(canvas.getByRole('textbox', { name: 'Search' }), 'north');
    await expect(names()).toEqual(['Item 1', 'Item 10']);
  },
};

const wideColumns: DataTableColumn[] = [
  { key: 'name', header: 'Customer', sortable: true, rowHeader: true, locked: true, pin: 'start', width: '180px' },
  { key: 'status', header: 'Status', sortable: true, width: '140px' },
  { key: 'updated', header: 'Last updated', sortable: true, width: '160px' },
  { key: 'price', header: 'Price', sortable: true, align: 'right', width: '120px' },
];

/**
 * Every column control on: drag a header's edge to resize (double-click to
 * fit), drag a header to move it, and open a header's menu to sort, pin,
 * move, fit, reset or hide. The Customer column is locked and pinned.
 * In grid mode the table is one Tab stop, with arrow keys between cells.
 */
export const ColumnControls: Story = {
  args: {
    columns: wideColumns,
    resizableColumns: true,
    reorderableColumns: true,
    columnMenu: true,
    caption: 'Orders',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('grid', { name: 'Orders' })).toBeInTheDocument();
    const headerOrder = () => canvas.getAllByRole('columnheader').map((th) => th.dataset.col);
    await expect(headerOrder()).toEqual(['name', 'status', 'updated', 'price']);

    // One Tab stop: the first body cell, then arrows move between cells.
    const cells = () => canvasElement.querySelectorAll<HTMLElement>('[data-col][tabindex="0"]');
    await expect(cells()).toHaveLength(1);
    cells()[0].focus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(document.activeElement).toHaveAttribute('data-col', 'status');
    await userEvent.keyboard('{ArrowUp}');
    await expect(document.activeElement?.tagName).toBe('TH');

    // Alt+Down opens the header menu; Move right moves the column and keeps focus on it.
    await userEvent.keyboard('{Alt>}{ArrowDown}{/Alt}');
    await userEvent.click(await within(document.body).findByRole('menuitem', { name: 'Move right' }));
    await waitFor(() => expect(headerOrder()).toEqual(['name', 'updated', 'status', 'price']));
    await waitFor(() => expect(document.activeElement).toHaveAttribute('data-col', 'status'));

    // Ctrl+Shift+Left moves it back from the keyboard.
    await userEvent.keyboard('{Control>}{Shift>}{ArrowLeft}{/Shift}{/Control}');
    await waitFor(() => expect(headerOrder()).toEqual(['name', 'status', 'updated', 'price']));

    // Hide from the menu, and the locked column offers neither hide nor move.
    await userEvent.click(canvas.getByRole('button', { name: 'Price column options' }));
    await userEvent.click(await within(document.body).findByRole('menuitem', { name: 'Hide column' }));
    await waitFor(() => expect(headerOrder()).toEqual(['name', 'status', 'updated']));
    await userEvent.click(canvas.getByRole('button', { name: 'Customer column options' }));
    await expect(within(document.body).queryByRole('menuitem', { name: 'Hide column' })).toBeNull();
    await expect(within(document.body).queryByRole('menuitem', { name: 'Move right' })).toBeNull();
    await userEvent.keyboard('{Escape}');

    // The pinned column sticks, with its edge marked.
    const pinned = canvasElement.querySelector('thead [data-col="name"]');
    await expect(pinned).toHaveClass('ds-data-table__cell--pinned-start');
    await expect(pinned).toHaveClass('ds-data-table__cell--pinned-edge');
  },
};

/** Drag a row's grip up or down, or press Alt+Up and Alt+Down on it. While a sort is active the grip is off, since the sort owns the order. */
export const RowReorder: Story = {
  args: {
    columns: columns.map((col) => (col.key === 'name' ? { ...col, rowHeader: true } : col)),
    rows: rows.slice(0, 5),
    reorderableRows: true,
    caption: 'Queue',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const names = () => canvas.getAllByRole('rowheader').map((cell) => cell.textContent);
    await expect(names()).toEqual(['John Clarkson', 'Aspen Lubin', 'Michael Ekstrom', 'Kianna Vaccaro', 'Livia Saris']);
    const gripCell = canvasElement.querySelector<HTMLElement>(
      'tbody tr[data-row="r1"] [data-col="ds-data-table-grip"]',
    )!;
    gripCell.focus();
    await userEvent.keyboard('{Alt>}{ArrowDown}{/Alt}');
    await waitFor(() =>
      expect(names()).toEqual(['Aspen Lubin', 'John Clarkson', 'Michael Ekstrom', 'Kianna Vaccaro', 'Livia Saris']),
    );
    const live = canvasElement.querySelector('[aria-live="polite"]') as HTMLElement;
    await waitFor(() => expect(live).toHaveTextContent('John Clarkson moved to row 2 of 5'));
    await expect(canvas.getByRole('button', { name: 'Move John Clarkson' })).toBeInTheDocument();
  },
};

/** Row actions: edit inline, the rest in a More menu, in a column that sticks to the end edge. */
export const RowActions: Story = {
  args: {
    columns: columns.map((col) => (col.key === 'name' ? { ...col, rowHeader: true } : col)),
    rows: rows.slice(0, 4),
    rowActions: () => [
      { id: 'edit', label: 'Edit', icon: 'edit', inline: true, onSelect: () => {} },
      { id: 'duplicate', label: 'Duplicate', icon: 'content_copy', onSelect: () => {} },
      { id: 'delete', label: 'Delete', icon: 'delete', destructive: true, onSelect: () => {} },
    ],
    rowActionsVisibility: 'always',
    caption: 'Orders',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole('button', { name: 'Edit' })).toHaveLength(4);
    await userEvent.click(canvas.getByRole('button', { name: 'More actions for John Clarkson' }));
    await expect(await within(document.body).findByRole('menuitem', { name: 'Delete' })).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
  },
};

/** The header holds while the body scrolls inside the table's own frame. */
export const StickyHeader: Story = {
  args: {
    stickyHeader: true,
    maxHeight: 220,
    caption: 'Orders',
  },
};

/** Every way cell text can fit: wrap (the table's default), one line, truncated with the full text on hover, and two lines. */
export const CellText: Story = {
  args: {
    columns: [
      { key: 'note', header: 'Wrap', width: '200px' },
      { key: 'one', header: 'One line', width: '160px', cellText: 'nowrap' },
      { key: 'trunc', header: 'Truncate', width: '160px', cellText: 'truncate' },
      { key: 'two', header: 'Two lines', width: '200px', cellText: 'lines-2' },
    ],
    rows: [1, 2, 3].map((n) => {
      const text = `Delivery window moved twice after the carrier changed the route ${n}`;
      return { id: `t${n}`, values: { note: text, one: text, trunc: text, two: text } };
    }),
    resizableColumns: true,
    caption: 'Cell text',
  },
  play: async ({ canvasElement }) => {
    const truncated = canvasElement.querySelector('.ds-data-table__text--truncate');
    await expect(truncated).toHaveAttribute('title', expect.stringContaining('Delivery window'));
  },
};

/* ---- Editing ---------------------------------------------------------- */

const editColumns: DataTableColumn[] = [
  {
    key: 'name',
    header: 'Customer',
    rowHeader: true,
    editor: 'text',
    validate: (value) => (String(value ?? '').trim() ? undefined : 'A customer needs a name'),
  },
  {
    key: 'status',
    header: 'Status',
    editor: 'select',
    options: [
      { value: 'Shipped', label: 'Shipped' },
      { value: 'Waiting', label: 'Waiting' },
      { value: 'Failed', label: 'Failed' },
    ],
  },
  { key: 'price', header: 'Price', align: 'right', editor: 'number' },
  { key: 'gift', header: 'Gift', align: 'center', editor: 'checkbox' },
];

/** The rows live in the host's state, as an app's would: the table only reports edits. */
function EditableTable(props: Partial<DataTableProps> & { failSaves?: boolean }) {
  const { failSaves, ...rest } = props;
  const [data, setData] = useState<DataTableRow[]>(
    rows.slice(0, 4).map((row) => ({ ...row, values: { ...row.values, gift: row.id === 'r2' } })),
  );
  const apply = (id: string, values: DataTableRow['values']) =>
    setData((current) =>
      current.map((row) => (row.id === id ? { ...row, values: { ...row.values, ...values } } : row)),
    );
  return (
    <DataTable
      columns={editColumns}
      rows={data}
      caption="Orders"
      onCellEdit={({ row, key, value }) =>
        failSaves ? Promise.reject(new Error('offline')) : apply(row.id, { [key]: value })
      }
      onRowEdit={({ row, values }) => apply(row.id, values)}
      {...rest}
    />
  );
}

const cell = (root: HTMLElement, row: string, col: string) =>
  root.querySelector<HTMLElement>(`tbody tr[data-row="${row}"] [data-col="${col}"]`)!;

/** Cell editing: Enter or F2 opens a cell, Enter saves and moves down, Escape cancels, a typed character starts a new value, and a checkbox saves as it toggles. */
export const CellEditing: Story = {
  render: () => <EditableTable />,
  play: async ({ canvasElement }) => {
    cell(canvasElement, 'r1', 'name').focus();
    await userEvent.keyboard('{Enter}');
    const field = await within(canvasElement).findByRole('textbox', { name: 'Customer, John Clarkson' });
    await expect(field).toHaveFocus();
    await userEvent.clear(field);
    await userEvent.type(field, 'John Clark{Enter}');
    await waitFor(() => expect(cell(canvasElement, 'r1', 'name')).toHaveTextContent('John Clark'));
    await expect(cell(canvasElement, 'r2', 'name')).toHaveFocus();

    await userEvent.keyboard('Z');
    const typed = await within(canvasElement).findByRole('textbox', { name: 'Customer, Aspen Lubin' });
    await expect(typed).toHaveValue('Z');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(cell(canvasElement, 'r2', 'name')).toHaveTextContent('Aspen Lubin'));
    await expect(cell(canvasElement, 'r2', 'name')).toHaveFocus();

    // The pencil shows on hover, and on focus, which is how a touch screen reaches it.
    cell(canvasElement, 'r3', 'name').focus();
    await userEvent.click(
      within(cell(canvasElement, 'r3', 'name')).getByRole('button', { name: 'Edit Customer, Michael Ekstrom' }),
    );
    await expect(
      await within(canvasElement).findByRole('textbox', { name: 'Customer, Michael Ekstrom' }),
    ).toHaveFocus();
    await userEvent.keyboard('{Escape}');

    const gift = within(cell(canvasElement, 'r1', 'gift')).getByRole('checkbox', { name: 'Gift, John Clark' });
    await expect(gift).toHaveAttribute('tabindex', '-1');
    await userEvent.click(gift);
    await waitFor(() => expect(gift).toHaveAttribute('aria-checked', 'true'));
  },
};

/** A value that fails its check keeps the editor open, with the message read out. */
export const EditValidation: Story = {
  render: () => <EditableTable />,
  play: async ({ canvasElement }) => {
    cell(canvasElement, 'r1', 'name').focus();
    await userEvent.keyboard('{F2}');
    const field = await within(canvasElement).findByRole('textbox', { name: 'Customer, John Clarkson' });
    await userEvent.clear(field);
    await userEvent.keyboard('{Enter}');
    await expect(await within(canvasElement).findByRole('alert')).toHaveTextContent('A customer needs a name');
    await expect(field).toHaveFocus();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(cell(canvasElement, 'r1', 'name')).toHaveTextContent('John Clarkson'));
  },
};

/** A save that fails rolls the value back, marks the cell and is announced at once. */
export const FailedSave: Story = {
  render: () => <EditableTable failSaves />,
  play: async ({ canvasElement }) => {
    cell(canvasElement, 'r1', 'price').focus();
    await userEvent.keyboard('9');
    await userEvent.keyboard('{Enter}');
    const target = cell(canvasElement, 'r1', 'price');
    await waitFor(() => expect(target).toHaveClass('ds-data-table__cell--failed'));
    await expect(target).toHaveTextContent('3412');
    const alert = canvasElement.querySelector('[aria-live="assertive"]') as HTMLElement;
    await expect(alert).toHaveTextContent('Price for John Clarkson was not saved.');
  },
};

/** Row editing: Edit opens every editable cell of a row at once, with Save and Cancel. */
export const RowEditing: Story = {
  render: () => <EditableTable editMode="row" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Edit Aspen Lubin' }));
    const field = await canvas.findByRole('textbox', { name: 'Customer, Aspen Lubin' });
    await expect(field).toHaveFocus();
    await expect(canvasElement.querySelectorAll('tr[data-row="r2"] .ds-data-table__editor')).toHaveLength(3);
    await userEvent.clear(field);
    await userEvent.type(field, 'Aspen Lu');
    await userEvent.click(canvas.getByRole('button', { name: 'Save Aspen Lubin' }));
    await waitFor(() => expect(cell(canvasElement, 'r2', 'name')).toHaveTextContent('Aspen Lu'));
    await expect(canvas.getByRole('button', { name: 'Edit Aspen Lu' })).toBeInTheDocument();
  },
};

const typedColumns: DataTableColumn[] = [
  { key: 'account', header: 'Account', type: 'text', rowHeader: true, sortable: true },
  {
    key: 'stage',
    header: 'Stage',
    type: 'status',
    sortable: true,
    options: [
      { value: 'lead', label: 'Lead', status: 'neutral' },
      { value: 'trial', label: 'Trial', status: 'info' },
      { value: 'won', label: 'Won', status: 'positive' },
    ],
  },
  { key: 'owner', header: 'Owner', type: 'person' },
  { key: 'value', header: 'Value', type: 'currency', sortable: true },
  { key: 'onboarded', header: 'Onboarded', type: 'progress' },
  { key: 'renews', header: 'Renews', type: 'date' },
  { key: 'tags', header: 'Tags', type: 'tags' },
  { key: 'billable', header: 'Billable', type: 'checkbox', sortable: true },
  { key: 'site', header: 'Site', type: 'link' },
];

const typedRows: DataTableRow[] = [
  {
    id: 't1',
    values: {
      account: 'Northwind',
      stage: 'won',
      owner: 'Priya Shah',
      value: 48000,
      onboarded: 80,
      renews: '2026-11-04',
      tags: ['enterprise', 'renewal', 'upsell'],
      billable: true,
      site: 'https://www.northwind.example/',
    },
  },
  {
    id: 't2',
    values: {
      account: 'Fabrikam',
      stage: 'lead',
      owner: 'Sam Rivera',
      value: 1200,
      onboarded: 0,
      renews: null,
      tags: [],
      billable: false,
      site: 'https://fabrikam.example',
    },
  },
  {
    id: 't3',
    values: {
      account: 'Contoso',
      stage: 'trial',
      owner: 'Jordan Lee',
      value: 9500,
      onboarded: 35,
      renews: '2027-02-01',
      tags: ['pilot'],
      billable: true,
      site: 'https://contoso.example/team',
    },
  },
];

/** Typed columns: each `type` draws, aligns and sorts its cells with no `render`, and an empty value draws nothing. */
export const ColumnTypes: Story = {
  args: { columns: typedColumns, rows: typedRows, caption: 'Accounts' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const names = () => canvas.getAllByRole('rowheader').map((cell) => cell.textContent);
    await expect(canvas.getByText('$48,000')).toBeInTheDocument();
    await expect(canvas.getByText('80%')).toBeInTheDocument();
    await expect(canvas.getByText('Nov 4, 2026')).toBeInTheDocument();
    await expect(canvas.getByRole('link', { name: 'northwind.example' })).toHaveAttribute(
      'href',
      'https://www.northwind.example/',
    );
    // Three tags fold to two and a count.
    await expect(canvas.getByText('+1')).toBeInTheDocument();
    // A status sorts in its options' order, not alphabetically.
    await userEvent.click(canvas.getByRole('button', { name: 'Stage' }));
    await waitFor(() => expect(names()).toEqual(['Fabrikam', 'Contoso', 'Northwind']));
    // A checkbox sorts the checked first.
    await userEvent.click(canvas.getByRole('button', { name: 'Billable' }));
    await waitFor(() => expect(names()[2]).toBe('Fabrikam'));
    // Figures sit at the end; the checkbox in the middle.
    const cell = (col: string) =>
      canvasElement.querySelector<HTMLElement>(`tbody [data-col="${col}"] .ds-table__cell-content`)!;
    await expect(cell('value').style.justifyContent).toBe('flex-end');
    await expect(cell('billable').style.justifyContent).toBe('center');
  },
};

/** The page and page size are a controlled or uncontrolled pair each; `pageSizeOptions` adds a Rows per page picker, and a new size starts over at page 1. */
export const PageSize: Story = {
  args: {
    columns: columns.map((col) => (col.key === 'name' ? { ...col, rowHeader: true } : col)),
    rows,
    defaultPageSize: 3,
    pageSizeOptions: [3, 5, 10],
    caption: 'Orders',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole('rowheader')).toHaveLength(3);
    await userEvent.click(canvas.getByRole('button', { name: /page 2/i }));
    await waitFor(() => expect(canvas.getAllByRole('rowheader')[0]).toHaveTextContent('Kianna Vaccaro'));
    await userEvent.click(canvas.getByRole('combobox', { name: 'Rows per page' }));
    await userEvent.click(await within(document.body).findByRole('option', { name: '5' }));
    await waitFor(() => expect(canvas.getAllByRole('rowheader')).toHaveLength(5));
    // A new size starts over at the first page.
    await expect(canvas.getAllByRole('rowheader')[0]).toHaveTextContent('John Clarkson');
  },
};

/** Narrower than a phone, `phoneLayout="stack"` draws each row as a card: the row header as its title, every other column as a label and value. */
export const PhoneStack: Story = {
  args: {
    columns: columns.map((col) => (col.key === 'name' ? { ...col, rowHeader: true } : col)),
    rows: rows.slice(0, 3),
    phoneLayout: 'stack',
    selectable: true,
    caption: 'Orders',
  },
  decorators: [
    (Story) => (
      <div style={{ width: 360 }}>
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(canvasElement.querySelector('.ds-data-table__grid--stacked')).not.toBeNull());
    // Still a table to a screen reader, with its row headers.
    await expect(canvas.getByRole('table')).toBeInTheDocument();
    await expect(canvas.getAllByRole('rowheader')).toHaveLength(3);
    // Each value carries its column's label.
    const firstRow = canvasElement.querySelector('tbody tr')!;
    await expect(firstRow.querySelector('.ds-data-table__stack-label')).toHaveTextContent('Status');
    await userEvent.click(canvas.getByRole('checkbox', { name: 'Select John Clarkson' }));
    await expect(firstRow).toHaveClass('ds-table__row--selected');
  },
};

/** Grouped by status: each group a body led by its group row (the value, the count, the column totals), folding on its chevron; `totalsRow` adds a footer whose cells each pick a calculation. */
export const Grouped: Story = {
  args: {
    columns: columns.map((col) =>
      col.key === 'name'
        ? { ...col, rowHeader: true }
        : col.key === 'status'
          ? { ...col, groupable: true }
          : col.key === 'price'
            ? { ...col, type: 'currency' as const, aggregate: 'sum' as const }
            : col,
    ),
    rows,
    selectable: true,
    columnMenu: true,
    totalsRow: true,
    defaultGrouping: ['status'],
    caption: 'Orders',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggles = () => canvas.getAllByRole('button', { name: /rows?, (expanded|collapsed)/ });
    // Three statuses, alphabetical: Failed, Shipped, Waiting.
    await expect(toggles().map((b) => b.getAttribute('aria-label'))).toEqual([
      'Failed, 3 rows, expanded',
      'Shipped, 4 rows, expanded',
      'Waiting, 3 rows, expanded',
    ]);
    // Each group sums its prices; the footer sums them all.
    await expect(canvas.getByText('$4,354')).toBeInTheDocument();
    await expect(canvasElement.querySelector('tfoot')).toHaveTextContent('Sum$20,262');
    // A chevron folds its group.
    await userEvent.click(toggles()[0]);
    // Seven of the ten rows remain (each group's own header cell reads as a row header too, so count the rows).
    await waitFor(() => expect(canvasElement.querySelectorAll('tbody tr[data-row]')).toHaveLength(7));
    await expect(toggles()[0]).toHaveAttribute('aria-expanded', 'false');
    // A group row's checkbox selects the group.
    await userEvent.click(canvas.getByRole('checkbox', { name: 'Select every row in Shipped' }));
    await expect(canvas.getByRole('checkbox', { name: 'Select Michael Ekstrom' })).toBeChecked();
  },
};

/** `renderDetail` adds a chevron per row; an opened row shows its details beneath it, across the table, rendered only once opened. */
export const RowDetails: Story = {
  args: {
    columns: columns.map((col) => (col.key === 'name' ? { ...col, rowHeader: true } : col)),
    rows: rows.slice(0, 4),
    renderDetail: (row: DataTableRow) => <p style={{ margin: 0 }}>Order for {String(row.values.name)}</p>,
    caption: 'Orders',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByText('Order for John Clarkson')).not.toBeInTheDocument();
    const toggle = canvas.getByRole('button', { name: 'Show details for John Clarkson' });
    await userEvent.click(toggle);
    await expect(await canvas.findByText('Order for John Clarkson')).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: 'Hide details for John Clarkson' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    // The details row spans every column.
    const cell = canvasElement.querySelector<HTMLTableCellElement>('.ds-data-table__detail-cell')!;
    await expect(cell.colSpan).toBe(canvasElement.querySelectorAll('thead th').length);
    await userEvent.click(canvas.getByRole('button', { name: 'Hide details for John Clarkson' }));
    await waitFor(() => expect(canvas.queryByText('Order for John Clarkson')).not.toBeInTheDocument());
  },
};

const manyRows: DataTableRow[] = Array.from({ length: 1000 }, (_, i) => ({
  id: `m${i + 1}`,
  values: { name: `Customer ${String(i + 1).padStart(4, '0')}`, status: 'Shipped', updated: '2026-09-01', price: i },
}));

/** A thousand rows: past 200 an unpaged table draws only the rows in view, inside its frame, and says how many rows there are. */
export const Virtualized: Story = {
  args: {
    columns: columns.map((col) => (col.key === 'name' ? { ...col, rowHeader: true } : col)),
    rows: manyRows,
    maxHeight: 320,
    caption: 'Customers',
  },
  play: async ({ canvasElement }) => {
    const table = canvasElement.querySelector('table')!;
    await expect(table).toHaveAttribute('aria-rowcount', '1001');
    const drawn = () => canvasElement.querySelectorAll('tbody tr[data-row]');
    await waitFor(() => expect(drawn().length).toBeGreaterThan(0));
    await expect(drawn().length).toBeLessThan(60);
    const frame = canvasElement.querySelector<HTMLElement>('.ds-data-table__frame')!;
    frame.scrollTop = frame.scrollHeight;
    await waitFor(() => expect(drawn()[drawn().length - 1]).toHaveAttribute('aria-rowindex', '1001'));
  },
};

/** With `hasMore`, a loading row ends the rows and asks for the next batch as it comes into view. */
export const InfiniteScroll: Story = {
  render: () => {
    const Demo = () => {
      const [count, setCount] = useState(20);
      return (
        <DataTable
          columns={columns.map((col) => (col.key === 'name' ? { ...col, rowHeader: true } : col))}
          rows={manyRows.slice(0, count)}
          maxHeight={240}
          hasMore={count < 60}
          onLoadMore={() => setCount((n) => n + 20)}
          caption="Customers"
        />
      );
    };
    return <Demo />;
  },
  play: async ({ canvasElement }) => {
    const frame = canvasElement.querySelector<HTMLElement>('.ds-data-table__frame')!;
    await expect(canvasElement.querySelectorAll('tbody tr[data-row]')).toHaveLength(20);
    frame.scrollTop = frame.scrollHeight;
    await waitFor(() => expect(canvasElement.querySelectorAll('tbody tr[data-row]')).toHaveLength(40));
    frame.scrollTop = frame.scrollHeight;
    await waitFor(() => expect(canvasElement.querySelectorAll('tbody tr[data-row]')).toHaveLength(60));
    // No more to load: the loading row is gone.
    await expect(canvasElement.querySelector('.ds-data-table__loading-row')).toBeNull();
  },
};
