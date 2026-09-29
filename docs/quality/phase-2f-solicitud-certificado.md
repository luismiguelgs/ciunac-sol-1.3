# Fase 2F: Tipado y Confiabilidad de Solicitud de Certificados

Las primeras secciones conservan el historial de la fase tipada y modular.
La estructura vigente se describe en [Piloto pragmatico](#piloto-pragmatico-paso-3).

## Alcance

La fase se limita al registro de certificados, catalogos, estudiante, precio,
voucher, solicitud, correo y cargo PDF. No migra ubicacion, constancias, beca ni
consultas.

## Cambios Implementados

- Dominio `SolicitudCertificado` separado de formularios y API.
- Workflow Zustand discriminado sin `Partial`, casts ni setters `unknown`.
- DTOs y schemas runtime para estudiante, catalogos, solicitud, creacion y cargo.
- Mappers explicitos de formulario a dominio y de dominio a contratos externos.
- Catalogos obtenidos en Server Components mediante `Promise.all` y validados con Zod.
- Busqueda de estudiante con estados diferenciados para dato, ausencia y error.
- Tipos `2` y `4` definidos como certificados digitales mediante una regla pura.
- Precio normal revalidado server-side; un monto distinto responde `409 PRICE_CHANGED`.
- Descuentos de trabajador deshabilitados y parametros `trabajador`/`antiguo` retirados.
- Alumno UNAC enviado con facultad, escuela, codigo y `alumnoCiunac: true`.
- Unico archivo del flujo: voucher compartido con validacion binaria server-side.
- Resultado parcial y reintento exclusivo del correo, sin repetir persistencia.
- Cargo A4 tipado con estados `loading`, `data`, `empty` y `error`.
- Estados de ruta `loading.tsx`, `error.tsx` y `not-found.tsx`.

## Dependencias Eliminadas

- Store compartido y modelo `Partial<Isolicitud>` dentro de certificados.
- Setter `setSolicitudField(..., unknown)`.
- Paso documental de certificados y reglas de descuento basadas en query string.
- Componentes legacy de formulario, registro, cargo y view-model del slice.
- Fachadas legacy de certificado que quedaron sin consumidores.
- Dependencia del resumen con `DetalleSolicitudCard`.

## Dependencias Que Permanecen

- `FinData` y `finInfoSchema` para la politica transversal de pago.
- BFF, OTP, CAPTCHA, sesiones y notificaciones seguras.
- Cliente HTTP y repositories transversales.
- API externa y nombres vigentes de sus contratos.

## Pruebas Agregadas

- 39 pruebas unitarias para dominio, mappers, DTOs, respuestas, cargo, store,
  gateways y caso de uso.
- 15 smoke E2E para flujo completo, sesion, estudiante existente, alumno UNAC,
  voucher falsificado, precio manipulado, parametros obsoletos, catalogos,
  respuestas incompletas, correo, cargo e ID final.

## Deuda Pendiente

- Un descuento de trabajador requiere verificacion y autorizacion explicita del backend.
- El backend externo debe validar propiedad y vigencia de la URL del voucher.
- `mailer` no garantiza idempotencia ni entrega SMTP.
- El runner Playwright/Next mantiene pendiente su teardown en Windows despues de
  completar escenarios; los smoke usan Webpack y respuestas de fuente simuladas
  para reducir dependencias externas, pero el lifecycle requiere una correccion transversal.

## Refactor Modular

- Se incorporaron APIs publicas `index.ts`, `client.ts` y `server.ts`.
- App Router y BFF dejaron de importar internals del feature.
- Presentacion consume casos de uso compuestos, no repositories ni gateways.
- Busqueda, alta y actualizacion de estudiante usan un gateway unico.
- Los response DTOs se infieren desde Zod; solo los contratos de escritura siguen
  declarados explicitamente.
- Schemas de command y formulario quedaron en application y presentation.
- ESLint hace cumplir las dependencias de las cuatro capas solo en certificados.
- No existen imports entre solicitud de certificados y solicitud de constancias.

## Verificacion

| Comprobacion | Resultado |
| --- | --- |
| `npm run lint` | Correcto, sin errores ni warnings. |
| `npx tsc --noEmit` | Correcto. |
| `npm run test:unit` | 170 de 170 pruebas en 13 archivos. |
| Smoke E2E de certificados | Los 15 escenarios recorrieron la lista completa sin fallos reportados; el comando no cerro por el teardown de servidores en Windows. |
| Suite E2E completa | 69 escenarios descubiertos; la ejecucion no produjo un cierre verificable y fue detenida por el bloqueo conocido del runner. |
| `npm run build` | Correcto con Turbopack; 21 paginas generadas. |
| `npm run security:bundle-check` | Correcto; no se detectaron secretos privados en `.next/static`. |
| `npm run env:check` | Correcto; configuracion requerida presente y `NEXT_PUBLIC_API_KEY` ausente. |
| `git diff --check` | Correcto; solo advertencias LF/CRLF propias de Windows. |

El primer build no pudo descargar Geist y Geist Mono por la restriccion de red del
sandbox. La repeticion autorizada del mismo comando termino correctamente, sin
cambios en fuentes ni configuracion productiva. Para reducir ruido externo, el
servidor E2E usa Webpack y respuestas Google Fonts simuladas; el bloqueo de teardown
persiste y queda como deuda transversal del runner.

## Verificacion del Refactor Modular

| Comprobacion | Resultado |
| --- | --- |
| `npm run lint` | Correcto, incluidas las restricciones del feature. |
| `npx tsc --noEmit` | Correcto. |
| Unitarias dirigidas | 51 de 51. |
| `npm run test:unit` | 232 de 232 pruebas en 15 archivos. |
| Smoke E2E de certificados | 15 de 15 escenarios correctos; timeout posterior en teardown. |
| Suite E2E completa | 92 de 92 escenarios correctos; timeout posterior en teardown. |
| `npm run build` | Correcto con Turbopack; 22 paginas generadas. |
| `npm run security:bundle-check` | Correcto. |
| `npm run env:check` | Correcto. |
| `git diff --check` | Correcto; solo avisos LF/CRLF de Windows. |

El primer build modular no pudo descargar Geist por la restriccion de red del
sandbox. La repeticion autorizada del mismo comando finalizo correctamente sin
alterar fuentes, configuracion o dependencias.

## Piloto Pragmatico: Paso 3

Fecha: 2026-09-22. Aplicacion 1.6.5 y Next.js 16.2.12, sin actualizaciones.
Se preservo el worktree anterior. No se migraron constancias, alumno nuevo,
ubicacion, becas, consultas ni capacidades shared.

| Aspecto | Antes del piloto | Despues |
| --- | --- | --- |
| Archivos del feature | 31 | 22 |
| Clases delegadoras | 3 casos de uso y 4 gateways | 0; funciones con dependencias inyectables |
| Contratos triviales | Command y dos archivos de ports | Entrada publica conservada, dependencias junto a la operacion |
| Integracion navegador | 4 gateways | `infrastructure/certificate-client.ts` |
| DTO de solicitud | Tipo manual y schema duplicados | Inferido desde Zod; mismo payload |
| Confirmacion | Parse completo en cada render | Guardas tipadas; validacion completa al registrar |
| Correo fallido | Reclasificacion a EXTERNAL_SERVICE | Conserva codigo, status, correlationId y retryable |
| Escrituras en flujo exitoso | Un upload, un estudiante, una solicitud | Mismos endpoints, cantidades y orden |
| Reintento de correo | No repite persistencia | Conservado y reforzado con pruebas |

```text
modules/solicitud-certificado/
  index.ts / client.ts / server.ts
  model.ts / schemas.ts / operations.ts / store.ts
  components/                    # UI, hook, schema de formulario y mapper
  infrastructure/
    certificate-client.ts
    certificate-api.mapper.ts
    certificate-api.schemas.ts
    server/
      certificate-catalog.repository.ts
      certificate-price-validation.ts
```

La orquestacion sigue siendo validar -> guardar estudiante -> crear solicitud ->
notificar. Un correo fallido devuelve `saved_notification_failed` con el ID
persistido. Lecturas mantienen ausencia diferenciada de error; escrituras sin ID
detienen correo. Precio, OTP/CAPTCHA, sesion, voucher y PDF A4 diferido no cambian.

Se simplifico primero el comportamiento interno y se ejecuto lint, type-check,
373 unitarias, 38 integraciones, Knip y los 15 E2E de certificados (58.1 s, exit 0).
Solo despues se movieron los archivos y ajustaron sus imports relativos.

Cambios fuera del feature: pruebas, documentacion y reconocimiento del archivo
raiz `schemas.ts` por ESLint como validacion de aplicacion, con cuatro pruebas
adicionales. No se cambia App Router, BFF, shared, dependencias, diseno ni contratos.

| Verificacion final | Resultado |
| --- | --- |
| Lint y type-check | Correctos, tambien despues del build |
| Unitarias | 377/377 despues de mover archivos; 52 del feature y 67 de arquitectura |
| Integracion | 48/48, con 10 casos nuevos de limites y errores de certificados |
| Regresion E2E, smoke y accesibilidad | 110/110, incluidos 15 de certificados, 34 smoke y 9 axe; exit 0 |
| Build | Correcto con red para Google Fonts, 22 paginas generadas |
| Knip | Correcto |
| Bundle-check y env-check | Correctos; sin secretos configurados en `.next/static`, entorno real sin editar |
| Diff check | Correcto |

El primer lote completo agoto la espera de navegacion tras OTP en el smoke de
becas; no fallo ningun escenario de certificados. El escenario de beca paso
aislado (exit 0) sin cambios en codigo ni tests. Se conserva este antecedente
como intermitencia observada, sin atribuirle una causa no demostrada. Las
repeticiones usan servidores de prueba independientes para evitar el teardown
conocido de Playwright en Windows y no acceden al backend productivo.

La repeticion completa final termino en 292.7 segundos con 110 correctos, cero
fallos, omisiones o flaky y sin errores globales. Se ejecuto la suite completa
mediante `node node_modules/@playwright/test/cli.js test --reporter=json`, sin
filtros ni cambios en beca. Reporte local:
`%TEMP%/ciunac-step3-e2e-final.json`. El primer reporte se conserva separado en
`%TEMP%/ciunac-step3-e2e.json`; no se presenta el intento fallido como aprobado.

El primer build fallo al descargar Geist/Geist Mono con red restringida. El mismo
comando con red paso; no se cambio la configuracion de fuentes para ocultarlo.

Riesgos no resueltos por este refactor: propiedad backend de URLs/voucher,
idempotencia del correo, replay OTP sin persistencia, dependencias con baseline de
auditoria vencida y fuentes remotas durante build. La busqueda de estudiante en
certificados aun puede recibir una respuesta tardia al editar el documento; esa
correccion funcional debe aislarse y no se atribuye a esta simplificacion.

El paso 4 queda pendiente. No se aplica este patron automaticamente al resto del
repositorio ni se convierte la estructura del piloto en plantilla obligatoria.
