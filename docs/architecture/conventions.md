# Convenciones Arquitectonicas

## Capas
- `presentation`: UI, eventos, loading, errores visibles y navegacion.
- `application`: casos de uso y puertos.
- `domain`: reglas y tipos de negocio.
- `infrastructure`: gateways, DTOs, mappers y acceso a API.

## Reglas de dependencia
- `presentation` depende de `application` y de componentes compartidos estables.
- `application` puede depender de `domain` y de puertos.
- `infrastructure` implementa puertos de `application`.
- `domain` no depende de React, Next.js ni de servicios HTTP.

## API Publica de Features
- Un feature estabilizado expone sus consumidores browser-safe desde `index.ts`.
- La composicion exclusiva de servidor se expone desde `server.ts` con
  `import 'server-only'`.
- Rutas y otros features no deben importar carpetas internas de un feature que ya
  tenga API publica.
- `consulta-certificado` aplica estas reglas mediante ESLint; la adopcion en otros
  features sera incremental.
- `consulta-solicitud` expone presentacion desde `index.ts`, composicion de servidor
  desde `server.ts` y aplica limites de capas mediante ESLint.
- `consulta-ubicacion` expone su vista desde `index.ts`, el caso de uso compuesto
  desde `server.ts` y solo consume el contexto comun mediante
  `@/modules/consultas/server` dentro de infraestructura.
- `solicitud-beca` expone el wizard desde `index.ts`, la composicion cliente desde
  `client.ts` y catalogos/validacion de archivos desde `server.ts`.
- `solicitud-certificado` expone proceso y finalizacion desde `index.ts`, casos de
  uso compuestos del navegador desde `client.ts` y catalogos/validacion de precio
  desde `server.ts`.
- `solicitud-constancia` expone proceso y finalizacion desde `index.ts`, casos de
  uso compuestos del navegador desde `client.ts` y catalogos/validacion de precio
  desde `server.ts`.
- `solicitud-ubicacion` expone cronograma, proceso y finalizacion desde `index.ts`,
  casos de uso compuestos desde `client.ts` y catalogos, perfil y validaciones BFF
  desde `server.ts`.
- `solicitud-nuevo` expone el wizard desde `index.ts`, compone registro y reintento
  de correo desde `client.ts` y publica catalogos/validacion Q10 server-side desde
  `server.ts`.
- Los archivos `client.ts`/`client.tsx` y `server.ts` pueden actuar como composition roots; no
  contienen reglas de negocio y son los unicos puntos que conectan implementaciones
  de infraestructura con casos de uso.

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
- Un renderer compartido recibe datos ya resueltos; no decide titulos, precios,
  plazos ni reglas especificas de un feature.

## Verificacion obligatoria
- Ejecutar `npm run lint`.
- Ejecutar `npx tsc --noEmit`.
- Ejecutar `npm run build`.
