"use client";

import { BarChart } from "rift-ds/components/Chart/BarChart";
import { Prose } from "rift-ds/components/Prose/Prose";
import { Stat } from "rift-ds/components/Stat/Stat";
import { Table } from "rift-ds/components/Table/Table";
import { MONTHLY_REVENUE, Q3_SPEND, RUNWAY } from "./reel-script";
import styles from "./HomeChatFrame.module.css";

/**
 * The board update the reel's assistant writes: the whole thread's findings
 * as one report, opened in the widget's artifact panel. Drawn from the
 * library (Prose, Stat, BarChart, Table) through an artifact renderer, so it
 * wears the theme like the rest of the frame, and from reel-script.ts's
 * figures, so the report and the answers before it agree.
 */
export default function BoardReport() {
  return (
    <article className={styles.report}>
      <Prose>
        <h2>Q3 board update</h2>
        <p>
          Revenue grew faster than any quarter this year, and one cost grew faster still. Cutting cloud spend
          by a fifth from October adds three months of runway without slowing hiring.
        </p>
      </Prose>

      <div className={styles.reportStats}>
        <Stat value="$1.24M" label="Q3 revenue" delta="18% on Q2" trend="up" />
        <Stat value="$1.03M" label="Q3 spend" delta="9% on Q2" trend="up" />
        <Stat value="14 months" label="Runway today" delta="17 with the cut" trend="neutral" />
      </div>

      <Prose>
        <h3>Revenue</h3>
        <p>Expansion in existing accounts brought in 64% of the quarter. New customers slowed in August and recovered in September.</p>
      </Prose>
      <BarChart
        data={MONTHLY_REVENUE.map(({ month, revenue }) => ({ label: month, value: revenue }))}
        dataLabel="Revenue, $K"
        height={160}
        bare
      />

      <Prose>
        <h3>Spend</h3>
        <p>Payroll is most of the spend and grew with the team. Cloud hosting grew 41%, the one line outpacing revenue.</p>
      </Prose>
      <BarChart
        data={Q3_SPEND.map(({ category, spend }) => ({ label: category, value: spend }))}
        dataLabel="Spend, $K"
        height={160}
        bare
      />

      <Prose>
        <h3>Runway</h3>
      </Prose>
      <Table
        size="compact"
        bordered
        caption="Runway by scenario"
        captionHidden
        columns={[
          { key: "scenario", header: "Scenario", rowHeader: true },
          { key: "months", header: "Months of cash", align: "end" },
        ]}
        rows={RUNWAY.map(({ scenario, months }) => ({ id: scenario, cells: { scenario, months } }))}
      />

      <Prose>
        <h3>The ask</h3>
        <p>Approve a 20% cut to cloud spend from October, so it lands inside this quarter. Hiring stays as planned.</p>
      </Prose>
    </article>
  );
}
