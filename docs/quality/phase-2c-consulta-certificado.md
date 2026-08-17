# Fase 2C: Tipado y Confiabilidad de Consulta de Certificado

## Alcance

La fase migra exclusivamente `app/consulta-certificado/[id]`. No modifica el flujo
de registro de certificados, documentos digitales ni consulta de ubicacion.

## Problemas Corregidos

- Pagina con acceso HTTP, reglas de transformacion y presentacion mezcladas.
- Cast `as unknown as ICertificado` en el limite externo.
- Schema que solo comprobaba la lista de notas.
- Accesos a propiedades opcionales de un modelo compartido.
- Ausencia y respuesta mal formada sin contratos diferenciados.
- Falta de comprobacion entre propietario del certificado y sesion de consulta.
- Falta de `loading.tsx` y `not-found.tsx`.
- Textos visibles con codificacion danada.
- Formato de fecha dependiente de la zona horaria del servidor.

## Estructura Resultante

- `domain/certificate-detail.ts`: modelo completo, identificador, orden y etiquetas.
- `application/get-certificate-detail.use-case.ts`: consulta y autorizacion por
  documento.
- `infrastructure/dto`: contrato de respuesta externo.
- `infrastructure/validation`: validacion Zod de metadatos, fechas y notas.
- `infrastructure/mappers`: conversion DTO a dominio.
- `infrastructure/server`: repositorio CIUNAC y factory server-only.
- `presentation/components`: vista sin acceso HTTP.

## Contratos

La consulta recibe:

```ts
type GetCertificateDetailQuery = {
  certificateId: string
}
```

Devuelve `CertificateDetail | null`. `null` representa un identificador inexistente,
un `404` o una respuesta exitosa sin cuerpo. Una respuesta incompleta o mal formada
lanza `EXTERNAL_SERVICE` y no se interpreta como ausencia.

`CertificateDetail` contiene identificadores, estudiante, idioma, nivel,
horas, fechas, registro, entrega discriminada y notas completas. Un certificado
aceptado requiere fecha de aceptacion.

## Archivos Retirados

- `modules/shared/interfaces/certificado.interface.ts`.
- `certificateResponseSchema` del validador externo generico.

Ambos quedaron sin consumidores al introducir el contrato especifico del slice.

## Pruebas Agregadas

- Certificado completo y mapper DTO a dominio.
- Estudiante, fecha, solicitud o notas invalidas.
- Certificado aceptado sin fecha de aceptacion.
- Lista de notas vacia.
- Identificador seguro e intentos con forma de ruta.
- Orden estable de ciclos y fallback de etiquetas.
- Acceso publico directo mediante ID opaco y recurso ausente.
- Smoke E2E para acceso sin sesion, respuesta vacia, `404` y contrato mal formado.

## Deuda Tecnica Pendiente

- El acceso directo por QR fue resuelto posteriormente mediante ADR-017.
- Crear autorizacion especializada para descarga/aceptacion del documento digital.
- La migracion de `consulta-ubicacion/[dni]` fue completada en Fase 2D.

## Resultados

Los resultados finales se registran en `docs/quality/baseline.md` al cerrar la fase.
