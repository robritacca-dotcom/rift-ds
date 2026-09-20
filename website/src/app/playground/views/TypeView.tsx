"use client";

import { useEffect, useRef, useState } from "react";
import { SectionTitle } from "@robr0/design-system/components/SectionTitle/SectionTitle";
import { tokenRegistry } from "@robr0/design-system/tokens/registry";
import { collectDeclaredTokens, varChain } from "@/lib/token-source";
import pageStyles from "../page.module.css";
import styles from "./TypeView.module.css";

/**
 * THE TYPE VIEW — the full type ramp as a live specimen sheet. Every row
 * renders straight from its `--font-<step>-*` tokens, so the typeface
 * levers restyle the whole ramp in place, and the split between the
 * heading and body family roles is visible per step: each row's role chip
 * comes from following the step's declared `-family` reference in the
 * CSSOM (the same chain reader inspect mode uses), never from a
 * hand-maintained list.
 *
 * The step set derives from the generated token registry (every name
 * ending in `-size` is a step), so a new scale step appears here on the
 * next build; the tier grouping below is presentation order only, and a
 * step the tiers don't know yet still renders, appended to the body tier.
 */

const SPECIMEN = "Almost before we knew it, we had left the ground.";

type Role = "heading" | "body";

type StepMeta = {
  role: Role | null;
  size: string;
  weight: string;
  lineHeight: string;
  family: string;
};

/* Presentation order for the known tiers. Grouping and captions only —
   the steps themselves come from the registry. */
const TIERS: ReadonlyArray<{ title: string; note: string; steps: string[] }> = [
  {
    title: "Display",
    note: "The poster tier. Set light, tracked open, and leaded near solid; these are the only steps that shrink on small screens.",
    steps: ["mega-1", "mega-2", "display-1", "display-2", "sub-display"],
  },
  {
    title: "Headings",
    note: "Document structure. Hierarchy is carried by weight contrast against the body, not by the typeface changing.",
    steps: ["heading-1", "heading-2", "heading-3"],
  },
  {
    title: "Body",
    note: "Running text, labels and the caption floor. These steps read the body role, so splitting the faces leaves them on the text face.",
    steps: [
      "title-body",
      "paragraph-em",
      "paragraph",
      "paragraph-sm",
      "paragraph-sm-em",
      "overline",
      "caption",
    ],
  },
];

/* Every step the registry knows: the names ending in -size, stripped to
   their stems. Alphabetical in the registry; the tiers restore ramp order. */
const REGISTRY_STEPS = tokenRegistry.typography
  .filter((name) => name.endsWith("-size"))
  .map((name) => name.slice("--font-".length, -"-size".length));

const KNOWN_STEPS = new Set(TIERS.flatMap((tier) => tier.steps));

/* The rendered tiers: known steps in presentation order (skipping any the
   registry no longer carries), unknown ones appended to the last tier so a
   new step can never be silently missing from the ramp. */
const RENDERED_TIERS = TIERS.map((tier, index) => ({
  ...tier,
  steps: [
    ...tier.steps.filter((step) => REGISTRY_STEPS.includes(step)),
    ...(index === TIERS.length - 1
      ? REGISTRY_STEPS.filter((step) => !KNOWN_STEPS.has(step))
      : []),
  ],
}));

const stepLabel = (step: string): string =>
  step
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const sampleStyle = (step: string): React.CSSProperties => ({
  fontFamily: `var(--font-${step}-family)`,
  fontSize: `var(--font-${step}-size)`,
  fontWeight: `var(--font-${step}-weight)` as React.CSSProperties["fontWeight"],
  lineHeight: `var(--font-${step}-line-height)`,
  letterSpacing: `var(--font-${step}-letter-spacing)`,
  /* The overline tokens set metrics only; casing belongs to the use site
     (see tokens-typography.css), and a specimen is a use site. */
  textTransform: step === "overline" ? "uppercase" : undefined,
});

