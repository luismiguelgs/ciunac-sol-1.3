# Reglas Arquitectonicas

## Reglas automatizadas actuales
ESLint bloquea imports peligrosos en:
- `modules/**/domain/**`
- `modules/**/application/**`

Bloqueos iniciales:
- React.
- Next.js.
- componentes UI.
- stores.
- hook legacy `hooks/useStore`.

## Reglas manuales actuales
- `presentation` no debe llamar `fetch`, `apiFetch` ni `apiUpload`.
- `application` debe depender de puertos y comandos.
- `infrastructure` implementa puertos y adapta contratos externos.
- `services/` se conserva como fachada legacy, pero nueva logica debe ir a `modules/**/infrastructure`.

## Excepcion vigente
Las factories dentro de `application/factories` pueden componer gateways concretos mientras no exista un composition root separado. Si esta excepcion crece, mover factories a `presentation` o a un modulo de bootstrap.
