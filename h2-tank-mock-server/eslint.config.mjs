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
  // Project-specific rules
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    rules: {
      // FILE SIZE LIMITS - Enforce manageable file sizes for AI context
      "max-lines": ["warn", { "max": 300, "skipBlankLines": true, "skipComments": true }],
      "max-lines-per-function": ["warn", { "max": 50, "skipBlankLines": true, "skipComments": true, "IIFEs": true }],
      "max-params": ["warn", 5],
      "max-depth": ["warn", 4],
      "complexity": ["warn", 15],
    },
  },
]);

export default eslintConfig;
