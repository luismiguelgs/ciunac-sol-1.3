# Checklist de Revision Arquitectonica

Usar este checklist para PRs que agreguen o cambien flujos.

## Feature y capas
- La pagina en `app/` queda delgada y delega a `presentation`.
- El flujo tiene `presentation` si contiene orquestacion visual o multi-step.
- La orquestacion de negocio vive en `application/use-cases`.
- Las reglas puras viven en `domain/rules`.
- La integracion con API vive en `infrastructure/api`.

## Dependencias
- `domain` no importa React, Next.js, stores, servicios ni componentes.
- `application` no importa React, Next.js, stores ni componentes.
- `presentation` no usa `fetch`, `apiFetch` ni construye payloads HTTP.
- Los DTOs de API se construyen en mappers.

## Estado
- React Hook Form contiene solo estado de formulario.
- Zustand se usa solo para datos entre pasos o catalogos.
- Cada store de flujo tiene accion `reset`.
- Loading, dialogos y mensajes viven en hooks/componentes de presentation.

## Calidad
- `npm run lint` pasa.
- `npx tsc --noEmit` pasa.
- `npm run build` pasa antes de merge.
- Nuevas reglas puras o mappers criticos tienen prueba planificada o documentada.
