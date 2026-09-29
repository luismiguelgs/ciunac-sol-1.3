# ADR-004 Centralizar HTTP, errores y mappers

## Estado
Aceptado. Actualizado el 2026-09-25 (paso 7).

## Contexto
La integracion con API estaba repartida en `services/`, con payloads construidos cerca de la UI.

## Decision
Mantener infraestructura compartida minima:
- `AppError`
- un transporte de navegador en `modules/shared/infrastructure/http/browser-http.ts`
- funciones de recursos CIUNAC en `lib/api.service.ts`, con URL relativa fija
- un adaptador de correo que obtiene el comprobante seguro
- mappers `toRequestDTO`

## Consecuencias
- No se agrega una clase `HttpClient` sobre funciones que ya exponen el mismo
  contrato.
- Uploads simples consumen directamente el transporte y validan su respuesta en
  el limite.
- Las integraciones consumen funciones de transporte y mappers, sin repositories
  que solo reenvian argumentos. `resourceApiRepository` y `apiFetchSafe` se retiran.
- OTP, consulta, notificaciones y perfil reutilizan el mismo tratamiento HTTP del
  navegador. `ciunacRequest` sigue separado y exclusivamente en servidor: incorpora
  credenciales privadas, `no-store` y errores publicos normalizados desde el BFF.
- No hay reintentos automaticos. Los resultados vacios de comandos/Q10 siguen
  separados de respuestas obligatorias y de ausencia real en consultas opcionales.
- Los cambios de contrato API impactan primero en mappers e infrastructure.
