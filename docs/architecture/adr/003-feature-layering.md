# ADR-003 Capas internas por feature

## Estado
Aceptado

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
