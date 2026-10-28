import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn } from 'storybook/test';
import {
  QuestionCard,
  QuestionSummary,
  type QuestionCardAnswer,
  type QuestionCardProps,
  type QuestionCardQuestion,
} from './QuestionCard';

const FRAMEWORK: QuestionCardQuestion = {
  id: 'framework',
  prompt: 'Which framework?',
  options: [
    { value: 'next', label: 'Next.js' },
    { value: 'vite', label: 'Vite' },
    { value: 'remix', label: 'Remix' },
  ],
  other: true,
};

const SURFACES: QuestionCardQuestion = {
  id: 'surfaces',
  prompt: 'Which parts will you use?',
  mode: 'multi',
  options: [
    { value: 'components', label: 'Components', description: 'The React library' },
    { value: 'tokens', label: 'Tokens', description: 'The CSS custom properties alone' },
    { value: 'chat', label: 'The chat widget', description: 'With its server handler' },
  ],
  other: true,
};

const THEME: QuestionCardQuestion = {
  id: 'theme',
  prompt: 'Which look?',
  options: [
    { value: 'base', label: 'The base theme' },
    { value: 'preset', label: 'A shipped preset' },
    { value: 'own', label: 'My own brand' },
  ],
};

const meta = {
  title: 'Components/QuestionCard',
  component: QuestionCard,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    questions: [FRAMEWORK],
    onValuesChange: fn(),
  },
  decorators: [
    (Story) => (
      <div style={{ width: '480px', maxWidth: '100%' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof QuestionCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Controlled wiring, so every story shows the answered state it leads to. */
const Controlled = (props: QuestionCardProps) => {
  const [value, setValue] = useState<QuestionCardAnswer[] | undefined>(props.values);
  return (
    <QuestionCard
      {...props}
      values={value}
      onValuesChange={(answers) => {
        props.onValuesChange?.(answers);
        setValue(answers);
      }}
      onSkip={
        props.onSkip
          ? () => {
              props.onSkip?.();
              setValue([]);
            }
          : undefined
      }
    />
  );
};

/** One question, one answer: the tap is the answer, and the row stays marked once it is given. */
export const Default: Story = {
  render: (args) => <Controlled {...args} />,
  play: async ({ canvas, userEvent, args }) => {
    await expect(await canvas.findByText('Choose one')).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Vite' }));
    await expect(args.onValuesChange).toHaveBeenCalledWith([{ questionId: 'framework', values: ['vite'] }]);
    // Answered: the options stay as a record, no longer buttons.
    await expect(canvas.queryByRole('button', { name: 'Vite' })).toBeNull();
    await expect(canvas.getByText('Vite')).toBeVisible();
  },
};

/** "Something else" opens a field in place of the row; Enter sends what was written. */
export const SomethingElse: Story = {
  render: (args) => <Controlled {...args} />,
  play: async ({ canvas, userEvent, args }) => {
    await userEvent.click(await canvas.findByRole('button', { name: 'Something else' }));
    const field = canvas.getByRole('textbox', { name: 'Something else' });
    await expect(field).toHaveFocus();
    await userEvent.type(field, 'Astro{Enter}');
    await expect(args.onValuesChange).toHaveBeenCalledWith([
      { questionId: 'framework', values: [], other: 'Astro' },
    ]);
  },
};

/** Several answers: each option toggles, and Send waits for the first pick. */
export const MultiSelect: Story = {
  args: { questions: [SURFACES] },
  render: (args) => <Controlled {...args} />,
  play: async ({ canvas, userEvent, args }) => {
    await expect(await canvas.findByText('Choose one or more')).toBeVisible();
    const send = canvas.getByRole('button', { name: 'Send' });
    await expect(send).toBeDisabled();
    await userEvent.click(canvas.getByRole('button', { name: /Tokens/ }));
    await userEvent.click(canvas.getByRole('button', { name: /Components/ }));
    await expect(canvas.getByRole('button', { name: /Tokens/ })).toHaveAttribute('aria-pressed', 'true');
    await userEvent.click(send);
    // Reported in the options' order, not the tap order.
    await expect(args.onValuesChange).toHaveBeenCalledWith([
      { questionId: 'surfaces', values: ['components', 'tokens'] },
    ]);
  },
};

/** A cap on the picks: once two are on, the rest wait until one comes off. */
export const MultiSelectWithCap: Story = {
  args: { questions: [{ ...SURFACES, max: 2, other: false }] },
  render: (args) => <Controlled {...args} />,
  play: async ({ canvas, userEvent }) => {
    await expect(await canvas.findByText('Choose up to 2')).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: /Components/ }));
    await userEvent.click(canvas.getByRole('button', { name: /Tokens/ }));
    await expect(canvas.getByRole('button', { name: /chat widget/ })).toBeDisabled();
  },
};

/** A set asks one question at a time, with a count and a way back; it folds to a summary once sent. */
export const QuestionSet: Story = {
  args: { questions: [FRAMEWORK, SURFACES, THEME] },
  render: (args) => <Controlled {...args} />,
  play: async ({ canvas, userEvent, args }) => {
    await expect(await canvas.findByText('1 of 3')).toBeVisible();
    // A one-answer question in a set marks the pick and waits for Next.
    await userEvent.click(canvas.getByRole('button', { name: 'Next.js' }));
    await expect(canvas.getByText('1 of 3')).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Next' }));
    await expect(canvas.getByText('2 of 3')).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: /The chat widget/ }));
    await userEvent.click(canvas.getByRole('button', { name: 'Next' }));
    // The digits pick by position.
    await userEvent.keyboard('2');
    await expect(canvas.getByRole('button', { name: 'A shipped preset' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    await userEvent.click(canvas.getByRole('button', { name: 'Send' }));
    await expect(args.onValuesChange).toHaveBeenCalledWith([
      { questionId: 'framework', values: ['next'] },
      { questionId: 'surfaces', values: ['chat'] },
      { questionId: 'theme', values: ['preset'] },
    ]);
    await expect(canvas.getByText('Which parts will you use?')).toBeVisible();
    await expect(canvas.getByText('The chat widget')).toBeVisible();
  },
};

/** `onSkip` adds the way out, and a skipped card says so. */
export const Skippable: Story = {
  args: { questions: [FRAMEWORK, THEME], onSkip: fn() },
  render: (args) => <Controlled {...args} />,
  play: async ({ canvas, userEvent, args }) => {
    await userEvent.click(await canvas.findByRole('button', { name: 'Skip' }));
    await expect(args.onSkip).toHaveBeenCalled();
    await expect(canvas.getAllByText('Skipped')).toHaveLength(2);
  },
};

/** The answered record of one question: the pick marked, the rest dimmed. */
export const Answered: Story = {
  args: { values: [{ questionId: 'framework', values: ['vite'] }] },
};

/** The answered record of a set. */
export const AnsweredSet: Story = {
  args: {
    questions: [FRAMEWORK, SURFACES, THEME],
    values: [
      { questionId: 'framework', values: [], other: 'Astro' },
      { questionId: 'surfaces', values: ['components', 'tokens'] },
      { questionId: 'theme', values: ['own'] },
    ],
  },
};

/** The conversation moved on without an answer: the options stay, inert. */
export const Unanswered: Story = {
  args: { disabled: true },
};

/** A written answer carries the same mark as a picked option, and clearing it clears the mark. */
export const SomethingElseMarked: Story = {
  args: { questions: [SURFACES] },
  render: (args) => <Controlled {...args} />,
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(await canvas.findByRole('button', { name: 'Something else' }));
    const field = canvas.getByRole('textbox', { name: 'Something else' });
    const row = field.closest('.ds-question-card__other') as HTMLElement;
    // The mark is the real checkbox indicator, so its state is the box's
    // own checked modifier rather than a glyph name.
    const mark = () => row.querySelector('.ds-question-card__mark') as HTMLElement;
    await userEvent.type(field, 'Billing');
    await expect(mark()).toHaveClass('ds-checkbox__box--checked');
    await userEvent.clear(field);
    await expect(mark()).not.toHaveClass('ds-checkbox__box--checked');
  },
};

/** QuestionSummary on its own: the frameless variant a chat draws inside the bubble that sent the answers. */
export const SummaryPlain: Story = {
  render: () => (
    <div
      style={{
        padding: 'var(--padding-300) var(--padding-400)',
        borderRadius: 'var(--radius-600)',
        background: 'var(--color-chat-bubble-sent-bg)',
        color: 'var(--color-chat-bubble-sent-text)',
      }}
    >
      <QuestionSummary
        variant="plain"
        items={[
          { prompt: 'Which framework?', answers: ['Next.js'] },
          { prompt: 'Which parts will you use?', answers: ['Components', 'Tokens'] },
          { prompt: 'Which look?', answers: [] },
        ]}
      />
    </div>
  ),
};
