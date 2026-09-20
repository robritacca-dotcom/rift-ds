import type { Meta, StoryObj } from '@storybook/react-vite';
import { Prose } from './Prose';

const meta = {
  title: 'Components/Prose',
  component: Prose,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'radio',
      options: ['default', 'sm'],
    },
  },
} satisfies Meta<typeof Prose>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A rich answer: headings, paragraphs, a list, a link, inline code, emphasis. */
export const Default: Story = {
  render: (args) => (
    <Prose {...args} style={{ maxWidth: '560px' }}>
      <h2>Migrating the Lumen widgets</h2>
      <p>
        The <code>lumen-panel</code> package splits its widgets into two entry
        points, so the first step is deciding which side of the line each one
        sits on. Anything that touches the network moves to{' '}
        <code>lumen-panel/live</code>; everything else stays put.
      </p>
      <h3>What changes for consumers</h3>
      <p>
        Most imports keep working. The <strong>three exceptions</strong> are
        the widgets that used to bundle their own polling logic, which is now{' '}
        <em>opt-in</em> rather than automatic:
      </p>
      <ul>
        <li>
          <code>TickerStrip</code> takes a <code>refresh</code> prop instead of
          polling on mount
        </li>
        <li>
          <code>QueueDepth</code> reads from the shared feed context
        </li>
        <li>
          <code>UplinkBadge</code> is now purely presentational
        </li>
      </ul>
      <p>
        The full mapping is in the{' '}
        <a href="#migration-table">migration table</a> below, and each entry
        links to the widget it replaces.
      </p>
    </Prose>
  ),
};

/** The small scale, for dense chat contexts. */
export const Small: Story = {
  render: (args) => (
    <Prose {...args} size="sm" style={{ maxWidth: '480px' }}>
      <p>
        Done. I renamed the three <code>lumen-panel</code> widgets and updated
        every import. Two things worth knowing:
      </p>
      <ol>
        <li>
          <strong>TickerStrip</strong> no longer polls on mount, so pass{' '}
          <code>refresh</code> where you need live data
        </li>
        <li>
          <strong>UplinkBadge</strong> lost its network code entirely and is
          safe in server components
        </li>
      </ol>
      <p>
        The build is green and <em>nothing else</em> changed.
      </p>
    </Prose>
  ),
};

/** A code block and a quoted passage. */
export const CodeAndQuote: Story = {
  render: (args) => (
    <Prose {...args} style={{ maxWidth: '560px' }}>
      <p>
        The feed context wires up in one place, at the top of the panel tree:
      </p>
      <pre>
        <code>{`import { FeedProvider } from 'lumen-panel/live';

export function Dashboard() {
  return (
    <FeedProvider interval={5000}>
      <QueueDepth />
    </FeedProvider>
  );
}`}</code>
      </pre>
      <p>The changelog puts the reasoning plainly:</p>
      <blockquote>
        <p>
          Widgets that fetch on their own schedule fight each other for the
          connection. One provider, one schedule, and every widget below it
          stays in step.
        </p>
      </blockquote>
    </Prose>
  ),
};

/** A comparison table and a horizontal rule. */
export const WithTable: Story = {
  render: (args) => (
    <Prose {...args} style={{ maxWidth: '560px' }}>
      <p>Here is how the old widgets map to the new entry points:</p>
      <table>
        <thead>
          <tr>
            <th>Widget</th>
            <th>Entry point</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>TickerStrip</td>
            <td>
              <code>live</code>
            </td>
            <td>Pass a refresh interval</td>
          </tr>
          <tr>
            <td>QueueDepth</td>
            <td>
              <code>live</code>
            </td>
            <td>Reads the feed context</td>
          </tr>
          <tr>
            <td>UplinkBadge</td>
            <td>
              <code>core</code>
            </td>
            <td>Presentational only</td>
          </tr>
        </tbody>
      </table>
      <hr />
      <p>
        Everything not listed here is unchanged and imports from the package
        root as before.
      </p>
    </Prose>
  ),
};

/**
 * A table too wide for its container, in the narrow column a chat panel gives it.
 * The wrapper reproduces ChatMessage's content box, `overflow-wrap: anywhere`
 * included: without Prose holding the cells at `overflow-wrap: normal`, that
 * inherited rule collapses every column's minimum width to one character and
 * the headings break mid-word instead of the table scrolling. `tabIndex` is the
 * consumer's to add — it makes the scroll reachable by keyboard alone, and it is
 * markup Prose cannot supply for a table it does not render.
 */
export const WideTable: Story = {
  render: (args) => (
    <div
      style={{
        maxWidth: '420px',
        minWidth: 0,
        overflowWrap: 'anywhere',
      }}
    >
      <Prose {...args} size="sm">
        <p>The roles that moved in the reorg:</p>
        <table tabIndex={0}>
          <thead>
            <tr>
              <th>Company</th>
              <th>Role</th>
              <th>Years</th>
              <th>Team</th>
              <th>Location</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Northwind</td>
              <td>Designer</td>
              <td>2019</td>
              <td>Platform</td>
              <td>Vancouver</td>
              <td>Archived</td>
            </tr>
            <tr>
              <td>Contoso</td>
              <td>Lead</td>
              <td>2023</td>
              <td>Signals</td>
              <td>Remote</td>
              <td>Active</td>
            </tr>
          </tbody>
        </table>
        <p>Everything else keeps the reporting line it had.</p>
      </Prose>
    </div>
  ),
};
