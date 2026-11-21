import { createContext, useContext } from "react";

/**
 * True inside SiteFrame. The header reads it to offer its layout switcher
 * only on a page the frame lays out, where a pick changes something.
 */
export const SiteFrameContext = createContext(false);

export const useInSiteFrame = () => useContext(SiteFrameContext);
