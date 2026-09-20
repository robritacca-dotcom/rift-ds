import type { Meta, StoryObj } from '@storybook/react-vite';
import { EntityCard } from './EntityCard';
import '../../fonts/material-symbols.css';

const meta = {
  title: 'Components/EntityCard',
  component: EntityCard,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof EntityCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/* ============================================
   INDIVIDUAL STORIES
   ============================================ */

export const IconCard: Story = {
  args: {
    label: 'home',
    icon: 'home',
  },
};

export const ImageCard: Story = {
  args: {
    label: 'Figma',
    imageSrc: '/logos/Figma.svg',
    imageAlt: 'Figma',
  },
};

export const LongLabel: Story = {
  args: {
    label: 'notifications_active',
    icon: 'notifications_active',
  },
};

/* ============================================
   GRID — shows how cards look in a row
   ============================================ */

export const IconGrid: Story = {
  args: { label: '' },
  render: () => (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
      gap: 'var(--gap-lg, 20px)',
      maxWidth: 800,
    }}>
      {['home', 'search', 'settings', 'person', 'favorite', 'star'].map((name) => (
        <EntityCard key={name} label={name} icon={name} />
      ))}
    </div>
  ),
};

export const LogoGrid: Story = {
  args: { label: '' },
  render: () => (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
      gap: 'var(--gap-lg, 20px)',
      maxWidth: 800,
    }}>
      {[
        { label: 'Figma', src: '/logos/Figma.svg' },
        { label: 'Claude', src: '/logos/Claude.svg' },
        { label: 'Storybook', src: '/logos/storybook.svg' },
        { label: 'Vercel', src: '/logos/vercel white.svg' },
      ].map((logo) => (
        <EntityCard key={logo.label} label={logo.label} imageSrc={logo.src} imageAlt={logo.label} />
      ))}
    </div>
  ),
};
