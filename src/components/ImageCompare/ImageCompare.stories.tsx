import type { Meta, StoryObj } from '@storybook/react-vite';
import { ImageCompare } from './ImageCompare';

import { PHOTO_LANDSCAPE, PHOTO_LANDSCAPE_MONO } from '../../stories/attachment-fixtures';

// The wide sample picture and its black-and-white copy, bundled files from
// the attachment fixtures, so the stories (and the headless story tests)
// never touch the network.
const draftScene = PHOTO_LANDSCAPE_MONO;
const finalScene = PHOTO_LANDSCAPE;

const meta = {
  title: 'Components/ImageCompare',
  component: ImageCompare,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    aspectRatio: { control: 'text' },
  },
  args: {
    beforeSrc: draftScene,
    afterSrc: finalScene,
    beforeAlt: 'A figure in a glowing canyon below snowy peaks, in black and white',
    afterAlt: 'The same canyon in colour',
  },
} satisfies Meta<typeof ImageCompare>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const CustomLabels: Story = {
  args: {
    beforeLabel: 'Draft',
    afterLabel: 'Final',
  },
};

export const StartPosition: Story = {
  args: {
    defaultPosition: 25,
  },
};

export const NoLabels: Story = {
  args: {
    showLabels: false,
  },
};

export const Wide: Story = {
  args: {
    aspectRatio: '21 / 9',
  },
};
