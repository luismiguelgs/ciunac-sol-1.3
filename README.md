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
- `services/`: integraciones legacy con la API.
- `stores/`: estado transversal que conserva consumidores reales.
- `tests/unit/`: reglas, schemas, mappers y casos de uso aislados.
- `tests/integration/`: fronteras HTTP y pipelines con adapters reales y `fetch` simulado.
- `tests/e2e/`: smoke, regresion y accesibilidad automatizada con Playwright.
- `docs/architecture/`: documentacion arquitectonica y SDD.

## Direccion arquitectonica
El repositorio esta migrando a una arquitectura modular por feature con cuatro capas internas:

```text
presentation -> application -> domain -> infrastructure
```

Los features principales de solicitud y consulta ya exponen entradas publicas y
capas internas. Las excepciones y deuda restante se documentan en el SDD y los ADRs.

## Integracion continua

GitHub Actions ejecuta cuatro gates en pull requests hacia `main`: calidad estatica,
unitarias/integracion, build/seguridad y smoke/accesibilidad. La regresion E2E
completa se ejecuta despues de integrar, manualmente y en horario programado.

La proteccion de `main` debe configurarse manualmente para exigir:
`static-quality`, `unit-integration`, `build-security` y `browser-smoke-a11y`.

## Documentacion
- [Arquitectura completa](./docs/architecture/complete-architecture.md)
- [Overview](./docs/architecture/overview.md)
- [SDD v1](./docs/architecture/sdd.md)
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
