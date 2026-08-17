# Refactor Modular de Consulta de Solicitudes

## Clasificacion Inicial

| Clasificacion | Implementacion encontrada |
| --- | --- |
| Dominio | `domain/digital-document.ts` |
| Aplicacion | No existia dentro del feature |
| Infraestructura | Repository y schemas de documentos digitales |
| Presentacion | Resultados, cargo, documento digital y rutas App Router |
| Compartido estable | Contexto `modules/consultas`, seguridad, HTTP, errores y UI |
| Codigo incorrecto | Componente digital fuera de presentation y consumo directo del repository |
| Acoplamiento | Cargo dependiente del dominio y PDF interno de certificados |
| Duplicacion | DTO manual frente a Zod y plantilla A4 repetida en tres features |

## Arquitectura Resultante

```text
modules/consulta-solicitud/
  index.ts
  server.ts
  client.tsx
  domain/
  application/
    ports/
    use-cases/
  infrastructure/
    api/
    mappers/
    validation/
  presentation/
    components/
```

`index.ts` es la API publica de presentacion. `server.ts` compone la consulta
server-only y fija el tipo `CERTIFICADO`. `client.tsx` conecta el gateway con los
casos de uso digitales; no contiene reglas de dominio.

## Dependencias Eliminadas

- Presentacion hacia el repository de documentos digitales.
- `consulta-solicitud` hacia internals de `solicitud-certificado`.
- Ruta App Router hacia factories e internals de presentacion.
- DTO manual duplicado de `modules/consultas`.
- Factory server que solo envolvia la construccion del caso de uso.
- Plantilla A4 repetida entre certificado, constancia y ubicacion.

## Dependencias Que Permanecen

- `modules/consultas` como contexto transversal con API publica.
- Sesion cifrada y CAPTCHA dentro de `modules/security`.
- `resourceApiRepository` como adaptador del BFF cliente.
- `@react-pdf/renderer` dentro de presentacion compartida.
- Componentes UI estables y manejo comun de `AppError`.

## Garantias

- Resultado de consultas obtenido en servidor.
- DTOs validados con Zod antes del mapper.
- Documento digital inconsistente rechazado por aplicacion.
- Aceptacion detenida ante command invalido o fallo externo.
- Estados `loading`, `empty`, `data` y `error` conservados.
- Cargo de constancia con titulo y etiqueta propios.
- A4 institucional centralizado sin trasladar reglas de negocio a `shared`.

## Deuda Pendiente

Crear un Route Handler especializado que valide la propiedad del documento digital
contra la sesion de consulta antes de devolver su URL o aceptar la descarga.

## Verificacion

- `npm run lint`: correcto, incluidas las reglas de capas del feature.
- `npx tsc --noEmit`: correcto.
- `npm run test:unit`: 222 de 222 pruebas en 15 archivos.
- Unitarias dirigidas de consultas: 18 de 18.
- Smoke E2E de consultas: 19 de 19.
- Suite E2E completa: 90 de 90.
- `npm run build`: correcto; 22 paginas generadas.
- `npm run security:bundle-check`: correcto.
- `npm run env:check`: correcto.
- `git diff --check`: correcto, con avisos informativos LF/CRLF de Windows.

Playwright se bloqueo al administrar automaticamente sus web servers, un problema
operativo ya observado en Windows. Con mock y Next levantados de forma aislada, el
smoke y la suite completa finalizaron normalmente y sin fallos.
