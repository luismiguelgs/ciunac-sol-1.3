# Linea Base de Calidad

Historial de verificaciones, no una descripcion unica del estado actual.
Ultimo cierre: [paso 8](#simplificacion-pragmatica-cierre-documental-paso-8).
Las versiones y fallos anteriores se conservan como evidencia fechada.

## Identificacion
- Fecha: 2026-08-03.
- Alcance: Fase 1A, smoke tests E2E del comportamiento actual.
- Gestor de paquetes: npm 11.6.2.
- Node.js local: 24.11.1.
- Next.js instalado: 16.1.0.
- React instalado: 19.2.3.
- TypeScript instalado: 5.9.3.

## Verificacion de Next.js
El gestor de paquetes confirmo que la etiqueta `latest` de Next.js apunta a `16.2.12` al iniciar esta fase. Este dato se registra solamente como referencia: la Fase 1A no actualiza Next.js ni `eslint-config-next`.

## Linea base previa
Antes de crear los smoke tests se comprobaron estos comandos:
- `npm run lint`: correcto.
- `npx tsc --noEmit`: correcto.
- `npm run build`: correcto, con 20 rutas generadas.
- Tests automatizados: no existia un script ni framework configurado.

## Cobertura de Fase 1A
- Render de las 20 rutas publicas conocidas.
- Navegacion desde la portada al flujo de certificados.
- Verificacion de correo de certificados con OTP y reCAPTCHA simulados.
- Registro completo de una solicitud de certificado.
- Consulta de solicitud por documento.
- Consulta de certificado y notas.
- Consulta de examen de ubicacion y resultado.

Las integraciones CIUNAC, Q10, correo, almacenamiento y reCAPTCHA se sustituyen por dobles locales deterministas. El flujo incompleto de constancias solo se cubre hasta la pantalla de proceso actual; no se fija su comportamiento defectuoso como resultado esperado.

## Resultado posterior
- `npm test`: correcto, 26 de 26 smoke tests en Chromium.
- `npm run lint`: correcto.
- `npx tsc --noEmit`: correcto.
- `npm run build`: correcto en directorio aislado `.next-e2e`, con 20 rutas generadas.
- Next.js se mantiene en 16.1.0; no se actualizaron Next.js, React ni `eslint-config-next`.

La Fase 1A queda cerrada. No se iniciaron cambios de las Fases 1B, 1C, 1D o 1E.

## Resultado de Fase 1C
- Next.js: 16.2.12.
- React y React DOM: 19.2.3.
- TypeScript: 5.9.3.
- Vitest: 4.1.10.
- `server-only`: 0.0.1.
- `npm run lint`: correcto, sin errores ni warnings.
- `npx tsc --noEmit`: correcto.
- `npm run test:unit`: correcto, 11 de 11 pruebas.
- `npm run test:e2e`: correcto, 27 de 27 smoke tests.
- `npm run build`: correcto, 25 rutas totales; 5 Route Handlers de seguridad/BFF.
- `npm run security:bundle-check`: correcto; no se detectaron valores privados configurados en `.next/static`.
- `git diff --check`: correcto; solo se informan conversiones de fin de linea propias de Windows.

`npm run env:check` funciona y falla de manera esperada en el entorno local actual: falta `API_URL` canonica, falta `RECAPTCHA_SECRET_KEY` y `NEXT_PUBLIC_API_KEY` continua configurada hasta completar la rotacion manual. `NEXT_PUBLIC_API_URL` solo se acepta como fallback server-only transitorio. No se modifico el `.env` real.

Advertencias pendientes:
- La instalacion reporta 9 vulnerabilidades de dependencias transitivas: 1 baja, 1 moderada y 7 altas. No se ejecuto `npm audit fix` porque esta fase no autoriza actualizaciones no relacionadas.
- Next.js informa una recomendacion LCP para `/images/email-verification.png`; no bloquea el flujo de seguridad.
- En Windows, los servidores hijos de Playwright permanecieron escuchando al finalizar y se detuvieron manualmente despues de obtener resultados exitosos. Conviene aislar su lifecycle en una mejora posterior del runner.

La Fase 1C queda implementada y verificada en codigo, pero no se considera desplegable hasta configurar los secretos privados, rotar/revocar la API key expuesta y obtener un `env:check` exitoso.

## Resultado de Fase 1D

- Alcance: correo, respuestas vacias o incompletas, accesos inseguros y estados de exito falsos.
- Next.js: 16.2.12, sin cambios de dependencias.
- `npm run lint`: correcto, sin errores ni warnings.
- `npx tsc --noEmit`: correcto.
- `npm run test:unit`: correcto, 24 de 24 pruebas en 4 archivos.
- `npm run test:e2e`: correcto, 33 de 33 smoke tests en Chromium.
- `npm run build`: correcto, 25 rutas totales y 20 paginas estaticas generadas.
- `npm run security:bundle-check`: correcto; no se detectaron valores privados configurados en `.next/static`.
- `git diff --check`: correcto; solo se informan conversiones de fin de linea propias de Windows.

El primer intento de build no pudo descargar `Geist` y `Geist Mono` por la restriccion de red del sandbox. El mismo comando se repitio con acceso de red y termino correctamente; no se modifico la configuracion de fuentes.

`npm run env:check` continua fallando de manera esperada porque `RECAPTCHA_SECRET_KEY` esta ausente o no es valida. `API_URL`, `API_KEY`, `API_KEY_Q10`, `APP_BASE_URL`, `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` y `OTP_SESSION_SECRET` estan presentes, y `NEXT_PUBLIC_API_KEY` ya no esta configurada. No se mostro ningun valor ni se modifico el `.env` real.

La Fase 1D queda cerrada. La Fase 1E de constancias no se inicio. El riesgo residual principal es que un `2xx` de `mailer` confirma aceptacion HTTP, no entrega SMTP, y el reintento manual no puede garantizar idempotencia sin soporte del backend.

## Resultado de Fase 1E

- Constancias queda implementado como slice independiente para tipos `5` y `6`.
- Certificados, ubicacion y constancias usan un unico `FinData` y un unico `finInfoSchema`.
- `npm run lint`: correcto.
- `npx tsc --noEmit`: correcto.
- `npm run test:unit`: 30 de 30 pruebas.
- `npm run test:e2e`: 37 de 37 pruebas funcionales reportadas como aprobadas.
- `npm run build`: correcto; 21 paginas generadas y rutas de constancias completas.
- `npm run env:check`: detecta que la secret key y la site key de reCAPTCHA tienen el mismo valor y bloquea el entorno.
- `npm run security:bundle-check`: confirma aislamiento con una clave efimera distinta, pero rechaza correctamente la configuracion reCAPTCHA local.
- `git diff --check`: correcto, con advertencias de fin de linea propias de Windows.

El primer build fallo por bloqueo de red al descargar Geist; la repeticion autorizada del mismo comando termino correctamente. Playwright volvio a dejar procesos hijos abiertos en Windows despues de completar todos los escenarios; se detuvieron por PID verificado. No se modifico `.env`; antes de desplegar debe configurarse una `RECAPTCHA_SECRET_KEY` privada distinta de la clave publica.

La Fase 1E queda implementada en codigo. El despliegue permanece bloqueado hasta corregir el par de claves reCAPTCHA; el detalle tecnico se registra en `docs/quality/phase-1e-constancias.md`.

## Resultado de Fase 2A

- Fecha: 2026-08-04.
- Alcance: tipado y confiabilidad exclusivamente en `solicitud-constancia`.
- Next.js: 16.2.12, sin cambios de dependencias.
- `npm run lint`: correcto.
- `npx tsc --noEmit`: correcto.
- `npm run test:unit`: 61 de 61 pruebas en 7 archivos.
- Smoke E2E de constancias: 5 de 5 escenarios.
- `npm run test:e2e`: 40 de 40 escenarios en Chromium.
- `npm run build`: correcto; 21 paginas generadas.
- `npm run security:bundle-check`: correcto; no se detectaron secretos privados configurados en `.next/static`.
- `npm run env:check`: correcto; todas las variables requeridas presentes, claves reCAPTCHA distintas y `NEXT_PUBLIC_API_KEY` ausente.
- `git diff --check`: correcto, con advertencias de conversion LF/CRLF propias de Windows.

El primer build fallo porque el sandbox no pudo descargar Geist y Geist Mono. La repeticion autorizada del mismo comando termino correctamente; no se cambio la configuracion de fuentes. Playwright volvio a mantener procesos hijo abiertos despues de reportar los resultados; se cerraron exclusivamente los PIDs verificados del runner y del servidor E2E.

Constancias deja de usar `Partial`, setters genericos, `Isolicitud`, `ISolicitudRes` y fachadas genericas en sus limites. El slice incorpora dominio, commands, DTOs, mappers, validacion Zod, cargo tipado, estados de ruta y validacion binaria server-side del voucher. Certificados, ubicacion, beca y alumno nuevo permanecen fuera de esta fase.

La configuracion de entorno que bloqueaba Fase 1E ya se encuentra valida segun `env:check`; ningun valor fue mostrado ni modificado durante Fase 2A.

## Resultado de Fase 2B

- Fecha: 2026-08-04.
- Alcance: contexto comun de consultas y resultado de `consulta-solicitud`.
- Next.js: 16.2.12, sin cambios de dependencias.
- `npm run lint`: correcto, sin errores ni warnings.
- `npx tsc --noEmit`: correcto.
- `npm run test:unit`: 75 de 75 pruebas en 8 archivos.
- Smoke E2E de consultas: 9 de 9 escenarios.
- Suite E2E completa: 43 de 43 escenarios reportados como aprobados en Chromium.
- `npm run build`: correcto; 21 paginas generadas.
- `npm run security:bundle-check`: correcto; no se detectaron secretos privados en `.next/static`.
- `npm run env:check`: correcto; variables requeridas presentes, claves reCAPTCHA distintas y `NEXT_PUBLIC_API_KEY` ausente.
- `git diff --check`: correcto, con advertencias de conversion LF/CRLF propias de Windows.

El primer build fallo porque el sandbox no pudo descargar Geist y Geist Mono. La
repeticion autorizada del mismo comando termino correctamente; no se modificaron
fuentes ni configuracion. Playwright reporto los 43 escenarios aprobados, pero volvio
a mantener su runner y servidores hijo abiertos en Windows; se cerraron solamente
los PIDs verificados del arbol E2E.

La consulta general deja de usar `ISolicitudRes` como frontera y adopta dominio,
DTOs, mappers, validacion runtime y un caso de uso server-side. Los estados vacio,
error, datos y textos auxiliares indisponibles quedan diferenciados. El formulario
compartido pasa a `modules/consultas`, mientras cargo y documento digital permanecen
en `modules/consulta-solicitud` con contratos tipados.

Fase 2B no migra el detalle de certificado ni el join de ubicacion. Tambien queda
pendiente un endpoint especializado que compruebe propiedad del documento digital
contra la sesion de consulta antes de exponer su URL o aceptar el documento.

## Resultado de Fase 2C

- Fecha: 2026-08-04.
- Alcance: tipado y confiabilidad de `consulta-certificado/[id]`.
- Next.js: 16.2.12, sin cambios de dependencias.
- `npm run lint`: correcto, sin errores ni warnings.
- `npx tsc --noEmit`: correcto.
- `npm run test:unit`: 88 de 88 pruebas en 9 archivos.
- Smoke E2E de consultas: 13 de 13 escenarios.
- Suite E2E completa: 47 de 47 escenarios reportados como aprobados en Chromium.
- `npm run build`: correcto; 21 paginas generadas.
- `npm run security:bundle-check`: correcto; no se detectaron secretos privados en `.next/static`.
- `npm run env:check`: correcto; variables requeridas presentes, claves reCAPTCHA distintas y `NEXT_PUBLIC_API_KEY` ausente.
- `git diff --check`: correcto, con advertencias de conversion LF/CRLF propias de Windows.

El primer build fallo porque el sandbox no pudo descargar Geist y Geist Mono. La
repeticion con red compilo, pero encontro un `validator.ts` truncado dentro del
directorio temporal `.next-e2e`, generado por el servidor de smoke detenido en
Windows. Se verifico la ruta absoluta, se retiro exclusivamente `.next-e2e` y el
build limpio posterior termino correctamente. No se modificaron fuentes ni
configuracion de Next.js.

Playwright reporto los 47 escenarios aprobados, pero mantuvo su runner y servidores
hijo abiertos; se cerraron solo los PIDs verificados del arbol E2E.

El detalle de certificado incorpora dominio completo, DTO, mapper, schema Zod,
repositorio server-only, caso de uso y vista tipada. Un `404` o respuesta exitosa
vacia se muestra como no disponible; un cuerpo incompleto activa el estado de error.
El caso de uso comprueba que el numero de documento del certificado coincida con la
sesion y oculta recursos ajenos como no encontrados. La lista de notas vacia sigue
siendo un resultado funcional.

Fase 2C no modifica descarga o aceptacion de documentos digitales ni el join de
ubicacion. Esos alcances permanecen como deuda de ADR-010 y futura Fase 2D.

## Resultado de Fase 2D

- Fecha: 2026-08-05.
- Alcance: tipado, confiabilidad y join server-side de `consulta-ubicacion/[dni]`.
- Next.js: 16.2.12, sin cambios de dependencias.
- `npm run lint`: correcto, sin errores ni warnings.
- `npx tsc --noEmit`: correcto.
- `npm run test:unit`: 102 de 102 pruebas en 10 archivos.
- Smoke E2E de consultas: 18 de 18 escenarios reportados como aprobados.
- Suite E2E completa: 52 de 52 escenarios reportados como aprobados en Chromium.
- `npm run build`: correcto; 21 paginas generadas.
- `npm run security:bundle-check`: correcto; no se detectaron secretos privados en `.next/static`.
- `npm run env:check`: correcto; variables requeridas presentes, claves reCAPTCHA distintas y `NEXT_PUBLIC_API_KEY` ausente.
- `git diff --check`: correcto, con advertencias de conversion LF/CRLF propias de Windows.

Playwright completo los 18 escenarios dirigidos y los 52 escenarios de la suite,
pero ambos comandos agotaron su timeout despues del ultimo resultado debido al
lifecycle pendiente de sus servidores en Windows. Durante la espera, `next/font`
reintento sin exito descargar Geist dentro del sandbox y genero warnings repetidos;
la aplicacion uso su fallback de desarrollo. El directorio generado `.next-e2e` se
verifico por ruta absoluta y se retiro antes del build.

El primer build de produccion fallo por la restriccion de red al descargar Geist y
Geist Mono. La repeticion autorizada del mismo comando termino correctamente; no se
modificaron fuentes ni configuracion.

La consulta de ubicacion deja de cargar notas, examenes y ciclos mediante efectos
cliente. Un caso de uso server-side obtiene en paralelo los contratos validados,
filtra solicitudes y resultados por documento, ejecuta el join y diferencia datos
completos, parciales, vacios y errores. La constancia PDF solo se habilita con
resultado terminado, fecha, ciclo y `TEXTO_NOMBREAN`; un fallo de textos no oculta
la nota.

El cargo del estado sin notas continua reutilizando el componente legacy de
`solicitud-ubicacion`. Su tipado queda fuera de Fase 2D y se registra como deuda en
ADR-012.

## Resultado de Fase 2E

- Fecha: 2026-08-05.
- Alcance: tipado y confiabilidad del registro de `solicitud-beca`.
- Next.js: 16.2.12, sin cambios de dependencias.
- `npm run lint`: correcto, sin errores ni warnings.
- `npx tsc --noEmit`: correcto.
- `npm run test:unit`: 131 de 131 pruebas en 12 archivos.
- Smoke E2E de beca: los 8 escenarios alcanzaron su resultado esperado.
- Suite E2E completa: 60 de 60 escenarios reportados como aprobados antes del ajuste final del schema BFF; el smoke de beca se repitio despues del ajuste.
- `npm run build`: correcto; 21 paginas generadas.
- `npm run security:bundle-check`: correcto; no se detectaron secretos privados en `.next/static`.
- `npm run env:check`: correcto; variables requeridas presentes, claves reCAPTCHA distintas y `NEXT_PUBLIC_API_KEY` ausente.
- `git diff --check`: correcto, con advertencias de conversion LF/CRLF propias de Windows.

El smoke dirigido recorrio los 8 escenarios, incluido el flujo completo, cinco
cargas PDF, rechazo de firma falsa, respuesta de registro invalida, fallo parcial
de correo, reintento sin segunda persistencia, catalogos vacios e identificador final
invalido. El comando agoto su timeout despues del ultimo escenario por el lifecycle
pendiente de los servidores Playwright en Windows y los reintentos de Google Fonts;
no quedaron procesos Node activos al finalizar.

El primer build fallo porque el sandbox no pudo descargar Geist y Geist Mono. La
repeticion autorizada del mismo comando termino correctamente; no se modificaron
fuentes ni configuracion.

Solicitud de beca incorpora dominio, DTO exacto, mappers, validacion runtime,
catalogos server-side y un workflow discriminado sin `Partial` ni setters genericos.
Las cinco cargas se validan como PDF de hasta 8 MiB en cliente y por firma `%PDF-`
en el Route Handler. El resumen deja de depender de consultas y el reintento de
correo no repite la persistencia de la solicitud.

Permanece como deuda que el backend externo valide la propiedad de las URLs cargadas
y proporcione idempotencia o confirmacion de entrega para el correo.

## Resultado de Fase 2F

- Fecha: 2026-08-05.
- Alcance: tipado, confiabilidad y precio seguro de `solicitud-certificado`.
- Next.js: 16.2.12, sin cambios de dependencias.
- `npm run lint`: correcto, sin errores ni warnings.
- `npx tsc --noEmit`: correcto.
- `npm run test:unit`: 170 de 170 pruebas en 13 archivos.
- Smoke E2E de certificados: los 15 escenarios recorrieron la lista completa sin fallos reportados.
- Suite E2E completa: 69 escenarios descubiertos; sin cierre verificable por el lifecycle de servidores en Windows.
- `npm run build`: correcto con Turbopack; 21 paginas generadas.
- `npm run security:bundle-check`: correcto; no se detectaron secretos privados en `.next/static`.
- `npm run env:check`: correcto; variables requeridas presentes, claves reCAPTCHA distintas y `NEXT_PUBLIC_API_KEY` ausente.
- `git diff --check`: correcto, con advertencias de conversion LF/CRLF propias de Windows.

Certificados deja de usar `Partial<Isolicitud>`, setters `unknown`, el store global
y el paso documental. Incorpora dominio, DTOs, mappers, schemas Zod, catalogos
server-side, workflow discriminado, cargo tipado y estados de ruta. Los tipos `2`
y `4` se derivan como digitales; alumno UNAC envia sus datos academicos sin archivo
adicional.

El BFF revalida el precio normal vigente antes de crear solicitudes de tipos `1` a
`4`. Un monto manipulado responde `409 PRICE_CHANGED` y no llega a la API externa.
Los descuentos de trabajador y los parametros `trabajador`/`antiguo` quedan fuera
del contrato hasta disponer de validacion backend.

El smoke dirigido avanzo por los 15 escenarios, incluidos precio manipulado,
voucher falsificado, estudiante existente, alumno UNAC, catalogos invalidos,
respuestas incompletas, correo parcial y cargo. Playwright no devolvio codigo de
salida despues del ultimo escenario por el bloqueo conocido de teardown en Windows.
La ejecucion global se detuvo despues de un tiempo excesivo sin salida final, por lo
que no se registra como aprobada. El inventario estatico confirma 69 escenarios.

El primer build fallo por bloqueo de red al descargar Geist. La repeticion
autorizada termino correctamente sin modificar codigo ni fuentes. El entorno E2E
usa Webpack y respuestas simuladas de Google Fonts para reducir la dependencia de
red; el problema de cierre del runner permanece como deuda transversal.

## Resultado de Fase 2G

- Fecha: 2026-08-05.
- Alcance: tipado y confiabilidad de `solicitud-nuevo`.
- Next.js: 16.2.12, sin cambios de dependencias.
- `npm run lint`: correcto, sin errores ni warnings.
- `npx tsc --noEmit`: correcto.
- `npm run test:unit`: 191 de 191 pruebas en 14 archivos.
- Smoke E2E de alumno nuevo: los 10 escenarios alcanzaron el resultado esperado.
- Prueba E2E dirigida de la ruta final: correcta; sin comprobante muestra un estado no confirmado.
- Suite E2E completa: 78 escenarios ejecutados; el unico marcador desactualizado se corrigio y valido de forma dirigida.
- `npm run build`: correcto con Turbopack; 21 paginas generadas.
- `npm run security:bundle-check`: correcto; no se detectaron secretos privados en `.next/static`.
- `npm run env:check`: correcto; variables requeridas presentes, claves reCAPTCHA distintas y `NEXT_PUBLIC_API_KEY` ausente.
- `git diff --check`: correcto, con advertencias de conversion LF/CRLF propias de Windows.

Alumno nuevo deja de usar el DTO Q10 como formulario y estado, `Partial` y setters
`unknown`. El slice incorpora dominio, DTOs, schemas Zod, mappers, catalogo
server-side y un workflow discriminado. El BFF toma el email verificado como
autoridad y revalida que el programa permanezca disponible antes del registro.

Q10 puede confirmar el comando mediante `204` o un objeto JSON. Respuestas
primitivas, arreglos o cuerpos mal formados se tratan como fallo del servicio y no
continuan al correo. Un fallo posterior del correo conserva el registro y permite
reintentar solo la notificacion, sin repetir la escritura Q10.

El smoke dirigido completo los 10 escenarios. Playwright tambien ejecuto la suite
global; la expectativa heredada de la pagina final fue actualizada para exigir el
estado `Estado no confirmado` cuando falta el comprobante y su repeticion dirigida
termino correctamente. El runner sigue agotando el timeout despues de reportar los
resultados por el bloqueo conocido del teardown en Windows.

Permanecen como deuda la falta de idempotencia confirmada en Q10, el limite de 30
programas, la validacion funcional de los filtros heredados y el problema
transversal de cierre de Playwright.

## Resultado de Fase 2H

- Fecha: 2026-08-10.
- Alcance: tipado, confiabilidad y controles server-side de `solicitud-ubicacion`.
- Next.js: 16.2.12, sin cambios de dependencias.
- `npm run lint`: correcto, sin errores ni warnings.
- `npx tsc --noEmit`: correcto.
- `npm run test:unit`: 212 de 212 pruebas en 15 archivos.
- Smoke E2E de ubicacion: 11 de 11 escenarios alcanzaron el resultado esperado.
- Suite E2E completa: 89 de 89 escenarios alcanzaron el resultado esperado.
- `npm run build`: correcto con Turbopack; 22 paginas generadas.
- `npm run security:bundle-check`: correcto; no se detectaron secretos privados en `.next/static`.
- `npm run env:check`: correcto; variables privadas presentes, claves reCAPTCHA distintas y `NEXT_PUBLIC_API_KEY` ausente.
- `git diff --check`: correcto, con advertencias de conversion LF/CRLF propias de Windows.

Ubicacion deja de usar `Partial<Isolicitud>`, setters `unknown`, el store global,
interfaces y servicios genericos. El slice incorpora dominio, DTOs, schemas Zod,
mappers, workflow discriminado, catalogos server-side, cargo tipado y estados de
ruta. `FinData` y `finInfoSchema` permanecen como contrato transversal de pago.

El tipo de solicitud queda fijado en `7` y la tarifa oficial en S/ 30.00. El BFF
revalida que catalogo y monto coincidan, verifica duplicidad y exige que el perfil
CIUNAC coincida con la cookie cifrada asociada al OTP `UBICACION`. Documento de
identidad, voucher y certificado academico se rechazan antes del proveedor cuando
extension, MIME, tamano o firma binaria son incompatibles.

El smoke E2E detecto y permitio corregir un indice vacio del wizard no CIUNAC. Los
11 escenarios dirigidos y los 89 globales fueron reportados como correctos; ambos
comandos agotaron el timeout despues del ultimo escenario por el bloqueo conocido
del teardown de Playwright en Windows.

El primer build fallo al no poder descargar Geist desde el sandbox. La repeticion
con acceso de red autorizado compilo correctamente sin cambios de codigo ni fuentes.
Permanecen como deuda la validacion institucional del perfil CIUNAC, la falta de
atomicidad confirmada para duplicidad y la idempotencia del proveedor de correo.

## Resultado del Refactor Modular de Consulta de Certificado

- Fecha: 2026-08-10.
- Alcance: arquitectura modular de cuatro capas para `consulta-certificado`.
- Next.js: 16.2.12, sin cambios de dependencias.
- `npm run lint`: correcto, incluidas las restricciones de imports del feature.
- `npx tsc --noEmit`: correcto.
- `npm run test:unit`: 214 de 214 pruebas en 15 archivos.
- Pruebas unitarias del feature: 15 de 15.
- Smoke E2E de consultas: 18 de 18 escenarios alcanzaron el resultado esperado.
- Suite E2E completa: los 89 escenarios emitieron marcador de exito.
- `npm run build`: correcto con Turbopack; 22 paginas generadas.
- `npm run security:bundle-check`: correcto; no se detectaron secretos privados en `.next/static`.
- `npm run env:check`: correcto; variables privadas presentes, claves reCAPTCHA distintas y `NEXT_PUBLIC_API_KEY` ausente.
- `git diff --check`: correcto, con advertencias de conversion LF/CRLF propias de Windows.

El feature expone una API browser-safe desde `@/modules/consulta-certificado` y
una entrada de composicion server-only desde `@/modules/consulta-certificado/server`.
La ruta App Router ya no conoce dominio, infraestructura ni factories internas.
El DTO manual se sustituyo por el tipo inferido del schema Zod, y las etiquetas y
fechas visibles se trasladaron a un presenter.

`solicitud-certificados` dejo de importar una tabla interna de
`consulta-certificado` y usa directamente el componente shared estable. ESLint
aplica los limites de dependencia solo al feature migrado para no romper los
modulos pendientes. Permanece fuera de alcance la dependencia de
`consulta-solicitud` hacia el cargo interno de `solicitud-certificado`.

El smoke dirigido reporto sus 18 escenarios correctos. La suite global emitio los
89 marcadores de exito y luego agoto el timeout por el bloqueo conocido del
teardown de Playwright en Windows. El primer build no pudo descargar Geist desde
el sandbox; la repeticion autorizada termino correctamente sin cambios de codigo.

## Correccion de Acceso Publico QR a Certificados

- Fecha: 2026-08-10.
- El ID real `8EP4pqHBpZGO00JIn14I` responde `200`, permanece en su URL y muestra
  un unico detalle de certificado sin sesion previa.
- La ruta ya no redirige a `consulta-solicitud` ni depende de sus cookies.
- El resultado de dominio no contiene el numero de documento.
- Certificados historicos con `numeroDocumento: null` y `aceptado: null` se validan
  sin exponer el documento; la entrega nula se normaliza como pendiente.
- La API key permanece server-only y el navegador no llama al proveedor.
- `npm run lint`: correcto.
- `npx tsc --noEmit`: correcto despues de regenerar los tipos E2E.
- `npm run test:unit`: 214 de 214 pruebas en 15 archivos.
- Unitarias dirigidas: 15 de 15.
- Smoke E2E de consultas: los 18 escenarios emitieron marcador de exito; el runner
  agoto el timeout despues del ultimo escenario por el teardown conocido.
- Suite E2E completa: los 89 escenarios emitieron marcador de exito; el runner
  agoto el timeout despues del ultimo escenario por el mismo teardown.
- `npm run build`: correcto con Turbopack; 22 paginas generadas.
- `npm run security:bundle-check`: correcto; no se detectaron secretos privados.
- `npm run env:check`: correcto; configuracion privada presente y
  `NEXT_PUBLIC_API_KEY` ausente.
- `git diff --check`: correcto, con advertencias informativas LF/CRLF de Windows.

ADR-017 reemplazo exclusivamente la autorizacion por sesion de ADR-011. Esta fue
la estructura vigente hasta que ADR-027 simplifico la consulta server-only sin
retirar el dominio tipado, la validacion Zod ni el presenter.

## Resultado del Refactor Modular de Consulta de Solicitudes

- Fecha: 2026-08-11.
- Alcance: arquitectura modular de cuatro capas para `consulta-solicitud` y
  renderer visual compartido de cargos.
- Next.js: 16.2.12, sin cambios de dependencias.
- `npm run lint`: correcto, incluidas las restricciones de imports del feature.
- `npx tsc --noEmit`: correcto.
- `npm run test:unit`: 222 de 222 pruebas en 15 archivos.
- Unitarias dirigidas de consultas: 18 de 18.
- Smoke E2E de consultas: 19 de 19.
- Suite E2E completa: 90 de 90.
- `npm run build`: correcto con Turbopack; 22 paginas generadas.
- `npm run security:bundle-check`: correcto; no se detectaron secretos privados.
- `npm run env:check`: correcto; configuracion privada presente y
  `NEXT_PUBLIC_API_KEY` ausente.
- `git diff --check`: correcto, con avisos informativos LF/CRLF de Windows.

El feature expone presentacion desde `@/modules/consulta-solicitud` y composicion
server-only desde `@/modules/consulta-solicitud/server`. Documentos digitales
incorporan puertos, casos de uso, mapper y gateway; presentation ya no consume
infraestructura ni dominio directamente. `modules/consultas` tambien dispone de
API publica y sus DTOs se infieren desde Zod.

`AdministrativeCargoPdf` centraliza A4, encabezado y estilos. Certificado,
constancia, ubicacion y consulta conservan adaptadores propios, por lo que no
existen imports entre sus features. La consulta de constancia muestra ahora su
titulo y etiqueta correctos.

El primer build fallo por la descarga bloqueada de Geist; la repeticion con acceso
de red autorizado termino correctamente. Playwright se bloqueo al gestionar sus
web servers; al ejecutar mock y Next como servidores aislados, el smoke y la suite
global terminaron normalmente. Permanece pendiente el Route Handler que valide la
propiedad del documento digital antes de exponer o aceptar su URL.

## Hotfix de Descarga de Certificados Historicos

- Fecha: 2026-08-11.
- Causa: el proveedor devuelve `numeroDocumento` como valor numerico en algunos
  certificados historicos y la validacion runtime nueva exigia `string`.
- Solucion: normalizacion numero/texto a `string` en el schema de infraestructura,
  sin debilitar el modelo de dominio ni modificar el contrato HTTP.
- Contrato real reportado: validado correctamente mediante una operacion de solo
  lectura; no se ejecuto `PATCH` ni se altero el certificado.
- `npm run lint`: correcto.
- `npx tsc --noEmit`: correcto.
- `npm run test:unit`: 223 de 223 pruebas en 15 archivos.
- Smoke E2E de consultas: 20 de 20, incluido certificado historico numerico.
- Suite E2E completa previa al hotfix: 90 de 90; el cambio queda cubierto por el
  smoke completo del feature afectado.
- `npm run build`: correcto con Turbopack; 22 paginas generadas.
- `npm run security:bundle-check`: correcto; no se detectaron secretos privados.
- `npm run env:check`: correcto; configuracion privada presente y
  `NEXT_PUBLIC_API_KEY` ausente.
- `git diff --check`: correcto, con avisos informativos LF/CRLF de Windows.

## Hotfix de Descarga de Constancias Historicas

- Fecha: 2026-08-11.
- Causa: el proveedor usa `id_solicitud` y `dni`, pero el schema runtime exigia
  `solicitudId` y `numeroDocumento`; la constancia se descartaba antes del render.
- Solucion: normalizacion de aliases exclusivamente en infraestructura, manteniendo
  el contrato canonico y obligatorio en las capas internas.
- Contrato real: verificado mediante `GET` seguro; no se ejecuto `PATCH`, aceptacion
  ni modificacion de constancias reales.
- `npm run lint`: correcto y sin advertencias.
- `npx tsc --noEmit`: correcto.
- `npm run test:unit`: 224 de 224 pruebas en 15 archivos.
- Unitarias dirigidas de consultas: 20 de 20.
- Smoke E2E de consultas: 20 de 20, incluido el payload historico de constancia.
- `npm run build`: correcto con Turbopack; 22 paginas generadas.
- `npm run security:bundle-check`: correcto; no se detectaron secretos privados.
- `npm run env:check`: correcto; configuracion privada presente y
  `NEXT_PUBLIC_API_KEY` ausente.
- `git diff --check`: correcto, con avisos informativos LF/CRLF de Windows.

## Resultado del Refactor Modular de Consulta de Ubicacion

- Fecha: 2026-08-11.
- Alcance: arquitectura modular de cuatro capas para `consulta-ubicacion`.
- Next.js: 16.2.12 y aplicacion 1.5.7, sin cambios de dependencias.
- `npm run lint`: correcto, incluidas las restricciones de imports del feature.
- `npx tsc --noEmit`: correcto.
- Unitarias dirigidas: 17 de 17.
- `npm run test:unit`: 227 de 227 pruebas en 15 archivos.
- Smoke E2E de consultas: 20 de 20 escenarios alcanzaron su resultado esperado.
- Suite E2E completa: 91 de 91 escenarios alcanzaron su resultado esperado.
- `npm run build`: correcto con Turbopack; 22 paginas generadas.
- `npm run security:bundle-check`: correcto; no se detectaron secretos privados.
- `npm run env:check`: correcto; configuracion privada presente y
  `NEXT_PUBLIC_API_KEY` ausente.
- `git diff --check`: correcto, con avisos informativos LF/CRLF de Windows.

El feature expone presentacion desde `@/modules/consulta-ubicacion` y composicion
server-only desde `@/modules/consulta-ubicacion/server`. Dominio y aplicacion usan
modelos y puertos locales; solo infraestructura adapta la API publica
`@/modules/consultas/server`. Los DTOs de notas, examenes y ciclos se infieren de
sus schemas Zod.

El cargo deja de importar `solicitud-ubicacion` y se construye con la solicitud
activa ya disponible. El smoke comprueba que el estado sin notas no ejecuta
`GET solicitudes/{id}`. El presenter y las fixtures usan la tarifa oficial de
S/ 30.00. La constancia conserva su formato frontend y el cargo usa el renderer A4
compartido.

El primer build fallo porque el sandbox no pudo descargar Geist; la repeticion con
acceso de red autorizado termino correctamente sin cambios de codigo. Tanto el
smoke dirigido como la suite global emitieron todos sus resultados correctos y
luego agotaron el timeout por el teardown conocido de Playwright en Windows. La
fuente Roboto remota de la constancia permanece como deuda tecnica.

## Resultado del Refactor Modular de Solicitud de Beca

- Fecha: 2026-08-13.
- Alcance: límites modulares de cuatro capas para `solicitud-beca`.
- Next.js: 16.2.12 y aplicación 1.5.8, sin cambios de dependencias.
- `npm run lint`: correcto, incluidas las restricciones del feature.
- `npx tsc --noEmit`: correcto.
- Unitarias dirigidas: 31 de 31.
- `npm run test:unit`: 229 de 229 pruebas en 15 archivos.
- Smoke E2E de beca: 9 de 9 escenarios correctos.
- Suite E2E completa: 92 de 92 escenarios correctos.
- `npm run build`: correcto con Turbopack; 22 páginas generadas.
- `npm run security:bundle-check`: correcto; no se detectaron secretos privados.
- `npm run env:check`: correcto; configuración privada presente y
  `NEXT_PUBLIC_API_KEY` ausente.
- `git diff --check`: correcto, con avisos informativos LF/CRLF de Windows.

El feature expone presentación desde `@/modules/solicitud-beca`, composición de
registro desde `@/modules/solicitud-beca/client` y capacidades server-only desde
`@/modules/solicitud-beca/server`. La factory que invertía dependencias fue
retirada; schemas de formulario y command quedaron en sus capas correspondientes.

La política PDF ya no depende del tipo `File` ni devuelve mensajes de interfaz.
Los catálogos rechazan relaciones escuela-facultad inconsistentes y las respuestas
externas se infieren desde Zod. El request DTO conserva el contrato histórico
`contancia_tercio`.

El primer build falló por la descarga de Geist bloqueada en el sandbox; la
repetición con acceso autorizado terminó correctamente. Los nueve smoke y los 92
E2E globales emitieron resultado correcto antes de que Playwright agotara el
timeout durante su teardown conocido en Windows.

## Resultado del Refactor Modular de Solicitud de Certificados

- Fecha: 2026-08-13.
- Alcance: limites modulares de cuatro capas para `solicitud-certificado`.
- Next.js: 16.2.12 y aplicacion 1.5.9, sin cambios de dependencias.
- `npm run lint`: correcto, incluidas las restricciones del feature.
- `npx tsc --noEmit`: correcto.
- Unitarias dirigidas: 51 de 51.
- `npm run test:unit`: 232 de 232 pruebas en 15 archivos.
- Smoke E2E de certificados: 15 de 15 escenarios correctos.
- Suite E2E completa: 92 de 92 escenarios correctos.
- `npm run build`: correcto con Turbopack; 22 paginas generadas.
- `npm run security:bundle-check`: correcto; sin secretos privados en el bundle.
- `npm run env:check`: correcto; configuracion privada presente y clave publica
  antigua ausente.
- `git diff --check`: correcto, con avisos informativos LF/CRLF de Windows.

El feature expone presentacion desde `@/modules/solicitud-certificado`, composicion
cliente desde `@/modules/solicitud-certificado/client` y capacidades server-only
desde `@/modules/solicitud-certificado/server`. Presentacion ya no consume
repositories; application no compone gateways y el BFF no importa internals.

Los DTOs de respuesta se infieren desde Zod. Alta, actualizacion y consulta de
estudiante usan un gateway unico. Certificados y constancias permanecen sin imports
entre features y solo comparten pago, voucher, seguridad y renderer A4 estables.

El primer build fallo por la descarga de Geist bloqueada en el sandbox; la
repeticion autorizada termino correctamente. Los smoke y E2E emitieron todos sus
resultados correctos antes del timeout del teardown conocido de Playwright en
Windows.

## Resultado del Refactor Modular de Solicitud de Constancias

- Fecha: 2026-08-14.
- Alcance: limites modulares de cuatro capas para `solicitud-constancia`.
- Next.js: 16.2.12 y aplicacion 1.6.0, sin cambios de dependencias.
- `npm run lint`: correcto, incluidas las restricciones del feature.
- `npx tsc --noEmit`: correcto.
- Unitarias dirigidas: 35 de 35.
- `npm run test:unit`: 237 de 237 pruebas en 15 archivos.
- Smoke E2E de constancias: 6 de 6 escenarios correctos.
- Suite E2E completa: 93 de 93 escenarios correctos.
- `npm run build`: correcto con Turbopack; 22 paginas generadas.
- `npm run security:bundle-check`: correcto; sin secretos privados en el bundle.
- `npm run env:check`: correcto; configuracion privada presente y clave publica
  antigua ausente.
- `git diff --check`: correcto, con avisos informativos LF/CRLF de Windows.

El feature expone presentacion desde `@/modules/solicitud-constancia`, composicion
cliente desde `@/modules/solicitud-constancia/client` y catalogos/validacion de
precio desde `@/modules/solicitud-constancia/server`. Presentacion ya no consume
repositories ni stores globales de catalogos; App Router y el BFF usan solo las
entradas publicas.

Constancias y certificados permanecen sin imports mutuos. El BFF revalida el
precio de los tipos `5` y `6` y bloquea montos manipulados antes de la API externa.
Pago, voucher, seguridad y renderer A4 continúan como capacidades compartidas
estables.

El primer build fallo por la descarga de Geist bloqueada en el sandbox; la
repeticion con acceso de red termino correctamente. Los 6 smoke y los 93 E2E
globales emitieron resultado correcto antes del timeout del teardown conocido de
Playwright en Windows.

## Resultado del Refactor Modular de Solicitud de Ubicacion

- Fecha: 2026-08-17.
- Alcance: limites modulares de cuatro capas para `solicitud-ubicacion`.
- Next.js: 16.2.12 y aplicacion 1.6.1, sin cambios de dependencias.
- `npm run lint`: correcto, incluidas las restricciones del feature.
- `npx tsc --noEmit`: correcto.
- Unitarias dirigidas: 31 de 31.
- `npm run test:unit`: 238 de 238 pruebas en 15 archivos.
- Smoke E2E de ubicacion: 11 de 11 escenarios correctos.
- Suite E2E completa: 92 de 93 en una ejecucion; el unico timeout paso aislado.
- `npm run build`: correcto con Turbopack; 22 paginas generadas.
- `npm run security:bundle-check`: correcto; sin secretos privados en el bundle.
- `npm run env:check`: correcto; configuracion privada presente.
- `git diff --check`: correcto, con avisos informativos LF/CRLF de Windows.

El feature expone presentacion desde `@/modules/solicitud-ubicacion`, composicion
cliente desde `@/modules/solicitud-ubicacion/client` y catalogos, perfil y
validaciones BFF desde `@/modules/solicitud-ubicacion/server`. Application no
importa DTOs de infraestructura y presentation ya no consume repositories.

El BFF conserva `upload/becas` por compatibilidad, pero selecciona la politica PDF
academica de ubicacion cuando la sesion es `UBICACION`. El build requirio acceso de
red para Geist. Playwright completo los smoke de ubicacion antes del bloqueo de
teardown; el timeout global de PDF falsificado de beca paso en su repeticion
aislada de 9.6 segundos.

## Resultado del Refactor Modular de Solicitud de Alumno Nuevo

- Fecha: 2026-08-17.
- Alcance: limites modulares de cuatro capas para `solicitud-nuevo`.
- Next.js: 16.2.12 y aplicacion 1.6.2, sin cambios de dependencias.
- `npm run lint`: correcto, incluidas las restricciones del feature.
- `npx tsc --noEmit`: correcto.
- Unitarias dirigidas: 31 de 31.
- `npm run test:unit`: 238 de 238 pruebas en 15 archivos.
- Smoke E2E de alumno nuevo: 10 de 10 escenarios correctos.
- Suite E2E completa: 93 de 93 escenarios correctos.
- `npm run build`: correcto con Turbopack; 22 paginas generadas.
- `npm run security:bundle-check`: correcto; sin secretos privados en el bundle.
- `npm run env:check`: correcto; configuracion privada presente y clave publica
  antigua ausente.
- `git diff --check`: correcto, con avisos informativos LF/CRLF de Windows.

El feature expone presentacion desde `@/modules/solicitud-nuevo`, composicion de
registro y correo desde `@/modules/solicitud-nuevo/client`, y catalogos/validacion
Q10 desde `@/modules/solicitud-nuevo/server`. Application ya no instancia gateways;
App Router, BFF y seguridad consumen solo las fronteras publicas.

El request DTO Q10 permanece explicito y los tipos de respuestas se infieren desde
Zod. El FormModel y el command quedaron en sus capas correspondientes, mientras el
schema OTP duplicado fue sustituido por el contrato shared estable.

El build inicial fallo por la descarga de Geist bloqueada en el sandbox; la
repeticion con red termino correctamente. Los 10 smoke y 93 E2E globales emitieron
resultado correcto antes de quedar abiertos durante el teardown conocido de
Playwright en Windows.

## Resultado de Gobierno Tecnico Automatizado

- Fecha: 2026-08-17.
- Alcance: CI, clasificacion de pruebas, accesibilidad, auditoria, codigo muerto y
  documentacion; sin cambios funcionales ni de contratos HTTP.
- Aplicacion: 1.6.4; Next.js: 16.2.12; Node.js de CI: 24.11.1.
- `npm ci`: correcto; lockfile alineado con la version 1.6.4.
- `npm run lint`: correcto.
- `npm run typecheck`: correcto.
- `npm run test:unit`: 227 de 227 en 13 archivos.
- `npm run test:integration`: 15 de 15 en 2 archivos.
- `npm run test:e2e:smoke`: 34 de 34.
- `npm run test:a11y`: 9 de 9, sin violaciones nuevas critical/serious.
- `npm run test:e2e`: 104 de 104.
- `npm run build`: correcto con acceso de red; 22 paginas generadas.
- `npm run dead-code:check`: correcto.
- `npm ls --depth=0`: sin dependencias faltantes o extraneous.
- `npm run audit:dependencies`: cuatro high conocidas, cero critical y ningun
  hallazgo nuevo; excepciones vigentes hasta 2026-09-17.
- `npm run env:check` y `npm run security:bundle-check`: correctos.
- `git diff --check`: correcto, con avisos informativos LF/CRLF.

Se crearon los workflows `quality.yml` y `regression.yml`. Los cuatro jobs
obligatorios deberan configurarse manualmente como branch protection tras el push.
La ejecucion local de Playwright sigue necesitando cerrar los listeners 3100/4100
despues del ultimo caso en Windows; todos los escenarios terminan antes del
bloqueo. El build sigue dependiendo de red para Geist.

## Simplificacion de Consulta Publica de Certificado

- Fecha: 2026-08-24.
- Alcance: simplificacion interna de `consulta-certificado`, sin cambios de rutas,
  contrato HTTP, diseño ni acceso publico por QR.
- Aplicacion: 1.6.5; Next.js: 16.2.12; sin cambios de dependencias.
- Archivos del feature: 9 a 6; lineas del feature: 343 a 300.
- Se retiraron caso de uso, puerto, repository de clase, singleton y mapper
  separado.
- Se agrego correspondencia obligatoria entre ID solicitado y `_id` externo, y el
  contrato Zod ahora descarta campos no declarados.
- `npm run lint`: correcto.
- `npm run typecheck`: correcto.
- `npm run test:unit`: 231 de 231 en 13 archivos.
- `npm run test:integration`: 15 de 15 en 2 archivos.
- Smoke E2E de consultas: 22 de 22 escenarios correctos; el proceso fue cerrado
  manualmente despues del bloqueo conocido del teardown en Windows.
- `npm run build`: correcto con acceso de red para Geist; 22 paginas generadas.
- `npm run dead-code:check`: correcto.
- `npm run security:bundle-check`: correcto; sin secretos en `.next/static`.
- `npm run env:check`: correcto; variables privadas presentes y API key publica
  antigua ausente.
- `git diff --check`: correcto, con advertencias informativas LF/CRLF.

Permanecen pendientes la confirmacion de entropia del ID QR, el rate limiting
distribuido y la ratificacion funcional de los campos educativos expuestos en la
verificacion publica.

## Simplificacion de `modules/shared`

- Fecha: 2026-08-31.
- Aplicacion: 1.6.5; Next.js: 16.2.12; sin cambios de dependencias.
- `modules/shared`: 24 a 21 archivos y 1061 a 976 lineas.
- Fetch cliente adicional de `textos` en pago: 1 a 0.
- Exports y tipos shared sin uso detectados por Knip: 18 a 0.
- `npm run lint` y `npm run typecheck`: correctos.
- `npm run test:unit`: 233 de 233.
- `npm run test:integration`: 15 de 15.
- Smoke: 33 escenarios correctos en conjunto y la guarda restante correcta en
  repeticion aislada tras ajustar un matcher de acento del test.
- `npm run test:a11y`: 9 de 9.
- `npm run build`: correcto con acceso de red para Geist; 22 paginas generadas.
- `npm run dead-code:check`, `npm run security:bundle-check`, `npm run env:check`
  y `git diff --check`: correctos.
- Auditoria: cuatro excepciones `high` conocidas hasta 2026-09-17, cero
  `critical` y ningun hallazgo nuevo.

Se retiraron el cache global de textos, dos hooks, el service asociado, las
fachadas HTTP/storage sin comportamiento y tipos legacy. Los catalogos server-side
se inyectan a `FinData`; precios y reglas de negocio permanecen en cada feature.

## Simplificacion Segura de las Rutas API

- Fecha: 2026-08-31.
- Aplicacion: 1.6.5; Next.js: 16.2.12; sin cambios de dependencias.
- Se reemplazo la allowlist ambigua por 12 operaciones explicitas ligadas a sesion
  OTP o de consulta.
- Catalogos y lecturas exclusivamente server-side se retiraron del proxy del
  navegador sin cambiar sus contratos externos.
- Las sesiones se descifran una vez por request y se ejecuta un solo validador de
  solicitud segun el proposito.
- Email de estudiantes y becas, tipo de solicitud y tipo de cargo se comprueban
  contra la sesion antes de continuar.
- `npm run lint` y `npm run typecheck`: correctos.
- `npm run test:unit`: 284 de 284.
- `npm run test:integration`: 22 de 22.
- `npm run test:e2e:smoke`: 34 de 34 en la repeticion final. Una ejecucion previa
  tuvo una espera intermitente del dialogo de ubicacion; el caso paso aislado y en
  el lote final sin cambios de producto.
- `npm run test:a11y`: 9 de 9.
- `npm run build`: correcto con acceso de red para Geist; 22 paginas generadas.
- `npm run dead-code:check`: correcto.
- `npm run audit:dependencies`: cuatro excepciones `high` conocidas hasta
  2026-09-17, cero `critical` y ningun hallazgo nuevo.
- `npm run security:bundle-check`: sin secretos privados en `.next/static`.
- `npm run env:check`: correcto; API key publica antigua ausente.
- `git diff --check`: correcto, con avisos informativos LF/CRLF de Windows.

Permanece pendiente comprobar en servidor que un documento digital pertenece al
DNI de la sesion de consulta. No se implemento cache ni se modificaron URLs,
componentes, stores, formularios o contratos backend.

## Simplificacion Pragmatica de `modules/security`

- Fecha: 2026-09-01.
- Aplicacion: 1.6.5; Next.js: 16.2.12; sin cambios de dependencias.
- El Route Handler dinamico paso de 234 a 62 lineas fisicas y quedo limitado a
  resolver operacion, leer sesiones, autorizar, validar, reenviar y responder.
- `modules/security/server/schemas.ts` paso de 119 a 28 lineas y solo conserva
  OTP, consulta y notificacion.
- El conjunto seguridad/BFF paso de 1326 a 1348 lineas no vacias: aumento 1.7 %
  por caracterizacion de cookies y dispatch explicito, mientras las reglas dejaron
  de estar concentradas en un solo archivo.
- La politica y validacion HTTP viven junto a `app/api/ciunac`; cada feature
  devuelve su DTO definitivo desde su API publica `server.ts`.
- `modules/security` no importa internals de consultas ni de features de solicitud.
- `security-client.ts` conserva sus cuatro funciones publicas y valida localmente
  la respuesta minima de consulta.
- Todos los exports publicos de sesiones, nombres de cookies, `HttpOnly`,
  `SameSite=Strict`, `Secure` en produccion y TTL permanecen compatibles.
- Se agregaron 6 contratos de Route Handlers/cookies y una integracion de
  aceptacion digital; integracion paso de 23 a 30 pruebas.
- `npm run lint` y `npm run typecheck`: correctos.
- `npm run test:unit`: 284 de 284.
- `npm run test:integration`: 30 de 30.
- `npm run test:e2e:smoke`: 34 de 34 escenarios correctos.
- `npm run test:a11y`: 9 de 9 escenarios correctos.
- `npm run test:e2e`: 104 de 104 escenarios correctos. La primera ejecucion
  detecto que la aceptacion digital solicitaba tambien una sesion OTP; se corrigio
  y la repeticion completa paso.
- Playwright queda abierto despues del ultimo escenario por el teardown conocido
  en Windows y se cierra manualmente; no se observaron fallos funcionales finales.
- `npm run build`: correcto con acceso de red; 22 paginas generadas.
- `npm run dead-code:check` y `npm ls --depth=0`: correctos.
- `npm run audit:dependencies`: cuatro excepciones `high` conocidas hasta
  2026-09-17, cero `critical` y ningun hallazgo nuevo.
- `npm run security:bundle-check`: sin valores privados en `.next/static`.
- `npm run env:check`: configuracion privada valida y API key publica ausente.
- `git diff --check`: correcto, con avisos informativos LF/CRLF de Windows.

Permanecen como deuda el replay OTP sin estado server-side, la propiedad por DNI
de documentos digitales, las cuatro vulnerabilidades baselineadas y el teardown
local de Playwright. No se modificaron URLs, contratos backend, componentes,
stores, diseno, cache ni reglas funcionales.

## Simplificacion Pragmatica: Pasos 1 y 2

- Fecha: 2026-09-22; aplicacion 1.6.5 y Next.js 16.2.12, sin actualizaciones.
- Se preserva el worktree pendiente; esta entrega solo cambia tooling, pruebas de
  arquitectura y documentacion, no los modulos funcionales.
- ESLint aplica una unica regla de dependencias con 63 pruebas de configuracion
  efectiva y excepciones puntuales compatibles con el codigo actual.
- Inventario, APIs, secuencias, resultados de cierre y riesgos se registran en
  [Linea base pragmatica](pragmatic-simplification-baseline.md).
- Cierre: lint, type-check, 363 unitarias, 38 integraciones, 110 E2E (34 smoke y
  9 axe incluidos), Knip, build con red, bundle-check y env-check correctos.
- La regresion usa servidores de prueba independientes para evitar el teardown
  Windows; no hubo fallos ni escenarios omitidos en la repeticion final.
- Las excepciones conocidas de auditoria vencidas no se renovaron ni se
  presentaron como una auditoria aprobada en esta entrega.
- El piloto de certificados (paso 3) no esta iniciado.

## Simplificacion Pragmatica: Piloto de Certificados (Paso 3)

- Fecha: 2026-09-22; aplicacion 1.6.5 y Next.js 16.2.12 sin actualizaciones.
- `solicitud-certificado`: 31 a 22 archivos, siete clases delegadoras a cero.
- Funciones de operacion con dependencias inyectables; modelo, schema y store
  visibles en la raiz; componentes y adaptadores agrupados por responsabilidad.
- Se preservan las APIs publicas, el pago/voucher compartido, sesiones, precio
  autorizado en BFF, resultado parcial de correo y PDF A4 diferido.
- Unitarias: 377/377 (52 del feature, 67 de arquitectura). Integracion: 48/48.
- Lint, type-check, Knip, build con red, bundle-check y env-check correctos.
- El primer lote E2E tuvo un timeout OTP en beca: certificados 15/15 y axe 9/9
  pasaron. El caso de beca paso aislado sin cambios. La repeticion completa cerro
  con 110/110, exit 0, cero fallos/omisiones/flaky; incluye 34 smoke y 9 axe.
- Clasificacion, estructura, contratos, pruebas y riesgos en
  [Piloto pragmatico de certificados](phase-2f-solicitud-certificado.md#piloto-pragmatico-paso-3).
- Sin cambios funcionales en otros features, rutas, BFF ni shared. Paso 4 pendiente.

## Simplificacion Pragmatica: Constancias (Primer Feature del Paso 4)

- Fecha: 2026-09-23; aplicacion 1.6.5 y Next.js 16.2.12 sin actualizaciones.
- `solicitud-constancia`: 31 a 22 archivos y siete clases delegadoras a cero.
- APIs publicas conservadas; funciones con dependencias inyectables, DTO inferido,
  guardas de borrador durante render y metadata de errores de correo preservada.
- Pago, voucher, sesiones, precio validado en BFF, resultado parcial, reintento
  exclusivo y PDF A4 diferido sin cambios de contrato ni diseno.
- Lint, type-check, 387 unitarias, 62 integraciones, Knip, build con red,
  bundle-check, env-check y diff-check correctos.
- Regresion E2E: 110/110, exit 0, cero omisiones/flaky; incluye 6 de constancias,
  34 smoke y 9 axe. Antes de mover archivos, los seis E2E del feature tambien pasaron.
- El primer intento completo no arranco por referencias antiguas del dev server
  de pruebas; reiniciarlo resolvio el entorno sin ajustes productivos. El build
  requirio acceso a Google Fonts. Ambos intentos se registran en el informe.
- Cero cambios productivos fuera de constancias y cero imports profundos externos.
- [Detalle, contratos y riesgos](phase-2a-constancia-typing.md#simplificacion-pragmatica-paso-4-constancias).
- Paso 4 parcial: constancias completo; alumno nuevo queda para el siguiente cambio.

## Simplificacion Pragmatica: Alumno Nuevo (Cierre del Paso 4)

- Fecha: 2026-09-23; aplicacion 1.6.5 y Next.js 16.2.12 sin actualizaciones.
- `solicitud-nuevo`: 25 a 21 archivos y tres clases delegadoras a cero.
- APIs publicas intactas; funciones inyectables, DTO Q10 inferido y guardas de
  borrador en lugar de validacion completa durante render.
- Se conservan OTP, sesion, programa autorizado, respuesta Q10 sin cuerpo,
  bloqueo de escritura indeterminada y reintento exclusivo del correo.
- Errores de correo conservan categoria, status, correlationId y retryable.
- Lint, type-check posterior al build, 399 unitarias, 79 integraciones, Knip,
  build con red, bundle-check y env-check correctos.
- E2E dirigido: 11/11 antes de mover archivos. Regresion final: 111/111 en
  315.4 segundos, exit 0, cero fallos/omisiones/flaky; incluye 34 smoke, 9 axe
  y 11 escenarios de alumno nuevo. Servidores de prueba independientes.
- Cero cambios productivos fuera del feature segun comparacion del inventario;
  cuatro archivos de pruebas adaptados/agregados, documentacion actualizada.
- `git diff --check` correcto; se preserva todo el trabajo previo pendiente.
- [Detalle, contratos, cobertura y riesgos](phase-2g-solicitud-nuevo.md#simplificacion-pragmatica-paso-4-alumno-nuevo).
- Paso 4 completo. No se inicia el paso 5. Google Fonts, idempotencia Q10,
  teardown administrado de Windows y auditoria vencida siguen como riesgos.

## Simplificacion Pragmatica: Becas y Ubicacion (Paso 5)

- Fecha: 2026-09-24; aplicacion 1.6.5 y Next.js 16.2.12 sin actualizaciones.
- Organizacion plana por responsabilidad, conservando APIs publicas y operaciones
  ya simplificadas: 24 archivos en becas, 31 en ubicacion, cero clases en ambos.
- Se retira un delegado interno de correo y se preservan codigo, status,
  correlationId, details y retryable de errores de beca. No cambian contratos HTTP.
- Se conservan cinco documentos PDF de beca, perfil CIUNAC, duplicidad, tarifa
  S/ 30, pago compartido, validacion binaria, OTP/CAPTCHA y PDF diferido.
- Se agregan 10 integraciones de beca y 18 de ubicacion, con DTO exacto,
  respuestas vacias/mal formadas, errores y correo reintentado sin otra escritura.
- Lint y type-check posterior al build correctos. Unitarias: 406/406.
  Integracion: 107/107. Knip correcto.
- Playwright completo: 111/111, exit 0, cero fallos/omisiones/flaky, 308.8 segundos.
  Incluye 34 smoke, 9 axe, 10 escenarios de beca y 16 de ubicacion. Reporte local:
  `%TEMP%/ciunac-step5-final-e2e.json`.
- Los servidores sinteticos independientes evitan el teardown administrado de
  Windows; se cerraron al terminar y antes de ejecutar el build final.
- Build con acceso a Google Fonts correcto, 22 paginas generadas. Bundle-check:
  sin valores privados configurados en `.next/static`. Env-check correcto, sin
  editar `.env` ni mostrar secretos. `git diff --check` correcto, avisos LF/CRLF.
- Se corrigieron tres literales alterados durante el traslado (separador de
  extension y dos filtros PDF), agregando pruebas para evitar la regresion.
  El primer E2E de beca tuvo dos fallos intermitentes; su repeticion y el cierre
  conjunto pasaron sin omitir escenarios. La causa inicial no se da por resuelta.
- Se actualizaron ADR-020, ADR-023, SDD, convenciones, contratos y trazabilidad;
  no se creo otro ADR para movimientos de archivos.
- Cambios productivos de esta etapa limitados a becas y ubicacion; se preservan
  los cambios previos acumulados. No se inicia el paso 6.
- Informes: [Becas](phase-2e-solicitud-beca.md#paso-5-cierre-pragmatico-de-becas) y
  [Ubicacion](phase-2h-solicitud-ubicacion.md#paso-5-cierre-pragmatico-de-ubicacion).
- Pendientes: avisos previos de mascara, dependencia de red de fuentes,
  propiedad de URLs/idempotencia backend y excepciones de auditoria vencidas
  el 2026-09-17. Esta entrega no renueva ni aprueba esa auditoria.

## Simplificacion Pragmatica: Consultas (Paso 6)

- Fecha: 2026-09-24; aplicacion 1.6.5 y Next.js 16.2.12 sin actualizaciones.
- `consultas`: 9 a 8 archivos, tres clases a cero. `consulta-solicitud`: 14 a 12
  archivos, tres clases a cero. `consulta-ubicacion`: 13 a 12 archivos, cinco
  clases a cero. Total: 36 a 32 archivos, once clases sin estado retiradas.
- Funciones inyectables en `operations.ts`, modelo puro en `model.ts`, UI y
  presenter en `components/`; mappers, schemas y transporte separados.
- Se conservan APIs existentes, contratos HTTP, sesion/CAPTCHA, ausencia/error,
  aliases historicos de documentos, aceptacion previa a descarga y PDFs diferidos.
  No se rehace consulta-certificado ni se modifican registros, shared o seguridad.
- Cambio productivo externo minimo: el handler de consulta usa la nueva entrada
  publica `findConsultationRequests`. Misma respuesta y cookie, un GET y ningun
  texto auxiliar. Se elimina su excepcion de imports profundos en ESLint.
- Solicitudes y textos mantienen dos lecturas paralelas; ubicacion mantiene cinco,
  sin un GET adicional para el cargo. Todas las lecturas privadas siguen sin cache.
- Quince integraciones nuevas pasaron contra la implementacion anterior; dos mas
  cubren el lookup publico. Se agregan dos E2E de fallo/reintento de aceptacion.
- Lint y type-check, tambien despues del build, correctos. Unitarias: 406/406.
  Integracion: 124/124. Knip correcto.
- E2E dirigido previo: 22/22. Primera suite ampliada: 111/113; dos aserciones
  nuevas asumian un GET inicial en desarrollo, donde se observaron dos. Se cambio
  la medicion a lecturas antes/despues del reintento, sin cambiar producto ni
  omitir aserciones de bloqueo, descarga o escrituras. Repeticion dirigida: 2/2.
- Regresion final: 113/113, exit 0, cero fallos/omisiones/flaky, 300.3 segundos.
  Incluye 24 de consultas, 34 smoke y 9 axe. Reporte local:
  `%TEMP%/ciunac-step6-final-e2e.json`.
- Se usaron servidores sinteticos independientes en 3100/4100 para evitar el
  teardown administrado de Windows. Se cerraron antes del build.
- Build con acceso a Google Fonts correcto; 22 paginas generadas. Bundle-check:
  sin valores privados configurados en `.next/static`. Env-check correcto,
  sin editar `.env` ni imprimir valores. `git diff --check` correcto, avisos LF/CRLF.
- La comparacion de los diez archivos de presentacion, excluyendo imports y tipos,
  no encontro cambios ejecutables. No se hizo una nueva certificacion visual de
  los PDFs; el formato se conserva y los E2E prueban las descargas cubiertas.
- Se actualizaron ADR-010, ADR-012, ADR-018, ADR-019, SDD, convenciones, contratos,
  trazabilidad y los informes de Fases 2B/2D. No se crea otro ADR por movimientos.
- Se preserva el worktree previo. Paso 6 completo; no se inician los pasos 7 y 8.
  Siguen pendientes propiedad por DNI del documento digital, fuentes remotas,
  avisos de mascara y excepciones de auditoria vencidas; no se renueva esa baseline.

## Simplificacion Pragmatica: Capacidades Compartidas (Paso 7)

Fecha: 2026-09-25. Version 1.6.5 y dependencias sin cambios. Se preserva el diff
acumulado; no se modifican contratos backend, rutas, precios, OTP/CAPTCHA,
estado de flujos, diseno ni formato/carga diferida de PDFs.

| Verificacion | Archivos | Pagos | HTTP / cierre |
| --- | --- | --- | --- |
| Lint | Correcto | Correcto | Correcto, sin warnings |
| Type-check | Correcto | Correcto | Correcto, tambien tras build |
| Unitarias | 417/417 | 431/431 | 431/431 |
| Integracion | 124/124 | 124/124 | 166/166 |
| Regresion Playwright | 113/113 | 113/113 | 113/113 |
| Smoke incluidos | 34 | 34 | 34 |
| Axe incluidos | 9 | 9 | 9 |
| Build | 22 paginas | 22 paginas | 22 paginas |
| Knip | Correcto | Correcto | Correcto |
| Bundle / entorno | Correctos | Correctos | Correctos |
| Diff-check con configuracion del repo | Correcto | Correcto | Correcto |

- Los tres reportes terminaron con exit 0, cero omitidos y cero flaky:
  archivos 290.1 s, pagos 308.4 s, HTTP 329.4 s. Reportes:
  `%TEMP%/ciunac-step7-files-corrected-e2e.json`,
  `%TEMP%/ciunac-step7-payments-e2e.json`,
  `%TEMP%/ciunac-step7-final-e2e.json`.
- Primer intento del grupo de archivos: detenido tras fallos de voucher. El
  adaptador copiaba File mediante spread y perdia metadata del prototipo.
  Corregido con lectura explicita y una unitaria nativa; repeticion completa verde.
- Primer intento unitario del grupo HTTP: 364 correctas, 67 omitidas por timeout
  de 30 s al cargar ESLint en beforeAll. Repeticion: 431 correctas, sin omitir
  pruebas ni aumentar el limite. Se retiro un import que quedo sin uso.
- El diff-check con autocrlf desactivado por comando detecto CRLF como whitespace;
  no se alteraron archivos para ello. Con la configuracion real del repo pasa,
  conservando avisos existentes de conversion LF/CRLF.
- El navegador comparte un solo fetch/decoder; el servidor mantiene su cliente
  privado con no-store. Las integraciones existentes protegen secuencias exactas,
  DTOs, un solo registro y reintento exclusivo de notificacion.
- Se ejecutaron servidores sinteticos propios en 3100/4100, cerrados antes de
  cada build. El puerto de desarrollo del usuario no se detuvo. Builds con red
  por Google Fonts; no se imprimieron ni editaron valores del entorno.

### Gate de Seguridad Pendiente

`npm run audit:dependencies` falla (exit 1): 4 hallazgos de produccion,
**1 critical y 3 high**. Nuevas referencias informadas por el gate:
`next:1193676:critical`, `next:1193732:critical`, `sharp:1193725:high`.
Las excepciones de nanoid/postcss/sharp vencieron el 2026-09-17.
No se renovaron excepciones ni se actualizaron dependencias. El gate de auditoria
no se considera aprobado; requiere una correccion de seguridad aislada antes de
desplegar. Esto no es una regresion de dependencias introducida por el refactor.

Se actualizan ADR-004/028, SDD, convenciones, contratos, trazabilidad e informe
shared existente. Paso 7 completo; paso 8 no iniciado. Permanecen las deudas de
propiedad de documentos, replay OTP sin persistencia, fuentes remotas y avisos de
mascaras. No se realizo una nueva certificacion visual de PDFs.

Detalles e inventario: [capacidades compartidas](shared-simplification.md#paso-7-consolidacion-de-capacidades).

## Simplificacion Pragmatica: Cierre Documental (Paso 8)

Inicio 2026-09-25, continuacion 2026-09-28. Aplicacion 1.6.5, Next.js 16.2.12;
sin cambios de dependencias, version, contratos, entorno real o diseno.
Este apartado describe solo el paso 8, no atribuye el diff acumulado a este cierre.

### Alcance

SDD v1.4, convenciones, checklist, mapa Mermaid, overview, README, roadmap,
trazabilidad e informes de limpieza/auditoria actualizados. ADR-031 documenta
la decision general y reemplaza parcialmente ADR-003.
Siete declaraciones sin consumidores retiradas en tres archivos; APIs, schemas
funcionales, importacion diferida PDF y adaptadores con comportamiento conservados.

### Intentos y evidencia

- 2026-09-25: lint, type-check, 431 unitarias, 166 integraciones, Knip y npm ls
  correctos. E2E completo: 112 correctos y un timeout de voucher en ubicacion,
  723.4 segundos; el navegador mostro error de conexion. No se afirma una causa.
- 2026-09-28: el caso aislado de ubicacion paso en 32.6 segundos sin cambiar tests.
- Primera repeticion completa del 28: 112 correctos y un timeout de consulta de
  constancia antes de llegar al detalle, 343.2 segundos. Ubicacion paso.
  Hubo advertencias de compilacion sobre exports existentes en el fuente.
- Para comprobar ese estado se detuvieron solo los servidores E2E propios y se
  elimino exclusivamente la cache ignorada .next-e2e, con ruta verificada.
  Se reiniciaron mock/app y se repitieron los mismos 113 casos.
- No se aumentaron timeouts, no se omitieron tests y no se alteraron flujos para
  obtener un resultado verde. Un resultado posterior no borra fallos anteriores.
- Un diff-check detecto una linea vacia al final de lib/utils.ts introducida al
  eliminar omit; se corrigio ese formato, sin modificar la logica restante.

Reportes locales de estas ejecuciones en TEMP: ciunac-step8-final-e2e.json,
ciunac-step8-ubicacion-recheck.json, ciunac-step8-20260928-e2e.json y
ciunac-step8-clean-cache-e2e.json. Son artefactos locales, no se versionan.

### Seguridad pendiente

Auditoria del 2026-09-28: exit 1, cuatro paquetes afectados (1 critical, 3 high).
Nuevas referencias: next:1193676:critical, next:1193732:critical,
sharp:1193725:high. Excepciones nanoid/postcss/sharp vencidas el 2026-09-17.
No se renuevan baselines ni se actualizan dependencias en este cierre.
Ver [auditoria vigente](dependency-audit.md).

Permanecen propiedad backend de archivos/documentos, replay OTP sin persistencia,
idempotencia no garantizada, filtros Q10 y fuentes remotas. No se verifica
administracion de branch protection ni se certifica visualmente cada PDF.
Cerrar la simplificacion no autoriza merge/despliegue con gates bloqueados.

### Resultado final del 2026-09-28

| Comprobacion | Resultado |
| --- | --- |
| lint | Correcto, exit 0 |
| typecheck | Correcto, incluido despues del build |
| unitarias | 431/431, 16 archivos |
| integracion | 166/166, 10 archivos |
| regresion E2E con cache regenerada | 113/113, exit 0, 310.8 segundos |
| smoke / accesibilidad | 34 / 9 correctos, incluidos en esos 113 |
| build de produccion | Correcto, 22 paginas generadas |
| dead-code:check | Correcto; sin archivos/dependencias/imports pendientes en el gate |
| npm ls --depth=0 | Correcto; sin extraneous ni faltantes |
| bundle-check | Sin valores privados configurados en .next/static |
| env-check | Variables requeridas presentes; NEXT_PUBLIC_API_KEY ausente |
| git diff --check | Correcto; permanecen advertencias historicas LF/CRLF |
| enlaces documentales | 16 documentos, 84 enlaces/anclas locales sin errores |
| auditoria de dependencias | BLOQUEADA: 1 critical, 3 high y excepciones vencidas |

El JSON de la ultima regresion registra cero omitidos, inesperados o flaky.
Los dos timeouts anteriores quedan arriba: este resultado no demuestra una
solucion definitiva a las advertencias intermitentes de desarrollo. No hubo
cambio funcional, aumento de timeout ni omision para pasar.

Tras detener los servidores propios se retiraron nueve directorios antiguos
vacios en consulta-certificado y shared, sin borrado recursivo de fuentes.
Lint, type-check, unitarias, integracion, Knip y build se ejecutaron despues.
El build se ejecuto con red por Google Fonts, nunca en paralelo con E2E.
Env-check no confirma rotacion o validez de las credenciales ante el proveedor.

En los 16 documentos del cierre se revisaron enlaces locales, anclas y bloques
Markdown. No se afirma una nueva certificacion visual de PDF o render Mermaid.
Los cambios pendientes anteriores se preservan, sin staging ni commit.
Los pasos 1 a 8 quedan implementados; no se inicia otro trabajo automaticamente.
