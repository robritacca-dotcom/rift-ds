/**
 * promptfoo provider for /api/merchant-chat. Each case's `request` var holds
 * `messages` and `context`, what the page would send (the conversation, and the
 * table's setup with the reader's focus, edits, change log and any card
 * confirmation). The output is JSON: the reply's words and the cards it
 * carried, each reduced to what the assertions read. One object var, because
 * promptfoo expands a top-level array var into one test per item.
 */
const URL = process.env.MERCHANT_CHAT_URL ?? 'http://localhost:3000/api/merchant-chat';

export default class MerchantChatProvider {
  id() {
    return 'merchant-chat-route';
  }

  async callApi(_prompt, context) {
    const { messages, context: page } = context.vars.request;
    const response = await fetch(URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ messages, path: JSON.stringify(page) }),
    });
    if (!response.ok) return { error: `HTTP ${response.status}` };
    let text = '';
    let error = null;
    const cards = [];
    for (const line of (await response.text()).split('\n')) {
      if (!line.trim()) continue;
      const event = JSON.parse(line);
      if (event.type === 'delta') text += event.text;
      else if (event.type === 'error' || event.type === 'notice') error = event.message ?? event.text;
      else if (event.type === 'card') {
        const data = event.card.data ?? {};
        cards.push({ kind: event.card.kind, action: data.action ?? null, count: Array.isArray(data.ids) ? data.ids.length : null, skipped: data.skipped ?? null });
      }
    }
    if (error) return { output: JSON.stringify({ text: `[error] ${error}`, cards }) };
    return { output: JSON.stringify({ text, cards }) };
  }
}
