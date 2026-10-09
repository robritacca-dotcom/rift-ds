import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { Composer } from './Composer';
import type { ComposerProps } from './Composer';
import { useAttachments } from '../Attachment/useAttachments';
import type { AttachmentItem } from '../Attachment/fileTypes';
import { CircularButton } from '../CircularButton/CircularButton';
import { ModelPicker } from '../ModelPicker/ModelPicker';
import { DOCUMENT_FIRST_PAGE, PHOTO_LANDSCAPE } from '../../stories/attachment-fixtures';
import { PromptSuggestions } from '../PromptSuggestions/PromptSuggestions';

const meta = {
  title: 'Components/Composer',
  component: Composer,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    value: { control: 'text' },
    defaultValue: { control: 'text' },
    streaming: { control: 'boolean' },
    aiGlow: { control: 'boolean' },
    maxRows: { control: 'number' },
    sendLabel: { control: 'text' },
    stopLabel: { control: 'text' },
  },
  args: {
    placeholder: 'Message the agent',
  },
  decorators: [
    (Story) => (
      <div style={{ width: '560px', maxWidth: '100%' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Composer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/**
 * With `aiGlow`, focusing the composer replaces the plain selected border
 * with AiButton's signature: the glow blooms out of the send corner and the
 * ring fades up a beat behind it; blur collapses it back. Click into the
 * field to see it.
 */
export const AiGlow: Story = {
  args: {
    aiGlow: true,
  },
};

/** While a response streams, send becomes stop and Enter is inert. */
export const Streaming: Story = {
  args: {
    streaming: true,
    onStop: () => {},
  },
};

/**
 * `aiGlow` and `streaming` together: the gradient ring stays lit and keeps
 * turning while the agent works, whether or not the field holds focus.
 * Either prop alone behaves as before.
 */
export const WorkingGlow: Story = {
  args: {
    aiGlow: true,
    streaming: true,
    onStop: () => {},
  },
};

/**
 * The `context` chip: a full-width, non-interactive note at the top of the
 * shell telling the person what the model is currently looking at. Composer
 * owns the chrome; the caller passes the text.
 */
export const WithContext: Story = {
  args: {
    aiGlow: true,
    context: 'Looking at “Release notes”',
    contextIcon: 'description',
  },
};

/** The context chip lifted out of the shell into its own bar above it. */
export const WithContextAbove: Story = {
  args: {
    aiGlow: true,
    context: 'Looking at “Release notes”',
    contextIcon: 'description',
    contextPlacement: 'above',
  },
};

const QUEUED: AttachmentItem[] = [
  { id: 'photo', name: 'site-visit.png', kind: 'image', size: 830_000, status: 'ready', previewSrc: PHOTO_LANDSCAPE },
  { id: 'brief', name: 'launch-brief.pdf', kind: 'pdf', size: 1_200_000, status: 'ready', previewSrc: DOCUMENT_FIRST_PAGE },
  { id: 'costs', name: 'costs-q3.xlsx', kind: 'spreadsheet', size: 88_000, status: 'ready' },
  { id: 'deck', name: 'Q4 kickoff deck.pptx', kind: 'presentation', size: 5_600_000, status: 'ready' },
  { id: 'plan', name: 'Q4 plan.key', kind: 'generic', size: 3_400_000, status: 'ready' },
];

/**
 * The queue is controlled: Composer draws `files` and reports what was
 * picked, pasted, dropped or removed. `useAttachments` owns the list here,
 * as it would in an app.
 */
const FilesDemo = (args: ComposerProps) => {
  const [value, setValue] = useState('');
  const attachments = useAttachments();
  return (
    <Composer
      placeholder="Ask about these files"
      {...args}
      value={value}
      onValueChange={setValue}
      files={attachments.items}
      onFilesSelected={(files) => {
        args.onFilesSelected?.(files);
        attachments.add(files);
      }}
      onFileRemove={attachments.remove}
      pasteThreshold={args.pasteThreshold}
      onPasteAsAttachment={(text) => {
        args.onPasteAsAttachment?.(text);
        attachments.addText(text);
      }}
      onSubmit={(text) => {
        args.onSubmit?.(text);
        attachments.clear();
        setValue('');
      }}
    />
  );
};

/** Queued files sit in a row of square tiles that scrolls sideways. */
export const WithFiles: Story = {
  render: () => {
    const Demo = () => {
      const [files, setFiles] = useState(QUEUED);
      return (
        <Composer
          placeholder="Ask about these files"
          files={files}
          onFilesSelected={() => {}}
          onFileRemove={(id) => setFiles((prev) => prev.filter((file) => file.id !== id))}
          actions={<ModelPicker models={[{ value: 'a', label: 'Sonnet 5.5' }]} placement="top" />}
        />
      );
    };
    return <Demo />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const list = canvas.getByRole('list', { name: 'Attachments' });
    await expect(within(list).getAllByRole('listitem')).toHaveLength(5);

    // Removing a file moves focus to the one that took its place
    await userEvent.click(canvas.getByRole('button', { name: 'Remove launch-brief.pdf' }));
    await expect(within(list).getAllByRole('listitem')).toHaveLength(4);
    await waitFor(() =>
      expect(canvas.getByRole('button', { name: 'Remove costs-q3.xlsx' })).toHaveFocus(),
    );
    await expect(canvas.getByRole('status')).toHaveTextContent('Removed launch-brief.pdf');
    (document.activeElement as HTMLElement).blur();
  },
};

/** While a file uploads, the send button waits for it. */
export const Uploading: Story = {
  args: {
    defaultValue: 'Summarise the brief',
    onFilesSelected: fn(),
    files: [
      QUEUED[1],
      { id: 'up', name: 'costs-q3.xlsx', kind: 'spreadsheet', status: 'uploading', progress: 40 },
      { id: 'bad', name: 'old-export.csv', kind: 'spreadsheet', status: 'error' },
    ],
    onFileRemove: fn(),
  },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('button', { name: 'Send message' })).toBeDisabled();
  },
};

/** The attach button opens the picker; what is chosen comes back through `onFilesSelected`. */
export const PickingFiles: Story = {
  args: { onFilesSelected: fn(), onSubmit: fn() },
  render: (args) => <FilesDemo {...args} />,
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: 'Attach files' })).toBeInTheDocument();
    const send = canvas.getByRole('button', { name: 'Send message' });
    await expect(send).toBeDisabled();

    const input = canvasElement.querySelector('.ds-composer__file-input') as HTMLInputElement;
    const file = new File(['%PDF'], 'contract.pdf', { type: 'application/pdf' });
    await userEvent.upload(input, file);
    await expect(args.onFilesSelected).toHaveBeenCalledWith([file]);
    await expect(await canvas.findByText('contract.pdf', { selector: '.ds-attachment-tile__sr-only' })).toBeInTheDocument();

    // A file alone is a message: send is live with no text, and submits an empty string
    await waitFor(() => expect(send).toBeEnabled());
    await userEvent.click(send);
    await expect(args.onSubmit).toHaveBeenCalledWith('');
    await waitFor(() => expect(canvas.queryByRole('list', { name: 'Attachments' })).not.toBeInTheDocument());
  },
};

