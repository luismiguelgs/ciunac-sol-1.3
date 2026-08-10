# CU-007 Consultar Ubicacion

## Objetivo
Permitir que un Usuario solicitante consulte informacion de examen de ubicacion por documento y descargue o visualice constancia cuando corresponda.

## Actores
- Actor principal: Usuario solicitante.
- Actores secundarios: Sistema CIUNAC, API CIUNAC.

## Precondiciones
- El usuario conoce el documento usado para la solicitud de ubicacion.
- API CIUNAC provee informacion de solicitudes, examenes y detalle de notas.
- Existe una sesion de consulta `EXAMEN` vigente para el documento.

## Disparador
El usuario ingresa a `app/consulta-ubicacion/page.tsx` o es redirigido desde consulta por documento.

## Flujo Principal
1. El sistema muestra formulario de consulta por documento.
2. El usuario ingresa documento y resuelve reCAPTCHA.
3. El sistema consulta solicitudes por documento.
4. Si hay resultados, el sistema crea una sesion segura y redirige a `app/consulta-ubicacion/[dni]/page.tsx`.
5. El sistema consulta en paralelo solicitudes, resultados, examenes, ciclos y textos.
6. El sistema valida las respuestas y une los datos por sus identificadores.
7. El sistema muestra informacion disponible y permite descargar constancia cuando el resultado esta completo.

## Diagrama del Flujo
```mermaid
flowchart TD
    Start["Usuario ingresa a consulta de ubicacion"] --> Document["Ingresar documento"]
    Document --> Captcha["Resolver reCAPTCHA"]
    Captcha --> Search["Buscar solicitud por documento"]
    Search --> Found{"Existe solicitud?"}
    Found -->|No| NotFound["Mostrar busqueda no encontrada"]
    Found -->|Si| Redirect["Redirigir a detalle de ubicacion"]
    Redirect --> Details["Consultar solicitudes, resultados, examenes, ciclos y textos"]
    Details --> Join["Validar y unir contratos"]
    Join --> Available{"Hay notas?"}
    Available -->|No| Empty["Mostrar estado vacio y cargo"]
    Available -->|Si| Complete{"Datos completos para constancia?"}
    Complete -->|No| Partial["Mostrar nota y bloquear constancia"]
    Complete -->|Si| Constancia["Mostrar detalle y permitir descarga"]
```

## Flujos Alternativos
- Si no hay solicitudes para el documento, el sistema muestra mensaje de no encontrado.
- Si no hay notas, el sistema muestra el cargo de la solicitud mas reciente.
- Si falta examen, ciclo o nombre del año, el sistema muestra la nota y bloquea la constancia incompleta.

## Excepciones
- Si falla un recurso obligatorio, el sistema muestra un error reintentable.
- Si una respuesta es mal formada, no se presenta como estado vacio.

## Postcondiciones
- El usuario visualiza detalle de ubicacion si existe informacion.
- El usuario puede descargar constancia cuando el flujo lo habilite.

## Datos Requeridos
- Documento de identidad.
- reCAPTCHA valido en el inicio de consulta.

## Reglas Relacionadas
- RF-002, RF-017, RF-018.
- RN-001, RN-002.

## Criterios de Aceptacion
```gherkin
Dado que existe informacion de ubicacion para el documento
Cuando el usuario realiza la consulta
Entonces el sistema muestra el detalle de examen de ubicacion
```

