# Fase 2G: Tipado y Confiabilidad de Alumno Nuevo

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
