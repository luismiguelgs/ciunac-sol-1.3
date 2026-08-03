# ADR-006 Separar Flujo de Solicitud de Constancias

## Estado
Propuesto

## Contexto
El proyecto ya cuenta con un flujo de solicitud de certificados. Se requiere construir una solicitud de constancias como flujo independiente, aunque comparta patrones funcionales: verificacion de correo, captura de datos, datos de pago, voucher, guardado backend, correo de confirmacion y cargo PDF.

El flujo de certificados solicita el correo desde frontend mediante `EmailService`, pero el Route Handler seguro es el unico que llama al endpoint externo `mailer`. El cargo PDF de certificados se genera en frontend con `@react-pdf/renderer`.

## Decision
Crear constancias como modulo independiente:

```text
modules/solicitud-constancia/
```

Y exponerlo mediante rutas:

```text
app/solicitud-constancias/
```

El cargo PDF de constancias se generara en frontend con `@react-pdf/renderer`. El correo de confirmacion se solicitara al BFF seguro; el navegador no llamara directamente a `mailer`.

## Consecuencias
- Se evita mezclar reglas y pantallas de certificados con constancias.
- Se conserva el patron arquitectonico por feature ya documentado.
- Se facilita evolucion independiente de campos, validaciones, textos, PDF y endpoints.
- Se requiere confirmar contrato backend antes de desarrollo.

## Alternativas Consideradas
- Reutilizar directamente el flujo de certificados: descartado porque acopla dos procesos que pueden evolucionar con reglas distintas.
- Crear solo una variante de UI dentro de certificados: descartado porque dificulta trazabilidad de requisitos y casos de uso.

