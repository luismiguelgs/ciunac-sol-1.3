# Matriz de Seguridad del BFF CIUNAC

## Limites de Implementacion

- `app/api/ciunac/proxy-policy.ts`: allowlist y autorizacion por proposito.
- `app/api/ciunac/proxy-validation.ts`: transporte, uploads y dispatch al
  validador publico de cada feature.
- `modules/security`: OTP, CAPTCHA, cookies cifradas, entorno privado, errores y
  cliente CIUNAC server-only.
- `modules/<feature>/server.ts`: validacion definitiva de cada DTO de negocio.

Un payload de negocio se parsea una sola vez. Una operacion rechazada por sesion,
proposito, origen o contrato no realiza llamadas al proveedor.

## Operaciones Permitidas

| Operacion del navegador | Metodo y ruta | Sesion requerida | Validacion adicional |
| --- | --- | --- | --- |
| Buscar estudiante | `GET estudiantes/buscar/{documento}` | OTP `CERTIFICADO`, `CONSTANCIA` o `UBICACION` | Segmento seguro |
| Crear o actualizar estudiante | `POST estudiantes`, `PATCH estudiantes/{id}` | OTP `CERTIFICADO`, `CONSTANCIA` o `UBICACION` | Email igual a sesion; perfil adicional para ubicacion |
| Consultar duplicidad | `GET solicitudes/documento/{documento}` | OTP `UBICACION` | Solo tipo `7` en la regla de duplicidad |
| Crear certificado | `POST solicitudes` | OTP `CERTIFICADO` | Tipo `1..4`, schema y precio vigente |
| Crear constancia | `POST solicitudes` | OTP `CONSTANCIA` | Tipo `5..6`, schema y precio vigente |
| Crear examen de ubicacion | `POST solicitudes` | OTP `UBICACION` | Tipo `7`, perfil, tarifa S/ 30 y duplicidad |
| Consultar cargo | `GET solicitudes/{id}` | OTP `CERTIFICADO`, `CONSTANCIA` o `UBICACION` | Tipo del cargo igual al proposito |
| Crear beca | `POST solicitudbecas` | OTP `BECA` | Email igual a sesion y DTO estricto |
| Registrar alumno Q10 | `POST q10/estudiantes` | OTP `NUEVO` | Email y programa revalidados |
| Subir voucher | `POST upload/vouchers` | OTP `CERTIFICADO`, `CONSTANCIA` o `UBICACION` | Extension, MIME, tamano y firma |
| Subir identidad | `POST upload/dnis` | OTP `UBICACION` | Extension, MIME, tamano y firma |
| Subir documento academico | `POST upload/becas` | OTP `BECA` o `UBICACION` | Politica PDF seleccionada por proposito |
| Leer documento digital | `GET certificados/solicitud/{id}`, `GET constancias/solicitud/{id}` | Consulta `CERTIFICADO` | Contrato runtime del documento |
| Aceptar documento digital | `PATCH certificados/{id}`, `PATCH constancias/{id}` | Consulta `CERTIFICADO` | DTO de aceptacion estricto |

## Operaciones No Expuestas

- Catalogos como `tipossolicitud`, `idiomas`, `facultades`, `escuelas`, `textos`,
  `ciclos`, `cronogramaubicacion` y `examenesubicacion` se consultan server-side.
- El certificado publico por QR se consulta en Server Component mediante el
  cliente CIUNAC privado, no desde el navegador.
- `detallesubicacion` y los joins de consulta permanecen server-side.
- `mailer`, rutas desconocidas y metodos no declarados siempre se rechazan.

## Codigos

- `401 UNAUTHORIZED`: falta la clase de sesion requerida.
- `403 FORBIDDEN`: existe sesion, pero su proposito no permite la operacion o los
  datos intentan cruzar un flujo.
- `409 PRICE_CHANGED` o `DUPLICATE_REQUEST`: una regla server-side impide crear.
- `502/503`: respuesta externa invalida o proveedor no disponible.

## Limitacion Vigente

La sesion de consulta autentica el flujo, pero el BFF generico todavia no demuestra
que el ID de un certificado o constancia digital pertenezca al DNI consultado. Esa
comprobacion necesita soporte backend o una consulta adicional y no debe resolverse
con confianza en datos enviados por el navegador.
