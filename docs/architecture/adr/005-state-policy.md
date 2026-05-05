# ADR-005 Politica de estado frontend

## Estado
Aceptado

## Contexto
El estado se mezclaba entre formularios, Zustand, cache de catalogos y estado visual.

## Decision
Clasificar estado en:
- React Hook Form para formularios.
- Zustand para flujos multi-step.
- Zustand persistido por sesion para catalogos.
- Hooks/componentes de presentation para loading, submit y dialogos.

## Consecuencias
- Los stores de flujo exponen `reset`.
- Los catologos exponen `hasHydrated`, `setData` y `clearData`.
- El wrapper `hooks/useStore.ts` fue eliminado en favor de `useCatalogStore`.
