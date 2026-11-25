/**
 * The landing block: a product's front page as a stack of bands. A hero,
 * the names that vouch for it, what it does, the numbers, what customers
 * say, the questions people ask, and a closing call to act. Every section
 * is composed from rift-ds components; the copy is placeholder for a
 * fictional product. Replace the constants below with your own.
 */

import { Accordion, type AccordionItem } from 'rift-ds/components/Accordion/Accordion';
import { Button } from 'rift-ds/components/Button/Button';
import { Grid } from 'rift-ds/components/Grid/Grid';
import { Heading } from 'rift-ds/components/Heading/Heading';
import { Icon } from 'rift-ds/components/Icon/Icon';
import { Panel } from 'rift-ds/components/Panel/Panel';
import { Quote } from 'rift-ds/components/Quote/Quote';
import { Stack } from 'rift-ds/components/Stack/Stack';
import { Stat } from 'rift-ds/components/Stat/Stat';
import { Text } from 'rift-ds/components/Text/Text';
import { Band, MarketingShell } from '../../components/blocks/MarketingShell';
import styles from './page.module.css';

/** The companies named under the hero. Swap the names for logo images of one height. */
const CUSTOMERS = ['Northwind', 'Lumen', 'Harbor', 'Fieldstone', 'Juniper', 'Atlas'];

/** What the product does, three to six at a time. */
const FEATURES = [
  { icon: 'bolt', title: 'Fast from the first click', body: 'Pages open in a blink, so the team stays in the work and out of the spinner.' },
  { icon: 'hub', title: 'Everything in one place', body: 'Plans, tasks and notes share one home, with nothing to copy between tools.' },
  { icon: 'lock', title: 'Private by default', body: 'Your data stays yours, with access you set per person and per project.' },
  { icon: 'insights', title: 'Answers, not dashboards', body: 'Ask a question in plain words and get the number, with where it came from.' },
  { icon: 'sync', title: 'Works with what you use', body: 'Connect the tools you already run and keep them in step both ways.' },
  { icon: 'support_agent', title: 'People when you need them', body: 'A real person answers within the hour, every working day.' },
];

/** The numbers that make the case. */
const STATS = [
  { value: '12,000+', label: 'Teams on Acme' },
  { value: '99.99%', label: 'Uptime over the last year' },
  { value: '38%', label: 'Less time in status meetings' },
  { value: '4.8 / 5', label: 'Average customer rating' },
];

/** What customers say. Use real words from real people, with their say-so. */
const QUOTES = [
  { body: 'We replaced three tools in a week, and nobody asked for the old ones back.', attribution: 'Dana Whitfield', detail: 'Head of Operations, Northwind' },
  { body: 'It is the first planning tool the engineers opened without being told to.', attribution: 'Marcus Oyelaran', detail: 'VP Engineering, Lumen' },
  { body: 'Setup took an afternoon. The Monday meeting has not happened since.', attribution: 'Priya Raman', detail: 'Founder, Fieldstone' },
];

/** The questions people ask before they sign up. */
const FAQ: AccordionItem[] = [
  { id: 'trial', title: 'Is there a free trial?', content: 'Yes. Every plan starts with 14 days free, with no card needed until you choose to stay.' },
  { id: 'import', title: 'Can I bring my existing data?', content: 'You can import from a spreadsheet or from the tools most teams start on, and we will help with anything larger.' },
  { id: 'security', title: 'How is my data protected?', content: 'Data is encrypted in transit and at rest, and access is set per person and per project.' },
  { id: 'cancel', title: 'What happens if I cancel?', content: 'You keep access until the end of the period you paid for, and you can export everything at any time.' },
];

export default function LandingPage() {
  return (
    <MarketingShell currentHref="#product">
      {/* Hero: one line that says what it is, one that says why, two ways forward. */}
      <Band spacing="large" aria-label="Introduction">
        <Stack gap="500" align="center" className={styles.hero}>
          <Text tier="overline" tone="neutral">New: answers in plain words</Text>
          <Heading level={1} tier="display-1" align="center" balance>
            Plan, ship and learn in one place
          </Heading>
          <Text align="center" tone="neutral">
            Acme brings your plans, your tasks and your numbers together, so the whole team sees the same picture and moves on it.
          </Text>
          <Stack direction="row" gap="300" justify="center" wrap>
            <Button variant="primary" label="Start free" href="#" />
            <Button variant="secondary" tone="neutral" label="See how it works" href="#features" />
          </Stack>
        </Stack>
      </Band>

      {/* The names that vouch for it. */}
      <Band surface="raised" aria-label="Customers">
        <Stack gap="400" align="center">
          <Text tier="paragraph-sm" tone="neutral" align="center">Trusted by teams at</Text>
          <ul className={styles.customers}>
            {CUSTOMERS.map((name) => (
              <li key={name} className={styles.customer}>{name}</li>
            ))}
          </ul>
        </Stack>
      </Band>

      {/* What it does. */}
      <Band id="features">
        <Stack gap="1000">
          <Stack gap="500" className={styles.sectionHead}>
            <Heading level={2} tier="display-2" balance>Everything a team needs to move</Heading>
            <Text tone="neutral">Six things Acme does well, so you can stop holding the rest together by hand.</Text>
          </Stack>
          <Grid minColumnWidth="280px" gap="500" as="ul" className={styles.plainList}>
            {FEATURES.map((feature) => (
              <li key={feature.title}>
                <Panel className={styles.feature}>
                  <Icon name={feature.icon} size="800" tile />
                  <Heading level={3}>{feature.title}</Heading>
                  <Text tone="neutral">{feature.body}</Text>
                </Panel>
              </li>
            ))}
          </Grid>
        </Stack>
      </Band>

      {/* The numbers. */}
      <Band surface="raised" aria-label="Acme in numbers">
        <Grid columns={4} minColumnWidth="180px" gap="500">
          {STATS.map((stat) => (
            <Stat key={stat.label} size="large" value={stat.value} label={stat.label} />
          ))}
        </Grid>
      </Band>

      {/* What customers say. */}
      <Band>
        <Stack gap="1000">
          <Heading level={2} tier="display-2" balance className={styles.sectionHead}>
            Teams that switched, in their words
          </Heading>
          <Grid minColumnWidth="280px" gap="1000">
            {QUOTES.map((quote) => (
              <Quote key={quote.attribution} attribution={quote.attribution} detail={quote.detail}>
                {quote.body}
              </Quote>
            ))}
          </Grid>
        </Stack>
      </Band>

      {/* The questions people ask. */}
      <Band surface="raised" width="narrow">
        <Stack gap="1000">
          <Heading level={2} tier="display-2">Questions, answered</Heading>
          <Accordion items={FAQ} />
        </Stack>
      </Band>

      {/* The closing call to act. */}
      <Band spacing="large" width="narrow" aria-label="Get started">
        <Stack gap="500" align="center">
          <Heading level={2} tier="display-2" align="center" balance>Ready when your team is</Heading>
          <Text align="center" tone="neutral">Start free for 14 days. No card, no call, no catch.</Text>
          <Stack direction="row" gap="300" justify="center" wrap>
            <Button variant="primary" label="Start free" href="#" />
            <Button variant="tertiary" label="See pricing" href="#" iconRight="arrow_forward" />
          </Stack>
        </Stack>
      </Band>
    </MarketingShell>
  );
}
