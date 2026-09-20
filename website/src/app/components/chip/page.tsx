"use client";

import React, { useState } from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { Chip } from "@robr0/design-system/components/Chip/Chip";
import { Button } from "@robr0/design-system/components/Button/Button";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";

const FILTER_OPTIONS = ["All", "Components", "Foundations", "Patterns"];
const DEFAULT_TAGS = ["react", "typescript", "storybook", "figma"];

export default function ChipPage() {
  const [filter, setFilter] = useState("All");
  const [tags, setTags] = useState(DEFAULT_TAGS);

  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Chip</h1>
            <PageLinks
              storybookPath="/?path=/docs/components-chip--docs"
            />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              Compact pills for attributes, filters, and inline metadata
            </p>
            <p className={styles.introBody}>
              Chips label, filter, or represent small pieces of information. Unlike a Badge, which
              communicates status through colour, a chip is neutral by default and can be
              interactive: pass a click handler to make it a button, a selected state for
              filtering, or a remove handler for input-style chips.
            </p>
          </div>

          {/* Sizes */}
          <section className={styles.section}>
            <SectionTitle title="Sizes" />
            <p className={styles.demoText}>
              Large takes the default button&rsquo;s box and the body text
              scale. Reach for it when the pill is a primary tap target, the
              way a prompt suggestion is, rather than metadata about
              something else.
            </p>
            <div className={styles.variantRow}>
              <Chip size="large" label="Large (40px)" />
              <Chip label="Default (32px)" />
              <Chip size="compact" label="Compact (24px)" />
            </div>
          </section>

          {/* Icons */}
          <section className={styles.section}>
            <SectionTitle title="With icons" />
            <div className={styles.variantRow}>
              <Chip label="Analytics" icon="monitoring" />
              <Chip label="Scheduled" icon="calendar_month" />
              <Chip size="compact" label="Verified" icon="check_circle" />
              <Chip size="compact" label="Skill" icon="bolt" />
            </div>
          </section>

          {/* Clickable — filter chips */}
          <section className={styles.section}>
            <SectionTitle title="Clickable: filter chips" />
            <p className={styles.introBody}>
              With an <code>onClick</code> handler the chip renders as a real{" "}
              <code>&lt;button&gt;</code>. Add <code>selected</code> for a filter-style toggle:
              the teal active fill follows the same convention as the segmented control.
            </p>
            <div className={styles.variantRow}>
              {FILTER_OPTIONS.map((option) => (
                <Chip
                  key={option}
                  label={option}
                  selected={filter === option}
                  icon={filter === option ? "check" : undefined}
                  onClick={() => setFilter(option)}
                />
              ))}
            </div>
          </section>

          {/* Removable — input chips */}
          <section className={styles.section}>
            <SectionTitle title="Removable: input chips" />
            <p className={styles.introBody}>
              An <code>onRemove</code> handler adds a trailing close button with its own
              accessible label.
            </p>
            <div className={styles.variantRow}>
              {tags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  removeLabel={`Remove ${tag}`}
                  onRemove={() => setTags(tags.filter((t) => t !== tag))}
                />
              ))}
              {tags.length < DEFAULT_TAGS.length && (
                <Button
                  label="Reset"
                  variant="secondary"
                  size="compact"
                  onClick={() => setTags(DEFAULT_TAGS)}
                />
              )}
            </div>
          </section>

          {/* Non-interactive + disabled */}
          <section className={styles.section}>
            <SectionTitle title="Non-interactive and disabled" />
            <p className={styles.introBody}>
              Without handlers a chip is a plain <code>&lt;span&gt;</code>: a quiet label for
              metadata, like the run stages on the Loops page. Disabled chips drop to 40%
              opacity, matching every other control in the system.
            </p>
            <div className={styles.variantRow}>
              <Chip size="compact" label="Read-only label" />
              <Chip size="compact" label="Pull analytics" icon="monitoring" />
              <Chip label="Disabled" disabled onClick={() => {}} />
              <Chip label="Disabled selected" selected disabled onClick={() => {}} />
            </div>
          </section>
        </main>
      </div>

    </>
  );
}
