"use client";

import React from "react";
import Image from "next/image";
import { Button } from "rift-ds/components/Button/Button";
import { InspectorSection } from "rift-ds/components/Inspector/InspectorSection";
import { InspectorSlider } from "rift-ds/components/Inspector/InspectorSlider";
import { InspectorToggleSwitch } from "rift-ds/components/Inspector/InspectorToggleSwitch";
import { MessageCard } from "rift-ds/components/MessageCard/MessageCard";
import { MOTION_FEEDBACK_RESET_MS } from "rift-ds/tokens/motion";
import DotBackground from "@/components/DotBackground/DotBackground";
import { PASSES } from "@/lib/shaders/passes";
import { bakeThumbnails } from "@/lib/shaders/renderer";
import { sceneOf, TEMPLATES, valuesOf } from "@/lib/shaders/templates";
import type { Values } from "@/lib/shaders/types";
import { FloatingRail } from "./FloatingRail";
import styles from "./ShadersRail.module.css";
import templateStyles from "./TemplatesRail.module.css";
import layout from "./page.module.css";

/* ============================================
   The shaders rail: the Shaders view's own panel. Two levels in one seat:
   the picker (None, the dot grid the playground stands on, then a card per
   scene), and the picked scene's settings behind a back button. The pick
   is the playground's ground in every view, so the panel only chooses and
   tunes; the page owns the state and paints it (ShaderGround).

   The cards' pictures are each scene painted once on a throwaway context
   that is then released (bakeThumbnails), so the rail costs no live GPU
   context of its own, and they are painted again when the theme changes
   the colours they are made of.

   The sliders are uncontrolled: they write through `edits` into the page's
   values ref, which the ground reads every frame, so a drag renders
   nothing (CLAUDE.md's drag rule). Picking a scene or resetting replaces
   `seed` and bumps `generation`, which remounts them from it.
   ============================================ */

/** What the sliders and switches write, into the page's live values. */
export type ShaderEdits = {
  scene: (key: string, value: number) => void;
  speed: (value: number) => void;
  passOn: (id: string, on: boolean) => void;
  passParam: (id: string, key: string, value: number) => void;
};

/** The id of the "no shader" pick: the dot grid. */
export const NO_SHADER = "none";

const SPEED = { min: 0, max: 4, step: 0.05 };

/** The cards' baked pictures, at the templates rail's still proportions. */
const THUMB = { width: 480, height: 300 };

