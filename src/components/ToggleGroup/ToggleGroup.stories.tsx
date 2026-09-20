import type { Meta, StoryObj } from '@storybook/react-vite';
import { ToggleGroup } from './ToggleGroup';

const meta = {
  title: 'Components/ToggleGroup',
  component: ToggleGroup,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['default', 'compact'] },
    variant: { control: 'select', options: ['primary', 'neutral'] },
    multiple: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
} satisfies Meta<typeof ToggleGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TextItems: Story = {
  args: {
    items: [
      { value: 'left', label: 'Left' },
      { value: 'center', label: 'Center' },
      { value: 'right', label: 'Right' },
    ],
    value: 'center',
  },
};

export const IconItems: Story = {
  args: {
    items: [
      { value: 'bold', label: 'format_bold', icon: true },
      { value: 'italic', label: 'format_italic', icon: true },
      { value: 'underline', label: 'format_underlined', icon: true },
    ],
    value: ['bold'],
    multiple: true,
  },
};

export const Compact: Story = {
  args: {
    items: [
      { value: 'grid', label: 'grid_view', icon: true },
      { value: 'list', label: 'view_list', icon: true },
    ],
    value: 'grid',
    size: 'compact',
  },
};

export const Neutral: Story = {
  args: {
    items: [
      { value: 'left', label: 'Left' },
      { value: 'center', label: 'Center' },
      { value: 'right', label: 'Right' },
    ],
    value: 'center',
    variant: 'neutral',
  },
};

export const Disabled: Story = {
  args: {
    items: [
      { value: 'a', label: 'Option A' },
      { value: 'b', label: 'Option B' },
      { value: 'c', label: 'Option C' },
    ],
    value: 'a',
    disabled: true,
  },
};

export const AllVariants: Story = {
  args: { items: [] },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'flex-start' }}>
      <ToggleGroup
        items={[
          { value: 'left', label: 'Left' },
          { value: 'center', label: 'Center' },
          { value: 'right', label: 'Right' },
        ]}
        value="center"
      />
      <ToggleGroup
        items={[
          { value: 'bold', label: 'format_bold', icon: true },
          { value: 'italic', label: 'format_italic', icon: true },
          { value: 'underline', label: 'format_underlined', icon: true },
        ]}
        value={['bold', 'italic']}
        multiple
      />
      <ToggleGroup
        items={[
          { value: 'grid', label: 'grid_view', icon: true },
          { value: 'list', label: 'view_list', icon: true },
        ]}
        value="grid"
        size="compact"
      />
    </div>
  ),
};
