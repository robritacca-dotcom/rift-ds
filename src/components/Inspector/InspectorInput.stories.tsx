import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { InspectorInput } from './InspectorInput';

const meta = {
  title: 'Components/InspectorInput',
  component: InspectorInput,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['default', 'compact'] },
    disabled: { control: 'boolean' },
  },
  args: {
    label: 'Product name',
    placeholder: 'Acme Corp',
  },
  decorators: [
    (Story) => (
      <div style={{ width: 280 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof InspectorInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Compact: Story = {
  args: { size: 'compact' },
};

export const Filled: Story = {
  args: { defaultValue: 'Northwind' },
};

/** The name is the field's real label: a click on it focuses the field. */
export const LabelFocusesField: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByText('Product name'));
    await expect(canvas.getByRole('textbox', { name: 'Product name' })).toHaveFocus();
  },
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: 'Northwind' },
};
