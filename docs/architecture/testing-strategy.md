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

## Cierre de simplificacion

Las suites mantienen 431 unitarias, 166 integraciones y 113 escenarios E2E,
con 34 smoke y 9 pruebas axe incluidas en la regresion, no adicionales.
Los casos de ESLint usan la configuracion efectiva; las integraciones comprueban
transporte real del frontend contra fetch simulado y no prueban internals del backend.

Para la verificacion local del paso 8 se levantaron mock y app E2E por separado
en 4100/3100, usando las mismas variables sinteticas y reuseExistingServer de la
configuracion. No se uso el servidor del usuario en 3000. No se cambiaron
timeouts, retries, casos ni contratos para obtener un resultado verde.

La ejecucion del 25 de septiembre dejo 112 correctos y un timeout de voucher en
ubicacion con mensaje de conexion. El caso aislado paso el 28 de septiembre.
No se atribuye una causa definitiva ni se borra ese resultado anterior.
La primera repeticion completa del 28 tuvo un timeout de consulta de constancia
(112/113 correctos). Tras regenerar solo .next-e2e, la repeticion final paso
113/113 en 310.8 segundos. No se declara resuelta definitivamente una
intermitencia por obtener un resultado correcto posterior.
El cierre y resultado de la repeticion completa estan en la
[linea base](../quality/baseline.md#simplificacion-pragmatica-cierre-documental-paso-8).

Knip y las pruebas no sustituyen revision manual de accesibilidad, revision visual
de PDF ni validacion de secretos en el hosting. El gate de auditoria sigue siendo
independiente y bloqueante aunque las pruebas funcionales pasen.
