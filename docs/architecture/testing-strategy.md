# Estrategia de Pruebas

## Estado actual
El proyecto usa Playwright para smoke tests E2E del comportamiento observable. La validacion se sostiene con:
- `npm test`
- `npm run lint`
- `npx tsc --noEmit`
- `npm run build`

Los smoke tests ejecutan la aplicacion y una API simulada en puertos locales dedicados. No consumen las APIs CIUNAC, Q10, correo, almacenamiento ni reCAPTCHA reales.

## Prioridad de pruebas
Agregar pruebas en este orden:
- mappers de infraestructura;
- reglas puras de `domain`;
- casos de uso de `application`;
- hooks de presentation con estados de exito/error;
- pruebas E2E de flujos criticos.

## Casos iniciales recomendados
- Registro exitoso de certificado.
- Error al guardar estudiante.
- Error al guardar solicitud.
- Correo fallido despues de registro.
- Duplicidad en solicitud de ubicacion.
- Reset de stores al entrar a un nuevo proceso.
- Catalogos hidratados antes de renderizar datos dependientes.

## Herramientas sugeridas
- Vitest para unit tests.
- React Testing Library para hooks/componentes.
- Playwright para flujos E2E (implementado para smoke tests).

La cobertura E2E actual protege rutas publicas, navegacion, registro de certificado y consultas principales. Las pruebas unitarias y de componentes siguen pendientes.
