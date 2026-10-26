import type { Meta, StoryObj } from '@storybook/react-vite';
import { CommandPaletteTrigger } from './CommandPaletteTrigger';

const meta = {
  title: 'Components/CommandPaletteTrigger',
  component: CommandPaletteTrigger,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    size: { control: 'radio', options: ['default', 'compact'] },
  },
} satisfies Meta<typeof CommandPaletteTrigger>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The field-dressed entry point, at the width its host gives it. */
export const Default: Story = {
  render: (args) => (
    <div style={{ width: 320 }}>
      <CommandPaletteTrigger {...args} style={{ width: '100%' }} />
    </div>
  ),
};

export const Compact: Story = {
  args: { size: 'compact' },
};

/** Folded to the icon, for a row with no room for the field. */
export const IconOnly: Story = {
  args: { iconOnly: true },
};

export const CustomPrompt: Story = {
  args: { label: 'Search the docs', shortcut: ['/'] },
};
