/**
 * The mask engine behind MaskedInput: a pattern or a function turns the raw
 * characters a person typed into the text the field shows, and a typed edit
 * of the shown text back into raw characters. No React, so a server can
 * format a stored value the same way.
 *
 * A pattern is a string where `#` takes a digit, `A` a letter, `*` either,
 * and every other character is written as it stands: `(###) ###-####`.
 * Letters keep the case they were typed in; a function mask can change it.
 */

/** A pattern string, or a function from the raw characters to the shown text. */
export type Mask = string | ((raw: string) => string);

/** Ready-made patterns. They are data, not a claim about any locale: pick the one that matches what you collect. */
export const MASK_PRESETS = {
  /** A ten-digit phone number in the US shape: `(555) 010-0199`. */
  phoneUs: '(###) ###-####',
  /** A sixteen-digit card number in four groups: `4242 4242 4242 4242`. */
  card: '#### #### #### ####',
  /** A nine-digit ID number in three groups: `123-45-6789`. */
  idNumber: '###-##-####',
  /** A five-digit postal code with an optional four-digit extension: `94107-1234`. */
  postalCode: '#####-####',
  /** A licence key of four blocks of four letters or digits: `AB12-CD34-EF56-GH78`. */
  licenceKey: '****-****-****-****',
} as const;

const TOKENS: Record<string, RegExp> = { '#': /\p{Nd}/u, A: /\p{L}/u, '*': /[\p{L}\p{Nd}]/u };
const RAW_CHAR = /[\p{L}\p{Nd}]/u;

/** The shown text, and which of its characters stand for a raw character (the rest are the mask's literals). */
export type Masked = { text: string; raw: string; slots: boolean[] };

/** How many raw characters a pattern holds, or Infinity for a function mask. */
export function maskCapacity(mask: Mask): number {
  return typeof mask === 'string' ? [...mask].filter((c) => c in TOKENS).length : Infinity;
}

/** Whether every slot in a pattern takes a digit, so the field can ask for the numeric keyboard. */
export function maskIsNumeric(mask: Mask): boolean {
  return typeof mask === 'string' && [...mask].every((c) => c === '#' || !(c in TOKENS));
}

/**
 * Raw characters through the mask. A character that fits no slot is
 * dropped; literals are written only up to the last filled slot, so a
 * half-typed number never ends in a dangling separator.
 */
export function applyMask(raw: string, mask: Mask): Masked {
  const chars = [...raw].filter((c) => RAW_CHAR.test(c));
  if (typeof mask === 'function') {
    const text = mask(chars.join(''));
    const slots = [...text].map((c) => RAW_CHAR.test(c));
    return { text, raw: [...text].filter((c) => RAW_CHAR.test(c)).join(''), slots };
  }
  let text = '';
  let pending = '';
  const slots: boolean[] = [];
  const pendingSlots: boolean[] = [];
  const kept: string[] = [];
  let i = 0;
  for (const m of mask) {
    if (i >= chars.length) break;
    const token = TOKENS[m];
    if (!token) {
      pending += m;
      pendingSlots.push(false);
      continue;
    }
    while (i < chars.length && !token.test(chars[i])) i++;
    if (i >= chars.length) break;
    text += pending + chars[i];
    slots.push(...pendingSlots, true);
    pending = '';
    pendingSlots.length = 0;
    kept.push(chars[i]);
    i++;
  }
  return { text, raw: kept.join(''), slots };
}

/** What an edit of the shown text did to the raw value, and where the caret goes. */
export type MaskEdit = { raw: string; caretRaw: number };

/**
 * Read an edit of the shown text back into raw characters. The two texts
 * are compared from each end; whatever the person removed is taken out of
 * the raw value by slot, whatever they typed or pasted goes in, and
 * removing only a separator (Backspace just after a dash) removes the raw
 * character before it, which is what the person meant.
 */
export function readEdit(previous: Masked, nextText: string, inputType?: string): MaskEdit {
  const before = [...previous.text];
  const after = [...nextText];
  let start = 0;
  while (start < before.length && start < after.length && before[start] === after[start]) start++;
  let endBefore = before.length;
  let endAfter = after.length;
  while (endBefore > start && endAfter > start && before[endBefore - 1] === after[endAfter - 1]) {
    endBefore--;
    endAfter--;
  }
  const rawIndex = (displayIndex: number) => previous.slots.slice(0, displayIndex).filter(Boolean).length;
  let rawStart = rawIndex(start);
  const rawEnd = rawIndex(endBefore);
  const inserted = after
    .slice(start, endAfter)
    .filter((c) => RAW_CHAR.test(c))
    .join('');
  const rawChars = [...previous.raw];
  if (inserted === '' && rawStart === rawEnd && endBefore > start) {
    // Only literals went: take the raw character on the side the key deletes towards.
    if (inputType === 'deleteContentForward') rawChars.splice(rawStart, 1);
    else if (rawStart > 0) {
      rawChars.splice(rawStart - 1, 1);
      rawStart -= 1;
    }
    return { raw: rawChars.join(''), caretRaw: rawStart };
  }
  rawChars.splice(rawStart, rawEnd - rawStart, ...inserted);
  return { raw: rawChars.join(''), caretRaw: rawStart + [...inserted].length };
}

/** The position in the shown text just after `count` raw characters. */
export function caretFor(masked: Masked, count: number): number {
  if (count <= 0) return 0;
  let seen = 0;
  for (let i = 0; i < masked.slots.length; i++) {
    if (masked.slots[i]) seen++;
    if (seen === count) return i + 1;
  }
  return masked.text.length;
}

/** The shown text with its raw characters hidden as dots, all but the last `visibleTail`. */
export function concealMasked(masked: Masked, visibleTail = 0, dot = '•'): string {
  const total = masked.slots.filter(Boolean).length;
  let seen = 0;
  return [...masked.text]
    .map((c, i) => {
      if (!masked.slots[i]) return c;
      seen++;
      return seen > total - visibleTail ? c : dot;
    })
    .join('');
}