export default function ShadersRail({
  variant,
  value,
  onValueChange,
  seed,
  generation,
  edits,
  onResetScene,
  copyText,
  collapsed = false,
  onCollapsedChange,
}: {
  /** The right rail on desktop, or bare content inside the compact Drawer. */
  variant: "panel" | "drawer";
  /** The picked template's id, or NO_SHADER. */
  value: string;
  /** Called with the id picked. */
  onValueChange: (id: string) => void;
  /** The values the settings render their defaults from. */
  seed: Values;
  /** Bumped when the seed is replaced, to remount the settings from it. */
  generation: number;
  edits: ShaderEdits;
  /** Puts the picked scene back on its template's settings. */
  onResetScene: () => void;
  /** The recipe Copy recipe puts on the clipboard, read when it is pressed. */
  copyText: () => string;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}) {
  const [detail, setDetail] = React.useState(false);
  const [thumbs, setThumbs] = React.useState<string[]>([]);
  const [copied, setCopied] = React.useState(false);
  const hostRef = React.useRef<HTMLDivElement | null>(null);
  const template = TEMPLATES.find((t) => t.id === value);
  const open = detail && template !== undefined;

  React.useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let frame = 0;
    const bake = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() =>
        setThumbs(
          bakeThumbnails(
            host,
            TEMPLATES.map((t) => ({ scene: sceneOf(t), values: valuesOf(t) })),
            PASSES,
            THUMB.width,
            THUMB.height
          )
        )
      );
    };
    bake();
    const observer = new MutationObserver(bake);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme", "data-brand", "style"],
    });
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(copyText());
      setCopied(true);
      window.setTimeout(() => setCopied(false), MOTION_FEEDBACK_RESET_MS);
    } catch {
      setCopied(false);
    }
  };

  const picker = (
    <ul className={templateStyles.list}>
      <li>
        <button
          type="button"
          className={templateStyles.tile}
          aria-current={value === NO_SHADER || undefined}
          aria-label="None: the dot grid"
          onClick={() => onValueChange(NO_SHADER)}
        >
          <MessageCard
            className={templateStyles.card}
            media={
              <span className={styles.none}>
                <DotBackground contained />
              </span>
            }
            title="None"
            meta="The dot grid the playground stands on."
          />
        </button>
      </li>
      {TEMPLATES.map((t, i) => (
        <li key={t.id}>
          <button
            type="button"
            className={templateStyles.tile}
            aria-current={t.id === value || undefined}
            aria-label={`${t.label}: open its settings`}
            onClick={() => {
              onValueChange(t.id);
              setDetail(true);
            }}
          >
            <MessageCard
              className={templateStyles.card}
              media={
                thumbs[i] ? (
                  <Image
                    src={thumbs[i]}
                    alt=""
                    width={THUMB.width}
                    height={THUMB.height}
                    unoptimized
                    className={styles.thumb}
                  />
                ) : (
                  <span className={styles.pending} />
                )
              }
              title={t.label}
              meta={t.description}
            />
          </button>
        </li>
      ))}
    </ul>
  );

  const settings = template && (
    <div key={generation}>
      <div className={styles.back}>
        <Button
          variant="tertiary"
          size="compact"
          iconLeft={<span className={`material-symbols-rounded ${styles.backGlyph}`}>arrow_back</span>}
          label="Shaders"
          onClick={() => setDetail(false)}
        />
      </div>

      <InspectorSection title={template.label} defaultOpen>
        {sceneOf(template).params.map((param) => (
          <InspectorSlider
            key={param.key}
            label={param.label}
            size="compact"
            min={param.min}
            max={param.max}
            step={param.step}
            defaultValue={seed.scene[param.key]}
            onValueChange={(next) => edits.scene(param.key, next)}
          />
        ))}
      </InspectorSection>

      <InspectorSection title="Motion" defaultOpen>
        <InspectorSlider
          label="Speed"
          size="compact"
          min={SPEED.min}
          max={SPEED.max}
          step={SPEED.step}
          defaultValue={seed.speed}
          onValueChange={edits.speed}
        />
      </InspectorSection>

      {PASSES.map((pass) => {
        const state = seed.passes[pass.id];
        return (
          <InspectorSection key={pass.id} title={pass.label} defaultOpen={state.on}>
            <InspectorToggleSwitch
              label="On"
              size="compact"
              defaultChecked={state.on}
              onCheckedChange={(checked) => edits.passOn(pass.id, checked)}
            />
            {pass.params.map((param) => (
              <InspectorSlider
                key={param.key}
                label={param.label}
                size="compact"
                min={param.min}
                max={param.max}
                step={param.step}
                defaultValue={state.params[param.key]}
                onValueChange={(next) => edits.passParam(pass.id, param.key, next)}
              />
            ))}
          </InspectorSection>
        );
      })}
    </div>
  );

  const body = <div ref={hostRef}>{open ? settings : picker}</div>;

  const footer = (
    <div className={layout.railFooter}>
      <Button
        label={copied ? "Copied" : "Copy recipe"}
        size="compact"
        variant="primary"
        iconLeft="content_copy"
        disabled={template === undefined}
        onClick={copy}
      />
    </div>
  );

  if (variant === "drawer") {
    return (
      <div className={layout.drawerControls}>
        {body}
        {footer}
      </div>
    );
  }

  return (
    <FloatingRail
      side="right"
      label={open ? `${template.label} settings` : "Shader picker"}
      title={open ? template.label : "Shaders"}
      collapsed={collapsed}
      onCollapsedChange={onCollapsedChange ?? (() => {})}
      onReset={open ? onResetScene : () => onValueChange(NO_SHADER)}
      resetLabel={open ? `Back to the ${template.label.toLowerCase()} defaults` : "Back to the dot grid"}
      resetDisabled={!open && value === NO_SHADER}
      footer={footer}
    >
      {body}
    </FloatingRail>
  );
}
