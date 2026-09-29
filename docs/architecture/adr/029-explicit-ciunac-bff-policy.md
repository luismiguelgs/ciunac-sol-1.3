# ADR-029: Politica Explicita del BFF CIUNAC

- Estado: Aceptado
- Fecha: 2026-08-31
- Alcance: `app/api/ciunac/[...path]`

## Contexto

El proxy CIUNAC ocultaba la API key y validaba payloads, pero su autorizacion se
expresaba con categorias amplias como `verified`, `consultation` y `either`. Una
sesion OTP valida podia intentar operaciones pertenecientes a otro flujo y varias
rutas de catalogos o lecturas server-side seguian incluidas en la allowlist del
navegador sin consumidores confirmados.

El Route Handler tambien resolvia sesiones mas de una vez y ejecutaba validadores
de certificado, constancia y ubicacion sobre una misma solicitud. Esto aumentaba
la complejidad y permitia que la seguridad dependiera de retornos silenciosos de
validadores no aplicables.

## Decision

- Resolver cada combinacion metodo/ruta a una operacion explicita en
  `app/api/ciunac/proxy-policy.ts`.
- Leer una sola vez las sesiones OTP y de consulta por request.
- Exigir un proposito exacto antes de parsear o reenviar operaciones sensibles.
- Asociar tipos `1..4` con `CERTIFICADO`, `5..6` con `CONSTANCIA` y `7` con
  `UBICACION`.
- Ejecutar un solo validador de solicitud segun el proposito OTP.
- Mantener el dispatch y los contratos de transporte en
  `app/api/ciunac/proxy-validation.ts`; cada feature devuelve su DTO ya parseado
  desde su API publica `server.ts`.
- Comparar el email de estudiantes y becas con el email verificado.
- Validar que el tipo del cargo corresponda al flujo activo antes de devolverlo.
- Limitar documentos digitales a sesiones de consulta `CERTIFICADO`.
- Retirar del proxy de navegador catalogos y lecturas que solo tienen consumidores
  server-side. Sus URLs externas y el cliente server-only no cambian.
- Mantener `mailer` y cualquier ruta desconocida fuera de la allowlist.

## Consecuencias

La API publica del navegador conserva las URLs que usan los features, pero una
cookie valida ya no equivale a autorizacion general. Los rechazos por ausencia de
sesion son `401`; los propositos cruzados son `403` y no alcanzan al proveedor.

La API key continua agregandose exclusivamente en `ciunacRequest`. Los catalogos,
la consulta publica por QR y los joins de consulta permanecen server-side.

La comprobacion de propiedad por DNI de certificados y constancias digitales no
se resuelve aqui. Requiere un endpoint especializado o una lectura adicional del
backend y queda registrada como trabajo de seguridad independiente.

## Alternativas Descartadas

- Mantener `either`: simplifica la tabla, pero no expresa que la consulta digital
  requiere una sesion distinta de los flujos OTP.
- Crear un Route Handler por cada recurso: haria explicitos los limites, pero
  duplicaria transporte, errores y forwarding sin aportar valor inmediato.
- Mover catalogos al proxy publico con cache: queda fuera de esta fase y ampliaria
  innecesariamente la superficie del navegador.

## Verificacion

- Matriz unitaria metodo/ruta/proposito.
- Integracion directa del Route Handler con sesiones cifradas y `fetch` simulado.
- Casos negativos de proposito cruzado, email manipulado y cargo de otro flujo.
- Smoke E2E de certificado, constancia, beca, ubicacion y alumno nuevo.
- Comprobacion de secretos en el bundle cliente.
