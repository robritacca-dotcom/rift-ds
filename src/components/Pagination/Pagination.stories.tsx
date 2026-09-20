import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Pagination } from './Pagination';

const meta = {
  title: 'Components/Pagination',
  component: Pagination,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    page: { control: 'number' },
    pageCount: { control: 'number' },
    siblingCount: {
      control: 'number',
    },
    size: {
      control: 'select',
      options: ['default', 'compact'],
    },
  },
  args: {
    page: 1,
    pageCount: 10,
    onPageChange: () => {},
  },
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Interactive wrapper so pages actually change when clicked */
const Interactive = (props: React.ComponentProps<typeof Pagination>) => {
  const [page, setPage] = useState(props.page);
  return <Pagination {...props} page={page} onPageChange={setPage} />;
};

export const Default: Story = {
  render: (args) => <Interactive {...args} />,
};

export const ManyPages: Story = {
  args: {
    page: 12,
    pageCount: 24,
  },
  render: (args) => <Interactive {...args} />,
};

export const WiderSiblings: Story = {
  args: {
    page: 12,
    pageCount: 24,
    siblingCount: 2,
  },
  render: (args) => <Interactive {...args} />,
};

export const LastPage: Story = {
  args: {
    page: 10,
    pageCount: 10,
  },
  render: (args) => <Interactive {...args} />,
};

export const Compact: Story = {
  args: {
    page: 3,
    pageCount: 12,
    size: 'compact',
  },
  render: (args) => <Interactive {...args} />,
};

export const FewPages: Story = {
  args: {
    page: 2,
    pageCount: 3,
  },
  render: (args) => <Interactive {...args} />,
};
