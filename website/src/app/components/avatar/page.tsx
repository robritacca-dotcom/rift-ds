"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { Avatar } from "@robr0/design-system/components/Avatar/Avatar";
import { demoAvatar1, demoAvatar2 } from "@robr0/design-system/components/Avatar/demoAvatars";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";

export default function AvatarPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Avatar</h1>
            <PageLinks
              storybookPath="/?path=/docs/components-avatar--docs"
            />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              People, profiles, and presence
            </p>
            <p className={styles.introBody}>
              Displays a user photo, initials derived from their name, or a generic person icon as fallback. An optional status dot shows online presence at a glance.
            </p>
          </div>

          {/* Sizes */}
          <section className={styles.section}>
            <SectionTitle title="Sizes" />
            <div className={styles.variantRow}>
              <Avatar size="sm" src={demoAvatar1} alt="User" />
              <Avatar size="md" src={demoAvatar1} alt="User" />
              <Avatar size="lg" src={demoAvatar1} alt="User" />
            </div>
          </section>

          {/* Fallbacks */}
          <section className={styles.section}>
            <SectionTitle title="Fallbacks" />
            <div className={styles.variantRow}>
              <Avatar size="lg" src={demoAvatar2} alt="Jane Doe" />
              <Avatar size="lg" name="Jane Doe" />
              <Avatar size="lg" name="Alice" />
              <Avatar size="lg" />
            </div>
          </section>

          {/* Status */}
          <section className={styles.section}>
            <SectionTitle title="Status indicator" />
            <div className={styles.variantRow}>
              <Avatar size="lg" name="Online" status="online" />
              <Avatar size="lg" name="Away" status="away" />
              <Avatar size="lg" name="Offline" status="offline" />
              <Avatar size="lg" name="Busy" status="busy" />
            </div>
          </section>

          {/* Combinations */}
          <section className={styles.section}>
            <SectionTitle title="Sizes with status" />
            <div className={styles.variantRow}>
              <Avatar size="sm" name="Jane Doe" status="online" />
              <Avatar size="md" name="Jane Doe" status="online" />
              <Avatar size="lg" name="Jane Doe" status="online" />
            </div>
          </section>
        </main>
      </div>

    </>
  );
}
