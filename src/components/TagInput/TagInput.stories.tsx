import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn } from 'storybook/test';
import { TagInput } from './TagInput';

const meta = {
  title: 'Components/TagInput',
  component: TagInput,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    placeholder: { control: 'text' },
    size: {
      control: 'select',
      options: ['default', 'compact'],
    },
    disabled: { control: 'boolean' },
    required: { control: 'boolean' },
    error: { control: 'boolean' },
    helperText: { control: 'text' },
    maxTags: { control: 'number' },
  },
  args: {
    label: 'Tags',
    placeholder: 'Add a tag...',
    onValuesChange: fn(),
    onChange: fn(),
  },
  decorators: [
    (Story) => (
      <div style={{ width: '320px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TagInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithDefaultValues: Story = {
  args: {
    defaultValues: ['design', 'tokens'],
  },
};

export const WithHelperText: Story = {
  args: {
    helperText: 'Press Enter or comma to add a tag',
  },
};

export const ErrorState: Story = {
  args: {
    defaultValues: ['not-a-topic'],
    error: true,
    helperText: 'One of these tags is not recognised',
  },
};

export const MaxTags: Story = {
  args: {
    defaultValues: ['one', 'two', 'three'],
    maxTags: 3,
    helperText: 'Up to 3 tags',
  },
};

export const Compact: Story = {
  args: {
    size: 'compact',
    defaultValues: ['compact'],
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    defaultValues: ['locked', 'read-only'],
  },
};

/**
 * Committing and removing from the keyboard: Enter and comma commit the
 * trimmed draft, a duplicate or empty draft adds nothing, Backspace on an
 * empty draft removes the last tag, and `maxTags` stops new entries.
 */
export const KeyboardEntry: Story = {
  args: {
    maxTags: 3,
  },
  play: async ({ canvas, userEvent, args }) => {
    const input = canvas.getByRole('textbox', { name: 'Tags' });
    const tagNames = () =>
      canvas
        .queryAllByRole('button', { name: /^Remove / })
        .map((button) => button.getAttribute('aria-label'));

    await userEvent.click(input);
    await userEvent.keyboard('  design  {Enter}');
    await expect(tagNames()).toEqual(['Remove design']);
    await expect(input).toHaveValue('');
    await expect(args.onValuesChange).toHaveBeenLastCalledWith(['design']);

    await userEvent.keyboard('tokens,');
    await expect(tagNames()).toEqual(['Remove design', 'Remove tokens']);
    await expect(input).toHaveValue('');

    // A duplicate clears the draft without adding; whitespace adds nothing,
    // and a comma after it clears the spaces too rather than leaving them.
    await userEvent.keyboard('design{Enter}');
    await expect(input).toHaveValue('');
    await userEvent.keyboard('   ,');
    await expect(tagNames()).toEqual(['Remove design', 'Remove tokens']);
    await expect(input).toHaveValue('');
    await expect(args.onValuesChange).toHaveBeenCalledTimes(2);

    // Backspace in a non-empty draft edits the draft, not the tags.
    await userEvent.keyboard('ab{Backspace}');
    await expect(input).toHaveValue('a');
    await expect(tagNames()).toHaveLength(2);
    await userEvent.keyboard('{Backspace}{Backspace}');
    await expect(input).toHaveValue('');
    await expect(tagNames()).toEqual(['Remove design']);
    await expect(args.onValuesChange).toHaveBeenLastCalledWith(['design']);

    // Fill to the limit, then a fourth entry is refused.
    await userEvent.keyboard('tokens{Enter}motion{Enter}');
    await expect(tagNames()).toHaveLength(3);
    const callsAtLimit = (args.onValuesChange as ReturnType<typeof fn>).mock.calls.length;
    await userEvent.keyboard('colour{Enter}');
    await expect(tagNames()).toEqual(['Remove design', 'Remove tokens', 'Remove motion']);
    await expect(args.onValuesChange).toHaveBeenCalledTimes(callsAtLimit);
  },
};
