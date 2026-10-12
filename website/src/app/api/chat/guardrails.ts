/**
 * The site's guardrails: the package's Upstash implementation, configured
 * from the deploy environment and shared by the three chat routes.
 *
 * Four layers, outermost last: the stateless caps in the chat handler
 * (message length, turn count), per-visitor rate limits so one visitor
 * cannot drain the day's budget, a site-wide daily circuit breaker on both
 * message count and estimated spend, and the Anthropic Console spend cap,
 * which is the only one that still holds if the code has a bug.
 *
 * Fail-open by design: with KV_REST_API_URL/TOKEN unset, requests are
 * allowed through and the failure is logged. The exchange log it keeps is
 * the ground truth the eval's golden set grows from, and the site discloses
 * it: 30-day retention, stated on /privacy, which the widget's disclaimer
 * links to. The visitor field is a salted hash (CHAT_VISITOR_SALT), never an
 * address.
 *
 * Every notice below renders in the widget as an ordinary assistant message
 * when a limit trips, so it is shipped copy: it points people at the docs,
 * which answer most of what the chat does.
 */
import { createUpstashGuardrails } from "rift-ds/chat/upstash";

export const guardrails = createUpstashGuardrails({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
  salt: process.env.CHAT_VISITOR_SALT,
  dailyMessageCap: Number(process.env.CHAT_DAILY_MESSAGE_CAP ?? 300),
  dailySpendCapCents: Number(process.env.CHAT_DAILY_SPEND_CAP_CENTS ?? 500),
  stepdownFraction: Number(process.env.CHAT_MODEL_STEPDOWN_PCT ?? 50) / 100,
  lockFraction: Number(process.env.CHAT_MODEL_LOCK_PCT ?? 85) / 100,
  copy: {
    burst:
      "That is a lot of questions at once. Give it a minute and ask again; the docs at /docs cover most of it in the meantime.",
    daily:
      "You have reached the daily limit for this chat. It resets tomorrow. The docs answer most questions without it: start at /docs/get-started.",
    paused:
      "This chat has hit its budget for today and is paused until midnight UTC. " +
      "The site itself answers most of what people ask: the components live at " +
      "/components, install and theming at /docs/get-started, and how the system " +
      "is built at /overview.",
  },
});