/** First family of a font-family list, unquoted, for display. */
const firstFamily = (list: string): string =>
  list.split(",")[0]?.trim().replace(/^['"]|['"]$/g, "") ?? "";

const roundPx = (value: string): string => {
  const px = parseFloat(value);
  return Number.isFinite(px) ? `${Math.round(px)}px` : value;
};

export default function TypeView({
  stageMobile = false,
}: {
  /** Whether the stage is emulating a phone — flipping it restyles the
      samples without any root mutation or resize, so it must re-trigger
      the read below. */
  stageMobile?: boolean;
}) {
  const sampleRefs = useRef(new Map<string, HTMLElement>());
  const [meta, setMeta] = useState<Record<string, StepMeta>>({});
  const [faces, setFaces] = useState<{ heading: string; body: string } | null>(
    null,
  );

  /* Read once on mount, then again whenever the levers or the theme write
     to the root element (fonts land instantly, no settle wait needed), on
     resize, where the display tier's responsive collapse moves the sizes,
     and when the mobile stage flips, which moves them the same way with
     no resize to hear. All values come off the rendered samples, so the
     labels can never disagree with the pixels. */
  useEffect(() => {
    let frame = 0;
    const read = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const declared = collectDeclaredTokens();
        const next: Record<string, StepMeta> = {};
        for (const [step, el] of sampleRefs.current) {
          const cs = getComputedStyle(el);
          const chain = varChain(`--font-${step}-family`, declared);
          const role = chain.includes("--font-family-heading")
            ? "heading"
            : chain.includes("--font-family-body")
              ? "body"
              : null;
          next[step] = {
            role,
            size: roundPx(cs.fontSize),
            weight: cs.fontWeight,
            lineHeight:
              cs.lineHeight === "normal" ? "normal" : roundPx(cs.lineHeight),
            family: firstFamily(cs.fontFamily),
          };
        }
        const rootStyle = getComputedStyle(document.documentElement);
        setFaces({
          heading: firstFamily(
            rootStyle.getPropertyValue("--font-family-heading"),
          ),
          body: firstFamily(rootStyle.getPropertyValue("--font-family-body")),
        });
        setMeta(next);
      });
    };

    read();
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme", "style"],
    });
    window.addEventListener("resize", read);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", read);
    };
  }, [stageMobile]);

  return (
    <>
      <section className={pageStyles.demoSection} aria-label="Type ramp">
        <SectionTitle title="Type ramp" />
        <p className={pageStyles.sectionNote}>
          The whole scale, rendered live from its tokens: pick a different
          body or heading face in the panel and every step below restyles in
          place. Each row lists its size, weight and line height, read off
          the rendered sample, plus the family role its font token chains
          to.
        </p>

        {/* The two family roles, resolved live. One typeface by default:
            both roles chain to the primary family until the heading lever
            splits them. */}
        {faces && (
          <div className={styles.faceCards}>
            <div className={styles.faceCard}>
              <span
                className={styles.faceGlyph}
                style={{ fontFamily: "var(--font-family-heading)" }}
                aria-hidden="true"
              >
                Ag
              </span>
              <div className={styles.faceInfo}>
                <span className={styles.faceRole}>Heading face</span>
                <span className={styles.faceName}>{faces.heading}</span>
                <code className={styles.faceToken}>--font-family-heading</code>
              </div>
            </div>
            <div className={styles.faceCard}>
              <span
                className={styles.faceGlyph}
                style={{ fontFamily: "var(--font-family-body)" }}
                aria-hidden="true"
              >
                Ag
              </span>
              <div className={styles.faceInfo}>
                <span className={styles.faceRole}>Body face</span>
                <span className={styles.faceName}>{faces.body}</span>
                <code className={styles.faceToken}>--font-family-body</code>
              </div>
            </div>
          </div>
        )}
      </section>

      {RENDERED_TIERS.map((tier) => (
        <section
          key={tier.title}
          className={pageStyles.demoSection}
          aria-label={tier.title}
        >
          <SectionTitle title={tier.title} />
          <p className={pageStyles.sectionNote}>{tier.note}</p>
          <div className={styles.ramp}>
            {tier.steps.map((step) => {
              const stepMeta = meta[step];
              return (
                <div key={step} className={styles.rampRow}>
                  <div className={styles.rampMeta}>
                    <span className={styles.rampName}>
                      {stepLabel(step)}
                      {stepMeta?.role && (
                        <span className={styles.roleChip}>
                          {stepMeta.role} face
                        </span>
                      )}
                    </span>
                    <code className={styles.rampToken}>{`--font-${step}`}</code>
                    {stepMeta && (
                      <span className={styles.rampValues}>
                        {stepMeta.size} · {stepMeta.weight} ·{" "}
                        {stepMeta.lineHeight}
                      </span>
                    )}
                  </div>
                  <p
                    ref={(el) => {
                      if (el) sampleRefs.current.set(step, el);
                      else sampleRefs.current.delete(step);
                    }}
                    className={styles.rampSample}
                    style={sampleStyle(step)}
                  >
                    {SPECIMEN}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </>
  );
}
