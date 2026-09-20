import type { Meta, StoryObj } from '@storybook/react-vite';
import { PromptSuggestions } from './PromptSuggestions';
import { Textarea } from '../Textarea/Textarea';

const meta = {
  title: 'Components/PromptSuggestions',
  component: PromptSuggestions,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    layout: {
      control: 'inline-radio',
      options: ['scroll', 'wrap', 'stack'],
    },
    size: {
      control: 'inline-radio',
      options: ['default', 'compact'],
    },
    ariaLabel: {
      control: 'text',
    },
  },
  args: {
    suggestions: [
      { id: 'plan', label: 'Plan a weekend trip' },
      { id: 'recipe', label: 'Suggest a dinner recipe' },
      { id: 'email', label: 'Draft a polite follow-up' },
      { id: 'explain', label: 'Explain this like I am five' },
    ],
  },
} satisfies Meta<typeof PromptSuggestions>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithIcons: Story = {
  args: {
    suggestions: [
      { id: 'ideas', label: 'Brainstorm ideas', icon: 'lightbulb' },
      { id: 'summarise', label: 'Summarise a document', icon: 'description' },
      { id: 'translate', label: 'Translate a phrase', icon: 'translate' },
      { id: 'code', label: 'Write a script', icon: 'code' },
    ],
  },
};

/** The quieter row, for placements alongside a live conversation. */
export const Compact: Story = {
  args: {
    size: 'compact',
    suggestions: [
      { id: 'shorter', label: 'Make it shorter' },
      { id: 'formal', label: 'More formal' },
      { id: 'example', label: 'Give an example' },
    ],
  },
};

/** Constrained width so the row scrolls and the edge fades show. */
export const Overflowing: Story = {
  args: {
    suggestions: [
      { id: 'trip', label: 'Plan a weekend trip' },
      { id: 'recipe', label: 'Suggest a dinner recipe' },
      { id: 'email', label: 'Draft a polite follow-up' },
      { id: 'quiz', label: 'Quiz me on capitals' },
      { id: 'poem', label: 'Write a short poem' },
      { id: 'budget', label: 'Sketch a monthly budget' },
      { id: 'workout', label: 'Build a workout plan' },
      { id: 'story', label: 'Tell me a bedtime story' },
    ],
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '420px' }}>
        <Story />
      </div>
    ),
  ],
};

/**
 * One suggestion per line. For a narrow column, where a wrapped row breaks
 * wherever the labels run out of room and the ragged edge reads as an
 * accident rather than a list.
 */
export const Stacked: Story = {
  args: {
    layout: 'stack',
    suggestions: [
      { id: 'philosophy', label: "Describe the team's design philosophy" },
      { id: 'recent', label: 'What has the team shipped recently?' },
      { id: 'system', label: 'How does this design system work?' },
    ],
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '420px' }}>
        <Story />
      </div>
    ),
  ],
};

/**
 * The row waiting for its suggestions: shimmer placeholder pills hold the
 * chips' place while they are generated, at exactly the height the real
 * chips will land at.
 */
export const Pending: Story = {
  args: {
    pending: true,
    layout: 'stack',
    suggestions: [],
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '420px' }}>
        <Story />
      </div>
    ),
  ],
};

/** The hero variant: wrapped and centred for an empty conversation. */
export const Wrapped: Story = {
  args: {
    layout: 'wrap',
    suggestions: [
      { id: 'ideas', label: 'Brainstorm ideas', icon: 'lightbulb' },
      { id: 'summarise', label: 'Summarise a document', icon: 'description' },
      { id: 'translate', label: 'Translate a phrase', icon: 'translate' },
      { id: 'trip', label: 'Plan a weekend trip', icon: 'flight' },
      { id: 'recipe', label: 'Suggest a dinner recipe', icon: 'restaurant' },
    ],
    style: { justifyContent: 'center' },
  },
  decorators: [
    (Story) => (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'var(--gap-500)',
          maxWidth: '480px',
          margin: '0 auto',
          textAlign: 'center',
        }}
      >
        <p style={{ margin: 0, color: 'var(--color-text-secondary)' }}>
          What would you like to do today?
        </p>
        <Story />
      </div>
    ),
  ],
};

/** The row in its natural habitat, above a composer. */
export const AboveAComposer: Story = {
  render: (args) => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--gap-200)',
        maxWidth: '520px',
      }}
    >
      <PromptSuggestions {...args} />
      <Textarea aria-label="Message" placeholder="Message the assistant" resize="none" />
    </div>
  ),
};
