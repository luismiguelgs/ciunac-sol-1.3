# Linea Base de Rendimiento Frontend

## Identificacion

- Fecha: 2026-08-17.
- Aplicacion: 1.6.3.
- Next.js: 16.2.12 con Turbopack.
- Alcance implementado: carga diferida de la generacion local de PDF.
- Fuera de alcance: cache de catalogos, stores, fronteras cliente, imagenes y fuentes.

## Linea Base Funcional

Antes de modificar los puntos de descarga se verifico:

- `npm run lint`: correcto.
- `npx tsc --noEmit`: correcto.
- `npm run test:unit`: 238 de 238 pruebas.
- `npm run build`: correcto con acceso de red para Google Fonts.
- Git: sin cambios pendientes.

## JavaScript Inicial Antes Del Cambio

Las cifras se obtuvieron desde `entryJSFiles` de los manifiestos de cliente del
build de produccion. Los bytes gzip son la suma de cada chunk inicial comprimido
individualmente.

| Ruta | Requests JS | JS crudo | JS gzip |
| --- | ---: | ---: | ---: |
| `/solicitud-ubicacion` | 13 | 2203.3 KiB | 689.3 KiB |
| `/solicitud-ubicacion/proceso` | 13 | 2202.4 KiB | 689.1 KiB |
| `/solicitud-ubicacion/finalizar` | 13 | 2202.4 KiB | 689.1 KiB |
| `/solicitud-certificados/proceso` | 12 | 2163.7 KiB | 675.9 KiB |
| `/solicitud-certificados/finalizar` | 12 | 2163.7 KiB | 675.9 KiB |
| `/solicitud-constancias/proceso` | 12 | 2161.9 KiB | 675.4 KiB |
| `/solicitud-constancias/finalizar` | 12 | 2161.9 KiB | 675.3 KiB |
| `/consulta-solicitud/[dni]` | 8 | 1979.0 KiB | 619.3 KiB |
| `/consulta-ubicacion/[dni]` | 7 | 1589.3 KiB | 521.3 KiB |

El renderer PDF aparecia en dos chunks equivalentes de 1434.4 KiB crudos y
aproximadamente 474 KiB gzip. Cada ruta afectada incluia uno de ellos antes de que
el usuario solicitara una descarga.

## Diagnostico

- Los seis botones de descarga importaban estaticamente `@react-pdf/renderer` y
  su documento PDF concreto.
- Las entradas publicas de los features hacian que ese grafo alcanzara incluso
  rutas de inicio y proceso donde no se genera un PDF.
- No existia carga diferida con `import()` o `next/dynamic` en el repositorio.
- La generacion es una accion explicita del usuario, por lo que el renderer no es
  necesario para la primera pintura ni para hidratar el formulario.
- Se encontraron 79 archivos con frontera `use client`; no se detectaron
  suscripciones al store completo.
- Los cinco stores persistidos de catalogos usan selectores. Cuatro parecen
  asociados solo a componentes legacy; `textos` sigue activo y se revalida al
  montar `FinData`.
- Las escrituras estudiante, solicitud y correo son secuenciales por dependencia
  y no deben paralelizarse.
- La consulta de ubicacion ya paraleliza contexto, notas, examenes y ciclos. La
  validacion de tarifa y duplicidad durante el registro sigue siendo secuencial.

## Matriz De Cache Propuesta

Esta matriz documenta una optimizacion futura. No se implementa cache en este
cambio. Las frecuencias son estimaciones de dominio pendientes de validacion con
el responsable del backend.

| Recurso | Dato | Acceso | Cambio | Estrategia | Revalidacion | Invalidacion | Riesgo obsoleto |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `tipossolicitud` | Tarifas y tipos | Publico | Bajo, sensible | Cache server con tag | 60 s | Cambio de tarifa | Alto |
| `idiomas` | Catalogo | Publico | Muy bajo | Cache server con tag | 6 h | Mantenimiento | Bajo |
| `facultades` | Catalogo | Publico | Bajo | Cache server con tag | 6 h | Cambio academico | Bajo |
| `escuelas` | Catalogo relacionado | Publico | Bajo | Cache server con tag | 6 h | Cambio academico | Medio |
| `textos` | Contenido y nombre del ano | Publico | Bajo/medio | Cache server con tag | 15 min | Publicacion | Medio |
| `cronogramaubicacion` | Cronograma | Publico | Medio/alto | Cache server con tag | 60 s | Cambio de fecha | Alto |
| `examenesubicacion` | Fechas de examen | Publico | Medio | Cache server con tag | 5 min | Cambio de examen | Medio |
| `ciclos` | Catalogo academico | Publico | Bajo | Cache server con tag | 1 h | Apertura o cierre | Bajo |
| Programas Q10 | Opciones con credencial privada | Publico en UI | Medio | Cache server con tag | 5 min | Sincronizacion Q10 | Medio |
| Solicitudes, alumnos, cargos, notas y documentos | Datos personales | Privado | Transaccional | `no-store` | No aplica | No aplica | No admitir cache global |
| Certificado por QR | Recurso individual sensible | Publico por URL | Transaccional | `no-store` | No aplica | No aplica | No admitir cache global |

