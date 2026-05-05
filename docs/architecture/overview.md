# Arquitectura del Frontend CIUNAC

## Estado actual
- Aplicacion Next.js 16 con App Router.
- UI basada en `shadcn/ui`, React Hook Form y Zod.
- Organizacion principal por modulos de negocio en `modules/`.
- Estado local y de flujo con Zustand.
- Integracion con API externa mediante `services/` y `lib/api.service.ts`.

## Problemas detectados
- Los componentes de UI mezclan render, orquestacion, side effects y persistencia.
- Los modelos de formulario, dominio e integracion con API se reutilizan de forma ambigua.
- Hay duplicacion estructural entre `solicitud-certificado`, `solicitud-beca` y `solicitud-ubicacion`.
- La documentacion tecnica del repositorio era insuficiente para sostener decisiones de largo plazo.

## Arquitectura objetivo
Cada feature debe evolucionar hacia cuatro capas internas:

```text
modules/<feature>/
  presentation/
  application/
  domain/
  infrastructure/
```

## Reglas base
- `presentation` puede coordinar eventos de UI, pero no construir payloads HTTP.
- `application` define casos de uso y orquesta dependencias.
- `domain` no conoce `fetch`, router, componentes ni librerias de infraestructura.
- `infrastructure` adapta APIs externas, DTOs y mappers.
- `modules/shared` contiene solo piezas realmente transversales.

## Flujo piloto implementado
`solicitud-certificado` se usa como slice vertical inicial:
- `presentation/components/solicitud-certificado-process.tsx`
- `presentation/hooks/use-register-solicitud-certificado.ts`
- `domain/rules/*`
- `application/use-cases/register-solicitud-certificado.use-case.ts`
- `application/ports/register-solicitud-certificado.ports.ts`
- `infrastructure/api/*`
- `infrastructure/mappers/*`

El componente `register.tsx` queda enfocado en estado visual, submit y navegacion final.

El mismo patron ya se replico en:
- `solicitud-beca`
- `solicitud-ubicacion`

## Duplicaciones prioritarias a reducir
- Secuencia guardar entidad -> guardar solicitud -> enviar correo.
- Dialogos de carga/error/finalizacion.
- Generacion y descarga de cargos PDF.
- Carga de catalogos y persistencia temporal por sesion.

## Gobierno tecnico
- Las decisiones se documentan como ADRs en `docs/architecture/adr/`.
- El SDD se mantiene en `docs/architecture/sdd.md`.
- Las revisiones usan `docs/architecture/review-checklist.md`.
- La estrategia de pruebas vive en `docs/architecture/testing-strategy.md`.
- Las reglas de dependencia se resumen en `docs/architecture/architecture-rules.md`.
