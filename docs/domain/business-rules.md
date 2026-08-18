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
| RN-005 | Cuando el monto es mayor que cero, numero de voucher de 15 digitos, fecha de pago y archivo cargado son obligatorios. Con monto cero, esos datos son opcionales. |
| RN-006 | La solicitud de beca requiere los documentos definidos por el flujo de beca. |
| RN-007 | La solicitud de ubicacion debe bloquear duplicados con estado en proceso para el mismo documento, idioma y tipo. |
| RN-008 | La verificacion usa un OTP server-side de 6 digitos, vigencia de 5 minutos, reenvio despues de 3 minutos, 5 intentos y uso unico en el estado actual. |

## Reglas de Solicitud de Ubicacion
| ID | Regla |
| --- | --- |
| RN-022 | El examen de ubicacion usa exclusivamente el tipo `7` y la tarifa oficial S/ 30.00; el BFF bloquea un tarifario o monto diferente. |
| RN-023 | El perfil CIUNAC debe coincidir con la cookie server-side asociada a la sesion OTP `UBICACION`; no se obtiene desde la URL. |
| RN-024 | Un usuario no CIUNAC usa nivel basico y no adjunta certificado academico; un usuario CIUNAC selecciona nivel y adjunta un PDF de estudios de hasta 8 MiB. |
| RN-025 | El documento de identidad es obligatorio, se envia como `imgDoc` y admite PDF, PNG o JPEG de hasta 8 MiB con firma binaria valida. |
| RN-026 | La solicitud de ubicacion siempre se registra con `digital: false`. |

## Reglas de Alumno Nuevo
| ID | Regla |
| --- | --- |
| RN-019 | Alumno nuevo acepta DNI de 8 digitos o CE de 9 caracteres alfanumericos, telefono de 9 digitos y fecha de nacimiento valida no futura. |
| RN-020 | El email enviado a Q10 debe coincidir con la sesion OTP `NUEVO` y el programa debe pertenecer al catalogo vigente revalidado por el BFF. |
| RN-021 | Un registro Q10 confirmado sin cuerpo es valido; una respuesta con estructura inesperada bloquea el correo y un reenvio automatico. |

## Reglas de Constancias
| ID | Regla |
| --- | --- |
| RN-011 | Las solicitudes de constancia aplican la regla comun de pago: cuando el monto es mayor que cero, el numero, fecha y archivo del voucher son obligatorios. |
| RN-012 | La solicitud de constancia debe implementarse como flujo independiente y no reutilizar el flujo de certificados como experiencia principal. |
| RN-013 | El cargo PDF de constancia debe generarse en frontend con `@react-pdf/renderer`. |
| RN-014 | El frontend solicita la notificacion de constancia al BFF; solo el servidor puede invocar el endpoint externo de correo. |

## Reglas de Certificados
| ID | Regla |
| --- | --- |
| RN-015 | Certificados usa el precio normal vigente para los tipos `1` a `4`; el BFF debe rechazar con `409 PRICE_CHANGED` un monto distinto antes de crear la solicitud. |
| RN-016 | Los tipos de certificado `2` y `4` son digitales; los tipos `1` y `3` no lo son. |
| RN-017 | El unico archivo del flujo de certificados es el voucher requerido por la politica comun de pago. No se solicita un documento academico o laboral adicional. |
| RN-018 | Los descuentos de trabajador permanecen deshabilitados hasta que el backend pueda verificar y autorizar dicha condicion. Los query params `trabajador` y `antiguo` no forman parte del contrato. |

## Pendientes de Validacion
- Plantilla de correo propia para constancias en el proveedor externo. Mientras no exista, el BFF usa la plantilla compatible de certificados.
- Idempotencia de correo garantizada por backend para eliminar el riesgo residual del reintento manual.
- Regla administrativa que justifica excluir programas con `2026`, `kids` o `juniors` y el limite de 30 programas Q10.

