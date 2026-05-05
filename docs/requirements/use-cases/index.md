# Indice de Casos de Uso

## Objetivo
Este indice lista los casos de uso funcionales del frontend CIUNAC y su relacion con los actores principales. Los detalles de cada caso viven en documentos individuales dentro de esta carpeta.

## Casos de Uso
| ID | Caso de uso | Documento |
| --- | --- | --- |
| CU-001 | Registrar solicitud de certificado | [solicitud-certificado.md](./solicitud-certificado.md) |
| CU-002 | Registrar solicitud de beca | [solicitud-beca.md](./solicitud-beca.md) |
| CU-003 | Registrar solicitud de examen de ubicacion | [solicitud-ubicacion.md](./solicitud-ubicacion.md) |
| CU-004 | Registrar alumno nuevo | [solicitud-nuevo.md](./solicitud-nuevo.md) |
| CU-005 | Consultar solicitud por documento | [consulta-solicitud.md](./consulta-solicitud.md) |
| CU-006 | Consultar certificado | [consulta-certificado.md](./consulta-certificado.md) |
| CU-007 | Consultar ubicacion | [consulta-ubicacion.md](./consulta-ubicacion.md) |

## Diagrama General
```mermaid
flowchart LR
    Usuario["Usuario solicitante"] --> CU1["CU-001 Registrar certificado"]
    Usuario --> CU2["CU-002 Registrar beca"]
    Usuario --> CU3["CU-003 Registrar ubicacion"]
    Postulante["Postulante"] --> CU4["CU-004 Registrar alumno nuevo"]
    Usuario --> CU5["CU-005 Consultar solicitud"]
    Usuario --> CU6["CU-006 Consultar certificado"]
    Usuario --> CU7["CU-007 Consultar ubicacion"]

    CU1 --> API["API CIUNAC"]
    CU2 --> API
    CU3 --> API
    CU4 --> Q10["API Q10"]
    CU5 --> API
    CU6 --> API
    CU7 --> API
```

## Flujo General de Solicitud
```mermaid
flowchart TD
    Start["Inicio"] --> Email["Verificar correo"]
    Email --> Basic["Completar datos basicos"]
    Basic --> Payment["Completar datos de pago"]
    Payment --> Docs{"Requiere documentos?"}
    Docs -->|Si| Upload["Adjuntar documentos"]
    Docs -->|No| Confirm["Confirmar informacion"]
    Upload --> Confirm
    Confirm --> SaveStudent["Guardar o actualizar estudiante"]
    SaveStudent --> SaveRequest["Crear solicitud"]
    SaveRequest --> Notify["Enviar correo"]
    Notify --> Finish["Finalizar"]
```

## Flujo General de Consulta
```mermaid
flowchart TD
    Start["Inicio consulta"] --> Document["Ingresar documento"]
    Document --> Captcha["Validar reCAPTCHA"]
    Captcha --> Search["Buscar en API CIUNAC"]
    Search --> Found{"Hay resultados?"}
    Found -->|Si| Detail["Mostrar detalle o redirigir"]
    Found -->|No| Error["Mostrar mensaje no encontrado"]
```

