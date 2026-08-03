# Linea Base de Calidad

## Identificacion
- Fecha: 2026-08-03.
- Alcance: Fase 1A, smoke tests E2E del comportamiento actual.
- Gestor de paquetes: npm 11.6.2.
- Node.js local: 24.11.1.
- Next.js instalado: 16.1.0.
- React instalado: 19.2.3.
- TypeScript instalado: 5.9.3.

## Verificacion de Next.js
El gestor de paquetes confirmo que la etiqueta `latest` de Next.js apunta a `16.2.12` al iniciar esta fase. Este dato se registra solamente como referencia: la Fase 1A no actualiza Next.js ni `eslint-config-next`.

## Linea base previa
Antes de crear los smoke tests se comprobaron estos comandos:
- `npm run lint`: correcto.
- `npx tsc --noEmit`: correcto.
- `npm run build`: correcto, con 20 rutas generadas.
- Tests automatizados: no existia un script ni framework configurado.

## Cobertura de Fase 1A
- Render de las 20 rutas publicas conocidas.
- Navegacion desde la portada al flujo de certificados.
- Verificacion de correo de certificados con OTP y reCAPTCHA simulados.
- Registro completo de una solicitud de certificado.
- Consulta de solicitud por documento.
- Consulta de certificado y notas.
- Consulta de examen de ubicacion y resultado.

Las integraciones CIUNAC, Q10, correo, almacenamiento y reCAPTCHA se sustituyen por dobles locales deterministas. El flujo incompleto de constancias solo se cubre hasta la pantalla de proceso actual; no se fija su comportamiento defectuoso como resultado esperado.

## Resultado posterior
- `npm test`: correcto, 26 de 26 smoke tests en Chromium.
- `npm run lint`: correcto.
- `npx tsc --noEmit`: correcto.
- `npm run build`: correcto en directorio aislado `.next-e2e`, con 20 rutas generadas.
- Next.js se mantiene en 16.1.0; no se actualizaron Next.js, React ni `eslint-config-next`.

La Fase 1A queda cerrada. No se iniciaron cambios de las Fases 1B, 1C, 1D o 1E.
