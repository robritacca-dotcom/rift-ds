import type { ArchMap } from "@/components/ArchitectureMap/types";

/**
 * A hex code traced from the one file allowed to hold it to the build a
 * stray one stops. The accent edges are the one path the page makes a point
 * about: a hex typed into component CSS fails CI before anything ships.
 */
export const hexCodeMap: ArchMap = {
  id: "hex-code-end-to-end",
  title: "A hex code, end to end",
  label:
    "A hex code may live only in the primitives file. The token references validator holds the semantic tier to var() references and the raw values validator holds component CSS to tokens. Both run in the validate-registry chain before verify and the CI library and Storybook builds, and a stray hex fails the build with the file, the line and the fix.",
  width: 1900,
  height: 1000,
  nodes: [
    /* 1 · In the repo */
    { id: "z-repo", x: 60, y: 120, w: 420, h: 820, kind: "zone", title: "1 · In the repo", sub: "where a hex may and may not go" },
    { id: "primitives", x: 95, y: 200, w: 350, h: 76, title: "Primitives", sub: "tokens-primitives.css · the hex lives here", icon: "palette", chip: "positive" },
    { id: "semantic", x: 95, y: 330, w: 350, h: 76, title: "Semantic tokens", sub: "tokens-light.css · tokens-dark.css · var() only", icon: "sell", chip: "info" },
    { id: "component", x: 95, y: 460, w: 350, h: 76, title: "Component CSS", sub: "src/components/ · src/chat/ · tokens only", icon: "css", chip: "info" },
    { id: "allow", x: 95, y: 590, w: 350, h: 76, title: "ds-allow(color)", sub: "a deliberate exception, with its reason", icon: "flag" },

    /* 2 · The chain */
    { id: "z-chain", x: 560, y: 120, w: 400, h: 820, kind: "zone", title: "2 · The chain", sub: "scripts/chain.mjs" },
    { id: "refs", x: 595, y: 330, w: 330, h: 76, title: "Token references", sub: "scripts/validate-token-references.mjs", icon: "rule", chip: "warning" },
    { id: "raw", x: 595, y: 460, w: 330, h: 76, title: "Raw values", sub: "scripts/validate-raw-values.mjs", icon: "rule", chip: "warning" },
    { id: "registry", x: 595, y: 620, w: 330, h: 76, title: "validate-registry", sub: "prebuild · prestorybook · prebuild-storybook", icon: "account_tree" },
    { id: "web", x: 595, y: 780, w: 330, h: 76, title: "Website prebuild", sub: "the site-marked steps · leaves both out", icon: "web" },

    /* 3 · What runs the chain */
    { id: "z-run", x: 1040, y: 120, w: 400, h: 820, kind: "zone", title: "3 · What runs the chain", sub: "every build starts here" },
    { id: "verify", x: 1075, y: 460, w: 330, h: 76, title: "npm run verify", sub: "the local mirror of CI", icon: "fact_check" },
    { id: "ci-lib", x: 1075, y: 620, w: 330, h: 76, title: "CI library job", sub: "npm run build", logo: "/logos/Git.svg" },
    { id: "ci-sb", x: 1075, y: 750, w: 330, h: 76, title: "CI Storybook job", sub: "npm run build-storybook", logo: "/logos/storybook.svg" },

    /* 4 · The result */
    { id: "z-result", x: 1520, y: 120, w: 340, h: 820, kind: "zone", title: "4 · The result", sub: "printed by the script" },
    { id: "pass", x: 1550, y: 460, w: 280, h: 76, title: "Pass", sub: "one ✓ line with the count checked", icon: "check_circle", chip: "positive" },
    { id: "fail", x: 1550, y: 620, w: 280, h: 76, title: "Fail", sub: "file:line · the value · the fix", icon: "error", chip: "warning" },
    { id: "stops", x: 1550, y: 750, w: 280, h: 76, title: "Build stops", sub: "nothing ships", icon: "block" },
  ],
  edges: [
    { id: "primitives-semantic", from: "primitives", to: "semantic", label: "var()" },
    { id: "semantic-refs", from: "semantic", to: "refs" },
    { id: "component-raw", from: "component", to: "raw", label: "a hex here", kind: "accent" },
    { id: "allow-raw", from: "allow", to: "raw", bend: 30 },
    { id: "raw-registry", from: "raw", to: "registry", kind: "accent" },
    { id: "refs-raw", from: "refs", to: "raw" },
    { id: "registry-verify", from: "registry", to: "verify" },
    { id: "registry-ci-lib", from: "registry", to: "ci-lib", kind: "accent" },
    { id: "registry-ci-sb", from: "registry", to: "ci-sb" },
    { id: "verify-pass", from: "verify", to: "pass" },
    { id: "ci-lib-fail", from: "ci-lib", to: "fail", label: "a hex fails it", kind: "accent" },
    { id: "fail-stops", from: "fail", to: "stops" },
  ],
};
