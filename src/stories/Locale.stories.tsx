import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { LocaleProvider } from '../behaviors/LocaleProvider';
import { formatBytes } from '../components/Attachment/fileTypes';
import { AnimatedNumber } from '../components/AnimatedNumber/AnimatedNumber';
import { BarChart } from '../components/Chart/BarChart';
import { ContributionGraph } from '../components/ContributionGraph/ContributionGraph';
import { DatePicker } from '../components/DatePicker/DatePicker';
import { EventCalendar } from '../components/EventCalendar/EventCalendar';
import { LegendTile } from '../components/LegendTile/LegendTile';
import { Pagination } from '../components/Pagination/Pagination';
import { ProgressBar } from '../components/ProgressBar/ProgressBar';
import { TimePicker } from '../components/TimePicker/TimePicker';

/*
 * The locale contract, proven at runtime. design.md's "Numbers and dates
 * are written in the consumer's locale" paragraph states it, and
 * scripts/validate-locale-formatting.mjs keeps the runtime default out of
 * the source; these stories check what a parse cannot: that a provider, or
 * a component's own `locale` prop, reaches the marks, the names, the week
 * and the clock. Each story pins its locale itself, so the toolbar's choice
 * cannot change what it asserts.
 */
const meta = {
  title: 'Foundations/Locale',
  parameters: { layout: 'padded' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** A provider reaches every client-rendered formatter below it. */
export const ProviderSetsTheMarks: Story = {
  render: () => (
    <LocaleProvider locale="de-DE">
      <div style={{ display: 'grid', gap: 'var(--gap-400)' }}>
        <BarChart
          title="Revenue"
          data={[
            { label: 'Q1', value: 1200 },
            { label: 'Q2', value: 1800 },
          ]}
          summaryItems={[{ label: 'Total', value: 12345.5 }]}
          height={160}
        />
        <AnimatedNumber value={1234.5} decimals={1} animateOnMount={false} data-testid="animated" />
      </div>
    </LocaleProvider>
  ),
  play: async ({ canvas }) => {
    // German groups with a point and marks decimals with a comma.
    await expect(canvas.getByText('12.345,5')).toBeInTheDocument();
    await expect(within(canvas.getByTestId('animated')).getAllByText('1.234,5').length).toBeGreaterThan(0);
  },
};

/** A component's own prop wins over the provider. */
export const PropWinsOverProvider: Story = {
  render: () => (
    <LocaleProvider locale="de-DE">
      <AnimatedNumber value={1234.5} decimals={1} animateOnMount={false} locale="en-US" data-testid="animated" />
    </LocaleProvider>
  ),
  play: async ({ canvas }) => {
    await expect(within(canvas.getByTestId('animated')).getAllByText('1,234.5').length).toBeGreaterThan(0);
  },
};

/** The server-renderable formatters read their prop, never a provider. */
export const ServerRenderableTakesTheProp: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--gap-300)' }}>
      <LegendTile label="Visits" value={48210} locale="de-DE" />
      <LegendTile label="Visits" value={48210} />
      <span data-testid="bytes">{formatBytes(1572864, 'de-DE')}</span>
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByText('48.210')).toBeInTheDocument();
    await expect(canvas.getByText('48,210')).toBeInTheDocument();
    await expect(canvas.getByTestId('bytes')).toHaveTextContent('1,5 MB');
  },
};

/** A calendar starts on the locale's first day and writes its own names. */
export const CalendarsFollowTheWeek: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--gap-400)', maxWidth: 720 }}>
      <div data-testid="german">
        <DatePicker value="2026-01-15" locale="de-DE" />
      </div>
      <div data-testid="american">
        <DatePicker value="2026-01-15" locale="en-US" />
      </div>
      <div data-testid="calendar">
        <EventCalendar month="2026-01" locale="de-DE" />
      </div>
    </div>
  ),
  play: async ({ canvas }) => {
    const german = within(canvas.getByTestId('german'));
    await expect(german.getByRole('grid', { name: 'Januar 2026' })).toBeInTheDocument();
    // Monday is the first column in Germany, Sunday in the United States.
    await expect(german.getAllByRole('columnheader')[0]).toHaveAccessibleName('Montag');
    const american = within(canvas.getByTestId('american'));
    await expect(american.getAllByRole('columnheader')[0]).toHaveAccessibleName('Sunday');
    await expect(american.getAllByRole('columnheader')[0]).toHaveTextContent('Su');
    // January 2026 starts on a Thursday: three leading days in a Monday week.
    const firstRow = german.getAllByRole('row')[1];
    await expect(within(firstRow).getAllByRole('button')[3]).toHaveTextContent('1');

    const calendar = within(canvas.getByTestId('calendar'));
    await expect(calendar.getByText('Januar 2026')).toBeInTheDocument();
    // The first header is Monday's short name, however this ICU abbreviates it.
    const headers = canvas.getByTestId('calendar').querySelectorAll('.ds-event-calendar__weekday');
    await expect(headers[0].textContent).toMatch(/^Mo/);
    await expect(headers[6].textContent).toMatch(/^So/);
  },
};

