# Fase 2G: Tipado y Confiabilidad de Alumno Nuevo

Las secciones iniciales conservan la evidencia historica de la Fase 2G. El estado
actual se registra en [Simplificacion pragmatica: paso 4](#simplificacion-pragmatica-paso-4-alumno-nuevo).

## Alcance

La fase se limita al flujo de alumno nuevo, programas Q10, OTP, registro, correo y
finalizacion. No modifica pagos, vouchers, documentos, PDF ni otros features.

## Cambios Implementados

- Dominio `NewStudent` separado del formulario y del DTO Q10.
- Workflow Zustand discriminado sin `Partial` ni setters `unknown`.
- DTOs, schemas runtime y mappers para programas, registro y respuesta Q10.
- Catalogo cargado y validado server-side con estado vacio y error diferenciados.
- Programa y email revalidados en el BFF antes de escribir.
- Email autoritativo obtenido de la sesion OTP `NUEVO`.
- Respuesta Q10 `204` u objeto normalizada como comando exitoso.
- Respuesta mal formada detenida antes del correo.
- Resultado parcial y reintento exclusivo del correo.
- Escritura indeterminada bloqueada para evitar registros duplicados.
- Selector de programas propio, eliminando la dependencia shared hacia el feature.
- Pagina final sin estado de exito falso cuando falta comprobante.
- Estado de ruta `loading.tsx` y correccion de textos del flujo.

## Dependencias Eliminadas

- Interfaces Q10 usadas como modelo de formulario y store.
- `setStudentField(..., unknown)` y store `student.store.ts`.
- Metodos Q10 y `REGISTER` en las fachadas legacy de estudiantes y correo.
- Mapper compartido que importaba una interfaz de alumno nuevo.
- Uso de `SelectLanguage` para representar programas Q10.

## Dependencias Que Permanecen

- OTP, CAPTCHA, sesion verificada y comprobante de notificacion.
- Cliente HTTP, repositories y `AppError` transversales.
- Endpoint externo `q10/estudiantes` y consulta Q10 de programas.
- Stepper, campos de formulario, dialogo y componentes shadcn existentes.

## Pruebas Agregadas

- Pruebas unitarias de dominio, formularios, DTO, mapper, catalogo, gateway,
  respuesta Q10, workflow y caso de uso.
- 10 smoke E2E para OTP, flujo completo, `204`, respuesta mal formada, correo,
  manipulacion de email y programa, catalogo vacio/invalido y finalizacion sin recibo.

## Deuda Pendiente

- Q10 no proporciona idempotencia confirmada para el registro.
- La consulta de programas permanece limitada a 30 elementos.
- Las exclusiones `2026`, `kids` y `juniors` requieren validacion funcional.
- El comprobante de correo no confirma entrega SMTP.
- Playwright completa los escenarios pero mantiene pendiente su teardown en Windows.

## Verificacion

| Comprobacion | Resultado |
| --- | --- |
| Lint | Correcto, sin errores ni warnings. |
| Type-check | Correcto. |
| Pruebas unitarias | 191 de 191 pruebas en 14 archivos. |
| Smoke E2E de alumno nuevo | 10 de 10 escenarios alcanzaron el resultado esperado. |
| Prueba de ruta final sin comprobante | Correcta; muestra `Estado no confirmado`. |
| Build de produccion | Correcto con Next.js 16.2.12 y 21 paginas generadas. |
| Revision del bundle | Correcta; no se detectaron secretos privados. |
| Validacion de entorno | Correcta; configuracion privada presente y clave publica expuesta ausente. |
| Revision del diff | Correcta; solo advertencias LF/CRLF de Windows. |

Playwright reporta los resultados funcionales, pero el proceso conserva el bloqueo
de teardown de Next.js en Windows y puede agotar el timeout despues de terminar las
pruebas. Este problema transversal no afecta el resultado individual de los
escenarios y permanece documentado como deuda tecnica.

Los resultados finales se registran tambien en `docs/quality/baseline.md`.

## Refactor Modular Posterior

ADR-024 consolida el feature con APIs publicas `index.ts`, `client.ts` y
`server.ts`. La factory que componia infraestructura desde aplicacion fue retirada;
los schemas quedaron en la capa correspondiente y el BFF dejo de importar internals.
El detalle y las verificaciones se registran en
`docs/quality/solicitud-nuevo-modular-refactor.md`.

## Simplificacion Pragmatica: Paso 4, Alumno Nuevo

Fecha: 2026-09-23. Aplicacion 1.6.5, Next.js 16.2.12; sin actualizaciones de
dependencias. Este cambio completa el paso 4 despues de constancias. No inicia
el paso 5 ni modifica rutas, BFF, shared, diseno o contratos externos.

### Estructura y alcance

El feature pasa de 25 a 21 archivos y de tres clases delegadoras a cero. Se
conservan las responsabilidades, pero no una carpeta por cada intermediario:

```text
modules/solicitud-nuevo/
  index.ts, client.ts, server.ts
  model.ts, schemas.ts, operations.ts, store.ts
  components/
    formularios, proceso, resumen, registro, hook y mapper de formulario
  infrastructure/
    new-student-client.ts
    q10-api.mapper.ts
    q10-api.schemas.ts
    server/
      new-student-request-validation.ts
      q10-program.repository.ts
```

- `operations.ts` contiene registro y reintento de correo con funciones inyectables;
  sustituye command, ports y clase delegadora sin cambiar la secuencia de llamadas.
- `new-student-client.ts` integra Q10 y notificaciones. El request DTO se infiere
  del schema Zod existente; el mapper conserva todos los nombres y codigos Q10.
- La confirmacion construye el modelo mediante guardas tipadas, sin ejecutar un
  parse completo durante render. Formularios, registro y BFF conservan sus
  validaciones en las fronteras correspondientes.
- Zustand y el hook mantienen el estado entre pasos y el bloqueo de una segunda
  escritura ante respuestas indeterminadas. No se agrega otra abstraccion shared.
- Los errores de correo conservan codigo, status, correlationId y retryable;
  los errores desconocidos usan un mensaje publico seguro.

Las APIs publicas siguen siendo `NewStudentProcess`,
`registerNewStudent({ student })`, `retryNewStudentNotification(documentNumber)`,
`getNewStudentPrograms()` y `validateNewStudentRequest(request, body)`.
Se mantienen `server-only`, OTP `NUEVO`, email de sesion como autoridad y
revalidacion del programa en servidor.

El contrato Q10 existente acepta 204, un HTTP exitoso sin cuerpo (incluido 200)
o un objeto JSON. JSON null, arreglos, primitivos y JSON mal formado no habilitan
el correo. No se reintenta automaticamente una escritura de resultado ambiguo.
Tras un fallo de correo, el documento guardado permite reintentar exclusivamente
la notificacion, sin volver a registrar al estudiante.

La comparacion SHA-256 con el inventario previo confirma cero cambios productivos
fuera de `modules/solicitud-nuevo`. Solo se adaptan cuatro archivos de pruebas y
la documentacion. Las APIs no tienen nuevos imports profundos externos ni cruces
con certificados o constancias.

### Cobertura y verificacion

Se agregan 12 casos unitarios, 17 integraciones del pipeline mediante la API publica
y fetch simulado, y un E2E de perdida de red que comprueba el bloqueo de reenvio.
Las pruebas existentes se adaptan a funciones; no se suprimen escenarios.

Las integraciones comprueban el DTO exacto, respuestas Q10 vacias/objetos/invalidas,
errores HTTP y de red, metadata del error de correo, recibo ausente y reintento
sin una segunda escritura. Los E2E usan proveedores simulados, no el backend real.

| Comprobacion | Resultado final |
| --- | --- |
| Lint | Correcto |
| Type-check | Correcto, tambien despues del build |
| Unitarias | 399/399; 34 del feature, 43 dirigidas junto con registro compartido |
| Integracion | 79/79, incluidas 17 nuevas de alumno nuevo |
| E2E dirigido antes del traslado de archivos | 11/11, exit 0 |
| Regresion completa despues del traslado | 111/111 en 315.4 s, exit 0; sin omisiones, fallos ni flaky |
| Smoke y accesibilidad | 34/34 y 9/9 incluidos en la regresion completa |
| Alumno nuevo en la regresion completa | 11/11 |
| Build de produccion | Correcto con acceso de red; 22 paginas generadas |
| Knip | Correcto |
| Bundle-check | Sin valores privados configurados en `.next/static` |
| Env-check | Correcto, sin imprimir valores; API key publica antigua ausente |
| Diff-check | Correcto; avisos informativos LF/CRLF del worktree existente |

La regresion usa `node node_modules/@playwright/test/cli.js test --reporter=json`
sin filtros, con los servidores de pruebas independientes en 3100/4100 y las
fixtures habituales. No se modifican timeouts, aserciones ni configuracion para
evitar el teardown administrado de Windows. El reporte local es
`%TEMP%/ciunac-step4-new-student-e2e-final.json`.

### Limites y cierre

- Q10 sigue sin idempotencia confirmada. El bloqueo del formulario no es una
  garantia persistente frente a recarga o reinicio de sesion.
- El limite de 30 programas y los filtros `2026`, `kids` y `juniors` siguen intactos
  y pendientes de validacion funcional.
- El comprobante de correo confirma aceptacion HTTP, no entrega SMTP.
- Google Fonts requiere red para el build; el teardown administrado de Playwright
  en Windows permanece como riesgo de tooling, no resuelto en este cambio.
- No se actualizan ni renuevan las excepciones de auditoria vencidas el 2026-09-17.
  Esta verificacion no se presenta como auditoria de dependencias aprobada.

Paso 4 completo: constancias y alumno nuevo simplificados y verificados. Los pasos
5 a 8 del plan permanecen pendientes. ADR-024, SDD, convenciones, contratos,
trazabilidad y linea base reflejan este cambio; no se crea otro ADR ceremonial.
