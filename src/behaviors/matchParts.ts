/**
 * matchParts: where a typed query sits inside a piece of text, as the three
 * runs a list draws: what comes before the match, the match itself in the
 * text's own casing, and what comes after. Null when the query is empty or
 * the text does not hold it. The one home of the rule, so every list that
 * marks what a person typed (a mention menu, a command palette) finds the
 * same run; each component draws the middle part in its own match class.
 */
export const matchParts = (text: string, query: string): [string, string, string] | null => {
  const needle = query.trim().toLowerCase();
  if (needle === '') return null;
  const at = text.toLowerCase().indexOf(needle);
  if (at < 0) return null;
  return [text.slice(0, at), text.slice(at, at + needle.length), text.slice(at + needle.length)];
};
