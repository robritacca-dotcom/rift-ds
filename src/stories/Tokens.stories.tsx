import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';

const meta = {
  title: 'Foundations/Tokens',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// Helper component to display color tokens
const ColorToken = ({ value }: { name: string; value: string }) => {
  const computedValue = getComputedStyle(document.documentElement)
    .getPropertyValue(value)
    .trim();

  return (
    <div style={{ marginBottom: '12px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <div
          style={{
            width: '80px',
            height: '40px',
            backgroundColor: `var(${value})`,
            border: '1px solid var(--color-bg-container-border)',
            borderRadius: '4px',
            flexShrink: 0,
          }}
        />
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: '13px',
              fontFamily: 'monospace',
              color: 'var(--color-text-primary)',
              fontWeight: 600,
            }}
          >
            {value}
          </div>
          <div
            style={{
              fontSize: '12px',
              color: 'var(--color-text-tertiary)',
              marginTop: '2px',
            }}
          >
            {computedValue}
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper component to display spacing tokens
const SpacingToken = ({ value }: { name: string; value: string }) => {
  const computedValue = getComputedStyle(document.documentElement)
    .getPropertyValue(value)
    .trim();

  return (
    <div style={{ marginBottom: '12px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <div
          style={{
            width: `var(${value})`,
            height: '40px',
            backgroundColor: 'var(--color-action-primary-bg)',
            borderRadius: '4px',
            flexShrink: 0,
            minWidth: '2px',
          }}
        />
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: '13px',
              fontFamily: 'monospace',
              color: 'var(--color-text-primary)',
              fontWeight: 600,
            }}
          >
            {value}
          </div>
          <div
            style={{
              fontSize: '12px',
              color: 'var(--color-text-tertiary)',
              marginTop: '2px',
            }}
          >
            {computedValue}
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper component to display border radius tokens
const RadiusToken = ({ value }: { name: string; value: string }) => {
  const computedValue = getComputedStyle(document.documentElement)
    .getPropertyValue(value)
    .trim();

  return (
    <div style={{ marginBottom: '12px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <div
          style={{
            width: '60px',
            height: '60px',
            backgroundColor: 'var(--color-action-primary-bg)',
            borderRadius: `var(${value})`,
            flexShrink: 0,
          }}
        />
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: '13px',
              fontFamily: 'monospace',
              color: 'var(--color-text-primary)',
              fontWeight: 600,
            }}
          >
            {value}
          </div>
          <div
            style={{
              fontSize: '12px',
              color: 'var(--color-text-tertiary)',
              marginTop: '2px',
            }}
          >
            {computedValue}
          </div>
        </div>
      </div>
    </div>
  );
};

// Section component
const TokenSection = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div style={{ marginBottom: '40px' }}>
    <h3
      style={{
        fontSize: '18px',
        fontWeight: 700,
        color: 'var(--color-text-primary)',
        marginBottom: '16px',
        borderBottom: '2px solid var(--color-bg-container-border)',
        paddingBottom: '8px',
      }}
    >
      {title}
    </h3>
    {children}
  </div>
);

// Primitives Story
export const Primitives: Story = {
  render: () => (
    <div style={{ maxWidth: '800px' }}>
      <h2
        style={{
          fontSize: '24px',
          fontWeight: 700,
          color: 'var(--color-text-primary)',
          marginBottom: '24px',
        }}
      >
        Primitive Tokens
      </h2>
      <p
        style={{
          fontSize: '14px',
          color: 'var(--color-text-secondary)',
          marginBottom: '32px',
          lineHeight: '1.5',
        }}
      >
        Raw values that are the source of truth. Do not use these directly in
        components; use semantic tokens instead.
      </p>

      <TokenSection title="Neutral Scale">
        <ColorToken name="00 (White)" value="--primitive-neutral-00" />
        <ColorToken name="01" value="--primitive-neutral-01" />
        <ColorToken name="02" value="--primitive-neutral-02" />
        <ColorToken name="03" value="--primitive-neutral-03" />
        <ColorToken name="04" value="--primitive-neutral-04" />
        <ColorToken name="05" value="--primitive-neutral-05" />
        <ColorToken name="06" value="--primitive-neutral-06" />
        <ColorToken name="07" value="--primitive-neutral-07" />
        <ColorToken name="08" value="--primitive-neutral-08" />
        <ColorToken name="09" value="--primitive-neutral-09" />
        <ColorToken name="10" value="--primitive-neutral-10" />
        <ColorToken name="11 (Black)" value="--primitive-neutral-11" />
      </TokenSection>

      <TokenSection title="True Black">
        <ColorToken name="True Black" value="--primitive-true-black" />
        <ColorToken name="Semi (50%)" value="--primitive-true-black-semi" />
        <ColorToken name="Strong (70%)" value="--primitive-true-black-strong" />
      </TokenSection>

      <TokenSection title="Red Scale">
        <ColorToken name="01 (Lightest)" value="--primitive-red-01" />
        <ColorToken name="02" value="--primitive-red-02" />
        <ColorToken name="03" value="--primitive-red-03" />
        <ColorToken name="04" value="--primitive-red-04" />
        <ColorToken name="05" value="--primitive-red-05" />
        <ColorToken name="06" value="--primitive-red-06" />
        <ColorToken name="07" value="--primitive-red-07" />
        <ColorToken name="08" value="--primitive-red-08" />
        <ColorToken name="09" value="--primitive-red-09" />
        <ColorToken name="10 (Darkest)" value="--primitive-red-10" />
      </TokenSection>

      <TokenSection title="Orange Scale">
        <ColorToken name="01 (Lightest)" value="--primitive-orange-01" />
        <ColorToken name="02" value="--primitive-orange-02" />
        <ColorToken name="03" value="--primitive-orange-03" />
        <ColorToken name="04" value="--primitive-orange-04" />
        <ColorToken name="05" value="--primitive-orange-05" />
        <ColorToken name="06" value="--primitive-orange-06" />
        <ColorToken name="07" value="--primitive-orange-07" />
        <ColorToken name="08" value="--primitive-orange-08" />
        <ColorToken name="09" value="--primitive-orange-09" />
        <ColorToken name="10 (Darkest)" value="--primitive-orange-10" />
      </TokenSection>

      <TokenSection title="Yellow Scale">
        <ColorToken name="01 (Lightest)" value="--primitive-yellow-01" />
        <ColorToken name="02" value="--primitive-yellow-02" />
        <ColorToken name="03" value="--primitive-yellow-03" />
        <ColorToken name="04" value="--primitive-yellow-04" />
        <ColorToken name="05" value="--primitive-yellow-05" />
        <ColorToken name="06" value="--primitive-yellow-06" />
        <ColorToken name="07" value="--primitive-yellow-07" />
        <ColorToken name="08" value="--primitive-yellow-08" />
        <ColorToken name="09" value="--primitive-yellow-09" />
        <ColorToken name="10 (Darkest)" value="--primitive-yellow-10" />
      </TokenSection>

      <TokenSection title="Green Scale">
        <ColorToken name="01 (Lightest)" value="--primitive-green-01" />
        <ColorToken name="02" value="--primitive-green-02" />
        <ColorToken name="03" value="--primitive-green-03" />
        <ColorToken name="04" value="--primitive-green-04" />
        <ColorToken name="05" value="--primitive-green-05" />
        <ColorToken name="06" value="--primitive-green-06" />
        <ColorToken name="07" value="--primitive-green-07" />
        <ColorToken name="08" value="--primitive-green-08" />
        <ColorToken name="09" value="--primitive-green-09" />
        <ColorToken name="10 (Darkest)" value="--primitive-green-10" />
      </TokenSection>

      <TokenSection title="Teal Scale">
        <ColorToken name="01 (Lightest)" value="--primitive-teal-01" />
        <ColorToken name="02" value="--primitive-teal-02" />
        <ColorToken name="03" value="--primitive-teal-03" />
        <ColorToken name="04" value="--primitive-teal-04" />
        <ColorToken name="05" value="--primitive-teal-05" />
        <ColorToken name="06" value="--primitive-teal-06" />
        <ColorToken name="07" value="--primitive-teal-07" />
        <ColorToken name="08" value="--primitive-teal-08" />
        <ColorToken name="09" value="--primitive-teal-09" />
        <ColorToken name="10 (Darkest)" value="--primitive-teal-10" />
      </TokenSection>

      <TokenSection title="Blue Scale">
        <ColorToken name="01 (Lightest)" value="--primitive-blue-01" />
        <ColorToken name="02" value="--primitive-blue-02" />
        <ColorToken name="03" value="--primitive-blue-03" />
        <ColorToken name="04" value="--primitive-blue-04" />
        <ColorToken name="05" value="--primitive-blue-05" />
        <ColorToken name="06" value="--primitive-blue-06" />
        <ColorToken name="07" value="--primitive-blue-07" />
        <ColorToken name="08" value="--primitive-blue-08" />
        <ColorToken name="09" value="--primitive-blue-09" />
        <ColorToken name="10 (Darkest)" value="--primitive-blue-10" />
      </TokenSection>

      <TokenSection title="Purple Scale">
        <ColorToken name="01 (Lightest)" value="--primitive-purple-01" />
        <ColorToken name="02" value="--primitive-purple-02" />
        <ColorToken name="03" value="--primitive-purple-03" />
        <ColorToken name="04" value="--primitive-purple-04" />
        <ColorToken name="05" value="--primitive-purple-05" />
        <ColorToken name="06" value="--primitive-purple-06" />
        <ColorToken name="07" value="--primitive-purple-07" />
        <ColorToken name="08" value="--primitive-purple-08" />
        <ColorToken name="09" value="--primitive-purple-09" />
        <ColorToken name="10 (Darkest)" value="--primitive-purple-10" />
      </TokenSection>

      <TokenSection title="Border Radius">
        <RadiusToken name="XXS" value="--primitive-radius-xxs" />
        <RadiusToken name="XS" value="--primitive-radius-xs" />
        <RadiusToken name="SM" value="--primitive-radius-sm" />
        <RadiusToken name="MD" value="--primitive-radius-md" />
        <RadiusToken name="LG" value="--primitive-radius-lg" />
        <RadiusToken name="XL" value="--primitive-radius-xl" />
        <RadiusToken name="Composer" value="--primitive-radius-composer" />
        <RadiusToken name="XXL" value="--primitive-radius-xxl" />
        <RadiusToken name="Full" value="--primitive-radius-full" />
      </TokenSection>

      <TokenSection title="Padding">
        <SpacingToken name="XXXS" value="--primitive-padding-xxxs" />
        <SpacingToken name="XXS" value="--primitive-padding-xxs" />
        <SpacingToken name="XS" value="--primitive-padding-xs" />
        <SpacingToken name="SM" value="--primitive-padding-sm" />
        <SpacingToken name="SM-MD" value="--primitive-padding-sm-md" />
        <SpacingToken name="MD" value="--primitive-padding-md" />
        <SpacingToken name="LG" value="--primitive-padding-lg" />
        <SpacingToken name="XL" value="--primitive-padding-xl" />
        <SpacingToken name="XXL" value="--primitive-padding-xxl" />
      </TokenSection>

      <TokenSection title="Border Width">
        <SpacingToken name="XS" value="--primitive-border-xs" />
        <SpacingToken name="MD" value="--primitive-border-md" />
      </TokenSection>

      <TokenSection title="Gap">
        <SpacingToken name="XXS" value="--primitive-gap-xxs" />
        <SpacingToken name="XS" value="--primitive-gap-xs" />
        <SpacingToken name="SM" value="--primitive-gap-sm" />
        <SpacingToken name="SM-MD" value="--primitive-gap-sm-md" />
        <SpacingToken name="MD" value="--primitive-gap-md" />
        <SpacingToken name="LG" value="--primitive-gap-lg" />
        <SpacingToken name="XL" value="--primitive-gap-xl" />
        <SpacingToken name="XXL" value="--primitive-gap-xxl" />
        <SpacingToken name="XXXL" value="--primitive-gap-xxxl" />
        <SpacingToken name="XXXXL" value="--primitive-gap-xxxxl" />
      </TokenSection>
    </div>
  ),
};

// Semantic Colors Story
export const SemanticColors: Story = {
  render: () => (
    <div style={{ maxWidth: '800px' }}>
      <h2
        style={{
          fontSize: '24px',
          fontWeight: 700,
          color: 'var(--color-text-primary)',
          marginBottom: '24px',
        }}
      >
        Semantic Color Tokens
      </h2>
      <p
        style={{
          fontSize: '14px',
          color: 'var(--color-text-secondary)',
          marginBottom: '32px',
          lineHeight: '1.5',
        }}
      >
        Theme-aware semantic tokens. These automatically switch between light
        and dark themes. Always use these in components.
      </p>

      <TokenSection title="Text Colors">
        <ColorToken name="Primary" value="--color-text-primary" />
        <ColorToken name="Secondary" value="--color-text-secondary" />
        <ColorToken name="Tertiary" value="--color-text-tertiary" />
        <ColorToken name="Inverse" value="--color-text-inverse" />
        <ColorToken name="On Inverse" value="--color-text-on-inverse" />
      </TokenSection>

      <TokenSection title="Icon Colors">
        <ColorToken name="Primary" value="--color-icon-primary" />
        <ColorToken name="Secondary" value="--color-icon-secondary" />
      </TokenSection>

      <TokenSection title="Background - Page">
        <ColorToken name="Primary" value="--color-bg-page-primary" />
        <ColorToken name="Inverse" value="--color-bg-page-inverse" />
      </TokenSection>

      <TokenSection title="Background - Container">
        <ColorToken name="Primary" value="--color-bg-container-primary" />
        <ColorToken
          name="Primary Transparent"
          value="--color-bg-container-primary-transparent"
        />
        <ColorToken
          name="Primary Semi"
          value="--color-bg-container-primary-semi"
        />
        <ColorToken name="Secondary" value="--color-bg-container-secondary" />
        <ColorToken name="Tertiary" value="--color-bg-container-tertiary" />
        <ColorToken name="Inverse" value="--color-bg-container-inverse" />
        <ColorToken name="Border" value="--color-bg-container-border" />
        <ColorToken name="Glass" value="--color-bg-glass" />
      </TokenSection>

      <TokenSection title="Chat Surfaces">
        <ColorToken name="Sent Background" value="--color-chat-bubble-sent-bg" />
        <ColorToken name="Sent Text" value="--color-chat-bubble-sent-text" />
        <ColorToken
          name="Received Background"
          value="--color-chat-bubble-received-bg"
        />
        <ColorToken
          name="Received Text"
          value="--color-chat-bubble-received-text"
        />
        <ColorToken name="Context Background" value="--color-chat-context-bg" />
      </TokenSection>

      <TokenSection title="Calendar Surfaces">
        <ColorToken name="Cell Background" value="--color-calendar-cell-bg" />
        <ColorToken
          name="Cell Background Hover"
          value="--color-calendar-cell-bg-hover"
        />
        <ColorToken name="Event Background" value="--color-calendar-event-bg" />
        <ColorToken
          name="Event Background Hover"
          value="--color-calendar-event-bg-hover"
        />
        <ColorToken name="Event Border" value="--color-calendar-event-border" />
      </TokenSection>

      <TokenSection title="AI">
        <ColorToken name="Gradient Start" value="--color-ai-gradient-start" />
        <ColorToken name="Gradient Mid" value="--color-ai-gradient-mid" />
        <ColorToken name="Gradient End" value="--color-ai-gradient-end" />
        <ColorToken name="Button Field" value="--color-ai-button-bg" />
      </TokenSection>

      <TokenSection title="Action - Primary">
        <ColorToken name="Background" value="--color-action-primary-bg" />
        <ColorToken
          name="Background Hover"
          value="--color-action-primary-bg-hover"
        />
        <ColorToken
          name="Background Active"
          value="--color-action-primary-bg-active"
        />
        <ColorToken name="Text" value="--color-action-primary-text" />
        <ColorToken
          name="Text Secondary"
          value="--color-action-primary-text-secondary"
        />
        <ColorToken
          name="Text Tertiary"
          value="--color-action-primary-text-tertiary"
        />
        <ColorToken name="Border" value="--color-action-primary-border" />
        <ColorToken
          name="Border Secondary"
          value="--color-action-primary-border-secondary"
        />
        <ColorToken
          name="Border Tertiary"
          value="--color-action-primary-border-tertiary"
        />
        <ColorToken name="Icon" value="--color-action-icon" />
      </TokenSection>

      <TokenSection title="Action - Passive (Secondary)">
        <ColorToken name="Text" value="--color-action-passive-text" />
        <ColorToken name="Background" value="--color-action-passive-bg" />
        <ColorToken
          name="Background Hover"
          value="--color-action-passive-bg-hover"
        />
        <ColorToken
          name="Background Active"
          value="--color-action-passive-bg-active"
        />
      </TokenSection>

      <TokenSection title="Action - Neutral">
        <ColorToken name="Background" value="--color-action-neutral-bg" />
        <ColorToken
          name="Background Hover"
          value="--color-action-neutral-bg-hover"
        />
        <ColorToken
          name="Background Active"
          value="--color-action-neutral-bg-active"
        />
        <ColorToken name="Text" value="--color-action-neutral-text" />
      </TokenSection>

      <TokenSection title="Input">
        <ColorToken name="Text Primary" value="--color-input-text-primary" />
        <ColorToken name="Text Placeholder" value="--color-input-text-placeholder" />
        <ColorToken name="Text Disabled" value="--color-input-text-disabled" />
        <ColorToken name="Text Inverse" value="--color-input-text-inverse" />
        <ColorToken name="Border Primary" value="--color-input-border-primary" />
        <ColorToken name="Border Hover" value="--color-input-border-hover" />
        <ColorToken name="Border Selected" value="--color-input-border-selected" />
        <ColorToken name="Border Disabled" value="--color-input-border-disabled" />
        <ColorToken name="Background Primary" value="--color-input-bg-primary" />
        <ColorToken name="Background Disabled" value="--color-input-bg-disabled" />
      </TokenSection>

      <TokenSection title="Overlay & Controls">
        <ColorToken name="Scrim" value="--color-scrim" />
        <ColorToken name="Control Thumb" value="--color-control-thumb" />
      </TokenSection>

      <TokenSection title="Core Colors">
        <ColorToken name="UI Primary" value="--color-core-ui-primary" />
        <ColorToken name="UI Secondary" value="--color-core-ui-secondary" />
        <ColorToken name="Accent Red" value="--color-core-accent-coral" />
        <ColorToken name="Accent Purple" value="--color-core-accent-violet" />
        <ColorToken name="Accent Blue" value="--color-core-accent-cobalt" />
        <ColorToken name="Accent Orange" value="--color-core-accent-amber" />
        <ColorToken name="Accent Yellow" value="--color-core-accent-gold" />
        <ColorToken name="Accent Green" value="--color-core-accent-mint" />
      </TokenSection>

      <TokenSection title="Trend">
        <ColorToken name="Up" value="--color-trend-up" />
        <ColorToken name="Down" value="--color-trend-down" />
      </TokenSection>
    </div>
  ),
};

// Status Colors Story
export const StatusColors: Story = {
  render: () => (
    <div style={{ maxWidth: '800px' }}>
      <h2
        style={{
          fontSize: '24px',
          fontWeight: 700,
          color: 'var(--color-text-primary)',
          marginBottom: '24px',
        }}
      >
        Status Color Tokens
      </h2>
      <p
        style={{
          fontSize: '14px',
          color: 'var(--color-text-secondary)',
          marginBottom: '32px',
          lineHeight: '1.5',
        }}
      >
        Semantic colors for status messages and alerts. These remain consistent
        across themes.
      </p>

      <TokenSection title="Positive">
        <ColorToken name="Background" value="--color-status-positive-bg" />
        <ColorToken name="Border" value="--color-status-positive-border" />
        <ColorToken name="Text" value="--color-status-positive-text" />
        <ColorToken name="Icon" value="--color-status-positive-icon" />
      </TokenSection>

      <TokenSection title="Warning">
        <ColorToken name="Background" value="--color-status-warning-bg" />
        <ColorToken name="Border" value="--color-status-warning-border" />
        <ColorToken name="Text" value="--color-status-warning-text" />
        <ColorToken name="Icon" value="--color-status-warning-icon" />
      </TokenSection>

      <TokenSection title="Error">
        <ColorToken name="Background" value="--color-status-error-bg" />
        <ColorToken name="Border" value="--color-status-error-border" />
        <ColorToken name="Text" value="--color-status-error-text" />
        <ColorToken name="Icon" value="--color-status-error-icon" />
      </TokenSection>

      <TokenSection title="Info">
        <ColorToken name="Background" value="--color-status-info-bg" />
        <ColorToken name="Border" value="--color-status-info-border" />
        <ColorToken name="Text" value="--color-status-info-text" />
        <ColorToken name="Icon" value="--color-status-info-icon" />
      </TokenSection>

      <TokenSection title="Neutral">
        <ColorToken name="Background" value="--color-status-neutral-bg" />
        <ColorToken name="Border" value="--color-status-neutral-border" />
        <ColorToken name="Text" value="--color-status-neutral-text" />
        <ColorToken name="Icon" value="--color-status-neutral-icon" />
      </TokenSection>
    </div>
  ),
};

// Chart Colors Story
export const ChartColors: Story = {
  render: () => (
    <div style={{ maxWidth: '800px' }}>
      <h2
        style={{
          fontSize: '24px',
          fontWeight: 700,
          color: 'var(--color-text-primary)',
          marginBottom: '24px',
        }}
      >
        Chart Color Tokens
      </h2>
      <p
        style={{
          fontSize: '14px',
          color: 'var(--color-text-secondary)',
          marginBottom: '32px',
          lineHeight: '1.5',
        }}
      >
        The contribution heatmap ramp used by the ContributionGraph component.
        Level 0 is no activity; levels 1–4 step through the green primitives,
        with the ramp direction flipped per theme so the highest level always
        reads brightest.
      </p>

      <TokenSection title="Contribution Ramp">
        <ColorToken name="Level 0" value="--color-chart-contribution-0" />
        <ColorToken name="Level 1" value="--color-chart-contribution-1" />
        <ColorToken name="Level 2" value="--color-chart-contribution-2" />
        <ColorToken name="Level 3" value="--color-chart-contribution-3" />
        <ColorToken name="Level 4" value="--color-chart-contribution-4" />
      </TokenSection>

      <p
        style={{
          fontSize: '14px',
          color: 'var(--color-text-secondary)',
          marginBottom: '32px',
          lineHeight: '1.5',
        }}
      >
        The ordered series ramp multi-series charts assign by slot. Series 1
        follows the action teal, so it is theme-split with it; series 2–6
        alias the core accents.
      </p>

      <TokenSection title="Series Ramp">
        <ColorToken name="Series 1" value="--color-chart-series-1" />
        <ColorToken name="Series 2" value="--color-chart-series-2" />
        <ColorToken name="Series 3" value="--color-chart-series-3" />
        <ColorToken name="Series 4" value="--color-chart-series-4" />
        <ColorToken name="Series 5" value="--color-chart-series-5" />
        <ColorToken name="Series 6" value="--color-chart-series-6" />
        <ColorToken name="Series 7" value="--color-chart-series-7" />
      </TokenSection>
    </div>
  ),
};

// Elevation Story
const ShadowToken = ({ value }: { name: string; value: string }) => {
  const computedValue = getComputedStyle(document.documentElement)
    .getPropertyValue(value)
    .trim();

  return (
    <div style={{ marginBottom: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div
          style={{
            width: '120px',
            height: '64px',
            backgroundColor: 'var(--color-bg-page-primary)',
            border: '1px solid var(--color-bg-container-border)',
            borderRadius: '8px',
            boxShadow: `var(${value})`,
            flexShrink: 0,
          }}
        />
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: '13px',
              fontFamily: 'monospace',
              color: 'var(--color-text-primary)',
              fontWeight: 600,
            }}
          >
            {value}
          </div>
          <div
            style={{
              fontSize: '12px',
              color: 'var(--color-text-tertiary)',
              marginTop: '2px',
            }}
          >
            {computedValue}
          </div>
        </div>
      </div>
    </div>
  );
};

export const Elevation: Story = {
  render: () => (
    <div style={{ maxWidth: '800px' }}>
      <h2
        style={{
          fontSize: '24px',
          fontWeight: 700,
          color: 'var(--color-text-primary)',
          marginBottom: '24px',
        }}
      >
        Elevation Tokens
      </h2>
      <p
        style={{
          fontSize: '14px',
          color: 'var(--color-text-secondary)',
          marginBottom: '32px',
          lineHeight: '1.5',
        }}
      >
        Depth is colour-based: standard containers never carry shadows. These
        are the only two shadows in the system, plus the modal scrim. All three
        get stronger values in dark mode so they read against the near-black
        page floor.
      </p>

      <TokenSection title="Shadows">
        <ShadowToken name="Floating" value="--shadow-floating" />
        <ShadowToken name="Modal" value="--shadow-modal" />
      </TokenSection>

      <TokenSection title="Scrim">
        <ColorToken name="Scrim" value="--color-scrim" />
      </TokenSection>
    </div>
  ),
};

// Spacing Tokens Story
export const SemanticSpacing: Story = {
  render: () => (
    <div style={{ maxWidth: '800px' }}>
      <h2
        style={{
          fontSize: '24px',
          fontWeight: 700,
          color: 'var(--color-text-primary)',
          marginBottom: '24px',
        }}
      >
        Semantic Spacing Tokens
      </h2>
      <p
        style={{
          fontSize: '14px',
          color: 'var(--color-text-secondary)',
          marginBottom: '32px',
          lineHeight: '1.5',
        }}
      >
        Semantic spacing tokens that reference primitives. Use these in
        components. The section-rhythm steps (gap XXL–XXXXL, padding XXL)
        compress one notch below 768px — the values shown here resolve at
        the current viewport.
      </p>

      <TokenSection title="Border Radius">
        <RadiusToken name="XXS" value="--radius-xxs" />
        <RadiusToken name="XS" value="--radius-xs" />
        <RadiusToken name="SM" value="--radius-sm" />
        <RadiusToken name="MD" value="--radius-md" />
        <RadiusToken name="LG" value="--radius-lg" />
        <RadiusToken name="XL" value="--radius-xl" />
        <RadiusToken name="Composer" value="--radius-composer" />
        <RadiusToken name="XXL" value="--radius-xxl" />
        <RadiusToken name="Full" value="--radius-full" />
      </TokenSection>

      <TokenSection title="Padding">
        <SpacingToken name="XXXS" value="--padding-xxxs" />
        <SpacingToken name="XXS" value="--padding-xxs" />
        <SpacingToken name="XS" value="--padding-xs" />
        <SpacingToken name="SM" value="--padding-sm" />
        <SpacingToken name="SM-MD" value="--padding-sm-md" />
        <SpacingToken name="MD" value="--padding-md" />
        <SpacingToken name="LG" value="--padding-lg" />
        <SpacingToken name="XL" value="--padding-xl" />
        <SpacingToken name="XXL" value="--padding-xxl" />
      </TokenSection>

      <TokenSection title="Border Width">
        <SpacingToken name="XS" value="--border-xs" />
        <SpacingToken name="MD" value="--border-md" />
      </TokenSection>

      <TokenSection title="Gap">
        <SpacingToken name="XXS" value="--gap-xxs" />
        <SpacingToken name="XS" value="--gap-xs" />
        <SpacingToken name="SM" value="--gap-sm" />
        <SpacingToken name="SM-MD" value="--gap-sm-md" />
        <SpacingToken name="MD" value="--gap-md" />
        <SpacingToken name="LG" value="--gap-lg" />
        <SpacingToken name="XL" value="--gap-xl" />
        <SpacingToken name="XXL" value="--gap-xxl" />
        <SpacingToken name="XXXL" value="--gap-xxxl" />
        <SpacingToken name="XXXXL" value="--gap-xxxxl" />
      </TokenSection>
    </div>
  ),
};

// Motion Tokens Story
const MotionTokenRow = ({ name, value }: { name: string; value: string }) => {
  const computedValue = getComputedStyle(document.documentElement)
    .getPropertyValue(value)
    .trim();

  return (
    <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'baseline', gap: '12px' }}>
      <div
        style={{
          flex: '0 0 120px',
          fontSize: '13px',
          color: 'var(--color-text-primary)',
          fontWeight: 600,
        }}
      >
        {name}
      </div>
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: '13px',
            fontFamily: 'monospace',
            color: 'var(--color-text-primary)',
          }}
        >
          {value}
        </div>
        <div
          style={{
            fontSize: '12px',
            color: 'var(--color-text-tertiary)',
            marginTop: '2px',
          }}
        >
          {computedValue}
        </div>
      </div>
    </div>
  );
};

