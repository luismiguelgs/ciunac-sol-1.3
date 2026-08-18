# Auditoria de Dependencias

## Estado al 2026-08-17

- `npm ls --depth=0`: sin dependencias extraneous o faltantes.
- Auditoria de produccion: cuatro advisories altos conocidos y ninguno critico.
- Baseline versionada: `docs/quality/dependency-audit-baseline.json`.
- Vencimiento de excepciones: `2026-09-17`.

`npm run audit:dependencies` bloquea vulnerabilidades altas o criticas nuevas y
excepciones que sigan presentes despues del vencimiento. El JSON completo se
genera en `test-results/dependency-audit.json` y no se versiona.

## Accion Pendiente

Actualizar Next.js en un cambio aislado a una version estable corregida y
verificada, ejecutar todos los gates y eliminar los advisories resueltos de la
baseline. No se debe ejecutar `npm audit fix --force` porque podria introducir una
migracion de framework no controlada.
