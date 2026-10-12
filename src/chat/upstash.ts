/**
 * rift-ds/chat/upstash: the handlers' guardrails over Upstash Redis.
 *
 * Four layers, outermost last: the stateless caps in the chat handler
 * (message length, turn count), per-visitor rate limits so one visitor
 * cannot drain the day's budget, a site-wide daily circuit breaker on both
 * message count and estimated spend, and whatever spend cap the model
 * provider's console holds, which is the only layer that still stands if
 * this file has a bug.
 *
 * Fail-open by design. If Redis is unreachable or unconfigured, requests
 * are allowed through and the failure is logged: a guardrail outage should
 * not take the chat down, and the provider's cap still bounds the damage.
 * Every rejection returns copy for a `notice` event, which the widget
 * renders as an ordinary assistant message.
 *
 * Needs the optional peers `@upstash/ratelimit` and `@upstash/redis`.
 */
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import type {
  ChatGuardrails,
  ExchangeLog,
  GuardrailVerdict,
  ModelTier,
  TokenUsage,
} from './server';
import type { ChatFeedbackVerdict } from './types';

/** List prices in USD per million tokens for one model id. */
export interface PriceRow {
  input: number;
  output: number;
  /** Cache writes; 2x input for a 1-hour cache TTL, 1.25x for the default. */
  cacheWrite: number;
  cacheRead: number;
}

/**
 * The built-in price table, keyed by model id. Over-estimating trips the
 * breaker early, which is the safe direction to be wrong in; real billing
 * comes from the provider's console. An unknown id prices at `fallbackPrice`.
 */
export const DEFAULT_PRICES: Record<string, PriceRow> = {
  'claude-sonnet-5': { input: 3.0, output: 15.0, cacheWrite: 6.0, cacheRead: 0.3 },
  'claude-haiku-5-5': { input: 0.5, output: 2.5, cacheWrite: 1.0, cacheRead: 0.05 },
};

export interface UpstashGuardrailsCopy {
  /** Too many messages in a minute. */
  burst: string;
  /** The per-visitor daily limit. */
  daily: string;
  /** The site-wide breaker. */
  paused: string;
}

export const DEFAULT_GUARDRAILS_COPY: UpstashGuardrailsCopy = {
  burst: 'That is a lot of questions at once. Give it a minute and ask again.',
  daily: 'You have reached the daily limit for this chat. It resets tomorrow.',
  paused: 'This chat has hit its budget for today and is paused until midnight UTC.',
};

export interface UpstashGuardrailsOptions {
  /** The Upstash REST URL. Missing means every check fails open. */
  url?: string;
  /** The Upstash REST token. */
  token?: string;
  /** Salts the hashed visitor address. Set it: an unsalted hash over the IPv4 space is reversible. */
  salt?: string;
  /** Redis key prefix, so several chats can share one database. */
  prefix?: string;
  /** Messages per visitor per minute. */
  perMinute?: number;
  /** Messages per visitor per day. */
  perDay?: number;
  /** Follow-up requests per visitor per minute. */
  followupsPerMinute?: number;
  /** Feedback posts per visitor per minute. */
  feedbackPerMinute?: number;
  /** The site-wide daily message cap. */
  dailyMessageCap?: number;
  /** The site-wide daily spend cap, in US cents. */
  dailySpendCapCents?: number;
  /** Past this fraction of the spend cap the default model steps down. */
  stepdownFraction?: number;
  /** Past this fraction only the budget model serves. */
  lockFraction?: number;
  /** Price rows by model id, merged over the built-in table. */
  prices?: Record<string, PriceRow>;
  /** The row an unknown model id prices at. Defaults to the dearest built-in row. */
  fallbackPrice?: PriceRow;
  /** How long an exchange log line lives, in seconds. */
  logTtlSeconds?: number;
  copy?: Partial<UpstashGuardrailsCopy>;
}

const dayKey = () => new Date().toISOString().slice(0, 10);
const COUNTER_TTL_SECONDS = 60 * 60 * 48;

