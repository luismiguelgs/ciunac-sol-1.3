# Checklist de Revision Arquitectonica

Usar este checklist para PRs que agreguen o cambien flujos.
Vigente al 2026-09-28; [ADR-031](adr/031-pragmatic-feature-architecture.md).

## Feature y responsabilidades
- La pagina en `app/` compone la API publica del feature sin importar internals.
- La UI, las reglas puras y el acceso HTTP tienen responsabilidades distinguibles.
- La orquestacion solo existe cuando coordina operaciones o aplica una politica real.
- No se crean carpetas, clases, commands o puertos que solo delegan sin aportar un contrato necesario.
- Las APIs publicas y la separacion servidor/navegador se conservan al mover archivos.

## Dependencias
- `domain` no importa React, Next.js, stores, servicios ni componentes.
- `application` no importa React, Next.js, stores ni componentes.
- `presentation` no usa `fetch`, `apiFetch` ni construye payloads HTTP.
- Los DTOs de API se construyen en mappers.
- Las pruebas de `architecture/dependencies` comprueban la configuracion efectiva de ESLint.
- Las excepciones de imports son puntuales, documentadas y no se amplian para silenciar lint.

## Estado
- React Hook Form contiene solo estado de formulario.
- Zustand conserva workflows entre pasos; no duplicar catalogos ya resueltos en servidor.
- Cada store de flujo tiene accion `reset`.
- Loading, dialogos y mensajes viven en hooks/componentes de presentation.
- Un fallo de correo conserva la referencia y solo reintenta notificacion.
- Un resultado de escritura indeterminado no permite repetir automaticamente la persistencia.

## Calidad
- `npm run lint` pasa.
- `npm run typecheck` pasa.
- `npm run test:unit` y `npm run test:integration` pasan.
- El smoke del feature y las guardas de sesion afectadas pasan.
- No se introducen violaciones axe `critical` o `serious`.
- `npm run build` pasa antes de merge.
- `npm run dead-code:check` no reporta archivos o dependencias nuevas sin uso.
- `npm run audit:dependencies` pasa: sin critical, altas nuevas ni excepciones vencidas presentes.
- `npm ls --depth=0` no reporta dependencias faltantes o extraneous.
- Nuevas reglas puras, mappers y contratos externos tienen pruebas automatizadas.
- Regresion completa, bundle-check, env-check y diff-check pasan antes de cerrar un refactor.
- Antes de eliminar codigo, comprobar consumidores, imports dinamicos, scripts y configuracion.
- No eliminar exports de APIs publicas o shadcn solo por un aviso informativo de Knip.

## Documentacion y Gobierno
- Los cambios de arquitectura actualizan el SDD y, si corresponde, un ADR.
- Los requisitos afectados enlazan implementacion y pruebas en la matriz de trazabilidad.
- Una excepcion temporal de seguridad o accesibilidad tiene responsable y fecha de vencimiento.
- Los cuatro checks obligatorios de GitHub Actions permanecen verdes antes del merge.
- Verificar branch protection en GitHub; declarar workflows no demuestra que este activada.
- SDD y convenciones describen lo implementado, sin convertir pendientes en controles existentes.
- Registrar fallos e intentos anteriores; no presentar una auditoria bloqueada como despliegue aprobado.
