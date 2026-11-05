"use client";

/**
 * Sample trees for the template shell's entity switcher, one per shape the
 * data can take, picked with `?entities=` on a template URL (`deep`, the
 * default; `flat`; `single`; `off`). Fictional organisations only.
 */

import React from "react";
import { PublisherMark } from "./PublisherMarks/PublisherMarks";
import type { EntitySwitcherItem } from "rift-ds/components/EntitySwitcher/EntitySwitcher";

/** A flat list of ad accounts, each with a real publisher logo. */
const FLAT: EntitySwitcherItem[] = [
  { id: "acc-google", name: "Google Ads", description: "Search and display", icon: <PublisherMark id="google" /> },
  { id: "acc-meta", name: "Meta Ads", description: "Facebook and Instagram", icon: <PublisherMark id="meta" /> },
  { id: "acc-linkedin", name: "LinkedIn Ads", description: "B2B audiences", icon: <PublisherMark id="linkedin" /> },
  { id: "acc-x", name: "X Ads", description: "Promoted posts", icon: <PublisherMark id="x" /> },
];

/** One entity: the switcher still shows who you are, with nothing to switch to. */
const SINGLE: EntitySwitcherItem[] = [{ id: "boardline", name: "Boardline", description: "Team space" }];

/** Company → business unit → department, with advertisers under one of them. */
const DEEP: EntitySwitcherItem[] = [
  {
    id: "boardline",
    name: "Boardline",
    description: "Holding company",
    children: [
      {
        id: "bu-consumer",
        name: "Consumer",
        description: "Business unit · 4 teams",
        children: [
          {
            id: "dep-growth",
            name: "Growth marketing",
            description: "Department",
            children: [
              { id: "adv-northwind", name: "Northwind Outfitters", description: "Advertiser" },
              { id: "adv-larkspur", name: "Larkspur Coffee", description: "Advertiser" },
              { id: "adv-tidewater", name: "Tidewater Cycles", description: "Advertiser" },
            ],
          },
          { id: "dep-brand", name: "Brand", description: "Department" },
          { id: "dep-lifecycle", name: "Lifecycle", description: "Department" },
          { id: "dep-social", name: "Social", description: "Department" },
        ],
      },
      {
        id: "bu-enterprise",
        name: "Enterprise",
        description: "Business unit · 2 teams",
        children: [
          { id: "dep-demand", name: "Demand generation", description: "Department" },
          { id: "dep-events", name: "Field events", description: "Department" },
        ],
      },
      { id: "bu-labs", name: "Labs", description: "Business unit" },
    ],
  },
  { id: "halcyon", name: "Halcyon Studio", description: "Agency client" },
];

const SHAPES = { deep: DEEP, flat: FLAT, single: SINGLE } as const;
const DEFAULT_VALUE: Record<keyof typeof SHAPES, string> = {
  deep: "dep-growth",
  flat: "acc-google",
  single: "boardline",
};

const noSubscribe = () => () => {};

/** The sample the URL asks for, or none for `?entities=off`; the server render reads no URL, so it takes the default. */
export function useSampleEntities(): { items: EntitySwitcherItem[]; defaultValue: string } | undefined {
  const asked = React.useSyncExternalStore(
    noSubscribe,
    () => new URLSearchParams(window.location.search).get("entities"),
    () => null,
  );
  if (asked === "off") return undefined;
  const shape: keyof typeof SHAPES = asked && asked in SHAPES ? (asked as keyof typeof SHAPES) : "deep";
  return { items: SHAPES[shape], defaultValue: DEFAULT_VALUE[shape] };
}
