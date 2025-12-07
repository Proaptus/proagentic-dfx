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
    "coverage/**",
    "node_modules/**",
  ]),
  // Project-specific rules - must specify files for flat config
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    rules: {
      // Disable React 19 strict setState-in-effect rule
      // This pattern is valid for data fetching with loading states
      // See: https://react.dev/learn/synchronizing-with-effects#fetching-data
      "react-hooks/set-state-in-effect": "off",
      // Unused vars as warnings during development
      "@typescript-eslint/no-unused-vars": ["warn", {
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_"
      }],
      // Allow exhaustive deps warnings (useful but not always necessary)
      "react-hooks/exhaustive-deps": "warn",
    },
  },
]);

export default eslintConfig;
