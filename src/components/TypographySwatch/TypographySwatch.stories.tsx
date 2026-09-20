import type { Meta, StoryObj } from '@storybook/react-vite';
import { TypographySwatch } from './TypographySwatch';

const meta = {
  title: 'Components/TypographySwatch',
  component: TypographySwatch,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    name: {
      control: 'text',
    },
    weight: {
      control: 'text',
    },
    size: {
      control: 'text',
    },
    lineHeight: {
      control: 'text',
    },
    letterSpacing: {
      control: 'text',
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '700px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TypographySwatch>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Mega 1 — largest display style */
export const Mega1: Story = {
  args: {
    name: 'Mega 1',
    weight: 'Light',
    size: '132',
    lineHeight: '85%',
    letterSpacing: '2%',
    previewStyle: {
      fontFamily: "'Nunito Sans', sans-serif",
      fontSize: '132px',
      fontWeight: 300,
      lineHeight: 0.85,
      letterSpacing: '0.02em',
    },
  },
};

/** Display 2 — medium display style */
export const Display2: Story = {
  args: {
    name: 'Display 2',
    weight: 'Light',
    size: '64',
    lineHeight: '100%',
    letterSpacing: '1.5%',
    previewStyle: {
      fontFamily: "'Nunito Sans', sans-serif",
      fontSize: '64px',
      fontWeight: 300,
      lineHeight: 1,
      letterSpacing: '0.015em',
    },
  },
};

/** Heading 2 — section heading style */
export const Heading2: Story = {
  args: {
    name: 'Heading 2',
    weight: 'SemiBold',
    size: '26',
    lineHeight: '32px',
    letterSpacing: '1.5%',
    previewStyle: {
      fontFamily: "'Nunito Sans', sans-serif",
      fontSize: '26px',
      fontWeight: 600,
      lineHeight: '32px',
      letterSpacing: '0.015em',
    },
  },
};

/** Paragraph — body text style */
export const Paragraph: Story = {
  args: {
    name: 'Paragraph',
    weight: 'Regular',
    size: '16',
    lineHeight: '24px',
    letterSpacing: '0',
    previewStyle: {
      fontFamily: "'Nunito Sans', sans-serif",
      fontSize: '16px',
      fontWeight: 400,
      lineHeight: '24px',
      letterSpacing: '0',
    },
  },
};
