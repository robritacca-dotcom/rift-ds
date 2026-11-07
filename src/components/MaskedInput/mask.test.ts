import { describe, expect, it } from 'vitest';
import { applyMask, caretFor, concealMasked, readEdit, MASK_PRESETS } from './mask';

describe('applyMask', () => {
  it('writes separators only up to the last filled slot', () => {
    expect(applyMask('555', MASK_PRESETS.phoneUs).text).toBe('(555');
    expect(applyMask('5550', MASK_PRESETS.phoneUs).text).toBe('(555) 0');
    expect(applyMask('5550100199', MASK_PRESETS.phoneUs).text).toBe('(555) 010-0199');
  });
  it('drops characters that fit no slot', () => {
    expect(applyMask('55a5-01', MASK_PRESETS.phoneUs).raw).toBe('55501');
    expect(applyMask('12345678901', MASK_PRESETS.idNumber).raw).toBe('123456789');
  });
  it('runs a function mask', () => {
    const masked = applyMask('abcdef', (raw) => raw.match(/.{1,3}/g)?.join(' ') ?? '');
    expect(masked.text).toBe('abc def');
    expect(masked.raw).toBe('abcdef');
  });
});

describe('readEdit', () => {
  const masked = applyMask('5550100199', MASK_PRESETS.phoneUs);
  it('inserts a typed character at its slot', () => {
    expect(readEdit(applyMask('555', MASK_PRESETS.phoneUs), '(5551').raw).toBe('5551');
  });
  it('takes the digit before a separator deleted on its own', () => {
    const edit = readEdit(masked, '(555) 0100199', 'deleteContentBackward');
    expect(edit.raw).toBe('555010199');
    expect(edit.caretRaw).toBe(5);
  });
  it('replaces a selection with a paste', () => {
    expect(readEdit(masked, '(555) 999-0199').raw).toBe('5559990199');
  });
  it('reads an edit of a concealed value by slot', () => {
    const shown = { ...masked, text: concealMasked(masked) };
    expect(readEdit(shown, `${shown.text}`.slice(0, -1)).raw).toBe('555010019');
  });
});

describe('caretFor and concealMasked', () => {
  const masked = applyMask('5550100199', MASK_PRESETS.phoneUs);
  it('places the caret after a count of raw characters', () => {
    expect(caretFor(masked, 3)).toBe(4);
    expect(caretFor(masked, 6)).toBe(9);
  });
  it('hides all but the tail', () => {
    expect(concealMasked(applyMask('4242424242424242', MASK_PRESETS.card), 4)).toBe('•••• •••• •••• 4242');
  });
});
