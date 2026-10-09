/**
 * Counts fetches of the shadcn registry's items, and does nothing else.
 *
 * The matcher is one path segment under /r/, so it covers the item JSON and
 * the index and skips the font binaries under /r/assets/. The request always
 * continues to the static file untouched: the count rides on `waitUntil`, so
 * it can neither delay the response nor fail it. What is stored, and what
 * deliberately is not, is `lib/registry-downloads.ts`'s to state.
 */
import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";
import { recordRegistryDownload } from "./lib/registry-downloads";

export function proxy(request: NextRequest, event: NextFetchEvent) {
  if (request.method === "GET") {
    event.waitUntil(
      recordRegistryDownload(request.nextUrl.pathname, request.headers.get("user-agent"))
    );
  }
  return NextResponse.next();
}

export const config = {
  matcher: "/r/:item",
};
