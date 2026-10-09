import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, waitFor, within } from 'storybook/test';
import { AttachmentDropZone } from './AttachmentDropZone';

const surface: React.CSSProperties = {
  width: 360,
  height: 420,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-end',
  padding: 'var(--padding-400)',
  border: 'var(--border-025) solid var(--color-bg-container-border)',
  borderRadius: 'var(--radius-600)',
  background: 'var(--color-bg-container-primary)',
  color: 'var(--color-text-secondary)',
  font: 'var(--font-paragraph-sm-weight) var(--font-paragraph-sm-size) / var(--font-paragraph-sm-line-height) var(--font-family-body)',
};

const meta = {
  title: 'Components/AttachmentDropZone',
  component: AttachmentDropZone,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  args: {
    onFilesSelected: fn(),
    hint: 'PDF, JPG, PNG, WebP · up to 50 MB each · 10 files max',
    children: <div style={surface}>Drag a file anywhere over this panel.</div>,
  },
} satisfies Meta<typeof AttachmentDropZone>;

export default meta;
type Story = StoryObj<typeof meta>;

/** At rest the zone is invisible: it only speaks while files hover over it. */
export const Default: Story = {};

/**
 * Dispatch a real drag event carrying files, as a browser would. Built by
 * hand rather than through the test library's fireEvent, whose recorded
 * arguments are cloned and lose the DataTransfer on the way.
 */
const drag = (target: Element, type: 'dragenter' | 'drop', files: File[], text?: string) => {
  const dataTransfer = new DataTransfer();
  for (const file of files) dataTransfer.items.add(file);
  if (text !== undefined) dataTransfer.setData('text/plain', text);
  target.dispatchEvent(new DragEvent(type, { bubbles: true, cancelable: true, dataTransfer }));
};

/** Files hovering: the overlay frosts the surface and lights its edge. */
export const Dragging: Story = {
  play: async ({ canvasElement }) => {
    const zone = canvasElement.querySelector('.ds-attachment-drop-zone') as HTMLElement;
    const files = [new File(['a'], 'a.png', { type: 'image/png' }), new File(['b'], 'b.pdf')];
    drag(zone, 'dragenter', files);
    await waitFor(() => expect(zone).toHaveClass('ds-attachment-drop-zone--active'));
    await waitFor(() => expect(within(zone).getByText('Drop files to attach')).toBeVisible());
  },
};

/** Dropping hands the files over and puts the overlay away. */
export const Drop: Story = {
  play: async ({ args, canvasElement }) => {
    const zone = canvasElement.querySelector('.ds-attachment-drop-zone') as HTMLElement;
    const files = [new File(['a'], 'a.png', { type: 'image/png' })];
    drag(zone, 'dragenter', files);
    await waitFor(() => expect(zone).toHaveClass('ds-attachment-drop-zone--active'));
    drag(zone, 'drop', files);
    await expect(args.onFilesSelected).toHaveBeenCalledWith([expect.objectContaining({ name: 'a.png' })]);
    await waitFor(() => expect(zone).not.toHaveClass('ds-attachment-drop-zone--active'));
  },
};

/** A drag that carries no files (selected text, a link) passes straight through. */
export const IgnoresOtherDrags: Story = {
  play: async ({ args, canvasElement }) => {
    const zone = canvasElement.querySelector('.ds-attachment-drop-zone') as HTMLElement;
    drag(zone, 'dragenter', [], 'some selected text');
    await expect(zone).not.toHaveClass('ds-attachment-drop-zone--active');
    await expect(args.onFilesSelected).not.toHaveBeenCalled();
  },
};
