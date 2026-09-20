"use client";

import { useEffect, useState } from "react";
import {
  ContributionGraph,
  type ContributionDay,
} from "@robr0/design-system/components/ContributionGraph/ContributionGraph";
import { Skeleton } from "@robr0/design-system/components/Skeleton/Skeleton";

interface ContributionsData {
  total: number;
  days: ContributionDay[];
}

/**
 * Fetches real GitHub contribution data (cached server-side via
 * /api/github-contributions) and renders it as a ContributionGraph.
 */
export default function GitHubContributions() {
  const [data, setData] = useState<ContributionsData | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/github-contributions")
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((json: ContributionsData) => {
        if (!cancelled) setData(json);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (failed) return null;

  if (!data) {
    return <Skeleton variant="rectangular" width="100%" height="140px" />;
  }

  return (
    <ContributionGraph
      bare
      days={data.days}
      caption={`${data.total} contributions in the last year`}
    />
  );
}
