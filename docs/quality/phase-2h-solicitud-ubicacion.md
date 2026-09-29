# Fase 2H: Tipado y Confiabilidad de Solicitud de Ubicacion

Las secciones iniciales conservan la evidencia historica. La revision actual se
registra en [Paso 5](#paso-5-cierre-pragmatico-de-ubicacion).

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

## Paso 5: Cierre Pragmatico de Ubicacion

Revision 2026-09-23/24, aplicacion 1.6.5, Next.js 16.2.12. La simplificacion
funcional anterior ya usaba funciones inyectables. Este paso no las reescribe:
ordena modelo, schemas, operaciones y Zustand en la raiz; UI, hook, formularios,
mapper y mensajes de archivos en `components/`; transporte y DTOs inferidos en
`infrastructure/`; catalogos, perfil y validaciones binarias en
`infrastructure/server/`. La politica pura de archivos permanece en `domain/`.

Se conservan 31 archivos y cero clases. No se mezclan responsabilidades para
reducir artificialmente el conteo. No cambian las APIs de `index.ts`, `client.ts`
y `server.ts`, App Router, BFF, shared, dependencias, contratos o diseno.

Las 18 nuevas integraciones pasaron antes del traslado. Protegen POST/PATCH del
estudiante, ambos perfiles, DTO exacto y secuencia estudiante -> solicitud ->
correo, tipo 7, S/ 30, documento de identidad, certificado academico, ausencia
legitima, errores externos, correo parcial y reintento sin segunda escritura.

Al retomar la verificacion el 2026-09-24, las unitarias detectaron una regresion del
traslado: el literal `'.'` del separador de extension se habia convertido en
`'./'`. La auditoria encontro ademas dos filtros PDF alterados en becas y
ubicacion. Se restauraron los tres literales originales, sin cambiar la politica.
Se agregaron cuatro casos de extension y aserciones E2E sobre `accept=".pdf"`.
No se dio por correcto ese intento fallido ni se redujeron las aserciones.

La auditoria posterior no encontro literales relativos ajenos a imports ni
consumidores productivos externos con imports profundos de becas/ubicacion.
Se mantienen la comprobacion temprana y autoritativa de duplicidad, cookie
HttpOnly del perfil, pago compartido, firmas binarias y PDF A4 diferido.

Verificacion final del 2026-09-24, despues de restaurar los tres literales y
agregar las pruebas de regresion:

| Comprobacion | Resultado del paso 5 |
| --- | --- |
| Lint y type-check | Correctos; type-check repetido despues del build |
| Unitarias e integracion | 406/406 y 107/107 |
| Regresion Playwright completa | 111/111, exit 0, sin omisiones ni flaky; 308.8 segundos |
| Smoke y accesibilidad | 34/34 y 9/9 incluidos en la regresion completa |
| Flujos de beca y ubicacion | 10/10 y 16/16 incluidos en la regresion completa |
| Build | Correcto con acceso a Google Fonts; 22 paginas generadas |
| Knip | Correcto; sin nuevos archivos, dependencias o imports sin resolver |
| Bundle y entorno | Sin valores privados configurados en `.next/static`; entorno valido, sin imprimir secretos |
| `git diff --check` | Correcto; avisos informativos LF/CRLF existentes |

Reporte E2E local: `%TEMP%/ciunac-step5-final-e2e.json`. Se reutilizaron el mock y
Next de pruebas en puertos 4100/3100, con entorno sintetico, para evitar el teardown
administrado de Windows. Ambos servidores se cerraron al terminar. El build se
ejecuto despues de E2E, no concurrentemente; no se alteraron configuracion,
timeouts ni aserciones para conseguir el resultado.

Los informes del paso 5 conservan los intentos fallidos anteriores. La migracion
queda cerrada exclusivamente para becas y ubicacion; no se inicia consultas.

Limites que permanecen: perfil CIUNAC declarado, propiedad backend de URLs,
duplicidad sin atomicidad backend confirmada, correo sin idempotencia/garantia SMTP,
avisos previos de mascara en desarrollo y build dependiente de Google Fonts.
No se renuevan las excepciones de auditoria vencidas el 2026-09-17.
