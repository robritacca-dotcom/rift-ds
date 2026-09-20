import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // The design system deprecated `priority` in favour of `variant`
      // (string-valued JSX priority props are always the DS spelling;
      // next/image's own `priority` is a bare boolean and never matches).
      "no-restricted-syntax": [
        "error",
        {
          selector: 'JSXAttribute[name.name="priority"][value.type="Literal"]',
          message:
            "The design system's `priority` prop is deprecated — use `variant`.",
        },
      ],
    },
  },
]);

export default eslintConfig;
