/**
 * The merchant assistant's behaviour held to each case's `expect` var:
 *   card: an order-action card is required ("order-action"), or forbidden (false).
 *   action / count: the proposed card's action and how many orders it changes.
 *   says / never: patterns the reply's words must and must not match (case-insensitive).
 * A notice or an error fails every case: a guardrail or an outage is not an answer.
 */
export default function assertMerchant(output, context) {
  const { text, cards } = JSON.parse(String(output));
  const expect = context.vars.expect ?? {};
  const problems = [];
  if (text.startsWith('[error]')) problems.push(text);
  const proposal = cards.find((card) => card.kind === 'order-action');
  if (expect.card === 'order-action' && !proposal) problems.push('no proposal card');
  if (expect.card === false && proposal) problems.push(`an unwanted proposal card (${proposal.action}, ${proposal.count})`);
  if (expect.action && proposal && proposal.action !== expect.action) problems.push(`proposed ${proposal.action}, not ${expect.action}`);
  if (expect.count != null && proposal && proposal.count !== expect.count) problems.push(`proposed ${proposal.count} orders, not ${expect.count}`);
  for (const pattern of expect.says ?? []) if (!new RegExp(pattern, 'i').test(text)) problems.push(`never says /${pattern}/`);
  for (const pattern of expect.never ?? []) if (new RegExp(pattern, 'i').test(text)) problems.push(`says /${pattern}/: "${text.slice(0, 160)}"`);
  return { pass: problems.length === 0, score: problems.length ? 0 : 1, reason: problems.length ? problems.join('; ') : 'as expected' };
}
