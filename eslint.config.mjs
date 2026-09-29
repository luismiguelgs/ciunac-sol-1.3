import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import architectureDependencies from "./scripts/eslint-architecture.mjs";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    name: "ciunac/architecture",
    files: ["{app,modules,components,lib,services}/**/*.{ts,tsx}"],
    plugins: { architecture: { rules: { dependencies: architectureDependencies } } },
    rules: { "architecture/dependencies": "error" },
  },
  globalIgnores([
    ".next/**",
    ".next-e2e/**",
    "playwright-report/**",
    "test-results/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);
