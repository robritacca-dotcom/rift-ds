import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn } from 'storybook/test';
import { FileRow } from './FileRow';
import { CircularButton } from '../CircularButton/CircularButton';

const meta = {
  title: 'Components/FileRow',
  component: FileRow,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'inline-radio', options: ['default', 'compact'] },
  },
  args: {
    name: 'Quarterly report.pdf',
    meta: '2.4 MB · Added 3 Oct',
    href: '#report',
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '560px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FileRow>;

export default meta;
type Story = StoryObj<typeof meta>;

/** One file: its type mark, its name as a link, and a line of detail. */
export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('link', { name: 'Quarterly report.pdf' })).toHaveAttribute('href', '#report');
  },
};

/** A document list: rows divided like a WidgetRow list, each with its own actions, the names opening the file in place. */
export const DocumentList: Story = {
  args: { onOpen: fn() },
  render: (args) => (
    <div>
      {[
        ['Quarterly report.pdf', '2.4 MB · Added 3 Oct'],
        ['Budget.xlsx', '88 KB · Added 28 Sep'],
        ['Proposal.docx', '412 KB · Added 21 Sep'],
        ['Kickoff deck.pptx', '6.1 MB · Added 14 Sep'],
        ['Notes.md', '3 KB · Added 2 Sep'],
      ].map(([name, detail]) => (
        <FileRow
          key={name}
          name={name}
          meta={detail}
          onOpen={args.onOpen}
          actions={<CircularButton icon="download" variant="tertiary" size="compact" ariaLabel={`Download ${name}`} />}
        />
      ))}
    </div>
  ),
  play: async ({ canvas, args, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Budget.xlsx' }));
    await expect(args.onOpen).toHaveBeenCalledTimes(1);
    await expect(canvas.getByRole('button', { name: 'Download Proposal.docx' })).toBeInTheDocument();
  },
};

/** Dense rows for a side panel. */
export const Compact: Story = {
  args: { size: 'compact' },
};
