# Estrategia de Pruebas

## Estado actual
El proyecto no tiene framework de pruebas configurado. La validacion actual se sostiene con:
- `npm run lint`
- `npx tsc --noEmit`
- `npm run build`
- pruebas manuales de flujos principales

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
- Playwright para flujos E2E.

No se agregan dependencias de pruebas en esta fase para evitar ampliar el alcance sin una decision explicita del equipo.
