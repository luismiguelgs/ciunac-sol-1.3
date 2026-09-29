# ADR-005 Politica de estado frontend

## Estado
Aceptado. Actualizado el 2026-08-31.

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
- El cache cliente de textos fue retirado: los catalogos cargados por Server
  Components se inyectan a los pasos que los necesitan.
- Un arreglo vacio debe distinguirse de un recurso aun no cargado cuando se agregue un cache nuevo.