/** Home and End go to the ends of the locale's week, not Sunday's. */
export const HomeAndEndFollowTheWeek: Story = {
  render: () => <DatePicker value="2026-01-15" locale="de-DE" />,
  play: async ({ canvas, userEvent }) => {
    const selected = canvas.getByRole('button', { name: /15\. Januar 2026, selected/ });
    selected.focus();
    await userEvent.keyboard('{Home}');
    await expect(canvas.getByRole('button', { name: /Montag, 12\. Januar 2026/ })).toHaveFocus();
    await userEvent.keyboard('{End}');
    await expect(canvas.getByRole('button', { name: /Sonntag, 18\. Januar 2026/ })).toHaveFocus();
  },
};

/** The clock defaults to the locale's: 24-hour in Germany, 12-hour in the United States. */
export const ClockFollowsTheLocale: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--gap-400)' }}>
      <TimePicker label="Abfahrt" defaultValue="14:30" locale="de-DE" />
      <TimePicker label="Departure" defaultValue="14:30" locale="en-US" />
    </div>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByText('14:30')).toBeInTheDocument();
    await expect(canvas.getByText('2:30 PM')).toBeInTheDocument();
  },
};

/** ContributionGraph's columns start on the locale's first weekday. */
export const ContributionWeekStart: Story = {
  render: () => {
    // 2026-01-01 is a Thursday.
    const days = Array.from({ length: 14 }, (_, i) => ({
      date: `2026-01-${String(i + 1).padStart(2, '0')}`,
      count: i,
      level: (i % 5) as 0 | 1 | 2 | 3 | 4,
    }));
    return (
      <div style={{ display: 'grid', gap: 'var(--gap-400)' }}>
        <div data-testid="monday">
          <ContributionGraph days={days} locale="de-DE" showMonthLabels={false} showLegend={false} />
        </div>
        <div data-testid="sunday">
          <ContributionGraph days={days} locale="en-US" showMonthLabels={false} showLegend={false} />
        </div>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const firstColumnCells = (id: string) =>
      canvasElement.querySelector(`[data-testid="${id}"] .ds-contribution-graph__week`)?.querySelectorAll('.ds-contribution-graph__cell--empty').length;
    // Thursday sits three rows below Monday and four below Sunday.
    await expect(firstColumnCells('monday')).toBe(3);
    await expect(firstColumnCells('sunday')).toBe(4);
  },
};

/** Every number a component prints takes the locale's digits: pages, days and percentages in Arabic. */
export const DigitsFollowTheLocale: Story = {
  render: () => (
    <LocaleProvider locale="ar-EG">
      <div data-testid="arabic">
        <Pagination defaultPage={2} pageCount={3} />
        <DatePicker value="2026-01-15" />
      </div>
      <ProgressBar value={64} showLabel locale="ar-EG" />
    </LocaleProvider>
  ),
  play: async ({ canvas }) => {
    const arabic = within(canvas.getByTestId('arabic'));
    await expect(arabic.getByRole('button', { name: 'Page 2' })).toHaveTextContent('٢');
    await expect(arabic.getByRole('button', { name: /، selected|, selected/ })).toHaveTextContent('١٥');
    // Arabic percentages carry a bidi mark beside the sign, so match the digits and the sign.
    const label = canvas.getByText((_text, el) => el?.className === 'ds-progress-bar__label');
    await expect(label.textContent).toMatch(/٦٤.?٪/);
  },
};
