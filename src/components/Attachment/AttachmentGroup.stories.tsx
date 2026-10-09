import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, screen, userEvent, waitFor, within } from 'storybook/test';
import { AttachmentGroup } from './AttachmentGroup';
import type { AttachmentItem } from './fileTypes';
import {
  DOCUMENT_FIRST_PAGE,
  PHOTO_LANDSCAPE,
  PHOTO_PORTRAIT,
  PHOTO_SQUARE,
  PHOTOS,
} from '../../stories/attachment-fixtures';

const EXTENSIONS = ['png', 'jpg', 'webp', 'png', 'png', 'png', 'jpg'];

const receipts: AttachmentItem[] = EXTENSIONS.map((extension, index) => ({
  id: `receipt-${index + 1}`,
  name: `receipt-04${10 + index}.${extension}`,
  kind: 'image',
  size: 2_100_000 - index * 120_000,
  status: 'ready',
  previewSrc: PHOTOS[index % PHOTOS.length],
}));

const mixed: AttachmentItem[] = [
  {
    id: 'a',
    name: 'whiteboard.png',
    kind: 'image',
    size: 830_000,
    status: 'ready',
    previewSrc: PHOTO_SQUARE,
  },
  {
    id: 'b',
    name: 'Q4 roadmap.xlsx',
    kind: 'spreadsheet',
    size: 88_000,
    status: 'ready',
  },
  {
    id: 'c',
    name: 'site-visit.jpg',
    kind: 'image',
    size: 1_400_000,
    status: 'ready',
    previewSrc: PHOTOS[0],
  },
  {
    id: 'd',
    name: 'demo_schedule_sep28_oct4.pdf',
    kind: 'pdf',
    size: 1_200_000,
    status: 'ready',
    previewSrc: DOCUMENT_FIRST_PAGE,
  },
];

const meta = {
  title: 'Components/AttachmentGroup',
  component: AttachmentGroup,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  args: { items: mixed, align: 'end' },
  argTypes: {
    align: { control: 'inline-radio', options: ['start', 'end'] },
    size: { control: 'inline-radio', options: ['default', 'compact'] },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 560, marginInline: 'auto' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AttachmentGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Pictures and files together: one grid of squares. */
export const Mixed: Story = {};

/** One picture keeps its own shape: a wide screenshot stays wide. */
export const SingleImageWide: Story = {
  args: {
    items: [
      {
        id: 'w',
        name: 'schedule.png',
        kind: 'image',
        size: 640_000,
        status: 'ready',
        previewSrc: PHOTO_LANDSCAPE,
        width: 768,
        height: 480,
      },
    ],
  },
};

/** A tall picture is capped in height rather than taking over the thread. */
export const SingleImagePortrait: Story = {
  args: {
    items: [
      {
        id: 'p',
        name: 'receipt.jpg',
        kind: 'image',
        size: 910_000,
        status: 'ready',
        previewSrc: PHOTO_PORTRAIT,
        width: 549,
        height: 768,
      },
    ],
  },
};

/** A single file that is not a picture is still a square tile. */
export const SingleFile: Story = {
  args: { items: [mixed[1]] },
};

/** Past `max`, the last cell stands for the rest and expands the grid in place. */
export const Overflow: Story = {
  args: { items: receipts },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const list = canvas.getByRole('list', { name: 'Attachments' });
    await expect(within(list).getAllByRole('listitem')).toHaveLength(4);

    const more = canvas.getByRole('button', { name: 'Show 4 more' });
    await expect(more).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(more);

    await expect(within(list).getAllByRole('listitem')).toHaveLength(7);
    const fewer = canvas.getByRole('button', { name: 'Show fewer' });
    // Focus follows the control that replaced the one just pressed
    await waitFor(() => expect(fewer).toHaveFocus());

    await userEvent.click(fewer);
    await expect(within(list).getAllByRole('listitem')).toHaveLength(4);
    const collapsed = canvas.getByRole('button', { name: 'Show 4 more' });
    await waitFor(() => expect(collapsed).toHaveFocus());
    collapsed.blur();
  },
};

/** A file that has expired stays on the message as a record, and opens nothing. */
export const Unavailable: Story = {
  args: {
    items: [
      {
        id: 'u1',
        name: 'demo_schedule_oct4.pdf',
        kind: 'pdf',
        size: 1_200_000,
        status: 'unavailable',
      },
      {
        id: 'u2',
        name: 'Screenshot.png',
        kind: 'image',
        size: 830_000,
        status: 'unavailable',
      },
    ],
  },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryAllByRole('button')).toHaveLength(0);
  },
};

export const AlignStart: Story = {
  args: { align: 'start' },
};

export const Compact: Story = {
  args: { size: 'compact', items: receipts },
};

/** Pressing a file opens the viewer, which steps through the whole group. */
export const OpensViewer: Story = {
  args: { onDownload: () => {} },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: /whiteboard\.png/ });
    await userEvent.click(trigger);

    const dialog = await screen.findByRole('dialog', {
      name: 'whiteboard.png',
    });
    await expect(within(dialog).getAllByText(/1 of 4/).length).toBeGreaterThan(0);

    await userEvent.keyboard('{ArrowRight}');
    await screen.findByRole('dialog', { name: 'Q4 roadmap.xlsx' });
    // A spreadsheet has nothing to draw, and the viewer says so
    await expect(within(dialog).getByText('No preview for this file type')).toBeInTheDocument();

    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    // Dismissal hands focus back to the tile that opened the viewer
    await waitFor(() => expect(trigger).toHaveFocus());
    trigger.blur();
  },
};
