import { useMemo } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor } from 'storybook/test';
import { DocumentViewer } from './DocumentViewer';
import { AttachmentViewer } from '../Attachment/AttachmentViewer';

/** A one-page statement, generated for the stories. */
const STATEMENT_PDF = 'JVBERi0xLjQKMSAwIG9iago8PCAvVHlwZSAvQ2F0YWxvZyAvUGFnZXMgMiAwIFIgPj4KZW5kb2JqCjIgMCBvYmoKPDwgL1R5cGUgL1BhZ2VzIC9LaWRzIFszIDAgUl0gL0NvdW50IDEgPj4KZW5kb2JqCjMgMCBvYmoKPDwgL1R5cGUgL1BhZ2UgL1BhcmVudCAyIDAgUiAvTWVkaWFCb3ggWzAgMCA2MTIgNzkyXSAvQ29udGVudHMgNCAwIFIgL1Jlc291cmNlcyA8PCAvRm9udCA8PCAvRjEgNSAwIFIgPj4gPj4gPj4KZW5kb2JqCjQgMCBvYmoKPDwgL0xlbmd0aCAxMzMgPj4Kc3RyZWFtCkJUIC9GMSAyNCBUZiA3MiA3MjAgVGQgKFN0YXRlbWVudCwgT2N0b2JlciAyMDI2KSBUaiBFVApCVCAvRjEgMTIgVGYgNzIgNjkwIFRkIChOb3J0aHdpbmQgU3VwcGx5IEx0ZC4gQ2xvc2luZyBiYWxhbmNlIDEyLDk1MC43NSkgVGogRVQKZW5kc3RyZWFtCmVuZG9iago1IDAgb2JqCjw8IC9UeXBlIC9Gb250IC9TdWJ0eXBlIC9UeXBlMSAvQmFzZUZvbnQgL0hlbHZldGljYSA+PgplbmRvYmoKeHJlZgowIDYKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDA5IDAwMDAwIG4gCjAwMDAwMDAwNTggMDAwMDAgbiAKMDAwMDAwMDExNSAwMDAwMCBuIAowMDAwMDAwMjQxIDAwMDAwIG4gCjAwMDAwMDA0MjUgMDAwMDAgbiAKdHJhaWxlcgo8PCAvU2l6ZSA2IC9Sb290IDEgMCBSID4+CnN0YXJ0eHJlZgo0OTUKJSVFT0YK';

/** The statement as a blob address, which a browser embeds where it refuses a data address. */
function usePdfUrl() {
  return useMemo(() => {
    const bytes = Uint8Array.from(atob(STATEMENT_PDF), (c) => c.charCodeAt(0));
    return URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
  }, []);
}

const RECEIPT_SVG = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="480" height="640" viewBox="0 0 480 640"><rect width="480" height="640" fill="#fff"/><text x="40" y="80" font-family="sans-serif" font-size="28">Receipt</text><text x="40" y="140" font-family="sans-serif" font-size="18">Standing desk     $899.00</text><text x="40" y="180" font-family="sans-serif" font-size="18">Monitor arm       $185.00</text><text x="40" y="240" font-family="sans-serif" font-size="20">Total            $1,084.00</text></svg>',
)}`;

const CONTRACT_TXT = `data:text/plain;charset=utf-8,${encodeURIComponent(
  'SUPPLY AGREEMENT\n\n1. Parties. This agreement is between Northwind Supply Ltd and the buyer.\n\n2. Term. Twelve months from the start date, renewing for a further twelve unless either party gives sixty days notice.\n\n3. Payment. Invoices are due thirty days from issue.\n'.repeat(4),
)}`;

const meta = {
  title: 'Components/DocumentViewer',
  component: DocumentViewer,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  argTypes: {
    type: { control: 'inline-radio', options: ['auto', 'pdf', 'image', 'text'] },
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
    return <DocumentViewer {...args} src={src} type="pdf" title="Statement, October 2026" fileName="statement.pdf" />;
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

/** Inside AttachmentViewer, through its renderPreview slot. */
export const InAttachmentViewer: Story = {
  render: function Render() {
    const src = usePdfUrl();
    return (
      <AttachmentViewer
        open
        onOpenChange={() => {}}
        items={[{ id: 'statement', name: 'statement.pdf', kind: 'pdf', status: 'ready', src }]}
        renderPreview={(item) => (
          <DocumentViewer src={item.src ?? ''} title={item.name} type="pdf" height="fill" openInNewTab={false} />
        )}
      />
    );
  },
};
