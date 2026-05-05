# Roadmap de Refactorizacion

## Completado
- Fase 1: linea base tecnica y documentacion inicial.
- Fase 2: piloto `solicitud-certificado`.
- Fase 3: infraestructura compartida HTTP, errores, repositories y mappers.
- Fase 4: replicacion del patron en `solicitud-beca` y `solicitud-ubicacion`.
- Fase 5: politica de estado y catalogos.
- Fase 6: gobierno tecnico, ADRs, SDD y checklist.

## Pendiente recomendado
- Migrar `solicitud-nuevo` al mismo patron de capas.
- Extraer dialogos comunes de procesamiento cuando haya contrato estable.
- Separar generacion de PDF en una capa dedicada por feature.
- Evaluar carga de catalogos en server components.
- Agregar pruebas unitarias a reglas, mappers y casos de uso.
- Automatizar reglas arquitectonicas mas estrictas si el equipo acepta una dependencia especializada.

## Regla de avance
Cada nuevo refactor debe tomar un flujo completo y dejarlo compilando con `lint`, `typecheck` y `build`.
