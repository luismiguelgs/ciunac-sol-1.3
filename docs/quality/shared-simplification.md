# Simplificacion de `modules/shared`

## Alcance

Revision pragmatica de codigo transversal, sin cambios de reglas de negocio,
contratos HTTP o diseño visual.

## Cambios

- Eliminado el fetch cliente duplicado de `textos`; certificado, constancia y
  ubicacion inyectan `TEXTO_1_PAGO` desde sus catalogos server-side.
- Eliminados `useTexts`, `useCachedFetch`, el service de textos y el store global
  de catalogos.
- Eliminadas las clases `HttpClient` y `StorageApiRepository`; recursos, correo y
  uploads conservan un unico nivel de adaptacion sobre `lib/api.service.ts`.
- Eliminadas interfaces legacy sin consumidores y exports publicos innecesarios.
- La tabla estatica de precios ya no crea una frontera `use client`.
- Consentimiento final y verificacion de email/OTP se validan de forma declarativa
  en sus schemas compartidos.
- La politica de voucher usa metadata estructural y no depende de `File`.

## Resultado

| Metrica | Antes | Despues |
| --- | ---: | ---: |
| Archivos en `modules/shared` | 24 | 21 |
| Lineas en `modules/shared` | 1061 | 976 |
| Fetch cliente de textos al abrir pago | 1 | 0 |
| Capas para un upload | 4 | 2 |
| Exports/tipos shared sin uso detectados por Knip | 18 | 0 |

Knip sigue informando exports sin consumidores fuera de `modules/shared`. Se
mantienen fuera de este cambio para evitar mezclar features y componentes shadcn
generados.

## Verificacion

- `npm run lint`: correcto.
- `npm run typecheck`: correcto.
- `npm run test:unit`: 233 de 233.
- `npm run test:integration`: 15 de 15.
- Smoke: 33 escenarios pasaron en la ejecucion conjunta; la guarda de ubicacion
  redirigio correctamente pero fallo por un matcher sin tilde. Tras corregir solo
  el test, el escenario paso aislado.
- `npm run test:a11y`: 9 de 9.
- `npm run build`: correcto con acceso de red para Geist; 22 paginas generadas.
- `npm run dead-code:check`: correcto.
- `npm run security:bundle-check` y `npm run env:check`: correctos.
- Auditoria: cuatro excepciones `high` conocidas, cero `critical` y ningun
  hallazgo nuevo.

## Deuda Deliberada

Los formularios OTP conservan composiciones visuales distintas por flujo. No se
extrae otro wrapper hasta que exista un contrato de presentacion equivalente; el
schema y el servicio de seguridad ya son compartidos.

## Paso 7: Consolidacion de Capacidades

Revision 2026-09-25. Tres grupos independientes; no se inicia el cierre general
del paso 8, ni se modifican dependencias, version, diseno, rutas o entorno real.

| Capacidad | Antes | Implementacion consolidada |
| --- | --- | --- |
| Metadata de archivos | Cuatro comprobaciones repetidas | `shared/domain/file-validation.ts` |
| Firmas binarias | Tablas y lecturas repetidas en tres modulos | `shared/infrastructure/server/file-upload-validation.ts` |
| Pago completo | Tres modelos y schemas equivalentes | `shared/domain/payment.ts`, `shared/application/payment.schema.ts` |
| Conversiones de pago | Tres conversiones formulario/dominio y DTO | `payment-form.mapper.ts`, `payment-fields.ts` |
| Transporte del navegador | Recursos/uploads, seguridad y perfil interpretan errores por separado | `shared/infrastructure/http/browser-http.ts` |
| Fachada de recursos | Siete metodos delegadores y alias `apiFetchSafe` | Eliminados; consumidores llaman las funciones CIUNAC |

### Limites Conservados

- Formatos permitidos y limites siguen en las politicas de voucher, becas y ubicacion.
- Precios, perfil, duplicidad, documentos exigidos y datos academicos siguen en su feature.
- FinData, sus validaciones y el contrato HTTP de pago permanecen compartidos.
- Los validadores publicos de archivo se conservan como adaptadores de politica,
  no como nuevas clases, puertos o factories.
- El cliente privado del servidor no se fusiona con el navegador. Se conservan
  API key, `no-store`, sesiones, OTP/CAPTCHA y respuestas seguras del BFF.
- No hay reintentos automaticos, ni se repite persistencia cuando falla el correo.
- No se tocan formatos PDF ni imports diferidos. No se realiza nueva certificacion visual.

### Evidencia y Correcciones

- Base inicial: 406 unitarias, 124 integraciones.
- Archivos: 417 unitarias, 124 integraciones, 113 E2E y build correctos.
  El primer intento E2E detecto metadata perdida al copiar un File con spread:
  corregido mediante lectura explicita y prueba con File nativo antes de continuar.
- Pagos: 431 unitarias, 124 integraciones, 113 E2E y build correctos.
- HTTP: 431 unitarias y 166 integraciones correctas. Un intento de unitarias
  agoto el hook de carga de ESLint (67 omitidas); repeticion completa correcta,
  sin aumentar timeout ni retirar pruebas.
- Cierre HTTP: 113/113 E2E, incluidos 34 smoke y 9 axe, sin omisiones ni flaky.
  Lint sin warnings, tipos (tambien tras build), Knip, build de 22 paginas,
  bundle, entorno y diff-check correctos. Auditoria no aprobada: 1 critical,
  3 high y excepciones vencidas, sin cambios de dependencias.

Se agregan 25 unitarias y 42 integraciones. La regresion incluye acceso, archivos
falsificados, S/ 30, monto manipulado, DTOs, Q10, correo parcial, aceptacion y
descargas de certificados/constancias. La comprobacion del bundle no sustituye
rotacion de claves ni las deudas backend de propiedad de URLs o replay OTP.

La auditoria de dependencias no se renueva ni se corrige mediante este refactor;
sus resultados actuales se registran en la linea base.

### Medicion del Alcance

Conteos sobre los archivos productivos leidos antes de cada grupo, no sobre HEAD
ni el trabajo acumulado de fases anteriores. Incluyen los helpers nuevos; excluyen tests.

| Grupo medido | Archivos antes/despues | Lineas antes/despues |
| --- | --- | --- |
| Modelos, schemas, mappers y validacion de pago afectados | 17 / 21 | 1675 / 1631 |
| Consumidores y transporte HTTP afectados | 9 / 9 | 692 / 511 |

Hay menos logica repetida aunque la extraccion de pagos cree archivos compartidos:
tipos puros, schema, conversion de formulario y DTO tienen consumidores reales y
fronteras distintas. No se usa el numero de archivos como objetivo de calidad.

Pruebas nuevas: `tests/unit/shared/file-validation.test.ts`, ampliacion de
`tests/unit/shared/payment-policy.test.ts` y `tests/integration/browser-http.test.ts`.
Se adaptan los spies de cinco suites a funciones HTTP, sin quitar escenarios.
Las APIs publicas de features, rutas y secuencias del proveedor permanecen estables.

[Verificacion y riesgos](baseline.md#simplificacion-pragmatica-capacidades-compartidas-paso-7).
