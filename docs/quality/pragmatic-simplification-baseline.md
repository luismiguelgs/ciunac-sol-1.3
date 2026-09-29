# Simplificacion Pragmatica: Linea Base y Cierre

El historial de cada paso permanece a continuacion.
Estado final: [paso 8](#paso-8-cierre-documental-y-limpieza).

## Pasos 1 y 2: evidencia inicial

Fecha de cierre: 2026-09-22. Alcance: linea base, reglas ESLint y sus pruebas.
No incluye el piloto de certificados (paso 3), cambios funcionales, movimientos
de features, nuevas dependencias ni modificaciones del entorno real.

## Punto de partida

- HEAD: `ec525eed7c59b09a62f00db6d9ec86178045cbe3`.
- Aplicacion `1.6.5`, Next.js `16.2.12`, Node.js `24.11.1`, npm `11.6.2`.
- El worktree ya contenia cambios funcionales y documentales pendientes. Git no
  estaba limpio: no atribuir el diff completo a estos dos pasos.
- Se preservaron los cambios de seguridad, BFF, shared, consultas, beca y ubicacion.
- No se restauro, movio, borro ni reescribio codigo productivo en esta entrega.
- La comparacion SHA-256 al retomar y cerrar el trabajo confirma que los archivos
  funcionales y de dependencias preexistentes permanecen identicos en este cierre.
- En Windows se usa `npm.cmd`: evita el wrapper PowerShell local defectuoso.

## Inventario de modulos

Conteo de archivos `.ts`/`.tsx` existentes, igual antes y despues del tooling:

| Modulo | Archivos | Situacion actual |
| --- | ---: | --- |
| consulta-certificado | 6 | Consulta QR ya simplificada, sin clase delegadora |
| consulta-solicitud | 14 | Casos de uso digitales y contexto comun de consultas |
| consulta-ubicacion | 13 | Join server-side y PDF frontend |
| consultas | 9 | Contexto comun con API publica; dos imports legacy desde BFF |
| security | 15 | OTP, cookies, CAPTCHA, sesiones y transporte privado |
| shared | 21 | Capacidades transversales estables |
| solicitud-beca | 24 | Operacion funcional, workflow y cinco PDFs |
| solicitud-certificado | 31 | Clases, commands y puertos actuales; piloto pendiente |
| solicitud-constancia | 31 | Flujo independiente; simplificacion posterior |
| solicitud-nuevo | 25 | Orquestacion Q10 y correo |
| solicitud-ubicacion | 31 | Operaciones funcionales, perfil, duplicidad y pago |

Total: 220 archivos en modulos. No se impone una reduccion artificial de lineas.

## APIs y consumidores que se preservan

Cada ruta consume su `index.ts` de UI o `server.ts`. `client.ts` compone operaciones
del propio feature; no es una invitacion a importar internals desde otros features.

| Feature | UI publica | Operaciones/servidor que deben permanecer compatibles |
| --- | --- | --- |
| consulta-certificado | `CertificateDetailView` | `getCertificateDetail` |
| consulta-solicitud | `ConsultationResults` | `getSolicitudConsultation`; composicion interna `DigitalDocumentDownload` |
| consulta-ubicacion | `LocationConsultationView` | `getLocationConsultation` |
| consultas | `ConsultaForm`, tipos y `findConsultationText` | `getConsultationRequests` |
| solicitud-beca | `ScholarshipEmailForm`, `SolicitudBecaProcess` | `registerSolicitudBeca`, `retrySolicitudBecaNotification`, `getScholarshipCatalogs`, validadores de solicitud y PDF |
| solicitud-certificado | `SolicitudCertificadoProcess`, `CertificateCargoDownload`, `CertificateFinalNotices` | `registerSolicitudCertificado`, `retrySolicitudCertificadoNotification`, `findCertificateStudent`, `getCertificateCargo`, catalogos/textos/tipos y `validateCertificateRequest` |
| solicitud-constancia | `SolicitudConstanciaProcess`, `ConstanciaCargoDownload`, `ConstanciaFinalNotices` | `registerSolicitudConstancia`, `retrySolicitudConstanciaNotification`, `findConstanciaStudent`, `getConstanciaCargo`, catalogos/textos/tipos y `validateConstanciaRequest` |
| solicitud-nuevo | `NewStudentProcess` | `registerNewStudent`, `retryNewStudentNotification`, `getNewStudentPrograms`, `validateNewStudentRequest` |
| solicitud-ubicacion | `LocationScheduleVerification`, `SolicitudUbicacionProcess`, `LocationCargoDownload`, `LocationFinalNotices` | Perfil, registro, correo, duplicidad, estudiante, cargo, catalogos/textos y validadores BFF/archivos |

No hay imports entre los features de registro de certificados y constancias.
Las consultas de solicitud y ubicacion reutilizan el contexto `consultas` mediante
su API publica. El BFF compone distintos features sin convertirlos en dependencias
mutuas. Sus reglas de negocio no deben trasladarse indiscriminadamente a shared.

## Secuencias y contratos protegidos

| Flujo | Secuencia observable que no cambia | Evidencia automatizada |
| --- | --- | --- |
| Certificados | OTP/CAPTCHA, estudiante POST/PATCH, solicitud, correo, comprobante y cargo PDF | `tests/e2e/solicitud-certificado.smoke.spec.ts` |
| Constancias | Sesion propia, pago compartido, estudiante, solicitud, correo y PDF propio | `tests/e2e/solicitud-constancia.smoke.spec.ts` |
| Beca | OTP, datos, exactamente cinco uploads PDF, un registro, notificacion | `tests/e2e/solicitud-beca.smoke.spec.ts` |
| Ubicacion | Perfil CIUNAC, identidad/academico, pago S/ 30, duplicidad, estudiante, solicitud y correo | `tests/e2e/solicitud-ubicacion.smoke.spec.ts` |
| Alumno nuevo | Email/programa revalidados en BFF, un POST Q10, notificacion; 204 permitido | `tests/e2e/solicitud-nuevo.smoke.spec.ts` |
| Consultas | CAPTCHA/sesion, lecturas privadas, documento digital, aceptacion y descarga | `tests/e2e/consultas.smoke.spec.ts` |
| QR de certificado | ID opaco publico, lectura server-only y API key privada, sin sesion de solicitudes | `tests/e2e/consultas.smoke.spec.ts` |

Los reintentos de correo no repiten persistencia ni uploads. Las escrituras con
resultado indeterminado no se reintentan automaticamente. Ausencia de recurso,
error tecnico y exito parcial siguen siendo estados distintos. Los tests usan
proveedores simulados y no registran solicitudes en el backend real.

## Cambio de tooling implementado

`eslint.config.mjs` deja de repetir configuraciones que sobrescribian
`no-restricted-imports`. Registra `architecture/dependencies` una sola vez y
conserva las reglas de Next.js/TypeScript.

- `scripts/eslint-architecture.mjs`: regla local sin nuevas dependencias.
- `tests/unit/architecture/eslint-boundaries.test.ts`: 63 casos con ESLint real.
- Imports publicos, limites interiores, shared/security y servidor/navegador se
  comprueban para estructuras actuales y nombres planos opcionales.
- Alias, rutas relativas, reexports, imports de tipos, `require` y carga diferida
  literal se prueban. No se prohibe la carga diferida de PDF ya implementada.
- La excepcion BFF de consultas se limita a dos imports existentes y un consumidor;
  se prueba que no habilite otros imports. Se resolvera en el paso 6.

Ver [reglas efectivas y limites](../architecture/architecture-rules.md). Estas
pruebas verifican tooling; no sustituyen la cobertura funcional ni la seguridad
runtime. Los workflows existentes ya ejecutan lint y la suite unitaria, por lo
que no fue necesario crear otro job o herramienta.

## Verificacion

Linea base del 2026-09-21 antes de cambiar reglas: lint y type-check correctos,
300 unitarias y 38 integraciones correctas, Knip correcto. El build fallo sin
acceso a Google Fonts y paso al repetirlo con red, sin cambios de fuente o codigo.

La repeticion E2E final del 2026-09-22 con servidores de prueba independientes
termino con exit code 0 en 285.8 segundos: 110 correctos, 0 fallidos, 0 omitidos y
0 flaky. Incluye 34 smoke, 9 escenarios axe y 67 de regresion. El primer intento
con servidores administrados por Playwright quedo bloqueado en teardown; no se
presenta ese intento como ejecucion exitosa.

Para el cierre se ejecuto la misma suite sin filtros mediante
`node node_modules/@playwright/test/cli.js test --reporter=json`, reutilizando el
mock API y Next dev de `playwright.config.ts` en puertos 4100/3100, con sus variables
sinteticas y fixtures. No se cambio la configuracion productiva ni la suite. El
reporte local queda en `%TEMP%/ciunac-pragmatic-e2e-final.json`.

| Comprobacion | Resultado de cierre |
| --- | --- |
| `npm run lint` | Correcto |
| `npm run typecheck` | Correcto, tambien despues del build |
| `npm run test:unit` | 363/363, incluidas las 63 pruebas nuevas de arquitectura |
| `npm run test:integration` | 38/38 |
| Regresion E2E completa | 110/110, exit code 0; servidores reutilizados para evitar teardown Windows |
| Smoke y accesibilidad | 34/34 y 9/9 incluidos en la regresion completa |
| `npm run build` | Correcto con acceso de red, 22 paginas generadas |
| `npm run dead-code:check` | Correcto |
| `npm ls --depth=0` | Correcto, sin dependencias extraneous o faltantes |
| `npm run security:bundle-check` | Sin valores privados configurados en `.next/static` del build final |
| `npm run env:check` | Correcto; clave publica antigua ausente; no se imprimen valores |
| `git diff --check` | Correcto; avisos informativos LF/CRLF del worktree existente |

La primera repeticion unitaria del cierre detecto un timeout de 5 segundos al
cargar por primera vez la configuracion ESLint. Se separo esa inicializacion en
un `beforeAll` de la suite nueva (30 segundos), manteniendo el timeout de los
casos y todas las aserciones. La repeticion completa paso. No se oculto ni omitio
ninguna prueba y no se modifico codigo funcional para resolverlo.

## Riesgos preexistentes y limites

- Build depende de Google Fonts. Un bloqueo de red no debe reportarse como fallo
  funcional corregido; no se cambian fuentes en estos pasos.
- El teardown administrado de Playwright puede bloquearse en Windows. La repeticion
  usa la misma suite y mocks con servidores independientes y reutilizables.
- La mascara de ubicacion emite errores de consola al cambiar tipo de documento
  durante E2E. Los escenarios pasan, pero requiere una correccion funcional
  independiente; no se reproducen datos personales en esta documentacion.
- Las excepciones de auditoria conocidas vencieron el 2026-09-17. Esta entrega no
  renueva la baseline ni certifica que la auditoria de dependencias pase. La
  actualizacion de seguridad requiere un cambio aislado.
- Persisten las deudas de replay de cookie OTP y propiedad backend de URLs/documentos.
- ESLint inspecciona dependencias estaticas reconocibles; no es una garantia de
  seguridad transitiva ni sustituye validacion server-side.

## Punto de parada

Pasos 1 y 2: inventario, contratos, linea base, reglas compatibles y pruebas.
Al cerrar los pasos 1 y 2, el paso 3 (certificados) quedaba pendiente. No se trasladaron archivos funcionales a
la estructura plana ni se simplificaron operaciones como parte de esta entrega.

Una regresion de contratos, seguridad o flujo detiene el siguiente paso. Cualquier
reversion debe limitarse a los hunks de tooling/documentacion de esta entrega,
no al diff acumulado ni a restaurar todo el repositorio contra HEAD.

Actualizacion posterior: el piloto del paso 3 se registra por separado en
[Fase 2F: piloto pragmatico](phase-2f-solicitud-certificado.md#piloto-pragmatico-paso-3),
sin alterar los conteos ni resultados historicos de esta linea base.

Continuacion del paso 4, primer feature: [Constancias](phase-2a-constancia-typing.md#simplificacion-pragmatica-paso-4-constancias).
Al cerrar constancias, alumno nuevo quedaba pendiente; los resultados historicos
anteriores no se reemplazan.

Cierre del paso 4, segundo feature: [Alumno nuevo](phase-2g-solicitud-nuevo.md#simplificacion-pragmatica-paso-4-alumno-nuevo).
Verificacion del 2026-09-23: 399 unitarias, 79 integraciones y 111 E2E correctos
(34 smoke y 9 axe incluidos), build, lint, type-check, Knip, bundle y entorno
correctos. Constancias y alumno nuevo completan el paso 4; los pasos 5 a 8 no se
inician en este cambio.

## Continuacion: Cierre del Paso 5

Revision 2026-09-24. Becas y ubicacion completan el paso 5; los resultados previos
se conservan como historia, no como medidas del estado actual.

- Se simplifica la organizacion sin reescribir operaciones ya claras: modelo,
  schemas, operaciones y store en la raiz; UI en `components/`; integracion
  externa en `infrastructure/` y adaptadores exclusivos de servidor separados.
- Se conservan 24 archivos en becas y 31 en ubicacion, ambos sin clases. No se
  impone una reduccion artificial de archivos ni se trasladan reglas a shared.
- Becas elimina un delegado de reintento y preserva todos los atributos de errores
  existentes. Se mantienen las APIs publicas, cinco PDFs, S/ 30, perfil,
  duplicidad, seguridad, resultado parcial y PDF diferido.
- Se agregan 28 integraciones con transporte real y proveedor simulado, tres
  unitarias de metadata de errores y cuatro de extensiones. Los E2E comprueban
  tambien los filtros nativos PDF de beca y certificado academico de ubicacion.
- Cierre: lint, type-check, 406 unitarias, 107 integraciones y 111 E2E correctos
  (34 smoke y 9 axe incluidos), Knip, build con red, bundle y entorno correctos.
  Playwright termino con exit 0, sin fallos, omisiones o flaky en 308.8 segundos.
- Las regresiones de literales del traslado se corrigieron antes del cierre y
  permanecen documentadas, igual que los dos fallos intermitentes del primer
  intento E2E de beca. No se afirma haber resuelto su causa no confirmada.
- Se preserva el trabajo pendiente; no se cambian contratos, dependencias,
  version, entorno real ni codigo productivo fuera de los dos features.

Detalles: [Becas](phase-2e-solicitud-beca.md#paso-5-cierre-pragmatico-de-becas),
[Ubicacion](phase-2h-solicitud-ubicacion.md#paso-5-cierre-pragmatico-de-ubicacion) y
[verificacion final](baseline.md#simplificacion-pragmatica-becas-y-ubicacion-paso-5).

Quedan pendientes los pasos 6 (consultas), 7 (capacidades compartidas) y 8
(cierre general). Ninguno se inicia en esta entrega. Las excepciones de auditoria
vencidas, Google Fonts, mascara de documentos y limitaciones backend conocidas
continuan como riesgos; no se presenta la auditoria de dependencias como aprobada.

## Continuacion: Cierre del Paso 6

Revision 2026-09-24. Se simplifican, en orden, contexto comun, consulta de
solicitudes y consulta de ubicacion, conservando la consulta publica de certificado.
Las pruebas de caracterizacion precedieron a la sustitucion de clases y los
movimientos posteriores modificaron imports, no literales funcionales.

| Modulo | Archivos antes/despues | Clases antes/despues |
| --- | --- | --- |
| consultas | 9 / 8 | 3 / 0 |
| consulta-solicitud | 14 / 12 | 3 / 0 |
| consulta-ubicacion | 13 / 12 | 5 / 0 |

APIs y contratos conservados. El handler de CAPTCHA ahora consume el lookup
publico de consultas, sin carga de textos ni excepciones de imports internos.
Las funciones sustituyen clases sin estado, pero mantienen validaciones, filtros,
joins, errores, aceptacion, carga diferida y PDFs. No hay nuevas abstracciones
shared, dependencias, cache global o cambios de diseno.

Verificacion final: lint, type-check, 406 unitarias, 124 integraciones, Knip,
113 E2E (24 consultas, 34 smoke y 9 axe), build de 22 paginas con red,
bundle-check, env-check y diff-check correctos. La suite completa termino con
exit 0, sin omisiones/flaky en 300.3 segundos. Los intentos anteriores y la
correccion de la medicion E2E se conservan en la linea base.

Detalles: [Consulta de solicitudes](phase-2b-consulta-solicitud.md#simplificacion-pragmatica-paso-6),
[Consulta de ubicacion](phase-2d-consulta-ubicacion.md#simplificacion-pragmatica-paso-6) y
[resultados](baseline.md#simplificacion-pragmatica-consultas-paso-6).

Solo quedan pendientes los pasos 7 (capacidades compartidas) y 8 (cierre general).
No se inician automaticamente. Se mantienen las deudas de seguridad y herramientas
preexistentes; esta entrega no aprueba una auditoria de dependencias vencida.

## Continuacion: Cierre del Paso 7

Revision 2026-09-25. Completados por separado archivos, pagos y transporte HTTP
del navegador. Los resultados anteriores se conservan como historia.

Se centralizan metadata y firma binaria, tipos/conversiones de pago y lectura de
respuestas HTTP. Los features conservan sus politicas, precios y APIs publicas.
Se retiran resourceApiRepository y apiFetchSafe; no se unifica el cliente privado
del servidor ni se modifican dependencias, diseno, backend o entorno real.

Cierre: lint, type-check, 431 unitarias, 166 integraciones, 113 E2E (34 smoke y
9 axe incluidos), build de 22 paginas, Knip, bundle, entorno y diff-check correctos.
La auditoria falla: 1 critical, 3 high y excepciones vencidas. No se oculta ni
se renueva esa deuda; requiere una correccion de seguridad aislada.

[Informe del paso](shared-simplification.md#paso-7-consolidacion-de-capacidades) y
[linea base completa](baseline.md#simplificacion-pragmatica-capacidades-compartidas-paso-7).
Solo queda el paso 8, que no se inicia automaticamente.

## Paso 8: Cierre documental y limpieza

Trabajo iniciado el 2026-09-25, retomado el 2026-09-28. Se cierra la simplificacion
sin iniciar funcionalidades o cambios de framework. Los apartados anteriores
son evidencia historica, no una lista de tareas que siga pendiente.

### Documentacion implementada

- SDD v1.4 describe los cinco registros, las consultas, capacidades compartidas,
  BFF, modelos, estado y limites reales. Corrige commands obligatorios, nombres
  de archivos antiguos, catalogos persistidos y la vigencia parcial de ADRs.
- Overview y mapa con diagramas reemplazan la plantilla de cuatro carpetas.
  Convenciones y checklist explican como agregar un feature por necesidad.
- ADR-031 registra una sola decision general; ADR-003 queda parcialmente
  reemplazado. No se genera un ADR por cada traslado de archivo.
- README, roadmap y trazabilidad enlazan el estado implementado. No cambian RF,
  casos de uso, contratos HTTP, rutas ni criterios funcionales.
- Los informes historicos se conservan. La auditoria vencida y los limites
  backend no se presentan como capacidades resueltas.

### Limpieza comprobada

Siete declaraciones sin consumidores en tres archivos: mapas/enums antiguos de
lib/constants.ts, getFileExtension/omit en lib/utils.ts e initialValues de beca.
No se eliminan archivos completos ni dependencias. Se conservan APIs publicas,
exports shadcn, PDF dinamicos, fixtures/scripts y adaptadores con comportamiento.
El [informe de codigo muerto](dead-code-report.md#cierre-del-paso-8) detalla evidencia.
Tambien se retiraron nueve directorios ya vacios de consulta-certificado y shared.

Inventario de archivos TypeScript/TSX al cierre:

| Modulo | Archivos |
| --- | ---: |
| solicitud-certificado | 22 |
| solicitud-constancia | 22 |
| solicitud-nuevo | 21 |
| solicitud-beca | 24 |
| solicitud-ubicacion | 31 |
| consultas | 8 |
| consulta-solicitud | 12 |
| consulta-ubicacion | 12 |
| consulta-certificado | 6 |
| shared | 27 |
| security | 15 |

No se fuerza una reduccion numerica: compartidos agrega capacidades reales y
las clases AppError/SecurityError conservan comportamiento necesario.

### Verificacion y limites

Los resultados finales, incluidos intentos fallidos, estan en
[linea base del paso 8](baseline.md#simplificacion-pragmatica-cierre-documental-paso-8).
Ultima ejecucion: lint, type-check, 431 unitarias, 166 integraciones, 113 E2E
(34 smoke y 9 axe incluidos), build, Knip, npm ls, bundle y entorno correctos.
La regresion final termino en 310.8 segundos con exit 0; dos intentos anteriores
presentaron timeouts, documentados sin atribuir una causa definitiva.
La auditoria ejecutada el 2026-09-28 sigue fallando: 1 critical, 3 high y
excepciones vencidas. No se renuevan excepciones ni se modifica package/lock.

Los pasos 1 a 8 quedan implementados. Esto no autoriza un despliegue con gates
bloqueados, no crea un commit y no inicia la correccion de seguridad posterior.
Se preservan todos los cambios previos del worktree y el archivo architecture.zip.
