# Refactor Modular de Solicitud de Ubicacion

## Alcance

Migracion exclusiva de `solicitud-ubicacion` a cuatro capas. Se conservaron tarifa
S/ 30, perfil CIUNAC, OTP/CAPTCHA, pago, documentos, correo, rutas y diseno.

## Cambios

- APIs publicas `index.ts`, `client.ts` y `server.ts`.
- Puertos internos y casos de uso para duplicidad, estudiante, registro y cargo.
- Gateways consolidados sin repositories consumidos desde presentacion.
- DTOs de respuesta inferidos desde Zod; requests externos explicitos.
- Schemas de formulario en presentacion y schema del command en aplicacion.
- Politicas de archivos puras y validadores binarios server-side propios.
- App Router, BFF y perfil sin imports profundos.
- Reglas ESLint acotadas al feature.

## Dependencias

Ubicacion no importa certificados ni constancias. Se mantienen como capacidades
compartidas `FinData`, voucher, seguridad, HTTP, errores, shadcn y renderer A4. El
endpoint `upload/becas` se conserva por compatibilidad, pero el BFF aplica el
validador de ubicacion cuando la sesion es `UBICACION`.

## Pruebas

- Reglas puras y firmas de DNI y certificado academico.
- DTOs, mappers, schemas y respuestas externas mal formadas.
- Casos de uso de lectura y escritura, workflow y correo parcial.
- Smoke E2E de perfiles, tarifa, duplicidad, archivos, correo y cargo.

## Verificacion

| Control | Resultado |
| --- | --- |
| `npm run lint` | Correcto, incluidas las restricciones del feature. |
| `npx tsc --noEmit` | Correcto. |
| Unitarias dirigidas | 31 de 31. |
| `npm run test:unit` | 238 de 238 en 15 archivos. |
| Smoke E2E de ubicacion | 11 de 11 escenarios correctos. |
| Suite E2E completa | 92 de 93 en una ejecucion; el unico timeout de beca paso al repetirse aislado. |
| `npm run build` | Correcto con Next.js 16.2.12; 22 paginas generadas. |
| `npm run security:bundle-check` | Correcto; sin secretos privados en `.next/static`. |
| `npm run env:check` | Correcto. |
| `git diff --check` | Correcto; solo avisos LF/CRLF de Windows. |

El build inicial fallo porque el sandbox no pudo descargar Geist; la repeticion con
acceso de red termino correctamente. Playwright completo los 11 smoke de ubicacion,
pero su proceso quedo bloqueado durante el teardown conocido en Windows. En la
suite global, el caso de PDF falsificado de beca tuvo un timeout de infraestructura
y paso en 9.6 segundos al ejecutarse de forma aislada.
