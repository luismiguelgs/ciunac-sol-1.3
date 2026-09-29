# Roadmap de Simplificacion Pragmatica

Estado al 2026-09-28. Este cuadro reemplaza el roadmap inicial de seis fases;
los informes originales permanecen como historia.

## Plan completado

| Paso | Alcance completado | Evidencia |
| --- | --- | --- |
| 1 | Linea base, contratos, inventario y secuencias | quality/pragmatic-simplification-baseline.md |
| 2 | Regla efectiva ESLint y 67 pruebas de limites | architecture-rules.md |
| 3 | Certificados: funciones y APIs publicas | quality/phase-2f-solicitud-certificado.md |
| 4 | Constancias y alumno nuevo, por separado | quality/phase-2a-constancia-typing.md y phase-2g-solicitud-nuevo.md |
| 5 | Becas y ubicacion, sin reescritura de reglas | quality/phase-2e-solicitud-beca.md y phase-2h-solicitud-ubicacion.md |
| 6 | Contexto de consultas, solicitud y ubicacion | quality/baseline.md, cierre del paso 6 |
| 7 | Validacion tecnica de archivos, pago y HTTP browser | quality/shared-simplification.md |
| 8 | SDD, guias, ADR general, trazabilidad y limpieza comprobada | quality/pragmatic-simplification-baseline.md, cierre del paso 8 |

Los paths quality anteriores son relativos a docs/. Acceso al
[registro de cierre](../quality/pragmatic-simplification-baseline.md#paso-8-cierre-documental-y-limpieza).

## Trabajo posterior, no iniciado

1. Resolver la auditoria de dependencias en un cambio de seguridad aislado.
   Verificar versiones corregidas, no renovar excepciones vencidas.
2. Verificar administrativamente los checks obligatorios de branch protection.
3. Acordar con backend propiedad de archivos/documentos e idempotencia de escrituras/correo.
4. Persistir uso unico, intentos y limites OTP para proteger frente a replay deliberado.
5. Validar filtros y paginacion Q10; independizar fuentes remotas y revisar teardown Windows.

La cache de catalogos es una propuesta pendiente de validacion funcional.
No se ha activado cache global para datos privados.

## Regla de avance

Un cambio pequeno por responsabilidad. Mantener contratos, estado parcial,
validacion autoritativa y pruebas. No iniciar una nueva refactorizacion solo para
uniformar carpetas ni convertir todos los avisos opcionales de Knip en borrados.
El cierre de este plan no equivale a autorizar despliegue con auditoria bloqueada.
