"use client";

import React from "react";
import ComponentInstallStrip from "@/components/ComponentInstallStrip/ComponentInstallStrip";
import ButtonDocs from "./ButtonDocs";
import styles from "./page.module.css";

export default function ButtonPage() {
  return (
    <div className={styles.dsContent}>
      <ButtonDocs />
      <ComponentInstallStrip slug="button" />
    </div>
  );
}
