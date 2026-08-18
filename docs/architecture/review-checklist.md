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
- `npm run typecheck` pasa.
- `npm run test:unit` y `npm run test:integration` pasan.
- El smoke del feature y las guardas de sesion afectadas pasan.
- No se introducen violaciones axe `critical` o `serious`.
- `npm run build` pasa antes de merge.
- `npm run dead-code:check` no reporta archivos o dependencias nuevas sin uso.
- `npm run audit:dependencies` no reporta vulnerabilidades high/critical nuevas.
- `npm ls --depth=0` no reporta dependencias faltantes o extraneous.
- Nuevas reglas puras, mappers y contratos externos tienen pruebas automatizadas.

## Documentacion y Gobierno
- Los cambios de arquitectura actualizan el SDD y, si corresponde, un ADR.
- Los requisitos afectados enlazan implementacion y pruebas en la matriz de trazabilidad.
- Una excepcion temporal de seguridad o accesibilidad tiene responsable y fecha de vencimiento.
- Los cuatro checks obligatorios de GitHub Actions permanecen verdes antes del merge.
