import type { Meta, StoryObj } from '@storybook/react-vite';
import { AvatarGroup } from './AvatarGroup';
import { Avatar } from '../Avatar/Avatar';

const team = (
  <>
    <Avatar name="Ada Lovelace" />
    <Avatar name="Grace Hopper" />
    <Avatar name="Alan Turing" />
    <Avatar name="Katherine Johnson" />
    <Avatar name="Edsger Dijkstra" />
    <Avatar name="Barbara Liskov" />
    <Avatar name="Donald Knuth" />
  </>
);

const meta = {
  title: 'Components/AvatarGroup',
  component: AvatarGroup,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    max: { control: { type: 'number', min: 1 } },
  },
  args: {
    children: team,
    'aria-label': 'Project members',
  },
} satisfies Meta<typeof AvatarGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const NoOverflow: Story = {
  args: {
    children: (
      <>
        <Avatar name="Ada Lovelace" />
        <Avatar name="Grace Hopper" />
        <Avatar name="Alan Turing" />
      </>
    ),
  },
};

export const Small: Story = {
  args: {
    size: 'sm',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
    max: 3,
  },
};

export const CustomOverflowLabel: Story = {
  args: {
    max: 4,
    overflowLabel: '3 more reviewers',
  },
};
