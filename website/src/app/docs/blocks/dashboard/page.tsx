/**
 * The dashboard block, rendered full screen from the file the init bin ships.
 * Chromeless (see CHROMELESS_ROUTES in src/config/chromeless.ts), so the
 * block is the whole page, as it is in the app it lands in.
 */

import { HiddenBackground } from "@/components/BlurBackground/BlurBackground";
import { BLOCK_PREVIEWS } from "@/data/block-previews";
import s from "../preview.module.css";

const Block = BLOCK_PREVIEWS["dashboard"];

export default function BlockPreviewPage() {
  return (
    <>
      <HiddenBackground />
      <div className={s.stage}>
        <Block />
      </div>
    </>
  );
}
