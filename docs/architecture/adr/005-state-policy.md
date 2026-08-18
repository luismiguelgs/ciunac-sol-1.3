# ADR-005 Politica de estado frontend

## Estado
Aceptado. Actualizado el 2026-08-17.

## Contexto
El estado se mezclaba entre formularios, Zustand, cache de catalogos y estado visual.

## Decision
Clasificar estado en:
- React Hook Form para formularios.
- Zustand para flujos multi-step.
- Server Components para catalogos publicos de solo lectura cuando el flujo lo permite.
- Zustand compartido solo cuando existe un consumidor transversal confirmado.
- Hooks/componentes de presentation para loading, submit y dialogos.

## Consecuencias
- Los stores de flujo exponen `reset`.
- Los stores legacy de catalogos y `useCatalogStore` fueron retirados al quedar sin consumidores.
- `useTextsStore` permanece como cache compartido con consumidores activos.
- Un arreglo vacio debe distinguirse de un recurso aun no cargado cuando se agregue un cache nuevo.
