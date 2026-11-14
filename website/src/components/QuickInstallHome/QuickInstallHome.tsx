"use client";

import Link from "next/link";
import MegaNav from "../MegaNav/MegaNav";
import { ExtendedBackground } from "../BlurBackground/BlurBackground";
import { CodeBlock } from "rift-ds/components/CodeBlock/CodeBlock";
import { Button } from "rift-ds/components/Button/Button";
import { REPOSITORY_URL } from "@/config/brand.generated";
import styles from "./QuickInstallHome.module.css";

/* Experiment: a home page that leads with the install. One command, copyable,
   above the fold. The landing it replaces stays on main in
   src/app/DesignSystemLanding.tsx. */

const INSTALL = "npx rift-ds init";

export default function QuickInstallHome() {
  return (
    <>
      <MegaNav githubUrl={REPOSITORY_URL} />
      <ExtendedBackground />
      <main className={styles.page}>
        <section className={styles.hero} aria-labelledby="quick-install-title">
          <h1 id="quick-install-title" className={styles.title}>
            Install the design system in one line.
          </h1>
          <p className={styles.lede}>
            React components, tokens and agent skills, copied into your project.
          </p>
          <div className={styles.command}>
            <CodeBlock code={INSTALL} language="bash" showCopy />
          </div>
          <div className={styles.actions}>
            <Button label="Get started" variant="primary" href="/docs/get-started" />
            <Button
              label="View on GitHub"
              variant="secondary"
              iconRight="open_in_new"
              href={REPOSITORY_URL}
              target="_blank"
              rel="noopener noreferrer"
            />
          </div>
        </section>
        <nav className={styles.explore} aria-label="Explore">
          <Link href="/components">Components</Link>
          <Link href="/foundations">Foundations</Link>
          <Link href="/playground">Playground</Link>
          <Link href="/docs/get-started">Docs</Link>
        </nav>
      </main>
    </>
  );
}
