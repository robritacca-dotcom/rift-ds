"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { Kbd } from "rift-ds/components/Kbd/Kbd";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";
import ComponentInstallStrip from "@/components/ComponentInstallStrip/ComponentInstallStrip";


export default function KbdPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Kbd</h1>
            <PageLinks
              storybookPath="/?path=/docs/components-kbd--docs"
            />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              A keyboard key as a keycap
            </p>
            <p className={styles.introBody}>
              Renders a semantic kbd element styled as a keycap, for shortcut
              hints in menus and documentation prose. Compose several for a
              chord, or pass a whole shortcut as <code>keys</code> and it draws
              the keys for the reader&apos;s platform. The command palette&apos;s
              shortcut hints render through this component.
            </p>
          </div>

          {/* Single keys */}
          <section className={styles.section}>
            <SectionTitle title="Single keys" />
            <div className={styles.demoRow}>
              <Kbd>⌘</Kbd>
              <Kbd>⇧</Kbd>
              <Kbd>⌥</Kbd>
              <Kbd>⌃</Kbd>
              <Kbd>K</Kbd>
              <Kbd>Esc</Kbd>
              <Kbd>Tab</Kbd>
              <Kbd>Enter</Kbd>
              <Kbd>Space</Kbd>
            </div>
          </section>

          {/* Chords */}
          <section className={styles.section}>
            <SectionTitle title="Chords" />
            <p className={styles.demoText}>
              Compose one Kbd per key, separated by your own gap. The
              component deliberately renders a single keycap.
            </p>
            <div className={styles.demoRow}>
              <span className={styles.chord}>
                <Kbd>⌘</Kbd>
                <Kbd>K</Kbd>
              </span>
              <span className={styles.chord}>
                <Kbd>⌘</Kbd>
                <Kbd>⇧</Kbd>
                <Kbd>P</Kbd>
              </span>
              <span className={styles.chord}>
                <Kbd>⌃</Kbd>
                <Kbd>C</Kbd>
              </span>
            </div>
          </section>

          {/* Sizes */}
          <section className={styles.section}>
            <SectionTitle title="Sizes" />
            <div className={styles.demoRow}>
              <span className={styles.chord}>
                <Kbd>⌘</Kbd>
                <Kbd>K</Kbd>
              </span>
              <span className={styles.chord}>
                <Kbd size="compact">⌘</Kbd>
                <Kbd size="compact">K</Kbd>
              </span>
            </div>
            <p className={styles.demoText}>
              Compact keycaps match the command palette&apos;s shortcut hints;
              the default size suits body-text prose.
            </p>
          </section>

          {/* A whole shortcut */}
          <section className={styles.section}>
            <SectionTitle title="A whole shortcut" />
            <div className={styles.demoRow}>
              <Kbd keys="mod+k" />
              <Kbd keys="mod+shift+p" />
              <Kbd keys="g i" size="compact" />
            </div>
            <p className={styles.demoText}>
              <code>keys</code> takes the same string <code>useShortcut</code>{" "}
              binds: <code>mod</code> draws ⌘ on a Mac and Ctrl elsewhere, and a
              space separates the steps of a sequence. The keys keep their
              left-to-right order in a right-to-left page, and{" "}
              <code>keyLabels</code> renames any of them for a keyboard printed
              in another language.
            </p>
          </section>

          {/* In prose */}
          <section className={styles.section}>
            <SectionTitle title="In prose" />
            <p className={styles.proseDemo}>
              Press <Kbd size="compact">⌘</Kbd> <Kbd size="compact">K</Kbd> to
              open the command palette, then <Kbd size="compact">↑</Kbd>{" "}
              <Kbd size="compact">↓</Kbd> to move between results and{" "}
              <Kbd size="compact">Enter</Kbd> to run one.
            </p>
          </section>

          <ComponentInstallStrip slug="kbd" />
        </main>
      </div>

    </>
  );
}
