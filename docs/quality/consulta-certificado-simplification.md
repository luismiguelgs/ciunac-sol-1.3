# Simplificacion de Consulta de Certificado

## Alcance

Simplificar exclusivamente la consulta publica por QR sin modificar rutas,
contrato HTTP, diseño ni naturaleza publica de solo lectura.

## Cambios

- Se eliminaron `GetCertificateDetailUseCase`, su puerto y el repository de clase.
- `server.ts` concentra validacion del ID, consulta segura, ausencia y ordenamiento.
- Schema y mapper forman ahora un unico contrato externo cohesivo.
- El contrato elimina propiedades desconocidas y comprueba la correspondencia del
  ID solicitado con el devuelto.
- El dominio publico dejo de transportar tipo, solicitud y periodo no usados.
- Presentacion usa el idioma explicito proporcionado por el certificado.
- ESLint conserva API publica y limites de dominio, infraestructura y presentacion
  sin exigir una capa application vacia.

## Seguridad Conservada

- API key privada y ejecucion server-only.
- `no-store`, timeout y path seguro en el cliente CIUNAC.
- ID con lista blanca, Zod, minimizacion de datos y errores publicos genericos.
- `noindex, nofollow`, lectura sin mutaciones y ausencia de llamadas del navegador
  al proveedor.

Los controles pendientes de entropia del ID, rate limiting distribuido y
clasificacion de datos publicos se registran en ADR-027.

## Verificacion

- Lint y type-check correctos.
- Unitarias: 231 de 231.
- Integracion: 15 de 15.
- Smoke E2E de consultas: 22 de 22 escenarios correctos antes del bloqueo conocido
  del teardown de Playwright en Windows.
- Build de produccion correcto con acceso de red para Geist.
- Knip, bundle-check, env-check y `git diff --check` correctos.
