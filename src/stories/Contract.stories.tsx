import React from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import registry from '../components/registry.json';
import { LinkProvider, type LinkComponentProps } from '../behaviors/LinkProvider';
import { Breadcrumb } from '../components/Breadcrumb/Breadcrumb';
import { Button } from '../components/Button/Button';

/*
 * The props contract, proven at runtime. scripts/validate-component-contract.mjs
 * reads the syntax: every component forwards a ref and spreads native
 * attributes onto one node. This story checks the part a parse cannot: that
 * the node the ref reaches is the one the attributes land on. Each component
 * renders into a detached root with a ref and a `data-testid`; the ref must
 * be an element carrying that test id.
 *
 * Props come from each component's own stories (the meta's args, then the
 * first story with args), so the fixtures are the ones the stories already
 * keep working. FIXTURES fills in where a story drives its component through
 * a render function instead. A component whose stories cannot supply its
 * required props fails here by name, which is the cue to add a fixture.
 *
 * Every registered component is checked or the story fails: one whose
 * stories never name it as their meta's `component`, and that has no
 * FIXTURES entry, is reported as uncovered rather than skipped. SKIP mirrors
 * the "ref and rest" rows of SANCTIONED in validate-component-contract.mjs,
 * which holds the two together.
 */

type StoryModule = {
  default: { component?: React.ElementType; args?: Record<string, unknown> };
  [name: string]: unknown;
};

// `.ts` too: a story file with no JSX (Button's) is still a story file.
const storyModules = import.meta.glob<StoryModule>('../components/**/*.stories.{ts,tsx}', { eager: true });
const storyFor = (name: string) =>
  Object.entries(storyModules).find(([path]) => /\/(\w+)\.stories\.tsx?$/.exec(path)?.[1] === name)?.[1];

/** Components whose primary node is deliberately not the ref target (validate-component-contract.mjs's SANCTIONED). */
const SKIP = new Set(['PinInput']);

/** Props for components whose stories do not carry args. */
const FIXTURES: Record<string, Record<string, unknown>> = {
  AlertDialog: { open: true, onOpenChange: () => {}, title: 'Delete file?' },
  Carousel: { children: [<div key="a">First slide</div>, <div key="b">Second slide</div>] },
  CommandPalette: { open: true, onOpenChange: () => {}, groups: [] },
  Dialog: { open: true, onOpenChange: () => {}, title: 'Dialog' },
  Drawer: { open: true, onOpenChange: () => {}, title: 'Drawer' },
};

const argsFor = (name: string): Record<string, unknown> | null => {
  const mod = storyFor(name);
  if (!mod) return FIXTURES[name] ?? null;
  const firstWithArgs = Object.entries(mod).find(
    ([key, value]) => key !== 'default' && value && typeof value === 'object' && 'args' in (value as object),
  )?.[1] as { args?: Record<string, unknown> } | undefined;
  return { ...(mod.default.args ?? {}), ...(firstWithArgs?.args ?? {}), ...(FIXTURES[name] ?? {}) };
};

// A forwardRef component names itself through displayName; a plain function
// component (React 19's ref-as-prop form) through its function name.
const componentFor = (name: string): React.ElementType | null => {
  const fromMeta = storyFor(name)?.default.component;
  const named = fromMeta as { displayName?: string; name?: string } | undefined;
  return fromMeta && (named?.displayName ?? named?.name) === name ? fromMeta : null;
};

const meta = {
  title: 'Foundations/Props contract',
  parameters: { layout: 'padded' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const RefAndAttributesShareANode: Story = {
  render: () => (
    <p style={{ margin: 0 }}>
      Renders every registered component with a ref and a test id, and checks both reach the same element.
    </p>
  ),
  play: async () => {
    const failures: string[] = [];
    let checked = 0;
    // React reports a prop it had to drop (an attribute spread onto a
    // Fragment, say) through console.error: that is the contract failing too.
    let current = '';
    const originalError = console.error;
    console.error = (...parts: unknown[]) => {
      const text = parts.map(String).join(' ');
      if (/Invalid prop|Unknown prop|React does not recognize/.test(text)) failures.push(`${current}: ${text.slice(0, 160)}`);
      originalError(...parts);
    };
    for (const { name } of registry.components) {
      if (SKIP.has(name)) continue;
      const Component = componentFor(name);
      const args = argsFor(name);
      if (!Component || !args) {
        failures.push(
          `${name}: uncovered. No story names it as its meta's component; set \`component: ${name}\` in its stories' meta, or add a FIXTURES entry`,
        );
        continue;
      }
      current = name;
      const host = document.createElement('div');
      document.body.appendChild(host);
      const root = createRoot(host);
      const ref = React.createRef<HTMLElement>();
      const testId = `contract-${name}`;
      try {
        flushSync(() => root.render(<Component {...args} ref={ref} data-testid={testId} />));
        const node = ref.current;
        if (!(node instanceof Element)) failures.push(`${name}: the ref holds ${String(node)}, not an element`);
        else if (node.getAttribute('data-testid') !== testId) {
          failures.push(`${name}: the ref's node does not carry the native attribute passed to the component`);
        }
        checked += 1;
      } catch (error) {
        failures.push(`${name}: render threw (${(error as Error).message}); add a FIXTURES entry`);
      } finally {
        flushSync(() => root.unmount());
        host.remove();
      }
    }
    console.error = originalError;
    await expect(failures).toEqual([]);
    await expect(checked).toBe(registry.components.length - SKIP.size);
  },
};

/** Stands in for a router's link: an anchor the test can tell apart from a plain one. */
function RouterLink(props: LinkComponentProps) {
  return <a {...props} data-router-link="" />;
}

export const LinksRouteThroughTheLinkComponent: Story = {
  render: () => (
    <div>
      <LinkProvider linkComponent={RouterLink}>
        <Button label="Docs" href="/docs" />
      </LinkProvider>
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Docs' }]} linkComponent={RouterLink} />
      <Button label="Plain" href="/plain" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const link = (href: string) => canvasElement.querySelector(`a[href="${href}"]`);
    // A client component reads the provider; a server one takes the prop.
    await expect(link('/docs')?.hasAttribute('data-router-link')).toBe(true);
    await expect(link('/')?.hasAttribute('data-router-link')).toBe(true);
    // Outside a provider, a link stays a plain anchor.
    await expect(link('/plain')?.hasAttribute('data-router-link')).toBe(false);
  },
};
