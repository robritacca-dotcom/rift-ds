import type { Meta, StoryObj } from '@storybook/react-vite';
import { SplitPane } from './SplitPane';

const paneStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  minHeight: '240px',
};

const demoChildren = (
  <>
    <div style={paneStyle}>First pane</div>
    <div style={paneStyle}>Second pane</div>
  </>
);

const meta = {
  title: 'Components/SplitPane',
  component: SplitPane,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    direction: {
      control: 'select',
      options: ['horizontal', 'vertical'],
    },
    defaultSplit: { control: { type: 'range', min: 0, max: 100 } },
  },
  args: {
    children: demoChildren,
  },
  decorators: [
    (Story) => (
      <div style={{ height: '320px', border: '1px solid var(--color-bg-container-border)' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SplitPane>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Vertical: Story = {
  args: {
    direction: 'vertical',
  },
};

export const SidebarSplit: Story = {
  args: {
    defaultSplit: 25,
    minSplit: 15,
    maxSplit: 40,
    children: (
      <>
        <div style={paneStyle}>Sidebar</div>
        <div style={paneStyle}>Canvas</div>
      </>
    ),
  },
};

export const ScrollingPanes: Story = {
  args: {
    children: (
      <>
        <div
          tabIndex={0}
          role="region"
          aria-label="Rows"
          style={{ height: '100%', overflow: 'auto', padding: '16px' }}
        >
          {Array.from({ length: 24 }, (_, i) => (
            <p key={i}>List row {i + 1}</p>
          ))}
        </div>
        <div style={{ padding: '16px' }}>
          <p>A scrolling region is its own focusable container inside the pane.</p>
        </div>
      </>
    ),
  },
};
