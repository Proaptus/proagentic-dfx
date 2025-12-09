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
  // API route handlers are naturally longer - relax limits
  {
    files: ["**/api/**/*.ts"],
    rules: {
      "max-lines-per-function": "off",
      "max-lines": ["warn", { "max": 450, "skipBlankLines": true, "skipComments": true }],
      "max-params": ["warn", 8],
      "complexity": "off", // API routes with branching logic can be complex
    },
  },
  // Physics simulation libraries need more parameters (many inputs)
  {
    files: ["**/lib/physics/**/*.ts"],
    rules: {
      "max-params": ["warn", 8],
      "max-lines": ["warn", { "max": 400, "skipBlankLines": true, "skipComments": true }],
    },
  },
  // Type definition files are naturally longer
  {
    files: ["**/lib/types/**/*.ts"],
    rules: {
      "max-lines": "off", // Type files can be long
    },
  },
  // Page components can be longer for mock server demo
  {
    files: ["**/app/page.tsx"],
    rules: {
      "max-lines-per-function": "off",
      "max-lines": ["warn", { "max": 500, "skipBlankLines": true, "skipComments": true }],
    },
  },
]);

export default eslintConfig;
