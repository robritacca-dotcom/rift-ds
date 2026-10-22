/**
 * The brand an imported DESIGN.md describes, and its mark.
 *
 * DESIGN.md files are commonly written about a real product ("Design
 * System Inspired by Spotify", DESIGN-stripe.md). When the file's title or
 * its file name names a brand in the generated mark set
 * (data/brand-marks.generated.ts, cut from Simple Icons by
 * scripts/generate-brand-marks.mjs), the source card shows that brand's
 * mark beside the title, to identify whose look the file describes. A
 * file it cannot place gets a monogram of the name instead.
 *
 * The match is deterministic and exact: filler words come out ("design",
 * "system", "analysis", "inspired by"), and what is left must equal a
 * brand's name, slug or alias, as a whole or word by word. No fuzzy
 * matching, so a file that disguises its subject ("Stripi") falls back to
 * its file name, then to the monogram, never to a guess.
 *
 * The marks are trademarks, shown in two places only: the source card, and
 * the dropzone's example buttons (ThemeSourceInvite), which name the brand
 * whose shipped DESIGN.md each one loads. The themed mock product keeps its
 * own mark (the Product name lever) whatever the file names.
 */
import type { BrandMarkData } from "@/data/brand-marks.generated";

export type BrandMark =
  | { kind: "mark"; title: string; hex: string; path: string }
  | { kind: "monogram"; letter: string };

/** Words that describe the file rather than name its subject. */
const FILLER = new Set([
  "a", "an", "the", "of", "by", "for", "and", "inspired", "design", "designs", "system", "systems",
  "analysis", "analyses", "language", "guide", "guidelines", "style", "styleguide", "brand", "ui", "ux",
  "web", "app", "interface", "md", "spec", "tokens", "theme", "look", "kit", "library",
]);

const normalise = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\.(md|markdown|txt)$/, "");

/** The words of a title or file name that could name a brand. */
const subjectWords = (text: string) =>
  normalise(text)
    .split(/[^a-z0-9.+]+/)
    .map((word) => word.replace(/^\.+|\.+$/g, ""))
    .filter((word) => word && !FILLER.has(word));

/** A brand's lookup key: lowercase letters and digits only. */
const keyOf = (text: string) => normalise(text).replace(/[^a-z0-9]/g, "");

function matchIn(words: string[], index: Map<string, BrandMarkData>): BrandMarkData | null {
  if (words.length === 0) return null;
  /* The longest run of words first, so "apple music" would beat "apple". */
  for (let size = words.length; size >= 1; size--) {
    for (let start = 0; start + size <= words.length; start++) {
      const hit = index.get(keyOf(words.slice(start, start + size).join("")));
      if (hit) return hit;
    }
  }
  return null;
}

/**
 * The mark for a file: its title first, its file name second, else a
 * monogram of whichever names something. Null when neither has a word.
 */
export async function brandMarkFor(title: string, fileName: string): Promise<BrandMark | null> {
  const { BRAND_MARKS } = await import("@/data/brand-marks.generated");
  const index = new Map<string, BrandMarkData>();
  for (const mark of BRAND_MARKS) {
    for (const name of [mark.slug, mark.title, ...mark.aliases]) {
      const key = keyOf(name);
      if (key && !index.has(key)) index.set(key, mark);
    }
  }

  const fromTitle = subjectWords(title);
  const fromFile = subjectWords(fileName);
  const hit = matchIn(fromTitle, index) ?? matchIn(fromFile, index);
  if (hit) return { kind: "mark", title: hit.title, hex: hit.hex, path: hit.path };

  const word = fromTitle[0] ?? fromFile[0];
  const letter = word?.match(/[a-z0-9]/)?.[0];
  return letter ? { kind: "monogram", letter: letter.toUpperCase() } : null;
}
