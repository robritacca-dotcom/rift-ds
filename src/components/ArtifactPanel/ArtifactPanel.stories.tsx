import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Button } from '../Button/Button';
import { CircularButton } from '../CircularButton/CircularButton';
import { ArtifactPanel } from './ArtifactPanel';

/* All content here is fictional: Acme is a made-up company, and the page,
   the numbers and the source below are invented set dressing. */

const PAGE_HTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Acme Workspaces</title>
<style>
  body { margin: 0; padding: 32px; font-family: ui-sans-serif, system-ui, sans-serif; color: #14181f; background: #f6f4ef; }
  h1 { margin: 0 0 12px; font-size: 32px; letter-spacing: -0.02em; }
  p { margin: 0; max-width: 46ch; color: #414b58; line-height: 1.5; }
</style>
</head>
<body>
<h1>One workspace for the whole team.</h1>
<p>Shared projects, guest seats and ninety days of version history.</p>
</body>
</html>`;

const SUMMARY = (
  <div style={{ display: 'grid', gap: 'var(--gap-300)', padding: 'var(--padding-400)' }}>
    {[
      ['Signups this week', '640'],
      ['Seats in use', '5 of 12'],
      ['Messages sent', '1,284'],
    ].map(([label, value]) => (
      <div
        key={label}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: 'var(--padding-300)',
          borderRadius: 'var(--radius-400)',
          background: 'var(--color-bg-container-secondary)',
          color: 'var(--color-text-primary)',
          fontFamily: 'var(--font-paragraph-sm-family)',
          fontSize: 'var(--font-paragraph-sm-size)',
        }}
      >
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    ))}
  </div>
);

/* The panel is surface-less and fills its box, so every story seats it in
   the card a host would paint. */
const frame: React.CSSProperties = {
  width: 'min(560px, 100%)',
  height: 420,
  border: 'var(--border-025) solid var(--color-bg-container-border)',
  borderRadius: 'var(--radius-600)',
  background: 'var(--color-bg-container-primary)',
  overflow: 'hidden',
};

const meta = {
  title: 'Components/ArtifactPanel',
  component: ArtifactPanel,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div style={frame}>
        <Story />
      </div>
    ),
  ],
  args: {
    title: 'Launch dashboard',
    meta: 'Dashboard',
    icon: 'space_dashboard',
  },
} satisfies Meta<typeof ArtifactPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Live React content as the preview. */
export const Default: Story = {
  args: { children: SUMMARY, onClose: fn() },
};

/** A whole document in a sandboxed frame, with its source one switch away. */
export const HtmlDocument: Story = {
  args: {
    title: 'Launch page',
    meta: 'Web page',
    icon: 'web',
    html: PAGE_HTML,
    code: PAGE_HTML,
    language: 'html',
    onClose: fn(),
  },
};

/** No preview: the source is the artifact. */
export const CodeOnly: Story = {
  args: {
    title: 'workspace.config.ts',
    meta: 'TypeScript',
    icon: 'code',
    code: 'export const workspace = {\n  name: "acme-design",\n  seats: 12,\n  region: "eu-west",\n};',
    language: 'ts',
  },
};

/** Extra header controls ahead of the panel's own. */
export const WithActions: Story = {
  args: {
    children: SUMMARY,
    actions: <CircularButton icon="download" variant="tertiary" ariaLabel="Download the artifact" tooltipPosition="bottom" />,
    onClose: fn(),
  },
};

/** The host owns the seat: expanding and closing only report intent. */
export const ExpandAndClose: Story = {
  render: function Render(args) {
    const [expanded, setExpanded] = useState(false);
    const [shown, setShown] = useState(true);
    if (!shown) {
      return (
        <div style={{ display: 'grid', placeItems: 'center', height: '100%' }}>
          <Button variant="secondary" label="Show the panel" onClick={() => setShown(true)} />
        </div>
      );
    }
    return (
      <ArtifactPanel
        {...args}
        expanded={expanded}
        onExpandedChange={setExpanded}
        onClose={() => setShown(false)}
      >
        {SUMMARY}
      </ArtifactPanel>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('button', { name: 'Expand the artifact' });
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(toggle);
    const collapse = canvas.getByRole('button', { name: 'Collapse the artifact' });
    await expect(collapse).toHaveAttribute('aria-pressed', 'true');
    /* End at rest, so the snapshot is the resting panel. */
    await userEvent.click(collapse);
    await expect(canvas.getByRole('button', { name: 'Expand the artifact' })).toBeInTheDocument();
  },
};

/** The view switch moves between the preview and the source. */
export const ViewSwitch: Story = {
  args: { ...HtmlDocument.args, onViewChange: fn() },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTitle('Launch page')).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('tab', { name: 'Code' }));
    await expect(args.onViewChange).toHaveBeenCalledWith('code');
    await expect(canvas.queryByTitle('Launch page')).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole('tab', { name: 'Preview' }));
    await expect(canvas.getByTitle('Launch page')).toBeInTheDocument();
  },
};
