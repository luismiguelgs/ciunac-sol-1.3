# Fase 1D: Manejo de Errores y Respuestas Incompletas

## Proposito

Evitar estados de exito falsos, duplicacion de solicitudes y accesos inseguros cuando CIUNAC, Q10 o el servicio de correo devuelven errores, cuerpos vacios o estructuras incompletas.

Esta fase no modifica reglas de negocio, no reorganiza modulos y no completa el flujo de constancias.

## Diagnostico Por Flujo

| Flujo | Origen del error o dato vacio | Donde se perdia | Respuesta anterior al usuario | Respuesta implementada |
| --- | --- | --- | --- | --- |
| Certificado | `mailer` falla despues de crear la solicitud | El caso de uso convertia toda la operacion en fallo | Error total; un nuevo submit podia duplicar la solicitud | Resultado parcial con ID y reintento exclusivo de correo |
| Beca | `mailer` falla despues de crear la beca | El error no distinguia persistencia de notificacion | Error total ambiguo | Resultado parcial, submit bloqueado y reintento de correo |
| Ubicacion | `mailer` falla despues de crear la solicitud | El componente no conservaba el ID persistido | Error total ambiguo | Resultado parcial con ID y reintento de correo |
| Alumno nuevo | Q10 devuelve `500`, cuerpo vacio o estructura invalida | Solo se comprobaba `status === 400` | El flujo podia continuar al correo como exito | Resultado tipado; errores detienen el correo y una respuesta vacia HTTP confirmada se admite como comando exitoso |
| Paginas finales | Falta de evidencia de aceptacion de `mailer` | El texto era incondicional | Se afirmaba que el correo fue enviado | Se valida un comprobante `HttpOnly`; sin el se muestra estado no confirmado |
| Consulta de solicitudes | API falla o devuelve `[]` | Los errores se convertian en listas vacias | Pagina vacia sin causa | Ausencia real muestra estado vacio; fallo tecnico activa limite de error con reintento |
| Consulta de certificado | `notas` falta o esta vacio | Acceso directo a `notas[0]` | Excepcion o datos incorrectos | Metadatos visibles y estado explicito sin notas |
| Consulta de ubicacion | Proveedor de notas falla | El error se convertia en ausencia de notas | Mensaje funcional incorrecto | Estados separados de carga, vacio, datos y error reintentable |
| Documento digital | Certificado o constancia no existe, o falla el proveedor | Cualquier error se convertia en `null` | Se mostraba cargo aunque hubiera fallo tecnico | `null` solo representa ausencia; fallo tecnico se muestra y permite reintento |
| Cargos PDF | Solicitud incompleta o propiedades anidadas ausentes | Tipos `any` y accesos sin guardas | Posible excepcion o PDF invalido | Carga tipada, validacion minima y descarga bloqueada sin datos validos |
| Catalogos | API devuelve una lista vacia valida | `[]` se interpretaba como no cargado | Consultas repetidas | `hasLoaded` conserva el estado cargado independientemente del contenido |
| Cronogramas y programas | Error externo o lista vacia | Ambos producian la misma UI | Ausencia funcional ambigua | Estado vacio separado de indisponibilidad tecnica |

## Contratos Aplicados

Las lecturas usan un resultado discriminado:

```ts
type AppResult<T> =
  | { ok: true; kind: 'data'; data: T }
  | { ok: true; kind: 'empty' }
  | { ok: false; kind: 'error'; error: AppError }
```

Los codigos publicos admitidos son `VALIDATION`, `AUTHENTICATION`, `AUTHORIZATION`, `EXTERNAL_SERVICE`, `NETWORK` y `UNEXPECTED`. `AppError` puede incluir estado HTTP, `correlationId` y si la operacion es reintentable. Los mensajes internos del proveedor no llegan al navegador.

Los registros que persisten antes de notificar devuelven uno de estos estados:

```ts
type RegistrationOutcome =
  | {
      status: 'completed'
      requestId: string
      notificationReceiptId: string
    }
  | {
      status: 'saved_notification_failed'
      requestId: string
      error: AppError
    }
```

Un `2xx` sin cuerpo solo es exito para comandos que no requieren datos. La creacion de una solicitud sin identificador es indeterminada: se detienen el correo y las acciones posteriores, y no se repite automaticamente la escritura.

## Guardado Parcial y Reintento

```mermaid
sequenceDiagram
    actor User as Usuario
    participant UI as Formulario
    participant UseCase as Caso de uso
    participant Api as API CIUNAC o Q10
    participant BFF as Route Handler Next.js
    participant Mail as Servicio mailer

    User->>UI: Confirmar registro
    UI->>UseCase: register(command)
    UseCase->>Api: Persistir solicitud
    Api-->>UseCase: ID de solicitud
    UseCase->>BFF: Solicitar notificacion con ID
    BFF->>Mail: Aceptar correo
    Mail--xBFF: Error externo
    BFF-->>UseCase: EXTERNAL_SERVICE
    UseCase-->>UI: saved_notification_failed + ID
    UI-->>User: Solicitud guardada; correo pendiente
    User->>UI: Reintentar correo
    UI->>UseCase: retryNotification(ID)
    Note over UI,UseCase: No se repite estudiante, solicitud, voucher o documentos
    UseCase->>BFF: Solicitar notificacion con ID
    BFF->>Mail: Aceptar correo
    Mail-->>BFF: 2xx
    BFF-->>UseCase: receiptId
    UseCase-->>UI: completed
```

## Datos Protegidos Por Guardas

- Identificadores de estudiante, solicitud, beca y carga.
- Listas externas nulas, vacias o con forma invalida.
- Metadatos de certificado, notas, idioma, nivel y fechas.
- URL e identificador de documentos digitales.
- Confirmacion de Q10 y aceptacion del correo.
- Catalogos, cronogramas, programas y detalles de ubicacion.

## Limites Conocidos

- Un `2xx` de `mailer` confirma aceptacion HTTP, no entrega SMTP.
- El reintento manual puede producir dos mensajes si el proveedor proceso el primero y se perdio su respuesta. La correccion definitiva requiere idempotencia u outbox en backend.
- Los datos de proveedor se validan con esquemas minimos y `.passthrough()` para tolerar campos adicionales sin aceptar estructuras incompletas.
- La configuracion privada y rotacion de la API key siguen siendo acciones operativas pendientes de la Fase 1C.
