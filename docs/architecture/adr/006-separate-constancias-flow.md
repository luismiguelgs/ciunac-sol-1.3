# ADR-006 Separar Flujo de Solicitud de Constancias

## Estado
Aceptado e implementado

Complementado por ADR-022 para los limites modulares y APIs publicas.

## Contexto
El proyecto ya cuenta con un flujo de solicitud de certificados. Se requiere construir una solicitud de constancias como flujo independiente, aunque comparta patrones funcionales: verificacion de correo, captura de datos, datos de pago, voucher, guardado backend, correo de confirmacion y cargo PDF.

El Route Handler seguro es el unico que llama al endpoint externo `mailer`. El cargo PDF se genera en frontend con `@react-pdf/renderer`.

## Decision
Crear constancias como modulo independiente:

```text
modules/solicitud-constancia/
```

Y exponerlo mediante rutas:

```text
app/solicitud-constancias/
```

El cargo PDF de constancias se genera en frontend con `@react-pdf/renderer`. El correo de confirmacion se solicita al BFF seguro; el navegador no llama directamente a `mailer`.

El estado, validacion basica, caso de uso, adaptadores, PDF y navegacion pertenecen al slice de constancias. La capacidad de pago se comparte mediante un unico `FinData` y un unico `finInfoSchema`; los precios se inyectan como `PaymentOption[]` y no se calculan en el componente.

Constancias usa el endpoint existente `solicitudes` con tipos `5` y `6`. Mientras el proveedor no tenga una plantilla propia, el BFF adapta `CONSTANCIA` a `CERTIFICADO` solo en la llamada externa y conserva `CONSTANCIA` en el contrato y comprobante internos.

## Consecuencias
- Se evita mezclar reglas y pantallas de certificados con constancias.
- Se conserva el patron arquitectonico por feature ya documentado.
- Se facilita evolucion independiente de campos, validaciones, textos, PDF y endpoints.
- Se evita duplicar la politica de voucher y el servicio de carga.
- Permanece una compatibilidad temporal con la plantilla de correo de certificados.

## Alternativas Consideradas
- Reutilizar directamente el flujo de certificados: descartado porque acopla estado, registro, PDF y navegacion de procesos que pueden evolucionar distinto.
- Crear solo una variante de UI dentro de certificados: descartado porque dificulta trazabilidad de requisitos y casos de uso.
- Duplicar todo el paso de pago: descartado porque la politica de voucher es comun y estable; solo varian precio, descuentos y reglas posteriores.

