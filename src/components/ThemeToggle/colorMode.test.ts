import { describe, expect, it } from 'vitest';
import { colorModeScript } from './colorMode';
import { BASE_THEME_ID, SHIPPED_THEMES } from '../../tokens/values';

/** Runs the script against a fake document root and storage, returning the root's attributes. */
function run(script: string, stored: Record<string, string>, initial: Record<string, string> = {}) {
  const attrs = new Map(Object.entries(initial));
  const root = {
    setAttribute: (name: string, value: string) => attrs.set(name, value),
    removeAttribute: (name: string) => attrs.delete(name),
    hasAttribute: (name: string) => attrs.has(name),
    getAttribute: (name: string) => attrs.get(name) ?? null,
  };
  const media = { matches: false, addEventListener: () => {} };
  const fn = new Function('document', 'window', 'localStorage', 'MutationObserver', script);
  fn(
    { documentElement: root },
    { matchMedia: () => media },
    { getItem: (key: string) => stored[key] ?? null },
    undefined,
  );
  return Object.fromEntries(attrs);
}

describe('colorModeScript', () => {
  it('never touches data-brand unless a brand key is given', () => {
    expect(colorModeScript()).not.toContain('data-brand');
    expect(run(colorModeScript(), { theme: 'dark', brand: 'plum' }, { 'data-brand': 'zest' })).toEqual({
      'data-brand': 'zest',
      'data-theme-setting': 'dark',
      'data-theme': 'dark',
    });
  });

  it('applies a stored preset id as data-brand before first paint', () => {
    const preset = SHIPPED_THEMES.find((theme) => theme.brand !== null)!;
    const attrs = run(colorModeScript({ brandStorageKey: 'brand' }), { brand: preset.id });
    expect(attrs['data-brand']).toBe(preset.brand);
  });

  it('removes data-brand for the base theme, and ignores a value that is not an id', () => {
    const script = colorModeScript({ brandStorageKey: 'brand' });
    expect(run(script, { brand: BASE_THEME_ID }, { 'data-brand': 'plum' })['data-brand']).toBeUndefined();
    expect(run(script, { brand: '"><img>' }, { 'data-brand': 'plum' })['data-brand']).toBe('plum');
  });

  it("defaults its base theme id to the one rift-ds/tokens/values ships", () => {
    expect(colorModeScript({ brandStorageKey: 'brand' })).toContain(`brand === ${JSON.stringify(BASE_THEME_ID)}`);
  });
});
