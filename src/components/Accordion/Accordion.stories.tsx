import type { Meta, StoryObj } from '@storybook/react-vite';
import { Accordion } from './Accordion';

const sampleItems = [
  {
    id: '1',
    title: 'What is a design system?',
    content: (
      <p>
        A design system is a collection of reusable components, guided by clear standards, that can be assembled to build any number of applications consistently and efficiently.
      </p>
    ),
  },
  {
    id: '2',
    title: 'Why use tokens?',
    content: (
      <p>
        Tokens store design decisions — colours, spacing, typography — as named variables so every component stays in sync when values change.
      </p>
    ),
  },
  {
    id: '3',
    title: 'How do I contribute?',
    content: (
      <p>
        Open a pull request with your component or token change. Make sure it follows the naming conventions and includes Storybook stories.
      </p>
    ),
  },
];

const meta = {
  title: 'Components/Accordion',
  component: Accordion,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    multiple: { control: 'boolean' },
  },
  args: {
    items: sampleItems,
    multiple: false,
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '520px', width: '100%' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const DefaultExpanded: Story = {
  args: {
    defaultExpanded: ['1'],
  },
};

export const Multiple: Story = {
  args: {
    multiple: true,
    defaultExpanded: ['1', '3'],
  },
};

export const SingleItem: Story = {
  args: {
    items: [sampleItems[0]],
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '520px' }}>
      <Accordion items={sampleItems} />
      <Accordion items={sampleItems} multiple defaultExpanded={['1', '2']} />
    </div>
  ),
};
