import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const cleanLayerPaths = [
  {
    name: "react",
    message: "Las capas domain/application no deben depender de React.",
  },
];

const cleanLayerFrameworkPatterns = [
  {
    group: ["next/*", "@/assets/*", "@/components/*", "@/hooks/*", "@/stores/*"],
    message: "Las capas domain/application no deben depender de framework, UI, hooks ni stores.",
  },
];

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
              message: "useStore fue retirado; usa un store tipado del feature o carga server-side.",
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
  {
    files: ["app/**/*.{ts,tsx}", "modules/**/*.{ts,tsx}"],
    ignores: ["modules/consulta-certificado/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              regex: "^@/modules/consulta-certificado/(?!server$).+",
              message: "Consume consulta-certificado mediante su API publica o su entrada server-only.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["modules/consulta-certificado/domain/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: cleanLayerPaths,
          patterns: [
            ...cleanLayerFrameworkPatterns,
            {
              regex: "^@/modules/(?!(?:consulta-certificado/domain|shared/domain)(?:/|$))",
              message: "Domain solo puede depender de su propio dominio o de contratos shared de dominio.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["modules/consulta-certificado/application/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: cleanLayerPaths,
          patterns: [
            ...cleanLayerFrameworkPatterns,
            {
              regex: "^@/modules/(?!(?:consulta-certificado/(?:application|domain)|shared/(?:application|domain))(?:/|$))",
              message: "Application solo puede depender de application, domain y contratos shared internos.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["modules/consulta-certificado/infrastructure/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              regex: "^@/modules/(?!(?:consulta-certificado/(?:application|domain|infrastructure)|shared|security)(?:/|$))",
              message: "Infrastructure no puede depender de presentation ni de internals de otros features.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["modules/consulta-certificado/presentation/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              regex: "^@/modules/(?!(?:consulta-certificado/(?:application|presentation)|shared)(?:/|$))",
              message: "Presentation solo puede depender de application, presentation y componentes shared.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["app/**/*.{ts,tsx}", "modules/**/*.{ts,tsx}"],
    ignores: ["modules/consulta-solicitud/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              regex: "^@/modules/consulta-solicitud/(?!server$).+",
              message: "Consume consulta-solicitud mediante su API publica o su entrada server-only.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["modules/consulta-solicitud/domain/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: cleanLayerPaths,
          patterns: [
            ...cleanLayerFrameworkPatterns,
            {
              regex: "^@/modules/(?!(?:consulta-solicitud/domain|shared/domain)(?:/|$))",
              message: "Domain solo puede depender de su propio dominio o de contratos shared de dominio.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["modules/consulta-solicitud/application/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: cleanLayerPaths,
          patterns: [
            ...cleanLayerFrameworkPatterns,
            {
              regex: "^@/modules/(?!(?:consulta-solicitud/(?:application|domain)|shared/(?:application|domain))(?:/|$))",
              message: "Application solo puede depender de application, domain y contratos shared internos.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["modules/consulta-solicitud/infrastructure/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              regex: "^@/modules/(?!(?:consulta-solicitud/(?:application|domain|infrastructure)|shared)(?:/|$))",
              message: "Infrastructure no puede depender de presentation ni de internals de otros features.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["modules/consulta-solicitud/presentation/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              regex: "^@/modules/(?!(?:consulta-solicitud/(?:application|presentation)(?:/|$)|consulta-solicitud/client$|shared(?:/|$)|consultas$))",
              message: "Presentation solo puede depender de application, presentation y APIs publicas compartidas.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["app/**/*.{ts,tsx}", "modules/**/*.{ts,tsx}"],
    ignores: ["modules/consulta-ubicacion/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              regex: "^@/modules/consulta-ubicacion/(?!server$).+",
              message: "Consume consulta-ubicacion mediante su API publica o su entrada server-only.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["modules/consulta-ubicacion/domain/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: cleanLayerPaths,
          patterns: [
            ...cleanLayerFrameworkPatterns,
            {
              regex: "^@/modules/(?!(?:consulta-ubicacion/domain|shared/domain)(?:/|$))",
              message: "Domain solo puede depender de su propio dominio o de contratos shared de dominio.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["modules/consulta-ubicacion/application/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: cleanLayerPaths,
          patterns: [
            ...cleanLayerFrameworkPatterns,
            {
              regex: "^@/modules/(?!(?:consulta-ubicacion/(?:application|domain)|shared/(?:application|domain))(?:/|$))",
              message: "Application solo puede depender de application, domain y contratos shared internos.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["modules/consulta-ubicacion/infrastructure/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              regex: "^@/modules/(?!(?:consulta-ubicacion/(?:application|domain|infrastructure)(?:/|$)|consultas(?:/server)?$|shared(?:/|$)|security(?:/|$)))",
              message: "Infrastructure solo puede consumir sus capas internas y APIs publicas compartidas.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["modules/consulta-ubicacion/presentation/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              regex: "^@/modules/(?!(?:consulta-ubicacion/(?:application|presentation)(?:/|$)|shared(?:/|$)))",
              message: "Presentation solo puede depender de application, presentation y componentes shared.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["app/**/*.{ts,tsx}", "modules/**/*.{ts,tsx}"],
    ignores: ["modules/solicitud-beca/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              regex: "^@/modules/solicitud-beca/(?!server$).+",
              message: "Consume solicitud-beca mediante su API publica o su entrada server-only.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["modules/solicitud-beca/domain/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: cleanLayerPaths,
          patterns: [
            ...cleanLayerFrameworkPatterns,
            {
              regex: "^@/modules/(?!(?:solicitud-beca/domain|shared/domain)(?:/|$))",
              message: "Domain solo puede depender de su propio dominio o de contratos shared de dominio.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["modules/solicitud-beca/application/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: cleanLayerPaths,
          patterns: [
            ...cleanLayerFrameworkPatterns,
            {
              regex: "^@/modules/(?!(?:solicitud-beca/(?:application|domain)|shared/(?:application|domain))(?:/|$))",
              message: "Application solo puede depender de application, domain y contratos shared internos.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["modules/solicitud-beca/infrastructure/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              regex: "^@/modules/(?!(?:solicitud-beca/(?:application|domain|infrastructure)|shared|security)(?:/|$))",
              message: "Infrastructure no puede depender de presentation ni de internals de otros features.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["modules/solicitud-beca/presentation/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              regex: "^@/modules/(?!(?:solicitud-beca/(?:application|domain|presentation)(?:/|$)|solicitud-beca/client$|shared(?:/|$)))",
              message: "Presentation solo puede depender de application, domain, client y componentes shared.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["app/**/*.{ts,tsx}", "modules/**/*.{ts,tsx}"],
    ignores: ["modules/solicitud-certificado/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              regex: "^@/modules/solicitud-certificado/(?!server$).+",
              message: "Consume solicitud-certificado mediante su API publica o su entrada server-only.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["modules/solicitud-certificado/domain/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: cleanLayerPaths,
          patterns: [
            ...cleanLayerFrameworkPatterns,
            {
              regex: "^@/modules/(?!(?:solicitud-certificado/domain|shared/domain)(?:/|$))",
              message: "Domain solo puede depender de su propio dominio o de contratos shared de dominio.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["modules/solicitud-certificado/application/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: cleanLayerPaths,
          patterns: [
            ...cleanLayerFrameworkPatterns,
            {
              regex: "^@/modules/(?!(?:solicitud-certificado/(?:application|domain)|shared/(?:application|domain))(?:/|$))",
              message: "Application solo puede depender de application, domain y contratos shared internos.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["modules/solicitud-certificado/infrastructure/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              regex: "^@/modules/(?!(?:solicitud-certificado/(?:application|domain|infrastructure)|shared|security)(?:/|$))",
              message: "Infrastructure no puede depender de presentation ni de internals de otros features.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["modules/solicitud-certificado/presentation/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              regex: "^@/modules/(?!(?:solicitud-certificado/(?:application|domain|presentation)(?:/|$)|solicitud-certificado/client$|shared(?:/|$)))",
              message: "Presentation solo puede depender de application, domain, client y componentes shared.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["app/**/*.{ts,tsx}", "modules/**/*.{ts,tsx}"],
    ignores: ["modules/solicitud-constancia/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              regex: "^@/modules/solicitud-constancia/(?!server$).+",
              message: "Consume solicitud-constancia mediante su API publica o su entrada server-only.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["modules/solicitud-constancia/domain/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: cleanLayerPaths,
          patterns: [
            ...cleanLayerFrameworkPatterns,
            {
              regex: "^@/modules/(?!(?:solicitud-constancia/domain|shared/domain)(?:/|$))",
              message: "Domain solo puede depender de su propio dominio o de contratos shared de dominio.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["modules/solicitud-constancia/application/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: cleanLayerPaths,
          patterns: [
            ...cleanLayerFrameworkPatterns,
            {
              regex: "^@/modules/(?!(?:solicitud-constancia/(?:application|domain)|shared/(?:application|domain))(?:/|$))",
              message: "Application solo puede depender de application, domain y contratos shared internos.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["modules/solicitud-constancia/infrastructure/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              regex: "^@/modules/(?!(?:solicitud-constancia/(?:application|domain|infrastructure)|shared|security)(?:/|$))",
              message: "Infrastructure no puede depender de presentation ni de internals de otros features.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["modules/solicitud-constancia/presentation/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              regex: "^@/modules/(?!(?:solicitud-constancia/(?:application|domain|presentation)(?:/|$)|solicitud-constancia/client$|shared(?:/|$)))",
              message: "Presentation solo puede depender de application, domain, client y componentes shared.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["app/**/*.{ts,tsx}", "modules/**/*.{ts,tsx}"],
    ignores: ["modules/solicitud-ubicacion/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              regex: "^@/modules/solicitud-ubicacion/(?!server$).+",
              message: "Consume solicitud-ubicacion mediante su API publica o su entrada server-only.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["modules/solicitud-ubicacion/domain/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: cleanLayerPaths,
          patterns: [
            ...cleanLayerFrameworkPatterns,
            {
              regex: "^@/modules/(?!(?:solicitud-ubicacion/domain|shared/domain)(?:/|$))",
              message: "Domain solo puede depender de su propio dominio o de contratos shared de dominio.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["modules/solicitud-ubicacion/application/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: cleanLayerPaths,
          patterns: [
            ...cleanLayerFrameworkPatterns,
            {
              regex: "^@/modules/(?!(?:solicitud-ubicacion/(?:application|domain)|shared/(?:application|domain))(?:/|$))",
              message: "Application solo puede depender de application, domain y contratos shared internos.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["modules/solicitud-ubicacion/infrastructure/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              regex: "^@/modules/(?!(?:solicitud-ubicacion/(?:application|domain|infrastructure)|shared|security)(?:/|$))",
              message: "Infrastructure no puede depender de presentation ni de internals de otros features.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["modules/solicitud-ubicacion/presentation/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              regex: "^@/modules/(?!(?:solicitud-ubicacion/(?:application|domain|presentation)(?:/|$)|solicitud-ubicacion/client$|shared(?:/|$)))",
              message: "Presentation solo puede depender de application, domain, client y componentes shared.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["app/**/*.{ts,tsx}", "modules/**/*.{ts,tsx}"],
    ignores: ["modules/solicitud-nuevo/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              regex: "^@/modules/solicitud-nuevo/(?!server$).+",
              message: "Consume solicitud-nuevo mediante su API publica o su entrada server-only.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["modules/solicitud-nuevo/domain/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: cleanLayerPaths,
          patterns: [
            ...cleanLayerFrameworkPatterns,
            {
              regex: "^@/modules/(?!(?:solicitud-nuevo/domain|shared/domain)(?:/|$))",
              message: "Domain solo puede depender de su propio dominio o de contratos shared de dominio.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["modules/solicitud-nuevo/application/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: cleanLayerPaths,
          patterns: [
            ...cleanLayerFrameworkPatterns,
            {
              regex: "^@/modules/(?!(?:solicitud-nuevo/(?:application|domain)|shared/(?:application|domain))(?:/|$))",
              message: "Application solo puede depender de application, domain y contratos shared internos.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["modules/solicitud-nuevo/infrastructure/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              regex: "^@/modules/(?!(?:solicitud-nuevo/(?:application|domain|infrastructure)|shared|security)(?:/|$))",
              message: "Infrastructure no puede depender de presentation ni de internals de otros features.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["modules/solicitud-nuevo/presentation/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              regex: "^@/modules/(?!(?:solicitud-nuevo/(?:application|domain|presentation)(?:/|$)|solicitud-nuevo/client$|shared(?:/|$)|security(?:/|$)))",
              message: "Presentation solo puede depender de application, domain, client y capacidades shared.",
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
    ".next-e2e/**",
    "playwright-report/**",
    "test-results/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
