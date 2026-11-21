"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import ComponentInstallStrip from "@/components/ComponentInstallStrip/ComponentInstallStrip";
import ButtonDocs from "./ButtonDocs";
import styles from "./page.module.css";

export default function ButtonPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <ButtonDocs />
          <ComponentInstallStrip slug="button" />
        </main>
      </div>
    </>
  );
}
