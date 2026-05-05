# CU-005 Consultar Solicitud por Documento

## Objetivo
Permitir que un Usuario solicitante consulte solicitudes registradas usando su documento de identidad.

## Actores
- Actor principal: Usuario solicitante.
- Actores secundarios: Sistema CIUNAC, API CIUNAC, Google reCAPTCHA.

## Precondiciones
- El usuario conoce el documento usado en la solicitud.
- reCAPTCHA esta disponible.
- API CIUNAC permite buscar solicitudes por documento.

## Disparador
El usuario ingresa a `app/consulta-solicitud/page.tsx`.

## Flujo Principal
1. El sistema muestra formulario de consulta por documento.
2. El usuario ingresa documento y resuelve reCAPTCHA.
3. El sistema valida formato del documento.
4. El sistema consulta solicitudes por documento.
5. Si existen resultados, el sistema redirige a `app/consulta-solicitud/[dni]/page.tsx`.
6. El sistema muestra detalle de solicitudes y acciones disponibles.

## Flujos Alternativos
- Si el usuario no resuelve reCAPTCHA, el sistema muestra advertencia.
- Si no hay resultados, el sistema muestra mensaje de busqueda no encontrada.
- Si el documento no cumple formato, el sistema muestra validacion.

## Excepciones
- Si falla la consulta a API CIUNAC, el sistema debe informar el error. Pendiente de validacion funcional: detalle actual de error visible para usuario.

## Postcondiciones
- El usuario visualiza el detalle de solicitudes si existen.
- Si no hay resultados, el usuario permanece en el formulario de consulta.

## Datos Requeridos
- Documento de identidad.
- reCAPTCHA valido.

## Reglas Relacionadas
- RF-002, RF-015, RF-018.
- RN-001, RN-002.

## Criterios de Aceptacion
```gherkin
Dado que el usuario ingresa un documento con solicitudes existentes
Y resuelve reCAPTCHA
Cuando presiona buscar
Entonces el sistema redirige al detalle de solicitudes
```

