# ADR-018 Limites Modulares Para Consulta de Solicitudes

## Estado

Aceptado e implementado. Revision pragmatica del paso 6: 2026-09-24.

## Contexto

`consulta-solicitud` ya utilizaba modelos tipados, pero la ruta App Router componia
el caso de uso mediante imports profundos. La presentacion de documentos digitales
consumia directamente un repository y el cargo de constancias reutilizaba el
dominio y el PDF interno de `solicitud-certificado`.

Los cargos de certificado, constancia y ubicacion repetian exactamente el formato
A4, encabezado institucional y estilos. Sus titulos, textos y reglas posteriores
al pago continuan siendo decisiones propias de cada flujo.

## Decision

- Exponer `modules/consultas` mediante `@/modules/consultas` y
  `@/modules/consultas/server`.
- Exponer `consulta-solicitud` mediante `@/modules/consulta-solicitud` y
  `@/modules/consulta-solicitud/server`.
- Conservar las cuatro responsabilidades, sin exigir cuatro carpetas:
  `model.ts`, `operations.ts`, `components/` e `infrastructure/`.
- Usar `client.tsx` como composition root cliente, sin convertirlo en una quinta
  capa de negocio.
- Inferir los DTOs desde sus schemas Zod.
- Centralizar exclusivamente el formato visual de los cargos en
  `AdministrativeCargoPdf`.
- Mantener titulo, introduccion, campos y textos finales en cada feature.
- Aplicar restricciones ESLint solo al feature estabilizado.

```mermaid
flowchart LR
    Route["App Router"] --> Public["consulta-solicitud/server"]
    Public --> Query["consultas/server"]
    Query --> UseCase["Funciones de consulta"]
    UseCase --> Domain["Modelo y reglas"]
    Query --> Gateway["Transporte server-only"]
    Route --> View["Public presentation API"]
    View --> Client["Client composition root"]
    Client --> Digital["getDigitalDocument / acceptDigitalDocument"]
    View --> Cargo["Shared A4 renderer"]
```

## Consecuencias

- Las rutas no conocen factories, repositories ni componentes internos.
- Presentacion usa operaciones y modelos puros; no importa infraestructura.
- Certificados, constancias y consulta de solicitudes no se importan entre si.
- Un cambio de formato institucional de los cargos se realiza en un unico lugar.
- Las variantes conservan control sobre sus textos y reglas funcionales.
- La pagina de resultados continua obteniendo sus datos como Server Component.
- Se pasa de 14 a 12 archivos y de tres clases a cero. Las funciones reciben solo
  la dependencia necesaria; no hay un archivo de ports ni aliases del mismo tipo.
- `client.tsx` mantiene el componente compuesto y callbacks estables. Se conservan
  aliases historicos, comprobacion del ID de solicitud, URLs validadas, aceptacion
  previa a descarga, errores reintentables y carga diferida de PDF.

## Limites

- El BFF generico todavia no demuestra que el documento digital solicitado
  pertenece al documento consultado antes de devolver su URL.
- `consulta-ubicacion` ya consume exclusivamente las APIs publicas de consultas,
  segun ADR-019. Seguridad conserva sus adaptadores propios fuera de este alcance.
- No se modifican contratos HTTP ni reglas de aceptacion de documentos.

## Alternativas

- Copiar un PDF dentro de `consulta-solicitud`: descartado por duplicar el formato.
- Importar las APIs de certificado y constancia: descartado porque conservaria el
  acoplamiento entre features.
- Mover reglas de certificados y constancias a `shared`: descartado porque shared
  solo debe contener el renderer visual estable.
