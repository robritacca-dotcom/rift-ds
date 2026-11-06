"use client";

/**
 * Sample trees for the template shell's entity switcher, one per shape the
 * data can take, picked with `?entities=` on a template URL (`deep`, the
 * default; `flat`; `single`; `off`). Two samples: the marketing dashboard's
 * workspaces and Larkspur's stores, for the merchant sales screen. Fictional
 * organisations only.
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

/** Larkspur's storefronts side by side, each on its own avatar fill: every one of them reads the same ledger. */
const STORES_FLAT: EntitySwitcherItem[] = [
  { id: "store-wholesale", name: "Larkspur Wholesale", description: "Trade accounts", fill: 1 },
  { id: "store-retail", name: "Larkspur Retail", description: "Online shop", fill: 3 },
  { id: "store-marketplace", name: "Larkspur on marketplaces", description: "Third-party listings", fill: 5 },
];

/** One store: the switcher still shows whose books these are. */
const STORES_SINGLE: EntitySwitcherItem[] = [{ id: "larkspur", name: "Larkspur", description: "Merchant", fill: 2 }];

/** Group → brand → region store. */
const STORES_DEEP: EntitySwitcherItem[] = [
  {
    id: "larkspur",
    name: "Larkspur",
    description: "Merchant group",
    fill: 2,
    children: [
      {
        id: "brand-wholesale",
        name: "Larkspur Wholesale",
        description: "Brand · 3 stores",
        fill: 1,
        children: [
          { id: "store-na", name: "North America", description: "Store", fill: 4 },
          { id: "store-eu", name: "Europe", description: "Store", fill: 6 },
          { id: "store-apac", name: "Asia Pacific", description: "Store", fill: 5 },
        ],
      },
      { id: "brand-retail", name: "Larkspur Retail", description: "Brand", fill: 3 },
      { id: "brand-trade", name: "Larkspur Trade", description: "Brand", fill: 4 },
    ],
  },
  { id: "tidewater", name: "Tidewater Supply", description: "Managed merchant", fill: 6 },
];

const SAMPLES = {
  workspace: {
    shapes: { deep: DEEP, flat: FLAT, single: SINGLE },
    defaults: { deep: "dep-growth", flat: "acc-google", single: "boardline" },
  },
  merchant: {
    shapes: { deep: STORES_DEEP, flat: STORES_FLAT, single: STORES_SINGLE },
    defaults: { deep: "brand-wholesale", flat: "store-wholesale", single: "larkspur" },
  },
} as const;
type Shape = keyof (typeof SAMPLES)["workspace"]["shapes"];

const noSubscribe = () => () => {};

/** The sample the URL asks for, or none for `?entities=off`; the server render reads no URL, so it takes the default. */
export function useSampleEntities(sample: keyof typeof SAMPLES = "workspace"): { items: EntitySwitcherItem[]; defaultValue: string } | undefined {
  const asked = React.useSyncExternalStore(
    noSubscribe,
    () => new URLSearchParams(window.location.search).get("entities"),
    () => null,
  );
  if (asked === "off") return undefined;
  const { shapes, defaults } = SAMPLES[sample];
  const shape: Shape = asked && asked in shapes ? (asked as Shape) : "deep";
  return { items: shapes[shape], defaultValue: defaults[shape] };
}
