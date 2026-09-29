# CIUNAC Frontend

Frontend de CIUNAC construido con Next.js App Router, `shadcn/ui`, React Hook Form, Zod y Zustand. La aplicacion permite registrar y consultar solicitudes academicas a traves de una API externa.

## Stack principal
- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- shadcn/ui
- React Hook Form + Zod
- Zustand

## Scripts
```bash
npm run dev
npm run build
npm run start
npm run lint
npm run typecheck
npm run env:check
npm run test:unit
npm run test:integration
npm run test:e2e:smoke
npm run test:a11y
npm run test:e2e
npm run dead-code:check
npm run audit:dependencies
npm run security:bundle-check
```

## Estructura actual
- `app/`: rutas y layouts de Next.js.
- `modules/`: features de negocio.
- `components/`: componentes UI compartidos.
- `services/storage.service.ts`: carga de archivos y normalizacion de su respuesta.
- `modules/<feature>/store.ts`: estado tipado entre pasos, cuando es necesario.
- `tests/unit/`: reglas, schemas, mappers y casos de uso aislados.
- `tests/integration/`: fronteras HTTP y pipelines con adapters reales y `fetch` simulado.
- `tests/e2e/`: smoke, regresion y accesibilidad automatizada con Playwright.
- `docs/architecture/`: documentacion arquitectonica y SDD.

## Direccion arquitectonica
La arquitectura es modular por feature y pragmatica: UI, reglas puras,
orquestacion e integracion se separan sin exigir carpetas, clases o puertos vacios.
Los registros usan `components/`, `model.ts`, `schemas.ts`, `operations.ts`,
`store.ts` e `infrastructure/` por necesidad, no como plantilla obligatoria.

Las rutas consumen `index.ts` y `server.ts`; la composicion del navegador vive en
`client.ts`. Las credenciales y validaciones autoritativas permanecen en el BFF.
No hay imports internos entre features ni cache global de datos personales.
Ver [ADR-031](./docs/architecture/adr/031-pragmatic-feature-architecture.md).

## Integracion continua

GitHub Actions ejecuta cuatro gates en pull requests hacia `main`: calidad estatica,
unitarias/integracion, build/seguridad y smoke/accesibilidad. La regresion E2E
completa se ejecuta despues de integrar, manualmente y en horario programado.

La proteccion de `main` debe configurarse manualmente para exigir:
`static-quality`, `unit-integration`, `build-security` y `browser-smoke-a11y`.

Al cierre documental del 2026-09-28, la auditoria de dependencias sigue bloqueada
por hallazgos critical/high y excepciones vencidas. No se presenta el refactor
como aprobacion de despliegue. Ver [auditoria vigente](./docs/quality/dependency-audit.md).

## Documentacion
- [Arquitectura completa](./docs/architecture/complete-architecture.md)
- [Flujo de codigo: consulta-certificado](./docs/architecture/walkthroughs/consulta-certificado.md)
- [Flujo de codigo: consulta-solicitud](./docs/architecture/walkthroughs/consulta-solicitud.md)
- [Overview](./docs/architecture/overview.md)
- [SDD vigente](./docs/architecture/sdd.md)
- [Cierre de simplificacion](./docs/quality/pragmatic-simplification-baseline.md#paso-8-cierre-documental-y-limpieza)
- [Analisis de requisitos](./docs/requirements/srs.md)
- [Historias de usuario](./docs/requirements/user-stories.md)
- [Casos de uso](./docs/requirements/use-cases)
- [Matriz de trazabilidad](./docs/requirements/traceability-matrix.md)
- [Flujo de solicitud de constancia](./docs/product/flows/solicitud-constancia.md)
- [Contratos de integracion](./docs/integration/api-contracts.md)
- [Reglas de negocio](./docs/domain/business-rules.md)
- [Convenciones](./docs/architecture/conventions.md)
- [ADRs](./docs/architecture/adr)
- [Checklist de revision](./docs/architecture/review-checklist.md)
- [Estrategia de pruebas](./docs/architecture/testing-strategy.md)
- [Gobierno tecnico](./docs/quality/technical-governance-baseline.md)
- [Auditoria de dependencias](./docs/quality/dependency-audit.md)
- [Informe de codigo muerto](./docs/quality/dead-code-report.md)
- [Roadmap de refactorizacion](./docs/architecture/refactoring-roadmap.md)
- [Reglas arquitectonicas](./docs/architecture/architecture-rules.md)
- [Seguridad Fase 1C](./docs/security/phase-1c.md)
- [ADR BFF, OTP y CAPTCHA](./docs/architecture/adr/007-secure-bff-otp-captcha.md)
