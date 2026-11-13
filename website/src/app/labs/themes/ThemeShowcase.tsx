"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Button } from "rift-ds/components/Button/Button";
import BrandSwitcher from "@/components/BrandSwitcher/BrandSwitcher";
import ThemeToggle from "@/components/ThemeToggle/ThemeToggle";
import { applyBrand, readBrand, SERVED_THEME_ID, subscribeBrand } from "@/lib/theme/brand";
import { EXAMPLES, ShowcaseMosaic } from "@/components/ThemeShowcase/ThemeShowcase";
import styles from "./showcase.module.css";

/**
 * The page: a sticky hero beside the mosaic of the chosen example. Picking
 * an example applies the theme it is paired with (through applyBrand, so
 * the pick holds across the site like any other); the theme picker in the
 * hero then re-themes the example without moving off it.
 */
export default function ThemeShowcase() {
  const [active, setActive] = useState(0);
  const example = EXAMPLES[active];
  /* The snippet names the theme the page is wearing right now, whichever
     surface set it (an example tab or the picker). */
  const brand = useSyncExternalStore(subscribeBrand, readBrand, () => SERVED_THEME_ID);

  /* The page opens on the first example in the theme it is paired with. */
  useEffect(() => {
    applyBrand(EXAMPLES[0].theme);
  }, []);

  const pick = (index: number) => {
    setActive(index);
    applyBrand(EXAMPLES[index].theme);
    window.scrollTo({ top: 0 });
  };

  return (
    <div className={styles.page}>
      <section className={styles.hero} aria-labelledby="showcase-title">
        <div className={styles.heroBody}>
          <span className={styles.eyebrow}>One attribute, every look</span>
          <h1 id="showcase-title" className={styles.title}>
            Build it once, theme it anywhere
          </h1>
          <p className={styles.lede}>
            Every screen here is the same components and the same tokens. Pick a
            theme and the colour, type, shape, density and depth all move together.
          </p>
          <pre className={styles.code}>
            <code>
              <span className={styles.codeMuted}>{'import "rift-ds/tokens/presets/presets.css";'}</span>
              {"\n\n"}
              {"<html "}
              <span className={styles.codeAttr}>data-brand</span>
              {'="'}
              <span className={styles.codeValue}>{brand}</span>
              {'">'}
            </code>
          </pre>
          <div className={styles.controls}>
            <BrandSwitcher align="left" />
            <ThemeToggle />
          </div>
          <div className={styles.actions}>
            <Button label="Get started" iconRight="arrow_forward" href="/overview" />
            <Button label="Make your own" variant="secondary" iconLeft="palette" href="/playground" />
          </div>
        </div>

        <nav className={styles.examples} aria-label="Live examples">
          <span className={styles.examplesLabel}>Live examples</span>
          <div className={styles.tabs} role="tablist">
            {EXAMPLES.map((item, index) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={index === active}
                aria-controls="showcase-mosaic"
                className={styles.tab}
                onClick={() => pick(index)}
              >
                <span className={styles.tabBar} aria-hidden="true" />
                <span className={styles.tabName}>{item.label}</span>
              </button>
            ))}
          </div>
        </nav>
      </section>

      <div role="tabpanel" aria-label={example.label} className={styles.stage}>
        <ShowcaseMosaic key={example.id} id="showcase-mosaic" example={example} />
      </div>
    </div>
  );
}
