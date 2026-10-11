import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { Mention, MentionMenu, MentionText, filterMentionItems } from './Mention';
import type { MentionSource } from './Mention';
import { ChatMessage } from '../ChatMessage/ChatMessage';
import { Composer } from '../Composer/Composer';
import type { ComposerProps } from '../Composer/Composer';

const PEOPLE: MentionSource = {
  trigger: '@',
  label: 'People and files',
  items: [
    { id: 'mira', label: 'Mira Castellan', description: 'Design lead', icon: 'person' },
    { id: 'tobias', label: 'Tobias Renner', description: 'Platform', icon: 'person' },
    { id: 'ines', label: 'Ines Okonjo', description: 'Research', icon: 'person' },
    { id: 'roadmap', label: 'roadmap.md', description: 'Docs', icon: 'description' },
    { id: 'tokens', label: 'tokens.css', description: 'Source', icon: 'description' },
  ],
};

const SKILLS: MentionSource = {
  trigger: '/',
  label: 'Skills',
  items: [
    { id: 'ship', label: 'ship', description: 'Make finished work live' },
    { id: 'super-ship', label: 'super-ship', description: 'Audit, then ship' },
    { id: 'checkpoint', label: 'checkpoint', description: 'Save progress to a branch' },
    { id: 'park', label: 'park', description: 'Shelve the work for later' },
    { id: 'review', label: 'review', description: 'Read the diff for bugs', keywords: ['share'] },
    { id: 'status', label: 'status', description: 'Where things stand' },
    { id: 'summarize', label: 'summarize', description: 'The thread so far, in brief' },
    { id: 'translate', label: 'translate', description: 'Into another language' },
    { id: 'schedule', label: 'schedule', description: 'Run this later', disabled: true },
    { id: 'usage', label: 'usage', description: 'Where the tokens went' },
  ],
};

const SOURCES = [PEOPLE, SKILLS];

const meta = {
  title: 'Components/Mention',
  component: Mention,
  subcomponents: { MentionMenu, MentionText },
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    trigger: { control: 'inline-radio', options: ['@', '/'] },
    children: { control: 'text' },
  },
  args: {
    trigger: '@',
    children: 'Mira Castellan',
  },
} satisfies Meta<typeof Mention>;

export default meta;
type Story = StoryObj<typeof meta>;

/** An entity: `@` and a name. */
export const Default: Story = {};

/** A skill: `/` and a name. */
export const Skill: Story = {
  args: { trigger: '/', children: 'ship' },
};

/** In a sentence, the tag takes the type around it and adds only colour. */
export const InSentence: Story = {
  render: () => (
    <p
      style={{
        margin: 0,
        maxWidth: '36ch',
        font: 'inherit',
        color: 'var(--color-text-primary)',
      }}
    >
      Ask <Mention>Mira Castellan</Mention> to look over <Mention>roadmap.md</Mention>, then run{' '}
      <Mention trigger="/">ship</Mention>.
    </p>
  ),
};

/**
 * A sent message. `MentionText` takes the plain string and the sources, and
 * draws every mention it recognises. Nothing but the text is stored.
 */
export const InMessage: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div style={{ width: '560px', maxWidth: '100%' }}>
      <ChatMessage role="user">
        <MentionText
          text="/ship the thread changes once @Mira Castellan has read @roadmap.md"
          sources={SOURCES}
        />
      </ChatMessage>
    </div>
  ),
};

/** The menu `@` opens. It never takes focus: the field it serves keeps the caret. */
export const EntityMenu: Story = {
  render: () => <MentionMenu items={PEOPLE.items} activeId="mira" label="People and files" />,
};

/** The menu `/` opens, part-way through a word: the typed part of each name is drawn stronger. */
export const SkillMenu: Story = {
  render: () => (
    <MentionMenu
      items={filterMentionItems(SKILLS.items, 'sh')}
      activeId="ship"
      query="sh"
      label="Skills"
    />
  ),
};

