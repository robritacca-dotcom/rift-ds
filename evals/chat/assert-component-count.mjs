/**
 * The component-count staleness tripwire. The golden set never hardcodes a
 * count, but when the answer states one ("93 components"), it must match the
 * registry — the exchange log caught the chat citing 93 on 18 Aug 2026, the
 * day after 0.9.0 took the registry past 100, which is exactly a corpus
 * built before the release and served after it. A qualified approximation
 * ("over 100 components") passes when it is close under the real count; an
 * answer citing no count at all passes, because vagueness is not staleness.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const registry = JSON.parse(
  readFileSync(join(repoRoot, 'src', 'components', 'registry.json'), 'utf8')
);
const count = registry.components.length;

const CLAIM = /(over|more than|about|around|roughly|nearly|~)?\s*(\d{2,3})\s+components\b/gi;

export default function assertComponentCount(output) {
  const text = String(output);
  const claims = [...text.matchAll(CLAIM)];
  if (claims.length === 0) {
    return { pass: true, score: 1, reason: 'no count stated' };
  }
  for (const [, qualifier, digits] of claims) {
    const n = Number(digits);
    const ok = qualifier ? n <= count && count - n <= 20 : n === count;
    if (!ok) {
      return {
        pass: false,
        score: 0,
        reason: `answer states ${qualifier ? `${qualifier} ` : ''}${n} components; the registry has ${count}`,
      };
    }
  }
  return { pass: true, score: 1, reason: `stated count matches the registry (${count})` };
}
