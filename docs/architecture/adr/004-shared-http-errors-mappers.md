# ADR-004 Centralizar HTTP, errores y mappers

## Estado
Aceptado

## Contexto
La integracion con API estaba repartida en `services/`, con payloads construidos cerca de la UI.

## Decision
Introducir infraestructura compartida:
- `AppError`
- `HttpClient`
- repositories API
- mappers `toRequestDTO`

## Consecuencias
- Los `services` legacy quedan como fachada compatible.
- Nueva integracion debe preferir gateways y repositories.
- Los cambios de contrato API impactan primero en mappers e infrastructure.
