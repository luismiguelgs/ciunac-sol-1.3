# Reglas Arquitectonicas

## Configuracion efectiva

`eslint.config.mjs` registra una sola regla local `architecture/dependencies`,
implementada en `scripts/eslint-architecture.mjs`. Evita que varios bloques de
`no-restricted-imports` sobrescriban las restricciones anteriores de una capa.
Conserva las reglas de Next.js y TypeScript, sin instalar plugins adicionales.

La regla se aplica a TypeScript/TSX de `app`, `modules`, `components`, `lib` y
`services`. Los tests pueden importar internals para probarlos directamente.

| Origen | Dependencias locales admitidas |
| --- | --- |
| Dominio | Dominio propio y dominio compartido puro |
| Aplicacion | Aplicacion y dominio propios; contratos shared interiores |
| Infraestructura | Infraestructura y capas interiores, capacidades shared/security |
| Presentacion | Presentacion, aplicacion, dominio, schemas de formulario, `client.ts` propio y UI/capacidades compartidas |
| `client.ts` | Composicion de aplicacion e infraestructura del navegador, sin codigo server-only |
| `server.ts` | Composicion exclusiva de servidor |
| App Router y consumidores externos | API raiz (`index.ts`) o `server.ts` del feature; no rutas internas |

La configuracion reconoce tambien los nombres opcionales `model.ts`,
`operations.ts`, `components/` y `store.ts`. El archivo raiz `schemas.ts` tiene
las mismas restricciones que aplicacion; no se altera la clasificacion de los
schemas de formulario en subcarpetas. ESLint no exige crear estos archivos.

Bloqueos implementados:

- Imports externos profundos, tanto con alias `@/` como relativos.
- Dependencias hacia fuera desde dominio/aplicacion y dependencias desde
  presentacion hacia infraestructura, `lib/api.service` o fachadas `services`.
- Imports de React, Next.js, estado, UI o clientes HTTP conocidos en codigo puro.
- Imports server-only desde presentacion, `client.ts`, API publica UI o un archivo
  con `use client`.
- Dependencias de shared/security hacia features de negocio.
- Llamadas directas a `fetch`, `window.fetch` y `globalThis.fetch` desde dominio,
  aplicacion o presentacion de un modulo.

Se inspeccionan imports, reexports, imports de tipos, `require` e imports dinamicos
con ruta literal. La prueba usa ESLint y la configuracion real, no una copia de
las reglas: `tests/unit/architecture/eslint-boundaries.test.ts` (67 casos).

## Compatibilidad explicita

- Desde el paso 6, `app/api/security/consulta/route.ts` consume
  `modules/consultas/server`. Se retiro la excepcion de sus dos imports internos;
  las pruebas de configuracion efectiva ahora exigen su rechazo.
- `consulta-solicitud` y `consulta-ubicacion` consumen el contexto `consultas`
  exclusivamente mediante su API publica.
- El tipo puro `shared/application/errors/app-error` sigue disponible para el
  dominio de consultas; no introduce dependencias de framework o transporte.

## Limites y revision manual

ESLint no es una frontera de seguridad runtime ni realiza un analisis transitivo
completo. Imports calculados, alias de funciones y usos indirectos requieren
revision; build, `server-only`, validaciones BFF y bundle-check siguen vigentes.

Mantener reglas de negocio sin React/HTTP, componentes sin credenciales ni DTOs
del proveedor y APIs publicas estables. Las funciones con dependencias inyectadas
son validas: no se exige un command, port, clase o carpeta por operacion.

La linea base y el alcance completado se registran en
[Linea base y cierre](../quality/pragmatic-simplification-baseline.md).
La decision general de organizacion por necesidad esta en
[ADR-031](adr/031-pragmatic-feature-architecture.md); no exige nuevas carpetas.