export const Motion: Story = {
  render: () => (
    <div style={{ maxWidth: '800px' }}>
      <h2
        style={{
          fontSize: '24px',
          fontWeight: 700,
          color: 'var(--color-text-primary)',
          marginBottom: '24px',
        }}
      >
        Motion Tokens
      </h2>
      <p
        style={{
          fontSize: '14px',
          color: 'var(--color-text-secondary)',
          marginBottom: '32px',
          lineHeight: '1.5',
        }}
      >
        Durations and easing curves for transitions and animations, defined in
        tokens-motion.css. Compose a duration with an easing instead of writing
        literal values like 0.2s ease. All duration tokens collapse to 0.01ms
        under prefers-reduced-motion.
      </p>

      <TokenSection title="Core durations">
        <MotionTokenRow name="Fast" value="--motion-duration-fast" />
        <MotionTokenRow name="Base" value="--motion-duration-base" />
        <MotionTokenRow name="Slow" value="--motion-duration-slow" />
        <MotionTokenRow name="Slower" value="--motion-duration-slower" />
      </TokenSection>

      <TokenSection title="Extended durations">
        <MotionTokenRow name="Instant" value="--motion-duration-instant" />
        <MotionTokenRow name="Deliberate" value="--motion-duration-deliberate" />
        <MotionTokenRow name="Loop spin" value="--motion-duration-loop-spin" />
        <MotionTokenRow name="Loop shimmer" value="--motion-duration-loop-shimmer" />
        <MotionTokenRow name="Loop matrix" value="--motion-duration-loop-matrix" />
      </TokenSection>

      <TokenSection title="Easings">
        <MotionTokenRow name="Standard" value="--motion-ease-standard" />
        <MotionTokenRow name="Emphasized" value="--motion-ease-emphasized" />
        <MotionTokenRow name="Entrance" value="--motion-ease-entrance" />
        <MotionTokenRow name="Linear" value="--motion-ease-linear" />
        <MotionTokenRow name="Spring" value="--motion-ease-spring" />
      </TokenSection>
    </div>
  ),
};
