# Refactor Modular de Consulta de Certificado

## Alcance

La intervencion estabiliza exclusivamente `consulta-certificado` como feature de
cuatro capas. La correccion posterior de ADR-017 conserva el contrato backend, OTP
y CAPTCHA, pero separa el acceso QR de la sesion de `consulta-solicitud`.

## Clasificacion Final

| Capa | Responsabilidad |
| --- | --- |
| Domain | `CertificateDetail` publico, entrega, notas y orden estable. |
| Application | Query, resultado, puerto y validacion del identificador QR. |
| Infrastructure | Schema/DTO inferido, mapper y repository server-only para API CIUNAC. |
| Presentation | Presenter de etiquetas/fechas y vista de detalle. |
| API publica | `index.ts` para presentacion y `server.ts` para composicion server-only. |
| Shared estable | HTTP seguro, errores, estados de ruta, copyright y UI. |

## Dependencias Eliminadas

- `solicitud-certificados` ya no importa una tabla interna de
  `consulta-certificado`; usa directamente `RequestTypesPriceTable`.
- La ruta de detalle ya no conoce dominio, factory, repository ni componentes
  internos.
- El DTO manual duplicado se reemplaza por `z.output` del contrato runtime.
- La factory de infraestructura y el wrapper de tabla fueron retirados.
- No existen imports entre consulta de certificado y solicitud de constancias.
- El acceso QR no importa ni consume la sesion de `consulta-solicitud`.
- El numero de documento externo no se propaga al dominio ni a presentacion.

## Limites Automatizados

ESLint restringe solo este feature:

- domain no conoce framework ni capas externas;
- application depende hacia domain;
- infrastructure implementa contratos internos y puede usar shared/security;
- presentation depende de application y shared;
- consumidores externos usan exclusivamente la API publica.

La dependencia `consulta-solicitud` hacia el cargo de `solicitud-certificado`
permanece fuera de alcance y debe resolverse en una fase propia.

## Verificacion

- `npm run lint`: correcto, incluidas las restricciones de capas del feature.
- `npx tsc --noEmit`: correcto.
- `npm run test:unit`: 214 de 214 pruebas en 15 archivos.
- Pruebas unitarias de `consulta-certificado`: 15 de 15, incluidas las nuevas
  pruebas del presenter.
- Smoke E2E de consultas: 18 de 18 escenarios alcanzaron el resultado esperado.
- Suite E2E completa: los 89 escenarios emitieron marcador de exito. El proceso
  agoto el timeout despues del ultimo escenario por el bloqueo conocido del
  teardown de Playwright en Windows.
- `npm run build`: correcto con Turbopack; 22 paginas generadas. El primer intento
  fue bloqueado por la descarga de Geist y la repeticion con red habilitada paso.
- `npm run security:bundle-check`: correcto; no se detectaron secretos privados
  en `.next/static`.
- `npm run env:check`: correcto; configuracion privada presente,
  `NEXT_PUBLIC_API_KEY` ausente y claves reCAPTCHA distintas.
- `git diff --check`: correcto, con advertencias informativas LF/CRLF de Windows.

Los resultados tambien se registran en `docs/quality/baseline.md`.
