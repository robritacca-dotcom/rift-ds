/**
 * promptfoo transformResponse for /api/chat.
 *
 * The route streams NDJSON, one ChatEvent per line — the union in
 * src/chat/types.ts is authoritative; types this file does not
 * read (status, model, exchange, done) fall through the chain unhandled. The
 * eval's output is the assembled answer text. Notices and errors are prefixed
 * with a marker instead of being dropped, so a rate-limit or breaker response
 * fails assertions loudly rather than being scored as a strange answer. A
 * `question` event (the ask_user tool) is appended as a `[question]` line
 * naming each prompt, so a case can assert whether the reply asked.
 */
module.exports = (json, text) => {
  let out = '';
  let notice = null;
  let error = null;
  let question = null;
  for (const line of String(text || '').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    let event;
    try {
      event = JSON.parse(trimmed);
    } catch {
      continue;
    }
    if (event.type === 'delta') out += event.text;
    else if (event.type === 'notice') notice = event.text;
    else if (event.type === 'error') error = event.message;
    else if (event.type === 'question') {
      question = (event.set?.questions ?? []).map((q) => q.prompt).join(' | ');
    }
  }
  if (error) return `[error] ${error}`;
  if (!out && notice) return `[notice] ${notice}`;
  return question ? `${out}\n[question] ${question}` : out;
};