async function sha256Hex(text: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Guardrails over Upstash Redis: per-visitor rate limits, a daily breaker
 * with model tiers, the exchange log (30 days by default) and the feedback
 * store. Pass the result as `guardrails` to all three handlers.
 */
export function createUpstashGuardrails(options: UpstashGuardrailsOptions = {}): ChatGuardrails {
  const prefix = options.prefix ?? 'chat';
  const perMinute = options.perMinute ?? 10;
  const perDay = options.perDay ?? 60;
  const followupsPerMinute = options.followupsPerMinute ?? 15;
  const feedbackPerMinute = options.feedbackPerMinute ?? 30;
  const dailyMessageCap = options.dailyMessageCap ?? 300;
  const dailySpendCapTenths = (options.dailySpendCapCents ?? 500) * 10;
  const stepdownFraction = options.stepdownFraction ?? 0.5;
  const lockFraction = options.lockFraction ?? 0.85;
  const prices = { ...DEFAULT_PRICES, ...options.prices };
  const fallbackPrice = options.fallbackPrice ?? DEFAULT_PRICES['claude-sonnet-5'];
  const logTtl = options.logTtlSeconds ?? 60 * 60 * 24 * 30;
  const copy = { ...DEFAULT_GUARDRAILS_COPY, ...options.copy };
  const salt = options.salt ?? '';

  let warned = false;
  const redis: Redis | null =
    options.url && options.token ? new Redis({ url: options.url, token: options.token }) : null;
  const getRedis = () => {
    if (!redis && !warned) {
      warned = true;
      console.warn('[chat] Upstash url/token unset: rate limits and the daily breaker are inactive.');
    }
    return redis;
  };

  const limiter = (instance: Redis, name: string, limit: number, window: '60 s' | '24 h') =>
    new Ratelimit({
      redis: instance,
      limiter: Ratelimit.slidingWindow(limit, window),
      prefix: `${prefix}:rl:${name}`,
      analytics: false,
    });

  const messagesKey = () => `${prefix}:day:${dayKey()}:messages`;
  const spendKey = () => `${prefix}:day:${dayKey()}:tenths-cents`;
  const logKey = () => `${prefix}:log:${dayKey()}`;
  const feedbackKey = (id: string) => `${prefix}:feedback:${id}`;

  /* A stable per-visitor key. The address is hashed (salted) before it
     becomes a Redis key, so no raw address is stored. */
  const visitorKey = async (request: Request): Promise<string> => {
    const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
    const ip = forwarded || request.headers.get('x-real-ip')?.trim() || 'local';
    return (await sha256Hex(salt + ip)).slice(0, 32);
  };

  const ALLOWED: GuardrailVerdict = { allowed: true, tier: 'open' };

  const check = async (request: Request): Promise<GuardrailVerdict> => {
    const instance = getRedis();
    if (!instance) return ALLOWED;
    try {
      const visitor = await visitorKey(request);
      const [burst, daily] = await Promise.all([
        limiter(instance, 'burst', perMinute, '60 s').limit(visitor),
        limiter(instance, 'day', perDay, '24 h').limit(visitor),
      ]);
      if (!burst.success) return { allowed: false, notice: copy.burst };
      if (!daily.success) return { allowed: false, notice: copy.daily };

      const [messages, spendTenths] = await Promise.all([
        instance.get<number>(messagesKey()),
        instance.get<number>(spendKey()),
      ]);
      if ((messages ?? 0) >= dailyMessageCap || (spendTenths ?? 0) >= dailySpendCapTenths) {
        return { allowed: false, notice: copy.paused };
      }

      // Counted before the call, so a request that dies mid-stream still
      // counts against the cap. Under-counting is what lets a retry loop run.
      const count = await instance.incr(messagesKey());
      if (count === 1) await instance.expire(messagesKey(), COUNTER_TTL_SECONDS);

      const spentFraction = (spendTenths ?? 0) / dailySpendCapTenths;
      const tier: ModelTier =
        spentFraction >= lockFraction ? 'locked' : spentFraction >= stepdownFraction ? 'reduced' : 'open';
      return { allowed: true, tier };
    } catch (error) {
      console.error('[chat] guardrail check failed, allowing the request:', error);
      return ALLOWED;
    }
  };

  const onUsage = async (usage: TokenUsage, modelId: string): Promise<void> => {
    const instance = getRedis();
    if (!instance) return;
    const price = prices[modelId] ?? fallbackPrice;
    const usd =
      ((usage.input_tokens ?? 0) * price.input +
        (usage.output_tokens ?? 0) * price.output +
        (usage.cache_creation_input_tokens ?? 0) * price.cacheWrite +
        (usage.cache_read_input_tokens ?? 0) * price.cacheRead) /
      1_000_000;
    // Integer tenths of a cent: INCRBY is integer-only, and rounding up means
    // the breaker can never drift low across a busy day.
    const tenths = Math.ceil(usd * 1000);
    if (tenths <= 0) return;
    try {
      const total = await instance.incrby(spendKey(), tenths);
      if (total === tenths) await instance.expire(spendKey(), COUNTER_TTL_SECONDS);
    } catch (error) {
      console.error('[chat] recording spend failed:', error);
    }
  };

  const onExchange = async (entry: ExchangeLog): Promise<void> => {
    const instance = getRedis();
    if (!instance) return;
    try {
      const line = JSON.stringify({ at: new Date().toISOString(), ...entry });
      const length = await instance.rpush(logKey(), line);
      // The whole day's list expires together, after its first line.
      if (length === 1) await instance.expire(logKey(), logTtl);
    } catch (error) {
      console.error('[chat] recording exchange failed:', error);
    }
  };

  const perVisitorLimit = (name: string, limit: number) => async (request: Request) => {
    const instance = getRedis();
    if (!instance) return true;
    try {
      const { success } = await limiter(instance, name, limit, '60 s').limit(await visitorKey(request));
      return success;
    } catch (error) {
      console.error(`[chat] ${name} limit check failed, allowing:`, error);
      return true;
    }
  };

  const onFeedback = async (id: string, verdict: ChatFeedbackVerdict, visitor: string): Promise<void> => {
    const instance = getRedis();
    if (!instance) return;
    try {
      await instance.set(feedbackKey(id), JSON.stringify({ at: new Date().toISOString(), verdict, visitor }), {
        ex: logTtl,
      });
    } catch (error) {
      console.error('[chat] recording feedback failed:', error);
    }
  };

  return {
    check,
    visitorKey,
    onUsage,
    onExchange,
    checkFollowups: perVisitorLimit('followups', followupsPerMinute),
    checkFeedback: perVisitorLimit('feedback', feedbackPerMinute),
    onFeedback,
  };
}
