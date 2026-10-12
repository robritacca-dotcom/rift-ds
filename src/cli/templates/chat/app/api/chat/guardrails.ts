import { createUpstashGuardrails } from 'rift-ds/chat/upstash';

/**
 * Rate limits, a daily budget with model tiers, the exchange log and the
 * feedback store, over Upstash Redis. Shared by the three chat routes.
 *
 * Fails open: with KV_REST_API_URL and KV_REST_API_TOKEN unset, every
 * request is allowed and nothing is logged, so the chat works on day one
 * and the limits arrive when you add the two variables. Set CHAT_VISITOR_SALT
 * too: it salts the hashed visitor address the limits key on.
 */
export const guardrails = createUpstashGuardrails({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
  salt: process.env.CHAT_VISITOR_SALT,
  dailyMessageCap: Number(process.env.CHAT_DAILY_MESSAGE_CAP ?? 300),
  dailySpendCapCents: Number(process.env.CHAT_DAILY_SPEND_CAP_CENTS ?? 500),
});