const transfer = (files: File[], text?: string) => {
  const data = new DataTransfer();
  for (const file of files) data.items.add(file);
  if (text !== undefined) data.setData('text/plain', text);
  return data;
};

/* Real events, dispatched by hand: the test library's fireEvent records its
   arguments by cloning them, and a DataTransfer does not survive the copy. */
const paste = (target: Element, files: File[], text?: string) =>
  target.dispatchEvent(
    new ClipboardEvent('paste', { bubbles: true, cancelable: true, clipboardData: transfer(files, text) }),
  );

const drag = (target: Element, type: 'dragenter' | 'drop', files: File[]) =>
  target.dispatchEvent(
    new DragEvent(type, { bubbles: true, cancelable: true, dataTransfer: transfer(files) }),
  );

/** Files can be pasted into the textarea or dropped on the shell. */
export const PasteAndDrop: Story = {
  args: { onFilesSelected: fn() },
  render: (args) => <FilesDemo {...args} />,
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByRole('textbox');
    const shell = canvasElement.querySelector('.ds-composer') as HTMLElement;

    const pasted = new File(['a'], 'screenshot.png', { type: 'image/png' });
    paste(textarea, [pasted]);
    await waitFor(() =>
      expect(args.onFilesSelected).toHaveBeenLastCalledWith([expect.objectContaining({ name: 'screenshot.png' })]),
    );

    const dropped = new File(['b'], 'notes.md', { type: 'text/markdown' });
    drag(shell, 'dragenter', [dropped]);
    await waitFor(() => expect(shell).toHaveClass('ds-composer--dragging'));
    drag(shell, 'drop', [dropped]);
    await waitFor(() =>
      expect(args.onFilesSelected).toHaveBeenLastCalledWith([expect.objectContaining({ name: 'notes.md' })]),
    );
    await waitFor(() => expect(shell).not.toHaveClass('ds-composer--dragging'));

    const list = await canvas.findByRole('list', { name: 'Attachments' });
    await expect(within(list).getAllByRole('listitem')).toHaveLength(2);
    await expect(canvas.getByRole('status')).toHaveTextContent('Attached notes.md');
  },
};

