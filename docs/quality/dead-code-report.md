# Informe de Codigo Muerto

## Resultado

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

Tambien se retiraron cuatro stores de catalogos sin suscriptores de
`stores/types.stores.ts`. Se conserva `useTextsStore` porque tiene consumidores.

## Dependencias

`npm ls --depth=0` no informa paquetes extraneous ni faltantes. Knip no confirmo
dependencias directas innecesarias, por lo que no se elimino ninguna. `@next/env`
se declaro de forma directa porque los scripts de entorno lo importan.

## Seguimiento No Bloqueante

La linea base final contiene 30 exports y 28 tipos exportados sin consumidores
detectados. Se mantienen como informe programado y no bloqueante para depurarlos
en cambios pequenos, verificando antes APIs publicas, imports dinamicos, scripts y
configuracion.
