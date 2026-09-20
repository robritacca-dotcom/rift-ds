import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { ContactCard } from './ContactCard';

const meta = {
  title: 'Components/ContactCard',
  component: ContactCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    value: { control: 'text' },
    href: { control: 'text' },
    icon: { control: 'text' },
    logo: { control: 'text' },
    external: { control: 'boolean' },
    copyable: { control: 'boolean' },
    onCopy: { action: 'copied' },
  },
  args: {
    onCopy: fn(),
  },
} satisfies Meta<typeof ContactCard>;

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================
// With Material Symbol icon
// ============================================

export const WithIcon: Story = {
  args: {
    label: 'Email',
    value: 'hello@example.com',
    href: 'mailto:hello@example.com',
    icon: 'mail',
    external: true,
    copyable: true,
  },
};

// ============================================
// With logo image
// ============================================

export const WithLogo: Story = {
  args: {
    label: 'LinkedIn',
    value: 'linkedin.com/company/example',
    href: 'https://www.linkedin.com/company/example/',
    logo: '/logos/LinkedIN.png',
    external: true,
    copyable: false,
  },
};

// ============================================
// External — open in new tab
// ============================================

export const External: Story = {
  args: {
    label: 'GitHub',
    value: 'github.com/example',
    href: 'https://github.com/example',
    logo: '/logos/Git.svg',
    external: true,
  },
};

// ============================================
// Internal — arrow_forward indicator
// ============================================

export const Internal: Story = {
  args: {
    label: 'Components',
    value: 'Browse the component library',
    href: '/components',
    icon: 'widgets',
    external: false,
  },
};

// ============================================
// Copyable
// ============================================

export const Copyable: Story = {
  args: {
    label: 'Email',
    value: 'hello@example.com',
    href: 'mailto:hello@example.com',
    icon: 'mail',
    external: true,
    copyable: true,
  },
};
