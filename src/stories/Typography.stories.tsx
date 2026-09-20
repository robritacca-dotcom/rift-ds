import type { Meta, StoryObj } from '@storybook/react-vite';

// This is a foundations documentation page that deliberately renders every
// heading level side by side to show the scale. Skipped levels are the point of
// the demo, not a defect, so heading-order is disabled here only.
const a11yHeadingOrderOff = {
  a11y: { config: { rules: [{ id: 'heading-order', enabled: false }] } },
};

const meta = {
  title: 'Foundations/Typography',
  tags: ['autodocs'],
  parameters: {
    ...a11yHeadingOrderOff,
    layout: 'padded',
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// Typography style component
const TypographyStyle = ({
  title,
  varPrefix,
  example = 'The quick brown fox jumps over the lazy dog',
}: {
  title: string;
  varPrefix: string;
  example?: string;
}) => {
  const family = getComputedStyle(document.documentElement)
    .getPropertyValue(`--font-${varPrefix}-family`)
    .trim();
  const size = getComputedStyle(document.documentElement)
    .getPropertyValue(`--font-${varPrefix}-size`)
    .trim();
  const weight = getComputedStyle(document.documentElement)
    .getPropertyValue(`--font-${varPrefix}-weight`)
    .trim();
  const lineHeight = getComputedStyle(document.documentElement)
    .getPropertyValue(`--font-${varPrefix}-line-height`)
    .trim();
  const letterSpacing = getComputedStyle(document.documentElement)
    .getPropertyValue(`--font-${varPrefix}-letter-spacing`)
    .trim();

  return (
    <div
      style={{
        marginBottom: '48px',
        paddingBottom: '32px',
        borderBottom: '1px solid var(--color-bg-container-border)',
      }}
    >
      {/* Style Name */}
      <h4
        style={{
          fontSize: '14px',
          fontWeight: 700,
          color: 'var(--color-text-primary)',
          marginBottom: '8px',
          fontFamily: 'monospace',
        }}
      >
        {title}
      </h4>

      {/* Token Details */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px',
          marginBottom: '24px',
          padding: '16px',
          backgroundColor: 'var(--color-bg-container-primary)',
          borderRadius: '8px',
        }}
      >
        <div>
          <div
            style={{
              fontSize: '11px',
              color: 'var(--color-text-tertiary)',
              marginBottom: '4px',
            }}
          >
            Family
          </div>
          <div
            style={{
              fontSize: '13px',
              color: 'var(--color-text-primary)',
              fontFamily: 'monospace',
            }}
          >
            {family || 'Nunito Sans'}
          </div>
        </div>
        <div>
          <div
            style={{
              fontSize: '11px',
              color: 'var(--color-text-tertiary)',
              marginBottom: '4px',
            }}
          >
            Size
          </div>
          <div
            style={{
              fontSize: '13px',
              color: 'var(--color-text-primary)',
              fontFamily: 'monospace',
            }}
          >
            {size}
          </div>
        </div>
        <div>
          <div
            style={{
              fontSize: '11px',
              color: 'var(--color-text-tertiary)',
              marginBottom: '4px',
            }}
          >
            Weight
          </div>
          <div
            style={{
              fontSize: '13px',
              color: 'var(--color-text-primary)',
              fontFamily: 'monospace',
            }}
          >
            {weight}
          </div>
        </div>
        <div>
          <div
            style={{
              fontSize: '11px',
              color: 'var(--color-text-tertiary)',
              marginBottom: '4px',
            }}
          >
            Line Height
          </div>
          <div
            style={{
              fontSize: '13px',
              color: 'var(--color-text-primary)',
              fontFamily: 'monospace',
            }}
          >
            {lineHeight}
          </div>
        </div>
        <div>
          <div
            style={{
              fontSize: '11px',
              color: 'var(--color-text-tertiary)',
              marginBottom: '4px',
            }}
          >
            Letter Spacing
          </div>
          <div
            style={{
              fontSize: '13px',
              color: 'var(--color-text-primary)',
              fontFamily: 'monospace',
            }}
          >
            {letterSpacing}
          </div>
        </div>
      </div>

      {/* Example Text */}
      <div
        style={{
          fontFamily: `var(--font-${varPrefix}-family)`,
          fontSize: `var(--font-${varPrefix}-size)`,
          fontWeight: `var(--font-${varPrefix}-weight)`,
          lineHeight: `var(--font-${varPrefix}-line-height)`,
          letterSpacing: `var(--font-${varPrefix}-letter-spacing)`,
          color: 'var(--color-text-primary)',
        }}
      >
        {example}
      </div>
    </div>
  );
};

// Display Styles Story
export const DisplayStyles: Story = {
  render: () => (
    <div style={{ maxWidth: '1200px' }}>
      <h2
        style={{
          fontSize: '24px',
          fontWeight: 700,
          color: 'var(--color-text-primary)',
          marginBottom: '12px',
        }}
      >
        Display Typography
      </h2>
      <p
        style={{
          fontSize: '14px',
          color: 'var(--color-text-secondary)',
          marginBottom: '48px',
          lineHeight: '1.5',
        }}
      >
        Large display text for hero sections, marketing pages, and major
        headlines. All styles use Nunito Sans Light (300 weight). The display
        tier steps down automatically below 768px — the sizes shown resolve at
        the current viewport.
      </p>

      <TypographyStyle
        title="Mega 1"
        varPrefix="mega-1"
        example="Mega Display"
      />
      <TypographyStyle
        title="Mega 2"
        varPrefix="mega-2"
        example="Mega Display"
      />
      <TypographyStyle
        title="Display 1"
        varPrefix="display-1"
        example="Display Headline"
      />
      <TypographyStyle
        title="Display 2"
        varPrefix="display-2"
        example="Display Headline"
      />
      <TypographyStyle
        title="Sub Display"
        varPrefix="sub-display"
        example="Sub Display Headline"
      />
    </div>
  ),
};

// Heading Styles Story
export const HeadingStyles: Story = {
  render: () => (
    <div style={{ maxWidth: '1200px' }}>
      <h2
        style={{
          fontSize: '24px',
          fontWeight: 700,
          color: 'var(--color-text-primary)',
          marginBottom: '12px',
        }}
      >
        Heading Typography
      </h2>
      <p
        style={{
          fontSize: '14px',
          color: 'var(--color-text-secondary)',
          marginBottom: '48px',
          lineHeight: '1.5',
        }}
      >
        Heading styles for section titles and content hierarchy. All styles use
        Nunito Sans SemiBold (600 weight).
      </p>

      <TypographyStyle
        title="Heading 1"
        varPrefix="heading-1"
        example="This is a Heading 1"
      />
      <TypographyStyle
        title="Heading 2"
        varPrefix="heading-2"
        example="This is a Heading 2"
      />
      <TypographyStyle
        title="Heading 3"
        varPrefix="heading-3"
        example="This is a Heading 3"
      />
    </div>
  ),
};

// Body Text Styles Story
export const BodyTextStyles: Story = {
  render: () => (
    <div style={{ maxWidth: '1200px' }}>
      <h2
        style={{
          fontSize: '24px',
          fontWeight: 700,
          color: 'var(--color-text-primary)',
          marginBottom: '12px',
        }}
      >
        Body Text Typography
      </h2>
      <p
        style={{
          fontSize: '14px',
          color: 'var(--color-text-secondary)',
          marginBottom: '48px',
          lineHeight: '1.5',
        }}
      >
        Body text styles for content, labels, and UI text. Uses both Regular
        (400) and SemiBold (600) weights.
      </p>

      <TypographyStyle
        title="Title Body"
        varPrefix="title-body"
        example="This is title body text used for emphasized content and labels"
      />
      <TypographyStyle
        title="Paragraph"
        varPrefix="paragraph"
        example="This is paragraph text for body content. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris."
      />
      <TypographyStyle
        title="Overline"
        varPrefix="overline"
        example="THE UPPERCASE LABEL FACE"
      />
      <TypographyStyle
        title="Caption"
        varPrefix="caption"
        example="This is caption text, the floor of the scale, for footnotes and disclaimers only"
      />
    </div>
  ),
};

// Code Style Story — the one sanctioned monospace context
export const CodeStyle: Story = {
  render: () => (
    <div style={{ maxWidth: '1200px' }}>
      <h2
        style={{
          fontSize: '24px',
          fontWeight: 700,
          color: 'var(--color-text-primary)',
          marginBottom: '12px',
        }}
      >
        Code Typography
      </h2>
      <p
        style={{
          fontSize: '14px',
          color: 'var(--color-text-secondary)',
          marginBottom: '48px',
          lineHeight: '1.5',
        }}
      >
        The system mono stack, codified as <code>--font-family-code</code>.
        Used by CodeBlock, ToolCall names, and Prose inline code — Nunito Sans
        everywhere else. Sizing rides the Paragraph SM scale; only the family
        changes.
      </p>

      <div
        style={{
          fontFamily: 'var(--font-family-code)',
          fontSize: 'var(--font-paragraph-sm-size)',
          fontWeight: 'var(--font-paragraph-sm-weight)',
          lineHeight: 'var(--font-paragraph-sm-line-height)',
          color: 'var(--color-text-primary)',
          padding: '16px',
          backgroundColor: 'var(--color-bg-container-primary)',
          borderRadius: '8px',
        }}
      >
        const tokens = generateRegistry(&apos;src/tokens/tokens-light.css&apos;);
      </div>
    </div>
  ),
};

// All Typography Styles
export const AllStyles: Story = {
  render: () => (
    <div style={{ maxWidth: '1200px' }}>
      <h2
        style={{
          fontSize: '24px',
          fontWeight: 700,
          color: 'var(--color-text-primary)',
          marginBottom: '12px',
        }}
      >
        Complete Typography System
      </h2>
      <p
        style={{
          fontSize: '14px',
          color: 'var(--color-text-secondary)',
          marginBottom: '48px',
          lineHeight: '1.5',
        }}
      >
        All typography styles from the Figma design system. Font: Nunito Sans.
        Every style chains its family through one of two role tokens — the
        display and heading tiers read <code>--font-family-heading</code>, the
        body tiers read <code>--font-family-body</code> — and both resolve to{' '}
        <code>--font-family-primary</code>, so this system stays a single face
        while consumers can split heading and body faces by overriding the
        roles.
      </p>

      <div style={{ marginBottom: '64px' }}>
        <h3
          style={{
            fontSize: '18px',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            marginBottom: '32px',
            paddingBottom: '8px',
            borderBottom: '2px solid var(--color-bg-container-border)',
          }}
        >
          Display Styles
        </h3>
        <TypographyStyle
          title="Mega 1"
          varPrefix="mega-1"
          example="Mega"
        />
        <TypographyStyle
          title="Mega 2"
          varPrefix="mega-2"
          example="Mega"
        />
        <TypographyStyle
          title="Display 1"
          varPrefix="display-1"
          example="Display"
        />
        <TypographyStyle
          title="Display 2"
          varPrefix="display-2"
          example="Display"
        />
        <TypographyStyle
          title="Sub Display"
          varPrefix="sub-display"
          example="Sub Display"
        />
      </div>

      <div style={{ marginBottom: '64px' }}>
        <h3
          style={{
            fontSize: '18px',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            marginBottom: '32px',
            paddingBottom: '8px',
            borderBottom: '2px solid var(--color-bg-container-border)',
          }}
        >
          Headings
        </h3>
        <TypographyStyle
          title="Heading 1"
          varPrefix="heading-1"
          example="Heading 1"
        />
        <TypographyStyle
          title="Heading 2"
          varPrefix="heading-2"
          example="Heading 2"
        />
        <TypographyStyle
          title="Heading 3"
          varPrefix="heading-3"
          example="Heading 3"
        />
      </div>

      <div>
        <h3
          style={{
            fontSize: '18px',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            marginBottom: '32px',
            paddingBottom: '8px',
            borderBottom: '2px solid var(--color-bg-container-border)',
          }}
        >
          Body Text
        </h3>
        <TypographyStyle
          title="Title Body"
          varPrefix="title-body"
          example="Title body text for labels and emphasis"
        />
        <TypographyStyle
          title="Paragraph"
          varPrefix="paragraph"
          example="Paragraph text for body content. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
        />
        <TypographyStyle
          title="Overline"
          varPrefix="overline"
          example="OVERLINE"
        />
        <TypographyStyle
          title="Caption"
          varPrefix="caption"
          example="Caption"
        />
      </div>
    </div>
  ),
};
