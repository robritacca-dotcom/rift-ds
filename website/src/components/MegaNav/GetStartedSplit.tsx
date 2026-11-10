"use client";

import { useRouter } from "next/navigation";
import { SplitButton } from "rift-ds/components/SplitButton/SplitButton";
import { ToastProvider, useToast } from "rift-ds/components/Toast/Toast";
import { SITE_EVENTS, trackEvent } from "@/lib/analytics";
import { FIGMA_URL, NPM_URL, REPOSITORY_URL } from "@/config/brand.generated";
import { SHOW_FIGMA_LINKS } from "@/config/social";
import { FigmaIcon, GitHubIcon, NpmIcon } from "@/components/BrandIcons/BrandIcons";
import styles from "./GetStartedSplit.module.css";

/** The agent starter, served from website/public. */
const AGENTS_MD_URL = "/AGENTS.md";

/** Opens an off-site home of the system in a new tab. */
const openExternal = (url: string) => () => window.open(url, "_blank", "noopener,noreferrer");

/**
 * The header's primary action: Get started opens the setup guide, and the
 * menu copies the agent starter for a coding agent, then links to where
 * the system lives off-site: the npm package, the repo and, while the
 * site links to Figma, the Figma kit. Without a clipboard
 * (or on a failed fetch) the file opens in a new tab instead. A copy
 * confirms itself with a toast; the stack portals to the body and sits
 * bottom-centre, clear of the chat launcher in the corner.
 */
type GetStartedSplitProps = {
  /** Runs before Get started navigates, so the drawer's copy can close it. */
  onNavigate?: () => void;
};

export default function GetStartedSplit(props: GetStartedSplitProps) {
  return (
    <ToastProvider position="bottom-center">
      <GetStartedSplitButton {...props} />
    </ToastProvider>
  );
}

function GetStartedSplitButton({ onNavigate }: GetStartedSplitProps) {
  const router = useRouter();
  const { toast } = useToast();

  const copyAgentsMd = async () => {
    try {
      const response = await fetch(AGENTS_MD_URL);
      if (!response.ok) throw new Error(`fetch failed: ${response.status}`);
      await navigator.clipboard.writeText(await response.text());
      trackEvent(SITE_EVENTS.copyAgentStarter, { surface: "header", delivery: "copy" });
      toast({
        variant: "positive",
        title: "AGENTS.md copied",
        description: "Paste it into your coding agent to set up rift-ds.",
      });
    } catch {
      window.open(AGENTS_MD_URL, "_blank", "noopener");
    }
  };

  return (
    <SplitButton
      label="Get started"
      variant="primary"
      size="compact"
      align="end"
      menuLabel="More ways to start"
      onClick={() => {
        // The drawer's copy closes its menu on the way out.
        onNavigate?.();
        router.push("/docs/get-started");
      }}
      items={[
        { label: "Copy AGENTS.md", icon: "content_copy", onClick: copyAgentsMd },
        { type: "separator" },
        { label: "npm package", iconRight: "open_in_new", icon: <span className={styles.mark} aria-hidden="true"><NpmIcon /></span>, onClick: openExternal(NPM_URL) },
        { label: "GitHub repo", iconRight: "open_in_new", icon: <span className={styles.mark} aria-hidden="true"><GitHubIcon /></span>, onClick: openExternal(REPOSITORY_URL) },
        ...(SHOW_FIGMA_LINKS
          ? [{ label: "Figma kit", iconRight: "open_in_new", icon: <span className={styles.mark} aria-hidden="true"><FigmaIcon /></span>, onClick: openExternal(FIGMA_URL) }]
          : []),
      ]}
    />
  );
}
