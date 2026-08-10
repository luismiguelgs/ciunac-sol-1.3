# Fase 2F: Tipado y Confiabilidad de Solicitud de Certificados

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
