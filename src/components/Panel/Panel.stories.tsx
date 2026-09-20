import type { Meta, StoryObj } from '@storybook/react-vite';
import { Panel } from './Panel';

const meta = {
  title: 'Components/Panel',
  component: Panel,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    padding: {
      control: 'select',
      options: ['default', 'compact', 'none'],
    },
  },
  args: {
    padding: 'default',
  },
  decorators: [
    (Story) => (
      <div style={{ width: '480px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Panel>;

export default meta;
type Story = StoryObj<typeof meta>;

/* ============================================
   SHARED CONTENT
   ============================================ */

const sampleContent = (
  <>
    <h3 style={{ margin: 0 }}>Fleet overview</h3>
    <p style={{ margin: 0 }}>
      Twelve harvesters are active across three orchards, with two idle and one
      flagged for maintenance.
    </p>
  </>
);

/* ============================================
   STORIES
   ============================================ */

export const Default: Story = {
  args: {
    children: sampleContent,
  },
};

export const Compact: Story = {
  args: {
    padding: 'compact',
    children: (
      <>
        <h3 style={{ margin: 0 }}>Queue depth</h3>
        <p style={{ margin: 0 }}>
          Fourteen jobs are waiting, and the oldest has been queued for two
          minutes.
        </p>
      </>
    ),
  },
};

export const Flush: Story = {
  args: {
    padding: 'none',
    children: (
      <>
        <h3 style={{ margin: 0 }}>Signal strength</h3>
        <p style={{ margin: 0 }}>
          Edge-to-edge content: the panel adds no padding of its own, so media
          or tables can reach the rounded corners.
        </p>
      </>
    ),
  },
};
