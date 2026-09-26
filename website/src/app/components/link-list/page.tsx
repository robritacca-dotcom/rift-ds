"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { LinkList } from "rift-ds/components/LinkList/LinkList";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";
import ComponentInstallStrip from "@/components/ComponentInstallStrip/ComponentInstallStrip";


export default function LinkListPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Link list</h1>
            <PageLinks
              storybookPath="/?path=/docs/components-linklist--docs"
            />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              Linked items with logo, label, and subtitle
            </p>
            <p className={styles.introBody}>
              LinkList renders a vertical stack of external links. Each item has a logo or icon on the left, a title with an open-in-new indicator, and optional subtitle lines. Used in sidebars and detail pages to surface related resources.
            </p>
          </div>

          {/* With logos */}
          <section className={styles.section}>
            <SectionTitle title="With logos" />
            <div className={styles.exampleWrap}>
              <LinkList
                items={[
                  {
                    label: "Storybook",
                    href: "https://storybook.js.org",
                    logo: "/logos/storybook.svg",
                    sub: "Every component variant, documented live",
                  },
                  {
                    label: "ChatGPT Connector",
                    href: "https://chatgpt.com",
                    logo: "/logos/ChatGPT.svg",
                    sub: "USA only",
                  },
                  {
                    label: "Claude Connector",
                    href: "https://claude.ai",
                    logo: "/logos/Claude.svg",
                    sub: "USA only",
                  },
                  {
                    label: "React",
                    href: "https://react.dev",
                    logo: "/logos/React.svg",
                  },
                ]}
              />
            </div>
          </section>

          {/* With Material Symbol icons */}
          <section className={styles.section}>
            <SectionTitle title="With icons" />
            <div className={styles.exampleWrap}>
              <LinkList
                items={[
                  {
                    label: "Design awards 2026",
                    href: "#",
                    icon: "emoji_events",
                    sub: [
                      "Winner, Product Design",
                      "People's Voice Winner, Product Design",
                    ],
                  },
                  {
                    label: "Case study",
                    href: "#",
                    icon: "description",
                    sub: "Full write-up with process and outcomes",
                  },
                ]}
              />
            </div>
          </section>

          {/* Consulting / CTA variant */}
          <section className={styles.section}>
            <SectionTitle title="Consulting CTA" />
            <div className={styles.exampleWrap}>
              <LinkList
                items={[
                  {
                    label: "Book a consultation",
                    href: "#",
                    logo: "/logos/stripe-new.png",
                    logoAlt: "Stripe",
                    sub: "Secure checkout via Stripe",
                  },
                ]}
              />
            </div>
          </section>

          <ComponentInstallStrip slug="link-list" />
        </main>
      </div>

    </>
  );
}
