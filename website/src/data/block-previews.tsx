/**
 * Each block's own page, imported straight from the files the init bin
 * ships, so the preview on the site and the file a consumer gets are the
 * same file. Keyed by block name; scripts/validate-blocks.mjs holds the
 * keys to the registry in both directions.
 */

import type { ComponentType } from "react";
import AppShellBlock from "../../../src/cli/templates/blocks/app/starter/page";
import DashboardBlock from "../../../src/cli/templates/blocks/app/dashboard/page";
import SignInBlock from "../../../src/cli/templates/blocks/app/sign-in/page";

export const BLOCK_PREVIEWS: Record<string, ComponentType> = {
  "app-shell": AppShellBlock,
  dashboard: DashboardBlock,
  "sign-in": SignInBlock,
};
