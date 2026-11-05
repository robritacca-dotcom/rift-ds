/**
 * promptfoo provider for /api/merchant-chat/starters. Each case's `focus` var
 * is the focus the page would send (chatFocus.tsx's focusForRequest), posted as
 * the route's `context` string. The output is the chips, one per line; an empty
 * response is passed through as empty so a row of fallbacks fails loudly.
 */
const URL = process.env.STARTERS_URL ?? 'http://localhost:3000/api/merchant-chat/starters';

export default class StartersProvider {
  id() {
    return 'starters-route';
  }

  async callApi(_prompt, context) {
    const focus = context.vars.focus;
    const response = await fetch(URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ context: JSON.stringify({ focus }) }),
    });
    if (!response.ok) return { error: `HTTP ${response.status}` };
    const { suggestions = [] } = await response.json();
    return { output: suggestions.join('\n') };
  }
}
