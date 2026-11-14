import { NextResponse } from "next/server";

import { REPOSITORY_URL } from "@/config/brand.generated";

// The repository path (owner/name), derived from the repository URL so a
// moved repo cannot leave the header counting someone else's stars.
const REPO_PATH = new URL(REPOSITORY_URL).pathname.replace(/^\/+|\/+$/g, "");
const REPO_API = `https://api.github.com/repos/${REPO_PATH}`;

/**
 * Proxies the public GitHub repository API so the star count is cached
 * server-side. The site's CSP does not let the browser call api.github.com,
 * so the header reads this same-origin route instead.
 */
export async function GET() {
  try {
    const response = await fetch(REPO_API, {
      headers: { Accept: "application/vnd.github+json" },
      next: { revalidate: 3600 }, // refresh every hour
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch stars" }, { status: 502 });
    }

    const data: unknown = await response.json();
    const stars = (data as { stargazers_count?: unknown } | null)?.stargazers_count;
    if (typeof stars !== "number") {
      return NextResponse.json({ error: "Unexpected upstream response" }, { status: 502 });
    }

    return NextResponse.json({ stars });
  } catch {
    return NextResponse.json({ error: "Failed to fetch stars" }, { status: 502 });
  }
}
