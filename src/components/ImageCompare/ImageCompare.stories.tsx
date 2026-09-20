import type { Meta, StoryObj } from '@storybook/react-vite';
import { ImageCompare } from './ImageCompare';

// Self-contained SVG scenes so the stories (and the headless story tests)
// never touch the network. Same composition, two colour treatments.
const scene = (sky: string, hill: string, sun: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500">` +
      `<rect width="800" height="500" fill="${sky}"/>` +
      `<circle cx="620" cy="120" r="60" fill="${sun}"/>` +
      `<path d="M0 340 Q200 240 400 330 T800 310 V500 H0 Z" fill="${hill}"/>` +
      `</svg>`,
  )}`;

const draftScene = scene('#d8d8d8', '#a8a8a8', '#c2c2c2');
const finalScene = scene('#8ecae6', '#2a9d8f', '#ffb703');

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
    beforeAlt: 'Landscape illustration in greyscale',
    afterAlt: 'Landscape illustration in full colour',
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
