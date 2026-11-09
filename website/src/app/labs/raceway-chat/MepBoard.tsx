"use client";

/**
 * The welcome board: the chat as the project's home page, after the chat
 * home template's DemoBoard. Widgets only: the latest generation and its
 * trades, the clashes the coordination check found, what is waiting on the
 * designer, the takeoff, and the dates ahead, under a model tile across
 * the board: a still of the building and the quick links into the 3D
 * model, each drawn from the same generator (ModelPreview). The counts are
 * the generator's own. Every row that leads somewhere asks the assistant,
 * so the board is a set of starting points into the chat, not a second
 * app; a quick link's line the page answers itself, so the model opens at
 * once.
 */

import React from "react";
import { BarChart } from "rift-ds/components/Chart/BarChart";
import { Button } from "rift-ds/components/Button/Button";
import { StatusDot } from "rift-ds/components/StatusDot/StatusDot";
import { Widget, WidgetGrid, WidgetGroup, WidgetRow } from "rift-ds/components/Widget/Widget";
import { DISCIPLINE_LABEL, MEP_DISCIPLINES, generateBuilding, levelName } from "./_lib/building";
import { MILESTONES, REVIT_MODEL, RUNS, tasks } from "./_data/project";
import { quickLinks } from "./_data/quick-links";
import ModelPreview from "./ModelPreview";
import styles from "./RacewayChatHome.module.css";

const SWATCH = {
  mechanical: styles.swatchMechanical,
  plumbing: styles.swatchPlumbing,
  fire: styles.swatchFire,
  electrical: styles.swatchElectrical,
};

const integer = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

export default function MepBoard({ onAsk }: { onAsk: (prompt: string) => void }) {
  const { elements, clashes, takeoff } = generateBuilding();
  const current = RUNS[0];
  const clashesByTrade = MEP_DISCIPLINES.map((d) => ({
    label: DISCIPLINE_LABEL[d].split(" ")[0],
    value: clashes.filter((c) => c.trades.includes(DISCIPLINE_LABEL[d])).length,
  }));
  const todo = tasks();
  const { hero, links } = quickLinks();

  return (
    <div className={styles.board}>
    <Widget
      title="Model"
      description={`${REVIT_MODEL.file} · Generation ${current.number} · ${integer.format(elements.length)} elements`}
      action={<Button variant="secondary" tone="neutral" size="compact" iconLeft="view_in_ar" label="Open in 3D" onClick={() => onAsk(hero.prompt)} />}
    >
      <div className={styles.modelTile}>
        <button type="button" className={styles.heroLink} onClick={() => onAsk(hero.prompt)}>
          <ModelPreview spec={hero.preview} />
          <span className={styles.linkCaption}>
            <span className={styles.linkLabel}>{hero.label}</span>
            <span className={styles.linkMeta}>{hero.meta}</span>
          </span>
        </button>
        <ul className={styles.quickLinks} aria-label="Quick views">
          {links.map((link) => (
            <li key={link.id}>
              <button type="button" className={styles.quickLink} onClick={() => onAsk(link.prompt)}>
                <ModelPreview spec={link.preview} />
                <span className={styles.linkCaption}>
                  <span className={styles.linkLabel}>{link.label}</span>
                  <span className={styles.linkMeta}>{link.meta}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </Widget>

    <WidgetGrid>
      <Widget title={`Generation ${current.number}`} description={`${current.label} · ${integer.format(elements.length)} elements`}>
        {takeoff.map((trade) => (
          <WidgetRow
            key={trade.discipline}
            leading={<span className={`${styles.swatch} ${SWATCH[trade.discipline]}`} aria-hidden="true" />}
            title={trade.label}
            description={trade.items.slice(0, 2).map((i) => `${i.value} ${i.label.toLowerCase()}`).join(" · ")}
            meta={integer.format(trade.elements)}
          />
        ))}
        <WidgetRow title="Open the model in 3D" meta="Open" onClick={() => onAsk(hero.prompt)} />
      </Widget>

      <Widget title="Clashes" count={clashes.length}>
        {clashes.slice(0, 4).map((clash) => (
          <WidgetRow
            key={clash.number}
            leading={<StatusDot variant="warning" size="sm" aria-hidden="true" />}
            title={clash.trades}
            description={levelName(clash.level)}
            meta={`#${clash.number}`}
            onClick={() => onAsk(`Show me clash ${clash.number}`)}
          />
        ))}
        <WidgetRow title="Walk me through them" meta="Ask" onClick={() => onAsk("Walk me through the clashes")} />
      </Widget>

      <Widget title="Waiting on you" count={todo.length}>
        <WidgetGroup label="Today">
          {todo.filter((t) => t.due === "Today").map((task) => (
            <WidgetRow
              key={task.id}
              leading={<StatusDot variant={task.tone} size="sm" aria-hidden="true" />}
              title={task.title}
              description={task.detail}
              meta={task.due}
              onClick={() => onAsk(task.prompt)}
            />
          ))}
        </WidgetGroup>
        <WidgetGroup label="This week">
          {todo.filter((t) => t.due !== "Today").map((task) => (
            <WidgetRow
              key={task.id}
              leading={<StatusDot variant={task.tone} size="sm" aria-hidden="true" />}
              title={task.title}
              description={task.detail}
              meta={task.due}
              onClick={() => onAsk(task.prompt)}
            />
          ))}
        </WidgetGroup>
      </Widget>

      <Widget title="Clashes by trade" description="Each clash counts for both trades">
        <BarChart data={clashesByTrade} dataLabel="Clashes" height={140} bare />
        <WidgetRow title="Which trade should move?" meta="Ask" onClick={() => onAsk("Which trade should move to clear the clashes?")} />
      </Widget>

      <Widget title="Generations" count={RUNS.length}>
        {RUNS.map((run) => (
          <WidgetRow
            key={run.number}
            leading={<StatusDot variant={run.status === "review" ? "info" : "neutral"} size="sm" aria-hidden="true" />}
            title={`Generation ${run.number}`}
            description={run.note}
            meta={run.when}
          />
        ))}
      </Widget>

      <Widget title="Coming up" count={MILESTONES.length}>
        {MILESTONES.map((m) => (
          <WidgetRow key={m.title} title={m.title} meta={m.when} />
        ))}
      </Widget>
    </WidgetGrid>
    </div>
  );
}
