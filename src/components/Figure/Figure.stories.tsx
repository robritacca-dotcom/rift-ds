import type { Meta, StoryObj } from '@storybook/react-vite';
import { Figure } from './Figure';

import { PHOTO_LANDSCAPE, PHOTO_PORTRAIT, PHOTOS } from '../../stories/attachment-fixtures';

// The sample pictures every media story draws from, bundled files, so the
// stories never touch the network.

const meta = {
  title: 'Components/Figure',
  component: Figure,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    caption: { control: 'text' },
  },
  args: {
    children: <img src={PHOTO_LANDSCAPE} alt="A figure in a glowing canyon below snowy peaks" />,
  },
} satisfies Meta<typeof Figure>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: <img src={PHOTO_LANDSCAPE} alt="A figure in a glowing canyon below snowy peaks" />,
  },
};

export const WithCaption: Story = {
  args: {
    children: <img src={PHOTOS[2]} alt="A blue beam falling into a lake below a dark moon" />,
    caption:
      'Generated output rendered in 3D — the full spatial result of a successful run.',
  },
};

export const Zoomable: Story = {
  args: {
    children: <img src={PHOTO_PORTRAIT} alt="A green mountain split by a long crack" />,
    caption: 'Zoomable figure — clicking would open a lightbox.',
    onClick: () => {},
  },
};

export const NoCaption: Story = {
  args: {
    children: <img src={PHOTOS[4]} alt="Red light running through a dark valley" />,
  },
};
