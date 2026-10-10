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
    logo: { control: 'text' },
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

/** A stand-in logo for the stories: one letter on a full-colour disc, as a favicon would sit. */
const mockLogo = (letter: string, fill: string) => (
  <svg viewBox="0 0 20 20" aria-hidden="true">
    <rect width="20" height="20" fill={fill} />
    <text
      x="10"
      y="10.5"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize="11"
      fontWeight="700"
      fill="var(--color-bg-page-primary)"
    >
      {letter}
    </text>
  </svg>
);

/** With no number, the source's logo fills the leading slot, cropped to a circle. */
export const WithLogo: Story = {
  args: {
    logo: mockLogo('I', 'var(--color-chart-series-4)'),
    title: 'Interface annual review',
  },
};

/** With neither a number nor a logo, the slot falls back to a globe. */
export const GlobeFallback: Story = {
  args: {
    title: 'Interface annual review',
  },
};

/** The three leading slots side by side: number, logo, globe. */
export const LeadingSlots: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--gap-200)' }}>
      <SourceChip index={1} title="Design tokens quarterly" />
      <SourceChip logo={mockLogo('T', 'var(--color-chart-series-5)')} title="Theming layered systems" />
      <SourceChip logo={mockLogo('P', 'var(--color-chart-series-7)')} title="The primitives handbook" />
      <SourceChip title="Layout systems memo" />
    </div>
  ),
};

/** An excerpt gives the chip a preview panel on hover, focus or press. With no href it renders as a button. */
export const WithPreview: Story = {
  args: {
    index: 1,
    title: 'Design tokens quarterly',
    source: 'tokens.example.com',
    meta: 'Updated 3 days ago',
    excerpt:
      'A semantic token names a role and points at a primitive. Change the primitive once and every component that reads the role follows.',
  },
  decorators: [
    (Story) => (
      <div style={{ paddingTop: '160px' }}>
        <Story />
      </div>
    ),
  ],
};

/** A linked chip keeps its preview: the panel carries an outbound arrow and the chip still navigates. */
export const LinkWithPreview: Story = {
  args: {
    ...WithPreview.args,
    index: 2,
    href: 'https://example.com/design-tokens-quarterly',
  },
  decorators: WithPreview.decorators,
};

/** A numbered chip keeps its number; the logo leads the preview's top line instead. */
export const PreviewWithLogo: Story = {
  args: {
    ...WithPreview.args,
    logo: mockLogo('T', 'var(--color-chart-series-5)'),
  },
  decorators: WithPreview.decorators,
};

/** The intended footer usage: a wrap row of numbered sources under an answer. */
export const SourcesRow: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--gap-400)',
        maxWidth: '480px',
      }}
    >
      <p style={{ margin: 0 }}>
        Semantic tokens resolve to primitives, so a consumer can override one
        primitive and have the change cascade through every component that
        references it.
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--gap-100)' }}>
        <SourceChip index={1} title="Design tokens quarterly" href="https://example.com/tokens" />
        <SourceChip index={2} title="Theming layered systems" href="https://example.com/theming" />
        <SourceChip index={3} title="The primitives handbook" href="https://example.com/primitives" />
      </div>
    </div>
  ),
};
