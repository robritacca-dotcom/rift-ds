import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
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
    const gripCell = canvasElement.querySelector<HTMLElement>('tbody tr[data-row="r1"] [data-col="ds-data-table-grip"]')!;
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
