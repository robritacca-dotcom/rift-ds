/**
 * Every control that can share a row, at both sizes, on a band at the row
 * height (--control-height-default and -compact), each tagged with its
 * measured height. The play function is the guard: it fails if any of them
 * drifts off the token, the way a padding-derived height used to drift when
 * a border or a line height moved. design.md's Control Height Scale owns the
 * rule and the roster.
 */
import { useLayoutEffect, useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor } from 'storybook/test';
import { AiButton } from '../components/AiButton/AiButton';
import { Button } from '../components/Button/Button';
import { CircularButton } from '../components/CircularButton/CircularButton';
import { Combobox } from '../components/Combobox/Combobox';
import { CommandPaletteTrigger } from '../components/CommandPaletteTrigger/CommandPaletteTrigger';
import { DateInput } from '../components/DateInput/DateInput';
import { Dropdown } from '../components/Dropdown/Dropdown';
import { Input } from '../components/Input/Input';
import { ModelPicker } from '../components/ModelPicker/ModelPicker';
import { SegmentedControl } from '../components/SegmentedControl/SegmentedControl';
import { SplitButton } from '../components/SplitButton/SplitButton';
import { ThemePicker } from '../components/ThemePicker/ThemePicker';
import { ThemeToggle } from '../components/ThemeToggle/ThemeToggle';
import { TimePicker } from '../components/TimePicker/TimePicker';
import { ToggleGroup } from '../components/ToggleGroup/ToggleGroup';

const meta = { title: 'Foundations/Control heights', parameters: { layout: 'fullscreen' } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

type Size = 'default' | 'compact';
const TARGET: Record<Size, number> = { default: 40, compact: 32 };


type Item = { name: string; selector: string; render: (size: Size) => React.ReactNode };

const OPTIONS = [
  { value: 'a', label: 'All projects' },
  { value: 'b', label: 'Marketing' },
];

const THEMES = [
  { value: 'green', label: 'Green', color: '#9BE36B' },
  { value: 'blue', label: 'Blue', color: '#3B82F6' },
];

const ITEMS: Item[] = [
  {
    name: 'CommandPaletteTrigger',
    selector: '.ds-command-palette-trigger',
    render: (size) => <CommandPaletteTrigger size={size} style={{ width: 260 }} />,
  },
  {
    name: 'CommandPaletteTrigger (icon)',
    selector: '.ds-command-palette-trigger',
    render: (size) => <CommandPaletteTrigger size={size} iconOnly />,
  },
  { name: 'ThemePicker', selector: '.ds-theme-picker__trigger', render: (size) => <ThemePicker size={size} themes={THEMES} /> },
  {
    name: 'Input (search)',
    selector: 'input',
    render: (size) => (
      <div style={{ width: 240, position: 'relative' }}>
        <Input size={size} aria-label="Search" placeholder="Search or ask anything" iconLeft="search" />
      </div>
    ),
  },
  { name: 'Input', selector: 'input', render: (size) => <div style={{ width: 160 }}><Input size={size} aria-label="Name" placeholder="Name" /></div> },
  { name: 'Dropdown', selector: '.ds-dropdown__trigger', render: (size) => <div style={{ width: 170 }}><Dropdown size={size} aria-label="Project" options={OPTIONS} defaultValue="a" /></div> },
  { name: 'Combobox', selector: '.ds-combobox__control', render: (size) => <div style={{ width: 170 }}><Combobox size={size} aria-label="Owner" options={OPTIONS} /></div> },
  { name: 'DateInput', selector: 'input', render: (size) => <div style={{ width: 170 }}><DateInput size={size} aria-label="Due" /></div> },
  { name: 'TimePicker', selector: '.ds-timepicker__trigger', render: (size) => <div style={{ width: 150 }}><TimePicker size={size} aria-label="Time" /></div> },
  { name: 'ModelPicker', selector: '.ds-model-picker__trigger', render: (size) => <ModelPicker size={size} models={[{ value: 'a', label: 'Fast' }]} defaultValue="a" /> },
  { name: 'Button', selector: '.ds-button', render: (size) => <Button size={size} label="New campaign" iconLeft="add" /> },
  { name: 'Button secondary', selector: '.ds-button', render: (size) => <Button size={size} variant="secondary" label="Filters" /> },
  { name: 'SplitButton', selector: '.ds-split-button', render: (size) => <SplitButton size={size} label="Export" items={[{ label: 'CSV' }]} /> },
  { name: 'CircularButton', selector: '.ds-circular-button', render: (size) => <CircularButton size={size} icon="notifications" variant="secondary" ariaLabel="Notifications" /> },
  { name: 'AiButton', selector: '.ds-ai-button', render: (size) => <AiButton size={size} label="Ask AI" /> },
  {
    name: 'SegmentedControl',
    selector: '.ds-segmented-control',
    render: (size) => (
      <SegmentedControl size={size} value="w" aria-label="Range" segments={[{ value: 'd', label: 'Day' }, { value: 'w', label: 'Week' }]} />
    ),
  },
  { name: 'ThemeToggle (icons)', selector: '.ds-theme-toggle', render: (size) => <ThemeToggle size={size} showLabels={false} storageKey="control-heights-story" /> },
  {
    name: 'ToggleGroup',
    selector: '.ds-toggle-group',
    render: (size) => (
      <ToggleGroup size={size} defaultValue="l" aria-label="View" items={[{ value: 'l', label: 'List' }, { value: 'b', label: 'Board' }]} />
    ),
  },
];

function Tile({ item, size }: { item: Item; size: Size }) {
  const ref = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | null>(null);
  useLayoutEffect(() => {
    const measure = () => {
      const el = ref.current?.querySelector<HTMLElement>(item.selector);
      if (el) setHeight(Math.round(el.getBoundingClientRect().height * 10) / 10);
    };
    measure();
    const t = setTimeout(measure, 400);
    return () => clearTimeout(t);
  }, [item.selector]);
  const target = TARGET[size];
  const off = height === null ? 0 : Math.round((height - target) * 10) / 10;
  const ok = height !== null && Math.abs(off) < 0.5;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 6 }}>
      <div ref={ref} style={{ display: 'flex', alignItems: 'center', height: 56 }}>
        {item.render(size)}
      </div>
      <span
        data-control={item.name}
        data-height={height ?? ''}
        data-target={target}
        style={{
          font: '600 11px/1.2 ui-monospace, monospace',
          padding: '2px 6px',
          borderRadius: 6,
          color: ok ? 'var(--color-status-positive-text)' : 'var(--color-status-warning-text)',
          background: ok ? 'var(--color-status-positive-bg)' : 'var(--color-status-warning-bg)',
        }}
      >
        {item.name} · {height ?? '…'}px{ok ? '' : ` (${off > 0 ? '+' : ''}${off})`}
      </span>
    </div>
  );
}

