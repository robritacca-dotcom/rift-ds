import type { Meta, StoryObj } from '@storybook/react-vite';
import { Avatar } from './Avatar';
import { demoAvatar1, demoAvatar2, demoAvatar3 } from './demoAvatars';

const meta = {
  title: 'Components/Avatar',
  component: Avatar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    src: { control: 'text' },
    alt: { control: 'text' },
    name: { control: 'text' },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    status: {
      control: 'select',
      options: [undefined, 'online', 'away', 'offline', 'busy'],
    },
  },
  args: {
    size: 'md',
  },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithImage: Story = {
  args: {
    src: demoAvatar1,
    alt: 'Jane Doe',
  },
};

export const WithInitials: Story = {
  args: {
    name: 'Jane Doe',
  },
};

export const SingleName: Story = {
  args: {
    name: 'Jane',
  },
};

export const FallbackIcon: Story = {
  args: {},
};

export const ImageError: Story = {
  args: {
    src: 'https://invalid-url.example/photo.jpg',
    name: 'Fallback User',
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
      <Avatar size="sm" name="Small" />
      <Avatar size="md" name="Medium" />
      <Avatar size="lg" name="Large" />
    </div>
  ),
};

export const SizesWithImage: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
      <Avatar size="sm" src={demoAvatar2} alt="User" />
      <Avatar size="md" src={demoAvatar2} alt="User" />
      <Avatar size="lg" src={demoAvatar2} alt="User" />
    </div>
  ),
};

export const StatusOnline: Story = {
  args: {
    name: 'Jane Doe',
    status: 'online',
  },
};

export const StatusAway: Story = {
  args: {
    name: 'Jane Doe',
    status: 'away',
  },
};

export const StatusOffline: Story = {
  args: {
    name: 'Jane Doe',
    status: 'offline',
  },
};

export const StatusBusy: Story = {
  args: {
    name: 'Jane Doe',
    status: 'busy',
  },
};

export const AllStatuses: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px' }}>
      <Avatar name="Online" status="online" />
      <Avatar name="Away" status="away" />
      <Avatar name="Offline" status="offline" />
      <Avatar name="Busy" status="busy" />
    </div>
  ),
};

export const AllCombinations: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Avatar size="sm" src={demoAvatar3} status="online" alt="User" />
        <Avatar size="md" src={demoAvatar3} status="online" alt="User" />
        <Avatar size="lg" src={demoAvatar3} status="online" alt="User" />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Avatar size="sm" name="Jane Doe" status="away" />
        <Avatar size="md" name="Jane Doe" status="away" />
        <Avatar size="lg" name="Jane Doe" status="away" />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Avatar size="sm" status="offline" />
        <Avatar size="md" status="offline" />
        <Avatar size="lg" status="offline" />
      </div>
    </div>
  ),
};
