# Fase 2B: Tipado y Confiabilidad de Consulta de Solicitudes

## Alcance

La fase migra el formulario comun de consulta y el resultado de
`consulta-solicitud`. No modifica el detalle de certificado ni el join de examen de
ubicacion, reservados para Fases 2C y 2D.

## Problemas Corregidos

- `ISolicitudRes` con propiedades opcionales como frontera de consulta.
- Casts de respuestas externas sin validacion especifica.
- Pagina con acceso HTTP, reglas, textos y renderizado en un solo archivo.
- Solicitudes de examen visibles en la consulta de certificados.
- Error de textos auxiliares tratado como fallo total.
- Documento digital inexistente y fallo tecnico representados por el mismo estado.
- Aceptacion de documentos que podia continuar despues de un fallo.
- Componentes y servicios de descarga duplicados o sin uso.
- Formulario compartido alojado en un modulo que no era su propietario.

## Estructura Resultante

```text
modules/consultas/
  domain/
  application/
  infrastructure/
  presentation/

modules/consulta-solicitud/
  application/
  domain/
  infrastructure/
  presentation/
  index.ts
  server.ts
  client.tsx
```

`modules/consultas` contiene el contrato estable compartido por las entradas de
consulta. `modules/consulta-solicitud` contiene las decisiones exclusivas del
resultado de certificados y constancias, incluido cargo y documento digital.

## Contratos

`ConsultedRequest` exige identificador, tipo, estado, estudiante, idioma, nivel,
fechas y datos de pago normalizados. El DTO externo se valida con Zod y se mapea al
dominio antes de renderizar.

El caso de uso devuelve solicitudes filtradas y el estado independiente de textos:

```ts
type ConsultationRequestsResult = {
  requests: ConsultedRequest[]
  texts: ConsultationText[]
  textStatus: 'available' | 'unavailable'
}
```

El documento digital distingue ausencia real, datos validos y error tecnico. La
aceptacion usa un command tipado y detiene la descarga si el `PATCH` falla.

El refactor modular posterior incorpora puertos y casos de uso explicitos, API
publica, composition roots y restricciones ESLint acotadas. El cargo ya no importa
el dominio o PDF de certificados: usa un renderer A4 visual compartido y un
presenter propio para distinguir certificado y constancia.

## Dependencias Eliminadas

- `modules/consulta-solicitud/components/consulta-form.tsx`.
- `modules/consulta-solicitud/components/donwload-cargo.tsx`.
- `modules/consulta-solicitud/components/download-certificado.tsx`.
- `modules/consulta-solicitud/interfaces/certificado.interface.ts`.
- `services/certificados.service.ts`.
- `services/constancias.service.ts`.
- `modules/shared/interfaces/constancia.interface.ts`.
- `modules/consulta-solicitud/infrastructure/digital-document.repository.ts`.
- `modules/consultas/infrastructure/dto/consultation.dto.ts`.
- `modules/consultas/infrastructure/server/create-get-consultation-requests.ts`.

## Dependencias Que Permanecen

- BFF seguro `/api/security/consulta` y `/api/ciunac/[...path]`.
- Sesion cifrada de consulta.
- `resourceApiRepository` para operaciones cliente permitidas.
- `@react-pdf/renderer` para cargos locales.
- Componentes UI compartidos de shadcn.

## Pruebas Agregadas

- DTO valido, incompleto e inconsistente.
- Normalizacion de documento y pago opcional.
- Clasificacion de tipo y estado.
- Filtrado entre certificados/constancias y ubicacion.
- Degradacion controlada cuando fallan textos auxiliares.
- Contrato de comprobacion de consulta mal formado.
- Documento digital valido, inexistente, inseguro o mal formado.
- Aceptacion tipada de documento.
- Smoke E2E de consulta vacia, error externo, respuesta mal formada, textos
  indisponibles y documento listo.

## Deuda Tecnica Pendiente

- Crear un Route Handler especializado que compruebe propiedad del documento digital
  usando la sesion de consulta antes de devolver URL o aceptar el documento.
- La migracion de `consulta-certificado/[id]` fue completada en Fase 2C.
- Migrar carga y join de `consulta-ubicacion/[dni]` en Fase 2D.
- Sustituir `ISolicitudRes` en registros y cargos de certificado/ubicacion en sus
  fases correspondientes.

## Resultados

Los resultados finales de lint, tipado, pruebas, build, seguridad y entorno se
registran en `docs/quality/baseline.md` al cerrar la fase.

## Correccion de Compatibilidad con Certificados Historicos

La API externa puede devolver `numeroDocumento` como numero en certificados
historicos, aunque el contrato normalizado del frontend lo representa como texto.
El schema de infraestructura acepta ambas representaciones exclusivamente en el
limite externo y transforma el valor numerico a `string` antes de ejecutar el
mapper. El dominio, la aplicacion y la presentacion conservan un unico tipo estable.

La correccion fue validada con una lectura del contrato real reportado, sin aceptar,
actualizar ni descargar automaticamente el certificado. Se agregaron pruebas
unitarias para certificados y constancias historicas, junto con un smoke E2E que
confirma que el boton de descarga vuelve a estar disponible.

## Correccion de Compatibilidad con Constancias Historicas

La API real de constancias conserva los campos `id_solicitud` y `dni`; no devuelve
los nombres normalizados `solicitudId` y `numeroDocumento`. El schema Zod adapta
ambos aliases en el limite de infraestructura y entrega al mapper un DTO canonico.
El dominio continua exigiendo identificador de solicitud y documento completos.

La forma del endpoint `constancias/solicitud/{id}` se verifico mediante una lectura
segura de una constancia digital existente, sin ejecutar aceptacion ni actualizacion.
La fixture E2E reproduce ese contrato y confirma que la descarga vuelve a mostrarse.
