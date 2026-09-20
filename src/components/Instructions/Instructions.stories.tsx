import type { Meta, StoryObj } from '@storybook/react-vite';
import { Instructions } from './Instructions';

const meta = {
  title: 'Components/Instructions',
  component: Instructions,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    direction: {
      control: 'select',
      options: ['vertical', 'horizontal'],
    },
    size: {
      control: 'select',
      options: ['default', 'compact'],
    },
    numbered: { control: 'boolean' },
  },
  args: {
    size: 'default',
    numbered: true,
  },
  decorators: [
    (Story) => (
      <div style={{ width: '480px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Instructions>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Getting started',
    steps: [
      { label: 'Install dependencies', description: 'Run npm install to set up the project.' },
      { label: 'Configure tokens', description: 'Import the token CSS files into your app entry point.' },
      { label: 'Import components', description: 'Start using components from the design system.' },
    ],
  },
};

export const WithIcons: Story = {
  args: {
    title: 'Setup pipeline',
    steps: [
      { label: 'Design in Figma', description: 'Create components and define tokens.', icon: 'palette' },
      { label: 'Generate code', description: 'Use Claude Code to read Figma via MCP.', icon: 'code' },
      { label: 'Deploy', description: 'Push to GitHub and auto-deploy to Vercel.', icon: 'rocket_launch' },
    ],
  },
};

export const NoDescriptions: Story = {
  args: {
    steps: [
      { label: 'Open Figma' },
      { label: 'Select component' },
      { label: 'Export tokens' },
      { label: 'Run build' },
    ],
  },
};

export const Horizontal: Story = {
  args: {
    steps: [
      { label: 'Design', icon: 'palette' },
      { label: 'Develop', icon: 'code' },
      { label: 'Test', icon: 'bug_report' },
      { label: 'Deploy', icon: 'rocket_launch' },
    ],
    direction: 'horizontal',
    numbered: false,
  },
};

export const Dots: Story = {
  args: {
    title: 'Process',
    numbered: false,
    steps: [
      { label: 'Draft', description: 'Create initial design exploration.' },
      { label: 'Review', description: 'Gather feedback from stakeholders.' },
      { label: 'Finalize', description: 'Lock design and hand off to engineering.' },
    ],
  },
};

// Compact
export const CompactDefault: Story = {
  args: {
    size: 'compact',
    title: 'Quick start',
    steps: [
      { label: 'Install', description: 'npm install @robr0/design-system' },
      { label: 'Import tokens', description: 'Add token CSS to your app' },
      { label: 'Use components', description: 'Import and render components' },
    ],
  },
};

export const CompactHorizontal: Story = {
  args: {
    size: 'compact',
    direction: 'horizontal',
    steps: [
      { label: 'Step 1', icon: 'edit' },
      { label: 'Step 2', icon: 'check' },
      { label: 'Step 3', icon: 'done_all' },
    ],
    numbered: false,
  },
};
