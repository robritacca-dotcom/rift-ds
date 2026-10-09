import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { AttachmentTile } from './AttachmentTile';
import type { AttachmentStatus, FileKind } from './fileTypes';
import { DOCUMENT_FIRST_PAGE, PHOTO_SQUARE } from '../../stories/attachment-fixtures';

const meta = {
  title: 'Components/AttachmentTile',
  component: AttachmentTile,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  args: {
    name: 'demo_schedule_sep28_oct4.pdf',
    kind: 'pdf',
    meta: '1.2 MB',
  },
  argTypes: {
    kind: {
      control: 'select',
      options: [
        'pdf',
        'document',
        'spreadsheet',
        'presentation',
        'image',
        'audio',
        'video',
        'archive',
        'code',
        'text',
        'pasted',
        'generic',
      ],
    },
    status: {
      control: 'inline-radio',
      options: ['ready', 'uploading', 'error', 'unavailable'],
    },
    size: { control: 'inline-radio', options: ['default', 'compact'] },
  },
} satisfies Meta<typeof AttachmentTile>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

const PASTED =
  'Paid time off policy (2026)\n\nFull-time employees accrue 1.5 days of PTO per month, credited on the first working day.';

type Row = {
  label: string;
  name: string;
  kind: FileKind;
  meta?: string;
  previewSrc?: string;
  excerpt?: string;
};

const ROWS: Row[] = [
  {
    label: 'Image',
    name: 'Screenshot 5 PM.png',
    kind: 'image',
    previewSrc: PHOTO_SQUARE,
  },
  {
    label: 'PDF, first page',
    name: 'Meeting notes.pdf',
    kind: 'pdf',
    previewSrc: DOCUMENT_FIRST_PAGE,
  },
  {
    label: 'PDF, no render',
    name: 'demo_schedule_sep28_oct4.pdf',
    kind: 'pdf',
    meta: '1.2 MB',
  },
  {
    label: 'Spreadsheet',
    name: 'Q4 roadmap.xlsx',
    kind: 'spreadsheet',
    meta: '88 KB',
  },
  {
    label: 'CSV',
    name: 'hours_export.csv',
    kind: 'spreadsheet',
    meta: '12 KB',
  },
  {
    label: 'Document',
    name: 'Weekly team notes.docx',
    kind: 'document',
    meta: '54 KB',
  },
  {
    label: 'Slides',
    name: 'Q4 kickoff deck.pptx',
    kind: 'presentation',
    meta: '5.6 MB',
  },
  {
    label: 'Pasted text',
    name: 'Pasted text',
    kind: 'pasted',
    excerpt: PASTED,
  },
  {
    label: 'Any other type',
    name: 'Q4 plan.key',
    kind: 'generic',
    meta: '3.4 MB',
  },
];

const STATES: {
  label: string;
  status: AttachmentStatus;
  removable?: boolean;
}[] = [
  { label: 'Ready', status: 'ready' },
  { label: 'Uploading', status: 'uploading' },
  { label: 'Failed', status: 'error', removable: true },
  { label: 'Unavailable', status: 'unavailable' },
];

const cellLabel: React.CSSProperties = {
  font: 'var(--font-paragraph-sm-emphasis-weight) var(--font-caption-size) / var(--font-caption-line-height) var(--font-family-body)',
  color: 'var(--color-text-secondary)',
  textAlign: 'left',
};

/** Every kind in every state: the whole vocabulary of the tile on one sheet. */
export const StateMatrix: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `140px repeat(${STATES.length}, max-content)`,
        gap: 'var(--gap-500)',
        alignItems: 'center',
      }}
    >
      <span />
      {STATES.map((state) => (
        <span key={state.label} style={cellLabel}>
          {state.label}
        </span>
      ))}
      {ROWS.map((row) => (
        <div key={row.label} style={{ display: 'contents' }}>
          <span style={cellLabel}>{row.label}</span>
          {STATES.map((state) => (
            <AttachmentTile
              key={state.label}
              name={row.name}
              kind={row.kind}
              meta={row.meta}
              previewSrc={row.previewSrc}
              excerpt={row.excerpt}
              status={state.status}
              errorLabel={row.kind === 'pasted' ? 'Paste failed' : undefined}
              onRemove={state.removable ? () => {} : undefined}
            />
          ))}
        </div>
      ))}
    </div>
  ),
};

