/**
 * Body scroll lock with named owners, over the library's shared counter.
 *
 * The implementation — and the iOS Safari reasoning for pinning the body
 * `position: fixed` rather than merely hiding its overflow — lives in the
 * library's `useScrollLock` module, imported here through its published
 * subpath. Sharing that counter is the point: the library's modals (Dialog,
 * AlertDialog, Drawer) hold the same lock, so closing the nav drawer or the
 * chat panel under an open Dialog releases only this site's hold, and the
 * body unlocks when the last holder anywhere lets go. Two counters that
 * could not see each other used to unlock the page under whichever overlay
 * closed last.
 *
 * This wrapper adds the owner keys the site chrome needs: several overlays
 * can be open at once (the chat panel and MegaNav's mobile drawer), callers
 * release on cleanup whether or not they locked, and locking a held key
 * again is a no-op — each key maps to at most one hold on the counter.
 */
import {
  acquireScrollLock,
  releaseScrollLock,
} from "@robr0/design-system/behaviors/useScrollLock";

const owners = new Set<string>();

export function lockBodyScroll(owner: string) {
  if (owners.has(owner)) return;
  owners.add(owner);
  acquireScrollLock();
}

export function unlockBodyScroll(owner: string) {
  if (!owners.delete(owner)) return;
  releaseScrollLock();
}
