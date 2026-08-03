# Reglas de Negocio

## Proposito
Consolidar reglas funcionales relevantes para solicitudes y consultas. Este documento complementa el SRS y los casos de uso.

## Reglas Generales
| ID | Regla |
| --- | --- |
| RN-001 | Si el tipo de documento es DNI, el documento debe tener 8 digitos. |
| RN-002 | Si el tipo de documento es CE o PASAPORTE, el documento debe tener 9 caracteres. |
| RN-003 | El celular debe tener 9 digitos. |
| RN-004 | Si el usuario marca que es alumno, facultad, escuela y codigo pueden ser obligatorios segun flujo. |
| RN-005 | En pagos distintos de cero, numero de voucher y fecha de pago son obligatorios. |
| RN-006 | La solicitud de beca requiere los documentos definidos por el flujo de beca. |
| RN-007 | La solicitud de ubicacion debe bloquear duplicados con estado en proceso para el mismo documento, idioma y tipo. |
| RN-008 | La verificacion usa un OTP server-side de 6 digitos, vigencia de 5 minutos, 5 intentos y uso unico en el estado actual. |

## Reglas de Constancias
| ID | Regla |
| --- | --- |
| RN-011 | El voucher de pago es obligatorio para registrar una solicitud de constancia. |
| RN-012 | La solicitud de constancia debe implementarse como flujo independiente y no reutilizar el flujo de certificados como experiencia principal. |
| RN-013 | El cargo PDF de constancia debe generarse en frontend con `@react-pdf/renderer`. |
| RN-014 | El frontend solicita la notificacion de constancia al BFF; solo el servidor puede invocar el endpoint externo de correo. |

## Pendientes de Validacion
- Catalogo definitivo de tipos de constancia.
- Campos academicos obligatorios para cada tipo de constancia.
- Endpoint definitivo para guardar constancias.
- Plantilla oficial del cargo PDF.

