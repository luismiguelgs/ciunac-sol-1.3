# Convenciones Arquitectonicas

Vigentes al 2026-09-28. Decision general: [ADR-031](adr/031-pragmatic-feature-architecture.md).
Los pasos 1 a 8 estan completados; los informes anteriores conservan su contexto historico.

## Organizacion por necesidad

```text
modules/<feature>/
  index.ts           UI publica
  client.ts          composicion del navegador, si hace falta
  server.ts          entrada exclusiva de servidor
  model.ts           tipos y reglas puras
  schemas.ts         validacion de la operacion
  operations.ts      orquestacion real
  store.ts           workflow entre pasos
  components/        UI, hooks y schemas de formulario
  infrastructure/   contratos, mappers e integracion externa
```

No crear todos estos archivos de antemano. Consulta de certificado conserva
dominio, contrato externo, servidor y presentacion, sin una operacion delegadora.
Mappers, PDF, politicas de archivo y validadores extensos permanecen separados
cuando tienen una responsabilidad real. No aplanar por aplanar.

## Dependencias y APIs

- Modelos y reglas puras no dependen de React, Next.js, stores ni HTTP.
- Operaciones dependen de modelos y funciones tipadas inyectadas; no de UI o infraestructura.
- Componentes usan operaciones compuestas desde client.ts, modelos y UI compartida.
  No usan fetch, DTOs del proveedor ni credenciales.
- Infraestructura valida unknown y traduce contratos externos a modelos internos.
- index.ts expone UI browser-safe; server.ts lleva import de server-only.
  App Router y BFF usan estas APIs publicas, nunca rutas internas.
- client.ts y server.ts conectan implementaciones con operaciones. No crear
  factories o ports adicionales que repitan el mismo contrato.
- Los features no importan internals de otros. El contexto comun de consultas
  se consume mediante consultas/index.ts o consultas/server.ts.
- Shared y security no contienen reglas ni imports de features de negocio.

[Reglas efectivas](architecture-rules.md) documenta los limites, 67 pruebas de
ESLint y sus limitaciones. El analisis estatico no reemplaza controles runtime.

## Datos, estado y errores

- React Hook Form conserva la edicion local; Zustand conserva workflows entre pasos.
  Los cinco stores estan junto a cada feature y exponen reset.
- Los catalogos se cargan en servidor y se pasan por props. Los stores globales
  de catalogos fueron retirados; no recrearlos sin necesidad demostrada.
- Estado visual efimero vive en componentes/hooks. Estado de registro, referencia
  guardada y fallo parcial viven en el workflow, no en flags contradictorios.
- Validar formulario, operacion al enviar y BFF como frontera no confiable.
  No ejecutar el parse completo de la solicitud en cada render.
- Inferir DTOs de schemas cuando sean el mismo contrato. Mantener mappers donde
  existan nombres, fechas, aliases o modelos diferentes; no crear un Command vacio.
- Distinguir ausencia legitima, error tecnico y resultado de escritura indeterminado.
  Conservar categoria, status, correlationId y retryable.
- Despues del guardado parcial, reintentar solo correo. Un HTTP aceptado no
  significa entrega SMTP. No reintentar escrituras automaticamente.

## Compartir solo contratos estables

Archivo: metadata/firma comunes; formato y limite decididos por cada politica.
Pago: FinData, schema, modelo y conversiones comunes; tarifa y descuentos del feature.
PDF: renderer A4 comun; textos, titulos y reglas del feature; carga bajo demanda.
HTTP: transporte browser comun, prefijo CIUNAC en lib/api.service; cliente privado
del servidor separado. OTP, CAPTCHA y comprobante de correo no son dominio academico.

Compartir requiere consumidores reales y comportamiento equivalente, no parecido
visual. No crear un workflow generico ni mover reglas de un solo feature a shared.
Nunca guardar datos personales en cache global. La propuesta de cache de catalogos
no esta implementada y no debe describirse como disponible.

## Agregar o cambiar un feature

1. Definir el flujo observable, contrato externo y casos negativos.
2. Crear solo UI, reglas e integracion necesarias; agregar operaciones si coordinan pasos.
3. Reutilizar capacidades existentes sin importar internals de otro feature.
4. Probar contratos y escenarios, incluidos error, vacio, permisos y reintento.
5. Actualizar trazabilidad y SDD si cambia el diseno; ADR solo si cambia una decision.

Antes de cerrar: lint, type-check, unitarias, integracion, Knip, smoke, accesibilidad,
regresion, build, bundle, entorno y diff-check. Auditoria y npm ls tambien se revisan.
Un fallo de herramienta se informa como bloqueo; una excepcion vencida no aprueba el gate.
Usar el [checklist](review-checklist.md), sin generar documentos por cada movimiento.
