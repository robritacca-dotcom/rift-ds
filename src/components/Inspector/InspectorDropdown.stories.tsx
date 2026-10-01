import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, screen } from 'storybook/test';
import { InspectorDropdown } from './InspectorDropdown';

const FACES = [
  { value: 'Match body', label: 'Match body' },
  { value: 'Serif', label: 'Serif', font: 'Georgia, serif' },
  { value: 'Monospace', label: 'Monospace', font: 'ui-monospace, monospace' },
];

const meta = {
  title: 'Components/InspectorDropdown',
  component: InspectorDropdown,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['default', 'compact'] },
    disabled: { control: 'boolean' },
  },
  args: {
    label: 'Headings',
    value: 'Match body',
    options: FACES,
  },
  decorators: [
    (Story) => (
      <div style={{ width: 280, paddingBottom: 160 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof InspectorDropdown>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Compact: Story = {
  args: { size: 'compact' },
};

/** The selected option's preview face carries into the bar. */
export const PreviewFace: Story = {
  args: { value: 'Serif' },
};

/** The whole bar opens Dropdown's own menu, named by the bar's label. */
export const OpensMenu: Story = {
  play: async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole('combobox', { name: 'Headings' });
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(screen.getByRole('option', { name: /Monospace/ })).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  },
};

export const Disabled: Story = {
  args: { disabled: true },
};
