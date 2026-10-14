import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { ArtifactCard } from './ArtifactCard';

/* All content here is fictional set dressing. */

const meta = {
  title: 'Components/ArtifactCard',
  component: ArtifactCard,
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
    title: 'Launch dashboard',
    meta: 'Dashboard',
    icon: 'space_dashboard',
    onClick: fn(),
  },
} satisfies Meta<typeof ArtifactCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** At rest: a press opens the artifact. */
export const Default: Story = {};

/** On stage: the card holds its fill and the cue offers the way back. */
export const Open: Story = {
  args: { open: true },
};

/** A name alone, with the default mark. */
export const TitleOnly: Story = {
  args: { meta: undefined, icon: undefined, title: 'Untitled document' },
};

/** A long name ends in an ellipsis rather than growing the card. */
export const LongTitle: Story = {
  args: { title: 'Quarterly launch readiness review, second draft with comments', meta: 'Document · 14 pages' },
};

export const Disabled: Story = {
  args: { disabled: true },
};

/** The card is a toggle: the host flips `open` and the card says which. */
export const Toggle: Story = {
  render: function Render(args) {
    const [open, setOpen] = useState(false);
    return <ArtifactCard {...args} open={open} onClick={() => setOpen((current) => !current)} />;
  },
  play: async ({ canvasElement }) => {
    const card = within(canvasElement).getByRole('button', { name: /Launch dashboard/ });
    await expect(card).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(card);
    await expect(card).toHaveAttribute('aria-pressed', 'true');
    /* End at rest, so the snapshot is the resting card. */
    await userEvent.click(card);
    await expect(card).toHaveAttribute('aria-pressed', 'false');
  },
};
