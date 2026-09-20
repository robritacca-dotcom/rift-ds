import { NextResponse } from "next/server";

const GITHUB_USERNAME = "robritacca-dotcom";
const CONTRIBUTIONS_API = `https://github-contributions-api.jogruber.de/v4/${GITHUB_USERNAME}?y=last`;

interface ContributionsResponse {
  total: { lastYear: number };
  contributions: { date: string; count: number; level: 0 | 1 | 2 | 3 | 4 }[];
}

/** Runtime shape check: the upstream is a third party, so its JSON is
    validated rather than trusted before any field is read. */
function isContributions(value: unknown): value is ContributionsResponse {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  const total = record.total as Record<string, unknown> | null | undefined;
  return typeof total?.lastYear === "number" && Array.isArray(record.contributions);
}

/**
 * Proxies the public GitHub contributions API so the data is cached
 * server-side and the third-party dependency stays out of the client.
 */
export async function GET() {
  try {
    const response = await fetch(CONTRIBUTIONS_API, {
      next: { revalidate: 21600 }, // refresh every 6 hours
      signal: AbortSignal.timeout(5000), // don't hang on a slow upstream
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch contributions" },
        { status: 502 }
      );
    }

    const data: unknown = await response.json();
    if (!isContributions(data)) {
      return NextResponse.json(
        { error: "Unexpected upstream response" },
        { status: 502 }
      );
    }

    return NextResponse.json({
      total: data.total.lastYear,
      days: data.contributions,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch contributions" },
      { status: 502 }
    );
  }
}
