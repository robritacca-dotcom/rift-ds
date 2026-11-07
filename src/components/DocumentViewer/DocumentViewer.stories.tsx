import { useMemo } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor } from 'storybook/test';
import { DocumentViewer } from './DocumentViewer';
import { AttachmentViewer } from '../Attachment/AttachmentViewer';
import { CONTRACT_TXT, statementPdfUrl } from '../../stories/attachment-fixtures';

/** The statement as a blob address, made once per story. */
function usePdfUrl() {
  return useMemo(() => statementPdfUrl(), []);
}

const RECEIPT_SVG = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="480" height="640" viewBox="0 0 480 640"><rect width="480" height="640" fill="#fff"/><text x="40" y="80" font-family="sans-serif" font-size="28">Receipt</text><text x="40" y="140" font-family="sans-serif" font-size="18">Standing desk     $899.00</text><text x="40" y="180" font-family="sans-serif" font-size="18">Monitor arm       $185.00</text><text x="40" y="240" font-family="sans-serif" font-size="20">Total            $1,084.00</text></svg>',
)}`;

const meta = {
  title: 'Components/DocumentViewer',
  component: DocumentViewer,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  argTypes: {
    kind: { control: 'inline-radio', options: ['auto', 'pdf', 'image', 'text'] },
    height: { control: 'inline-radio', options: ['default', 'tall', 'fill'] },
  },
  args: { src: RECEIPT_SVG, title: 'Receipt, 4 Nov 2026', fileName: 'receipt.svg' },
} satisfies Meta<typeof DocumentViewer>;

export default meta;
type Story = StoryObj<typeof meta>;

/** An uploaded receipt: an image with zoom, download and open in a new tab. */
export const Image: Story = {
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Zoom in' }));
    await expect(canvas.getByRole('button', { name: 'Fit to width, now 150%' })).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Fit to width, now 150%' }));
    await expect(canvas.getByRole('button', { name: 'Fit to width, now 100%' })).toBeInTheDocument();
  },
};

/** A statement in the browser's own PDF viewer. */
export const Statement: Story = {
  render: function Render(args) {
    const src = usePdfUrl();
    return <DocumentViewer {...args} src={src} kind="pdf" title="Statement, October 2026" fileName="statement.pdf" />;
  },
};

/** A contract as text, fetched and set in a scrolling frame. */
export const Contract: Story = {
  args: { src: CONTRACT_TXT, title: 'Supply agreement', fileName: 'agreement.txt', height: 'tall' },
  play: async ({ canvas }) => {
    await waitFor(() => expect(canvas.getByText(/SUPPLY AGREEMENT/)).toBeInTheDocument());
  },
};

/** A kind the viewer cannot show: the fallback, with the download. */
export const Unsupported: Story = {
  args: { src: '#invoice.docx', title: 'Invoice INV-2041', fileName: 'invoice.docx' },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('This file can’t be shown here.')).toBeInTheDocument();
  },
};

/** The host's own controls in the toolbar, and a download it handles itself. */
export const CustomToolbar: Story = {
  args: {
    toolbar: <span style={{ color: 'var(--color-text-tertiary)', fontSize: 'var(--font-caption-size)' }}>Page 1 of 1</span>,
    onDownload: () => {},
  },
};

/** Bare: no frame and no toolbar, for a host with a header of its own. */
export const Bare: Story = {
  args: { bare: true },
  decorators: [
    (Story) => (
      <div style={{ blockSize: '360px', display: 'flex', flexDirection: 'column' }}>
        <Story />
      </div>
    ),
  ],
};

/** Inside AttachmentViewer with no host code: a PDF item with a `fileUrl` shows in place, bare. */
export const InAttachmentViewer: Story = {
  render: function Render() {
    const src = usePdfUrl();
    return (
      <AttachmentViewer
        open
        onOpenChange={() => {}}
        items={[{ id: 'statement', name: 'statement.pdf', kind: 'pdf', status: 'ready', fileUrl: src }]}
      />
    );
  },
};

/** On a phone: the title takes a row of its own above the controls, so the whole name reads. */
export const Narrow: Story = {
  decorators: [
    (Story) => (
      <div style={{ inlineSize: '320px' }}>
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    const title = canvasElement.querySelector<HTMLElement>('.ds-document-viewer__title');
    await expect(title && title.scrollWidth <= title.clientWidth).toBe(true);
  },
};
