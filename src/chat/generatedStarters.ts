'use client';

/**
 * Welcome chips a model writes for whatever the reader put in front of the
 * chat, from `createStartersHandler` on the server (rift-ds/chat/server).
 *
 * The host builds the request: a string that says what is in focus (it rides
 * to the server as `{ context }` and is checked there, never trusted). The hook
 * asks once the reader's selection settles (`MOTION_SELECTION_SETTLE_MS`), so a
 * drag across text asks once; a newer request cancels the older ask; an answer
 * is kept per endpoint and request for the page's life, so pointing back at
 * something shows its chips at once and asks nothing twice. It asks only while
 * `active` (a host passes "the welcome screen is showing"). Meanwhile `pending`
 * holds the widget's shimmer (ChatWidget's `startersPending`), and `fallback`
 * stands in when nothing comes back: switched off, over budget, or nothing fit.
 */

import { useEffect, useRef, useState } from 'react';
import { MOTION_SELECTION_SETTLE_MS } from '../tokens/motion';
import type { Starter } from './types';

export interface GeneratedStartersOptions {
  /** The route `createStartersHandler` serves. */
  endpoint: string;
  /** Ask only while this is true: the welcome screen is showing. */
  active: boolean;
  /** The written chips for when nothing comes back, and while the model writes. */
  fallback: Starter[];
}

export interface GeneratedStarters {
  /** The chips to show: the model's once written, the fallback until then. Null with no request. */
  starters: Starter[] | null;
  /** Whether the model is still writing them: ChatWidget's `startersPending`. */
  pending: boolean;
  /** A short, stable key for the request: ChatWidget's `startersKey`. */
  key: string | null;
}

const written = new Map<string, Starter[]>();

/* A short, stable key for a request, for the widget's reveal memory. */
function hashOf(text: string) {
  let hash = 0;
  for (let index = 0; index < text.length; index += 1) hash = (hash * 31 + text.charCodeAt(index)) | 0;
  return (hash >>> 0).toString(36);
}

/** The model's starters for `request`, or null for none (the host shows its own). */
export function useGeneratedStarters(request: string | null, { endpoint, active, fallback }: GeneratedStartersOptions): GeneratedStarters {
  const cacheKey = request === null ? null : `${endpoint}\n${request}`;
  const [settled, setSettled] = useState<{ cacheKey: string; starters: Starter[] } | null>(null);
  /* Read once the answer lands, so a new array each render never asks again. */
  const fallbackRef = useRef(fallback);
  useEffect(() => {
    fallbackRef.current = fallback;
  });

  useEffect(() => {
    if (!active || cacheKey === null || written.has(cacheKey)) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      let suggestions: string[] = [];
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ context: request }),
          signal: controller.signal,
        });
        suggestions = response.ok ? (((await response.json()) as { suggestions?: string[] }).suggestions ?? []) : [];
      } catch {
        if (controller.signal.aborted) return;
      }
      const starters = suggestions.length ? suggestions.map((label, index) => ({ id: `generated-${index}`, label })) : fallbackRef.current;
      written.set(cacheKey, starters);
      setSettled({ cacheKey, starters });
    }, MOTION_SELECTION_SETTLE_MS);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [active, cacheKey, endpoint, request]);

  if (cacheKey === null) return { starters: null, pending: false, key: null };
  const starters = written.get(cacheKey) ?? (settled?.cacheKey === cacheKey ? settled.starters : null);
  return { starters: starters ?? fallback, pending: active && !starters, key: `generated-${hashOf(cacheKey)}` };
}
