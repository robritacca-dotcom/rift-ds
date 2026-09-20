import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Composer } from './Composer';
import { CircularButton } from '../CircularButton/CircularButton';
import { DocumentChip } from '../DocumentChip/DocumentChip';
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

/** The attachments row is fully controlled: the consumer owns the list and handles removal. */
const AttachmentsDemo = () => {
  const [files, setFiles] = useState([
    { id: 'brief', name: 'launch-brief.pdf', fileType: 'pdf' as const },
    { id: 'costs', name: 'costs-q3.xlsx', fileType: 'sheet' as const },
  ]);

  return (
    <Composer
      placeholder="Ask about these files"
      attachments={files.map((file) => (
        <DocumentChip
          key={file.id}
          name={file.name}
          fileType={file.fileType}
          size="compact"
          onRemove={() => setFiles((prev) => prev.filter((f) => f.id !== file.id))}
          removeLabel={`Remove ${file.name}`}
        />
      ))}
    />
  );
};

export const WithAttachments: Story = {
  render: () => <AttachmentsDemo />,
};

/**
 * Both action slots: leading actions on the left of the bar, trailing
 * actions on the right beside the send button.
 */
export const WithActions: Story = {
  args: {
    actions: <CircularButton icon="add" variant="tertiary" ariaLabel="Attach a file" />,
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
