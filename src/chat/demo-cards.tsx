'use client';

/**
 * The demo's card kinds: the data each one carries, and the renderers that
 * draw them. Every payload survives JSON, so a server handler's tool could
 * send the same cards. The chart kinds import recharts.
 */
import { AgentPlan, type AgentPlanStep } from '../components/AgentPlan/AgentPlan';
import { Button } from '../components/Button/Button';
import { CodeDiff } from '../components/CodeDiff/CodeDiff';
import { MessageCard } from '../components/MessageCard/MessageCard';
import { SourceChip } from '../components/SourceChip/SourceChip';
import type { ChatCardRenderers } from './context';
import {
  DemoChart,
  DemoInterrupt,
  DemoStack,
  DemoToolCall,
  type DemoChartCard,
  type DemoInterruptCard,
  type DemoStackCard,
  type DemoToolCallCard,
} from './demo-card-components';
import './demo.css';

export type { DemoChartCard, DemoInterruptCard, DemoStackCard, DemoToolCallCard };

export interface DemoProductCard {
  title: string;
  description: string;
  meta?: string;
  actions?: { label: string; variant: 'secondary' | 'tertiary' }[];
}

export interface DemoSourcesCard {
  items: { title: string; source: string; meta?: string; excerpt: string; letter?: string; index?: number }[];
}

export interface DemoDiffCard {
  diff: string;
  filename: string;
}

export interface DemoPlanCard {
  steps: AgentPlanStep[];
}

const TONES = ['one', 'two', 'three'] as const;

/** Draws every demo card kind. Pass to `ChatProvider`'s `renderers`. */
export const DEMO_RENDERERS: ChatCardRenderers = {
  'product-card': (data) => {
    const card = data as DemoProductCard;
    return (
      <MessageCard
        media={<div className="ds-chat-demo__card-media" aria-hidden="true" />}
        title={card.title}
        description={card.description}
        meta={card.meta}
        actions={card.actions?.map((action) => (
          <Button key={action.label} label={action.label} variant={action.variant} size="compact" />
        ))}
      />
    );
  },
  chart: (data) => <DemoChart card={data as DemoChartCard} />,
  sources: (data) => {
    const card = data as DemoSourcesCard;
    return (
      <div className="ds-chat-demo__source-row">
        {card.items.map((item, index) => (
          <SourceChip
            key={item.title}
            title={item.title}
            index={item.index}
            logo={
              item.letter ? (
                <span
                  className={`ds-chat-demo__logo ds-chat-demo__logo--${TONES[index % TONES.length]}`}
                  aria-hidden="true"
                >
                  {item.letter}
                </span>
              ) : undefined
            }
            source={item.source}
            meta={item.meta}
            excerpt={item.excerpt}
          />
        ))}
      </div>
    );
  },
  'tool-call': (data) => <DemoToolCall card={data as DemoToolCallCard} />,
  diff: (data) => {
    const card = data as DemoDiffCard;
    return <CodeDiff diff={card.diff} filename={card.filename} />;
  },
  plan: (data) => <AgentPlan steps={(data as DemoPlanCard).steps} />,
  interrupt: (data) => <DemoInterrupt card={data as DemoInterruptCard} />,
  stack: (data) => <DemoStack card={data as DemoStackCard} renderers={DEMO_RENDERERS} />,
};
