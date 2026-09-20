import type { Meta, StoryObj } from '@storybook/react-vite';
import { DocumentChip, type DocumentChipFileType } from './DocumentChip';

const FILE_TYPES: { fileType: DocumentChipFileType; name: string; meta: string }[] = [
  { fileType: 'pdf', name: 'quarterly-report.pdf', meta: '1.2 MB' },
  { fileType: 'doc', name: 'launch-brief.docx', meta: '12 pages' },
  { fileType: 'sheet', name: 'budget-2026.xlsx', meta: '86 KB' },
  { fileType: 'slide', name: 'all-hands.key', meta: '34 slides' },
  { fileType: 'image', name: 'hero-banner.png', meta: '2.4 MB' },
  { fileType: 'code', name: 'tokens.css', meta: '9 KB' },
  { fileType: 'archive', name: 'assets.zip', meta: '18 MB' },
  { fileType: 'generic', name: 'notes.txt', meta: '3 KB' },
];

const meta = {
  title: 'Components/DocumentChip',
  component: DocumentChip,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    fileType: {
      control: 'select',
      options: ['pdf', 'doc', 'sheet', 'slide', 'image', 'code', 'archive', 'generic'],
    },
    icon: { control: 'text' },
    size: {
      control: 'select',
      options: ['default', 'compact'],
    },
    progress: { control: { type: 'range', min: 0, max: 100 } },
  },
  args: {
    name: 'quarterly-report.pdf',
    fileType: 'pdf',
    meta: '1.2 MB',
  },
} satisfies Meta<typeof DocumentChip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** One chip per document type — the module-level icon map in full. */
export const FileTypes: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 'var(--gap-sm)',
        maxWidth: '640px',
      }}
    >
      {FILE_TYPES.map((file) => (
        <DocumentChip key={file.fileType} {...file} />
      ))}
    </div>
  ),
};

export const Uploading: Story = {
  args: {
    name: 'assets.zip',
    fileType: 'archive',
    meta: undefined,
    progress: 40,
  },
};

export const ErrorState: Story = {
  args: {
    name: 'assets.zip',
    fileType: 'archive',
    error: 'Upload failed',
  },
};

export const Removable: Story = {
  args: {
    onRemove: () => {},
  },
};

/** Click and remove coexist: the body becomes a button beside the close button. */
export const Clickable: Story = {
  args: {
    onClick: () => {},
    onRemove: () => {},
  },
};

export const Compact: Story = {
  args: {
    size: 'compact',
    onRemove: () => {},
  },
};
