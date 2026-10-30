"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { ThemeToggle } from "rift-ds/components/ThemeToggle/ThemeToggle";
import { CodeBlock } from "rift-ds/components/CodeBlock/CodeBlock";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";
import ComponentInstallStrip from "@/components/ComponentInstallStrip/ComponentInstallStrip";

const SCRIPT_SNIPPET = `// app/layout.tsx: apply the stored mode before first paint.
import { colorModeScript } from 'rift-ds/components/ThemeToggle/colorMode';

<html lang="en" suppressHydrationWarning>
  <head>
    <script dangerouslySetInnerHTML={{ __html: colorModeScript() }} />
  </head>
  …
</html>`;

const CONTROLLED_SNIPPET = `const { theme, setTheme } = useTheme(); // next-themes, say

<ThemeToggle value={theme as ColorModeSetting} onValueChange={setTheme} />`;

const HOOK_SNIPPET = `// Any client component: read or change the setting yourself.
import { useColorMode } from 'rift-ds/components/ThemeToggle/useColorMode';

const [setting, setSetting] = useColorMode(); // 'system' | 'light' | 'dark'`;

export default function ThemeTogglePage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Theme toggle</h1>
            <PageLinks storybookPath="/?path=/docs/components-themetoggle--docs" />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>The visitor&rsquo;s colour mode, and the way to change it</p>
            <p className={styles.introBody}>
              System, Light and Dark on a segmented control. The choice is
              stored and applied as data-theme on the page, so every token
              follows it, and System follows the operating system. A small
              script applies the stored choice before first paint, so a
              returning visitor never sees the wrong mode flash. It is the
              control in this site&rsquo;s header, which switches to its
              one-circle cycle form as the bar runs short of room.
            </p>
          </div>

          {/* Default */}
          <section className={styles.section}>
            <SectionTitle title="Default" />
            <p className={styles.demoText}>
              The default size, the height of the search trigger and the AI
              button beside it in a top bar. It is live: choosing a setting here changes this page, and every
              other toggle on it follows.
            </p>
            <div className={styles.row}>
              <ThemeToggle />
            </div>
          </section>

          {/* Sizes and labels */}
          <section className={styles.section}>
            <SectionTitle title="Sizes and labels" />
            <p className={styles.demoText}>
              Two sizes on SegmentedControl&rsquo;s scale. With showLabels off
              it is an icon strip, and each label shows as its segment&rsquo;s
              tooltip and stays its accessible name. With cycle it is one
              circle for a row short of room, showing the current setting and
              stepping to the next on each press. The labels, the strip&rsquo;s name and the
              circle&rsquo;s cycleLabel are props with English defaults, so they can be translated.
            </p>
            <div className={styles.row}>
              <ThemeToggle size="compact" />
              <ThemeToggle size="compact" showLabels={false} />
              <ThemeToggle size="compact" cycle />
            </div>
          </section>

          {/* Setup */}
          <section className={styles.section}>
            <SectionTitle title="Before first paint" />
            <p className={styles.demoText}>
              colorModeScript returns the script that applies the stored
              choice before anything paints. Render it in the document head,
              and let React leave the attributes it sets alone. In a Next.js
              app, npx rift-ds init app scaffolds it as a component. A
              storageKey option, on the script and the toggle alike, keeps the
              choice under a key of your own.
            </p>
            <CodeBlock code={SCRIPT_SNIPPET} language="tsx" />
          </section>

          {/* Hook */}
          <section className={styles.section}>
            <SectionTitle title="Your own control" />
            <p className={styles.demoText}>
              useColorMode is the setting and its setter, the hook the toggle
              is built on. Every instance reads one attribute, so a menu item,
              a shortcut and the toggle never disagree, across tabs too.
            </p>
            <CodeBlock code={HOOK_SNIPPET} language="tsx" />
            <p className={styles.demoText}>
              An app that owns colour mode itself, in its own settings store or
              a library such as next-themes, passes value and hears each pick
              through onValueChange, applying it itself. Left to its own store,
              defaultValue is the setting a first visit takes.
            </p>
            <CodeBlock code={CONTROLLED_SNIPPET} language="tsx" />
          </section>

          <ComponentInstallStrip slug="theme-toggle" />
        </main>
      </div>
    </>
  );
}
