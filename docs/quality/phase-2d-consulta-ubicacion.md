# Fase 2D y Refactor Modular de Consulta de Ubicación

## Alcance

`consulta-ubicacion/[dni]` consulta solicitudes, resultados, exámenes, ciclos y
textos desde servidor. El refactor modular posterior conserva ese comportamiento
y organiza el feature en `domain`, `application`, `infrastructure` y
`presentation`.

No modifica el registro de ubicación, OTP, CAPTCHA, sesión, pago ni contratos del
backend.

## Estructura Resultante

```text
modules/consulta-ubicacion/
  index.ts
  server.ts
  domain/location-consultation.ts
  application/
    ports/location-consultation.port.ts
    get-location-consultation.use-case.ts
  infrastructure/
    mappers/location-consultation.mapper.ts
    server/location-consultation.repository.ts
    validation/location-consultation.schemas.ts
  presentation/
    location-consultation.presenter.ts
    components/
      location-consultation-view.tsx
      location-certificate-download.tsx
      location-certificate-pdf.tsx
      location-cargo-download.tsx
```

## Problemas Corregidos

- Dominio y aplicación dependían de archivos internos de `modules/consultas`.
- Las rutas importaban una factory y una vista mediante rutas profundas.
- El DTO manual repetía los tipos de los schemas Zod.
- La vista consumía el cargo interno de `solicitud-ubicacion`.
- El cargo ejecutaba una segunda consulta `GET solicitudes/{id}`.
- La fixture del cargo conservaba un precio histórico de S/ 80.00.
- Componentes PDF estaban fuera de presentation.

## Contrato

La entrada pública server-only es:

```ts
getLocationConsultation({
  documentNumber: string
}): Promise<LocationConsultationResult | null>
```

Una relación ausente de examen o ciclo conserva la nota como resultado parcial y
bloquea la constancia. La constancia requiere resultado terminado, examen, ciclo y
`TEXTO_NOMBREAN`. El cargo se deriva de la solicitud activa y utiliza el precio
oficial registrado de S/ 30.00.

## Pruebas

- Validación runtime de notas, exámenes y ciclos.
- Join completo, parcial, relación ajena y selección determinista.
- Documento inválido y solicitud inexistente.
- Presenter, constancia disponible y textos incompletos.
- Cargo con tarifa S/ 30.00 y renderer A4 compartido.
- Smoke de estado vacío con cargo y cero llamadas a `solicitudes/{id}`.
- Restricciones ESLint de APIs públicas y dependencias por capa.

## Deuda Técnica Pendiente

- Resolver el lifecycle de Playwright en Windows.
- Servir Roboto localmente para que el PDF no dependa de Google Fonts.
- Mantener la verificación de autenticidad académica en el backend externo.
