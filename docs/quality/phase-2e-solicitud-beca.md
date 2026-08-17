# Fase 2E: Tipado y Confiabilidad de Solicitud de Beca

## Alcance

La fase se limita al registro de beca, sus cinco documentos, catalogos academicos,
persistencia y correo. No introduce pago, voucher, cargo ni PDF generado.

## Cambios Implementados

- Dominio `SolicitudBeca` separado de formularios y API.
- Workflow Zustand sin `Partial`, casts ni setters `unknown`.
- DTO exacto con validacion runtime de IDs y respuestas externas.
- Catalogos de facultades y escuelas obtenidos en servidor mediante `Promise.all`.
- Mapper que valida que la escuela pertenezca a la facultad seleccionada.
- Resumen propio de beca sin dependencia de `consulta-solicitud`.
- Resultado parcial y reintento exclusivo del correo.
- Estados de ruta para carga, error y finalizacion no encontrada.
- Validacion PDF cliente y server-side por ausencia, 8 MiB, extension, MIME y firma `%PDF-`.
- Correccion de textos visibles con codificacion danada dentro del flujo.

## Dependencias Eliminadas

- `ISolicitudBeca` y el store `Partial`.
- Mapper compartido `toSolicitudBecaRequestDto`.
- Fachada `SolicitudesService.newBeca`.
- Fachada `EmailService.sendEmailBeca`.
- Rama de beca dentro de `DetalleSolicitudCard`.

## Deuda Pendiente

- El backend externo debe validar que cada URL cargada pertenece al usuario y al flujo vigente.
- El proveedor de correo no ofrece idempotencia confirmada ni garantia de entrega SMTP.
- El lifecycle de Playwright en Windows y la descarga de Google Fonts siguen siendo deuda transversal.

## Refactor Modular Posterior

- Se incorporan APIs públicas `index.ts`, `client.ts` y `server.ts`.
- La factory que importaba infraestructura desde application queda retirada.
- Los schemas de formulario viven en presentation y el schema del command en
  application.
- Solo el request DTO permanece manual; respuestas y catálogos se infieren desde
  Zod.
- La política PDF usa metadatos neutrales y códigos de dominio, sin depender de
  `File` ni de mensajes de UI.
- App Router y el BFF dejan de importar rutas internas del feature.
- ESLint aplica límites de dependencias únicamente a `solicitud-beca`.
- Se añade validación de coherencia entre escuelas y facultades.

### Verificación Modular

| Comprobación | Resultado |
| --- | --- |
| `npm run lint` | Correcto, incluidas las restricciones por capa. |
| `npx tsc --noEmit` | Correcto. |
| Unitarias dirigidas | 31 de 31. |
| `npm run test:unit` | 229 de 229 pruebas. |
| Smoke E2E de beca | 9 de 9 escenarios correctos. |
| Suite E2E completa | 92 de 92 escenarios correctos. |
| `npm run build` | Correcto; 22 páginas generadas. |
| Bundle y entorno | Correctos; no se detectaron secretos en cliente. |

Playwright emitió todos los resultados correctos y luego agotó el timeout durante
el teardown conocido en Windows. El primer build no pudo descargar Geist dentro
del sandbox; la repetición con acceso de red autorizado terminó correctamente.

## Verificacion

| Comprobacion | Resultado |
| --- | --- |
| `npm run lint` | Correcto, sin errores ni warnings. |
| `npx tsc --noEmit` | Correcto. |
| `npm run test:unit` | 131 de 131 pruebas en 12 archivos. |
| Smoke E2E de beca | Los 8 escenarios alcanzaron su resultado esperado; el runner agoto el timeout despues del ultimo escenario por el lifecycle de sus servidores en Windows. |
| Suite E2E completa | 60 de 60 escenarios reportados como aprobados antes del ajuste final del schema BFF; el smoke de beca se repitio despues del ajuste. |
| `npm run build` | Correcto; 21 paginas generadas. |
| `npm run security:bundle-check` | Correcto; no se detectaron secretos privados en `.next/static`. |
| `npm run env:check` | Correcto; configuracion requerida presente y `NEXT_PUBLIC_API_KEY` ausente. |
| `git diff --check` | Correcto; solo advertencias LF/CRLF propias de Windows. |

El primer build no pudo descargar Geist y Geist Mono debido a la restriccion de red
del sandbox. La repeticion autorizada del mismo comando compilo correctamente, sin
cambios en fuentes ni configuracion. Durante E2E, `next/font` utilizo su fallback de
desarrollo por la misma restriccion.
