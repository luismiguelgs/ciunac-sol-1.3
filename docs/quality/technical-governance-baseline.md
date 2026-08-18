# Linea Base de Gobierno Tecnico

## Alcance

Estado registrado el 2026-08-17 para la aplicacion `1.6.4`, Next.js `16.2.12` y
Node.js `24.11.1`. La fase incorpora automatizacion y documentacion; no cambia
reglas de negocio, contratos HTTP ni componentes funcionales.

## Gates Obligatorios

| Check | Verificaciones | Bloquea merge |
| --- | --- | --- |
| `static-quality` | Instalacion, lint, type-check, Knip, `npm ls`, auditoria de produccion | Si |
| `unit-integration` | Unitarias e integracion Vitest | Si |
| `build-security` | Entorno sintetico, build y secretos en bundle | Si |
| `browser-smoke-a11y` | Smoke Chromium y WCAG A/AA automatizado | Si |

La proteccion de rama debe habilitar manualmente estos cuatro nombres en GitHub.

## Checks Opcionales

- `full-e2e`: regresion completa en `main`, manual y programada.
- `advisory-reports`: auditoria de toolchain y reporte completo de Knip.
- Exports y tipos sin uso: visibles en el reporte, no bloqueantes en esta fase.

## Baselines Temporales

- Dependencias: cuatro advisories altos de produccion permitidos hasta
  `2026-09-17`; no hay permiso para altas nuevas ni criticas.
- Accesibilidad: las nueve rutas representativas no requieren excepciones
  `critical` o `serious`; el archivo conserva vencimiento para impedir baselines
  silenciosamente permanentes.

## Verificacion Local

| Verificacion | Resultado |
| --- | --- |
| `npm ci` | Correcto; 563 paquetes instalados desde lockfile |
| Lint y type-check | Correctos |
| Unitarias | 227/227 en 13 archivos |
| Integracion | 15/15 en 2 archivos |
| Smoke Playwright | 34/34 |
| Accesibilidad axe | 9/9, sin excepciones critical/serious |
| Regresion Playwright | 104/104 |
| Build | Correcto; 22 paginas generadas |
| Knip y `npm ls` | Correctos; sin archivos/dependencias bloqueantes |
| Knip informativo | 30 exports y 28 tipos exportados sin uso; no bloqueantes |
| Auditoria de produccion | 4 high conocidas, 0 critical, sin hallazgos nuevos |
| Entorno y bundle | Correctos; secretos privados ausentes de `.next/static` |
| `git diff --check` | Correcto; solo avisos LF/CRLF de Windows |

Los workflows fueron creados y validados sintacticamente de forma local. Su
primera ejecucion remota y la configuracion de branch protection quedan como
acciones manuales posteriores al push.

## Riesgos Pendientes

- Actualizar Next.js a una version corregida y retirar la excepcion de auditoria.
- Resolver el teardown de Playwright que queda abierto en Windows despues de que
  terminan los escenarios.
- Eliminar la dependencia de red de Google Fonts durante el build.
- Complementar axe con teclado, lector de pantalla, zoom y revision visual manual.
- Revisar los avisos `allow-scripts` de npm para `sharp` y `unrs-resolver` antes de
  adoptar una politica explicita de scripts de instalacion.
