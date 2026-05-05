import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: [
      "modules/**/domain/**/*.{ts,tsx}",
      "modules/**/application/**/*.{ts,tsx}",
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "react",
              message: "Las capas domain/application no deben depender de React.",
            },
            {
              name: "@/hooks/useStore",
              message: "useStore fue retirado; usa hooks especificos de estado o useCatalogStore.",
            },
          ],
          patterns: [
            {
              group: ["next/*", "@/components/*", "@/stores/*"],
              message: "Las capas domain/application no deben depender de Next.js, UI ni stores.",
            },
          ],
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