function Row({ size }: { size: Size }) {
  const target = TARGET[size];
  return (
    <section style={{ display: 'grid', gap: 12 }}>
      <h2 style={{ font: '600 15px/1.3 var(--font-family-primary)', color: 'var(--color-text-primary)' }}>
        {size === 'default' ? 'Default' : 'Compact'} · target {target}px
      </h2>
      <div style={{ position: 'relative', display: 'flex', flexWrap: 'wrap', gap: '16px 20px', alignItems: 'flex-start' }}>
        {ITEMS.map((item) => (
          <div key={item.name} style={{ position: 'relative' }}>
            {/* The target band, centred where the control sits. */}
            <div
              aria-hidden
              style={{
                position: 'absolute',
                left: -6,
                right: -6,
                top: 28 - target / 2,
                height: target,
                borderTop: '1px dashed var(--color-status-info-text)',
                borderBottom: '1px dashed var(--color-status-info-text)',
                pointerEvents: 'none',
                opacity: 0.7,
              }}
            />
            <Tile item={item} size={size} />
          </div>
        ))}
      </div>
    </section>
  );
}

function HeaderRow() {
  const ref = useRef<HTMLDivElement>(null);
  const [heights, setHeights] = useState<string>('');
  useLayoutEffect(() => {
    const t = setTimeout(() => {
      const root = ref.current;
      if (!root) return;
      const pick = (sel: string) => Math.round(root.querySelector<HTMLElement>(sel)!.getBoundingClientRect().height);
      setHeights(
        `palette trigger ${pick('.ds-command-palette-trigger')} · theme picker ${pick('.ds-theme-picker__trigger')} · toggle ${pick('.ds-theme-toggle')} · input ${pick('input')} · dropdown ${pick('.ds-dropdown__trigger')} · button ${pick('.ds-button')}`,
      );
    }, 400);
    return () => clearTimeout(t);
  }, []);
  return (
    <section style={{ display: 'grid', gap: 12 }}>
      <h2 style={{ font: '600 15px/1.3 var(--font-family-primary)', color: 'var(--color-text-primary)' }}>
        A header row
      </h2>
      <div ref={ref} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, borderRadius: 16, border: '1px dashed var(--color-divider)', width: 'fit-content' }}>
        <CommandPaletteTrigger style={{ width: 320 }} />
        <ThemePicker themes={THEMES} />
        <ThemeToggle size="default" showLabels={false} storageKey="control-heights-story" />
        <div style={{ width: 160, flex: 'none' }}>
          <Input aria-label="Name" placeholder="Name" />
        </div>
        <div style={{ width: 170, flex: 'none' }}>
          <Dropdown aria-label="Project" options={OPTIONS} defaultValue="a" />
        </div>
        <Button label="New campaign" iconLeft="add" />
      </div>
      <span style={{ font: '500 12px/1.4 ui-monospace, monospace', color: 'var(--color-text-secondary)' }}>{heights}</span>
    </section>
  );
}

export const AllControls: Story = {
  play: async ({ canvasElement }) => {
    await waitFor(
      () => {
        const tags = [...canvasElement.querySelectorAll<HTMLElement>('[data-control]')];
        expect(tags.length).toBeGreaterThan(0);
        const off = tags
          .filter((tag) => Math.abs(Number(tag.dataset.height) - Number(tag.dataset.target)) >= 0.5)
          .map((tag) => `${tag.dataset.control}: ${tag.dataset.height}px, not ${tag.dataset.target}px`);
        expect(off).toEqual([]);
      },
      { timeout: 2000 },
    );
  },
  render: () => (
    <div style={{ display: 'grid', gap: 36, padding: 32 }}>
      <HeaderRow />
      <Row size="default" />
      <Row size="compact" />
    </div>
  ),
};