/** The four well-known formats, each in its own file-type colour. */
export const KnownFormats: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--gap-300)' }}>
      <AttachmentTile name="Contract.pdf" kind="pdf" meta="1.2 MB" />
      <AttachmentTile name="Q4 roadmap.xlsx" kind="spreadsheet" meta="88 KB" />
      <AttachmentTile name="Weekly notes.docx" kind="document" meta="54 KB" />
      <AttachmentTile name="Kickoff deck.pptx" kind="presentation" meta="5.6 MB" />
    </div>
  ),
};

/** Everything else wears its extension as a neutral badge. */
export const OtherFormats: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--gap-300)' }}>
      <AttachmentTile name="voice-note.mp3" kind="audio" meta="2.1 MB" />
      <AttachmentTile name="export.md" kind="text" meta="4 KB" />
      <AttachmentTile name="assets.zip" kind="archive" meta="18.4 MB" />
      <AttachmentTile name="Q4 plan.key" kind="generic" meta="3.4 MB" />
    </div>
  ),
};

export const WithPreview: Story = {
  args: {
    name: 'Hills at dusk.png',
    kind: 'image',
    previewSrc: PHOTO_SQUARE,
    meta: undefined,
  },
};

/** A first page the host rendered: the picture fills the tile and the format stays marked. */
export const PdfFirstPage: Story = {
  args: {
    name: 'Meeting notes.pdf',
    kind: 'pdf',
    previewSrc: DOCUMENT_FIRST_PAGE,
  },
};

export const PastedText: Story = {
  args: {
    name: 'Pasted text',
    kind: 'pasted',
    excerpt: PASTED,
    meta: undefined,
  },
};

export const Uploading: Story = {
  args: { status: 'uploading', progress: 40 },
};

export const Failed: Story = {
  args: { status: 'error', onRemove: fn() },
};

export const Unavailable: Story = {
  args: { status: 'unavailable' },
};

export const Compact: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--gap-200)' }}>
      <AttachmentTile size="compact" name="Contract.pdf" kind="pdf" />
      <AttachmentTile size="compact" name="Hills.png" kind="image" previewSrc={PHOTO_SQUARE} />
      <AttachmentTile size="compact" name="Q4 plan.key" kind="generic" />
      <AttachmentTile size="compact" name="Q4 roadmap.xlsx" kind="spreadsheet" status="uploading" />
    </div>
  ),
};

/** A long name gives way in the middle, so the extension always shows. */
export const LongName: Story = {
  args: { name: 'Quarterly planning workshop notes final v3.pdf' },
  play: async ({ canvasElement }) => {
    const tail = canvasElement.querySelector('.ds-attachment-tile__name-tail') as HTMLElement;
    const tile = canvasElement.querySelector('.ds-attachment-tile') as HTMLElement;
    await expect(tail.textContent).toBe('l v3.pdf');
    // The tail is never clipped: it sits inside the tile's own box
    const tailBox = tail.getBoundingClientRect();
    const tileBox = tile.getBoundingClientRect();
    await expect(tailBox.right).toBeLessThanOrEqual(tileBox.right);
    await expect(tailBox.left).toBeGreaterThanOrEqual(tileBox.left);
  },
};

/** Click and remove are separate controls, both reachable from the keyboard. */
export const Removable: Story = {
  args: { onClick: fn(), onRemove: fn() },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: /^demo_schedule/ })).toHaveFocus();
    await userEvent.tab();
    const remove = canvas.getByRole('button', {
      name: 'Remove demo_schedule_sep28_oct4.pdf',
    });
    await expect(remove).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onRemove).toHaveBeenCalledTimes(1);
    await expect(args.onClick).not.toHaveBeenCalled();
    remove.blur();
  },
};
