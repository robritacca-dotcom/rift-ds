/**
 * The blocks: whole starting pages the init bin copies into an app,
 * registered beside their files in src/cli/templates/blocks/registry.json,
 * the one home of the list. /docs/blocks maps over it, and each block's
 * preview route renders the block's own source (see block-previews.tsx).
 */

import registry from "../../../src/cli/templates/blocks/registry.json";

/** One block, as the registry records it. */
export interface BlockMeta {
  name: string;
  label: string;
  description: string;
  /** Where the block's page lands in the consumer's app. */
  route: string;
  /** Every file the block writes, at its target path. */
  files: string[];
}

export const blocks: BlockMeta[] = registry.blocks;

export const BLOCK_COUNT = blocks.length;

/** Where the site renders a block full screen. */
export const blockPreviewPath = (name: string) => `/docs/blocks/${name}`;
