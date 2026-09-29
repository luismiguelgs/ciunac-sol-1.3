# ADR-028 Limites pragmaticos para `modules/shared`

## Estado

Aceptado el 2026-08-31. Ampliado el 2026-09-25 (paso 7).

## Contexto

`modules/shared` acumulaba tipos sin consumidores, un cache cliente para un texto
ya cargado en servidor y varias clases que delegaban sin transformar datos ni
proteger una frontera. Esa estructura aumentaba archivos e imports, pero no
reducía el acoplamiento ni mejoraba la capacidad de prueba.

## Decision

- Compartir solo capacidades usadas por varios features con contrato estable.
- Pasar catalogos ya resueltos por Server Components mediante props.
- Mantener un transporte HTTP del navegador para JSON y multipart; `lib/api.service.ts`
  fija el prefijo CIUNAC y diferencia datos obligatorios, ausencia y comandos.
  No se unifica con el transporte privado del servidor.
- Evitar clases sin estado, factories y repositories que solo reenvian argumentos.
- Mantener validaciones comunes en Zod y reglas puras de archivos sin depender de
  tipos del navegador.
- No unificar componentes OTP, layouts o flujos por similitud visual mientras sus
  contratos y responsabilidades no sean equivalentes.

## Consecuencias

- `modules/shared` se reduce de 24 a 21 archivos y de 1061 a 976 lineas.
- El paso de pago deja de consultar `textos` en el navegador.
- La tabla de precios vuelve a ser Server Component.
- Se eliminan fachadas HTTP/storage redundantes y tipos legacy.
- Los features siguen siendo responsables de precios, textos, payloads y reglas
  posteriores al pago.
- Una futura extraccion debera demostrar consumidores reales y una API estable.

## Consolidacion del Paso 7

- `shared/domain/file-validation.ts` comprueba metadata con una politica recibida.
  `shared/infrastructure/server/file-upload-validation.ts` agrega la firma binaria.
  Becas, identidad, certificado academico y voucher conservan sus formatos y limites.
- Pago comparte modelo puro, schema de aplicacion, conversion de formulario y campos
  DTO. Las tarifas, descuentos, perfil y reglas de solicitud no pasan a shared.
- Se elimina la fachada de recursos. Se conserva el adaptador de correo porque
  transforma una notificacion aceptada en un comprobante, no una llamada HTTP libre.
- Las cifras anteriores son historicas; la extraccion se mide por implementaciones
  duplicadas retiradas, no por forzar menos archivos. No se agrega una clase, port,
  factory ni un nuevo flujo generico.

Evidencia: [capacidades compartidas](../../quality/shared-simplification.md#paso-7-consolidacion-de-capacidades).
