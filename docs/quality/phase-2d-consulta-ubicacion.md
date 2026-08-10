# Fase 2D: Tipado y Confiabilidad de Consulta de Ubicacion

## Alcance

La fase migra `consulta-ubicacion/[dni]`, su join de solicitudes, resultados,
examenes y ciclos, y la constancia PDF asociada. No modifica el registro de una
solicitud de ubicacion ni su politica de pago.

## Problemas Corregidos

- Solicitud cargada en servidor y tres consultas adicionales desde `useEffect`.
- Join con busquedas lineales repetidas durante cada render.
- Interfaces opcionales y casts sobre respuestas externas.
- Error, vacio y relacion faltante representados de forma ambigua.
- Resultados potencialmente ajenos sin filtro por solicitud/documento.
- PDF habilitado aunque faltaran fecha, ciclo o nombre del año.
- Consulta adicional de textos desde el navegador.
- Generacion PDF sin estado de progreso o error.
- Textos visibles con codificacion dañada.

## Estructura Resultante

```text
modules/consulta-ubicacion/
  domain/location-consultation.ts
  application/get-location-consultation.use-case.ts
  infrastructure/
    dto/
    validation/
    mappers/
    server/
  presentation/components/location-consultation-view.tsx
  components/ConstanciaFormat.tsx
  components/download.tsx
```

## Contrato

El caso de uso recibe el documento de la sesion y devuelve
`LocationConsultation | null`. El modelo contiene alumno, solicitud activa,
resultados unidos, nombre del año y estado de textos.

Cada resultado discrimina:

- `complete`: tiene examen y ciclo relacionados;
- `partial`: conserva la nota, pero falta fecha o ciclo y no permite generar PDF.

Una respuesta mal formada produce `EXTERNAL_SERVICE`. Una solicitud de ubicacion
inexistente produce `not-found`; una lista de notas vacia muestra el cargo de la
solicitud activa.

## Archivos Retirados

- `modules/consulta-ubicacion/components/ubicacion-detalle.tsx`.
- `modules/consulta-ubicacion/hooks/useCiclos.ts`.
- `modules/consulta-ubicacion/services/solicitud-examen.service.ts`.
- `modules/consulta-ubicacion/interfaces/examen.interface.ts`.

Quedaron sin consumidores al mover la carga y el join al servidor.

## Pruebas Agregadas

- DTOs validos e invalidos de resultados, examenes y ciclos.
- Estudiante omitido y completado desde solicitud autorizada.
- Join completo, parcial y filtrado de relaciones ajenas.
- Seleccion determinista de la solicitud mas reciente.
- Texto institucional disponible e indisponible.
- Estado vacio con cargo.
- Respuesta externa mal formada.
- Examen relacionado ausente.
- Resultado perteneciente a otro documento.

## Deuda Tecnica Pendiente

- Tipar el componente de cargo reutilizado desde `solicitud-ubicacion`.
- Resolver el lifecycle de Playwright en Windows.
- Evaluar fuentes locales para que desarrollo y build no dependan de Google Fonts.

## Resultados

Los resultados finales se registran en `docs/quality/baseline.md` al cerrar la fase.
