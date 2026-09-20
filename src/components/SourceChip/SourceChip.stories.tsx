import type { Meta, StoryObj } from '@storybook/react-vite';
import { SourceChip } from './SourceChip';

const meta = {
  title: 'Components/SourceChip',
  component: SourceChip,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    icon: { control: 'text' },
    index: { control: 'number' },
  },
  args: {
    title: 'Design tokens quarterly',
  },
} satisfies Meta<typeof SourceChip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { index: 1 },
};

export const AsLink: Story = {
  args: {
    index: 2,
    title: 'The component API field guide',
    href: 'https://example.com/component-api-field-guide',
  },
};

export const WithIcon: Story = {
  args: {
    icon: 'language',
    title: 'Interface annual review',
  },
};

/** The intended footer usage: a wrap row of numbered sources under an answer. */
export const SourcesRow: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--gap-md)',
        maxWidth: '480px',
      }}
    >
      <p style={{ margin: 0 }}>
        Semantic tokens resolve to primitives, so a consumer can override one
        primitive and have the change cascade through every component that
        references it.
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--gap-xs)' }}>
        <SourceChip index={1} title="Design tokens quarterly" href="https://example.com/tokens" />
        <SourceChip index={2} title="Theming layered systems" href="https://example.com/theming" />
        <SourceChip index={3} title="The primitives handbook" href="https://example.com/primitives" />
      </div>
    </div>
  ),
};
