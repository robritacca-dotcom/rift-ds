'use client';

/**
 * What the demo's welcome screen holds under its composer beyond the plain
 * starters: PromptSuggestions as tiles or cards, or a board of Widgets, each
 * seated in ChatWidget's `widgets` slot. Every prompt here is one the demo
 * script has an answer for, so pressing a tile gets a reply about what the
 * tile said.
 */
import { BarChart } from '../components/Chart/BarChart';
import { PixelAvatar } from '../components/PixelAvatar/PixelAvatar';
import { PromptSuggestions, type PromptSuggestion } from '../components/PromptSuggestions/PromptSuggestions';
import { Spinner } from '../components/Spinner/Spinner';
import { StatusDot } from '../components/StatusDot/StatusDot';
import { Widget, WidgetGrid, WidgetGroup, WidgetRow } from '../components/Widget/Widget';
import type { DemoWelcomeVariant } from './demo-fixtures';

/* A suggestion's id is the prompt it sends. */
const LINKS: PromptSuggestion[] = [
  { id: 'How do I get started?', icon: 'rocket_launch', label: 'Get started', description: 'Set up a workspace' },
  { id: 'What do the plans include?', icon: 'sell', label: 'Plans', description: 'What each one includes' },
  { id: 'Invite my team to a workspace', icon: 'group_add', label: 'Team', description: 'Invite the others' },
  { id: 'How is the trial going?', icon: 'monitoring', label: 'Trial', description: 'Signups so far' },
];

const CARDS: PromptSuggestion[] = [
  {
    id: 'Set it all up for me',
    icon: 'auto_awesome',
    label: 'Set up the workspace',
    description: 'Roles, channels and the first project, done for you.',
  },
  {
    id: 'Which plan fits a team of five?',
    icon: 'sell',
    label: 'Pick a plan',
    description: 'Which plan fits a team of five?',
  },
  {
    id: 'Find a time we can all meet',
    icon: 'event',
    label: 'Find a time',
    description: 'A slot the whole team has free this week.',
  },
];

const BOARD_SIGNUPS = [
  { label: 'W1', value: 320 },
  { label: 'W2', value: 410 },
  { label: 'W3', value: 380 },
  { label: 'W4', value: 520 },
  { label: 'W5', value: 560 },
  { label: 'W6', value: 640 },
];

const BOARD_PROJECTS: [string, string, string][] = [
  ['Workspace revamp', '4 open tasks', '1m'],
  ['Billing cleanup', 'Waiting on finance', '3d'],
  ['Launch week', 'Plan attached', '5d'],
];

/** A board of Widgets for the welcome slot: the chat as a home page. */
export function DemoBoard({ onAsk }: { onAsk: (prompt: string) => void }) {
  return (
    <WidgetGrid>
      <Widget title="Working now" count={1}>
        <WidgetRow
          leading={<Spinner size="sm" />}
          title="Importing last year’s invoices"
          description="212 of 340 matched"
          meta="2m 13s"
        />
      </Widget>

      <Widget title="Trial signups">
        <BarChart data={BOARD_SIGNUPS} dataLabel="Signups" height={140} bare />
        <WidgetRow title="How is the trial going?" meta="Ask" onClick={() => onAsk('How is the trial going?')} />
      </Widget>

      <Widget title="Projects" count={BOARD_PROJECTS.length}>
        {BOARD_PROJECTS.map(([name, state, when]) => (
          <WidgetRow key={name} leading={<PixelAvatar name={name} />} title={name} description={state} meta={when} />
        ))}
      </Widget>

      <Widget title="To do" count={4}>
        <WidgetGroup label="Waiting on you">
          <WidgetRow
            leading={<StatusDot variant="warning" size="sm" aria-hidden="true" />}
            title="Invite the other three"
            description="2 of 5 seats filled"
            meta="Today"
            onClick={() => onAsk('Go ahead and invite the other three')}
          />
          <WidgetRow
            leading={<StatusDot variant="info" size="sm" aria-hidden="true" />}
            title="Choose a plan"
            description="Trial ends in 9 days"
            meta="Oct 19"
            onClick={() => onAsk('Which plan fits a team of five?')}
          />
        </WidgetGroup>
        <WidgetGroup label="In progress">
          <WidgetRow
            leading={<StatusDot variant="positive" size="sm" aria-hidden="true" />}
            title="Shared calendar"
            description="Synced an hour ago"
            meta="On"
          />
          <WidgetRow
            leading={<StatusDot variant="neutral" size="sm" aria-hidden="true" />}
            title="Mention notifications"
            description="Quiet hours, 6pm to 8am"
            meta="Paused"
          />
        </WidgetGroup>
      </Widget>

      <Widget title="This week">
        <WidgetRow title="Signups" meta="640" />
        <WidgetRow title="Seats in use" meta="5 of 12" />
        <WidgetRow title="Messages sent" meta="1,284" />
      </Widget>
    </WidgetGrid>
  );
}

/**
 * The welcome slot's content for a variant, or nothing for the two that
 * leave the slot empty (`starters` is the widget's own, `none` is none).
 */
export function DemoWelcome({
  variant,
  onAsk,
}: {
  variant: DemoWelcomeVariant;
  onAsk: (prompt: string) => void;
}) {
  if (variant === 'links') {
    return <PromptSuggestions layout="tiles" ariaLabel="Places to start" suggestions={LINKS} onValueChange={onAsk} />;
  }
  if (variant === 'cards') {
    return <PromptSuggestions layout="cards" ariaLabel="Things to ask" suggestions={CARDS} onValueChange={onAsk} />;
  }
  if (variant === 'dashboard') return <DemoBoard onAsk={onAsk} />;
  return null;
}
