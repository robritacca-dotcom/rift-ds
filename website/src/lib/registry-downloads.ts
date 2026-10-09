/**
 * The shadcn registry's download tally.
 *
 * The registry under /r/ is static JSON fetched by a CLI, so no page script
 * runs and analytics never sees it; the host's request logs skip static files
 * too. This is the one place a fetch is counted: `src/proxy.ts` calls
 * `recordRegistryDownload` for each GET of a registry item.
 *
 * One Redis hash per UTC day, `registry:downloads:<date>`, with a field per
 * `<item>:<client>` pair. Nothing about the requester is stored: no address,
 * no hash of one, no full user agent, only which of five client families
 * asked. With no personal data in them the tallies carry no expiry, and
 * /privacy says so; the two change together.
 *
 * Fail-open and silent, like the chat guardrails: an unconfigured or
 * unreachable Redis loses a count and never touches the response.
 * `scripts/registry-downloads.mjs` is the reader.
 */
import { Redis } from "@upstash/redis";
import { componentMetadata } from "rift-ds/components/registry";

/** The families a user agent is reduced to before anything is stored. */
export type RegistryClient = "shadcn" | "node" | "bot" | "browser" | "other";

/**
 * The item names the registry serves: one per component, plus the shared
 * `base` item and the `registry` index. A request for anything else is a 404
 * and is not counted, which is also what bounds the hash: a caller cannot
 * mint fields by inventing paths.
 */
const ITEM_NAMES: ReadonlySet<string> = new Set([
  "base",
  "registry",
  ...componentMetadata.map((component) => component.slug),
]);

const ITEM_PATH = /^\/r\/([a-z0-9-]+)\.json$/;

/** The registry item a path names, or null when it names none. */
export function registryItem(pathname: string): string | null {
  const name = ITEM_PATH.exec(pathname)?.[1];
  return name && ITEM_NAMES.has(name) ? name : null;
}

const BOT = /bot|crawl|spider|slurp|preview|scan|monitor|fetcher|headless/i;
const NODE = /node|undici|axios|got\b|bun\/|deno\//i;

/**
 * Reduces a user agent to its family. Order matters: the CLI names itself and
 * wins outright, and crawlers are tested before browsers because most of them
 * also claim to be Mozilla.
 */
export function classifyClient(userAgent: string | null): RegistryClient {
  if (!userAgent) return "other";
  if (/shadcn/i.test(userAgent)) return "shadcn";
  if (BOT.test(userAgent)) return "bot";
  if (NODE.test(userAgent)) return "node";
  if (/mozilla/i.test(userAgent)) return "browser";
  return "other";
}

let cachedRedis: Redis | null | undefined;

function getRedis(): Redis | null {
  if (cachedRedis !== undefined) return cachedRedis;

  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  cachedRedis = url && token ? new Redis({ url, token }) : null;
  return cachedRedis;
}

/** UTC date, matching the chat counters' day boundary. */
const dayKey = () => new Date().toISOString().slice(0, 10);

export const REGISTRY_DOWNLOADS_PREFIX = "registry:downloads:";

/** Adds one to the day's tally for a registry item. Never throws. */
export async function recordRegistryDownload(
  pathname: string,
  userAgent: string | null
): Promise<void> {
  const item = registryItem(pathname);
  if (!item) return;

  const redis = getRedis();
  if (!redis) return;

  try {
    await redis.hincrby(
      `${REGISTRY_DOWNLOADS_PREFIX}${dayKey()}`,
      `${item}:${classifyClient(userAgent)}`,
      1
    );
  } catch (error) {
    console.error("[registry] recording a download failed:", error);
  }
}
