"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { Widget, WidgetGrid, WidgetGroup, WidgetRow } from "rift-ds/components/Widget/Widget";
import { PixelAvatar } from "rift-ds/components/PixelAvatar/PixelAvatar";
import { Sparkline } from "rift-ds/components/Sparkline/Sparkline";
import { Spinner } from "rift-ds/components/Spinner/Spinner";
import { Stat } from "rift-ds/components/Stat/Stat";
import { StatusDot } from "rift-ds/components/StatusDot/StatusDot";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";
import ComponentInstallStrip from "@/components/ComponentInstallStrip/ComponentInstallStrip";

export default function WidgetPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Widget</h1>
            <PageLinks storybookPath="/?path=/docs/components-widget--docs" />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              The tile a dashboard is made of
            </p>
            <p className={styles.introBody}>
              A widget is a titled tile: a heading, an optional count, and whatever the tile is about. Rows and groups fill it with a list, the grid packs a set of them into a board, and the translucent surface lets a page’s background through without losing the text.
            </p>
          </div>

          {/* Board */}
          <section className={styles.section}>
            <SectionTitle title="A board" />
            <p className={styles.sectionNote}>
              The grid packs tiles of different heights into columns with no holes beside the tall ones, and folds to one column as it narrows. Every figure here is made up.
            </p>
            <WidgetGrid>
              <Widget title="Working now" count={1}>
                <WidgetRow
                  leading={<Spinner size="sm" />}
                  title="Reconciling September’s books"
                  description="212 of 340 transactions matched"
                  meta="2m 13s"
                />
              </Widget>
              <Widget title="Revenue">
                <Stat value="$189k" label="Last 14 days" delta="+12% on the fortnight before" trend="up" />
                <Sparkline
                  data={[11, 14, 12, 18, 16, 3, 2, 13, 21, 24, 19, 17, 4, 15]}
                  variant="area"
                  width={360}
                  height={72}
                  label="Revenue per day, trending up"
                  style={{ width: "100%", height: "auto" }}
                />
              </Widget>
              <Widget title="Approvals" count={4}>
                <WidgetGroup label="Waiting on you">
                  <WidgetRow
                    leading={<StatusDot variant="warning" size="sm" aria-hidden="true" />}
                    title="Travel expenses, Q3 offsite"
                    description="Dana Whitfield"
                    meta="Due today"
                  />
                  <WidgetRow
                    leading={<StatusDot variant="info" size="sm" aria-hidden="true" />}
                    title="Renewal terms for Harbor & Vine"
                    description="Leo Castellanos"
                    meta="New"
                  />
                </WidgetGroup>
                <WidgetGroup label="Sent by you">
                  <WidgetRow
                    leading={<StatusDot variant="positive" size="sm" aria-hidden="true" />}
                    title="Laptops for the new hires"
                    description="Purchase order"
                    meta="Approved"
                  />
                  <WidgetRow
                    leading={<StatusDot variant="error" size="sm" aria-hidden="true" />}
                    title="Payment to Atlas Freight"
                    description="Bank transfer"
                    meta="Failed"
                  />
                </WidgetGroup>
              </Widget>
              <Widget title="This month">
                <WidgetRow title="Revenue" meta="$412,300" />
                <WidgetRow title="Gross margin" meta="61%" />
                <WidgetRow title="New customers" meta="18" />
              </Widget>
            </WidgetGrid>
          </section>

          {/* Rows */}
          <section className={styles.section}>
            <SectionTitle title="Rows" />
            <p className={styles.sectionNote}>
              A row is a leading mark, a title over a description, and a trailing fact. It is a link with an href, a button with a click handler, and a plain line otherwise, so a list only offers a target where there is somewhere to go.
            </p>
            <WidgetGrid>
              <Widget title="Recent accounts">
                {[
                  ["Harbor & Vine", "Renewal call notes", "now"],
                  ["Juniper Health", "Payment reminder sent", "12m"],
                  ["Tidewater Supply", "Contract signed", "2h"],
                ].map(([name, what, when]) => (
                  <WidgetRow
                    key={name}
                    leading={<PixelAvatar name={name} />}
                    title={name}
                    description={what}
                    meta={when}
                    onClick={() => {}}
                  />
                ))}
              </Widget>
              <Widget title="Invoices" count={3}>
                <WidgetRow title="Northwind Trading" description="Due Oct 14" meta="$12,400" />
                <WidgetRow title="Juniper Health" description="12 days late" meta="$8,950" />
                <WidgetRow title="Oakline Retail" description="Due Oct 28" meta="$21,700" />
              </Widget>
            </WidgetGrid>
          </section>

          <ComponentInstallStrip slug="widget" />
        </main>
      </div>
    </>
  );
}
