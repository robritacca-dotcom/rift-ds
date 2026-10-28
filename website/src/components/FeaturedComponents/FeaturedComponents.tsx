"use client";

import Link from "next/link";
import { AreaChart } from "rift-ds/components/Chart/AreaChart";
import { Badge } from "rift-ds/components/Badge/Badge";
import { Card } from "rift-ds/components/Card/Card";
import { ChatHeader } from "rift-ds/components/ChatHeader/ChatHeader";
import { ChatMessage } from "rift-ds/components/ChatMessage/ChatMessage";
import { Composer } from "rift-ds/components/Composer/Composer";
import { DataTable, type DataTableColumn, type DataTableRow } from "rift-ds/components/DataTable/DataTable";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import { componentPages } from "@/data/component-pages";
import styles from "./FeaturedComponents.module.css";

/**
 * The featured row at the top of /components: a few component pages picked
 * by hand, each a case-study Card whose cover stages the real component on
 * one of the core accents. The label and description come from the
 * registries through componentPages, so a card never restates a fact; only
 * the pick, the accent and the staging live here. Each cover is inert: the
 * card is one link, and nothing inside it takes focus or a click.
 */

const STATUS_VARIANT = { Shipped: "positive", Waiting: "warning", Failed: "error" } as const;

const TABLE_COLUMNS: DataTableColumn[] = [
  { key: "name", header: "Customer", sortable: true },
  {
    key: "status",
    header: "Status",
    render: (row) => (
      <Badge
        variant={STATUS_VARIANT[row.values.status as keyof typeof STATUS_VARIANT] ?? "neutral"}
        label={String(row.values.status)}
      />
    ),
  },
  { key: "price", header: "Price", align: "end" },
];

const TABLE_ROWS: DataTableRow[] = [
  { id: "r1", values: { name: "Aspen Lubin", status: "Shipped", price: "$1,899" } },
  { id: "r2", values: { name: "John Clarkson", status: "Waiting", price: "$3,412" } },
  { id: "r3", values: { name: "Kianna Vaccaro", status: "Shipped", price: "$145" } },
  { id: "r4", values: { name: "Livia Saris", status: "Failed", price: "$708" } },
  { id: "r5", values: { name: "Omar Vetrovs", status: "Waiting", price: "$1,747" } },
];

const CHART_DATA = [
  { month: "Jan", desktop: 186, mobile: 80 },
  { month: "Feb", desktop: 305, mobile: 200 },
  { month: "Mar", desktop: 237, mobile: 120 },
  { month: "Apr", desktop: 273, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "Jun", desktop: 314, mobile: 240 },
];

const STAGES: { slug: string; accent: "violet" | "cobalt" | "mint"; stage: React.ReactNode }[] = [
  {
    slug: "ai-chat",
    accent: "violet",
    stage: (
      <div className={styles.surface}>
        <ChatHeader title="Assistant" />
        <div className={styles.chatTurns}>
          <ChatMessage role="user" size="compact">
            How did the trial go?
          </ChatMessage>
          <ChatMessage role="assistant" size="compact">
            Sign-ups rose five weeks out of six, and most of the lift came from the new onboarding.
          </ChatMessage>
        </div>
        <Composer aria-label="Message" placeholder="Ask anything" aiGlow />
      </div>
    ),
  },
  {
    slug: "data-table",
    accent: "cobalt",
    stage: (
      <div className={styles.surface}>
        <DataTable
          columns={TABLE_COLUMNS}
          rows={TABLE_ROWS}
          caption="Customers"
          size="compact"
          selectable
          defaultSelectedIds={["r2"]}
        />
      </div>
    ),
  },
  {
    slug: "area-chart",
    accent: "mint",
    stage: (
      <AreaChart
        title="Visitors"
        subtitle="January to June"
        data={CHART_DATA}
        xKey="month"
        series={[
          { dataKey: "desktop", label: "Desktop" },
          { dataKey: "mobile", label: "Mobile" },
        ]}
        stacked
        height={160}
      />
    ),
  },
];

export default function FeaturedComponents() {
  const cards = STAGES.flatMap((entry) => {
    const page = componentPages.find((c) => c.slug === entry.slug);
    return page ? [{ ...entry, page }] : [];
  });
  return (
    <section id="featured" className={styles.featured}>
      <SectionTitle title="Featured" divider={false} />
      <div className={styles.grid}>
        {cards.map(({ page, accent, stage }) => (
          <Card
            key={page.slug}
            variant="case-study"
            href={`/components/${page.slug}`}
            linkComponent={Link}
            title={page.label}
            dek={page.description}
            cover={
              <div className={`${styles.cover} ${styles[accent]}`} inert>
                <div className={styles.shot}>{stage}</div>
              </div>
            }
          />
        ))}
      </div>
    </section>
  );
}
