"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { AvatarGroup } from "@robr0/design-system/components/AvatarGroup/AvatarGroup";
import { Avatar } from "@robr0/design-system/components/Avatar/Avatar";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";

const team = [
  "Jane Doe",
  "Alex Smith",
  "Sam Reyes",
  "Kim Park",
  "Lee Chen",
  "Ana Silva",
  "Max Weber",
];

export default function AvatarGroupPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Avatar group</h1>
            <PageLinks storybookPath="/?path=/docs/components-avatargroup--docs" />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              Who&apos;s here, in one glance
            </p>
            <p className={styles.introBody}>
              An overlapping stack of avatars with a +N counter for the rest.
              It lays out the Avatar children it is given, forces one size onto
              them so a stack never renders mixed, and rings each one in the
              page colour so the overlaps stay legible on any surface. Purely
              presentational, so it renders from a Server Component.
            </p>
          </div>

          <section className={`${styles.section} animate-in animate-delay-2`}>
            <SectionTitle title="Overflow" />
            <p className={styles.sectionBody}>
              Five avatars show by default; the rest collapse into the counter.
              Lower max to tighten the row, and the counter keeps the true
              remainder.
            </p>
            <div className={styles.exampleRow}>
              <div className={styles.exampleCell}>
                <span className={styles.exampleLabel}>Default, max 5</span>
                <AvatarGroup aria-label="Project members">
                  {team.map((name) => (
                    <Avatar key={name} name={name} />
                  ))}
                </AvatarGroup>
              </div>
              <div className={styles.exampleCell}>
                <span className={styles.exampleLabel}>Max 3</span>
                <AvatarGroup max={3} aria-label="Project members">
                  {team.map((name) => (
                    <Avatar key={name} name={name} />
                  ))}
                </AvatarGroup>
              </div>
              <div className={styles.exampleCell}>
                <span className={styles.exampleLabel}>Nothing hidden</span>
                <AvatarGroup aria-label="Reviewers">
                  {team.slice(0, 3).map((name) => (
                    <Avatar key={name} name={name} />
                  ))}
                </AvatarGroup>
              </div>
            </div>
          </section>

          <section className={`${styles.section} animate-in animate-delay-3`}>
            <SectionTitle title="Sizes" />
            <p className={styles.sectionBody}>
              The group speaks Avatar&apos;s own size vocabulary and clones it
              onto every child, sizing the counter circle to match.
            </p>
            <div className={styles.exampleRow}>
              {(["sm", "md", "lg"] as const).map((size) => (
                <div key={size} className={styles.exampleCell}>
                  <span className={styles.exampleLabel}>{size}</span>
                  <AvatarGroup size={size} max={4} aria-label="Project members">
                    {team.slice(0, 6).map((name) => (
                      <Avatar key={name} name={name} />
                    ))}
                  </AvatarGroup>
                </div>
              ))}
            </div>
          </section>

          <section className={`${styles.section} animate-in animate-delay-4`}>
            <SectionTitle title="Accessible naming" />
            <p className={styles.sectionBody}>
              The root is a group, so pass aria-label to name the collection.
              The counter announces as &quot;N more&quot; by default;
              overflowLabel overrides it when the remainder deserves context.
            </p>
            <div className={styles.exampleRow}>
              <div className={styles.exampleCell}>
                <span className={styles.exampleLabel}>
                  overflowLabel=&quot;3 more reviewers&quot;
                </span>
                <AvatarGroup
                  max={4}
                  overflowLabel="3 more reviewers"
                  aria-label="Pull request reviewers"
                >
                  {team.map((name) => (
                    <Avatar key={name} name={name} />
                  ))}
                </AvatarGroup>
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
