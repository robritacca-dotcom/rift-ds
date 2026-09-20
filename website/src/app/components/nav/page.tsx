"use client";

import React from "react";
import Image from "next/image";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { Nav } from "@robr0/design-system/components/Nav/Nav";
import { ToggleSwitch } from "@robr0/design-system/components/ToggleSwitch/ToggleSwitch";
import { ButtonGroup } from "@robr0/design-system/components/ButtonGroup/ButtonGroup";
import type { ButtonProps } from "@robr0/design-system/components/Button/Button";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";
/* ============================================
   DEMO NAV BUTTON DATA
   ============================================ */

const demoNavButtons: ButtonProps[] = [
  { label: "Home", variant: "tertiary", state: "default" },
  { label: "About", variant: "tertiary", state: "default" },
  { label: "Components", variant: "tertiary", state: "active" },
  { label: "Foundations", variant: "tertiary", state: "default" },
];

const demoMobileMenuTopLinks: ButtonProps[] = [
  { label: "Home", variant: "tertiary", state: "default" },
  { label: "About", variant: "tertiary", state: "disabled" },
  { label: "Work", variant: "tertiary", state: "disabled" },
  { label: "robr0 DS", variant: "tertiary", state: "active" },
];

const demoMobileSubnavLinks: ButtonProps[] = [
  { label: "Contents", variant: "tertiary", state: "active" },
  { label: "Menu item", variant: "tertiary", state: "default" },
  { label: "Menu item", variant: "tertiary", state: "default" },
  { label: "Menu item", variant: "tertiary", state: "default" },
  { label: "Menu item", variant: "tertiary", state: "default" },
  { label: "Colour", variant: "tertiary", state: "default" },
  { label: "Menu item", variant: "tertiary", state: "default" },
  { label: "Menu item", variant: "tertiary", state: "default" },
];

/* ============================================
   PAGE
   ============================================ */


export default function NavigationPage() {
  return (
    <>

      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          {/* Page Title */}
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Nav</h1>
            <PageLinks
              figmaUrl="https://www.figma.com/design/8NzqDS8iRsBTFPbNGj3Woj/robr0-ds26?node-id=155-7279"
              storybookPath="/?path=/docs/components-nav--docs"
            />
          </div>

          {/* Intro */}
          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              A compositional top bar: brand, page links, and a trailing slot
            </p>
            <p className={styles.introBody}>
              Nav lays out a brand, a ButtonGroup of page links, and trailing content such as a theme toggle. It has no mobile behaviour of its own. The collapsed bar and drawer below are this site&apos;s phone pattern, mocked up from ButtonGroup and ToggleSwitch, to show how the pieces compose at a narrow width.
            </p>
          </div>

          {/* Desktop Nav */}
          <section className={styles.section}>
            <SectionTitle title="Desktop" />
            <div className={styles.showcase}>
              <span className={styles.showcaseLabel}>
                Full-width top navigation with brand, links, and trailing content
              </span>
              <div className={styles.navPreview}>
                <Nav
                  brandText="robr0"
                  brandIcon={
                    <Image src="/rr.svg" alt="robr0" width={24} height={24} />
                  }
                  buttons={demoNavButtons}
                  trailing={
                    <ToggleSwitch
                      checked={true}
                      label="Dark mode"
                      onChange={() => {}}
                    />
                  }
                />
              </div>
            </div>
          </section>

          {/* Mobile Nav Bar */}
          <section className={styles.section}>
            <SectionTitle title="Mobile bar" />
            <div className={styles.showcase}>
              <span className={styles.showcaseLabel}>
                Site pattern, not a Nav prop: the collapsed bar with brand and menu trigger
              </span>
              <div className={styles.mobileNavPreview}>
                <div className={styles.mobileNavInner}>
                  <div className={styles.mobileNavBrand}>
                    <Image src="/rr.svg" alt="robr0" width={24} height={24} />
                    <span className={styles.mobileNavBrandText}>robr0</span>
                  </div>
                  <div className={styles.mobileNavHamburger}>
                    <span className="material-symbols-rounded" aria-hidden="true">
                      menu
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Hamburger Menu */}
          <section className={styles.section}>
            <SectionTitle title="Hamburger menu" />
            <div className={styles.showcase}>
              <span className={styles.showcaseLabel}>
                Site pattern, not a Nav prop: the drawer with top-level links, nested subnav, and theme toggle
              </span>
              <div className={styles.hamburgerPreview}>
                <div className={styles.hamburgerOverlay}>
                  <div className={styles.hamburgerMenu}>
                    <div className={styles.hamburgerMenuLinks}>
                      <ButtonGroup
                        orientation="vertical"
                        buttons={demoMobileMenuTopLinks}
                      />
                      <div className={styles.hamburgerSubnav}>
                        <ButtonGroup
                          orientation="vertical"
                          buttons={demoMobileSubnavLinks}
                        />
                      </div>
                    </div>
                    <ToggleSwitch
                      checked={true}
                      label="Dark Mode"
                      onChange={() => {}}
                      className={styles.hamburgerThemeToggle}
                    />
                  </div>
                  <div className={styles.hamburgerCloseArea}>
                    <div className={styles.hamburgerCloseBtn}>
                      <span className="material-symbols-rounded" aria-hidden="true">
                        close
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>

    </>
  );
}
