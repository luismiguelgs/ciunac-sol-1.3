# CU-001 Registrar Solicitud de Certificado

## Objetivo
Permitir que un Usuario solicitante registre una solicitud de certificado CIUNAC, completando verificacion de correo, datos basicos, pago, documentos si aplican y confirmacion final.

## Actores
- Actor principal: Usuario solicitante.
- Actores secundarios: Sistema CIUNAC, API CIUNAC, Servicio de correo, Servicio de archivos.

## Precondiciones
- El usuario cuenta con correo electronico valido.
- Los catalogos de tipos de solicitud, idioma, facultad, escuela y textos pueden consultarse desde API CIUNAC.
- reCAPTCHA esta disponible en el navegador.

## Disparador
El usuario ingresa a `app/solicitud-certificados/page.tsx` e inicia la verificacion de correo.

## Flujo Principal
1. El sistema muestra el formulario de verificacion de correo.
2. El usuario ingresa correo, solicita codigo y resuelve reCAPTCHA.
3. El servidor valida el OTP temporal de 6 digitos.
4. El sistema redirige a `app/solicitud-certificados/proceso/page.tsx`.
5. El usuario completa tipo de solicitud, idioma, nivel, datos personales y datos academicos si declara ser alumno.
6. El sistema permite buscar datos de estudiante por documento y precargar datos si existen.
7. El sistema resuelve si la solicitud es digital y calcula precio segun catalogo.
8. El usuario completa datos de pago.
9. Si aplica, el usuario adjunta documentos requeridos.
10. El usuario confirma que la informacion es correcta y acepta terminos.
11. El sistema guarda o actualiza estudiante.
12. El sistema crea la solicitud.
13. El sistema envia notificacion por correo.
14. El sistema redirige a la pantalla de finalizacion con el identificador de solicitud.

## Diagrama del Flujo
```mermaid
flowchart TD
    Start["Usuario inicia solicitud de certificado"] --> Email["Verificar correo y reCAPTCHA"]
    Email --> Code{"Codigo valido?"}
    Code -->|No| EmailError["Mostrar advertencia"]
    Code -->|Si| Basic["Completar datos basicos"]
    Basic --> StudentSearch["Buscar estudiante por documento"]
    StudentSearch --> Price["Resolver tipo digital y precio"]
    Price --> Payment["Completar datos de pago"]
    Payment --> Docs{"Requiere documentos?"}
    Docs -->|Si| Upload["Adjuntar documentos"]
    Docs -->|No| Confirm["Confirmar datos y terminos"]
    Upload --> Confirm
    Confirm --> SaveStudent["Guardar o actualizar estudiante"]
    SaveStudent --> SaveRequest["Crear solicitud"]
    SaveRequest --> Mail["Enviar correo de notificacion"]
    Mail --> Finish["Redirigir a finalizacion"]
```

## Flujos Alternativos
- Si el codigo de correo es incorrecto, el sistema muestra advertencia y no avanza.
- Si el usuario no resuelve reCAPTCHA, el sistema muestra advertencia y no avanza.
- Si no se encuentran datos por documento, el usuario puede ingresar datos manualmente.
- Si el tipo de solicitud no requiere documentos, el flujo omite el paso de documentos.

## Excepciones
- Si falla guardar estudiante, el sistema muestra error de procesamiento.
- Si falla crear solicitud, el sistema muestra error y no finaliza el flujo.
- Si falla el envio de correo despues de crear solicitud, el sistema muestra error de integracion.

## Postcondiciones
- La solicitud queda creada en API CIUNAC cuando el flujo finaliza exitosamente.
- El usuario queda en la pantalla de finalizacion.
- El estado temporal del flujo queda preparado para reiniciarse al iniciar un nuevo proceso.

## Datos Requeridos
- Correo electronico.
- Tipo de solicitud.
- Apellidos y nombres.
- Idioma y nivel.
- Tipo y numero de documento.
- Celular.
- Datos academicos si el usuario declara ser alumno.
- Datos de pago cuando corresponde.
- Voucher y documentos adjuntos cuando corresponde.

## Reglas Relacionadas
- RF-001, RF-002, RF-003, RF-004, RF-005, RF-006, RF-007, RF-008, RF-009, RF-010, RF-018.
- RN-001, RN-002, RN-003, RN-004, RN-005, RN-008, RN-009, RN-010.

## Criterios de Aceptacion
```gherkin
Dado que el usuario valido su correo
Y completo los datos obligatorios del certificado
Cuando confirma la solicitud
Entonces el sistema registra estudiante y solicitud
Y redirige a la pantalla de finalizacion
```

```gherkin
Dado que el usuario selecciona un pago distinto de cero
Cuando intenta avanzar sin numero de voucher o fecha de pago
Entonces el sistema muestra validacion de campo requerido
```

