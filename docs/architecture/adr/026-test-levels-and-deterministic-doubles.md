# ADR-026 Niveles de Prueba y Dobles Deterministas

- Estado: Aceptado e implementado.
- Fecha: 2026-08-17.

## Contexto

Vitest y Playwright ya estaban instalados, pero las pruebas HTTP y de seguridad se
mezclaban con unitarias y no habia una seleccion estable de smoke tests. Agregar
otro framework habria duplicado capacidades sin resolver la clasificacion.

## Decision

- Mantener Vitest para pruebas unitarias e integracion y Playwright para navegador.
- Definir como unitarias las reglas, mappers, schemas y casos de uso aislados.
- Definir como integracion las fronteras HTTP/server-side y pipelines que usan
  gateways reales con `fetch` simulado.
- Marcar con `@smoke` rutas publicas, un camino exitoso por feature y guardas de
  sesion criticas.
- Mantener todos los escenarios Playwright como regresion completa.
- Marcar con `@a11y` las rutas representativas y adjuntar el resultado de axe.
- Simular CIUNAC, Q10, correo, almacenamiento, CAPTCHA y Google Fonts. Ninguna
  prueba automatizada debe depender de credenciales o datos reales.

## Consecuencias

- `npm test` ejecuta unitarias e integracion, mientras Playwright permanece en
  scripts separados por costo y proposito.
- Los tests de integracion prueban composicion y contratos sin convertirse en E2E.
- Los dobles deben conservar la semantica observable del proveedor, especialmente
  respuestas vacias, mal formadas y errores parciales.
- La revision manual de UX, accesibilidad y PDFs sigue siendo necesaria.
