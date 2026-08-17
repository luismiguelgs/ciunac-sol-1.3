# Refactor Modular de Solicitud de Alumno Nuevo

## Alcance

La intervencion se limita a fronteras modulares de `solicitud-nuevo`. No modifica
el flujo de tres pasos, el diseño, OTP, CAPTCHA, reglas Q10, correo ni finalizacion.

## Clasificacion Final

| Capa | Responsabilidad |
| --- | --- |
| Dominio | Alumno, documento, datos basicos y programa. |
| Aplicacion | Command, puertos, validacion y caso de uso de registro. |
| Infraestructura | DTO request, schemas externos, mappers, gateways y catalogo Q10. |
| Presentacion | Componentes, hook, FormModel y workflow Zustand. |
| Composition roots | `client.ts` para navegador y `server.ts` para servidor. |

## Dependencias Eliminadas

- Factory de aplicacion que instanciaba infraestructura.
- Imports profundos desde App Router y el BFF.
- Dependencia de `modules/security` hacia un schema interno del feature.
- Schema OTP duplicado y DTOs manuales de respuestas Q10.
- Directorio superior de schemas con responsabilidades mezcladas.

## Dependencias Que Permanecen

- OTP, CAPTCHA, sesion verificada y comprobante de notificacion compartidos.
- `AppError`, repositories HTTP, Stepper, formularios y shadcn.
- `API_KEY_Q10`, catalogo remoto y endpoint `q10/estudiantes`.
- Zustand y React Hook Form dentro de presentacion.

## API Publica

- `@/modules/solicitud-nuevo`: wizard de presentacion.
- `@/modules/solicitud-nuevo/client`: registro y reintento de correo.
- `@/modules/solicitud-nuevo/server`: catalogo, schema Q10 y validacion BFF.

## Deuda Pendiente

- Q10 no garantiza idempotencia para altas con resultado de red indeterminado.
- La consulta de programas permanece limitada a 30 elementos.
- Las exclusiones por resolucion, `2026`, `kids` y `juniors` requieren validacion
  funcional.
- La pantalla OTP conserva presentacion propia; solo el contrato y schema son
  compartidos.
- El comprobante de correo confirma aceptacion HTTP, no entrega SMTP.

## Verificacion

| Comprobacion | Resultado |
| --- | --- |
| Lint | Correcto, incluidas las restricciones del feature. |
| Type-check | Correcto. |
| Unitarias dirigidas | 31 de 31. |
| Suite unitaria completa | 238 de 238 en 15 archivos. |
| Smoke E2E de alumno nuevo | 10 de 10 escenarios correctos. |
| Suite E2E completa | 93 de 93 escenarios correctos. |
| Build | Correcto con Next.js 16.2.12 y 22 paginas generadas. |
| Bundle de cliente | Correcto; no contiene secretos privados configurados. |
| Entorno | Correcto; variables privadas presentes y clave publica antigua ausente. |
| Diff | Correcto; solo avisos informativos LF/CRLF de Windows. |

El build inicial no pudo descargar Geist dentro del sandbox; la repeticion con
acceso de red termino correctamente. Los runners E2E imprimieron todos los
resultados correctos y luego quedaron abiertos durante el teardown conocido de
Next.js en Windows, por lo que se interrumpieron despues del ultimo escenario.
