import type { MetadataRoute } from "next";
import { execFileSync } from "node:child_process";
import path from "node:path";
import {
  componentsSidebarLinks,
  docsSidebarLinks,
  foundationsSidebarLinks,
  templatesSidebarLinks,
} from "@/config/navigation";
import { SITE_URL } from "@/lib/structuredData";

const baseUrl = SITE_URL;
const appDir = path.join(process.cwd(), "src", "app");

// Fallback when git history is unavailable. Evaluated once at module load —
// build time for the statically-generated sitemap.
const BUILD_DATE = new Date();

type ChangeFrequency = MetadataRoute.Sitemap[number]["changeFrequency"];

/**
 * Last commit time for a source file, memoized. Real per-file dates give
 * crawlers an honest freshness signal instead of a build-time "changed today"
 * on every URL. Falls back to the build date when git or history is missing
 * (e.g. Vercel's default shallow clone yields the HEAD date for every file, and
 * there is no git at runtime) — degraded but stable, never worse than before.
 */
const gitCache = new Map<string, Date>();
function lastCommit(file: string): Date {
  const cached = gitCache.get(file);
  if (cached) return cached;
  let when = BUILD_DATE;
  try {
    const iso = execFileSync(
      "git",
      ["log", "-1", "--format=%cI", "--", file],
      { cwd: appDir, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }
    ).trim();
    if (iso) when = new Date(iso);
  } catch {
    /* no git / no history — keep BUILD_DATE */
  }
  gitCache.set(file, when);
  return when;
}

/** Every route maps to its `src/app/<route>/page.tsx` source file. */
function fileForRoute(route: string): string {
  const rel = route === "" ? "page.tsx" : `${route.replace(/^\//, "")}/page.tsx`;
  return path.join(appDir, rel);
}

function changeFrequency(route: string): ChangeFrequency {
  if (route === "") return "monthly";
  if (route === "/releases" || route === "/loops") return "weekly";
  return "monthly";
}

function priority(route: string): number {
  if (route === "") return 1;
  return route.split("/").length === 2 ? 0.8 : 0.6;
}

export default function sitemap(): MetadataRoute.Sitemap {
  // Section clusters derive from the shared sidebar configs in navigation.ts —
  // the single source of truth for these routes — so the sitemap can't drift
  // when a page is added there.
  const staticRoutes = [
    "",
    "/privacy",
    "/playground",
    "/themes",
    "/graph",
    ...docsSidebarLinks.map((l) => l.href),
    ...foundationsSidebarLinks.map((l) => l.href),
    ...templatesSidebarLinks.map((l) => l.href),
    ...componentsSidebarLinks.map((l) => l.href),
  ];

  return staticRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: lastCommit(fileForRoute(route)),
    changeFrequency: changeFrequency(route),
    priority: priority(route),
  }));
}
