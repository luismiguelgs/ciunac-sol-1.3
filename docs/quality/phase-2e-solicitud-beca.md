# Fase 2E: Tipado y Confiabilidad de Solicitud de Beca

Las secciones iniciales son historicas. La revision vigente se encuentra en
[Paso 5: cierre pragmatico](#paso-5-cierre-pragmatico-de-becas).

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

## Simplificacion Pragmatica Posterior

- El command, los dos ports y la clase de caso de uso se sustituyeron por una
  funcion de aplicacion con dependencias inyectables.
- Los gateways de persistencia y correo se consolidaron como funciones en un solo
  adaptador cliente.
- `ScholarshipRequestDto` se infiere desde Zod; `contancia_tercio` permanece como
  parte obligatoria del contrato externo.
- Se retiro la validacion completa durante render y los parses repetidos de los
  mappers. La aplicacion valida antes de integrar y el BFF valida nuevamente la
  entrada no confiable.
- El BFF confirma facultad y escuela contra catalogos vigentes, usa sus nombres
  canonicos y calcula el periodo server-side.
- DNI usa ocho digitos; CE y pasaporte permiten nueve caracteres alfanumericos.
- Zustand se conserva porque el Stepper desmonta pasos y el request ID debe
  sobrevivir para reintentar correo sin repetir persistencia.

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

## Paso 5: Cierre Pragmatico de Becas

Revision del 2026-09-23, aplicacion 1.6.5 y Next.js 16.2.12. Los resultados
anteriores son historicos; este apartado corresponde al paso 5 del plan pragmatico.

La simplificacion funcional anterior ya habia eliminado clases, commands y ports.
No se reescribe esa orquestacion. Modelo, operaciones, validacion y estado quedan
en `model.ts`, `operations.ts`, `schemas.ts` y `store.ts`; UI, hook, formularios y
mapper de formulario quedan en `components/`. El transporte, mapper y schema
externo se agrupan en `infrastructure/`, mientras catalogos, validacion academica
y validacion binaria PDF permanecen en `infrastructure/server/`.

Se conservan 24 archivos: la politica PDF pura en `domain/` y los adaptadores
separados tienen una responsabilidad real. Se retira solo la funcion interior de
reintento que delegaba sin validar ni transformar; `client.ts` conserva su firma
publica y llama directamente al adaptador. No se introducen nuevas abstracciones.

Tres pruebas nuevas reprodujeron la reconstruccion de errores de correo que
perdia `details` y sobrescribia `retryable: false` para red/servicio externo.
El adaptador ahora propaga `AppError` intacto y normaliza solo errores desconocidos.
Tras la correccion pasan las tres pruebas, sin cambiar status o mensajes HTTP.

Diez nuevas integraciones ejercitan la API publica y el transporte real con fetch
simulado: DTO completo con `contancia_tercio`, IDs `_id`/`id`, respuestas vacias,
nulas, incompletas, mal formadas, red y reintento de correo con una sola escritura.
Se conservan las pruebas de cinco PDFs, relacion facultad-escuela y sesion BECA.

Verificacion estatica: lint, type-check, 402 unitarias, 89 integraciones y Knip
correctos. Build con acceso a Google Fonts correcto, 22 paginas generadas;
bundle-check y env-check correctos, sin editar `.env`. `git diff --check` correcto
con la configuracion habitual de Windows. Una comprobacion exploratoria que
deshabilitaba `core.autocrlf` reporto los CRLF previos como whitespace; no se
normalizaron archivos ajenos al cambio.

Primer E2E completo: 109/111; QR publico devolvio un error runtime JSON y el OTP
de beca agoto la espera de navegacion. La repeticion de rutas y becas paso 32/32
sin cambios de codigo, configuracion, timeouts o aserciones. No se da por resuelta
su causa ni se presenta el intento inicial como exito. El cierre de la regresion
completa se registra a continuacion y en la linea base.

No hay cambios productivos en App Router, BFF, shared ni otros features. Se
preservan el diseno, DTO historico, validacion server-side, cinco PDFs y reintento
exclusivo del correo. La propiedad backend de las URLs, entrega SMTP e idempotencia
siguen siendo deudas independientes. No se renuevan excepciones de auditoria.

Cierre E2E: repeticion completa 111/111 en 288.3 segundos, exit 0, sin omisiones,
fallos ni flaky. Incluye los 10 escenarios de beca, 34 smoke y 9 axe. Reporte local:
`%TEMP%/ciunac-step5-beca-e2e-final.json`. No se avanzo a ubicacion hasta obtener
este resultado. Los dos fallos del primer intento permanecen documentados como
intermitencias de causa no confirmada, no como errores corregidos por este refactor.

Auditoria de cierre del 2026-09-24: se detecto y restauro el atributo original
`accept=".pdf"` que el traslado habia tratado como ruta relativa. Playwright
`setInputFiles` no comprueba ese filtro nativo por si solo; la prueba ahora
verifica el atributo de los cinco inputs. La regresion final de ambos features
paso despues de esta correccion: 111/111, exit 0, sin omisiones ni flaky, incluidos
los diez escenarios de beca. El cierre conjunto suma 406 unitarias y 107
integraciones correctas. Lint, type-check posterior al build, Knip, build de 22
paginas, bundle-check, env-check y diff-check tambien pasan. Ver
[linea base](baseline.md#simplificacion-pragmatica-becas-y-ubicacion-paso-5).
