import type { Meta, StoryObj } from '@storybook/react-vite';
import { CircularButton } from '../CircularButton/CircularButton';
import { SegmentedControl } from '../SegmentedControl/SegmentedControl';
import { SiteHeader, type SiteHeaderSection } from './SiteHeader';

/** A fictional docs site: the header's shape, not any real site's pages. */
const SECTIONS: SiteHeaderSection[] = [
  {
    id: 'docs',
    label: 'Docs',
    href: '#/docs',
    mega: {
      items: [
        { href: '#/docs/guides', label: 'Guides', description: 'Step-by-step walkthroughs from install to first release.', icon: 'menu_book' },
        { href: '#/docs/recipes', label: 'Recipes', description: 'Short answers to the questions that come up every week.', icon: 'restaurant' },
        { href: '#/docs/api', label: 'API reference', description: 'Every endpoint, parameter and error, generated from source.', icon: 'data_object' },
        { href: '#/docs/changelog', label: 'Changelog', description: 'What changed in each version and how to move to it.', icon: 'history' },
      ],
      showcase: {
        href: '#/docs/tour',
        overline: 'New here',
        label: 'Start with the tour',
        description: 'Ten minutes from an empty folder to a deployed app.',
      },
    },
  },
  {
    id: 'examples',
    label: 'Examples',
    href: '#/examples',
    mega: {
      items: [
        { href: '#/examples/blog', label: 'Blog', description: 'Posts, tags and an RSS feed.', icon: 'article' },
        { href: '#/examples/shop', label: 'Shop', description: 'A catalogue, a cart and a checkout.', icon: 'storefront' },
        { href: '#/examples/dashboard', label: 'Dashboard', description: 'Charts and tables over live data.', icon: 'monitoring' },
      ],
    },
  },
  { id: 'pricing', label: 'Pricing', href: '#/pricing' },
  { id: 'blog', label: 'Blog', href: '#/blog' },
];

function Brand() {
  return (
    <a
      href="#/"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--gap-200)',
        color: 'var(--color-text-primary)',
        textDecoration: 'none',
        fontFamily: 'var(--font-title-body-family)',
        fontSize: 'var(--font-title-body-size)',
        fontWeight: 'var(--font-title-body-weight)',
      }}
    >
      <span className="material-symbols-rounded" aria-hidden="true">
        deployed_code
      </span>
      Acme
    </a>
  );
}

const ModeSwitch = () => (
  <SegmentedControl
    aria-label="Colour mode"
    size="compact"
    defaultValue="dark"
    showLabels={false}
    segments={[
      { value: 'light', label: 'Light', icon: 'light_mode' },
      { value: 'dark', label: 'Dark', icon: 'dark_mode' },
    ]}
  />
);

const meta = {
  title: 'Components/SiteHeader',
  component: SiteHeader,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  args: {
    brand: <Brand />,
    sections: SECTIONS,
    currentHref: '#/docs/api',
    actions: <CircularButton icon="search" variant="secondary" tone="neutral" ariaLabel="Search" tooltip={false} />,
    wideActions: <ModeSwitch />,
    drawerFooter: <ModeSwitch />,
    sticky: false,
  },
  argTypes: {
    sticky: { control: 'boolean' },
    tintAfter: { control: 'number' },
  },
} satisfies Meta<typeof SiteHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The full row: brand, pills with their menus, and the end actions. Hover Docs or Examples to open a menu. */
export const Default: Story = {};

/**
 * Too narrow for the pills: the bar folds to its menu button, measured on
 * its own width. The button opens a drawer of the same sections, with the
 * current one expanded.
 */
export const Folded: Story = {
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 480 }}>
        <Story />
      </div>
    ),
  ],
};

/**
 * Sticky over a scrolling page: the blur is always on behind the bar, and
 * the page-surface tint fades in once the page has scrolled past
 * `tintAfter`.
 */
export const Sticky: Story = {
  args: { sticky: true },
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div style={{ padding: '0 var(--padding-1000)' }}>
        <Story />
        <div style={{ display: 'grid', gap: 'var(--gap-500)', paddingBlock: 'var(--gap-1000)' }}>
          {Array.from({ length: 24 }, (_, i) => (
            <p
              key={i}
              style={{
                margin: 0,
                fontFamily: 'var(--font-paragraph-family)',
                fontSize: 'var(--font-paragraph-size)',
                lineHeight: 'var(--font-paragraph-line-height)',
                color: 'var(--color-text-primary)',
              }}
            >
              Paragraph {i + 1}. Scroll and watch the text frost as it passes under the bar, then the tint arrive.
            </p>
          ))}
        </div>
      </div>
    ),
  ],
};
