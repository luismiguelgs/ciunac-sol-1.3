# ADR-001 Mantener Next.js App Router

## Estado
Aceptado

## Contexto
El proyecto ya usa Next.js App Router y combina rutas publicas, componentes cliente y server components puntuales para obtener datos.

## Decision
Mantener Next.js App Router como base de enrutamiento y rendering.

## Consecuencias
- Se evita una migracion innecesaria de framework o router.
- Las paginas en `app/` deben quedar delgadas y delegar flujo a `presentation`.
- Los datos de solo lectura pueden migrarse gradualmente a server components cuando reduzca complejidad.
