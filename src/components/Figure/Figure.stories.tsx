import type { Meta, StoryObj } from '@storybook/react-vite';
import { Figure } from './Figure';

/* Inline SVG placeholder so stories don't depend on network images */
const placeholder = (label: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450"><rect width="800" height="450" fill="#D6D6D6"/><text x="400" y="230" font-family="sans-serif" font-size="28" fill="#6D6D6D" text-anchor="middle">${label}</text></svg>`
  )}`;

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
    children: <img src={placeholder('Process image')} alt="Process placeholder" />,
  },
} satisfies Meta<typeof Figure>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: <img src={placeholder('Process image')} alt="Process placeholder" />,
  },
};

export const WithCaption: Story = {
  args: {
    children: <img src={placeholder('Generated output in 3D')} alt="Generated output" />,
    caption:
      'Generated output rendered in 3D — the full spatial result of a successful run.',
  },
};

export const Zoomable: Story = {
  args: {
    children: <img src={placeholder('Click to zoom')} alt="Zoomable" />,
    caption: 'Zoomable figure — clicking would open a lightbox.',
    onClick: () => {},
  },
};

export const NoCaption: Story = {
  args: {
    children: <img src={placeholder('Bare image')} alt="Bare" />,
  },
};
