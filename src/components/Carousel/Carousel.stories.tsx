import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Carousel } from './Carousel';

const slideStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '240px',
  borderRadius: '8px',
  fontSize: '24px',
  fontWeight: 600,
  color: 'var(--color-text-primary)',
};

const slides = [
  { bg: 'var(--color-status-info-bg)', label: 'Slide 1' },
  { bg: 'var(--color-status-positive-bg)', label: 'Slide 2' },
  { bg: 'var(--color-status-warning-bg)', label: 'Slide 3' },
  { bg: 'var(--color-status-error-bg)', label: 'Slide 4' },
];

const meta = {
  title: 'Components/Carousel',
  component: Carousel,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    showDots: { control: 'boolean' },
    showArrows: { control: 'boolean' },
    autoPlay: { control: 'boolean' },
    autoPlayInterval: { control: 'number' },
    loop: { control: 'boolean' },
  },
  args: {
    onSlideChange: fn(),
    showDots: true,
    showArrows: true,
    autoPlay: false,
    loop: false,
  },
  decorators: [
    (Story) => (
      <div style={{ width: '480px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Carousel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: undefined,
  },
  render: (args) => (
    <Carousel {...args}>
      {slides.map((slide, i) => (
        <div key={i} style={{ ...slideStyle, backgroundColor: slide.bg }}>
          {slide.label}
        </div>
      ))}
    </Carousel>
  ),
};

export const WithoutArrows: Story = {
  args: {
    showArrows: false,
  },
  render: (args) => (
    <Carousel {...args}>
      {slides.map((slide, i) => (
        <div key={i} style={{ ...slideStyle, backgroundColor: slide.bg }}>
          {slide.label}
        </div>
      ))}
    </Carousel>
  ),
};

export const WithoutDots: Story = {
  args: {
    showDots: false,
  },
  render: (args) => (
    <Carousel {...args}>
      {slides.map((slide, i) => (
        <div key={i} style={{ ...slideStyle, backgroundColor: slide.bg }}>
          {slide.label}
        </div>
      ))}
    </Carousel>
  ),
};

export const AutoPlay: Story = {
  args: {
    autoPlay: true,
    autoPlayInterval: 3000,
    loop: true,
  },
  render: (args) => (
    <Carousel {...args}>
      {slides.map((slide, i) => (
        <div key={i} style={{ ...slideStyle, backgroundColor: slide.bg }}>
          {slide.label}
        </div>
      ))}
    </Carousel>
  ),
};

export const Loop: Story = {
  args: {
    loop: true,
  },
  render: (args) => (
    <Carousel {...args}>
      {slides.map((slide, i) => (
        <div key={i} style={{ ...slideStyle, backgroundColor: slide.bg }}>
          {slide.label}
        </div>
      ))}
    </Carousel>
  ),
};

export const SingleSlide: Story = {
  args: {},
  render: (args) => (
    <Carousel {...args}>
      <div style={{ ...slideStyle, backgroundColor: 'var(--color-status-info-bg)' }}>
        Only one slide
      </div>
    </Carousel>
  ),
};

export const ImageSlides: Story = {
  args: {
    loop: true,
  },
  render: (args) => (
    <Carousel {...args}>
      {[1, 2, 3].map((n) => (
        <img
          key={n}
          src={`https://picsum.photos/seed/${n}/480/240`}
          alt={`Sample ${n}`}
          style={{ width: '100%', height: '240px', objectFit: 'cover', display: 'block' }}
        />
      ))}
    </Carousel>
  ),
};