## Implementacion

- Los seis botones mantienen su presentacion y cargan el renderer y documento con
  `Promise.all([import(...), import(...)])` dentro del evento de descarga.
- No se usa precarga por hover o foco.
- Los cargos de certificado, constancia y ubicacion bloquean clics repetidos y
  muestran el estado `Generando cargo...`.
- Los formatos PDF, textos, DTOs, reglas de negocio y nombres de archivo no se
  modificaron.
- La fuente Roboto remota de la constancia de ubicacion permanece como deuda.

## Criterios De Salida

- Ningun chunk con React PDF debe aparecer en `entryJSFiles` de las rutas afectadas.
- El renderer debe descargarse solo despues de activar una generacion PDF.
- Las descargas deben conservar contenido, nombre, formato A4 y manejo de error.
- Se compararan requests JS y bytes crudos/gzip con la tabla inicial.

## Resultado Posterior

El build posterior dejo React PDF en un unico chunk asincrono de 1434.0 KiB crudos
y 473.2 KiB gzip. Ninguna ruta afectada lo incluye en `entryJSFiles`.

| Ruta | Requests antes/despues | JS crudo antes/despues | JS gzip antes/despues |
| --- | ---: | ---: | ---: |
| `/solicitud-ubicacion` | 13 / 12 | 2203.3 / 769.0 KiB | 689.3 / 215.7 KiB |
| `/solicitud-ubicacion/proceso` | 13 / 12 | 2202.4 / 768.2 KiB | 689.1 / 215.4 KiB |
| `/solicitud-ubicacion/finalizar` | 13 / 12 | 2202.4 / 768.2 KiB | 689.1 / 215.4 KiB |
| `/solicitud-certificados/proceso` | 12 / 11 | 2163.7 / 729.4 KiB | 675.9 / 202.2 KiB |
| `/solicitud-certificados/finalizar` | 12 / 11 | 2163.7 / 729.4 KiB | 675.9 / 202.2 KiB |
| `/solicitud-constancias/proceso` | 12 / 11 | 2161.9 / 727.5 KiB | 675.4 / 201.6 KiB |
| `/solicitud-constancias/finalizar` | 12 / 11 | 2161.9 / 727.5 KiB | 675.3 / 201.6 KiB |
| `/consulta-solicitud/[dni]` | 8 / 7 | 1979.0 / 545.4 KiB | 619.3 / 146.0 KiB |
| `/consulta-ubicacion/[dni]` | 7 / 6 | 1589.3 / 150.6 KiB | 521.3 / 45.0 KiB |

La reduccion es de aproximadamente 1.43 MiB crudos, entre 473 y 476 KiB gzip y
un request JS inicial por ruta. Al solicitar una descarga se recupera el chunk
asincrono, por lo que el costo total de la funcionalidad no cambia: se traslada
fuera de la carga inicial. Las consultas HTTP a CIUNAC, Q10 y correo permanecen
sin cambios por decision de alcance.

## Verificacion Final

- `npm run lint`: correcto.
- `npx tsc --noEmit`: correcto.
- `npm run test:unit`: 238 de 238 pruebas.
- Smoke dirigidos de consultas, certificados, constancias y ubicacion: 52 de 52
  escenarios completados; el runner se detuvo manualmente despues del ultimo
  resultado por el teardown conocido de Windows.
- Suite E2E completa: 92 de 93 escenarios en la ejecucion global. El unico timeout
  ocurrio esperando el marcador del mock reCAPTCHA antes del flujo CIUNAC de
  ubicacion; el mismo escenario paso al repetirse aisladamente en 17.2 segundos.
- `npm run build`: correcto, 22 paginas generadas.
- `npm run security:bundle-check`: correcto.
- `npm run env:check`: correcto.
- `git diff --check`: correcto, con avisos informativos LF/CRLF de Windows.
