"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { Prose } from "@robr0/design-system/components/Prose/Prose";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";


export default function ProsePage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Prose</h1>
            <PageLinks storybookPath="/?path=/docs/components-prose--docs" />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              The typography kit for rendered agent markdown
            </p>
            <p className={styles.introBody}>
              The package ships no markdown renderer. You render markdown with
              whatever library you already use, wrap the output in Prose, and
              every heading, paragraph, list, link, code span, quote and table
              inside it picks up the token scale. One wrapper, and rich agent
              output looks like it belongs.
            </p>
          </div>

          {/* Body and headings */}
          <section className={styles.section}>
            <SectionTitle title="Body and headings" />
            <p className={styles.demoText}>
              Body text sits on the paragraph scale and headings step down the
              heading tiers, so hierarchy is carried by the tokens rather than
              by anything Prose invents. Margins are trimmed at the edges, so
              the block slots into a bubble or card with no stray spacing.
            </p>
            <div className={styles.surface}>
              <Prose data-anchor-ignore>
                <h2>Migrating the Lumen widgets</h2>
                <p>
                  The <code>lumen-panel</code> package splits its widgets into
                  two entry points, so the first step is deciding which side of
                  the line each one sits on. Anything that touches the network
                  moves to <code>lumen-panel/live</code>; everything else stays
                  put.
                </p>
                <h3>What changes for consumers</h3>
                <p>
                  Most imports keep working. The{" "}
                  <strong>three exceptions</strong> are the widgets that used
                  to bundle their own polling logic, which is now{" "}
                  <em>opt-in</em> rather than automatic:
                </p>
                <ul>
                  <li>
                    <code>TickerStrip</code> takes a <code>refresh</code> prop
                    instead of polling on mount
                  </li>
                  <li>
                    <code>QueueDepth</code> reads from the shared feed context
                  </li>
                  <li>
                    <code>UplinkBadge</code> is now purely presentational
                  </li>
                </ul>
                <p>
                  The full mapping is in the{" "}
                  <a href="#migration-table">migration table</a> below, and
                  each entry links to the widget it replaces.
                </p>
              </Prose>
            </div>
          </section>

          {/* Code */}
          <section className={styles.section}>
            <SectionTitle title="Code" />
            <p className={styles.demoText}>
              Inline code and code blocks both use the code font. The pre
              block here is the plain fallback that scrolls sideways instead
              of wrapping; reach for CodeBlock when standalone code deserves a
              header and a copy button.
            </p>
            <div className={styles.surface}>
              <Prose data-anchor-ignore>
                <p>
                  The feed context wires up in one place, at the top of the
                  panel tree:
                </p>
                <pre>
                  <code>{`import { FeedProvider } from 'lumen-panel/live';

export function Dashboard() {
  return (
    <FeedProvider interval={5000}>
      <QueueDepth />
    </FeedProvider>
  );
}`}</code>
                </pre>
                <p>
                  Every widget below the provider stays in step with the same
                  schedule, so <code>QueueDepth</code> and{" "}
                  <code>TickerStrip</code> never fight for the connection.
                </p>
              </Prose>
            </div>
          </section>

          {/* Quotes and tables */}
          <section className={styles.section}>
            <SectionTitle title="Quotes and tables" />
            <p className={styles.demoText}>
              Blockquotes take the same quiet left rail as a reasoning trace,
              and tables get collapsed borders with a tinted header row. Both
              come straight out of a markdown renderer with no extra classes.
              A table sizes to its content rather than stretching to fill the
              column, which is what lets it scroll when it runs out of room.
            </p>
            <div className={styles.surface}>
              <Prose data-anchor-ignore>
                <p>The changelog puts the reasoning plainly:</p>
                <blockquote>
                  <p>
                    Widgets that fetch on their own schedule fight each other
                    for the connection. One provider, one schedule, and every
                    widget below it stays in step.
                  </p>
                </blockquote>
                <table id="migration-table" className={styles.anchorTarget}>
                  <thead>
                    <tr>
                      <th>Widget</th>
                      <th>Entry point</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>TickerStrip</td>
                      <td>
                        <code>live</code>
                      </td>
                      <td>Pass a refresh interval</td>
                    </tr>
                    <tr>
                      <td>QueueDepth</td>
                      <td>
                        <code>live</code>
                      </td>
                      <td>Reads the feed context</td>
                    </tr>
                    <tr>
                      <td>UplinkBadge</td>
                      <td>
                        <code>core</code>
                      </td>
                      <td>Presentational only</td>
                    </tr>
                  </tbody>
                </table>
                <hr />
                <p>
                  Everything not listed here is unchanged and imports from the
                  package root as before.
                </p>
              </Prose>
            </div>
          </section>

          {/* Wide tables in a narrow column */}
          <section className={styles.section}>
            <SectionTitle title="Tables in a narrow column" />
            <p className={styles.demoText}>
              A markdown table can be wider than the space it lands in. Rather
              than squeeze the columns until the headings break apart, the
              table becomes its own scroll container and keeps its natural
              width. Prose styles markup it does not render, so it cannot add a
              wrapping element: add <code>{`tabIndex={0}`}</code> to the table when
              the scroll needs to be reachable by keyboard alone.
            </p>
            <div className={styles.narrowColumn}>
              <Prose size="sm" data-anchor-ignore>
                <p>The roles that moved in the reorg:</p>
                <table tabIndex={0}>
                  <thead>
                    <tr>
                      <th>Company</th>
                      <th>Role</th>
                      <th>Years</th>
                      <th>Team</th>
                      <th>Location</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Northwind</td>
                      <td>Designer</td>
                      <td>2019</td>
                      <td>Platform</td>
                      <td>Vancouver</td>
                      <td>Archived</td>
                    </tr>
                    <tr>
                      <td>Contoso</td>
                      <td>Lead</td>
                      <td>2023</td>
                      <td>Signals</td>
                      <td>Remote</td>
                      <td>Active</td>
                    </tr>
                  </tbody>
                </table>
                <p>Everything else keeps the reporting line it had.</p>
              </Prose>
            </div>
          </section>

          {/* Small size */}
          <section className={styles.section}>
            <SectionTitle title="Small size" />
            <p className={styles.demoText}>
              The small size drops body text to the small paragraph scale for
              dense chat contexts, while headings keep their tiers. Use it
              inside message bubbles where the default scale would feel
              oversized.
            </p>
            <div className={styles.bubble}>
              <Prose size="sm" data-anchor-ignore>
                <p>
                  Done. I renamed the three <code>lumen-panel</code> widgets
                  and updated every import. Two things worth knowing:
                </p>
                <ol>
                  <li>
                    <strong>TickerStrip</strong> no longer polls on mount, so
                    pass <code>refresh</code> where you need live data
                  </li>
                  <li>
                    <strong>UplinkBadge</strong> lost its network code entirely
                    and is safe in server components
                  </li>
                </ol>
                <p>
                  The build is green and <em>nothing else</em> changed.
                </p>
              </Prose>
            </div>
          </section>
        </main>
      </div>

    </>
  );
}
