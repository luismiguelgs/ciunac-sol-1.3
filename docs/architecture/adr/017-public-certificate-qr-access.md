# ADR-017 Acceso Publico al Certificado Mediante QR

## Estado

Aceptado e implementado el 2026-08-10. Reemplaza la autorizacion por sesion y
documento definida en ADR-011. Su acceso publico y contratos tipados siguen
vigentes; la estructura interna fue simplificada posteriormente por ADR-027.

## Contexto

El QR impreso en un certificado contiene una URL
`/consulta-certificado/{certificateId}`. La fase de seguridad hizo depender esta
ruta de una sesion creada por `consulta-solicitud`, por lo que un tercero que
escaneaba un QR valido era redirigido antes de consultar el certificado.

Los certificados historicos tambien pueden devolver `numeroDocumento: null` y
`aceptado: null`. Ninguno de estos valores debe impedir la verificacion publica:
el documento no se presenta y una aceptacion nula representa entrega pendiente.

## Decision

- El identificador opaco del QR funciona como localizador publico de solo lectura.
- La ruta no exige sesion, CAPTCHA ni documento del usuario.
- El ID se limita a letras, numeros, guion y guion bajo, hasta 80 caracteres.
- La API key y la llamada `GET certificados/{id}` permanecen exclusivamente en
  servidor mediante `ciunacRequest`, con `no-store` y timeout.
- El BFF generico no se convierte en publico; el navegador no llama al proveedor.
- `numeroDocumento` se ignora en el contrato publico y no se mapea al dominio ni
  a presentacion.
- `aceptado: null` o ausente se normaliza como estado pendiente.
- La ruta publica se marca `noindex, nofollow`.

```mermaid
sequenceDiagram
    participant User as Verificador
    participant Page as Next.js Server Component
    participant Query as Consulta server-only
    participant Contract as Contrato externo
    participant API as API CIUNAC

    User->>Page: Abrir URL del QR con ID opaco
    Page->>Query: Consultar certificateId
    Query->>Query: Validar formato
    Query->>API: GET certificados/{id} con API key privada
    API-->>Query: DTO externo
    Query->>Contract: Validar, comprobar ID y omitir extras
    Contract-->>Query: Modelo publico seguro
    Query-->>Page: Detalle publico o ausencia
    Page-->>User: Verificacion de solo lectura
```

## Consecuencias

- Un QR valido funciona sin pasar por `consulta-solicitud`.
- El nombre, notas y metadatos visibles se consideran informacion publica de
  verificacion del certificado.
- No se habilitan descarga, aceptacion ni mutaciones desde esta ruta.
- Un ID invalido, `404` o respuesta vacia muestra `not-found`; una respuesta mal
  formada conserva el error reintentable.
- La ruta raiz explica que la consulta se inicia escaneando el QR.
