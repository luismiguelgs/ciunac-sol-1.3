# CU-002 Registrar Solicitud de Beca

## Objetivo
Permitir que un Usuario solicitante registre una solicitud de beca con datos personales, academicos y documentos obligatorios.

## Actores
- Actor principal: Usuario solicitante.
- Actores secundarios: Sistema CIUNAC, API CIUNAC, Servicio de correo, Servicio de archivos.

## Precondiciones
- El usuario cuenta con correo electronico valido.
- El sistema puede consultar facultades y escuelas.
- El servicio de archivos esta disponible para adjuntos.

## Disparador
El usuario ingresa a `app/solicitud-beca/page.tsx`, valida correo y accede al proceso de beca.

## Flujo Principal
1. El sistema solicita correo y codigo de verificacion.
2. El usuario valida el correo.
3. El sistema redirige a `app/solicitud-beca/proceso/page.tsx`.
4. El usuario completa apellidos, nombres, facultad, escuela, direccion, codigo, tipo de documento, documento y celular.
5. El usuario adjunta constancia de matricula, historial academico, constancia de tercio, carta de compromiso y declaracion jurada.
6. El usuario confirma el registro.
7. El sistema crea la solicitud de beca.
8. El sistema envia notificacion por correo.
9. El sistema redirige a la pantalla final.

## Diagrama del Flujo
```mermaid
flowchart TD
    Start["Usuario inicia solicitud de beca"] --> Email["Verificar correo y reCAPTCHA"]
    Email --> Code{"Codigo valido?"}
    Code -->|No| EmailError["Mostrar advertencia"]
    Code -->|Si| Basic["Completar datos personales y academicos"]
    Basic --> Docs["Adjuntar documentos obligatorios"]
    Docs --> DocsValid{"Documentos completos?"}
    DocsValid -->|No| DocsError["Mostrar validaciones"]
    DocsValid -->|Si| Confirm["Confirmar registro"]
    Confirm --> SaveRequest["Crear solicitud de beca"]
    SaveRequest --> Mail["Enviar correo de notificacion"]
    Mail --> Finish["Redirigir a finalizacion"]
```

## Flujos Alternativos
- Si el usuario no completa un documento obligatorio, el sistema no permite avanzar.
- Si el documento tiene longitud invalida segun tipo, el sistema muestra validacion.
- Si no se cargan facultades o escuelas, el usuario no puede completar correctamente los campos academicos.

## Excepciones
- Si falla la creacion de solicitud de beca, el sistema muestra error.
- Si falla el correo de notificacion, el sistema muestra error de integracion.

## Postcondiciones
- La solicitud de beca queda registrada en API CIUNAC cuando el flujo termina exitosamente.
- Los documentos enviados quedan asociados a la solicitud segun respuesta del servicio de archivos.

## Datos Requeridos
- Correo electronico.
- Apellidos y nombres.
- Facultad y escuela.
- Direccion.
- Codigo.
- Tipo y numero de documento.
- Celular.
- Cinco documentos obligatorios de beca.

## Reglas Relacionadas
- RF-001, RF-002, RF-010, RF-011, RF-018.
- RN-001, RN-002, RN-003, RN-006, RN-008.

## Criterios de Aceptacion
```gherkin
Dado que el usuario valido su correo
Y completo datos academicos y documentos obligatorios
Cuando confirma la solicitud de beca
Entonces el sistema registra la solicitud
Y envia notificacion por correo
```

