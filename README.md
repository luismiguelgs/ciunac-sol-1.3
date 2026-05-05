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
```

## Estructura actual
- `app/`: rutas y layouts de Next.js.
- `modules/`: features de negocio.
- `components/`: componentes UI compartidos.
- `services/`: integraciones legacy con la API.
- `stores/`: estado global y de sesion.
- `docs/architecture/`: documentacion arquitectonica y SDD.

## Direccion arquitectonica
El repositorio esta migrando a una arquitectura modular por feature con cuatro capas internas:

```text
presentation -> application -> domain -> infrastructure
```

La primera implementacion de este patron se encuentra en `modules/solicitud-certificado`.

## Documentacion
- [Overview](./docs/architecture/overview.md)
- [SDD v1](./docs/architecture/sdd.md)
- [Convenciones](./docs/architecture/conventions.md)
- [ADRs](./docs/architecture/adr)
- [Checklist de revision](./docs/architecture/review-checklist.md)
- [Estrategia de pruebas](./docs/architecture/testing-strategy.md)
- [Roadmap de refactorizacion](./docs/architecture/refactoring-roadmap.md)
- [Reglas arquitectonicas](./docs/architecture/architecture-rules.md)
