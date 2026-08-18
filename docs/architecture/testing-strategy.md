# Estrategia de Pruebas

## Herramientas

- Vitest ejecuta pruebas unitarias e integracion.
- Playwright ejecuta smoke, accesibilidad y regresion de navegador.
- axe-core analiza automaticamente WCAG 2 A/AA en rutas representativas.
- No se usan Jest, Testing Library ni MSW.

## Niveles

| Nivel | Ubicacion | Alcance | Comando |
| --- | --- | --- | --- |
| Unitario | `tests/unit` | Dominio, schemas, mappers, stores y casos de uso aislados | `npm run test:unit` |
| Integracion | `tests/integration` | HTTP, seguridad server-side y pipelines con gateways reales y `fetch` simulado | `npm run test:integration` |
| Smoke | Casos Playwright `@smoke` | Rutas publicas, un flujo exitoso por feature y guardas de sesion | `npm run test:e2e:smoke` |
| Accesibilidad | Casos Playwright `@a11y` | WCAG A/AA automatizado en rutas representativas | `npm run test:a11y` |
| Regresion | `tests/e2e` | Todos los escenarios de navegador | `npm run test:e2e` |

`npm test` ejecuta unitarias e integracion. Los smoke y E2E se mantienen separados
porque requieren navegador y servidores locales.

## Dobles y Entorno

Las pruebas no consumen CIUNAC, Q10, correo, almacenamiento, reCAPTCHA ni Google
Fonts reales. Playwright levanta una API simulada y configura variables sinteticas.
Las pruebas de integracion sustituyen `fetch`, pero conservan gateways, mappers,
schemas y casos de uso reales.

Los dobles deben representar respuestas exitosas, vacias, mal formadas, errores de
red, errores externos y resultados parciales. No deben ocultar diferencias entre
`204`, JSON valido y respuesta ambigua.

## Politica de Gates

- Unitarias, integracion y smoke bloquean el merge.
- Las violaciones axe `critical` o `serious` nuevas bloquean el merge.
- La regresion completa es obligatoria despues del merge y se ejecuta tambien por
  cron o manualmente.
- Los reportes Playwright, trazas, capturas y axe se retienen 14 dias.
- La automatizacion de accesibilidad no sustituye teclado, lector de pantalla,
  zoom, contraste visual ni pruebas con usuarios.

## Riesgos Conocidos

- En Windows, Playwright puede dejar abierto el teardown despues de completar los
  escenarios. CI usa Ubuntu para tener una ejecucion determinista.
- El build requiere red mientras Geist se resuelva mediante Google Fonts.
