import type { Meta, StoryObj } from '@storybook/react-vite';
import { SectionTitle } from './SectionTitle';

const meta = {
  title: 'Components/SectionTitle',
  component: SectionTitle,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    trailing: { control: 'text' },
    divider: { control: 'boolean' },
  },
  args: {
    title: 'Section heading',
  },
  decorators: [
    (Story) => (
      <div style={{ width: '600px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SectionTitle>;

export default meta;
type Story = StoryObj<typeof meta>;

/* ============================================
   STORIES
   ============================================ */

/** Default section title with heading and divider */
export const Default: Story = {
  args: {
    title: 'Default',
  },
};

/** Section title with a trailing count */
export const WithCount: Story = {
  args: {
    title: 'Navigation icons',
    trailing: '24',
  },
};

/** Section title with a trailing text badge */
export const WithBadge: Story = {
  args: {
    title: 'Primary, compact',
    trailing: 'New',
  },
};

/** Divider-less variant, for headings above content that draws its own lines */
export const WithoutDivider: Story = {
  args: {
    title: 'Upcoming events',
    divider: false,
  },
};
