import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

/*
 * The token cascade layers, proven in a real browser. Every token sheet sits
 * in a cascade layer (src/tokens/tokens.css owns the contract): the token
 * files in rift.tokens, the shipped presets in rift.preset, which outranks
 * it. Two promises follow, and a parse of the CSS cannot prove either,
 * because they are about which rule the cascade picks:
 *
 * - A plain, unlayered `:root` override of one token wins under every
 *   preset, in light and dark alike, whatever the preset's selectors.
 * - A value declared inside rift.tokens (how the site and the CLI's app
 *   template supply the base theme's face) stays a base value: the base
 *   theme takes it, and a preset still replaces it.
 *
 * The preset list is read from the generated stylesheets themselves, so a
 * new preset is checked the day it ships. Each check sets data-brand and
 * data-theme on <html>, the only place a preset applies, and restores them.
 */

const presetIds = Object.keys(import.meta.glob('../tokens/presets/*.css'))
  .map((path) => /\/([\w-]+)\.css$/.exec(path)?.[1] ?? '')
  .filter((id) => id && id !== 'presets');

const THEMES = ['light', 'dark'] as const;
const PROBE_FACE = 'Layer Probe';
const BASE_FACE = 'Base Probe';
const PROBE_FILL = 'rgb(1, 2, 3)';

const meta = {
  title: 'Foundations/Token layers',
  parameters: { layout: 'padded' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** Runs `check` under each brand (null is the base theme) and mode, then restores <html>. */
async function underEveryTheme(check: (brand: string | null, theme: (typeof THEMES)[number]) => void) {
  const html = document.documentElement;
  const saved = { brand: html.getAttribute('data-brand'), theme: html.getAttribute('data-theme') };
  try {
    for (const brand of [null, ...presetIds]) {
      for (const theme of THEMES) {
        if (brand) html.setAttribute('data-brand', brand);
        else html.removeAttribute('data-brand');
        html.setAttribute('data-theme', theme);
        check(brand, theme);
      }
    }
  } finally {
    for (const [attr, value] of [['data-brand', saved.brand], ['data-theme', saved.theme]] as const) {
      if (value === null) html.removeAttribute(attr);
      else html.setAttribute(attr, value);
    }
  }
}

/** A stylesheet added for the length of one check. */
function withStyle(css: string) {
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);
  return () => style.remove();
}

const Probe = () => (
  <p
    data-layer-probe=""
    style={{
      margin: 0,
      fontFamily: 'var(--font-family-primary)',
      backgroundColor: 'var(--color-action-primary-bg)',
    }}
  >
    Checks which rule the cascade picks for a token under every shipped theme, in both modes.
  </p>
);

const probeOf = (canvasElement: HTMLElement) => {
  const node = canvasElement.querySelector<HTMLElement>('[data-layer-probe]');
  if (!node) throw new Error('probe did not render');
  return () => getComputedStyle(node);
};

export const PlainRootOverrideWinsEverywhere: Story = {
  render: () => <Probe />,
  play: async ({ canvasElement }) => {
    const read = probeOf(canvasElement);
    await expect(presetIds.length).toBeGreaterThan(0);

    /* The guard against a vacuous pass: with no override, every preset
       paints its own action fill, so the preset sheets are loaded and
       applying in both modes. */
    const baseFill: Record<string, string> = {};
    const unchanged: string[] = [];
    await underEveryTheme((brand, theme) => {
      const fill = read().backgroundColor;
      if (!brand) baseFill[theme] = fill;
      else if (fill === baseFill[theme]) unchanged.push(`${brand}/${theme}`);
    });
    await expect(unchanged).toEqual([]);

    const remove = withStyle(
      `:root { --font-family-primary: '${PROBE_FACE}', serif; --color-action-primary-bg: ${PROBE_FILL}; }`
    );
    const lost: string[] = [];
    try {
      await underEveryTheme((brand, theme) => {
        const style = read();
        const where = `${brand ?? 'base'}/${theme}`;
        if (!style.fontFamily.includes(PROBE_FACE)) lost.push(`${where}: face is ${style.fontFamily}`);
        if (style.backgroundColor !== PROBE_FILL) lost.push(`${where}: action fill is ${style.backgroundColor}`);
      });
    } finally {
      remove();
    }
    await expect(lost).toEqual([]);
  },
};

export const LayeredBaseValueYieldsToPresets: Story = {
  render: () => <Probe />,
  play: async ({ canvasElement }) => {
    const read = probeOf(canvasElement);
    /* What each theme's face is with no base value supplied: a preset that
       sets no face of its own falls through to the base value, as it would
       to the token files' own. */
    const ownFace: Record<string, string> = {};
    await underEveryTheme((brand, theme) => {
      ownFace[`${brand ?? 'base'}/${theme}`] = read().fontFamily;
    });

    const remove = withStyle(`@layer rift.tokens { :root { --font-family-primary: '${BASE_FACE}', serif; } }`);
    const wrong: string[] = [];
    try {
      await underEveryTheme((brand, theme) => {
        const where = `${brand ?? 'base'}/${theme}`;
        const face = read().fontFamily;
        const setsOwnFace = brand !== null && ownFace[where] !== ownFace[`base/${theme}`];
        if (setsOwnFace ? face !== ownFace[where] : !face.includes(BASE_FACE)) {
          wrong.push(`${where}: face is ${face}`);
        }
      });
    } finally {
      remove();
    }
    await expect(wrong).toEqual([]);
    // At least one preset sets a face of its own, or the yield half proved nothing.
    await expect(
      presetIds.some((id) => ownFace[`${id}/light`] !== ownFace['base/light'])
    ).toBe(true);
  },
};
