import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, screen, userEvent, waitFor, within } from 'storybook/test';
import { AttachmentViewer } from './AttachmentViewer';
import type { AttachmentViewerProps } from './AttachmentViewer';
import type { AttachmentItem } from './fileTypes';
import { Button } from '../Button/Button';
import {
  DOCUMENT_FIRST_PAGE,
  PHOTOS,
} from '../../stories/attachment-fixtures';

const photos: AttachmentItem[] = PHOTOS.slice(0, 5).map((previewSrc, index) => ({
  id: `photo-${index + 1}`,
  name: `receipt-04${11 + index}.jpg`,
  kind: 'image',
  size: 2_100_000,
  status: 'ready',
  previewSrc,
}));

const spreadsheet: AttachmentItem = {
  id: 'sheet',
  name: 'Q4 roadmap.xlsx',
  kind: 'spreadsheet',
  size: 88_000,
  status: 'ready',
};

const pdf: AttachmentItem = {
  id: 'pdf',
  name: 'demo_schedule_sep28_oct4.pdf',
  kind: 'pdf',
  size: 1_200_000,
  status: 'ready',
};

const meta = {
  title: 'Components/AttachmentViewer',
  component: AttachmentViewer,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  args: {
    open: false,
    onOpenChange: fn(),
    items: photos,
    onDownload: fn(),
  },
} satisfies Meta<typeof AttachmentViewer>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The viewer is controlled; each story opens it from a button. */
const Demo = (args: AttachmentViewerProps) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button label="Open viewer" variant="secondary" onClick={() => setOpen(true)} />
      <AttachmentViewer {...args} open={open} onOpenChange={setOpen} />
    </>
  );
};

/** Several pictures: the footer steps through them and says where you are. */
export const Gallery: Story = {
  args: { defaultActiveId: 'photo-2' },
  render: (args) => <Demo {...args} />,
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button', {
      name: 'Open viewer',
    });
    await userEvent.click(trigger);

    const dialog = await screen.findByRole('dialog', {
      name: 'receipt-0412.jpg',
    });
    await expect(within(dialog).getAllByText(/2 of 5/).length).toBeGreaterThan(0);

    await userEvent.click(within(dialog).getByRole('button', { name: 'Next file' }));
    await screen.findByRole('dialog', { name: 'receipt-0413.jpg' });

    await userEvent.keyboard('{ArrowLeft}{ArrowLeft}');
    await screen.findByRole('dialog', { name: 'receipt-0411.jpg' });
    // Stepping back from the first file wraps to the last
    await userEvent.keyboard('{ArrowLeft}');
    await screen.findByRole('dialog', { name: 'receipt-0415.jpg' });

    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
    trigger.blur();
  },
};

/** A format the viewer cannot draw says so and offers the download. */
export const NoPreview: Story = {
  args: { items: [spreadsheet] },
  render: (args) => <Demo {...args} />,
};

/** The host draws what the viewer cannot: here, the pages of a PDF. */
export const HostRenderedPdf: Story = {
  args: {
    items: [pdf],
    renderPreview: () => (
      <div
        style={{
          display: 'grid',
          gap: 'var(--gap-300)',
          alignSelf: 'flex-start',
          width: 'min(100%, 420px)',
        }}
      >
        <img src={DOCUMENT_FIRST_PAGE} alt="Page 1" style={{ width: '100%', display: 'block' }} />
        <img src={DOCUMENT_FIRST_PAGE} alt="Page 2" style={{ width: '100%', display: 'block' }} />
      </div>
    ),
  },
  render: (args) => <Demo {...args} />,
};

/** A file whose link has expired explains itself and offers another try. */
export const FailedToLoad: Story = {
  args: { items: [{ ...pdf, status: 'error' }], onRetry: fn() },
  render: (args) => <Demo {...args} />,
  play: async ({ args, canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button', {
      name: 'Open viewer',
    });
    await userEvent.click(trigger);
    const dialog = await screen.findByRole('dialog');
    await expect(within(dialog).getByText('Couldn’t load this file')).toBeInTheDocument();
    await userEvent.click(within(dialog).getByRole('button', { name: 'Try again' }));
    await expect(args.onRetry).toHaveBeenCalledTimes(1);
    await userEvent.click(within(dialog).getByRole('button', { name: 'Close' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    trigger.blur();
  },
};

/** Open on load, for the docs page and visual checks. */
export const Open: Story = {
  args: { open: true, items: [photos[0], spreadsheet, pdf] },
  parameters: { docs: { story: { inline: false, iframeHeight: 520 } } },
};
