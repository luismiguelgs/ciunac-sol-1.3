# Fase 2H: Tipado y Confiabilidad de Solicitud de Ubicacion

## Alcance

La fase se limita a solicitud de examen de ubicacion: perfil CIUNAC, catalogos,
duplicidad, datos personales, pago, archivos, registro, correo, cargo y estados de
ruta. No modifica los otros flujos.

## Cambios Implementados

- Dominio `SolicitudUbicacion` separado del formulario y DTO externo.
- Workflow Zustand discriminado sin `Partial` ni setters `unknown`.
- Commands, DTOs, schemas Zod y mappers propios del feature.
- Catalogos, textos y cronogramas cargados y validados server-side.
- Tipo fijo `7` y tarifa oficial S/ 30.00 en dominio, UI, BFF y pruebas.
- Perfil CIUNAC cifrado en cookie `HttpOnly` y ligado a OTP `UBICACION`.
- Revalidacion server-side de perfil, tarifa y duplicidad.
- Documento de identidad enviado mediante `imgDoc`.
- Validacion binaria de DNI, voucher y certificado academico antes del proveedor.
- Politica de voucher compartida mediante `FinData` y `finInfoSchema`.
- Resultado parcial y reintento exclusivo del correo.
- Cargo tipado, A4 y con estados `loading`, `empty`, `data` y `error`.
- Estados de ruta `loading.tsx`, `error.tsx` y `not-found.tsx`.
- Correccion del indice final del wizard no CIUNAC detectada por el smoke E2E.

## Dependencias Eliminadas

- Store global `stores/solicitud.store.ts`.
- `Partial<Isolicitud>` y setters genericos.
- Componentes, interfaces, schemas y servicios legacy del flujo.
- Dependencias de presentacion hacia consulta de solicitudes y certificados.
- Query string `alumno_ciunac`.
- `modules/shared/components/documentos-step.tsx`, que solo era usado por este flujo.

## Dependencias Que Permanecen

- OTP, CAPTCHA, sesion verificada y comprobante de notificacion compartidos.
- `FinData`, `finInfoSchema` y politica comun del voucher.
- Cliente HTTP, `AppError`, repositories transversales y componentes shadcn.
- Endpoints externos de estudiantes, solicitudes, catalogos y archivos.

## Pruebas Agregadas

- Unitarias de dominio, formularios, precio, DTOs, mappers, schemas, gateways,
  firmas de archivos, workflow, correo parcial y reintento.
- 11 smoke E2E para perfiles CIUNAC/no CIUNAC, S/ 30, precio manipulado,
  tarifario inconsistente, duplicidad, archivos falsificados, perfil manipulado,
  respuesta sin ID, correo parcial, cargo e ID final invalido.

## Deuda Pendiente

- La condicion CIUNAC es declarada por el usuario y no verificada contra una fuente
  institucional.
- El backend externo debe validar propiedad y vigencia de las URLs cargadas.
- La duplicidad no dispone de transaccion atomica confirmada entre consulta y alta.
- El proveedor de correo no ofrece idempotencia ni confirmacion de entrega SMTP.
- Playwright completa los escenarios, pero mantiene el teardown bloqueado en Windows.

## Verificacion

| Comprobacion | Resultado |
| --- | --- |
| Lint | Correcto, sin errores ni warnings. |
| Type-check | Correcto. |
| Pruebas unitarias | 212 de 212 pruebas en 15 archivos. |
| Smoke E2E de ubicacion | 11 de 11 escenarios alcanzaron el resultado esperado. |
| Suite E2E completa | 89 de 89 escenarios alcanzaron el resultado esperado. |
| Build de produccion | Correcto con Next.js 16.2.12 y 22 paginas generadas. |
| Revision del bundle | Correcta; no se detectaron secretos privados. |
| Validacion de entorno | Correcta; configuracion privada presente. |
| Revision del diff | Correcta; solo advertencias LF/CRLF de Windows. |

El primer build no pudo descargar Geist por la red restringida del sandbox. La
repeticion autorizada termino correctamente sin modificar fuentes ni configuracion.

Los resultados finales se registran tambien en `docs/quality/baseline.md`. Tanto el
smoke dirigido como la suite global agotaron el timeout despues de reportar el
ultimo caso por el bloqueo transversal del teardown de Playwright en Windows.

## Refactor Modular Posterior

ADR-023 estabiliza las cuatro capas mediante `index.ts`, `client.ts` y `server.ts`.
Application ya no importa DTOs ni factories de infraestructura; presentation usa
casos de uso para estudiante y cargo, y App Router/BFF consumen solo APIs publicas.
Las reglas funcionales y controles server-side de esta fase permanecen vigentes.