/** With `pasteThreshold` set, a long paste becomes a tile instead of flooding the field. */
export const LongPaste: Story = {
  args: { onFilesSelected: fn(), pasteThreshold: 200, onPasteAsAttachment: fn() },
  render: (args) => <FilesDemo {...args} />,
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByRole('textbox') as HTMLTextAreaElement;
    const long = 'Paid time off policy (2026). '.repeat(12);

    paste(textarea, [], 'short note');
    await expect(args.onPasteAsAttachment).not.toHaveBeenCalled();

    paste(textarea, [], long);
    await expect(args.onPasteAsAttachment).toHaveBeenCalledWith(long);
    await expect(textarea.value).toBe('');
    await expect(await canvas.findByRole('list', { name: 'Attachments' })).toBeInTheDocument();
  },
};

/**
 * Both action slots: leading actions on the left of the bar, trailing
 * actions on the right beside the send button.
 */
export const WithActions: Story = {
  args: {
    actions: <CircularButton icon="tune" variant="tertiary" ariaLabel="Options" />,
    trailingActions: <CircularButton icon="mic" variant="tertiary" ariaLabel="Dictate" />,
  },
};

/** Past `maxRows` the textarea stops growing and scrolls internally. */
export const MaxRows: Story = {
  args: {
    maxRows: 4,
    defaultValue: [
      'Draft the release notes for 2.4.',
      'Cover the new alignment options,',
      'the keyboard shortcuts,',
      'the fixed focus trap,',
      'and the deprecation of the old palette prop.',
      'Keep it under 200 words.',
    ].join('\n'),
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    defaultValue: 'Waiting for the session to reconnect',
  },
};

/** The intended stack: a PromptSuggestions row above the Composer. */
const FullChatFooterDemo = () => {
  const [value, setValue] = useState('');

  const suggestions = [
    { id: 'summarise', label: 'Summarise this thread' },
    { id: 'draft', label: 'Draft a reply' },
    { id: 'actions', label: 'List action items' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <PromptSuggestions
        suggestions={suggestions}
        onValueChange={(id) =>
          setValue(suggestions.find((s) => s.id === id)?.label ?? '')
        }
      />
      <Composer
        placeholder="Message the agent"
        value={value}
        onValueChange={setValue}
        onSubmit={() => setValue('')}
      />
    </div>
  );
};

export const FullChatFooter: Story = {
  render: () => <FullChatFooterDemo />,
};
