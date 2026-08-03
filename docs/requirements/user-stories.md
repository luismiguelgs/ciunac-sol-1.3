# Historias de Usuario

## Proposito
Este documento registra historias de usuario funcionales que sirven como entrada para casos de uso, requisitos, backlog tecnico y criterios de aceptacion.

## HU-001 Registrar Solicitud de Constancia
Como **Usuario solicitante**, quiero registrar una **solicitud de constancia** en un flujo independiente al de certificados, para enviar mis datos, registrar mi pago, obtener un cargo PDF generado en frontend y recibir confirmacion por correo cuando la solicitud termine.

### Contexto
- El flujo de constancias debe separarse del flujo actual de certificados.
- El usuario debe verificar su correo antes de iniciar el proceso.
- El usuario debe ingresar datos personales y academicos.
- El usuario debe ingresar datos de pago y subir voucher.
- La solicitud debe guardarse en backend.
- El frontend solicita el correo de confirmacion al BFF; el endpoint externo de correo solo se invoca server-side.
- El cargo PDF se genera en frontend usando `@react-pdf/renderer`.

### Criterios de Aceptacion
```gherkin
Dado que el usuario tiene un correo valido
Cuando solicita un codigo de verificacion
Entonces el sistema envia un codigo al correo ingresado
```

```gherkin
Dado que el usuario ingresa un codigo valido
Cuando confirma la verificacion
Entonces el sistema le permite continuar al formulario de solicitud de constancia
```

```gherkin
Dado que el usuario completa sus datos personales y academicos
Y registra los datos de pago
Y sube el voucher correspondiente
Cuando confirma la solicitud
Entonces el frontend envia la informacion al backend
Y el backend registra la solicitud
```

```gherkin
Dado que la solicitud fue registrada correctamente
Cuando finaliza el proceso
Entonces el frontend genera un cargo PDF para el usuario
Y solicita al BFF el correo de confirmacion
```

```gherkin
Dado que falta un dato obligatorio o el voucher de pago
Cuando el usuario intenta finalizar la solicitud
Entonces el sistema muestra validaciones
Y no permite registrar la solicitud
```

### Referencias
- Caso de uso relacionado: `CU-008 Registrar solicitud de constancia`.
- Requisitos relacionados: `RF-019`, `RF-020`.
- Reglas relacionadas: `RN-011`, `RN-012`.

