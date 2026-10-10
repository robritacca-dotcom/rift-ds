"use client";

import React, { useState } from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { PixelAvatar, distinctPixelInks } from "rift-ds/components/PixelAvatar/PixelAvatar";
import { Input } from "rift-ds/components/Input/Input";
import { tokenRegistry } from "rift-ds/tokens/registry";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";
import ComponentInstallStrip from "@/components/ComponentInstallStrip/ComponentInstallStrip";

const CAST = [
  "Northwind Trading",
  "Harbor & Vine",
  "Bluepeak Logistics",
  "Juniper Health",
  "Oakline Retail",
  "Meridian Foods",
  "Copperfield Studio",
  "Tidewater Supply",
  "Larkspur Hotels",
  "Fennel & Co",
  "Atlas Freight",
  "Solstice Energy",
];

/* How many inks there are, read from the token registry so the page can
   never state a number the tokens have moved away from. */
const INK_COUNT = tokenRegistry.colour.filter((name) =>
  name.startsWith("--color-pixel-ink-")
).length;

/* The cast is a list shown together, so its inks are spread the way a
   sidebar spreads them: no two neighbours alike. */
const CAST_INKS = distinctPixelInks(CAST);

export default function PixelAvatarPage() {
  const [name, setName] = useState("Your project");

  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Pixel avatar</h1>
            <PageLinks storybookPath="/?path=/docs/components-pixelavatar--docs" />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              A mark for anything with a name
            </p>
            <p className={styles.introBody}>
              Projects, workspaces and accounts have a name long before they have a logo. The pixel avatar draws a small character and picks one of {INK_COUNT} inks from that name alone, so the same name is always the same character and nothing has to be designed, uploaded or stored.
            </p>
          </div>

          {/* Try it */}
          <section className={styles.section}>
            <SectionTitle title="Type a name" />
            <p className={styles.sectionNote}>
              The name is the only input. Change a letter and a different character answers; type the old name back and the first one returns.
            </p>
            <div className={styles.tryRow}>
              <PixelAvatar name={name} size="xl" variant="tile" label={name} />
              <div className={styles.tryField}>
                <Input
                  aria-label="Name"
                  value={name}
                  onValueChange={setName}
                  placeholder="Name"
                />
              </div>
            </div>
          </section>

          {/* Cast */}
          <section className={styles.section}>
            <SectionTitle title="In a list" />
            <p className={styles.sectionNote}>
              {INK_COUNT} inks cannot keep {CAST.length} names apart on their own, so a list spreads them: each character keeps its own ink where it can, and never follows its own colour or the hue beside it.
            </p>
            <div className={styles.castGrid}>
              {CAST.map((member, index) => (
                <PixelAvatar key={member} name={member} ink={CAST_INKS[index]} size="xl" label={member} />
              ))}
            </div>
          </section>

          {/* Sizes */}
          <section className={styles.section}>
            <SectionTitle title="Sizes" />
            <p className={styles.sectionNote}>
              The four sizes are steps of the icon scale, so a character sits in any seat an icon does and lines up with the glyphs around it.
            </p>
            <div className={styles.variantRow}>
              <PixelAvatar name="Northwind Trading" size="sm" />
              <PixelAvatar name="Northwind Trading" size="md" />
              <PixelAvatar name="Northwind Trading" size="lg" />
              <PixelAvatar name="Northwind Trading" size="xl" />
            </div>
          </section>

          {/* Tile */}
          <section className={styles.section}>
            <SectionTitle title="Tile" />
            <p className={styles.sectionNote}>
              The tile seats the character on a wash of its own ink, for a larger mark that stands alone: a page header, a card, a picker.
            </p>
            <div className={styles.variantRow}>
              {CAST.slice(0, 6).map((member) => (
                <PixelAvatar key={member} name={member} size="xl" variant="tile" label={member} />
              ))}
            </div>
          </section>

          {/* In context */}
          <section className={styles.section}>
            <SectionTitle title="Beside its name" />
            <p className={styles.sectionNote}>
              Next to the name it was drawn from, the character is decoration and stays out of the accessibility tree. On its own it needs a label, which makes it an image with that name. The app sidebar offers it as an option on any row, and the thread panel draws it as every project’s default mark. Both spread the inks across their rows, so neighbours in a list differ in colour as well as shape.
            </p>
            <div className={styles.presenceRow}>
              {CAST.slice(0, 3).map((member) => (
                <div key={member} className={styles.presenceItem}>
                  <PixelAvatar name={member} size="lg" />
                  <div className={styles.presenceMeta}>
                    <span className={styles.presenceName}>{member}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <ComponentInstallStrip slug="pixel-avatar" />
        </main>
      </div>
    </>
  );
}
