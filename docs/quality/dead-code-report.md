# Informe de Codigo Muerto

## Resultado historico inicial

Knip detecto inicialmente 12 archivos. Tres eran entradas dinamicas reales de
fixtures y soporte E2E, ahora declaradas en `knip.json`. Los nueve archivos legacy
restantes no tenian consumidores y fueron retirados:

- `components/forms/select-facultad.field.tsx`
- `components/forms/select-lang.field.tsx`
- `components/forms/select-solicitud.tsx`
- `hooks/useCatalogStore.ts`
- `hooks/useEscuelas.ts`
- `hooks/useFacultades.ts`
- `hooks/useSolicitudes.ts`
- `hooks/useSubjects.ts`
- `services/types.service.ts`

Tambien se retiraron cuatro stores de catalogos sin suscriptores. El ultimo cache
cliente de textos, su hook y su service se retiraron el 2026-08-31 al inyectar el
texto de pago desde los catalogos ya cargados en servidor.

## Dependencias en la fase inicial

`npm ls --depth=0` no informa paquetes extraneous ni faltantes. Knip no confirmo
dependencias directas innecesarias, por lo que no se elimino ninguna. `@next/env`
se declaro de forma directa porque los scripts de entorno lo importan.

## Seguimiento No Bloqueante Inicial

La linea base inicial contiene 30 exports y 28 tipos exportados sin consumidores
detectados. Se mantienen como informe programado y no bloqueante para depurarlos
en cambios pequenos, verificando antes APIs publicas, imports dinamicos, scripts y
configuracion.

## Cierre del Paso 8

Revision iniciada el 2026-09-25 y cerrada documentalmente el 2026-09-28.
La comparacion es contra el codigo posterior al paso 7, no contra HEAD, que
todavia incluye cambios pendientes de varias fases.

- Knip no identifica archivos completos o dependencias directas eliminables.
- Se comprobaron imports estaticos/dinamicos, scripts, configuracion y consumidores
  antes de retirar siete declaraciones sin uso, en tres archivos.
- lib/constants.ts: DocumentType, DocumentTypeMap, Gender y GenderTypeMap.
  NIVEL permanece con sus consumidores.
- lib/utils.ts: getFileExtension y omit. Se conservan cn, obtenerPeriodo e isPdf.
- solicitud-beca/components/basic-data.schema.ts: initialValues sin consumidores.
  El schema y su tipo de formulario se conservan sin cambiar validaciones.
- No se eliminaron archivos completos, APIs publicas, dependencias ni politicas.
- Se retiraron nueve directorios ya vacios de consulta-certificado y shared;
  no se borro recursivamente codigo ni se retiraron archivos no inspeccionados.

El reporte compacto de Knip pasa de 19 a 16 ubicaciones con exports sin uso y
de 24 a 23 ubicaciones con tipos exportados sin uso. Esas cifras agrupan por
archivo, no son el numero de simbolos. Son avisos informativos, no nuevos fallos
del gate files/dependencies/unlisted/unresolved.

Se conservan deliberadamente:

- Exports shadcn, tipos de workflow y contratos publicos: revisarlos individualmente
  antes de retirar una API; no se hace una poda global de exports.
- PDFs: seis componentes usan imports dinamicos al descargar; no son archivos muertos.
- Entradas de scripts, mocks y fixtures E2E declaradas en knip.json.
- services/storage.service.ts: construccion multipart, nombre y schema de respuesta.
- mailApiRepository: convierte notificacion segura en comprobante.
- AppError y SecurityError: clases con comportamiento, no ceremonia por su nombre.

Verificacion y riesgos completos:
[cierre](pragmatic-simplification-baseline.md#paso-8-cierre-documental-y-limpieza).
