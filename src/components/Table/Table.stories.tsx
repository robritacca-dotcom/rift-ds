import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor } from 'storybook/test';
import { Badge } from '../Badge/Badge';
import { Table } from './Table';
import { Button } from '../Button/Button';
import { IconButton } from '../IconButton/IconButton';
import { Input } from '../Input/Input';
import { Checkbox } from '../Checkbox/Checkbox';
import '../../fonts/material-symbols.css';

const meta = {
  title: 'Components/Table',
  component: Table,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['default', 'compact'],
    },
    striped: {
      control: 'boolean',
    },
    bordered: {
      control: 'boolean',
    },
    caption: {
      control: 'text',
    },
  },
  args: {
    size: 'default',
  },
  decorators: [
    (Story) => (
      <div style={{ width: '720px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

/* ============================================
   SHARED DATA
   ============================================ */

const textColumns = [
  { key: 'name', header: 'Name', width: '30%' },
  { key: 'role', header: 'Role', width: '30%' },
  { key: 'email', header: 'Email' },
];

const textRows = [
  { id: '1', cells: { name: 'Alice Chen', role: 'Designer', email: 'alice@example.com' } },
  { id: '2', cells: { name: 'Bob Rivera', role: 'Engineer', email: 'bob@example.com' } },
  { id: '3', cells: { name: 'Carol Osei', role: 'Product Manager', email: 'carol@example.com' } },
  { id: '4', cells: { name: 'Dan Petrov', role: 'Data Analyst', email: 'dan@example.com' } },
];

/* ============================================
   STORIES
   ============================================ */

// Default — text only, bordered
export const Default: Story = {
  args: {
    columns: textColumns,
    rows: textRows,
    bordered: true,
  },
};

// Compact
export const Compact: Story = {
  args: {
    columns: textColumns,
    rows: textRows,
    size: 'compact',
  },
};

// Striped
export const Striped: Story = {
  args: {
    columns: textColumns,
    rows: textRows,
    striped: true,
  },
};

// Bordered — outer border box + tinted thead + divider rows
export const Bordered: Story = {
  args: {
    columns: textColumns,
    rows: textRows,
    bordered: true,
  },
};

// A total row: the rows above add up to it, under a heavier rule
const totalRows = [
  { id: 'q1', cells: { name: 'Q1', role: 'Retainers', email: '$42,000' } },
  { id: 'q2', cells: { name: 'Q2', role: 'Retainers', email: '$45,500' } },
  { id: 'q3', cells: { name: 'Q3', role: 'Retainers', email: '$47,250' } },
  { id: 'sum', variant: 'total' as const, cells: { name: 'Total', role: '', email: '$134,750' } },
];

const totalRuleOf = (canvasElement: HTMLElement) => {
  const cell = canvasElement.querySelector<HTMLElement>('.ds-table__row--total .ds-table__cell');
  if (!cell) throw new Error('total row did not render');
  const style = getComputedStyle(cell);
  return `${style.borderTopStyle} ${parseFloat(style.borderTopWidth) > 0}`;
};

export const WithTotal: Story = {
  args: { columns: textColumns, rows: totalRows },
  play: async ({ canvasElement }) => {
    await expect(totalRuleOf(canvasElement)).toBe('solid true');
  },
};

export const WithTotalBordered: Story = {
  name: 'With total (bordered)',
  args: { columns: textColumns, rows: totalRows, bordered: true },
  play: async ({ canvasElement }) => {
    await expect(totalRuleOf(canvasElement)).toBe('solid true');
    // The row above gives up its hairline, so the two lines never stack.
    const above = canvasElement.querySelector<HTMLElement>('[data-row-id="q3"] .ds-table__cell, tbody tr:nth-last-child(2) .ds-table__cell');
    await expect(above && getComputedStyle(above).borderBottomStyle).toBe('none');
  },
};

// Bordered + compact
export const BorderedCompact: Story = {
  name: 'Bordered (compact)',
  args: {
    columns: textColumns,
    rows: textRows,
    bordered: true,
    size: 'compact',
  },
};

// With icons
export const WithIcons: Story = {
  args: {
    columns: [
      { key: 'name', header: 'Name', width: '35%' },
      { key: 'department', header: 'Department', width: '30%' },
      { key: 'status', header: 'Status', align: 'center' as const },
    ],
    rows: [
      {
        id: '1',
        cells: {
          name: (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <span className="material-symbols-rounded" style={{ fontSize: '24px' }}>person</span>
              Alice Chen
            </span>
          ),
          department: 'Design',
          status: <span className="material-symbols-rounded" style={{ fontSize: '24px', color: 'var(--color-status-positive-text)' }}>check_circle</span>,
        },
      },
      {
        id: '2',
        cells: {
          name: (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <span className="material-symbols-rounded" style={{ fontSize: '24px' }}>person</span>
              Bob Rivera
            </span>
          ),
          department: 'Engineering',
          status: <span className="material-symbols-rounded" style={{ fontSize: '24px', color: 'var(--color-status-positive-text)' }}>check_circle</span>,
        },
      },
      {
        id: '3',
        cells: {
          name: (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <span className="material-symbols-rounded" style={{ fontSize: '24px' }}>person</span>
              Carol Osei
            </span>
          ),
          department: 'Product',
          status: <span className="material-symbols-rounded" style={{ fontSize: '24px', color: 'var(--color-status-error-text)' }}>cancel</span>,
        },
      },
    ],
  },
};

// With buttons
export const WithButtons: Story = {
  args: {
    columns: [
      { key: 'name', header: 'Name', width: '30%' },
      { key: 'email', header: 'Email', width: '35%' },
      { key: 'actions', header: 'Actions', align: 'end' as const },
    ],
    rows: [
      {
        id: '1',
        cells: {
          name: 'Alice Chen',
          email: 'alice@example.com',
          actions: (
            <span style={{ display: 'inline-flex', gap: '8px' }}>
              <Button label="Edit" variant="tertiary" size="compact" />
              <Button label="Delete" variant="secondary" size="compact" />
            </span>
          ),
        },
      },
      {
        id: '2',
        cells: {
          name: 'Bob Rivera',
          email: 'bob@example.com',
          actions: (
            <span style={{ display: 'inline-flex', gap: '8px' }}>
              <Button label="Edit" variant="tertiary" size="compact" />
              <Button label="Delete" variant="secondary" size="compact" />
            </span>
          ),
        },
      },
      {
        id: '3',
        cells: {
          name: 'Carol Osei',
          email: 'carol@example.com',
          actions: (
            <span style={{ display: 'inline-flex', gap: '8px' }}>
              <Button label="Edit" variant="tertiary" size="compact" />
              <Button label="Delete" variant="secondary" size="compact" />
            </span>
          ),
        },
      },
    ],
  },
};

// With icon buttons
export const WithIconButtons: Story = {
  args: {
    columns: [
      { key: 'name', header: 'Name', width: '30%' },
      { key: 'role', header: 'Role', width: '35%' },
      { key: 'actions', header: 'Actions', align: 'end' as const },
    ],
    rows: [
      {
        id: '1',
        cells: {
          name: 'Alice Chen',
          role: 'Designer',
          actions: (
            <span style={{ display: 'inline-flex', gap: '4px' }}>
              <IconButton icon="edit" label="Edit" variant="tertiary" size="compact" />
              <IconButton icon="delete" label="Delete" variant="tertiary" size="compact" />
              <IconButton icon="more_vert" label="More" variant="tertiary" size="compact" />
            </span>
          ),
        },
      },
      {
        id: '2',
        cells: {
          name: 'Bob Rivera',
          role: 'Engineer',
          actions: (
            <span style={{ display: 'inline-flex', gap: '4px' }}>
              <IconButton icon="edit" label="Edit" variant="tertiary" size="compact" />
              <IconButton icon="delete" label="Delete" variant="tertiary" size="compact" />
              <IconButton icon="more_vert" label="More" variant="tertiary" size="compact" />
            </span>
          ),
        },
      },
      {
        id: '3',
        cells: {
          name: 'Carol Osei',
          role: 'Product Manager',
          actions: (
            <span style={{ display: 'inline-flex', gap: '4px' }}>
              <IconButton icon="edit" label="Edit" variant="tertiary" size="compact" />
              <IconButton icon="delete" label="Delete" variant="tertiary" size="compact" />
              <IconButton icon="more_vert" label="More" variant="tertiary" size="compact" />
            </span>
          ),
        },
      },
    ],
  },
};

// With inputs
export const WithInputs: Story = {
  args: {
    columns: [
      { key: 'setting', header: 'Setting', width: '30%' },
      { key: 'value', header: 'Value' },
    ],
    rows: [
      {
        id: '1',
        cells: {
          setting: 'Display name',
          value: <Input placeholder="Enter name" value="Alice Chen" />,
        },
      },
      {
        id: '2',
        cells: {
          setting: 'Email address',
          value: <Input placeholder="Enter email" value="alice@example.com" type="email" />,
        },
      },
      {
        id: '3',
        cells: {
          setting: 'Location',
          value: <Input placeholder="Enter city" />,
        },
      },
    ],
  },
};

// Mixed content — kitchen sink
export const MixedContent: Story = {
  args: {
    columns: [
      { key: 'select', header: '', width: '48px', align: 'center' as const },
      { key: 'name', header: 'Name', width: '25%' },
      { key: 'role', header: 'Role', width: '20%' },
      { key: 'email', header: 'Email' },
      { key: 'actions', header: 'Actions', align: 'end' as const },
    ],
    rows: [
      {
        id: '1',
        cells: {
          select: <Checkbox checked aria-label="Select Alice" />,
          name: (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <span className="material-symbols-rounded" style={{ fontSize: '24px' }}>person</span>
              Alice Chen
            </span>
          ),
          role: 'Designer',
          email: 'alice@example.com',
          actions: (
            <span style={{ display: 'inline-flex', gap: '4px' }}>
              <IconButton icon="edit" label="Edit" variant="tertiary" size="compact" />
              <IconButton icon="delete" label="Delete" variant="tertiary" size="compact" />
            </span>
          ),
        },
      },
      {
        id: '2',
        cells: {
          select: <Checkbox aria-label="Select Bob" />,
          name: (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <span className="material-symbols-rounded" style={{ fontSize: '24px' }}>person</span>
              Bob Rivera
            </span>
          ),
          role: 'Engineer',
          email: 'bob@example.com',
          actions: (
            <span style={{ display: 'inline-flex', gap: '4px' }}>
              <IconButton icon="edit" label="Edit" variant="tertiary" size="compact" />
              <IconButton icon="delete" label="Delete" variant="tertiary" size="compact" />
            </span>
          ),
        },
      },
      {
        id: '3',
        cells: {
          select: <Checkbox aria-label="Select Carol" />,
          name: (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <span className="material-symbols-rounded" style={{ fontSize: '24px' }}>person</span>
              Carol Osei
            </span>
          ),
          role: 'Product Manager',
          email: 'carol@example.com',
          actions: (
            <span style={{ display: 'inline-flex', gap: '8px' }}>
              <Button label="Invite" variant="secondary" size="compact" />
            </span>
          ),
        },
      },
    ],
    caption: 'Team members',
    captionHidden: true,
  },
};

/** A props reference: code columns that wrap, a Badge for a required prop. */
export const PropsReference: Story = {
  args: {
    bordered: true,
    size: 'compact',
    caption: 'Props',
    columns: [
      { key: 'prop', header: 'Prop', mono: true, width: '22%', rowHeader: true },
      { key: 'type', header: 'Type', mono: true, width: '30%' },
      { key: 'default', header: 'Default', mono: true, width: '14%' },
      { key: 'description', header: 'Description' },
    ],
    rows: [
      {
        id: 'items',
        cells: {
          prop: <>items <Badge label="Required" variant="neutral" /></>,
          type: 'SideNavEntry[]',
          default: '–',
          description: 'Navigation tree to render.',
        },
      },
      {
        id: 'size',
        cells: { prop: 'size', type: "'default' | 'compact'", default: "'default'", description: 'Row density.' },
      },
      {
        id: 'onExpandedChange',
        cells: {
          prop: 'onExpandedChange',
          type: '(expandedIds: string[]) => void',
          default: '–',
          description: 'Fires with the full new list of expanded ids.',
        },
      },
    ],
  },
};

/* ============================================
   FRAMELESS
   No outline, no header band, the outer columns' content flush with the
   page, and a raised tile on the hovered row. The frame gives the tile its
   reach (and the outer control its column) as page margin.
   ============================================ */

const framelessRoom = (Story: () => React.ReactNode) => (
  <div style={{ paddingInline: '56px' }}>
    <Story />
  </div>
);

const cellOf = (canvasElement: HTMLElement, row: number, col = 1) => {
  const cell = canvasElement.querySelectorAll<HTMLElement>('tbody tr')[row]?.children[col] as HTMLElement | undefined;
  if (!cell) throw new Error(`no cell at row ${row}`);
  return cell;
};

export const Frameless: Story = {
  args: { columns: textColumns, rows: textRows, frameless: true },
  decorators: [framelessRoom],
  play: async ({ canvasElement }) => {
    const table = canvasElement.querySelector('table')!;
    await expect(table).toHaveClass('ds-table--frameless');
    await expect(table).not.toHaveClass('ds-table--bordered');
    await expect(canvasElement.querySelector('.ds-table__scroll--frameless')).not.toBeNull();
    // The first column's content lines up with the frame the table sits in.
    const frame = canvasElement.querySelector('.ds-table__scroll')!.parentElement!.getBoundingClientRect();
    const firstText = cellOf(canvasElement, 0, 0).querySelector('.ds-table__cell-content')!.getBoundingClientRect();
    await expect(Math.round(firstText.left - frame.left)).toBe(56);
    // Rows keep their dividers; the last row ends the table with none.
    const line = (row: number) => getComputedStyle(cellOf(canvasElement, row)).getPropertyValue('--ds-table-line').trim();
    await expect(line(0)).not.toBe('transparent');
    await expect(line(textRows.length - 1)).toBe('transparent');
  },
};

export const FramelessCompact: Story = {
  name: 'Frameless (compact)',
  args: { columns: textColumns, rows: textRows, frameless: true, size: 'compact' },
  decorators: [framelessRoom],
};

export const FramelessWithTotal: Story = {
  name: 'Frameless (with total)',
  args: { columns: textColumns, rows: totalRows, frameless: true },
  decorators: [framelessRoom],
  play: async ({ canvasElement }) => {
    await expect(totalRuleOf(canvasElement)).toBe('solid true');
  },
};

const selectColumns = [{ key: 'select', header: <Checkbox size="compact" aria-label="Select all" /> }, ...textColumns];
const selectRows = textRows.map((row) => ({
  ...row,
  cells: { ...row.cells, select: <Checkbox size="compact" aria-label={`Select ${row.cells.name}`} /> },
}));

const controlOf = (canvasElement: HTMLElement, row: number) =>
  cellOf(canvasElement, row, 0).firstElementChild as HTMLElement;

/** The first column hangs as the row's outer control: inside the tile's start, shown on hover, focus or when checked. */
export const FramelessOuterControl: Story = {
  name: 'Frameless (outer control)',
  args: { columns: selectColumns, rows: selectRows, frameless: true, outerControl: true },
  decorators: [framelessRoom],
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('table')).toHaveClass('ds-table--outer-control');
    // The content still lines up with the frame; the control sits in the 40px before it.
    const frame = canvasElement.querySelector('.ds-table__scroll')!.parentElement!.getBoundingClientRect();
    const nameCell = cellOf(canvasElement, 0, 1).querySelector('.ds-table__cell-content')!.getBoundingClientRect();
    await expect(Math.round(nameCell.left - frame.left)).toBe(56);
    // Hidden at rest where there is hover. (A test cannot hold a real
    // :hover, so the reveal is checked by keyboard focus, which shows the
    // control and the tile the same way.)
    const hoverable = matchMedia('(hover: hover)').matches;
    if (hoverable) await expect(getComputedStyle(controlOf(canvasElement, 2)).opacity).toBe('0');
    // A key press first, so the focus that follows is keyboard focus.
    const first = controlOf(canvasElement, 0).querySelector<HTMLElement>('[role="checkbox"]')!;
    await userEvent.keyboard('{Shift}');
    first.focus();
    await expect(first.matches(':focus-visible')).toBe(true);
    await waitFor(() => expect(getComputedStyle(controlOf(canvasElement, 0)).opacity).toBe('1'));
    if (hoverable) await expect(getComputedStyle(controlOf(canvasElement, 2)).opacity).toBe('0');
    // Checking one shows every row's control while any is checked.
    await userEvent.keyboard(' ');
    await waitFor(() => expect(getComputedStyle(controlOf(canvasElement, 3)).opacity).toBe('1'));
  },
};

