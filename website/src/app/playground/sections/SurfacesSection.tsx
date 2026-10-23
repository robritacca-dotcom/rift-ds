"use client";

import { useState } from "react";
import styles from "../page.module.css";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import { BentoTile } from "rift-ds/components/BentoTile/BentoTile";
import { CardStack } from "rift-ds/components/CardStack/CardStack";
import { Card } from "rift-ds/components/Card/Card";
import { Stat } from "rift-ds/components/Stat/Stat";
import { Sparkline } from "rift-ds/components/Sparkline/Sparkline";
import { Badge } from "rift-ds/components/Badge/Badge";
import { AnimatedNumber } from "rift-ds/components/AnimatedNumber/AnimatedNumber";
import { Button } from "rift-ds/components/Button/Button";

/* Fictional figures for a fictional product. */
const TREND = [22, 28, 25, 31, 36, 34, 41, 39, 46, 52];
const SEATS = [12, 14, 13, 17, 21, 20, 26];

const ROLES = [
  { title: "Prompt engineer", rate: "$120/hr", org: "Northwind" },
  { title: "ML engineer", rate: "$135/hr", org: "Halcyon" },
  { title: "Platform engineer", rate: "$130/hr", org: "Meridian" },
  { title: "Research engineer", rate: "$140/hr", org: "Lumen" },
];

export default function SurfacesSection() {
  const [edits, setEdits] = useState(1284);
  const [card, setCard] = useState(0);

  return (
    <section className={styles.demoSection} aria-label="Surfaces">
      <SectionTitle title="Surfaces" />
      <p className={styles.sectionNote}>
        The bento tiles pair an ambient colour with a texture, so they follow
        the accents under Advanced colours and the elevation lever at once;
        press one to open it. The card stack flips through the container
        surface on the radius scale, and the pace of its lift follows the
        Motion lever.
      </p>

      <div className={styles.bentoGrid}>
        <BentoTile
          title="Revenue that themes itself"
          description="A stat and a sparkline on the first ambient pair."
          highlight={1}
          expandedContent={
            <p className={styles.sectionNote}>
              An open tile shows the same content with room to breathe. The
              overlay portals to the document body and still re-themes,
              because the overrides land on the root element.
            </p>
          }
        >
          <div className={styles.bentoStack}>
            <Stat label="Monthly revenue" value="$48,210" delta="+12.4%" trend="up" />
            <Sparkline data={TREND} variant="area" tone="accent" width={240} height={48} label="Revenue, last ten months" />
          </div>
        </BentoTile>
        <BentoTile
          title="Theme edits"
          description="A number that counts to its value."
          highlight={3}
          align="center"
        >
          <div className={styles.bentoStack}>
            <span className={styles.bentoFigure}>
              <AnimatedNumber value={edits} />
            </span>
            <Button
              label="Add a few"
              variant="secondary"
              size="compact"
              onClick={() => setEdits((n) => n + 37)}
            />
          </div>
        </BentoTile>
        <BentoTile
          title="Seats this week"
          description="The plain container surface, no pair."
          background="solid"
          align="end"
        >
          <div className={styles.bentoStack}>
            <div className={styles.demoRow}>
              <Badge label="Team plan" variant="info" />
              <Badge label="26 seats" variant="neutral" />
            </div>
            <Sparkline data={SEATS} tone="positive" width={240} height={40} label="Seats, last seven days" />
          </div>
        </BentoTile>
      </div>

      <div className={styles.cardStackStage}>
        <CardStack
          label="Open roles"
          index={card}
          onIndexChange={setCard}
          peek={2}
          className={styles.cardStack}
        >
          {ROLES.map((role) => (
            <Card key={role.title} title={role.title}>
              <div className={styles.cardStackBody}>
                <Badge variant="neutral" label={role.rate} />
                <span className={styles.cardStackOrg}>{role.org}</span>
              </div>
            </Card>
          ))}
        </CardStack>
        <p className={styles.sectionNote}>
          Card {card + 1} of {ROLES.length}. Press the deck or use the arrow
          keys to flip through it.
        </p>
      </div>
    </section>
  );
}
