import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent } from 'storybook/test';
import { Checklist, type ChecklistItem } from './Checklist';
import { Button } from '../Button/Button';

const items: ChecklistItem[] = [
  { id: 'profile', label: 'Complete your profile', description: 'Add a photo and a short bio.', owner: { name: 'Ada Lovelace' } },
  { id: 'team', label: 'Invite your team', description: 'Bring in the people you work with.', owner: { name: 'Grace Hopper' }, action: <Button label="Invite" size="compact" variant="secondary" /> },
  { id: 'connect', label: 'Connect a data source', owner: { name: 'Alan Turing' } },
  { id: 'notify', label: 'Choose your notifications' },
  { id: 'publish', label: 'Publish your first page', description: 'Share it with your team or the world.' },
];

const meta = {
  title: 'Components/Checklist',
  component: Checklist,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'inline-radio', options: ['default', 'compact'] },
  },
  args: {
    title: 'Get set up',
    items,
    defaultValues: ['profile', 'team'],
    onValuesChange: fn(),
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '640px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Checklist>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Tasks to tick off, with the count done and a bar under the heading. Ticking one moves the count. */
export const Default: Story = {
  play: async ({ canvas, args }) => {
    await expect(canvas.getByRole('region', { name: 'Get set up' })).toBeInTheDocument();
    await expect(canvas.getByText('2 of 5 done')).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('checkbox', { name: 'Connect a data source' }));
    await expect(canvas.getByText('3 of 5 done')).toBeInTheDocument();
    await expect(args.onValuesChange).toHaveBeenLastCalledWith(['profile', 'team', 'connect']);
    // Back to the resting state.
    await userEvent.click(canvas.getByRole('checkbox', { name: 'Connect a data source' }));
    await expect(canvas.getByText('2 of 5 done')).toBeInTheDocument();
  },
};

/** The done marks reported, not edited: each row says whether it is done, in words. */
export const ReadOnly: Story = {
  args: { readOnly: true },
  play: async ({ canvas }) => {
    await expect(canvas.queryByRole('checkbox')).toBeNull();
    await expect(canvas.getAllByText(', Done', { exact: false })).toHaveLength(2);
    await expect(canvas.getByRole('img', { name: 'Owner: Ada Lovelace' })).toBeInTheDocument();
  },
};

/** Dense rows for a side panel. */
export const Compact: Story = {
  args: { size: 'compact', title: 'Before you publish', items: items.slice(2) },
};

/** No heading or count: the list on its own. */
export const ListOnly: Story = {
  args: { title: undefined, showProgress: false },
};
