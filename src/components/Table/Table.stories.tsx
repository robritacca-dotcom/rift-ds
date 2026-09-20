import type { Meta, StoryObj } from '@storybook/react-vite';
import { Table } from './Table';
import { Button } from '../Button/Button';
import { CircularButton } from '../CircularButton/CircularButton';
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
      { key: 'actions', header: 'Actions', align: 'right' as const },
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

// With circular buttons
export const WithCircularButtons: Story = {
  args: {
    columns: [
      { key: 'name', header: 'Name', width: '30%' },
      { key: 'role', header: 'Role', width: '35%' },
      { key: 'actions', header: 'Actions', align: 'right' as const },
    ],
    rows: [
      {
        id: '1',
        cells: {
          name: 'Alice Chen',
          role: 'Designer',
          actions: (
            <span style={{ display: 'inline-flex', gap: '4px' }}>
              <CircularButton icon="edit" ariaLabel="Edit" variant="tertiary" size="compact" />
              <CircularButton icon="delete" ariaLabel="Delete" variant="tertiary" size="compact" />
              <CircularButton icon="more_vert" ariaLabel="More" variant="tertiary" size="compact" />
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
              <CircularButton icon="edit" ariaLabel="Edit" variant="tertiary" size="compact" />
              <CircularButton icon="delete" ariaLabel="Delete" variant="tertiary" size="compact" />
              <CircularButton icon="more_vert" ariaLabel="More" variant="tertiary" size="compact" />
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
              <CircularButton icon="edit" ariaLabel="Edit" variant="tertiary" size="compact" />
              <CircularButton icon="delete" ariaLabel="Delete" variant="tertiary" size="compact" />
              <CircularButton icon="more_vert" ariaLabel="More" variant="tertiary" size="compact" />
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
      { key: 'actions', header: 'Actions', align: 'right' as const },
    ],
    rows: [
      {
        id: '1',
        cells: {
          select: <Checkbox checked ariaLabel="Select Alice" />,
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
              <CircularButton icon="edit" ariaLabel="Edit" variant="tertiary" size="compact" />
              <CircularButton icon="delete" ariaLabel="Delete" variant="tertiary" size="compact" />
            </span>
          ),
        },
      },
      {
        id: '2',
        cells: {
          select: <Checkbox ariaLabel="Select Bob" />,
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
              <CircularButton icon="edit" ariaLabel="Edit" variant="tertiary" size="compact" />
              <CircularButton icon="delete" ariaLabel="Delete" variant="tertiary" size="compact" />
            </span>
          ),
        },
      },
      {
        id: '3',
        cells: {
          select: <Checkbox ariaLabel="Select Carol" />,
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
