"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { ArtifactPanel } from "rift-ds/components/ArtifactPanel/ArtifactPanel";
import { Button } from "rift-ds/components/Button/Button";
import { CircularButton } from "rift-ds/components/CircularButton/CircularButton";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";
import ComponentInstallStrip from "@/components/ComponentInstallStrip/ComponentInstallStrip";

/* Demo data: Fernway Trails is a fictional walking club, and every figure,
   page and file below is invented set dressing. */

const BOARD_TILES = [
  { label: "Walks this month", value: "14" },
  { label: "Members out", value: "212" },
  { label: "Distance covered", value: "386 km" },
];

const BOARD_ROUTES = [
  { name: "Heron Loop", share: 82, walkers: "64" },
  { name: "Quarry Rise", share: 61, walkers: "48" },
  { name: "Mill Lane", share: 47, walkers: "37" },
  { name: "Alder Fen", share: 28, walkers: "22" },
];

function TrailBoard() {
  return (
    <div className={styles.board}>
      <div className={styles.boardTiles}>
        {BOARD_TILES.map((tile) => (
          <div key={tile.label} className={styles.boardTile}>
            <span className={styles.boardLabel}>{tile.label}</span>
            <span className={styles.boardValue}>{tile.value}</span>
          </div>
        ))}
      </div>
      <p className={styles.boardHeading}>Walkers by route</p>
      <div className={styles.boardRows}>
        {BOARD_ROUTES.map((route) => (
          <div key={route.name} className={styles.boardRow}>
            <span className={styles.boardRowLabel}>{route.name}</span>
            <span className={styles.boardTrack}>
              <span className={styles.boardBar} style={{ width: `${route.share}%` }} />
            </span>
            <span className={styles.boardRowValue}>{route.walkers}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* A complete static document: inline styles only, no scripts and nothing
   fetched, so the sandboxed frame draws it from the string alone. The
   colours are the document's own, because a framed page cannot read the
   host's tokens. */
const SIGNUP_PAGE = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Fernway Trails spring walk</title>
  </head>
  <body style="margin: 0; font-family: system-ui, sans-serif; color: #1f2a2e; background: #f4f7f5;">
    <main style="max-width: 520px; margin: 0 auto; padding: 40px 24px;">
      <p style="margin: 0 0 8px; font-size: 13px; letter-spacing: 0.08em; text-transform: uppercase; color: #5a6b70;">Fernway Trails</p>
      <h1 style="margin: 0 0 12px; font-size: 30px; line-height: 1.2;">Spring walk on the Heron Loop</h1>
      <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.5;">Nine kilometres around the reservoir, with a stop at the bird hide. Meet at the east car park at 9am on Saturday.</p>
      <ul style="margin: 0 0 24px; padding: 0 0 0 20px; font-size: 15px; line-height: 1.7;">
        <li>Easy going, mostly flat</li>
        <li>About three hours with the stop</li>
        <li>Dogs welcome on a lead</li>
      </ul>
      <p style="display: inline-block; margin: 0; padding: 12px 20px; border-radius: 999px; font-size: 15px; font-weight: 600; color: #ffffff; background: #1f5c4a;">Places left: 18</p>
    </main>
  </body>
</html>`;

const ROUTE_CODE = `type Route = {
  name: string;
  distanceKm: number;
  walkers: number;
};

const routes: Route[] = [
  { name: "Heron Loop", distanceKm: 9, walkers: 64 },
  { name: "Quarry Rise", distanceKm: 12, walkers: 48 },
  { name: "Mill Lane", distanceKm: 6, walkers: 37 },
];

export function busiestRoute(list: Route[] = routes): Route {
  return list.reduce((top, route) =>
    route.walkers > top.walkers ? route : top,
  );
}`;

function LivePreview() {
  const [shown, setShown] = React.useState(true);
  const [expanded, setExpanded] = React.useState(false);
  return (
    <div
      className={`${styles.panelFrame} ${expanded && shown ? styles.panelFrameExpanded : ""}`}
      data-anchor-ignore
    >
      {shown ? (
        <ArtifactPanel
          title="Trail report"
          meta="Dashboard"
          icon="dashboard"
          expanded={expanded}
          onExpandedChange={setExpanded}
          onClose={() => setShown(false)}
        >
          <TrailBoard />
        </ArtifactPanel>
      ) : (
        <div className={styles.panelPlaceholder}>
          <Button
            variant="secondary"
            iconLeft="dashboard"
            label="Show the panel"
            onClick={() => setShown(true)}
          />
        </div>
      )}
    </div>
  );
}

export default function ArtifactPanelPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Artifact panel</h1>
            <PageLinks storybookPath="/?path=/docs/components-artifactpanel--docs" />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>What the chat made, beside the chat</p>
            <p className={styles.introBody}>
              Artifact panel is the surface a chat opens next to the
              conversation to show something it made: a dashboard, a page, a
              site. A header names the artifact and holds its controls, and
              the body is the preview or the source. It is surface-less and
              fills the box it is given, so the host paints the card around
              it and gives that card a definite height.
            </p>
          </div>

          <section className={styles.section}>
            <SectionTitle title="Live content as the preview" />
            <p className={styles.demoText}>
              Children render straight into the body as React content, which
              scrolls under a header that stays put. Content brings its own
              padding, so a dashboard can sit inset and a full-bleed page can
              run to the edge. The expand toggle appears when onExpandedChange
              is given and the close button when onClose is given. Both only
              report intent: the panel never sizes or removes itself. Here the
              page grows the frame on expand and swaps in a button on close.
            </p>
            <LivePreview />
          </section>

          <section className={styles.section}>
            <SectionTitle title="An HTML document, with its source" />
            <p className={styles.demoText}>
              Pass html and the body draws the document in a sandboxed frame
              with an origin of its own, so it has no reach into the host
              page. Add code and the header gains a Preview and Code switch.
              The panel keeps the chosen view itself unless the host passes
              view and onViewChange. A src URL is framed the same way, for a
              page that is already deployed.
            </p>
            <div className={styles.panelFrame} data-anchor-ignore>
              <ArtifactPanel
                title="Spring walk sign-up"
                meta="Page"
                icon="web"
                html={SIGNUP_PAGE}
                code={SIGNUP_PAGE}
                language="html"
              />
            </div>
          </section>

          <section className={styles.section}>
            <SectionTitle title="Code only" />
            <p className={styles.demoText}>
              With code and no preview there is nothing to switch between, so
              the switch is left out and the body shows the source. The
              language prop labels the code view.
            </p>
            <div
              className={`${styles.panelFrame} ${styles.panelFrameShort}`}
              data-anchor-ignore
            >
              <ArtifactPanel
                title="routes.ts"
                meta="TypeScript"
                icon="code"
                code={ROUTE_CODE}
                language="typescript"
              />
            </div>
          </section>

          <section className={styles.section}>
            <SectionTitle title="Header actions" />
            <p className={styles.demoText}>
              The actions slot seats extra controls ahead of the expand and
              close buttons: a download, a share, a version menu. Tertiary
              Circular buttons match the two the panel draws itself. When the
              row runs short the meta line gives way first, then the title
              truncates, and the controls keep their place.
            </p>
            <div
              className={`${styles.panelFrame} ${styles.panelFrameShort}`}
              data-anchor-ignore
            >
              <ArtifactPanel
                title="Trail report"
                meta="Version 3"
                icon="dashboard"
                onExpandedChange={() => {}}
                onClose={() => {}}
                actions={
                  <>
                    <CircularButton
                      icon="download"
                      variant="tertiary"
                      ariaLabel="Download the report"
                      tooltipPosition="bottom"
                    />
                    <CircularButton
                      icon="ios_share"
                      variant="tertiary"
                      ariaLabel="Share the report"
                      tooltipPosition="bottom"
                    />
                  </>
                }
              >
                <TrailBoard />
              </ArtifactPanel>
            </div>
          </section>

          <ComponentInstallStrip slug="artifact-panel" />
        </main>
      </div>
    </>
  );
}
