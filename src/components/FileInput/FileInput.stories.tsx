import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { FileInput } from './FileInput';
import type { FileInputFile } from './FileInput';

const meta = {
  title: 'Components/FileInput',
  component: FileInput,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    placeholder: { control: 'text' },
    accept: { control: 'text' },
    multiple: { control: 'boolean' },
    size: {
      control: 'radio',
      options: ['default', 'compact'],
    },
    disabled: { control: 'boolean' },
    error: { control: 'boolean' },
  },
  args: {
    label: 'Attachments',
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '480px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FileInput>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Wires selection and removal so the dropzone is actually usable in Storybook. */
const InteractiveTemplate: Story['render'] = (args) => {
  const [files, setFiles] = useState<FileInputFile[]>([]);

  return (
    <FileInput
      {...args}
      files={files}
      onFilesSelected={(selected) =>
        setFiles((prev) => [
          ...prev,
          ...selected.map((file, i) => ({
            id: `${file.name}-${Date.now()}-${i}`,
            name: file.name,
            size: file.size,
          })),
        ])
      }
      onFileRemove={(id) => setFiles((prev) => prev.filter((f) => f.id !== id))}
    />
  );
};

export const Default: Story = {
  render: InteractiveTemplate,
};

export const Multiple: Story = {
  args: {
    multiple: true,
    helperText: 'Add as many files as you need.',
  },
  render: InteractiveTemplate,
};

export const WithAcceptList: Story = {
  args: {
    accept: 'image/png,image/jpeg,.pdf',
    multiple: true,
    helperText: 'PNG, JPEG, or PDF up to 10 MB each.',
  },
  render: InteractiveTemplate,
};

export const WithFiles: Story = {
  args: {
    multiple: true,
    files: [
      { id: '1', name: 'brand-guidelines.pdf', size: 2_411_724 },
      { id: '2', name: 'logo-primary.svg', size: 18_432 },
      { id: '3', name: 'hero-photo.jpg', size: 845_120 },
    ],
    onFileRemove: () => {},
  },
};

export const Uploading: Story = {
  args: {
    multiple: true,
    files: [
      { id: '1', name: 'annual-report.pdf', size: 8_388_608, progress: 72 },
      { id: '2', name: 'appendix.docx', size: 1_048_576, progress: 34 },
      { id: '3', name: 'cover.png', size: 204_800 },
    ],
    helperText: 'Uploading 2 of 3 files…',
    onFileRemove: () => {},
  },
};

export const WithFileErrors: Story = {
  args: {
    multiple: true,
    files: [
      { id: '1', name: 'presentation.key', error: 'Unsupported file type' },
      { id: '2', name: 'raw-footage.mov', size: 524_288_000, error: 'Exceeds the 10 MB limit' },
      { id: '3', name: 'notes.txt', size: 4_096 },
    ],
    onFileRemove: () => {},
  },
};

export const ErrorState: Story = {
  args: {
    error: true,
    required: true,
    helperText: 'At least one attachment is required.',
  },
  render: InteractiveTemplate,
};

export const Compact: Story = {
  args: {
    size: 'compact',
    multiple: true,
    files: [{ id: '1', name: 'receipt.pdf', size: 51_200 }],
    onFileRemove: () => {},
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    files: [{ id: '1', name: 'contract-signed.pdf', size: 320_000 }],
    helperText: 'Attachments are locked once the form is submitted.',
    onFileRemove: () => {},
  },
};

export const WithoutLabel: Story = {
  args: {
    label: undefined,
    ariaLabel: 'Upload attachments',
  },
  render: InteractiveTemplate,
};
