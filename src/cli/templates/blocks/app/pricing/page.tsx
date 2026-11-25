'use client';

/**
 * The pricing block: the plans side by side with a monthly or yearly
 * choice, then every feature compared in one table. Prices are decimal
 * strings written through rift-ds/format, so a currency or a locale is one
 * value changed. The plans and features are placeholder for a fictional
 * product. Replace the constants below with your own.
 */

import { useState } from 'react';
import { Badge } from 'rift-ds/components/Badge/Badge';
import { Button } from 'rift-ds/components/Button/Button';
import { Grid } from 'rift-ds/components/Grid/Grid';
import { Heading } from 'rift-ds/components/Heading/Heading';
import { Icon } from 'rift-ds/components/Icon/Icon';
import { List, ListItem } from 'rift-ds/components/List/List';
import { SegmentedControl } from 'rift-ds/components/SegmentedControl/SegmentedControl';
import { Stack } from 'rift-ds/components/Stack/Stack';
import { Stat } from 'rift-ds/components/Stat/Stat';
import { Table, type TableColumn, type TableRow } from 'rift-ds/components/Table/Table';
import { Text } from 'rift-ds/components/Text/Text';
import { Widget } from 'rift-ds/components/Widget/Widget';
import { formatMoney } from 'rift-ds/format';
import { Band, MarketingShell } from '../../components/blocks/MarketingShell';
import styles from './page.module.css';

/** The currency and locale every price is written in. */
const CURRENCY = 'USD';
const LOCALE = 'en-US';

type Period = 'monthly' | 'yearly';

interface Plan {
  id: string;
  name: string;
  summary: string;
  /** The price per seat per month in each period, as a decimal string; none for a plan sold by quote. */
  price?: Record<Period, string>;
  features: string[];
  action: string;
  /** The plan most teams pick: it takes the badge and the primary button. */
  featured?: boolean;
}

const PLANS: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    summary: 'For a small team finding its feet.',
    price: { monthly: '0', yearly: '0' },
    features: ['Up to 5 people', '3 projects', 'Community support'],
    action: 'Start free',
  },
  {
    id: 'team',
    name: 'Team',
    summary: 'For a team that ships every week.',
    price: { monthly: '15', yearly: '12' },
    features: ['Unlimited people', 'Unlimited projects', 'Answers in plain words', 'Support within the hour'],
    action: 'Start free trial',
    featured: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    summary: 'For a company with rules to meet.',
    features: ['Everything in Team', 'Single sign-on', 'Audit log', 'A named contact'],
    action: 'Talk to sales',
  },
];

const yes = <Icon name="check" size="500" label="Included" />;
const no = <Icon name="remove" size="500" tone="neutral" label="Not included" />;

const COMPARE_COLUMNS: TableColumn[] = [
  { key: 'feature', header: 'Feature', rowHeader: true },
  { key: 'starter', header: 'Starter', align: 'center' },
  { key: 'team', header: 'Team', align: 'center' },
  { key: 'enterprise', header: 'Enterprise', align: 'center' },
];

const COMPARE_ROWS: TableRow[] = [
  { id: 'people', cells: { feature: 'People', starter: 'Up to 5', team: 'Unlimited', enterprise: 'Unlimited' } },
  { id: 'projects', cells: { feature: 'Projects', starter: '3', team: 'Unlimited', enterprise: 'Unlimited' } },
  { id: 'answers', cells: { feature: 'Answers in plain words', starter: no, team: yes, enterprise: yes } },
  { id: 'integrations', cells: { feature: 'Integrations', starter: '2', team: 'All', enterprise: 'All, plus your own' } },
  { id: 'sso', cells: { feature: 'Single sign-on', starter: no, team: no, enterprise: yes } },
  { id: 'audit', cells: { feature: 'Audit log', starter: no, team: no, enterprise: yes } },
  { id: 'support', cells: { feature: 'Support', starter: 'Community', team: 'Within the hour', enterprise: 'A named contact' } },
];

export default function PricingPage() {
  const [period, setPeriod] = useState<Period>('yearly');

  return (
    <MarketingShell currentHref="#pricing">
      <Band spacing="large" aria-label="Plans">
        <Stack gap="1000">
          <Stack gap="500" align="center">
            <Heading level={1} tier="display-1" align="center" balance>
              A plan for every size of team
            </Heading>
            <Text align="center" tone="neutral">
              Start free and move up when you need to. Pay yearly and keep two months.
            </Text>
            <SegmentedControl
              aria-label="Billing period"
              segments={[
                { value: 'monthly', label: 'Monthly' },
                { value: 'yearly', label: 'Yearly' },
              ]}
              value={period}
              onValueChange={(value) => setPeriod(value as Period)}
            />
          </Stack>

          <Grid minColumnWidth="280px" gap="500" align="stretch">
            {PLANS.map((plan) => (
              <Widget
                key={plan.id}
                title={plan.name}
                titleAs="h2"
                action={
                  plan.featured ? (
                    <span className={styles.tag}>
                      <Badge label="Most popular" variant="info" />
                    </span>
                  ) : undefined
                }
              >
                {/* The summary, the price and the button come before the
                    features, so they sit level across the cards however
                    many features a plan lists. */}
                <Stack gap="500">
                  <Text tone="neutral">{plan.summary}</Text>
                  {plan.price ? (
                    <Stat
                      size="large"
                      value={formatMoney(plan.price[period], { currency: CURRENCY, locale: LOCALE, fractionDigits: 0 })}
                      label={period === 'yearly' ? 'per person each month, billed yearly' : 'per person each month'}
                    />
                  ) : (
                    <Stat size="large" value="Custom" label="priced to fit your company" />
                  )}
                  <Button
                    variant={plan.featured ? 'primary' : 'secondary'}
                    tone={plan.featured ? 'default' : 'neutral'}
                    label={plan.action}
                    href="#"
                    className={styles.full}
                  />
                  <List variant="unordered" marker="check">
                    {plan.features.map((feature) => (
                      <ListItem key={feature}>{feature}</ListItem>
                    ))}
                  </List>
                </Stack>
              </Widget>
            ))}
          </Grid>
        </Stack>
      </Band>

      <Band surface="raised">
        <Stack gap="1000">
          <Heading level={2} tier="display-2">Compare the plans</Heading>
          <Table columns={COMPARE_COLUMNS} rows={COMPARE_ROWS} bordered caption="What each plan includes" captionHidden />
        </Stack>
      </Band>
    </MarketingShell>
  );
}
