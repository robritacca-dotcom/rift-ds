import React from "react";
import PageBreadcrumb from "@/components/PageBreadcrumb/PageBreadcrumb";
import { PaymentCard } from "rift-ds/components/PaymentCard/PaymentCard";
import { SectionTitle } from "rift-ds/components/SectionTitle/SectionTitle";
import PageLinks from "../../../components/PageLinks/PageLinks";
import styles from "./page.module.css";
import ComponentInstallStrip from "@/components/ComponentInstallStrip/ComponentInstallStrip";

const network = <span style={{ fontWeight: 700, fontStyle: "italic" }}>Orbit</span>;

const card = {
  brand: "Northlight",
  holderName: "Jordan Reyes",
  last4: "5555",
  expiry: { month: 4, year: 2029 },
  network,
};

export default function PaymentCardPage() {
  return (
    <div className={styles.dsContent}>
      <PageBreadcrumb />
      <div className={`${styles.pageHeader} animate-in`}>
        <h1 className={styles.pageTitle}>Payment card</h1>
        <PageLinks storybookPath="/?path=/docs/components-paymentcard--docs" />
      </div>

      <div className={`${styles.introSection} animate-in animate-delay-1`}>
        <p className={styles.subDisplay}>A card, drawn as its face</p>
        <p className={styles.introBody}>
          A banking app shows the cards a person holds the way they look in a
          wallet: the issuer along the top, the last four digits, the holder
          and the expiry with the network&apos;s mark along the bottom. The
          face keeps a real card&apos;s proportions at any width, and it is
          named as one thing, so a screen reader hears whose card it is and
          which.
        </p>
      </div>

      <section className={styles.section}>
        <SectionTitle title="Default" />
        <div className={styles.variantStack} style={{ maxWidth: "360px" }}>
          <PaymentCard {...card} label="Plus" />
        </div>
      </section>

      <section className={styles.section}>
        <SectionTitle title="Tones" />
        <p className={styles.introBody}>
          The default face is solid, the inverse end of the container ramp,
          so it reads as an object set on the page. The neutral face sits
          quieter on the ramp, for a virtual card or a second card beside the
          main one.
        </p>
        <div className={styles.variantRow}>
          <div className={styles.variantItem} style={{ width: "100%", maxWidth: "340px" }}>
            <PaymentCard {...card} />
          </div>
          <div className={styles.variantItem} style={{ width: "100%", maxWidth: "340px" }}>
            <PaymentCard {...card} tone="neutral" label="Virtual" last4="0142" />
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <SectionTitle title="Frozen" />
        <p className={styles.introBody}>
          A frozen card dims its face under a lock and says so in words, so
          the state never rests on the dimming alone.
        </p>
        <div className={styles.variantStack} style={{ maxWidth: "360px" }}>
          <PaymentCard {...card} frozen last4="7781" />
        </div>
      </section>

      <section className={styles.section}>
        <SectionTitle title="Compact" />
        <p className={styles.introBody}>
          The compact step suits a list of cards or a rail, at the same
          proportions.
        </p>
        <div className={styles.variantRow}>
          <div className={styles.variantItem} style={{ width: "100%", maxWidth: "240px" }}>
            <PaymentCard {...card} size="compact" label="Plus" />
          </div>
          <div className={styles.variantItem} style={{ width: "100%", maxWidth: "240px" }}>
            <PaymentCard {...card} size="compact" tone="neutral" last4="0142" />
          </div>
        </div>
      </section>

      <ComponentInstallStrip slug="payment-card" />
    </div>
  );
}
