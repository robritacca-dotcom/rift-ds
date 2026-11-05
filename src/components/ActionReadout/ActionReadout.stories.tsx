import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { ActionReadout } from './ActionReadout';

/* All content here is fictional set dressing. */

const meta = {
  title: 'Components/ActionReadout',
  component: ActionReadout,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <div style={{ width: 360 }}>
        <Story />
      </div>
    ),
  ],
  args: {
    title: '12 projects archived',
    facts: [
      { label: 'Status', value: 'Active 9 · Paused 3 → Archived 12' },
      { label: 'Owners', value: '7' },
      { label: 'Storage freed', value: '4.2 GB' },
      { label: 'Left alone', value: '3 already archived' },
    ],
  },
} satisfies Meta<typeof ActionReadout>;

export default meta;
type Story = StoryObj<typeof meta>;

/** What a confirmed change did: each label is read with its value. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Storage freed').tagName).toBe('DT');
    await expect(canvas.getByText('4.2 GB').tagName).toBe('DD');
  },
};

/** With the action's mark beside the title. */
export const WithIcon: Story = {
  args: { icon: 'inventory_2' },
};

/** A long value wraps inside its column rather than widening the card. */
export const LongValues: Story = {
  args: {
    facts: [
      { label: 'Projects', value: 'Northwind launch, Contoso migration, Fabrikam onboarding and 9 more' },
      { label: 'Owners', value: '7' },
    ],
  },
};
