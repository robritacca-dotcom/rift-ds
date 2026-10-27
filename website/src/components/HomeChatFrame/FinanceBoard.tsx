"use client";

import { BarChart } from "rift-ds/components/Chart/BarChart";
import { Spinner } from "rift-ds/components/Spinner/Spinner";
import { StatusDot } from "rift-ds/components/StatusDot/StatusDot";
import { Widget, WidgetGrid, WidgetGroup, WidgetRow } from "rift-ds/components/Widget/Widget";
import { MONTHLY_REVENUE } from "./reel-script";

/**
 * The home page chat's welcome board: the founder's quarter at a glance,
 * built like the demo's own board from the library's Widgets. Each tile
 * sets up a turn the reel then plays: the revenue it asks about first, the
 * expense report waiting to be read, the runway the board will ask about.
 * The figures are reel-script.ts's, so the board and the answers agree.
 */
export default function FinanceBoard() {
  return (
    <WidgetGrid>
      <Widget title="Working now" count={1}>
        <WidgetRow
          leading={<Spinner size="sm" />}
          title="Syncing the Stripe ledger"
          description="212 of 340 payouts matched"
          meta="2m"
        />
      </Widget>

      <Widget title="Revenue, 2026">
        <BarChart
          data={MONTHLY_REVENUE.map(({ month, revenue }) => ({ label: month, value: revenue }))}
          dataLabel="Revenue, $K"
          height={140}
          bare
        />
        <WidgetRow title="Q3 closed at $1.24M" meta="+18%" />
      </Widget>

      <Widget title="Waiting on you" count={3}>
        <WidgetGroup label="Before the board meets">
          <WidgetRow
            leading={<StatusDot variant="warning" size="sm" aria-hidden="true" />}
            title="Review the Q3 expenses"
            description="Lena uploaded the report"
            meta="Today"
          />
          <WidgetRow
            leading={<StatusDot variant="info" size="sm" aria-hidden="true" />}
            title="Check the runway"
            description="The board will ask"
            meta="Oct 30"
          />
          <WidgetRow
            leading={<StatusDot variant="info" size="sm" aria-hidden="true" />}
            title="Cloud contract renewal"
            description="The vendor wants an answer"
            meta="Fri"
          />
        </WidgetGroup>
      </Widget>

      <Widget title="This quarter">
        <WidgetRow title="Cash on hand" meta="$2.1M" />
        <WidgetRow title="Spend" meta="$1.03M" />
        <WidgetRow title="Runway" meta="14 months" />
      </Widget>
    </WidgetGrid>
  );
}
