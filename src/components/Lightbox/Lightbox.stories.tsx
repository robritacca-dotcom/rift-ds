import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, screen, waitFor } from 'storybook/test';
import { Lightbox } from './Lightbox';
import { Button } from '../Button/Button';

/** Offline demo image — a labelled gradient, so story tests never touch the network. */
const demoImage = (label: string, from: string, to: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="750">` +
      `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">` +
      `<stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/>` +
      `</linearGradient></defs>` +
      `<rect width="1200" height="750" fill="url(#g)"/>` +
      `<text x="600" y="390" font-family="sans-serif" font-size="64" fill="rgba(255,255,255,0.85)" text-anchor="middle">${label}</text>` +
      `</svg>`,
  )}`;

const SHOTS = [
  { src: demoImage('Dashboard', '#0E6E8F', '#052F3E'), alt: 'Dashboard overview', caption: 'The dashboard after the redesign.' },
  { src: demoImage('Detail view', '#9E47EF', '#1E47B0'), alt: 'Record detail view', caption: 'One record, fully expanded.' },
  { src: demoImage('Mobile', '#EF476F', '#552716'), alt: 'Mobile layout', caption: 'The same flow at phone width.' },
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

    const viewer = await screen.findByRole('dialog', { name: 'Dashboard overview' });
    await expect(viewer).toBeVisible();

    const storyRoot = canvasElement.closest<HTMLElement>('body > *');
    await expect(storyRoot?.inert).toBe(true);

    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(screen.queryByRole('dialog', { name: 'Dashboard overview' })).toBeNull(),
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
    await screen.findByRole('dialog', { name: 'Dashboard overview' });

    await userEvent.click(screen.getByRole('button', { name: 'Next' }));
    await screen.findByRole('dialog', { name: 'Record detail view' });

    await userEvent.keyboard('{ArrowRight}');
    await screen.findByRole('dialog', { name: 'Mobile layout' });

    await userEvent.keyboard('{ArrowLeft}');
    await screen.findByRole('dialog', { name: 'Record detail view' });

    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(screen.queryByRole('dialog', { name: 'Record detail view' })).toBeNull(),
    );
  },
};

export const CustomMedia: Story = {
  render: (args) => (
    <LightboxDemo {...args} caption="Any media can live in the viewer — not just an <img>.">
      <video
        controls
        muted
        poster={demoImage('Poster frame', '#118AB2', '#052F3E')}
        style={{ borderRadius: '12px' }}
        aria-label="Product walkthrough"
      />
    </LightboxDemo>
  ),
};