/** A long list is cut mid-row and scrolls; a disabled item stays listed. */
export const LongMenu: Story = {
  render: () => <MentionMenu items={SKILLS.items} activeId="ship" label="Skills" />,
};

/** With `emptyText`, a query that matches nothing says so. Without it the menu renders nothing. */
export const EmptyMenu: Story = {
  render: () => <MentionMenu items={[]} emptyText="No matches" />,
};

const ComposerDemo = (args: ComposerProps) => {
  const [value, setValue] = useState(args.defaultValue ?? '');
  return (
    <div style={{ width: '560px', maxWidth: '100%', paddingTop: '280px' }}>
      <Composer
        {...args}
        defaultValue={undefined}
        value={value}
        onValueChange={setValue}
        onSubmit={(sent) => {
          args.onSubmit?.(sent);
          setValue('');
        }}
        mentions={SOURCES}
      />
    </div>
  );
};

/**
 * The whole pattern on Composer, through its `mentions` prop. Type `@` or
 * `/` at the start of a word. Arrows move, Enter or Tab writes the choice,
 * Escape closes the menu.
 */
export const InComposer: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <ComposerDemo
      placeholder="Type @ to mention, / for skills"
      defaultValue="/ship the thread changes once @Mira Castellan has read "
      onMentionSelect={fn()}
      onSubmit={fn()}
    />
  ),
};

const onMentionSelect = fn();

/** The keyboard contract, asserted. */
export const Keyboard: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <ComposerDemo
      placeholder="Type @ to mention, / for skills"
      onMentionSelect={onMentionSelect}
      onSubmit={fn()}
    />
  ),
  play: async ({ canvasElement }) => {
    onMentionSelect.mockClear();
    const canvas = within(canvasElement);
    const field = canvas.getByRole('textbox', { name: 'Message' }) as HTMLTextAreaElement;

    // A trigger at the start of a word opens that source's menu, focus unmoved
    await userEvent.type(field, 'Ask @');
    const people = await canvas.findByRole('listbox', { name: 'People and files' });
    await expect(field).toHaveFocus();
    await expect(within(people).getAllByRole('option')).toHaveLength(5);

    // Typing narrows it, and the field points at the highlighted row
    await userEvent.type(field, 'to');
    await expect(within(people).getAllByRole('option')).toHaveLength(2);
    const first = within(people).getByRole('option', { name: /Tobias Renner/ });
    await expect(first).toHaveAttribute('aria-selected', 'true');
    await expect(field).toHaveAttribute('aria-activedescendant', first.id);

    // Arrows move the highlight and wrap
    await userEvent.keyboard('{ArrowDown}');
    await expect(within(people).getByRole('option', { name: /tokens\.css/ })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await userEvent.keyboard('{ArrowDown}');
    await expect(first).toHaveAttribute('aria-selected', 'true');

    // Enter writes the choice and does not send
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(field).toHaveValue('Ask @Tobias Renner '));
    await expect(onMentionSelect).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'tobias' }),
      '@',
    );
    await expect(canvas.queryByRole('listbox')).not.toBeInTheDocument();
    await expect(field.selectionStart).toBe('Ask @Tobias Renner '.length);

    // The written name is drawn as a tag over the field
    const tag = canvasElement.querySelector('.ds-composer__backdrop .ds-mention');
    await expect(tag).toHaveTextContent('@Tobias Renner');

    // The other trigger opens the other source; Escape closes it and keeps the text
    await userEvent.type(field, 'to /sh');
    const skills = await canvas.findByRole('listbox', { name: 'Skills' });
    await expect(within(skills).getAllByRole('option')[0]).toHaveTextContent('ship');
    await userEvent.keyboard('{Escape}');
    await expect(canvas.queryByRole('listbox')).not.toBeInTheDocument();
    await expect(field).toHaveValue('Ask @Tobias Renner to /sh');

    // A trigger inside a word opens nothing
    await userEvent.clear(field);
    await userEvent.type(field, 'src/to');
    await expect(canvas.queryByRole('listbox')).not.toBeInTheDocument();

    // Rest: an empty field
    await userEvent.clear(field);
    field.blur();
  },
};
