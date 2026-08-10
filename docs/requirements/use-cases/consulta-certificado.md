# CU-006 Consultar Certificado

## Objetivo
Permitir que un Usuario solicitante consulte certificados asociados a solicitudes y acceda a informacion o descarga cuando este disponible.

## Actores
- Actor principal: Usuario solicitante.
- Actores secundarios: Sistema CIUNAC, API CIUNAC.

## Precondiciones
- Existe una solicitud o certificado registrado en API CIUNAC.
- El usuario cuenta con documento o identificador requerido por el flujo de consulta.
- Existe una sesion de consulta vigente para el documento del usuario.

## Disparador
El usuario ingresa a `app/consulta-certificado/page.tsx` o a una ruta de detalle de certificado.

## Flujo Principal
1. El sistema presenta el contenedor de consulta.
2. El usuario busca por documento mediante el flujo compartido de consulta cuando corresponde.
3. El sistema consulta solicitudes o certificados disponibles.
4. El sistema comprueba que el certificado pertenece al documento consultado.
5. Si existe y pertenece al usuario, el sistema muestra informacion del certificado.
6. Si el usuario descarga o acepta el certificado digital, el sistema puede actualizar estado de aceptacion.

## Diagrama del Flujo
```mermaid
flowchart TD
    Start["Usuario consulta certificado"] --> Search["Buscar solicitud o certificado"]
    Search --> Found{"Existe certificado?"}
    Found -->|No| Empty["Mostrar informacion no disponible"]
    Found -->|Si| Owner{"Pertenece al documento consultado?"}
    Owner -->|No| Empty
    Owner -->|Si| Detail["Mostrar detalle de certificado"]
    Detail --> Action{"Usuario descarga o acepta?"}
    Action -->|No| End["Mantener detalle visible"]
    Action -->|Si| Update["Actualizar estado de aceptacion cuando aplique"]
    Update --> End
```

## Flujos Alternativos
- Si no existe certificado asociado, el sistema no muestra descarga disponible.
- Si el certificado no pertenece al documento consultado, se muestra como no disponible.
- Si el certificado no contiene notas, se muestran sus metadatos y un estado vacio de notas.

## Excepciones
- Si falla la consulta del certificado, el sistema registra el error y evita romper la pantalla.
- Si la API devuelve una respuesta incompleta, se muestra un error reintentable y no datos parciales.

## Postcondiciones
- El usuario visualiza o descarga el certificado si esta disponible.
- El estado de aceptacion puede actualizarse cuando el usuario ejecuta la accion correspondiente.

## Datos Requeridos
- Documento o identificador de solicitud/certificado.

## Reglas Relacionadas
- RF-016, RF-018.

## Criterios de Aceptacion
```gherkin
Dado que existe un certificado para una solicitud
Cuando el usuario consulta la informacion
Entonces el sistema muestra el certificado disponible
```

