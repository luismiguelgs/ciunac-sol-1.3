# CU-004 Registrar Alumno Nuevo

## Objetivo
Permitir que un Postulante registre datos para alumno nuevo usando programas obtenidos desde API Q10 y verificacion por correo.

## Actores
- Actor principal: Postulante.
- Actores secundarios: Sistema CIUNAC, API Q10, Servicio de correo.

## Precondiciones
- API Q10 debe retornar programas disponibles.
- El usuario cuenta con correo electronico valido.
- El servicio de correo esta disponible para verificacion y registro.

## Disparador
El usuario ingresa a `app/solicitud-nuevo/page.tsx`.

## Flujo Principal
1. El sistema consulta programas desde API Q10.
2. El sistema muestra un flujo por pasos: verificacion, datos basicos y registro.
3. El usuario verifica correo con codigo temporal.
4. El usuario completa apellidos, nombres, programa, fecha de nacimiento, genero, tipo de documento, documento y telefono.
5. El usuario revisa datos antes de finalizar.
6. El sistema envia los datos de alumno nuevo a API Q10.
7. El sistema envia correo de registro.
8. El sistema redirige a la pantalla de finalizacion.

## Flujos Alternativos
- Si API Q10 no retorna programas, el sistema muestra el flujo con lista vacia. Pendiente de validacion funcional: comportamiento esperado con lista vacia.
- Si el codigo de verificacion es incorrecto, el sistema no avanza.
- Si el documento no cumple longitud segun tipo, el sistema muestra validacion.

## Excepciones
- Si falla el registro en Q10, el sistema debe mostrar error o impedir finalizacion. Pendiente de validacion funcional: comportamiento exacto de error visible.
- Si falla correo de registro, el sistema registra el error en consola segun implementacion actual.

## Postcondiciones
- Los datos del postulante quedan enviados a API Q10 cuando el flujo finaliza correctamente.
- El usuario queda en la pantalla final del flujo de alumno nuevo.

## Datos Requeridos
- Correo electronico.
- Primer y segundo apellido.
- Primer nombre y segundo nombre opcional.
- Programa.
- Fecha de nacimiento.
- Genero.
- Tipo y numero de documento.
- Telefono/celular.

## Reglas Relacionadas
- RF-001, RF-002, RF-014, RF-018.
- RN-001, RN-002, RN-003, RN-008.

## Criterios de Aceptacion
```gherkin
Dado que API Q10 entrega programas
Y el postulante completa datos validos
Cuando confirma el registro
Entonces el sistema envia los datos a Q10
Y redirige a finalizacion
```

