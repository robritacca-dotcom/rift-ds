import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, screen, waitFor } from 'storybook/test';
import { Lightbox } from './Lightbox';
import { Button } from '../Button/Button';
import { PHOTO_LANDSCAPE, PHOTO_PORTRAIT, PHOTOS } from '../../stories/attachment-fixtures';

// The sample pictures every attachment and media story draws from, bundled
// files, so the stories never touch the network.
const SHOTS = [
  { src: PHOTO_LANDSCAPE, alt: 'A figure in a glowing canyon below snowy peaks', caption: 'A lone figure at the mouth of the canyon.' },
  { src: PHOTOS[3], alt: 'A blue beam of light rising over dark cliffs', caption: 'A beam of light over the falls at night.' },
  { src: PHOTO_PORTRAIT, alt: 'A green mountain split by a long crack', caption: 'A fault running up a green peak, at its own tall shape.' },
];

const meta = {
  title: 'Components/Lightbox',
  component: Lightbox,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    dismissible: { control: 'boolean' },
    caption: { control: 'text' },
  },
  args: {
    open: false,
    onOpenChange: () => {},
  },
} satisfies Meta<typeof Lightbox>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Trigger + lightbox wrapper so stories are openable */
const LightboxDemo = (
  props: Omit<React.ComponentProps<typeof Lightbox>, 'open' | 'onOpenChange'>,
) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button label="View image" variant="secondary" onClick={() => setOpen(true)} />
      <Lightbox {...props} open={open} onOpenChange={setOpen} />
    </>
  );
};

export const Default: Story = {
  render: (args) => <LightboxDemo {...args} src={SHOTS[0].src} alt={SHOTS[0].alt} />,
  // The modal contract, end to end: open, page inert behind the panel,
  // Escape closes, focus returns to the trigger. Ends closed, so the
  // snapshot matches the resting state.
  play: async ({ canvas, canvasElement, userEvent }) => {
    const trigger = await canvas.findByRole('button', { name: 'View image' });
    await userEvent.click(trigger);

    const viewer = await screen.findByRole('dialog', { name: 'A figure in a glowing canyon below snowy peaks' });
    await expect(viewer).toBeVisible();

    const storyRoot = canvasElement.closest<HTMLElement>('body > *');
    await expect(storyRoot?.inert).toBe(true);

    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(screen.queryByRole('dialog', { name: 'A figure in a glowing canyon below snowy peaks' })).toBeNull(),
    );
    await expect(storyRoot?.inert).toBe(false);
    await expect(trigger).toHaveFocus();
  },
};

export const WithCaption: Story = {
  render: (args) => (
    <LightboxDemo {...args} src={SHOTS[0].src} alt={SHOTS[0].alt} caption={SHOTS[0].caption} />
  ),
};

export const Gallery: Story = {
  render: (args) => {
    const Demo = () => {
      const [open, setOpen] = useState(false);
      const [index, setIndex] = useState(0);
      const shot = SHOTS[index];
      const count = SHOTS.length;
      return (
        <>
          <Button label="Open gallery" variant="secondary" onClick={() => setOpen(true)} />
          <Lightbox
            {...args}
            open={open}
            onOpenChange={setOpen}
            src={shot.src}
            alt={shot.alt}
            caption={shot.caption}
            onPrev={() => setIndex((i) => (i - 1 + count) % count)}
            onNext={() => setIndex((i) => (i + 1) % count)}
          />
        </>
      );
    };
    return <Demo />;
  },
  // Gallery stepping: the chevrons and the arrow keys both walk the set.
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(await canvas.findByRole('button', { name: 'Open gallery' }));
    await screen.findByRole('dialog', { name: 'A figure in a glowing canyon below snowy peaks' });

    await userEvent.click(screen.getByRole('button', { name: 'Next' }));
    await screen.findByRole('dialog', { name: 'A blue beam of light rising over dark cliffs' });

    await userEvent.keyboard('{ArrowRight}');
    await screen.findByRole('dialog', { name: 'A green mountain split by a long crack' });

    await userEvent.keyboard('{ArrowLeft}');
    await screen.findByRole('dialog', { name: 'A blue beam of light rising over dark cliffs' });

    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(screen.queryByRole('dialog', { name: 'A blue beam of light rising over dark cliffs' })).toBeNull(),
    );
  },
};

export const CustomMedia: Story = {
  render: (args) => (
    <LightboxDemo {...args} caption="Any media can live in the viewer — not just an <img>.">
      <video
        controls
        muted
        poster={PHOTOS[5]}
        style={{ borderRadius: '12px' }}
        aria-label="Product walkthrough"
      />
    </LightboxDemo>
  ),
};
