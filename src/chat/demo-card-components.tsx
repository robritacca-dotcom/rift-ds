'use client';

/**
 * The stateful pieces behind the demo's card renderers: a tool call that
 * can be retried in place, an interrupt card that answers, a chart card,
 * and a stack of cards landing as one. demo-cards.tsx maps kinds onto them.
 */
import { useEffect, useState } from 'react';
import { Button } from '../components/Button/Button';
import { AreaChart } from '../components/Chart/AreaChart';
import { BarChart } from '../components/Chart/BarChart';
import { CodeBlock } from '../components/CodeBlock/CodeBlock';
import { InterruptCard } from '../components/InterruptCard/InterruptCard';
import { MessageCard } from '../components/MessageCard/MessageCard';
import { ToolCall } from '../components/ToolCall/ToolCall';
import type { ChatCardRenderers } from './context';
import type { ChatCard } from './types';

export interface DemoChartCard {
  type: 'area' | 'bar';
  title: string;
  meta?: string;
  data: Record<string, string | number>[];
  xKey: string;
  yKey: string;
  label: string;
}

export interface DemoToolCallCard {
  name: string;
  summary: string;
  status: 'success' | 'error' | 'running';
  duration?: string;
  args?: string;
  /** The error can be retried in place; the retry runs for a beat and lands as a success. */
  retryable?: boolean;
}

export interface DemoInterruptCard {
  title: string;
  description: string;
  options: { value: string; label: string; variant: 'primary' | 'secondary' }[];
}

/** Several cards landing as one turn's stack. */
export interface DemoStackCard {
  items: ChatCard[];
}

/* A schedule timing, not an animation: how long the staged retry "runs"
   before it lands. */
const RETRY_RUN_MS = 1400;

export function DemoToolCall({ card }: { card: DemoToolCallCard }) {
  const [status, setStatus] = useState(card.status);
  useEffect(() => {
    if (status !== 'running' || !card.retryable) return;
    const timer = setTimeout(() => setStatus('success'), RETRY_RUN_MS);
    return () => clearTimeout(timer);
  }, [status, card.retryable]);
  return (
    <ToolCall
      name={card.name}
      summary={card.summary}
      status={status}
      duration={status === 'running' ? undefined : card.duration}
      actions={
        card.retryable && status === 'error' ? (
          <Button label="Retry" variant="secondary" size="compact" onClick={() => setStatus('running')} />
        ) : undefined
      }
    >
      {card.args ? <CodeBlock code={card.args} language="json" /> : undefined}
    </ToolCall>
  );
}

export function DemoInterrupt({ card }: { card: DemoInterruptCard }) {
  const [value, setValue] = useState<string | undefined>(undefined);
  return (
    <InterruptCard
      title={card.title}
      description={card.description}
      options={card.options}
      value={value}
      onValueChange={setValue}
    />
  );
}

export function DemoChart({ card }: { card: DemoChartCard }) {
  const chart =
    card.type === 'area' ? (
      <AreaChart data={card.data} xKey={card.xKey} series={[{ dataKey: card.yKey, label: card.label }]} height={150} />
    ) : (
      <BarChart data={card.data} xKey={card.xKey} yKey={card.yKey} dataLabel={card.label} height={150} />
    );
  return <MessageCard media={chart} title={card.title} meta={card.meta} />;
}

export function DemoStack({ card, renderers }: { card: DemoStackCard; renderers: ChatCardRenderers }) {
  return (
    <div className="ds-chat-demo__stack">
      {card.items.map((item, index) => {
        const render = renderers[item.kind];
        return render ? <div key={index}>{render(item.data)}</div> : null;
      })}
    </div>
  );
}
