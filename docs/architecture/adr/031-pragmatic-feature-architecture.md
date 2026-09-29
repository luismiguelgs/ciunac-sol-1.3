# ADR-031 Arquitectura pragmatica por feature

## Estado

Aceptado durante la simplificacion; cierre documental el 2026-09-28, pasos 1 a 8.
Reemplaza la exigencia de carpetas de ADR-003, no la separacion de responsabilidades.
Complementa ADR-027, ADR-028 y ADR-030. Los ADRs de cada feature conservan sus
reglas funcionales y de seguridad; sus arboles iniciales son evidencia historica.

## Contexto

Clases de un metodo, commands que envolvian el modelo, puertos triviales y
factories separadas obligaban a recorrer archivos sin aportar comportamiento.
La simplificacion incremental ya se comprobo en los cinco registros y consultas.
Eliminar estas envolturas no justifica eliminar validacion o mezclar UI y HTTP.

## Decision

- Organizar por feature, con una API publica de UI y una entrada server-only.
  La composicion del navegador vive en client.ts cuando es necesaria.
- Separar modelos/reglas puras, coordinacion, presentacion e integracion.
  Son responsabilidades, no cuatro directorios obligatorios.
- Usar funciones con dependencias tipadas para orquestacion real. No crear
  operaciones, puertos, commands, clases o stores solo para completar un patron.
- Conservar mappers, schemas externos, catalogos, politicas y documentos PDF
  separados cuando traduzcan contratos o tengan una responsabilidad propia.
- Validar formularios para UX, la operacion antes de registrar y el BFF como
  frontera no confiable. No parsear el modelo completo durante cada render.
- Mantener Zustand para workflows desmontados entre pasos y referencias de
  guardado parcial; los catalogos se cargan en servidor, sin stores globales.
- Compartir metadata/firmas de archivos, modelo y conversiones de pago,
  transporte del navegador y renderer A4. Cada feature conserva precio, perfil,
  formatos permitidos, textos y reglas particulares.
- Mantener transporte privado, OTP, CAPTCHA, sesiones y autorizacion en servidor.
  Un feature no importa internals de otro. Shared/security no conocen features.
- Conservar APIs publicas, contratos HTTP, diseno y secuencias de persistencia.
  El reintento de correo no repite la solicitud; no hay reintentos de escritura
  indeterminada ni garantia de entrega SMTP.

## Alternativas descartadas

- Plantilla uniforme de cuatro carpetas: no aporta proporcionalmente en lecturas simples.
- Un archivo gigante por feature: esconderia contratos, errores y fronteras de seguridad.
- Un flujo generico compartido: acoplaria certificados, constancias, becas, Q10 y ubicacion.

## Consecuencias

Menos intermediarios, sin una cuota artificial de archivos o lineas. Un nuevo
feature empieza con el comportamiento necesario, no copiando todos los existentes.
Consulta de certificado conserva su forma reducida porque no coordina escrituras.
Clases como AppError y SecurityError permanecen: tienen comportamiento real.

Los limites se comprueban con la regla efectiva architecture/dependencies,
pruebas de contratos, E2E y bundle-check. No sustituyen la revision de seguridad.
Knip informa exports opcionales; no se borra una API publica o carga dinamica
solo por un aviso estatico.

Evidencia y riesgos: [cierre del paso 8](../../quality/pragmatic-simplification-baseline.md#paso-8-cierre-documental-y-limpieza).
La auditoria de dependencias sigue bloqueada; esta decision no autoriza despliegue.
