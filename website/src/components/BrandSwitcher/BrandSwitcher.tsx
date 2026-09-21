"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { themeSelectorTiles } from "@/lib/theme/presets";
import { useSiteTheme } from "@/lib/theme/use-theme-overrides";
import { applyBrand, readBrand, subscribeBrand } from "@/lib/theme/brand";
import styles from "./BrandSwitcher.module.css";

// Matches the SSR value of data-brand on <html> in layout.tsx.
const getServerSnapshot = () => "mono";

/**
 * The header's theme switcher: a circular trigger wearing the active
 * theme's swatch (colour and corner language both), opening a menu of
 * every shipped look — the same tiles the home page's dot row and the
 * playground's picker render, from the same builder. Selection applies
 * through the shared brand helper, and every instance stays in sync by
 * subscribing to the attribute itself, the way ThemeToggle does.
 */
export default function BrandSwitcher({
  className,
  placement = "down",
  align = "right",
}: {
  className?: string;
  /** Which way the menu opens — "up" for triggers near the viewport floor. */
  placement?: "down" | "up";
  /** Which trigger edge the menu hugs. */
  align?: "left" | "right";
}) {
  const active = useSyncExternalStore(subscribeBrand, readBrand, getServerSnapshot);
  const theme = useSiteTheme();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});

  /* The menu portals to <body> with fixed positioning measured from the
     trigger, so an overflow-clipping host (the templates' sidebar footer
     slot animates its overflow) can never swallow it. */
  const positionMenu = useCallback(() => {
    const rect = rootRef.current?.getBoundingClientRect();
    if (!rect) return;
    const style: React.CSSProperties = { position: "fixed" };
    if (placement === "up") style.bottom = window.innerHeight - rect.top + 8;
    else style.top = rect.bottom + 8;
    if (align === "left") style.left = rect.left;
    else style.right = window.innerWidth - rect.right;
    setMenuStyle(style);
  }, [placement, align]);

  useEffect(() => {
    if (!open) return;
    positionMenu();
    window.addEventListener("resize", positionMenu);
    window.addEventListener("scroll", positionMenu, true);
    return () => {
      window.removeEventListener("resize", positionMenu);
      window.removeEventListener("scroll", positionMenu, true);
    };
  }, [open, positionMenu]);

  const tiles = themeSelectorTiles(theme === "dark" ? "dark" : "light");
  const activeTile = tiles.find((t) => t.value === active) ?? tiles[0];

  /* Light-dismiss: outside click and Escape close the menu; both listeners
     exist only while it is open. */
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (!rootRef.current?.contains(target) && !menuRef.current?.contains(target)) {
        setOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={`${styles.root} ${className || ""}`}>
      <button
        type="button"
        className={styles.trigger}
        /* Concentric with the swatch inside (the Composer's rule): the
           trigger's curve is the swatch's radius plus the 11px inset
           around it, so a squared theme squares the pill in parallel.
           The 999px circle saturates to the same circle as before. */
        style={{ borderRadius: `calc(${activeTile.swatchRadius} + 11px)` }}
        aria-label={`Theme: ${activeTile.label}`}
        title={`Theme: ${activeTile.label}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <span
          className={styles.triggerSwatch}
          style={{ backgroundColor: activeTile.color, borderRadius: activeTile.swatchRadius }}
          aria-hidden="true"
        />
      </button>

      {open &&
        createPortal(
        <div
          ref={menuRef}
          className={styles.menu}
          style={menuStyle}
          role="menu"
          aria-label="Theme"
        >
          {tiles.map((tile) => (
            <button
              key={tile.value}
              type="button"
              role="menuitemradio"
              aria-checked={active === tile.value}
              className={`${styles.row} ${active === tile.value ? styles.rowActive : ""}`}
              onClick={() => {
                applyBrand(tile.value);
                setOpen(false);
              }}
            >
              <span
                className={styles.rowSwatch}
                style={{ backgroundColor: tile.color, borderRadius: tile.swatchRadius }}
                aria-hidden="true"
              />
              <span className={styles.rowText}>
                <span className={styles.rowName} style={{ fontFamily: tile.headingFont }}>
                  {tile.label}
                </span>
                <span className={styles.rowFont} style={{ fontFamily: tile.bodyFont }}>
                  {tile.description}
                </span>
              </span>
              {active === tile.value && (
                <span className={`material-symbols-rounded ${styles.rowCheck}`} aria-hidden="true">
                  check
                </span>
              )}
            </button>
          ))}
          <span className={styles.menuDivider} aria-hidden="true" />
          {/* The list ends where a new theme would begin: the dashed slot
              opens the playground, where a visitor builds their own. */}
          <Link
            href="/playground"
            role="menuitem"
            className={styles.row}
            onClick={() => setOpen(false)}
          >
            <span className={styles.rowSwatchAdd} aria-hidden="true">
              <span className="material-symbols-rounded">add</span>
            </span>
            <span className={styles.rowText}>
              <span className={styles.rowName}>Make your own</span>
              <span className={styles.rowFont}>Opens the playground</span>
            </span>
          </Link>
        </div>,
        document.body
      )}
    </div>
  );
}
