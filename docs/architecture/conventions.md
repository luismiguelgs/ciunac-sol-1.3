# Convenciones Arquitectonicas

## Capas
- `presentation`: UI, eventos, loading, errores visibles y navegacion.
- `application`: casos de uso y puertos.
- `domain`: reglas y tipos de negocio.
- `infrastructure`: gateways, DTOs, mappers y acceso a API.

## Reglas de dependencia
- `presentation` puede depender de `application` y `domain`.
- `application` puede depender de `domain` y de puertos.
- `infrastructure` implementa puertos de `application`.
- `domain` no depende de React, Next.js ni de servicios HTTP.

## Estado
- Formularios: React Hook Form.
- Flujo multi-step: Zustand solo cuando el estado debe sobrevivir entre pasos.
- Catalogos: preferir server fetching; usar cache en cliente solo si hay una razon funcional clara.
- Catalogos persistidos: usar stores de solo lectura con `hasHydrated`, `setData` y `clearData`.
- Flujo multi-step: cada store debe exponer `reset` y reiniciarse al entrar al proceso.

## Mapa de estado
- `stores/types.stores.ts`: cache de catalogos por sesion.
- `modules/solicitud-certificado/presentation/solicitud-certificado.store.ts`: workflow tipado de certificados.
- `modules/solicitud-constancia/presentation/solicitud-constancia.store.ts`: workflow tipado de constancias.
- `modules/solicitud-beca/presentation/solicitud-beca.store.ts`: workflow tipado del flujo de beca.
- `modules/solicitud-nuevo/presentation/new-student.store.ts`: workflow tipado del flujo de alumno nuevo.
- `modules/solicitud-ubicacion/presentation/solicitud-ubicacion.store.ts`: workflow tipado del flujo de ubicacion.
- Estados de submit, dialogos y loading: vivir en componentes o hooks de `presentation`.

## Criterios de extraccion a shared
- Debe existir en al menos dos features.
- Debe tener comportamiento equivalente, no solo UI parecida.
- Debe tener nombre y contrato estables.

## Verificacion obligatoria
- Ejecutar `npm run lint`.
- Ejecutar `npx tsc --noEmit`.
- Ejecutar `npm run build`.
