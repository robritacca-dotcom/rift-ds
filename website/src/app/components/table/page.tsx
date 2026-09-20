"use client";

import React from "react";
import MegaNav from "../../../components/MegaNav/MegaNav";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import ComponentsSidebar from "../../../components/Sidebar/ComponentsSidebar";
import { Table } from "@robr0/design-system/components/Table/Table";
import { Button } from "@robr0/design-system/components/Button/Button";
import { CircularButton } from "@robr0/design-system/components/CircularButton/CircularButton";
import { Input } from "@robr0/design-system/components/Input/Input";
import { Checkbox } from "@robr0/design-system/components/Checkbox/Checkbox";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";

/* ============================================
   SHARED TABLE DATA
   ============================================ */

const basicColumns = [
  { key: "name", header: "Name", width: "30%" },
  { key: "role", header: "Role", width: "30%" },
  { key: "email", header: "Email" },
];

const basicRows = [
  { id: "1", cells: { name: "Alice Chen", role: "Designer", email: "alice@example.com" } },
  { id: "2", cells: { name: "Bob Rivera", role: "Engineer", email: "bob@example.com" } },
  { id: "3", cells: { name: "Carol Osei", role: "Product Manager", email: "carol@example.com" } },
  { id: "4", cells: { name: "Dan Petrov", role: "Data Analyst", email: "dan@example.com" } },
];

export default function TablePage() {
  return (
    <>
      <MegaNav />

      <div className={styles.dsLayout}>
        <ComponentsSidebar />

        <main className={styles.dsContent} id="main-content">
          <PageBreadcrumb />
          <div className={`${styles.pageHeader} animate-in`}>
            <h1 className={styles.pageTitle}>Table</h1>
            <PageLinks
              storybookPath="/?path=/docs/components-table--docs"
            />
          </div>

          <div className={`${styles.introSection} animate-in animate-delay-1`}>
            <p className={styles.subDisplay}>
              Structured data in rows and columns
            </p>
            <p className={styles.introBody}>
              Cells are flexible and can hold text, icons, form inputs, or action buttons. Supports striped rows for readability and a compact size for denser layouts.
            </p>
          </div>

          {/* Default */}
          <section className={styles.section}>
            <SectionTitle title="Default" />
            <div className={styles.tableWrapper}>
              <Table columns={basicColumns} rows={basicRows} bordered />
            </div>
          </section>

          {/* Compact */}
          <section className={styles.section}>
            <SectionTitle title="Compact" />
            <div className={styles.tableWrapper}>
              <Table columns={basicColumns} rows={basicRows} size="compact" bordered />
            </div>
          </section>

          {/* Striped */}
          <section className={styles.section}>
            <SectionTitle title="Striped" />
            <div className={styles.tableWrapper}>
              <Table columns={basicColumns} rows={basicRows} striped bordered />
            </div>
          </section>

          {/* With icons */}
          <section className={styles.section}>
            <SectionTitle title="With icons" />
            <div className={styles.tableWrapper}>
              <Table
                bordered
                columns={[
                  { key: "name", header: "Name", width: "35%" },
                  { key: "department", header: "Department", width: "30%" },
                  { key: "status", header: "Status", align: "center" },
                ]}
                rows={[
                  {
                    id: "1",
                    cells: {
                      name: (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                          <span className="material-symbols-rounded">person</span>
                          Alice Chen
                        </span>
                      ),
                      department: "Design",
                      status: <span className="material-symbols-rounded" style={{ color: "var(--color-status-positive-icon)" }}>check_circle</span>,
                    },
                  },
                  {
                    id: "2",
                    cells: {
                      name: (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                          <span className="material-symbols-rounded">person</span>
                          Bob Rivera
                        </span>
                      ),
                      department: "Engineering",
                      status: <span className="material-symbols-rounded" style={{ color: "var(--color-status-positive-icon)" }}>check_circle</span>,
                    },
                  },
                  {
                    id: "3",
                    cells: {
                      name: (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                          <span className="material-symbols-rounded">person</span>
                          Carol Osei
                        </span>
                      ),
                      department: "Product",
                      status: <span className="material-symbols-rounded" style={{ color: "var(--color-status-error-icon)" }}>cancel</span>,
                    },
                  },
                ]}
              />
            </div>
          </section>

          {/* With controls */}
          <section className={styles.section}>
            <SectionTitle title="With controls" />
            <div className={styles.tableWrapper}>
              <Table
                bordered
                columns={[
                  { key: "select", header: "", width: "48px", align: "center" },
                  { key: "name", header: "Name", width: "25%" },
                  { key: "role", header: "Role", width: "20%" },
                  { key: "email", header: "Email" },
                  { key: "actions", header: "Actions", align: "right" },
                ]}
                rows={[
                  {
                    id: "1",
                    cells: {
                      select: <Checkbox checked ariaLabel="Select Alice" />,
                      name: (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                          <span className="material-symbols-rounded">person</span>
                          Alice Chen
                        </span>
                      ),
                      role: "Designer",
                      email: "alice@example.com",
                      actions: (
                        <span style={{ display: "inline-flex", gap: "4px" }}>
                          <CircularButton icon="edit" ariaLabel="Edit" variant="tertiary" size="compact" />
                          <CircularButton icon="delete" ariaLabel="Delete" variant="tertiary" size="compact" />
                        </span>
                      ),
                    },
                  },
                  {
                    id: "2",
                    cells: {
                      select: <Checkbox ariaLabel="Select Bob" />,
                      name: (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                          <span className="material-symbols-rounded">person</span>
                          Bob Rivera
                        </span>
                      ),
                      role: "Engineer",
                      email: "bob@example.com",
                      actions: (
                        <span style={{ display: "inline-flex", gap: "4px" }}>
                          <CircularButton icon="edit" ariaLabel="Edit" variant="tertiary" size="compact" />
                          <CircularButton icon="delete" ariaLabel="Delete" variant="tertiary" size="compact" />
                        </span>
                      ),
                    },
                  },
                  {
                    id: "3",
                    cells: {
                      select: <Checkbox ariaLabel="Select Carol" />,
                      name: (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                          <span className="material-symbols-rounded">person</span>
                          Carol Osei
                        </span>
                      ),
                      role: "Product Manager",
                      email: "carol@example.com",
                      actions: (
                        <span style={{ display: "inline-flex", gap: "8px" }}>
                          <Button label="Invite" variant="secondary" size="compact" />
                        </span>
                      ),
                    },
                  },
                ]}
              />
            </div>
          </section>

          {/* With inputs */}
          <section className={styles.section}>
            <SectionTitle title="With inputs" />
            <div className={styles.tableWrapper}>
              <Table
                bordered
                columns={[
                  { key: "setting", header: "Setting", width: "30%" },
                  { key: "value", header: "Value" },
                ]}
                rows={[
                  {
                    id: "1",
                    cells: {
                      setting: "Display name",
                      value: <Input placeholder="Enter name" value="Alice Chen" size="compact" />,
                    },
                  },
                  {
                    id: "2",
                    cells: {
                      setting: "Email address",
                      value: <Input placeholder="Enter email" value="alice@example.com" type="email" size="compact" />,
                    },
                  },
                  {
                    id: "3",
                    cells: {
                      setting: "Location",
                      value: <Input placeholder="Enter city" size="compact" />,
                    },
                  },
                ]}
              />
            </div>
          </section>
        </main>
      </div>

    </>
  );
}
