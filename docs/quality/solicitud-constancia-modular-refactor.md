# Refactor Modular de Solicitud de Constancias

## Alcance

Migracion exclusiva de `solicitud-constancia` a cuatro capas. No se modificaron
reglas, componentes o contratos internos de certificados, ubicacion, beca o
consultas.

## Cambios

- APIs publicas `index.ts`, `client.ts` y `server.ts`.
- Commands, puertos y casos de uso separados.
- Gateways de estudiante, solicitud, correo y cargo.
- DTOs de respuesta inferidos desde Zod; DTOs request explicitos.
- Catalogos completos cargados y validados en servidor.
- Presentacion sin repositories ni stores globales de catalogos.
- Precio de tipos `5` y `6` revalidado por el BFF.
- Reglas ESLint acotadas al feature.
- Cargo PDF con textos tipados recibidos desde servidor.

## Dependencias

El feature no importa `solicitud-certificado`. Ambos comparten exclusivamente
`FinData`, politica de voucher, seguridad, infraestructura HTTP y renderer A4.
La adaptacion temporal del correo externo `CONSTANCIA` a `CERTIFICADO` permanece
aislada en el Route Handler hasta que el proveedor incorpore una plantilla propia.

## Pruebas Aniadidas

- Catalogos validos, vacios, foraneos e inconsistentes.
- Relacion escuela-facultad y precio esperado.
- Casos de uso de busqueda de estudiante y lectura de cargo.
- Ausencia real, respuestas mal formadas y error de red.
- Conservacion e invalidacion controlada del pago.
- E2E de monto manipulado bloqueado antes de la API externa.

## Verificacion

| Control | Resultado |
| --- | --- |
| `npm run lint` | Correcto, incluidas las restricciones del feature. |
| `npx tsc --noEmit` | Correcto. |
| Unitarias dirigidas | 35 de 35. |
| `npm run test:unit` | 237 de 237 en 15 archivos. |
| Smoke E2E de constancias | 6 de 6 escenarios correctos. |
| Suite E2E completa | 93 de 93 escenarios correctos. |
| `npm run build` | Correcto con Next.js 16.2.12; 22 paginas generadas. |
| `npm run security:bundle-check` | Correcto; sin secretos privados en `.next/static`. |
| `npm run env:check` | Correcto. |
| `git diff --check` | Correcto; solo avisos LF/CRLF de Windows. |

El primer build fallo por la descarga de Geist bloqueada en el sandbox; la
repeticion con acceso de red termino correctamente. El smoke dirigido y la suite
global emitieron todos sus resultados correctos antes de agotar el timeout durante
el teardown conocido de Playwright en Windows.
