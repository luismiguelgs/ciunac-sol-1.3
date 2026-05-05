# ADR-002 Refactorizacion incremental por feature

## Estado
Aceptado

## Contexto
El proyecto tenia organizacion por modulos, pero los componentes mezclaban UI, reglas, API, estado y navegacion.

## Decision
Refactorizar por flujos completos, empezando por `solicitud-certificado` y replicando el patron en `solicitud-beca` y `solicitud-ubicacion`.

## Consecuencias
- La entrega puede avanzar sin reescritura total.
- Cada flujo refactorizado deja un patron reusable.
- Las extracciones a `shared` se hacen despues de comprobar repeticion real.
