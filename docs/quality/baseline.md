# Linea Base de Calidad

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

ADR-017 reemplaza exclusivamente la autorizacion por sesion de ADR-011. La
arquitectura modular, la validacion Zod, el repository server-only y el presenter
permanecen vigentes.

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
