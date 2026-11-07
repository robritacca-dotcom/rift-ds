"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { DocumentViewer } from "rift-ds/components/DocumentViewer/DocumentViewer";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";
import ComponentInstallStrip from "@/components/ComponentInstallStrip/ComponentInstallStrip";


const RECEIPT_SVG = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="480" height="640" viewBox="0 0 480 640"><rect width="480" height="640" fill="#fff"/><text x="40" y="80" font-family="sans-serif" font-size="28">Receipt</text><text x="40" y="140" font-family="sans-serif" font-size="18">Standing desk  $899.00</text><text x="40" y="180" font-family="sans-serif" font-size="18">Monitor arm  $185.00</text><text x="40" y="240" font-family="sans-serif" font-size="20">Total  $1,084.00</text></svg>',
)}`;

export default function DocumentViewerPage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Document viewer</h1>
            <PageLinks storybookPath="/?path=/docs/components-documentviewer--docs" />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>A document on the page</p>
            <p className={styles.introBody}>
              A document viewer shows a statement, a contract, an invoice or an uploaded receipt in place. A PDF uses the browser’s own viewer, an image zooms, and a text file scrolls; the toolbar downloads the file or opens it in a new tab. Where a browser will not embed the file, a fallback with the download shows instead.
            </p>
          </div>

          <section className={styles.section}>
            <SectionTitle title="PDF" />
            <DocumentViewer src="/documents/statement.pdf" title="Statement, October 2026" />
          </section>

          <section className={styles.section}>
            <SectionTitle title="Image" />
            <DocumentViewer src={RECEIPT_SVG} title="Receipt, 4 Nov 2026" fileName="receipt.svg" />
          </section>

          <section className={styles.section}>
            <SectionTitle title="Fallback" />
            <DocumentViewer src="#invoice.docx" title="Invoice INV-2041" fileName="invoice.docx" height="default" />
          </section>

          <ComponentInstallStrip slug="document-viewer" />
        </main>
      </div>
    </>
  );
}
