# ADR-003 Capas internas por feature

## Estado
Parcialmente reemplazado el 2026-09-28 por
[ADR-031](031-pragmatic-feature-architecture.md).
La separacion de responsabilidades permanece; las cuatro carpetas siguientes
describen la decision inicial y ya no son una plantilla obligatoria.

## Contexto
Los modulos necesitaban limites mas claros para mejorar mantenibilidad y pruebas.

## Decision
Adoptar cuatro capas internas por feature:
- `presentation`
- `application`
- `domain`
- `infrastructure`

## Consecuencias
- `presentation` maneja UI y eventos.
- `application` orquesta casos de uso.
- `domain` contiene reglas puras.
- `infrastructure` integra APIs y adapta DTOs.
- ESLint bloquea dependencias peligrosas desde `domain` y `application`.
